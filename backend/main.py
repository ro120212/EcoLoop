import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from database import db, DEPARTMENTS
from gemini_service import gemini_service

load_dotenv()

app = FastAPI(
    title="EcoLoop API - Campus Circular E-Waste Economy",
    description="Campus Circular E-Waste Economy & Reuse Platform for NSS College of Engineering",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class CircularItemCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    department: str
    category: str
    condition: str
    price_type: str = "free"
    price: float = 0.0
    sub_components: Optional[str] = "[]"
    carbon_saved_kg: Optional[float] = 8.5
    image_url: Optional[str] = ""
    seller_id: str
    seller_name: str

class ClaimItemReq(BaseModel):
    item_id: str
    buyer_id: str
    buyer_name: str
    meeting_point: str # Typed meeting location by buyer
    claimed_component: Optional[str] = "All"

class VerifyPinReq(BaseModel):
    item_id: str
    entered_pin: str

class AuditCreate(BaseModel):
    auditor_name: str
    department: str
    lab_name: str
    audit_date: Optional[str] = None
    total_systems: int
    functional_count: int
    repairable_count: int
    scrap_count: int
    surplus_for_students: int = 0
    notes: Optional[str] = ""

class InventoryItem(BaseModel):
    id: Optional[str] = None
    department: str
    item_name: str
    category: str
    total_qty: int
    working_qty: int
    repairable_qty: int
    scrap_qty: int

class RepairDiagnoseReq(BaseModel):
    device_name: str
    symptom: str
    device_category: Optional[str] = "Electronics"

class ApiKeyReq(BaseModel):
    api_key: str

# --- Platform Health & Metrics ---
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {
        "status": "online",
        "platform": "EcoLoop: Campus Circular E-Waste Economy Platform",
        "institution": "NSS College of Engineering, Palakkad",
        "departments": DEPARTMENTS,
        "version": "2.0.0"
    }

@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {
        "status": "healthy",
        "service": "ecoloop-backend",
        "version": "2.0.0"
    }

@app.get("/api/departments")
def get_departments():
    return DEPARTMENTS

@app.get("/api/stats")
def get_platform_stats():
    metrics = db.get_global_metrics()
    analytics = db.get_audit_analytics()
    return {
        **metrics,
        "audit_analytics": analytics
    }

@app.post("/api/settings/gemini-key")
def update_gemini_key(req: ApiKeyReq):
    success = gemini_service.update_key(req.api_key.strip())
    if not success:
        raise HTTPException(status_code=400, detail="Invalid API Key format")
    return {"status": "success", "message": "Gemini API key updated successfully."}

# --- Circular Marketplace & PIN Handoffs ---
@app.get("/api/marketplace")
def get_marketplace_items(
    department: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None
):
    return db.get_circular_items(department=department, category=category, status=status)

@app.post("/api/marketplace")
def create_marketplace_item(item: CircularItemCreate):
    return db.create_circular_item(item.dict())

@app.post("/api/marketplace/claim")
def claim_item(req: ClaimItemReq):
    res = db.claim_item(
        item_id=req.item_id,
        buyer_id=req.buyer_id,
        buyer_name=req.buyer_name,
        meeting_point=req.meeting_point,
        claimed_component=req.claimed_component
    )
    if res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

@app.post("/api/marketplace/verify-pin")
def verify_handoff_pin(req: VerifyPinReq):
    res = db.verify_handoff_pin(item_id=req.item_id, entered_pin=req.entered_pin)
    if res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

@app.get("/api/user/portfolio/{user_id}")
def get_user_portfolio(user_id: str, email: Optional[str] = None, name: Optional[str] = None):
    return db.get_user_portfolio(user_id, email=email, name=name)

# --- AI Waste Scanner (Gemini 2.5 Flash Vision for Circular Economy) ---
@app.post("/api/ai/classify")
async def classify_waste(file: UploadFile = File(...)):
    contents = await file.read()
    mime_type = file.content_type or "image/jpeg"
    result = await gemini_service.classify_waste_image(contents, mime_type)
    return result

# --- Repair Before Replace Platform ---
@app.post("/api/repair/diagnose")
async def diagnose_repair(req: RepairDiagnoseReq):
    diagnosis = await gemini_service.diagnose_repair(req.device_name, req.symptom, req.device_category)
    return diagnosis

@app.get("/api/repair/tickets")
def get_repair_tickets(department: Optional[str] = None, user_id: Optional[str] = None):
    return db.get_repair_tickets(department=department, user_id=user_id)

@app.post("/api/repair/tickets")
def create_repair_ticket(ticket: Dict[str, Any]):
    return db.create_repair_ticket(ticket)

@app.post("/api/repair/tickets/{ticket_id}/resolve")
def resolve_repair_ticket(ticket_id: str, data: Dict[str, Any]):
    return db.resolve_repair_ticket(ticket_id, data)

# --- Lab Audits & Triage across CSE, Mech, Civil, EEE, IC ---
@app.get("/api/audits")
def get_audits():
    return db.get_lab_audits()

@app.post("/api/audits")
def create_audit(req: AuditCreate):
    return db.create_lab_audit(req.dict())

@app.get("/api/audits/analytics")
def get_audit_analytics():
    return db.get_audit_analytics()

@app.get("/api/inventory")
def get_inventory(department: Optional[str] = None):
    return db.get_dept_inventory(department=department)

@app.post("/api/inventory")
def upsert_inventory(item: InventoryItem):
    return db.upsert_inventory(item.dict())
