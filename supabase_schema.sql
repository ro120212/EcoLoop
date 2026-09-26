-- ==============================================================================
-- EcoLoop: Campus Circular E-Waste Economy & Reuse Platform
-- NSS College of Engineering, Palakkad
-- Supabase PostgreSQL Production Schema
-- 
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/cxhqjmrxtlfrthuboaij
-- 2. In the left navigation, click on "SQL Editor".
-- 3. Click "New Query", paste this entire script, and click "Run".
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. User Profiles Table (syncs with Supabase Auth or campus logins)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  role text default 'student' check (role in ('student', 'lab_staff', 'admin')),
  department text default 'Computer Science and Engineering',
  phone text,
  created_at timestamptz default now() not null
);

-- 2. Circular Marketplace Items (Devices, Components & Sub-Parts)
create table if not exists public.circular_items (
  id uuid primary key default gen_random_uuid(),
  seller_id text not null,
  seller_name text not null,
  department text not null check (department in (
    'Computer Science and Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical and Electronics Engineering',
    'Instrumentation and Control Engineering'
  )),
  title text not null,
  description text,
  category text not null,
  condition text not null default 'Functional/Tested',
  price_type text default 'free' check (price_type in ('free', 'priced')),
  price numeric default 0,
  sub_components jsonb default '[]'::jsonb, -- JSON array of harvestable sub-parts
  status text default 'available' check (status in ('available', 'reserved', 'handoff_completed')),
  buyer_id text,
  buyer_name text,
  meeting_point text, -- Typed custom meeting spot on campus
  handoff_pin text,   -- 4-Digit secure verification PIN
  claimed_component text default 'All',
  carbon_saved_kg numeric default 8.5,
  image_url text,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

-- 3. Department Lab Audits across 5 Branches (CSE, Mech, Civil, EEE, IC)
create table if not exists public.lab_audits (
  id uuid primary key default gen_random_uuid(),
  auditor_name text not null,
  department text not null,
  lab_name text not null,
  audit_date date default current_date not null,
  total_systems int default 0 not null,
  functional_count int default 0 not null,
  repairable_count int default 0 not null,
  scrap_count int default 0 not null,
  surplus_for_students int default 0 not null,
  notes text,
  created_at timestamptz default now() not null
);

-- 4. Department Hardware Inventory & Cannibalization Triage
create table if not exists public.dept_inventory (
  id uuid primary key default gen_random_uuid(),
  department text not null,
  item_name text not null,
  category text not null,
  total_qty int default 0 not null,
  working_qty int default 0 not null,
  repairable_qty int default 0 not null,
  scrap_qty int default 0 not null,
  recommended_action text default 'Inspect and Triage',
  updated_at timestamptz default now() not null
);

-- 5. Repair Before Replace Platform Tickets
create table if not exists public.repair_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  user_name text not null,
  device_name text not null,
  symptom text not null,
  ai_diagnosis text,
  ai_steps text,
  difficulty text default 'Medium',
  tools_needed text default 'Basic toolkit',
  status text default 'diagnosed' check (status in ('diagnosed', 'in_progress', 'repaired', 'cannibalized')),
  technician_name text default 'Campus Repair Club',
  created_at timestamptz default now() not null
);

-- 6. Environmental Carbon Impact Logs (NAAC Green Campus Certification)
create table if not exists public.impact_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  user_name text,
  item_title text not null,
  item_summary text,
  co2_saved_kg numeric default 0,
  trees_equivalent numeric default 0,
  created_at timestamptz default now() not null
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- Allow public / authenticated campus read and write operations
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.circular_items enable row level security;
alter table public.lab_audits enable row level security;
alter table public.dept_inventory enable row level security;
alter table public.repair_tickets enable row level security;
alter table public.impact_logs enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow public select circular_items" on public.circular_items;
drop policy if exists "Allow public insert circular_items" on public.circular_items;
drop policy if exists "Allow public update circular_items" on public.circular_items;

drop policy if exists "Allow public select lab_audits" on public.lab_audits;
drop policy if exists "Allow public insert lab_audits" on public.lab_audits;

drop policy if exists "Allow public select dept_inventory" on public.dept_inventory;
drop policy if exists "Allow public insert/update dept_inventory" on public.dept_inventory;

drop policy if exists "Allow public select impact_logs" on public.impact_logs;
drop policy if exists "Allow public insert impact_logs" on public.impact_logs;

