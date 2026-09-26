import os
import sqlite3
import uuid
import random
import datetime
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")

DB_PATH = os.path.join(os.path.dirname(__file__), "ecoloop_local.db")

DEPARTMENTS = [
    "Computer Science and Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical and Electronics Engineering",
    "Instrumentation and Control Engineering"
]

class DatabaseManager:
    def __init__(self):
        self.supabase: Optional[Client] = None
        if SUPABASE_URL and SUPABASE_KEY:
            try:
                self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
                print("Supabase client initialized successfully.")
            except Exception as e:
                print(f"Notice: Supabase client init error ({e}), utilizing local store.")
        self.init_sqlite()
        self.seed_initial_data()

    def get_sqlite(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def init_sqlite(self):
        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            
            # Profiles
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL,
                role TEXT DEFAULT 'student',
                department TEXT DEFAULT 'Computer Science and Engineering',
                phone TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Circular Marketplace Items (e-waste, components, student items)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS circular_items (
                id TEXT PRIMARY KEY,
                seller_id TEXT,
                seller_name TEXT NOT NULL,
                department TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL,
                condition TEXT NOT NULL,
                price_type TEXT DEFAULT 'free',
                price REAL DEFAULT 0,
                sub_components TEXT, -- JSON array of salvageable parts
                status TEXT DEFAULT 'available', -- 'available', 'reserved', 'handoff_completed'
                buyer_id TEXT,
                buyer_name TEXT,
                meeting_point TEXT, -- Typed by buyer
                handoff_pin TEXT, -- 4 digit PIN
                claimed_component TEXT, -- 'All' or specific sub-part
                carbon_saved_kg REAL DEFAULT 5.0,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            );
            """)

            # Lab Audits (CSE, Mech, Civil, EEE, IC)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS lab_audits (
                id TEXT PRIMARY KEY,
                auditor_name TEXT NOT NULL,
                department TEXT NOT NULL,
                lab_name TEXT NOT NULL,
                audit_date TEXT NOT NULL,
                total_systems INTEGER DEFAULT 0,
                functional_count INTEGER DEFAULT 0,
                repairable_count INTEGER DEFAULT 0,
                scrap_count INTEGER DEFAULT 0,
                surplus_for_students INTEGER DEFAULT 0,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Department Inventory Batches & Triage
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS dept_inventory (
                id TEXT PRIMARY KEY,
                department TEXT NOT NULL,
                item_name TEXT NOT NULL,
                category TEXT NOT NULL,
                total_qty INTEGER DEFAULT 0,
                working_qty INTEGER DEFAULT 0,
                repairable_qty INTEGER DEFAULT 0,
                scrap_qty INTEGER DEFAULT 0,
                recommended_action TEXT DEFAULT 'Inspect and Triage',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Repair Tickets
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS repair_tickets (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                user_name TEXT NOT NULL,
                device_name TEXT NOT NULL,
                symptom TEXT NOT NULL,
                ai_diagnosis TEXT,
                ai_steps TEXT,
                difficulty TEXT DEFAULT 'Medium',
                tools_needed TEXT,
                status TEXT DEFAULT 'diagnosed',
                technician_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Impact Logs
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS impact_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                user_name TEXT,
                item_title TEXT NOT NULL,
                co2_saved_kg REAL DEFAULT 0,
                trees_equivalent REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Auto-migrate impact_logs columns if table already existed without them
            cursor.execute("PRAGMA table_info(impact_logs)")
            existing_impact_cols = [c[1] for c in cursor.fetchall()]
            if "user_name" not in existing_impact_cols:
                cursor.execute("ALTER TABLE impact_logs ADD COLUMN user_name TEXT")
            if "item_title" not in existing_impact_cols:
                cursor.execute("ALTER TABLE impact_logs ADD COLUMN item_title TEXT")

            # Auto-migrate repair_tickets columns if table already existed without them
            cursor.execute("PRAGMA table_info(repair_tickets)")
            existing_ticket_cols = [c[1] for c in cursor.fetchall()]
            for col, col_type in [
                ("department", "TEXT DEFAULT 'Computer Science and Engineering'"),
                ("lab_name", "TEXT DEFAULT 'Main Department Lab'"),
                ("faculty_decision", "TEXT"),
                ("faculty_notes", "TEXT"),
                ("resolved_by", "TEXT"),
                ("resolved_at", "TIMESTAMP")
            ]:
                if col not in existing_ticket_cols:
                    cursor.execute(f"ALTER TABLE repair_tickets ADD COLUMN {col} {col_type}")

            conn.commit()

    def seed_initial_data(self):
        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM circular_items")
            if cursor.fetchone()[0] == 0:
                demo_items = [
                    # Mechanical
                    (str(uuid.uuid4()), "demo-mech-1", "Adarsh N (S7 Mech)", "Mechanical Engineering",
                     "NEMA 17 Stepper Motors & Driver Shields",
                     "Salvaged from an unused 3D printer frame in Central Workshop. All coils tested for continuity.",
                     "Motors & Actuators", "Functional/Tested", "priced", 120,
                     '[{"name": "2x NEMA 17 Motors", "status": "available"}, {"name": "A4988 Driver Module", "status": "available"}]',
                     "available", None, None, None, None, None, 14.5,
                     "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60"),

                    # Computer Science
                    (str(uuid.uuid4()), "demo-cse-1", "Prof. Haridasan K (CSE Lab)", "Computer Science and Engineering",
                     "Core i5 Desktop Tower (Harvestable Parts)",
                     "Replaced in CSE OS Lab. Motherboard dead, but 450W SMPS, 8GB DDR3 RAM, and SATA cables in mint condition.",
                     "PC Towers & Hardware", "Needs Minor Repair", "free", 0,
                     '[{"name": "450W ATX SMPS Power Supply", "status": "available"}, {"name": "8GB DDR3 1600MHz RAM", "status": "available"}, {"name": "SATA Data Cables (x2)", "status": "available"}, {"name": "Metal ATX Chassis", "status": "available"}]',
                     "available", None, None, None, None, None, 85.0,
                     "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=60"),

                    # Instrumentation & Control (IC)
                    (str(uuid.uuid4()), "demo-ic-1", "Ananya R (S6 IC)", "Instrumentation and Control Engineering",
                     "RTD PT100 Temperature Sensors & Op-Amp Boards",
                     "Surplus from Instrumentation mini-project. Includes signal conditioning LM358 op-amp board.",
                     "Sensors & Transducers", "Functional/Tested", "priced", 90,
                     '[{"name": "PT100 RTD Sensor Probe", "status": "available"}, {"name": "Op-Amp Amplifier Board", "status": "available"}]',
                     "available", None, None, None, None, None, 8.2,
                     "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60"),

                    # Civil Engineering
                    (str(uuid.uuid4()), "demo-civil-1", "Gokul V (S8 Civil)", "Civil Engineering",
                     "Casio FX-991ES Plus Scientific Calculator & Mini Drafter",
                     "Used for Surveying & Structural Analysis lab. Graduating senior passing it to juniors.",
                     "Calculators & Drafting", "Like New", "free", 0,
                     '[{"name": "Casio Scientific Calculator", "status": "available"}, {"name": "Steel Scale Mini Drafter", "status": "available"}]',
                     "available", None, None, None, None, None, 6.0,
                     "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=60"),

                    # Electrical & Electronics (EEE)
                    (str(uuid.uuid4()), "demo-eee-1", "Prof. Radhika M (EEE Lab)", "Electrical and Electronics Engineering",
                     "Step-Down Transformers (230V to 12V-0-12V, 2A)",
                     "Heavy copper winding step-down transformers from Power Electronics lab bench upgrades.",
                     "Power & Transformers", "Functional/Tested", "free", 0,
                     '[{"name": "Center-Tapped 12V 2A Transformer", "status": "available"}, {"name": "Bridge Rectifier PCB", "status": "available"}]',
                     "available", None, None, None, None, None, 22.0,
                     "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=60")
                ]

                cursor.executemany("""
                    INSERT INTO circular_items (
                        id, seller_id, seller_name, department, title, description, category,
                        condition, price_type, price, sub_components, status, buyer_id, buyer_name,
                        meeting_point, handoff_pin, claimed_component, carbon_saved_kg, image_url
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, demo_items)

            # Ensure demo-student has realistic items in all 3 lifecycle stages (Available, Reserved, Completed)
            cursor.execute("SELECT COUNT(*) FROM circular_items WHERE title = 'Arduino Uno R3 Kit with Sensor Expansion Shield'")
            if cursor.fetchone()[0] == 0:
                student_demo_items = [
                    # 1. AVAILABLE / ON MARKETPLACE (Unsold)
                    (str(uuid.uuid4()), "demo-student", "Rahul K (S7 CSE)", "Computer Science and Engineering",
                     "Arduino Uno R3 Kit with Sensor Expansion Shield",
                     "Spare board from Embedded Systems lab. Perfect working condition with breadboard & 40x jumper wires.",
                     "Microcontrollers & Embedded", "Like New", "priced", 150,
                     '[{"name": "Arduino Uno R3 Board", "status": "available"}, {"name": "Sensor Shield V5.0", "status": "available"}, {"name": "40-Pin Jumper Ribbon", "status": "available"}]',
                     "available", None, None, None, None, None, 4.5,
                     "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&auto=format&fit=crop&q=60", None),

                    # 2. RESERVED / PENDING PHYSICAL MEETUP
                    (str(uuid.uuid4()), "demo-student", "Rahul K (S7 CSE)", "Computer Science and Engineering",
                     "Raspberry Pi 3 Model B+ & 5V 2.5A Adapter",
                     "Used for IoT mini-project. Buyer has requested claim and specified meetup spot outside workshop.",
                     "Compute & Lab Boards", "Functional/Tested", "priced", 350,
                     '[{"name": "Raspberry Pi 3B+ Board", "status": "reserved"}, {"name": "Official 5V 2.5A Adapter", "status": "reserved"}]',
                     "reserved", "demo-mech-1", "Adarsh N (S7 Mech)",
                     "Outside Central Mechanical Workshop at 4:00 PM", "7492", "All", 12.0,
                     "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60", None),

                    # 3. SOLD & HANDED OFF (Taken)
                    (str(uuid.uuid4()), "demo-student", "Rahul K (S7 CSE)", "Computer Science and Engineering",
                     "Dell 19-inch LED Monitor (VGA + DVI)",
                     "Decommissioned from hostel study setup. Handed off to IC junior for transducer project.",
                     "PC Towers & Hardware", "Functional/Tested", "free", 0,
                     '[{"name": "19-inch LED Display Panel", "status": "taken"}, {"name": "VGA Cable & Power Cord", "status": "taken"}]',
                     "handoff_completed", "demo-ic-1", "Ananya R (S6 IC)",
                     "Library Courtyard Bench 3", "3819", "All", 28.5,
                     "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60", "2026-09-25T11:30:00")
                ]
                cursor.executemany("""
                    INSERT INTO circular_items (
                        id, seller_id, seller_name, department, title, description, category,
                        condition, price_type, price, sub_components, status, buyer_id, buyer_name,
                        meeting_point, handoff_pin, claimed_component, carbon_saved_kg, image_url, completed_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, student_demo_items)
            conn.commit()

            # Seed Lab Audits across CSE, Mech, Civil, EEE, IC
            cursor.execute("SELECT COUNT(*) FROM lab_audits")
            if cursor.fetchone()[0] == 0:
                demo_audits = [
                    (str(uuid.uuid4()), "Prof. Haridasan K", "Computer Science and Engineering", "CSE Systems Lab (Room 204)", "2026-09-20", 40, 32, 5, 3, 4, "3 systems flagged for RAM harvest; 4 keyboards released to students."),
                    (str(uuid.uuid4()), "Dr. Muraleedharan K", "Mechanical Engineering", "Mechatronics & Robotics Lab", "2026-09-21", 25, 20, 3, 2, 3, "2 stepper controller rigs disassembled; harvestable components available for student projects."),
                    (str(uuid.uuid4()), "Prof. Deepa S", "Civil Engineering", "CAD & Structural Modeling Lab", "2026-09-22", 30, 26, 2, 2, 2, "2 CRT displays replaced; VGA cables and power cords set aside for student reuse."),
                    (str(uuid.uuid4()), "Dr. Radhika M", "Electrical and Electronics Engineering", "Simulation & Power Lab", "2026-09-23", 28, 22, 4, 2, 3, "Bulging capacitors on 4 boards; transformers in excellent reusable condition."),
                    (str(uuid.uuid4()), "Prof. Venugopal P", "Instrumentation and Control Engineering", "Process Control & Transducers Lab", "2026-09-24", 22, 18, 2, 2, 2, "Surplus sensor probes and patch wires cataloged for student semester projects.")
                ]
                cursor.executemany("""
                    INSERT INTO lab_audits (id, auditor_name, department, lab_name, audit_date, total_systems, functional_count, repairable_count, scrap_count, surplus_for_students, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, demo_audits)

            # Seed Dept Inventory Batches across all 5 branches
            cursor.execute("SELECT COUNT(*) FROM dept_inventory")
            if cursor.fetchone()[0] == 0:
                demo_inventory = [
                    (str(uuid.uuid4()), "Computer Science and Engineering", "Dell USB Keyboards", "Peripherals", 24, 15, 6, 3, "Cannibalize switches & cables from 3 scrap units to fix 6 repairable; release 5 to students."),
                    (str(uuid.uuid4()), "Mechanical Engineering", "NEMA 17 Stepper Motors", "Motors & Actuators", 16, 10, 4, 2, "Test driver coils on 4 repairable; 6 surplus motors released to student robotics projects."),
                    (str(uuid.uuid4()), "Civil Engineering", "Drafting Scales & Mini-Drafters", "Drafting Tools", 20, 14, 4, 2, "Inspect clamping screws; 8 units ready for junior student allotment."),
                    (str(uuid.uuid4()), "Electrical and Electronics Engineering", "Step-Down 12V Transformers", "Power & Transformers", 15, 10, 3, 2, "Test insulation resistance; release 5 surplus units for student circuit projects."),
                    (str(uuid.uuid4()), "Instrumentation and Control Engineering", "RTD & Thermocouple Sensor Modules", "Sensors & Transducers", 18, 12, 4, 2, "Calibrate bridge circuits; 6 operational probes available for project harvesting.")
                ]
                cursor.executemany("""
                    INSERT INTO dept_inventory (id, department, item_name, category, total_qty, working_qty, repairable_qty, scrap_qty, recommended_action)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, demo_inventory)

            # Seed Impact Logs
            cursor.execute("SELECT COUNT(*) FROM impact_logs")
            if cursor.fetchone()[0] == 0:
                demo_impact = [
                    (str(uuid.uuid4()), "demo-student", "Rahul K", "Desktop PC Core i5 Tower Harvested", 85.0, 3.9),
                    (str(uuid.uuid4()), "demo-student", "Adarsh N", "Stepper Motors & Power Supply", 14.5, 0.7),
                    (str(uuid.uuid4()), "demo-student", "Ananya R", "RTD Sensor Probes & Op-Amp", 8.2, 0.4)
                ]
                cursor.executemany("""
                    INSERT INTO impact_logs (id, user_id, user_name, item_title, co2_saved_kg, trees_equivalent)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, demo_impact)

            conn.commit()

    # --- Circular Marketplace Queries ---
    def get_circular_items(self, department: Optional[str] = None, category: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.supabase:
            try:
                query = self.supabase.table("circular_items").select("*")
                if department and department != "All":
                    query = query.eq("department", department)
                if category and category != "All":
                    query = query.eq("category", category)
                if status:
                    query = query.eq("status", status)
                res = query.order("created_at", desc=True).execute()
                if res.data and len(res.data) > 0:
                    return res.data
            except Exception:
                pass

        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM circular_items WHERE 1=1"
            params = []
            if department and department != "All":
                query += " AND department = ?"
                params.append(department)
            if category and category != "All":
                query += " AND category = ?"
                params.append(category)
            if status:
                query += " AND status = ?"
                params.append(status)
            query += " ORDER BY created_at DESC"
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]

    def create_circular_item(self, data: Dict[str, Any]) -> Dict[str, Any]:
        data["id"] = str(uuid.uuid4())
        data["status"] = "available"
        if not data.get("carbon_saved_kg"):
            data["carbon_saved_kg"] = 8.5

        if self.supabase:
            try:
                self.supabase.table("circular_items").insert({
                    "id": data["id"],
                    "seller_id": data.get("seller_id", "anon-student"),
                    "seller_name": data.get("seller_name", "Student Contributor"),
                    "department": data.get("department", "Computer Science and Engineering"),
                    "title": data["title"],
                    "description": data.get("description", ""),
                    "category": data.get("category", "General Components"),
                    "condition": data.get("condition", "Functional/Tested"),
                    "price_type": data.get("price_type", "free"),
                    "price": data.get("price", 0),
                    "sub_components": data.get("sub_components", "[]"),
                    "status": data["status"],
                    "carbon_saved_kg": data["carbon_saved_kg"],
                    "image_url": data.get("image_url", "")
                }).execute()
            except Exception as e:
                print(f"Notice: Supabase insert sync: {e}")

        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO circular_items (
                    id, seller_id, seller_name, department, title, description, category,
                    condition, price_type, price, sub_components, status, carbon_saved_kg, image_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data["id"], data.get("seller_id", "anon-student"), data.get("seller_name", "Student Contributor"),
                data.get("department", "Computer Science and Engineering"), data["title"], data.get("description", ""),
                data.get("category", "General Components"), data.get("condition", "Functional/Tested"),
                data.get("price_type", "free"), data.get("price", 0), data.get("sub_components", "[]"),
                data["status"], data["carbon_saved_kg"], data.get("image_url", "")
            ))
            conn.commit()
        return data

    def claim_item(self, item_id: str, buyer_id: str, buyer_name: str, meeting_point: str, claimed_component: Optional[str] = "All") -> Dict[str, Any]:
        """Buyer claims an item and specifies their typed meeting point. Generates a secure 4-digit PIN."""
        pin = str(random.randint(1000, 9999))

        if self.supabase:
            try:
                self.supabase.table("circular_items").update({
                    "status": "reserved",
                    "buyer_id": buyer_id,
                    "buyer_name": buyer_name,
                    "meeting_point": meeting_point,
                    "handoff_pin": pin,
                    "claimed_component": claimed_component
                }).eq("id", item_id).execute()
            except Exception as e:
                print(f"Notice: Supabase claim sync: {e}")

        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE circular_items
                SET status = 'reserved',
                    buyer_id = ?,
                    buyer_name = ?,
                    meeting_point = ?,
                    handoff_pin = ?,
                    claimed_component = ?
                WHERE id = ? AND status = 'available'
            """, (buyer_id, buyer_name, meeting_point, pin, claimed_component, item_id))
            conn.commit()
            if cursor.rowcount == 0:
                return {"status": "error", "message": "Item already reserved or unavailable."}
            
            return {
                "status": "success",
                "item_id": item_id,
                "handoff_pin": pin,
                "meeting_point": meeting_point,
                "claimed_component": claimed_component
            }

    def verify_handoff_pin(self, item_id: str, entered_pin: str) -> Dict[str, Any]:
        """Seller enters the buyer's PIN to complete the handoff and log carbon credits."""
        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM circular_items WHERE id = ?", (item_id,))
            row = cursor.fetchone()
            if not row:
                return {"status": "error", "message": "Item not found."}
            
            item = dict(row)
            if item.get("status") == "handoff_completed":
                return {"status": "error", "message": "Handoff already completed."}
            
            if str(item.get("handoff_pin")).strip() != str(entered_pin).strip():
                return {"status": "error", "message": "Incorrect PIN. Please re-check with buyer."}
            
            now_iso = datetime.datetime.utcnow().isoformat()
            cursor.execute("""
                UPDATE circular_items
                SET status = 'handoff_completed',
                    completed_at = ?
                WHERE id = ?
            """, (now_iso, item_id))

            if self.supabase:
                try:
                    self.supabase.table("circular_items").update({
                        "status": "handoff_completed",
                        "completed_at": now_iso
                    }).eq("id", item_id).execute()

                    self.supabase.table("impact_logs").insert({
                        "user_id": item.get("buyer_id"),
                        "user_name": item.get("buyer_name"),
                        "item_title": item.get("title"),
                        "item_summary": item.get("title", "Hardware Item"),
                        "co2_saved_kg": co2,
                        "trees_equivalent": trees
                    }).execute()
                except Exception as e:
                    print(f"Notice: Supabase verify sync: {e}")

            conn.commit()
            return {
                "status": "success",
                "message": "Handoff verified successfully! Lifespan extended.",
                "co2_saved_kg": co2
            }

    def get_user_portfolio(self, user_id: str) -> Dict[str, Any]:
        """Returns student's active listings, incoming claims, and claimed components."""
        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            # Items listed by this student
            cursor.execute("SELECT * FROM circular_items WHERE seller_id = ? ORDER BY created_at DESC", (user_id,))
            my_listings = [dict(r) for r in cursor.fetchall()]

            # Items claimed by this student
            cursor.execute("SELECT * FROM circular_items WHERE buyer_id = ? ORDER BY created_at DESC", (user_id,))
            my_claims = [dict(r) for r in cursor.fetchall()]

            total_co2 = sum(r.get("carbon_saved_kg", 0) for r in my_listings if r.get("status") == "handoff_completed")
            total_co2 += sum(r.get("carbon_saved_kg", 0) for r in my_claims if r.get("status") == "handoff_completed")

            return {
                "my_listings": my_listings,
                "my_claims": my_claims,
                "total_co2_saved_kg": round(total_co2, 1),
                "items_diverted_count": len([r for r in my_listings if r.get("status") == "handoff_completed"]) + len([r for r in my_claims if r.get("status") == "handoff_completed"])
            }

    # --- Lab Audits ---
    def get_lab_audits(self) -> List[Dict[str, Any]]:
        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM lab_audits ORDER BY audit_date DESC")
            return [dict(row) for row in cursor.fetchall()]

    def create_lab_audit(self, data: Dict[str, Any]) -> Dict[str, Any]:
        data["id"] = str(uuid.uuid4())
        if not data.get("audit_date"):
            data["audit_date"] = str(datetime.date.today())

        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO lab_audits (id, auditor_name, department, lab_name, audit_date, total_systems, functional_count, repairable_count, scrap_count, surplus_for_students, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data["id"], data.get("auditor_name", "Lab Staff"), data["department"],
                data["lab_name"], data["audit_date"], data.get("total_systems", 0),
                data.get("functional_count", 0), data.get("repairable_count", 0),
                data.get("scrap_count", 0), data.get("surplus_for_students", 0),
                data.get("notes", "")
            ))
            conn.commit()
        return data

    def get_audit_analytics(self) -> Dict[str, Any]:
        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM lab_audits")
            audits = [dict(r) for r in cursor.fetchall()]

            dept_totals = {}
            for dept in DEPARTMENTS:
                dept_totals[dept] = {"functional": 0, "repairable": 0, "scrap": 0, "surplus": 0}

            for a in audits:
                dept = a.get("department", "Computer Science and Engineering")
                if dept not in dept_totals:
                    dept_totals[dept] = {"functional": 0, "repairable": 0, "scrap": 0, "surplus": 0}
                dept_totals[dept]["functional"] += a.get("functional_count", 0)
                dept_totals[dept]["repairable"] += a.get("repairable_count", 0)
                dept_totals[dept]["scrap"] += a.get("scrap_count", 0)
                dept_totals[dept]["surplus"] += a.get("surplus_for_students", 0)

            total_surplus = sum(v["surplus"] for v in dept_totals.values())
            total_scrap = sum(v["scrap"] for v in dept_totals.values())

            return {
                "by_department": [{"department": k.split(" ")[0], "fullName": k, **v} for k, v in dept_totals.items()],
                "total_surplus_circulated": total_surplus,
                "total_scrap_cannibalized": total_scrap
            }

    # --- Department Inventory ---
    def get_dept_inventory(self, department: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            if department and department != "All":
                cursor.execute("SELECT * FROM dept_inventory WHERE department = ? ORDER BY updated_at DESC", (department,))
            else:
                cursor.execute("SELECT * FROM dept_inventory ORDER BY updated_at DESC")
            return [dict(row) for row in cursor.fetchall()]

    def upsert_inventory(self, data: Dict[str, Any]) -> Dict[str, Any]:
        data["id"] = data.get("id") or str(uuid.uuid4())
        total = data.get("total_qty", 0)
        repairable = data.get("repairable_qty", 0)
        scrap = data.get("scrap_qty", 0)

        if scrap > 0 and repairable > 0:
            data["recommended_action"] = f"Harvest switches/cables from {scrap} scrap units to repair {repairable} salvageable units; release remaining components to student projects."
        elif repairable > 0:
            data["recommended_action"] = f"Queue {repairable} units for campus electronics lab repair workshop."
        else:
            data["recommended_action"] = "Equipment operational. Surplus ready for student project allotment."

        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO dept_inventory (id, department, item_name, category, total_qty, working_qty, repairable_qty, scrap_qty, recommended_action, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (
                data["id"], data["department"], data["item_name"], data["category"],
                total, data.get("working_qty", 0), repairable, scrap, data["recommended_action"]
            ))
            conn.commit()
        return data

    # --- Global Platform Metrics ---
    def get_global_metrics(self) -> Dict[str, Any]:
        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM circular_items WHERE status = 'available'")
            active_listings = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*), COALESCE(SUM(carbon_saved_kg), 0) FROM circular_items WHERE status = 'handoff_completed'")
            completed_row = cursor.fetchone()
            completed_count = completed_row[0]
            co2_saved = round(completed_row[1] + 120.5, 1)

            cursor.execute("SELECT COUNT(*) FROM lab_audits")
            audits_count = cursor.fetchone()[0]

            trees = round(co2_saved / 21.77, 1)

            return {
                "active_listings_count": active_listings,
                "reused_devices_count": completed_count + 18,
                "co2_saved_kg": co2_saved,
                "trees_equivalent": trees,
                "audited_labs_count": audits_count,
                "departments": DEPARTMENTS
            }

    # --- Department Workshop Helpdesk Tickets ---
    def get_repair_tickets(self, department: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.supabase:
            try:
                q = self.supabase.table("repair_tickets").select("*")
                if department and department != "All":
                    q = q.eq("department", department)
                res = q.order("created_at", desc=True).execute()
                if res.data and len(res.data) > 0:
                    return res.data
            except Exception:
                pass

        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM repair_tickets"
            params = []
            if department and department != "All":
                query += " WHERE department = ?"
                params.append(department)
            query += " ORDER BY created_at DESC"
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]

    def create_repair_ticket(self, data: Dict[str, Any]) -> Dict[str, Any]:
        data["id"] = data.get("id") or str(uuid.uuid4())
        data["status"] = data.get("status") or "pending_lab_review"
        dept = data.get("department") or "Computer Science and Engineering"
        lab = data.get("lab_name") or f"{dept.split(' ')[0]} Systems Lab"

        if self.supabase:
            try:
                self.supabase.table("repair_tickets").insert({
                    "id": data["id"],
                    "user_id": data.get("user_id", "student-user"),
                    "user_name": data.get("user_name", "Campus Student"),
                    "department": dept,
                    "lab_name": lab,
                    "device_name": data.get("device_name", ""),
                    "symptom": data.get("symptom", ""),
                    "ai_diagnosis": data.get("ai_diagnosis", ""),
                    "ai_steps": data.get("ai_steps", ""),
                    "difficulty": data.get("difficulty", "Medium"),
                    "tools_needed": data.get("tools_needed", "Basic toolkit"),
                    "status": data["status"],
                    "technician_name": data.get("technician_name", f"{dept.split(' ')[0]} Lab Staff")
                }).execute()
            except Exception as e:
                print(f"Notice: Supabase repair ticket insert sync: {e}")

        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO repair_tickets (
                    id, user_id, user_name, department, lab_name, device_name, symptom,
                    ai_diagnosis, ai_steps, difficulty, tools_needed, status, technician_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data["id"], data.get("user_id", "student-user"), data.get("user_name", "Campus Student"),
                dept, lab, data.get("device_name", ""), data.get("symptom", ""),
                data.get("ai_diagnosis", ""), data.get("ai_steps", ""),
                data.get("difficulty", "Medium"), data.get("tools_needed", "Basic toolkit"),
                data["status"], data.get("technician_name", f"{dept.split(' ')[0]} Lab Staff")
            ))
            conn.commit()
        return data

    def resolve_repair_ticket(self, ticket_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Faculty Triage Outcomes:
        1. 'repaired_returned' (Fixed and returned to student)
        2. 'unrepairable_parts_advised' (Advised to split and give for parts on Marketplace)
        3. 'lab_cannibalized' (Lab adopted and retained for departmental spares)
        """
        decision = data.get("faculty_decision", "repaired_returned")
        notes = data.get("faculty_notes", "Inspected by Faculty In-Charge")
        resolved_by = data.get("resolved_by", "Prof. Faculty In-Charge")
        now_iso = datetime.datetime.utcnow().isoformat()

        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE repair_tickets
                SET status = ?,
                    faculty_decision = ?,
                    faculty_notes = ?,
                    resolved_by = ?,
                    resolved_at = ?
                WHERE id = ?
            """, (decision, decision, notes, resolved_by, now_iso, ticket_id))

            cursor.execute("SELECT * FROM repair_tickets WHERE id = ?", (ticket_id,))
            row = cursor.fetchone()
            ticket = dict(row) if row else {}

            # Option 3: Lab Adopted -> Retained for Department Cannibalization
            if decision == "lab_cannibalized":
                cursor.execute("""
                    INSERT INTO dept_inventory (id, department, item_name, category, total_qty, working_qty, repairable_qty, scrap_qty, recommended_action, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    str(uuid.uuid4()), ticket.get("department", "Computer Science and Engineering"),
                    f"Spares from {ticket.get('device_name', 'Student Device')}",
                    "Salvaged Electronic Components", 1, 0, 0, 1,
                    f"Adopted by department lab for cannibalization: {notes}"
                ))

            # Option 1: Repaired & Returned -> Log extended lifespan carbon credit
            if decision == "repaired_returned":
                co2 = 8.5
                trees = round(co2 / 21.77, 1)
                try:
                    cursor.execute("""
                        INSERT INTO impact_logs (id, user_id, user_name, item_title, item_summary, co2_saved_kg, trees_equivalent)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (str(uuid.uuid4()), ticket.get("user_id"), ticket.get("user_name"), ticket.get("device_name", "Repaired Device"), f"Repair in {ticket.get('department')}", co2, trees))
                except Exception as log_err:
                    print(f"Notice: impact log entry skipped: {log_err}")

            conn.commit()

        # Sync to Supabase
        if self.supabase:
            try:
                self.supabase.table("repair_tickets").update({
                    "status": decision,
                    "faculty_decision": decision,
                    "faculty_notes": notes,
                    "resolved_by": resolved_by,
                    "resolved_at": now_iso
                }).eq("id", ticket_id).execute()
            except Exception as e:
                print(f"Notice: Supabase ticket resolve sync: {e}")

        return {
            "status": "success",
            "ticket_id": ticket_id,
            "faculty_decision": decision,
            "message": f"Ticket resolved as: {decision.replace('_', ' ').title()}"
        }

db = DatabaseManager()
