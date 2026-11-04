"""
STRIDE Backend — FastAPI Application with Low-Latency In-Memory Architecture
"""

import time
import random
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, Query, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from data_store import (
    PRODUCTS, 
    STORE_POLICIES, 
    HERO_TELEMETRY, 
    SESSION_STORE, 
    get_or_create_session
)
from matcher_engine import check_guardrails, extract_relevant_context
from llm_service import query_llm_or_fallback

app = FastAPI(
    title="STRIDE E-Commerce API",
    description="High-Editorial Men's Sneakers & Streetwear E-Commerce Backend",
    version="1.0.0"
)

# Enable CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Request Models ---
class ChatRequest(BaseModel):
    query: str
    session_id: str = "default-guest"
    pinned_product_id: Optional[str] = None

class SessionSyncRequest(BaseModel):
    session_id: str
    cart: List[Dict[str, Any]] = []
    orders: List[Dict[str, Any]] = []

class OrderItem(BaseModel):
    id: str
    name: str
    size: str
    price_inr: int
    quantity: int = 1
    image_url: Optional[str] = None

class PlaceOrderRequest(BaseModel):
    session_id: str
    items: List[OrderItem]
    shipping_city: str
    shipping_address: str
    payment_method: str
    promo_code: Optional[str] = None

class RotationBuildRequest(BaseModel):
    budget_inr: int = 15000
    style_vibe: str = "Monochrome Street"  # "Monochrome Street", "Marathon & Recovery", "Boardroom to Afterhours"


# --- API Routes ---

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "STRIDE API", "market": "India (INR)"}

@app.get("/api/bootstrap")
async def bootstrap(session_id: str = Query("default-guest")):
    """
    Returns products, policies summary, hero telemetry, and session cart/orders in a single fast call (<5ms).
    """
    session_data = get_or_create_session(session_id)
    return {
        "products": PRODUCTS,
        "policies": STORE_POLICIES,
        "hero_telemetry": HERO_TELEMETRY,
        "session": {
            "session_id": session_id,
            "cart": session_data.get("cart", []),
            "orders": session_data.get("orders", [])
        }
    }

@app.get("/api/products")
async def get_products(category: Optional[str] = None):
    if category and category.lower() != "all":
        return [p for p in PRODUCTS if p["category"].lower() == category.lower()]
    return PRODUCTS

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    for p in PRODUCTS:
        if p["id"].lower() == product_id.lower():
            return p
    raise HTTPException(status_code=404, detail="Product not found")

@app.post("/api/session/sync")
async def sync_session(req: SessionSyncRequest):
    """
    Synchronizes cart and orders between frontend sessionStorage and backend SESSION_STORE.
    """
    session_data = get_or_create_session(req.session_id)
    session_data["cart"] = req.cart
    if req.orders:
        session_data["orders"] = req.orders
    return {"status": "synced", "cart_count": len(session_data["cart"]), "orders_count": len(session_data["orders"])}

@app.post("/api/orders/place")
async def place_order(req: PlaceOrderRequest):
    """
    Generates a realistic order (#STR-XXXX) with GST breakdown, delivery ETA, and NFC tracking.
    Persists immediately in SESSION_STORE for immediate Concierge chatbot awareness.
    """
    session_data = get_or_create_session(req.session_id)
    
    subtotal = sum(item.price_inr * item.quantity for item in req.items)
    discount = int(subtotal * 0.10) if req.promo_code and req.promo_code.upper() == "STRIDE10" else 0
    taxable = max(0, subtotal - discount)
    gst_inr = int(taxable * 0.18 / 1.18)  # Inclusive 18% GST calculation
    total_inr = taxable

    order_num = random.randint(7000, 9999)
    order_id = f"STR-{order_num}"
    city_code = req.shipping_city[:3].upper() if req.shipping_city else "IND"
    nfc_id = f"NFC-{order_num}-{city_code}-01"

    new_order = {
        "order_id": order_id,
        "items": [item.model_dump() for item in req.items],
        "subtotal_inr": subtotal,
        "discount_inr": discount,
        "gst_inr": gst_inr,
        "total_inr": total_inr,
        "shipping_city": req.shipping_city,
        "shipping_address": req.shipping_address,
        "payment_method": req.payment_method,
        "status": f"Confirmed — Packing at {req.shipping_city} Hub",
        "delivery_eta": "Tomorrow by 2:00 PM IST" if req.shipping_city in ["Bengaluru", "Mumbai", "Delhi NCR"] else "Within 2 business days",
        "placed_at": time.strftime("%Y-%m-%dT%H:%M:%S+05:30"),
        "nfc_id": nfc_id
    }

    session_data["orders"].append(new_order)
    # Clear active cart after placing order
    session_data["cart"] = []

    return {
        "order": new_order,
        "message": f"Order #{order_id} placed successfully and logged with NFC batch {nfc_id}."
    }