drop policy if exists "Allow public select repair_tickets" on public.repair_tickets;
drop policy if exists "Allow public insert repair_tickets" on public.repair_tickets;

-- Create Open Campus Policies for Demo Evaluation
create policy "Allow public select circular_items" on public.circular_items for select using (true);
create policy "Allow public insert circular_items" on public.circular_items for insert with check (true);
create policy "Allow public update circular_items" on public.circular_items for update using (true);

create policy "Allow public select lab_audits" on public.lab_audits for select using (true);
create policy "Allow public insert lab_audits" on public.lab_audits for insert with check (true);

create policy "Allow public select dept_inventory" on public.dept_inventory for select using (true);
create policy "Allow public insert/update dept_inventory" on public.dept_inventory for all using (true);

create policy "Allow public select impact_logs" on public.impact_logs for select using (true);
create policy "Allow public insert impact_logs" on public.impact_logs for insert with check (true);

create policy "Allow public select repair_tickets" on public.repair_tickets for select using (true);
create policy "Allow public insert repair_tickets" on public.repair_tickets for insert with check (true);

-- ==============================================================================
-- Initial Seed Data: 5 NSSCE Engineering Departments
-- ==============================================================================
insert into public.circular_items (
  seller_id, seller_name, department, title, description, category,
  condition, price_type, price, sub_components, status, buyer_id, buyer_name,
  meeting_point, handoff_pin, claimed_component, carbon_saved_kg, image_url
) values
  ('demo-student', 'Rahul K (S7 CSE)', 'Computer Science and Engineering',
   'Arduino Uno R3 Kit with Sensor Expansion Shield',
   'Spare board from Embedded Systems lab. Perfect working condition with breadboard & 40x jumper wires.',
   'Microcontrollers & Embedded', 'Like New', 'priced', 150,
   '[{"name": "Arduino Uno R3 Board", "status": "available"}, {"name": "Sensor Shield V5.0", "status": "available"}, {"name": "40-Pin Jumper Ribbon", "status": "available"}]'::jsonb,
   'available', null, null, null, null, null, 4.5,
   'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&auto=format&fit=crop&q=60'),

  ('demo-student', 'Rahul K (S7 CSE)', 'Computer Science and Engineering',
   'Raspberry Pi 3 Model B+ & 5V 2.5A Adapter',
   'Used for IoT mini-project. Buyer has requested claim and specified meetup spot outside workshop.',
   'Compute & Lab Boards', 'Functional/Tested', 'priced', 350,
   '[{"name": "Raspberry Pi 3B+ Board", "status": "reserved"}, {"name": "Official 5V 2.5A Adapter", "status": "reserved"}]'::jsonb,
   'reserved', 'demo-mech-1', 'Adarsh N (S7 Mech)',
   'Outside Central Mechanical Workshop at 4:00 PM', '7492', 'All', 12.0,
   'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60'),

  ('demo-mech-1', 'Adarsh N (S7 Mech)', 'Mechanical Engineering',
   'NEMA 17 Stepper Motors & Driver Shields',
   'Salvaged from an unused 3D printer frame in Central Workshop. All coils tested for continuity.',
   'Motors & Actuators', 'Functional/Tested', 'priced', 120,
   '[{"name": "2x NEMA 17 Motors", "status": "available"}, {"name": "A4988 Driver Module", "status": "available"}]'::jsonb,
   'available', null, null, null, null, null, 14.5,
   'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60'),

  ('demo-cse-1', 'Prof. Haridasan K (CSE Lab)', 'Computer Science and Engineering',
   'Core i5 Desktop Tower (Harvestable Parts)',
   'Replaced in CSE OS Lab. Motherboard dead, but 450W SMPS, 8GB DDR3 RAM, and SATA cables in mint condition.',
   'PC Towers & Hardware', 'Needs Minor Repair', 'free', 0,
   '[{"name": "450W ATX SMPS Power Supply", "status": "available"}, {"name": "8GB DDR3 1600MHz RAM", "status": "available"}, {"name": "SATA Data Cables (x2)", "status": "available"}, {"name": "Metal ATX Chassis", "status": "available"}]'::jsonb,
   'available', null, null, null, null, null, 85.0,
   'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=60'),

  ('demo-ic-1', 'Ananya R (S6 IC)', 'Instrumentation and Control Engineering',
   'RTD PT100 Temperature Sensors & Op-Amp Boards',
   'Surplus from Instrumentation mini-project. Includes signal conditioning LM358 op-amp board.',
   'Sensors & Transducers', 'Functional/Tested', 'priced', 90,
   '[{"name": "PT100 RTD Sensor Probe", "status": "available"}, {"name": "Op-Amp Amplifier Board", "status": "available"}]'::jsonb,
   'available', null, null, null, null, null, 8.2,
   'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60'),

  ('demo-civil-1', 'Gokul V (S8 Civil)', 'Civil Engineering',
   'Casio FX-991ES Plus Scientific Calculator & Mini Drafter',
   'Used for Surveying & Structural Analysis lab. Graduating senior passing it to juniors.',
   'Calculators & Drafting', 'Like New', 'free', 0,
   '[{"name": "Casio Scientific Calculator", "status": "available"}, {"name": "Steel Scale Mini Drafter", "status": "available"}]'::jsonb,
   'available', null, null, null, null, null, 6.0,
   'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=60'),

  ('demo-eee-1', 'Prof. Radhika M (EEE Lab)', 'Electrical and Electronics Engineering',
   'Step-Down Transformers (230V to 12V-0-12V, 2A)',
   'Heavy copper winding step-down transformers from Power Electronics lab bench upgrades.',
   'Power & Transformers', 'Functional/Tested', 'free', 0,
   '[{"name": "Center-Tapped 12V 2A Transformer", "status": "available"}, {"name": "Bridge Rectifier PCB", "status": "available"}]'::jsonb,
   'available', null, null, null, null, null, 22.0,
   'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=60')
