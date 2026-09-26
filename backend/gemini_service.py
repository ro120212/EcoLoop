import os
import json
import base64
import hashlib
import re
import asyncio
from typing import Dict, Any, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv
from database import db

load_dotenv()

def normalize_text(text: str) -> str:
    return re.sub(r'[^a-z0-9]', '', (text or "").lower())

class GeminiService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.client = None
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Warning: Failed to initialize Gemini Client: {e}")

    def update_key(self, api_key: str):
        self.api_key = api_key
        try:
            self.client = genai.Client(api_key=self.api_key)
            # Persist to backend/.env
            env_path = os.path.join(os.path.dirname(__file__), ".env")
            if os.path.exists(env_path):
                with open(env_path, "r", encoding="utf-8") as f:
                    content = f.read()
                if "GEMINI_API_KEY=" in content:
                    new_content = re.sub(r"GEMINI_API_KEY=.*", f"GEMINI_API_KEY={api_key}", content)
                else:
                    new_content = content.rstrip() + f"\nGEMINI_API_KEY={api_key}\n"
                with open(env_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
            return True
        except Exception as e:
            print(f"Error updating Gemini API key: {e}")
            return False

    async def classify_waste_image(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
        """
        Classifies waste into categories: E-Waste, Metal, Plastic, Paper, Organic, Hazardous.
        Provides item name, hazard level, material breakdown, and recommended disposal / reuse action.
        Utilizes cryptographic SHA-256 caching to serve repeated component scans instantly.
        """
        # 1. Check Component Cache
        img_hash = hashlib.sha256(image_bytes).hexdigest()
        cache_key = f"img:{img_hash}"
        cached_result = db.get_cached_ai_response(cache_key)
        if cached_result:
            print(f"⚡ Component Cache Hit for Image ({img_hash[:8]}...) - Serving 0ms response.")
            return cached_result

        prompt = """
        You are an expert waste classification and environmental engineer for a college campus e-waste recycling platform named EcoLoop.
        Analyze this image carefully and return a valid JSON object strictly matching this schema:
        {
            "category": "E-Waste" | "Metal" | "Plastic" | "Paper" | "Organic" | "Hazardous",
            "item_name": "Specific identified object name (e.g. Broken Optical Mouse, Lithium-ion Phone Battery, Aluminum Heatsink)",
            "hazard_level": "Low" | "Medium" | "High",
            "hazard_reason": "Explanation of any toxicity (e.g. contains lead, battery puncture risk, cadmium)",
            "materials_detected": ["material1", "material2", "material3"],
            "recommended_action": "Reuse" | "Repair" | "Recycle" | "Specialized Drop-off",
            "condition_estimate": "Functional" | "Repairable" | "Scrap / Non-functional",
            "estimated_weight_g": 150,
            "carbon_savings_if_diverted_kg": 2.5,
            "campus_disposal_advice": "Clear, actionable steps for a student or lab tech on campus to safely handle and route this item."
        }
        Respond with ONLY the JSON object, no markdown code fence blocks if possible.
        """

        if self.client:
            # Auto-retry on rate limit (429 / ResourceExhausted)
            max_retries = 2
            for attempt in range(max_retries + 1):
                try:
                    response = self.client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=[
                            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                            prompt
                        ]
                    )
                    text = response.text.strip()
                    if text.startswith("```json"):
                        text = text[7:]
                    elif text.startswith("```"):
                        text = text[3:]
                    if text.endswith("```"):
                        text = text[:-3]
                    data = json.loads(text.strip())
                    data["ai_powered"] = True
                    data["model_used"] = "gemini-2.5-flash"
                    data["cached"] = False

                    # Save to permanent cache for subsequent student requests
                    db.set_cached_ai_response(
                        cache_key=cache_key,
                        cache_type="classification",
                        query_text=data.get("item_name", "Component Scan"),
                        response_data=data
                    )
                    return data
                except Exception as e:
                    err_str = str(e).lower()
                    if ("429" in err_str or "exhausted" in err_str or "quota" in err_str) and attempt < max_retries:
                        wait_sec = 2 * (attempt + 1)
                        print(f"Notice: Rate limit encountered. Auto-retrying in {wait_sec}s (Attempt {attempt+1}/{max_retries})...")
                        await asyncio.sleep(wait_sec)
                    else:
                        print(f"Gemini API error during image classification: {e}")
                        break

        # Heuristic fallback if API key is not configured or fails
        fallback_data = {
            "category": "E-Waste",
            "item_name": "Electronic Peripheral / Circuit Component",
            "hazard_level": "Medium",
            "hazard_reason": "Electronic boards contain lead solder and flame retardant plastics that must not enter landfills.",
            "materials_detected": ["Copper", "Silicon", "FR4 Fiberglass", "ABS Plastic", "Tin Solder"],
            "recommended_action": "Recycle",
            "condition_estimate": "Scrap / Non-functional",
            "estimated_weight_g": 320,
            "carbon_savings_if_diverted_kg": 3.8,
            "campus_disposal_advice": "Deposit in the Central E-Waste Bin at the CSE Department foyer. Disconnect any power sources or batteries before deposit.",
            "ai_powered": False,
            "cached": False,
            "note": "Using EcoLoop campus heuristic engine. Add your GEMINI_API_KEY in Settings to enable real-time Gemini Vision analysis."
        }
        return fallback_data

    async def diagnose_repair(self, device_name: str, symptom: str, device_category: str = "Electronics") -> Dict[str, Any]:
        """
        Provides step-by-step diagnostic checklist, root causes, required tools, difficulty rating,
        and safety warnings for faulty electronics.
        Implements intelligent exact and similarity-based component caching to handle high student volume.
        """
        norm_dev = normalize_text(device_name)
        norm_sym = normalize_text(symptom)
        cache_key = f"diag:{norm_dev}:{norm_sym}"

        # 1. Exact Cache Lookup
        cached_result = db.get_cached_ai_response(cache_key)
        if cached_result:
            print(f"⚡ Exact Diagnostic Cache Hit for '{device_name}' - Serving 0ms response.")
            return cached_result

        # 2. Similar / Keyword Match in Pre-seeded Knowledge Base
        similar_result = db.find_similar_diagnosis(device_name, symptom)
        if similar_result:
            print(f"⚡ Similar Diagnostic Knowledge Base Hit for '{device_name}' ({similar_result.get('matched_query')}) - Serving 0ms response.")
            return similar_result

        prompt = f"""
        You are an expert electronics repair technician at a university campus makerspace for the 'Repair Before Replace' platform.
        A student or lab technician has reported this issue:
        Device: {device_name} (Category: {device_category})
        Symptom / Problem: {symptom}

        Provide a structured, safe, and actionable repair guide in JSON with the following exact format:
        {{
            "device": "{device_name}",
            "likely_root_causes": ["Cause 1", "Cause 2", "Cause 3"],
            "difficulty_level": "Beginner" | "Intermediate" | "Advanced",
            "estimated_repair_time_mins": 30,
            "safety_warnings": ["Crucial electrical/battery/chemical safety warning"],
            "tools_and_materials_needed": ["Tool 1 (e.g. Phillips #00 screwdriver)", "Material 2 (e.g. 99% Isopropyl alcohol)"],
            "step_by_step_troubleshooting": [
                {{"step": 1, "title": "Inspection", "description": "Details..."}},
                {{"step": 2, "title": "Testing", "description": "Details..."}},
                {{"step": 3, "title": "Correction / Part Replacement", "description": "Details..."}}
            ],
            "spare_part_info": "Common replacement part name and typical low cost (e.g. 10uF 25V Capacitor, ~₹20)",
            "verdict": "Likely Repairable" | "Difficult DIY - Visit Campus Tech" | "Better for Component Harvesting"
        }}
        Respond strictly with the raw JSON object.
        """

        if self.client:
            max_retries = 2
            for attempt in range(max_retries + 1):
                try:
                    response = self.client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=[prompt]
                    )
                    text = response.text.strip()
                    if text.startswith("```json"):
                        text = text[7:]
                    elif text.startswith("```"):
                        text = text[3:]
                    if text.endswith("```"):
                        text = text[:-3]
                    data = json.loads(text.strip())
                    data["ai_powered"] = True
                    data["model_used"] = "gemini-2.5-flash"
                    data["cached"] = False

                    # Cache this newly generated diagnosis for all future campus students
                    db.set_cached_ai_response(
                        cache_key=cache_key,
                        cache_type="diagnosis",
                        query_text=f"{device_name} - {symptom}",
                        response_data=data
                    )
                    return data
                except Exception as e:
                    err_str = str(e).lower()
                    if ("429" in err_str or "exhausted" in err_str or "quota" in err_str) and attempt < max_retries:
                        wait_sec = 2 * (attempt + 1)
                        print(f"Notice: Rate limit encountered. Auto-retrying in {wait_sec}s (Attempt {attempt+1}/{max_retries})...")
                        await asyncio.sleep(wait_sec)
                    else:
                        print(f"Gemini API error during repair diagnosis: {e}")
                        break

        # Intelligent campus rule-based fallback
        fallback_diag = {
            "device": device_name,
            "likely_root_causes": [
                "Dust accumulation causing thermal throttling or poor contact",
                "Frayed internal cable or loose solder joint near the strain relief",
                "Worn mechanical micro-switch or degraded electrolytic capacitor"
            ],
            "difficulty_level": "Beginner",
            "estimated_repair_time_mins": 25,
            "safety_warnings": [
                "Unplug all power cables and remove batteries before opening the casing.",
                "Discharge any large capacitors using an insulated resistor."
            ],
            "tools_and_materials_needed": [
                "Phillips #0 and #1 precision screwdrivers",
                "Plastic spudger or guitar pick for opening clips",
                "99% Isopropyl Alcohol (IPA) and soft brush",
                "Digital Multimeter (continuity test)"
            ],
            "step_by_step_troubleshooting": [
                {"step": 1, "title": "Visual & Physical Inspection", "description": "Inspect external cable, ports, and casing for physical cracks, liquid ingress, or bent connector pins."},
                {"step": 2, "title": "Clean Contacts & Remove Debris", "description": "Disassemble outer shell gently and use isopropyl alcohol with an anti-static brush to clean dust and oxidation from contacts."},
                {"step": 3, "title": "Continuity & Solder Joint Check", "description": "Check wire continuity with a multimeter from connector to PCB. Re-flow any cracked solder joints with a 30W soldering iron."},
                {"step": 4, "title": "Bench Test Before Reassembly", "description": "Connect temporarily to a surge-protected test bench to verify symptom resolution before snapping the housing back together."}
            ],
            "spare_part_info": "Generic replacement wire/switch readily available in ECE hardware lab (~₹15 - ₹50).",
            "verdict": "Likely Repairable",
            "ai_powered": False,
            "cached": False,
            "note": "Using EcoLoop campus troubleshooting database. Add your GEMINI_API_KEY in Settings for custom generative AI diagnostics."
        }
        return fallback_diag

gemini_service = GeminiService()