@app.post("/api/rotation/build")
async def build_rotation(req: RotationBuildRequest):
    """
    Unique Feature 2: Curates a 3-piece rotation (1 Footwear + 1 Streetwear + 1 Accessory)
    within the chosen INR budget, optimizing for synergy score and aesthetic balance.
    """
    footwear_pool = [p for p in PRODUCTS if p["category"] in ["Sneakers", "Runners"]]
    streetwear_pool = [p for p in PRODUCTS if p["category"] == "Streetwear"]
    accessory_pool = [p for p in PRODUCTS if p["category"] == "Accessories"]

    best_combo = None
    min_diff = float("inf")

    # Filter or prioritize based on vibe
    if req.style_vibe == "Monochrome Street":
        # Prioritize Obsidian / Vortex, Charcoal Box Hoodie, Parachute Cargos, Kuro shades
        vibe_pref_ids = {"STR-01", "STR-03", "STR-06", "STR-07", "STR-11", "STR-12"}
    elif req.style_vibe == "Marathon & Recovery":
        # Prioritize CloudNitro Pro / Monolith Slide, Supima Tee, Titanium Watch
        vibe_pref_ids = {"STR-02", "STR-04", "STR-08", "STR-10", "STR-12"}
    else:  # "Boardroom to Afterhours"
        # Vortex Low, Coach Jacket, Titanium Watch, Supima Tee
        vibe_pref_ids = {"STR-03", "STR-09", "STR-10", "STR-11"}

    candidates = []
    for f in footwear_pool:
        for s in streetwear_pool:
            for a in accessory_pool:
                total_cost = f["price_inr"] + s["price_inr"] + a["price_inr"]
                if total_cost <= req.budget_inr:
                    # Preference bonus
                    bonus = sum(1 for item in [f, s, a] if item["id"] in vibe_pref_ids)
                    effective_diff = (req.budget_inr - total_cost) - (bonus * 1200)
                    candidates.append((effective_diff, total_cost, [f, s, a]))

    if not candidates:
        # If budget is tight, pick the absolute lowest combination
        cheapest_f = min(footwear_pool, key=lambda x: x["price_inr"])
        cheapest_s = min(streetwear_pool, key=lambda x: x["price_inr"])
        cheapest_a = min(accessory_pool, key=lambda x: x["price_inr"])
        total_cost = cheapest_f["price_inr"] + cheapest_s["price_inr"] + cheapest_a["price_inr"]
        chosen = [cheapest_f, cheapest_s, cheapest_a]
    else:
        candidates.sort(key=lambda x: x[0])
        _, total_cost, chosen = candidates[0]

    original_total = sum(p["original_price_inr"] for p in chosen)
    savings = original_total - total_cost
    avg_cushion = sum(p["telemetry"]["cushion_score"] for p in chosen) / 3
    avg_durability = sum(p["telemetry"]["durability_score"] for p in chosen) / 3
    synergy_score = round((avg_cushion * 0.45 + avg_durability * 0.55), 1)

    return {
        "vibe": req.style_vibe,
        "budget_inr": req.budget_inr,
        "total_inr": total_cost,
        "original_total_inr": original_total,
        "savings_inr": savings,
        "synergy_score": synergy_score,
        "rotation_items": chosen,
        "telemetry_summary": {
            "cushion_index": round(avg_cushion, 1),
            "durability_index": round(avg_durability, 1),
            "total_weight_grams": sum(p["telemetry"]["weight_grams"] for p in chosen)
        }
    }

