import os
import sqlite3
import uuid
import random
import datetime
import json
import re
import hashlib
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")

DB_PATH = os.path.join(os.path.dirname(__file__), "ecoloop_local.db")

DEPARTMENTS = [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
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
        self.seed_ai_cache()

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

            # AI Component & Diagnosis Cache for High-Concurrency Scalability
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_cache (
                cache_key TEXT PRIMARY KEY,
                cache_type TEXT NOT NULL, -- 'diagnosis' or 'classification'
                query_text TEXT,
                response_json TEXT NOT NULL,
                hit_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

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
            # Seed Repair Tickets across engineering departments
            cursor.execute("SELECT COUNT(*) FROM repair_tickets")
            if cursor.fetchone()[0] == 0:
                demo_tickets = [
                    (
                        "ticket-cse-1", "demo-student", "Rahul K (S7 CSE)",
                        "Computer Science and Engineering", "Hardware & Systems Lab",
                        "Mechanical Keyboard Spacebar Not Registering",
                        "Cherry MX switch on spacebar feels sticky and does not register keystrokes.",
                        "Dust ingress or sticky residue inside keycap switch leaf.",
                        "1. Desolder switch from PCB\n2. Open housing with switch opener\n3. Clean contacts with isopropyl alcohol\n4. Re-lube stem and solder back",
                        "Medium", "Soldering iron, desoldering pump, isopropyl alcohol",
                        "open", "Campus Peer Community"
                    ),
                    (
                        "ticket-ece-1", "demo-ece-user", "Aiswarya S (S6 ECE)",
                        "Electronics and Communication Engineering", "VLSI & Embedded Systems Lab",
                        "ESP32 Dev Board Overheating on 5V Pin",
                        "Board gets hot near micro-USB connector and brownouts under WiFi load.",
                        "Blown AMS1117 3.3V linear voltage regulator with high quiescent leakage.",
                        "1. Measure resistance between 3V3 and GND\n2. Desolder faulty AMS1117 with hot air\n3. Solder replacement AMS1117-3.3\n4. Verify clean 3.3V power rail",
                        "Medium", "Hot air rework station, multimeter, flux, replacement AMS1117 IC",
                        "open", "Campus Peer Community"
                    ),
                    (
                        "ticket-eee-1", "demo-eee-user", "Vishnu P (S8 EEE)",
                        "Electrical and Electronics Engineering", "Circuits & Measurements Lab",
                        "Dual Benchtop DC Power Supply Voltage Display Glitch",
                        "Left voltage display panel flickers and reads 00.0V even when output is active 12V.",
                        "Loose header ribbon cable between main regulator PCB and LED digital voltmeter module.",
                        "1. Disconnect AC mains cord and discharge filter caps\n2. Reseat 10-pin ribbon connector\n3. Inspect solder joints on 7-segment display driver\n4. Calibrate with reference DMM",
                        "Easy", "Phillips screwdriver, multimeter",
                        "peer_repaired", "Campus Peer Community"
                    ),
                    (
                        "ticket-mech-1", "demo-mech-user", "Adarsh N (S7 Mech)",
                        "Mechanical Engineering", "Fab Lab & Mechatronics",
                        "Creality 3D Printer Hotend Thermistor Wire Broken",
                        "Printer throws MINTEMP thermal runaway error on startup and halts.",
                        "Fragile glass bead thermistor lead wire snapped near heater block retaining screw.",
                        "1. Remove hotend silicon sock and M3 thermistor retaining screw\n2. Extract damaged NTC 100K glass bead\n3. Insert replacement glass thermistor with fiberglass sleeve\n4. Tighten gently and run PID auto-tune",
                        "Easy", "Hex keys, replacement 100K NTC thermistor, thermal paste",
                        "open", "Campus Peer Community"
                    ),
                    (
                        "ticket-ic-1", "demo-ic-user", "Ananya R (S6 IC)",
                        "Instrumentation and Control Engineering", "Sensors & Transducers Lab",
                        "LVDT Signal Conditioning Board Op-Amp Null Offset",
                        "Differential output fails to reach zero at central core position, high harmonic distortion.",
                        "Trimpot wiper oxidation causing unbalanced DC bridge excitation voltage.",
                        "1. Measure secondary AC voltages at balance position\n2. Spray contact cleaner into multiturn potentiometer\n3. Adjust zero-offset null trimmer with plastic screwdriver",
                        "Medium", "Oscilloscope, ceramic adjustment tool, contact cleaner",
                        "open", "Campus Peer Community"
                    )
                ]
                cursor.executemany("""
                    INSERT INTO repair_tickets (
                        id, user_id, user_name, department, lab_name, device_name, symptom,
                        ai_diagnosis, ai_steps, difficulty, tools_needed, status, technician_name
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, demo_tickets)

            conn.commit()

        # Seed Supabase repair_tickets if table is empty
        if self.supabase:
            try:
                sb_check = self.supabase.table("repair_tickets").select("id", count="exact").limit(1).execute()
                if (sb_check.count is not None and sb_check.count == 0) or not sb_check.data:
                    sb_seed_batch = [
                        {
                            "id": "11111111-0000-0000-0000-000000000001",
                            "user_id": "demo-student",
                            "user_name": "Rahul K (S7 CSE)",
                            "device_name": "Mechanical Keyboard Spacebar Not Registering",
                            "symptom": "Cherry MX switch on spacebar feels sticky and does not register keystrokes.",
                            "ai_diagnosis": "Dust ingress or sticky residue inside keycap switch leaf.",
                            "ai_steps": "1. Desolder switch from PCB\n2. Open housing with switch opener\n3. Clean contacts with isopropyl alcohol\n4. Re-lube stem and solder back",
                            "difficulty": "Medium",
                            "tools_needed": "[DEPT:Computer Science and Engineering][LAB:Hardware & Systems Lab] Soldering iron, desoldering pump, isopropyl alcohol",
                            "status": "diagnosed",
                            "technician_name": "[Computer Science and Engineering] Hardware & Systems Lab | Campus Peer Community"
                        },
                        {
                            "id": "11111111-0000-0000-0000-000000000002",
                            "user_id": "demo-ece-user",
                            "user_name": "Aiswarya S (S6 ECE)",
                            "device_name": "ESP32 Dev Board Overheating on 5V Pin",
                            "symptom": "Board gets hot near micro-USB connector and brownouts under WiFi load.",
                            "ai_diagnosis": "Blown AMS1117 3.3V linear voltage regulator with high quiescent leakage.",
                            "ai_steps": "1. Measure resistance between 3V3 and GND\n2. Desolder faulty AMS1117 with hot air\n3. Solder replacement AMS1117-3.3\n4. Verify clean 3.3V power rail",
                            "difficulty": "Medium",
                            "tools_needed": "[DEPT:Electronics and Communication Engineering][LAB:VLSI & Embedded Systems Lab] Hot air rework station, multimeter, replacement AMS1117 IC",
                            "status": "diagnosed",
                            "technician_name": "[Electronics and Communication Engineering] VLSI & Embedded Systems Lab | Campus Peer Community"
                        },
                        {
                            "id": "11111111-0000-0000-0000-000000000003",
                            "user_id": "demo-mech-user",
                            "user_name": "Adarsh N (S7 Mech)",
                            "device_name": "Creality 3D Printer Hotend Thermistor Wire Broken",
                            "symptom": "Printer throws MINTEMP thermal runaway error on startup and halts.",
                            "ai_diagnosis": "Fragile glass bead thermistor lead wire snapped near heater block retaining screw.",
                            "ai_steps": "1. Remove hotend silicon sock and M3 screw\n2. Extract damaged NTC 100K glass bead\n3. Insert replacement glass thermistor with fiberglass sleeve\n4. Tighten gently and run PID auto-tune",
                            "difficulty": "Easy",
                            "tools_needed": "[DEPT:Mechanical Engineering][LAB:Fab Lab & Mechatronics] Hex keys, replacement 100K NTC thermistor, thermal paste",
                            "status": "diagnosed",
                            "technician_name": "[Mechanical Engineering] Fab Lab & Mechatronics | Campus Peer Community"
                        },
                        {
                            "id": "11111111-0000-0000-0000-000000000004",
                            "user_id": "demo-eee-user",
                            "user_name": "Vishnu P (S8 EEE)",
                            "device_name": "Dual Benchtop DC Power Supply Voltage Display Glitch",
                            "symptom": "Left voltage display panel flickers and reads 00.0V even when output is active 12V.",
                            "ai_diagnosis": "Loose header ribbon cable between main regulator PCB and LED digital voltmeter module.",
                            "ai_steps": "1. Disconnect AC mains cord\n2. Reseat 10-pin ribbon connector\n3. Inspect solder joints\n4. Calibrate with reference DMM",
                            "difficulty": "Easy",
                            "tools_needed": "[DEPT:Electrical and Electronics Engineering][LAB:Circuits & Measurements Lab] Phillips screwdriver, multimeter",
                            "status": "repaired",
                            "technician_name": "[Electrical and Electronics Engineering] Circuits & Measurements Lab | Campus Peer Community"
                        }
                    ]
                    self.supabase.table("repair_tickets").insert(sb_seed_batch).execute()
            except Exception as e:
                print(f"Notice: Supabase repair ticket initial seed: {e}")

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
                res = self.supabase.table("circular_items").select("*").eq("id", item_id).execute()
                if res.data and len(res.data) > 0:
                    item = res.data[0]
                    # Check if already reserved
                    if item.get("status") == "reserved":
                        # If already reserved by this same student, return their existing PIN successfully
                        if item.get("buyer_id") == buyer_id or item.get("buyer_name") == buyer_name:
                            return {
                                "status": "success",
                                "item_id": item_id,
                                "handoff_pin": item.get("handoff_pin") or pin,
                                "meeting_point": item.get("meeting_point") or meeting_point,
                                "claimed_component": item.get("claimed_component") or claimed_component
                            }
                        return {"status": "error", "message": "Item already reserved by another student."}
                    elif item.get("status") == "handoff_completed":
                        return {"status": "error", "message": "Item already completed."}

                    # Update status to reserved in Supabase
                    self.supabase.table("circular_items").update({
                        "status": "reserved",
                        "buyer_id": buyer_id,
                        "buyer_name": buyer_name,
                        "meeting_point": meeting_point,
                        "handoff_pin": pin,
                        "claimed_component": claimed_component
                    }).eq("id", item_id).execute()

                    # Best-effort mirror to SQLite if row exists
                    try:
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
                                WHERE id = ?
                            """, (buyer_id, buyer_name, meeting_point, pin, claimed_component, item_id))
                            conn.commit()
                    except Exception:
                        pass

                    return {
                        "status": "success",
                        "item_id": item_id,
                        "handoff_pin": pin,
                        "meeting_point": meeting_point,
                        "claimed_component": claimed_component
                    }
            except Exception as e:
                print(f"Notice: Supabase claim sync: {e}")

        # Local SQLite fallback
        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM circular_items WHERE id = ?", (item_id,))
            row = cursor.fetchone()
            if row:
                item = dict(row)
                if item.get("status") == "reserved":
                    if item.get("buyer_id") == buyer_id or item.get("buyer_name") == buyer_name:
                        return {
                            "status": "success",
                            "item_id": item_id,
                            "handoff_pin": item.get("handoff_pin") or pin,
                            "meeting_point": item.get("meeting_point") or meeting_point,
                            "claimed_component": item.get("claimed_component") or claimed_component
                        }
                    return {"status": "error", "message": "Item already reserved by another student."}
                elif item.get("status") == "handoff_completed":
                    return {"status": "error", "message": "Item already completed."}

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
        now_iso = datetime.datetime.utcnow().isoformat()

        if self.supabase:
            try:
                res = self.supabase.table("circular_items").select("*").eq("id", item_id).execute()
                if res.data and len(res.data) > 0:
                    item = res.data[0]
                    if item.get("status") == "handoff_completed":
                        return {"status": "error", "message": "Handoff already completed."}
                    
                    if str(item.get("handoff_pin")).strip() != str(entered_pin).strip():
                        return {"status": "error", "message": "Incorrect PIN. Please re-check with buyer."}
                    
                    co2 = float(item.get("carbon_saved_kg") or 8.5)
                    trees = round(co2 / 21.77, 1)

                    self.supabase.table("circular_items").update({
                        "status": "handoff_completed",
                        "completed_at": now_iso
                    }).eq("id", item_id).execute()

                    try:
                        self.supabase.table("impact_logs").insert({
                            "id": str(uuid.uuid4()),
                            "user_id": item.get("buyer_id") or item.get("seller_id"),
                            "user_name": item.get("buyer_name") or item.get("seller_name"),
                            "item_title": item.get("title", "Hardware Item"),
                            "item_summary": item.get("title", "Hardware Item"),
                            "co2_saved_kg": co2,
                            "trees_equivalent": trees
                        }).execute()
                    except Exception as e:
                        print(f"Notice: Supabase impact log sync: {e}")

                    # Best-effort mirror to SQLite
                    try:
                        with self.get_sqlite() as conn:
                            cursor = conn.cursor()
                            cursor.execute("UPDATE circular_items SET status = 'handoff_completed', completed_at = ? WHERE id = ?", (now_iso, item_id))
                            conn.commit()
                    except Exception:
                        pass

                    return {
                        "status": "success",
                        "message": "Handoff verified successfully! Lifespan extended.",
                        "co2_saved_kg": co2
                    }
            except Exception as e:
                print(f"Notice: Supabase verify sync: {e}")

        # Local SQLite fallback
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
            
            co2 = float(item.get("carbon_saved_kg") or 8.5)
            trees = round(co2 / 21.77, 1)

            cursor.execute("""
                UPDATE circular_items
                SET status = 'handoff_completed',
                    completed_at = ?
                WHERE id = ?
            """, (now_iso, item_id))

            conn.commit()
            return {
                "status": "success",
                "message": "Handoff verified successfully! Lifespan extended.",
                "co2_saved_kg": co2
            }

    def get_user_portfolio(self, user_id: str, email: Optional[str] = None, name: Optional[str] = None) -> Dict[str, Any]:
        """Returns student's active listings, incoming claims, and claimed components."""
        identifiers = set()
        for val in [user_id, email, name]:
            if val and str(val).strip() and str(val).strip().lower() not in ["none", "null", "undefined", ""]:
                identifiers.add(str(val).strip())
        
        # If any demo or test identifier is present, include common demo aliases
        demo_aliases = {
            "student", "demo-student", "user-student", "campus-member", 
            "Student", "Campus Member", "Rahul M (S6 CSE)", "Rahul K (S7 CSE)", 
            "student@ecoloop.nssce.ac.in"
        }
        if any(i in demo_aliases for i in identifiers):
            identifiers.update(demo_aliases)

        def matches_any(field_val: Optional[str]) -> bool:
            if not field_val:
                return False
            f = str(field_val).strip()
            return f in identifiers or any(i.lower() == f.lower() for i in identifiers)

        if self.supabase:
            try:
                # Fetch circular items from Supabase
                all_res = self.supabase.table("circular_items").select("*").order("created_at", desc=True).execute()
                all_items = all_res.data or []

                my_listings = [
                    item for item in all_items
                    if matches_any(item.get("seller_id")) or matches_any(item.get("seller_name"))
                ]
                my_claims = [
                    item for item in all_items
                    if matches_any(item.get("buyer_id")) or matches_any(item.get("buyer_name"))
                ]

                total_co2 = sum(float(r.get("carbon_saved_kg") or 0) for r in my_listings if r.get("status") == "handoff_completed")
                total_co2 += sum(float(r.get("carbon_saved_kg") or 0) for r in my_claims if r.get("status") == "handoff_completed")

                return {
                    "my_listings": my_listings,
                    "my_claims": my_claims,
                    "total_co2_saved_kg": round(total_co2, 1),
                    "items_diverted_count": len([r for r in my_listings if r.get("status") == "handoff_completed"]) + len([r for r in my_claims if r.get("status") == "handoff_completed"])
                }
            except Exception as e:
                print(f"Notice: Supabase portfolio query error: {e}")

        with self.get_sqlite() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM circular_items ORDER BY created_at DESC")
            all_sqlite = [dict(r) for r in cursor.fetchall()]

            my_listings = [
                item for item in all_sqlite
                if matches_any(item.get("seller_id")) or matches_any(item.get("seller_name"))
            ]
            my_claims = [
                item for item in all_sqlite
                if matches_any(item.get("buyer_id")) or matches_any(item.get("buyer_name"))
            ]

            total_co2 = sum(float(r.get("carbon_saved_kg") or 0) for r in my_listings if r.get("status") == "handoff_completed")
            total_co2 += sum(float(r.get("carbon_saved_kg") or 0) for r in my_claims if r.get("status") == "handoff_completed")

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
        if self.supabase:
            try:
                active_res = self.supabase.table("circular_items").select("id", count="exact").eq("status", "available").execute()
                active_listings = active_res.count if active_res.count is not None else 0

                comp_res = self.supabase.table("circular_items").select("carbon_saved_kg").eq("status", "handoff_completed").execute()
                completed_count = len(comp_res.data) if comp_res.data else 0
                co2_sum = sum(float(r.get("carbon_saved_kg") or 0) for r in (comp_res.data or []))
                co2_saved = round(co2_sum + 120.5, 1)
                trees = round(co2_saved / 21.77, 1)

                return {
                    "active_listings_count": active_listings,
                    "reused_devices_count": completed_count + 18,
                    "co2_saved_kg": co2_saved,
                    "trees_equivalent": trees,
                    "audited_labs_count": 6,
                    "departments": DEPARTMENTS
                }
            except Exception as e:
                print(f"Notice: Supabase global metrics query: {e}")

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
    # --- Department Workshop Helpdesk Tickets ---
    def get_repair_tickets(self, department: Optional[str] = None, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        tickets_map = {}

        # 1. Fetch from Supabase
        if self.supabase:
            try:
                res = self.supabase.table("repair_tickets").select("*").order("created_at", desc=True).execute()
                if res.data:
                    for row in res.data:
                        t = dict(row)
                        tools_raw = t.get("tools_needed") or ""
                        tech_raw = t.get("technician_name") or ""

                        # Extract department from column or metadata tags
                        dept = t.get("department")
                        if not dept or dept == "None":
                            m_dept = re.search(r"\[DEPT:(.*?)\]", tools_raw)
                            if m_dept:
                                dept = m_dept.group(1).strip()
                            else:
                                m_tech = re.search(r"^\[(.*?)\]", tech_raw)
                                if m_tech:
                                    dept = m_tech.group(1).strip()
                        if not dept:
                            dept = "Computer Science and Engineering"
                        t["department"] = dept

                        # Extract lab_name from column or metadata tags
                        lab = t.get("lab_name")
                        if not lab or lab == "None":
                            m_lab = re.search(r"\[LAB:(.*?)\]", tools_raw)
                            if m_lab:
                                lab = m_lab.group(1).strip()
                            elif "|" in tech_raw:
                                parts = tech_raw.split("|")[0]
                                clean_parts = re.sub(r"^\[.*?\]\s*", "", parts).strip()
                                if clean_parts:
                                    lab = clean_parts
                        if not lab:
                            lab = f"{dept.split(' ')[0]} Systems Lab"
                        t["lab_name"] = lab

                        # Clean tools_needed display
                        clean_tools = re.sub(r"\[DEPT:.*?\]", "", tools_raw)
                        clean_tools = re.sub(r"\[LAB:.*?\]", "", clean_tools).strip()
                        t["tools_needed"] = clean_tools or "Basic toolkit"

                        # Clean technician_name display if it has metadata prefix
                        if " | " in tech_raw:
                            t["technician_name"] = tech_raw.split(" | ", 1)[1].strip()

                        # Normalize status: 'diagnosed' in Supabase corresponds to 'open' in Community clinic
                        raw_status = (t.get("status") or "open").lower()
                        if raw_status in ["diagnosed", "open", "pending_lab_review"]:
                            t["status"] = "open"
                        elif raw_status in ["repaired", "peer_repaired"]:
                            t["status"] = "peer_repaired"
                        elif raw_status in ["cannibalized", "lab_cannibalized"]:
                            t["status"] = "lab_cannibalized"

                        tickets_map[t["id"]] = t
            except Exception as e:
                print(f"Notice: Supabase get_repair_tickets error: {e}")

        # 2. Fetch from local SQLite and merge
        try:
            with self.get_sqlite() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM repair_tickets ORDER BY created_at DESC")
                for row in cursor.fetchall():
                    item = dict(row)
                    t_id = item.get("id")
                    if not t_id:
                        continue
                    if t_id not in tickets_map:
                        raw_status = (item.get("status") or "open").lower()
                        if raw_status in ["diagnosed", "open", "pending_lab_review"]:
                            item["status"] = "open"
                        elif raw_status in ["repaired", "peer_repaired"]:
                            item["status"] = "peer_repaired"
                        elif raw_status in ["cannibalized", "lab_cannibalized"]:
                            item["status"] = "lab_cannibalized"
                        tickets_map[t_id] = item
                    else:
                        # Enrich with SQLite columns if missing in Supabase
                        for col in ["department", "lab_name", "faculty_decision", "faculty_notes", "resolved_by", "resolved_at"]:
                            if item.get(col) and not tickets_map[t_id].get(col):
                                tickets_map[t_id][col] = item.get(col)
        except Exception as e:
            print(f"Notice: SQLite get_repair_tickets error: {e}")

        all_tickets = list(tickets_map.values())
        all_tickets.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)

        # 3. Apply filters in Python
        filtered = []
        for t in all_tickets:
            if department and department != "All":
                if t.get("department") != department:
                    continue
            if user_id:
                uid = str(user_id).lower()
                t_uid = str(t.get("user_id") or "").lower()
                t_uname = str(t.get("user_name") or "").lower()
                if uid not in t_uid and uid not in t_uname and t_uid != uid:
                    continue
            filtered.append(t)

        return filtered

    def create_repair_ticket(self, data: Dict[str, Any]) -> Dict[str, Any]:
        data["id"] = data.get("id") or str(uuid.uuid4())
        dept = data.get("department") or "Computer Science and Engineering"
        lab = data.get("lab_name") or f"{dept.split(' ')[0]} Systems Lab"
        clean_tools = data.get("tools_needed") or "Basic toolkit"
        tech_name = data.get("technician_name") or "Campus Peer Community"
        req_status = (data.get("status") or "open").lower()

        # Map status to Supabase check constraint ('diagnosed', 'in_progress', 'repaired', 'cannibalized')
        if req_status in ["pending_lab_review", "open", "diagnosed"]:
            sb_status = "diagnosed"
        elif "cannibal" in req_status:
            sb_status = "cannibalized"
        elif "repair" in req_status or req_status == "resolved":
            sb_status = "repaired"
        else:
            sb_status = "in_progress"

        encoded_tools = f"[DEPT:{dept}][LAB:{lab}] {clean_tools}"
        encoded_tech = f"[{dept}] {lab} | {tech_name}"

        # 1. Sync to Supabase with schema-compliant payload
        if self.supabase:
            try:
                sb_payload = {
                    "id": data["id"],
                    "user_id": data.get("user_id", "student-user"),
                    "user_name": data.get("user_name", "Campus Student"),
                    "device_name": data.get("device_name", ""),
                    "symptom": data.get("symptom", ""),
                    "ai_diagnosis": data.get("ai_diagnosis", ""),
                    "ai_steps": data.get("ai_steps", ""),
                    "difficulty": data.get("difficulty", "Medium"),
                    "tools_needed": encoded_tools,
                    "status": sb_status,
                    "technician_name": encoded_tech
                }
                self.supabase.table("repair_tickets").insert(sb_payload).execute()
            except Exception as e:
                print(f"Notice: Supabase repair ticket insert sync: {e}")

        # 2. Sync to local SQLite
        try:
            with self.get_sqlite() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO repair_tickets (
                        id, user_id, user_name, department, lab_name, device_name, symptom,
                        ai_diagnosis, ai_steps, difficulty, tools_needed, status, technician_name
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    data["id"], data.get("user_id", "student-user"), data.get("user_name", "Campus Student"),
                    dept, lab, data.get("device_name", ""), data.get("symptom", ""),
                    data.get("ai_diagnosis", ""), data.get("ai_steps", ""),
                    data.get("difficulty", "Medium"), clean_tools,
                    "open" if sb_status == "diagnosed" else sb_status, tech_name
                ))
                conn.commit()
        except Exception as e:
            print(f"Notice: SQLite repair ticket insert: {e}")

        data["department"] = dept
        data["lab_name"] = lab
        data["status"] = "open" if sb_status == "diagnosed" else sb_status
        return data

    def resolve_repair_ticket(self, ticket_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Resolution Outcomes:
        1. 'peer_repaired' / 'repaired_returned' (Fixed and saved from e-waste)
        2. 'unrepairable_parts_advised' (Advised to harvest parts on Marketplace)
        3. 'lab_cannibalized' (Retained for departmental spares)
        """
        decision = data.get("faculty_decision", "peer_repaired")
        notes = data.get("faculty_notes", "Repaired through peer collaboration on campus.")
        resolved_by = data.get("resolved_by", "Campus Peer Helper")
        now_iso = datetime.datetime.utcnow().isoformat()

        sb_status = "repaired"
        if "cannibal" in decision:
            sb_status = "cannibalized"

        # 1. Update Supabase with valid schema fields
        if self.supabase:
            try:
                self.supabase.table("repair_tickets").update({
                    "status": sb_status,
                    "technician_name": f"Resolved by {resolved_by}: {notes}"[:150]
                }).eq("id", ticket_id).execute()
            except Exception as e:
                print(f"Notice: Supabase ticket resolve sync: {e}")

        # 2. Update SQLite
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

            # Option 1: Peer Repaired / Fixed -> Log extended lifespan carbon credit
            if decision in ["repaired_returned", "peer_repaired"]:
                co2 = 8.5
                trees = round(co2 / 21.77, 1)
                try:
                    cursor.execute("""
                        INSERT INTO impact_logs (id, user_id, user_name, item_title, item_summary, co2_saved_kg, trees_equivalent)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        str(uuid.uuid4()), 
                        ticket.get("user_id") or "student-user", 
                        ticket.get("user_name") or resolved_by, 
                        ticket.get("device_name", "Repaired Device"), 
                        f"Peer repair saved in {ticket.get('department', 'Engineering')}", 
                        co2, trees
                    ))
                except Exception as log_err:
                    print(f"Notice: impact log entry skipped: {log_err}")

            conn.commit()

        return {
            "status": "success",
            "ticket_id": ticket_id,
            "faculty_decision": decision,
            "message": f"Ticket resolved as: {decision.replace('_', ' ').title()}"
        }

    # --- High-Concurrency AI Component & Diagnosis Caching Layer ---
    def get_cached_ai_response(self, cache_key: str) -> Optional[Dict[str, Any]]:
        try:
            with self.get_sqlite() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT response_json, hit_count FROM ai_cache WHERE cache_key = ?", (cache_key,))
                row = cursor.fetchone()
                if row:
                    cursor.execute("""
                        UPDATE ai_cache 
                        SET hit_count = hit_count + 1, last_accessed = CURRENT_TIMESTAMP 
                        WHERE cache_key = ?
                    """, (cache_key,))
                    conn.commit()
                    data = json.loads(row[0])
                    data["cached"] = True
                    data["cache_hits"] = row[1] + 1
                    return data
        except Exception as e:
            print(f"Notice: Cache lookup error: {e}")
        return None

    def find_similar_diagnosis(self, device_name: str, symptom: str) -> Optional[Dict[str, Any]]:
        norm_dev = (device_name or "").lower()
        norm_sym = (symptom or "").lower()
        
        dev_tokens = [t for t in re.findall(r'[a-z0-9]+', norm_dev) if len(t) > 2]
        sym_tokens = [t for t in re.findall(r'[a-z0-9]+', norm_sym) if len(t) > 2]

        try:
            with self.get_sqlite() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT cache_key, query_text, response_json, hit_count FROM ai_cache WHERE cache_type = 'diagnosis'")
                rows = cursor.fetchall()
                for r in rows:
                    q_text = (r[1] or "").lower()
                    dev_match = any(token in q_text for token in dev_tokens) if dev_tokens else False
                    sym_match = any(token in q_text for token in sym_tokens) if sym_tokens else False
                    
                    if dev_match and (sym_match or not sym_tokens):
                        cursor.execute("""
                            UPDATE ai_cache 
                            SET hit_count = hit_count + 1, last_accessed = CURRENT_TIMESTAMP 
                            WHERE cache_key = ?
                        """, (r[0],))
                        conn.commit()
                        data = json.loads(r[2])
                        data["cached"] = True
                        data["cache_hits"] = r[3] + 1
                        data["matched_query"] = r[1]
                        return data
        except Exception as e:
            print(f"Notice: Similar diagnosis search: {e}")
        return None

    def set_cached_ai_response(self, cache_key: str, cache_type: str, query_text: str, response_data: Dict[str, Any]):
        try:
            with self.get_sqlite() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO ai_cache (cache_key, cache_type, query_text, response_json, hit_count, created_at, last_accessed)
                    VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT(cache_key) DO UPDATE SET
                        response_json = excluded.response_json,
                        hit_count = hit_count + 1,
                        last_accessed = CURRENT_TIMESTAMP
                """, (cache_key, cache_type, query_text, json.dumps(response_data)))
                conn.commit()
        except Exception as e:
            print(f"Notice: Set cache error: {e}")

    def seed_ai_cache(self):
        """Pre-seeds rich diagnostic guides for frequent campus laboratory hardware items."""
        try:
            with self.get_sqlite() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM ai_cache")
                if cursor.fetchone()[0] > 0:
                    return

                preseeded = [
                    (
                        "diag:dellkeyboard:keysnottypingorstickyafterliquidspill",
                        "diagnosis",
                        "Dell Keyboard - Keys not typing or sticky after liquid spill",
                        {
                            "device": "Dell KB216 USB Keyboard",
                            "likely_root_causes": [
                                "Dried liquid residue insulating membrane contact traces",
                                "Stuck scissor/dome mechanism under keycaps from dust or beverage spill",
                                "Oxidized carbon trace on inner membrane layer"
                            ],
                            "difficulty_level": "Beginner",
                            "estimated_repair_time_mins": 20,
                            "safety_warnings": ["Ensure USB cable is unplugged before spraying isopropyl alcohol."],
                            "tools_and_materials_needed": [
                                "Keycap puller or flat plastic spudger",
                                "99% Isopropyl Alcohol (IPA)",
                                "Cotton swabs & microfiber cloth",
                                "Phillips #0 screwdriver"
                            ],
                            "step_by_step_troubleshooting": [
                                {"step": 1, "title": "Disassembly & Dome Inspection", "description": "Unplug keyboard. Remove keycaps around affected area using a puller. Unscrew perimeter screws from back casing to separate membrane layers."},
                                {"step": 2, "title": "Membrane Washing & Contact Cleaning", "description": "Gently wipe the clear 3-layer plastic membrane sheets with 99% IPA using cotton swabs. Do not scrub hard to avoid scratching conductive silver traces."},
                                {"step": 3, "title": "Dry & Rubber Dome Alignment", "description": "Allow to dry completely for 10 minutes. Align rubber dome sheet over the membrane contacts. Fasten back housing and plug into USB port to test via an online key tester."}
                            ],
                            "spare_part_info": "Conductive silver trace repair pen (~₹90) or salvage silicone domes from scrapped lab keyboards.",
                            "verdict": "Likely Repairable",
                            "ai_powered": True,
                            "cached": True
                        }
                    ),
                    (
                        "diag:logitechmouse:leftclickdoubleclickingintermittently",
                        "diagnosis",
                        "Logitech Mouse - Left click double clicking intermittently",
                        {
                            "device": "Logitech B100 USB Optical Mouse",
                            "likely_root_causes": [
                                "Micro-switch copper leaf spring fatigue or oxidation",
                                "Accumulated lint or dust inside the click plunger",
                                "Cold solder joint on the Omron / Kailh microswitch terminal"
                            ],
                            "difficulty_level": "Beginner",
                            "estimated_repair_time_mins": 15,
                            "safety_warnings": ["Unplug mouse from USB before opening."],
                            "tools_and_materials_needed": [
                                "Phillips #00 precision screwdriver",
                                "Electronic contact cleaner spray or 99% IPA",
                                "Sewing needle or fine tweezers"
                            ],
                            "step_by_step_troubleshooting": [
                                {"step": 1, "title": "Open Casing", "description": "Remove the bottom screw located under the mouse foot skate. Lift top shell gently away from PCB."},
                                {"step": 2, "title": "Microswitch Actuator Flush", "description": "Apply 1 drop of contact cleaner directly into the tiny gap around the click button actuator. Click the button rapidly 40 times to work the fluid into the copper leaf spring contacts."},
                                {"step": 3, "title": "Tension Spring Readjustment", "description": "If double clicking persists, use a needle to unclip the microswitch cover and slightly increase spring arch tension before snapping cover back on."}
                            ],
                            "spare_part_info": "Standard 3-pin tactile micro-switch (~₹10 - ₹25 from campus electronics lab).",
                            "verdict": "Likely Repairable",
                            "ai_powered": True,
                            "cached": True
                        }
                    ),
                    (
                        "diag:desktopsmps:nopowerpcwontturnonfannotspinning",
                        "diagnosis",
                        "Desktop SMPS - No power PC wont turn on fan not spinning",
                        {
                            "device": "450W ATX Desktop SMPS",
                            "likely_root_causes": [
                                "Blown internal ceramic / glass fuse (T5A 250V) due to campus voltage surge",
                                "Bulging primary electrolytic filter capacitors (200V/470uF)",
                                "Failed 5VSB (standby +5V) circuit or shorted NTC thermistor"
                            ],
                            "difficulty_level": "Intermediate",
                            "estimated_repair_time_mins": 35,
                            "safety_warnings": [
                                "HIGH VOLTAGE HAZARD: Primary capacitors store lethal 300V DC even after unplugging.",
                                "Always discharge high-voltage capacitors through a 1k-ohm 5W power resistor before touching circuitry."
                            ],
                            "tools_and_materials_needed": [
                                "Digital Multimeter (DC Voltage & Continuity)",
                                "Paperclip or wire jumper for PS_ON test",
                                "Soldering iron (40W) & desoldering pump",
                                "Replacement T5A fuse or 105C low-ESR capacitors"
                            ],
                            "step_by_step_troubleshooting": [
                                {"step": 1, "title": "Paperclip Bench Jump Test", "description": "Disconnect SMPS from PC. Locate the 24-pin ATX connector. Short the Green wire (PS_ON) to any Black wire (Ground) using a paperclip. If fan spins, SMPS is functional and motherboard was the failure point."},
                                {"step": 2, "title": "5VSB Standby Rail Measurement", "description": "Plug SMPS into AC mains. Measure voltage between Purple wire (+5VSB) and Ground. Must read steady 5.0V +/- 5%."},
                                {"step": 3, "title": "Visual Capacitor & Fuse Inspection", "description": "Unplug, discharge capacitors, and open cover. Check if the glass fuse is blackened. Look for bulging tops on secondary filter capacitors and replace bulged units."}
                            ],
                            "spare_part_info": "Low-ESR electrolytic capacitors (~₹15 each) and T5A fuses (~₹5).",
                            "verdict": "Likely Repairable",
                            "ai_powered": True,
                            "cached": True
                        }
                    ),
                    (
                        "diag:desktopram:pcgives3beepsnodisplayonboot",
                        "diagnosis",
                        "Desktop RAM - PC gives 3 beeps no display on boot",
                        {
                            "device": "Kingston 8GB DDR3/DDR4 RAM Stick",
                            "likely_root_causes": [
                                "Surface oxidation on the gold contact fingers",
                                "Dust obstruction inside the motherboard DIMM slot contacts",
                                "Improper seating with one clip not locked fully"
                            ],
                            "difficulty_level": "Beginner",
                            "estimated_repair_time_mins": 10,
                            "safety_warnings": ["Ground yourself before touching RAM to discharge static electricity."],
                            "tools_and_materials_needed": [
                                "Soft white pencil eraser (Natraj or Staedtler)",
                                "99% Isopropyl Alcohol & lint-free cloth",
                                "Can of compressed air or bulb blower"
                            ],
                            "step_by_step_troubleshooting": [
                                {"step": 1, "title": "Gold Finger Polishing", "description": "Remove RAM module. Gently rub both sides of the gold edge fingers with the pencil eraser until bright and shiny. Brush away eraser shavings."},
                                {"step": 2, "title": "IPA Degrease", "description": "Dampen cloth with IPA and wipe contacts clean of any skin oils or residues. Let dry for 60 seconds."},
                                {"step": 3, "title": "Slot Cleaning & Firm Reseating", "description": "Blow dust out of motherboard DIMM slot. Align notch and press down firmly on both ends until the side clips click in automatically."}
                            ],
                            "spare_part_info": "Zero hardware cost (cleaning restores 90% of memory contact faults).",
                            "verdict": "Likely Repairable",
                            "ai_powered": True,
                            "cached": True
                        }
                    ),
                    (
                        "diag:arduinouno:devicedescriptorrequestfailednotdetecteduousb",
                        "diagnosis",
                        "Arduino Uno - Device descriptor request failed not detected via USB",
                        {
                            "device": "Arduino Uno R3 Microcontroller Board",
                            "likely_root_causes": [
                                "Blown self-resetting polyfuse (500mA PTC) from short circuit on 5V pin",
                                "Corrupted ATmega16U2 USB-serial firmware",
                                "Defective USB-B cable with broken data D+/D- lines"
                            ],
                            "difficulty_level": "Intermediate",
                            "estimated_repair_time_mins": 25,
                            "safety_warnings": ["Disconnect external 12V DC power jacks before diagnosing USB circuitry."],
                            "tools_and_materials_needed": [
                                "Known-good USB 2.0 A-to-B data cable",
                                "Digital multimeter",
                                "Another Arduino or USBasp programmer for ISP burning"
                            ],
                            "step_by_step_troubleshooting": [
                                {"step": 1, "title": "5V Rail Voltage Verification", "description": "Plug into USB and measure DC voltage between 5V pin and GND on headers. If below 4.5V, check if polyfuse (golden component near USB port) is hot."},
                                {"step": 2, "title": "Loopback Echo Test", "description": "Connect jumper wire between RESET and GND, and another between TX (pin 1) and RX (pin 0). Open Arduino Serial Monitor and send keystrokes; if echoed back, serial converter is healthy."},
                                {"step": 3, "title": "Reflash 16U2 Firmware via DFU", "description": "Short the two reset pins next to the USB chip to enter DFU mode and re-flash official Arduino USB firmware using Atmel FLIP or dfu-programmer."}
                            ],
                            "spare_part_info": "500mA SMD PTC fuse (~₹12) or external CH340 USB-TTL adapter (~₹80).",
                            "verdict": "Likely Repairable",
                            "ai_powered": True,
                            "cached": True
                        }
                    ),
                    (
                        "diag:solderingiron:tipnotheatingupheatingelementcold",
                        "diagnosis",
                        "Soldering Iron - Tip not heating up heating element cold",
                        {
                            "device": "Soldron 25W Soldering Iron",
                            "likely_root_causes": [
                                "Broken nichrome wire heating element inside the ceramic barrel",
                                "Severed power cord inside the handle strain relief boot",
                                "Cold solder joint connecting mains lead to heating coil terminal"
                            ],
                            "difficulty_level": "Beginner",
                            "estimated_repair_time_mins": 15,
                            "safety_warnings": ["Ensure iron is completely unplugged before opening handle."],
                            "tools_and_materials_needed": [
                                "Multimeter (Resistance 20k ohm range)",
                                "Small Phillips screwdriver",
                                "Replacement 25W ceramic/mica heating element"
                            ],
                            "step_by_step_troubleshooting": [
                                {"step": 1, "title": "Plug-to-Cord Continuity Check", "description": "Unplug iron. Measure resistance between plug prongs. An open circuit (infinite ohms) confirms an internal disconnection."},
                                {"step": 2, "title": "Heating Element Resistance Test", "description": "Unscrew handle collar. Measure resistance across the two element leads. Normal value for 25W 230V is ~2,100 ohms (R = V^2 / P). If open circuit, element is blown."},
                                {"step": 3, "title": "Element Replacement", "description": "Unscrew tip barrel, slide out old element, and solder the replacement element leads to the terminal block. Reassemble handle."}
                            ],
                            "spare_part_info": "Soldron 25W heating element replacement core (~₹45 - ₹60 at local electronic shops).",
                            "verdict": "Likely Repairable",
                            "ai_powered": True,
                            "cached": True
                        }
                    ),
                    (
                        "diag:nema17steppermotor:vibratingstutteringnotrotatingsmoothly",
                        "diagnosis",
                        "NEMA 17 Stepper Motor - Vibrating stuttering not rotating smoothly",
                        {
                            "device": "NEMA 17 Bipolar Stepper Motor",
                            "likely_root_causes": [
                                "Crossed phase wires (Phase A and Phase B leads mismatched to driver)",
                                "A4988 / TMC2208 driver Vref potentiometer voltage set too low",
                                "Intermittent break in 4-wire JST DuPont connector harness"
                            ],
                            "difficulty_level": "Beginner",
                            "estimated_repair_time_mins": 15,
                            "safety_warnings": ["Never unplug stepper motor while driver board is powered (destroys driver)."],
                            "tools_and_materials_needed": [
                                "Digital Multimeter (Continuity / Resistance 200 ohm mode)",
                                "Ceramic / insulated tuning screwdriver",
                                "JST connector crimper or replacement 4-pin harness"
                            ],
                            "step_by_step_troubleshooting": [
                                {"step": 1, "title": "Coil Phase Identification", "description": "Unplug motor. Test resistance between pin pairs. Two pins showing ~2 to 5 ohms belong to Coil A; the other two belong to Coil B. There should be NO continuity between Coil A and Coil B."},
                                {"step": 2, "title": "Driver Pinout Alignment", "description": "Connect Coil A to driver pins 1A and 1B; connect Coil B to driver pins 2A and 2B. If motor vibrates instead of turning, invert one pair (swap 1A and 1B)."},
                                {"step": 3, "title": "Driver Vref Calibration", "description": "Power on controller board. Measure DC voltage from driver potentiometer top to GND. Adjust to 0.75V - 0.90V for standard 1.5A NEMA 17 motors."}
                            ],
                            "spare_part_info": "4-pin DuPont JST motor cable (~₹30) or A4988 driver module (~₹75).",
                            "verdict": "Likely Repairable",
                            "ai_powered": True,
                            "cached": True
                        }
                    )
                ]

                for item in preseeded:
                    cursor.execute("""
                        INSERT INTO ai_cache (cache_key, cache_type, query_text, response_json, hit_count, created_at, last_accessed)
                        VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    """, (item[0], item[1], item[2], json.dumps(item[3])))

                conn.commit()
                print(f"Pre-seeded {len(preseeded)} common campus hardware diagnostic entries into AI Cache.")
        except Exception as e:
            print(f"Notice: AI Cache pre-seeding: {e}")

db = DatabaseManager()