on conflict do nothing;

-- Seed Initial Lab Audits
insert into public.lab_audits (
  auditor_name, department, lab_name, audit_date, total_systems, functional_count, repairable_count, scrap_count, surplus_for_students, notes
) values
  ('Prof. Haridasan K', 'Computer Science and Engineering', 'CSE Systems Lab (Room 204)', '2026-09-20', 40, 32, 5, 3, 4, '3 systems flagged for RAM harvest; 4 keyboards released to students.'),
  ('Dr. Muraleedharan K', 'Mechanical Engineering', 'Mechatronics & Robotics Lab', '2026-09-21', 25, 20, 3, 2, 3, '2 stepper controller rigs disassembled; harvestable components available for student projects.'),
  ('Prof. Deepa S', 'Civil Engineering', 'CAD & Structural Modeling Lab', '2026-09-22', 30, 26, 2, 2, 2, '2 CRT displays replaced; VGA cables and power cords set aside for student reuse.'),
  ('Dr. Radhika M', 'Electrical and Electronics Engineering', 'Simulation & Power Lab', '2026-09-23', 28, 22, 4, 2, 3, 'Bulging capacitors on 4 boards; transformers in excellent reusable condition.'),
  ('Prof. Venugopal P', 'Instrumentation and Control Engineering', 'Process Control & Transducers Lab', '2026-09-24', 22, 18, 2, 2, 2, 'Surplus sensor probes and patch wires cataloged for student semester projects.')
on conflict do nothing;

-- Seed Initial Inventory
insert into public.dept_inventory (
  department, item_name, category, total_qty, working_qty, repairable_qty, scrap_qty, recommended_action
) values
  ('Computer Science and Engineering', 'Dell USB Keyboards', 'Peripherals', 24, 15, 6, 3, 'Cannibalize switches & cables from 3 scrap units to fix 6 repairable; release 5 to students.'),
  ('Mechanical Engineering', 'NEMA 17 Stepper Motors', 'Motors & Actuators', 16, 10, 4, 2, 'Test driver coils on 4 repairable; 6 surplus motors released to student robotics projects.'),
  ('Civil Engineering', 'Drafting Scales & Mini-Drafters', 'Drafting Tools', 20, 14, 4, 2, 'Inspect clamping screws; 8 units ready for junior student allotment.'),
  ('Electrical and Electronics Engineering', 'Step-Down 12V Transformers', 'Power & Transformers', 15, 10, 3, 2, 'Test insulation resistance; release 5 surplus units for student circuit projects.'),
  ('Instrumentation and Control Engineering', 'RTD & Thermocouple Sensor Modules', 'Sensors & Transducers', 18, 12, 4, 2, 'Calibrate bridge circuits; 6 operational probes available for project harvesting.')
on conflict do nothing;