@app.post("/api/chat")
async def chat_concierge(req: ChatRequest):
    """
    Unique Feature 1: Dual-Mode Contextual AI Concierge
    Runs: Guardrails (Layer 1) -> In-Memory Slicer (Layer 2) -> LLM/Fallback
    Returns structured markdown, spoken text for sweet female TTS, matched products, and followup suggestions.
    """
    start_time = time.time()
    
    # Layer 1: Pre-LLM Deterministic Guardrails (<1ms)
    guardrail_violation = check_guardrails(req.query)
    if guardrail_violation:
        elapsed_ms = int((time.time() - start_time) * 1000)
        return {
            "reply_markdown": guardrail_violation,
            "spoken_text": "I am the STRIDE concierge, here to help with sneaker sizing, outfit rotations, and your orders.",
            "matched_products": [],
            "suggested_followups": [
                "What is your return policy?",
                "Which sneaker is best for marathon running?",
                "How does sizing run on the Air Retro High?"
            ],
            "context_used_badges": ["Guardrail: Off-Topic Filter"],
            "latency_ms": elapsed_ms
        }

    # Layer 2: Selective Context Slicing (<1ms)
    context, badges, matched_products_ui = extract_relevant_context(
        req.query, 
        req.session_id, 
        req.pinned_product_id
    )

    session_data = get_or_create_session(req.session_id)
    history = session_data.get("history", [])

    # Layer 3: Low-Latency Inference or Smart Fallback (with Multi-Turn History)
    reply_md, spoken_text = await query_llm_or_fallback(req.query, context, history)

    # Persist in Conversational Memory
    session_data.setdefault("history", []).append({"role": "user", "content": req.query})
    session_data["history"].append({"role": "assistant", "content": reply_md})
    if len(session_data["history"]) > 16:
        session_data["history"] = session_data["history"][-16:]

    # Generate smart follow-up suggestions dynamically
    followups = []
    intent = context.get("intent")
    if intent == "user_name_recall":
        followups = [
            "What shoes do you recommend for my style?",
            "What sizes are available in footwear?",
            "What is STRIDE's 7-day return policy?"
        ]
    elif intent == "footwear_sizing":
        followups = [
            "How does the Air Retro High fit for wide feet?",
            "Can I exchange sizes if it doesn't fit?",
            "Which shoe has the highest cushion score?"
        ]
    elif intent == "compare_products":
        followups = [
            "What sizes are available in both pairs?",
            "How does pricing compare with code STRIDE10?",
            "What is the delivery time to Bengaluru?"
        ]
    elif intent == "cushion_telemetry":
        followups = [
            "Compare CloudNitro Carbon Pro vs Monolith Slide",
            "Which shoe is best for marathon running?",
            "What sizes are in stock for CloudNitro?"
        ]
    elif intent == "footwear_materials":
        followups = [
            "What sizes are available in footwear?",
            "Which shoe is best for monsoon rain?",
            "How do I verify the encrypted NFC chip?"
        ]
    elif intent == "streetwear_seasonality":
        followups = [
            "What are the specs of the 480GSM Box Hoodie?",
            "Build a ₹15,000 rotation with this streetwear",
            "What are the cargo pant waist sizes?"
        ]
    elif intent == "budget_recommendation":
        followups = [
            "Can I use code STRIDE10 for an extra 10% off?",
            "What sizes are available for the Monolith Slide?",
            "Show me top streetwear under ₹5,000"
        ]
    elif intent == "greeting":
        followups = [
            "List all shoes",
            "What sizes are available in footwear?",
            "What is STRIDE's 7-day return policy?"
        ]
    elif intent == "list_shoes":
        followups = [
            "Which shoe has the highest energy return cushioning?",
            "What sizes are available in footwear?",
            "Compare Monolith Foam Slide vs Apex Trail"
        ]
    elif intent == "list_streetwear":
        followups = [
            "Is streetwear for all seasons or winter only?",
            "What is the GSM density of the Box Hoodie?",
            "Build a ₹15k rotation with this streetwear"
        ]
    elif intent == "cheapest_product":
        followups = [
            "Can I apply code STRIDE10 on the Monolith Slide?",
            "What sizes are in stock for the Monolith Slide?",
            "Compare Monolith Slide vs CloudNitro Carbon Pro"
        ]
    elif intent == "premium_product":
        followups = [
            "What sizes are available in Air Retro High?",
            "How do I verify the encrypted NFC authenticity tag?",
            "What is the return policy on limited high-tops?"
        ]
    elif intent == "care_instructions":
        followups = [
            "How does sizing run on this piece?",
            "What is STRIDE's 7-day return policy?",
            "Can I exchange sizes if it does not fit?"
        ]
    elif intent == "foot_shape_fit":
        followups = [
            "What sizes are available in Air Retro High?",
            "What is STRIDE's 7-day size exchange policy?",
            "Which shoe has the highest cushion score?"
        ]
    elif intent == "list_full_catalog":
        followups = [
            "Which shoe is best for marathon running?",
            "What is your most affordable streetwear piece?",
            "How does standard UK sizing work?"
        ]
    elif intent == "product_not_found":
        followups = [
            "List all products in Drop 04",
            "Show me limited edition sneakers",
            "What accessories do you have?"
        ]
    elif "pinned_product" in context:
        p_name = context["pinned_product"]["name"]
        followups = [
            f"How does {p_name} fit compared to true to size?",
            f"What is the return policy if {p_name} does not fit?",
            "Can I apply code STRIDE10 on this item?"
        ]
    elif "matched_products" in context and context["matched_products"]:
        p_first = context["matched_products"][0]["name"]
        followups = [
            f"Compare {p_first} cushioning telemetry",
            "What is the delivery time to Bengaluru?",
            "Build a ₹15,000 streetwear rotation with this"
        ]
    elif "store_policies" in context:
        followups = [
            "How do I initiate a size exchange?",
            "Show limited edition sneakers under ₹15,000",
            "Track my latest order"
        ]
    else:
        followups = [
            "Show me top running sneakers with carbon plate",
            "What are the specs of the 480GSM Box Hoodie?",
            "What is STRIDE's 7-day return policy?"
        ]

    elapsed_ms = int((time.time() - start_time) * 1000)

    return {
        "reply_markdown": reply_md,
        "spoken_text": spoken_text,
        "matched_products": matched_products_ui,
        "suggested_followups": followups,
        "context_used_badges": badges if badges else ["Catalog: Drop 04 General Query"],
        "latency_ms": elapsed_ms
    }
