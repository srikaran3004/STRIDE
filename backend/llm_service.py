"""
STRIDE LLM Service — Async Company Gen_AI Engine Client with Resilient Fallback
Precision Multi-Turn Conversation Memory, Ultra-Low Latency (< 1.5s) & Editorial Formatting
"""

import os
import json
import logging
import httpx
from typing import Dict, List, Any, Tuple, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("stride.llm")
logging.basicConfig(level=logging.INFO)

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://openai.Gen_AI.engine.Company.com/v1").rstrip("/")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-flash-lite")

PLACEHOLDER_KEYS = {
    "",
    "your_Company_Gen_AI_engine_api_key_here",
    "your_actual_key_here",
    "your_api_key_here"
}

# Cached resolved model
CACHED_MODEL_ID: Optional[str] = None

SYSTEM_PROMPT = """You are STRIDE Copilot, the AI stylist and support specialist for STRIDE India (Sneakers, Runners, Streetwear & Accessories).
STRICT RULES:
1. Answer in 2 to 4 concise sentences or a compact 2-3 bullet list. Never write long essays or repetitive paragraphs.
2. FORMATTING: DO NOT use markdown headers with hash symbols like ### or ##. Use clean bold titles like **Title**.
3. Keep answers punchy, editorial, and direct. Quote prices in Indian Rupees (₹).
4. If the user asks about anything outside STRIDE products, orders, sizing, or policies, politely state you only assist with STRIDE.
5. If the user mentions their name, remember it and address them warmly by name.
6. At the very end of your response, add a separator "---VOICE---" followed by a single brief, natural spoken sentence (no markdown symbols) for a female voice assistant to read aloud.
"""

# Reusable Async Client with keep-alive
client = httpx.AsyncClient(timeout=10.0)

async def resolve_available_model(api_key: str) -> str:
    """Auto-detects the fastest, lowest-cost chat model from Company Gen_AI Engine."""
    global CACHED_MODEL_ID
    if CACHED_MODEL_ID:
        return CACHED_MODEL_ID

    configured = os.getenv("LLM_MODEL", LLM_MODEL).strip()
    try:
        headers = {"Authorization": f"Bearer {api_key}"}
        resp = await client.get(f"{LLM_BASE_URL}/models", headers=headers, timeout=4.0)
        if resp.status_code == 200:
            data = resp.json()
            available = [m.get("id", "") for m in data.get("data", [])]
            
            # 1. If configured model is in available, use it directly
            if configured in available:
                CACHED_MODEL_ID = configured
                logger.info(f"Using configured Company model: {CACHED_MODEL_ID}")
                return CACHED_MODEL_ID

            # 2. Prefer fast, ultra-low-cost models from user catalog
            fast_priority = [
                "gemini-2.5-flash-lite",
                "zai.glm-4.7-flash",
                "gemini-2.5-flash",
                "openai.gpt-5-nano",
                "claude-haiku-5-5",
                "google.gemma-3-12b-it"
            ]
            for candidate in fast_priority:
                for m in available:
                    if candidate.lower() in m.lower():
                        CACHED_MODEL_ID = m
                        logger.info(f"Resolved fast low-cost model: {CACHED_MODEL_ID}")
                        return CACHED_MODEL_ID
    except Exception as e:
        logger.warning(f"Could not resolve models dynamically: {e}")

    CACHED_MODEL_ID = configured
    return CACHED_MODEL_ID

def generate_smart_fallback(query: str, context: Dict[str, Any]) -> Tuple[str, str]:
    """
    Zero-Crash Local Deterministic Generator.
    Synthesizes clean editorial markdown and natural voice text instantly (<1ms).
    """
    raw_lower = query.lower()
    intent = context.get("intent")

    # 0. User Profile Memory (Name Recall)
    if intent == "user_name_recall":
        user_name = context.get("user_name", "Friend")
        md = f"Your name is **{user_name}**! How can I assist with your STRIDE fit, footwear, or active drop today?"
        voice = f"Your name is {user_name}! How can I assist you with STRIDE today?"
        return md, voice

    if intent == "user_name_unknown":
        md = "I don't have your name on record yet! What should I call you?"
        voice = "I don't have your name on record yet! What should I call you?"
        return md, voice

    # 1. Instant Warm Greeting
    if intent == "greeting":
        user_name = context.get("user_name")
        if user_name:
            md = f"Hello **{user_name}**! Welcome back to **STRIDE**. Looking for sizing advice, runner specs, or our latest Drop 04 pieces? Ask away."
            voice = f"Hello {user_name}! Welcome back to STRIDE. How can I help you today?"
        else:
            md = "Hello! Welcome to **STRIDE**. Looking for sizing advice, runner specs, or our latest Drop 04 pieces? Ask away."
            voice = "Hello! Welcome to STRIDE. How can I assist with your fit or order today?"
        return md, voice

    # 2. Footwear Sizing Inquiry ("what sizes are available in footwear")
    if intent == "footwear_sizing":
        md = (
            "All STRIDE footwear is offered in standard Indian/UK sizing from **UK 7 to UK 11**:\n\n"
            "- **True to size (TTS)**: CloudNitro Carbon Pro, Vortex Low, and Monolith Slide.\n"
            "- **Size up 0.5**: For the Air Retro High if you have wider feet due to the narrow leather toe box.\n"
            "- **Trail socks**: The Apex Trail Boot fits true to size even with thicker wool socks.\n\n"
            "*We offer 7-day free instant doorstep size exchanges across India if you need a different fit!*"
        )
        voice = "All STRIDE footwear is available in UK sizes 7 through 11. Most models fit true to size, and we offer free 7-day doorstep size exchanges."
        return md, voice

    # 3. Product Comparison ("which is better in quality Monolith Foam Slide 02 or Apex Trail Boot")
    if intent == "compare_products":
        p1 = context["product_1"]
        p2 = context["product_2"]
        md = (
            f"Both silhouettes are crafted with archival-grade materials for completely different use cases:\n\n"
            f"- **{p1['name']}** ({p1['price_inr']}):\n"
            f"  Cushioning: **{p1['cushion']}** · Durability: **{p1['durability']}** · Weight: {p1['weight']}\n"
            f"  Build: {p1['material']} — *{p1['description']}*\n\n"
            f"- **{p2['name']}** ({p2['price_inr']}):\n"
            f"  Cushioning: **{p2['cushion']}** · Durability: **{p2['durability']}** · Weight: {p2['weight']}\n"
            f"  Build: {p2['material']} — *{p2['description']}*\n\n"
            f"**Recommendation**: For maximum outdoor durability and monsoon weather, choose the **{p2['name'] if 'Apex' in p2['name'] else p1['name']}**. For recovery, arch relief, and everyday comfort, choose the **{p1['name'] if 'Monolith' in p1['name'] else p2['name']}**."
        )
        voice = f"For rugged all-weather durability, the Apex Trail is best with 99 durability. For everyday recovery comfort, the Monolith Slide delivers superior 96 cushion score."
        return md, voice

    # 4. Cushion Telemetry ("What is cushion of shoes?")
    if intent == "cushion_telemetry":
        rankings = context.get("cushion_rankings", [])
        lines = [
            "In STRIDE telemetry, **Cushion Score (0–100)** measures lab-tested energy return and shock attenuation:\n"
        ]
        for r in rankings:
            lines.append(f"- **{r['model']}**: **{r['cushion']}** ({r['tech']}) — {r['price']}")
        lines.append("\nWhich specific model or activity (running, casual, or trail) would you like to explore?")
        md = "\n".join(lines)
        voice = "Our highest cushioning model is the CloudNitro Carbon Pro at 98 out of 100, followed by the Monolith Slide at 96. Which pair would you like to explore?"
        return md, voice

    # 5. Footwear Materials Inquiry ("What material is used in footwear")
    if intent == "footwear_materials":
        breakdown = context.get("materials_breakdown", [])
        lines = ["STRIDE footwear uses performance-calibrated archival materials across all models:\n"]
        for b in breakdown:
            lines.append(f"- **{b['model']}**: {b['material']}")
        lines.append("\n*Every pair is UV-audited and fitted with an encrypted STRIDE NFC authenticity chip.*")
        md = "\n".join(lines)
        voice = "Our footwear uses materials from full-grain calfskin and 3K carbon plates to waterproof Gore-Tex and high-rebound EVA foam."
        return md, voice

    # 6. Seasonality & Weather Suitability ("streetwear is for all seasons or only winter summer")
    if intent == "streetwear_seasonality":
        md = (
            "STRIDE Drop 04 Streetwear is engineered for **all-season modular versatility** across India's varied climates:\n\n"
            "- **Summer & High Heat**: The **Oversized Graphic Tee** (280GSM breathable Supima cotton) and **Tactical Parachute Cargos** (lightweight breathable diamond ripstop) keep you cool.\n"
            "- **Monsoon & Rain**: The **Structured Technical Coach Jacket** features Japanese Taslan matte nylon with DWR waterproof coating for heavy downpours.\n"
            "- **Winter & Cold**: The **Heavyweight 480GSM Box Hoodie** is cut from ultra-dense French Terry loopback cotton for substantial thermal warmth."
        )
        voice = "Our streetwear is engineered for all seasons: lightweight Supima tees and ripstop cargos for summer, plus waterproof coach jackets and heavyweight 480GSM hoodies for monsoon and winter."
        return md, voice

    # 7. Budget / Price Ceiling Recommendation ("my budget is 7k which are best shoes?")
    if intent == "budget_recommendation":
        ceiling = context.get("budget_inr", 7000)
        items = context.get("under_budget_items", [])
        next_closest = context.get("next_closest")

        if items:
            lines = [f"With a **₹{ceiling:,} budget**, here is your best option in Drop 04:\n"]
            for idx, item in enumerate(items, 1):
                lines.append(f"{idx}. **{item['name']}** — **{item['price_inr']}** ({item['subtitle']} · Cushion {item['cushion']})")
            if next_closest:
                lines.append(f"\n*Next step up*: **{next_closest['name']}** at {next_closest['price_inr']} ({next_closest['with_discount']} using code **STRIDE10**).")
            md = "\n".join(lines)
            voice = f"Within a {ceiling} rupee budget, the Monolith Foam Slide at 3,499 is your best pick. The CloudNitro Carbon Pro runner is available with code STRIDE10 for 8,549."
            return md, voice
        else:
            closest_text = f" Our most accessible model is the **{next_closest['name']}** at **{next_closest['price_inr']}**." if next_closest else ""
            md = f"We currently don't have footwear below **₹{ceiling:,}**.{closest_text}\n\nWould you like recommendations in our accessories collection or code **STRIDE10** for 10% off?"
            voice = f"We don't have footwear below {ceiling} rupees. Our closest option is the Monolith Foam Slide at 3,499."
            return md, voice

    # 8. Broad Footwear / Shoes Listing ("list me all the different shoes in our website")
    if intent == "list_shoes":
        items = context.get("category_items", [])
        lines = ["Here are the **5 footwear models** in our **Drop 04** collection:\n"]
        for idx, item in enumerate(items, 1):
            lines.append(f"{idx}. **{item['name']}** — **{item['price_inr']}** ({item.get('subtitle', item['category'])})")
        lines.append("\nAsk about sizing, cushion telemetry, or fit comparison for any pair!")
        md = "\n".join(lines)
        voice = "We currently have five footwear models in Drop 04, from the CloudNitro marathon runner to the Air Retro High Obsidian. Which style would you like to explore?"
        return md, voice

    # 9. Broad Streetwear Listing
    if intent == "list_streetwear":
        items = context.get("category_items", [])
        lines = ["Here is the complete **Drop 04 Heavyweight Streetwear** lineup:\n"]
        for idx, item in enumerate(items, 1):
            lines.append(f"{idx}. **{item['name']}** — **{item['price_inr']}** ({item.get('material', 'Heavyweight Cotton')})")
        lines.append("\nCrafted with architectural boxy silhouettes and reinforced double-needle hems.")
        md = "\n".join(lines)
        voice = "Our streetwear collection includes four heavyweight garments, highlighted by our 480GSM box hoodie and parachute cargos."
        return md, voice

    # 10. Broad Accessories Listing
    if intent == "list_accessories":
        items = context.get("category_items", [])
        lines = ["Here are our **Drop 04 Technical Accessories & EDC**:\n"]
        for idx, item in enumerate(items, 1):
            lines.append(f"{idx}. **{item['name']}** — **{item['price_inr']}** ({item.get('specs', 'EDC Grade')})")
        md = "\n".join(lines)
        voice = "We carry three technical accessories, including our titanium field chronograph and the Fidlock magnetic crossbody sling."
        return md, voice

    # 10b. Full Catalog Listing ("list all products", "what do you sell")
    if intent == "list_full_catalog":
        summary = context.get("catalog_summary", {})
        categories = summary.get("categories", {})
        total = summary.get("total_products", 12)
        lines = [f"We currently carry **{total} curated items** across 3 categories in **Drop 04**:\n"]

        for cat_name, items in categories.items():
            lines.append(f"**{cat_name}**:")
            for item in items:
                lines.append(f"- {item['name']} — {item['price_inr']} ({item.get('subtitle', '')})")
            lines.append("")

        lines.append("Use code **STRIDE10** for 10% off your first order with free express shipping!")
        md = "\n".join(lines)
        voice = f"We carry {total} curated products across footwear, streetwear, and accessories. Ask about any category for details!"
        return md, voice

    # 10c. Product Not Found Fallback ("i want to buy caps")
    if intent == "product_not_found":
        available = context.get("available_categories", {})
        lines = ["We don't currently carry that specific item, but here's what we have in **Drop 04**:\n"]
        for cat_name, product_names in available.items():
            lines.append(f"**{cat_name}**: {', '.join(product_names)}")
        lines.append("\nWould any of these interest you? Use code **STRIDE10** for 10% off your first order!")
        md = "\n".join(lines)
        voice = "We don't carry that item right now, but we have sneakers, runners, streetwear, and accessories. Can I help with any of those?"
        return md, voice

    # 10d. Cheapest / Most Affordable Products
    if intent == "cheapest_product":
        if context.get("category") == "Footwear":
            slide = context["cheapest_slide"]
            runner = context["cheapest_runner"]
            md = (
                f"Our most affordable footwear option in Drop 04 is the **{slide['name']}** at **{slide['price_inr']}** "
                f"({slide['subtitle']} · Cushion {slide['cushion']}).\n\n"
                f"If you're looking for a performance runner, our lowest priced model is the **{runner['name']}** at **{runner['price_inr']}** "
                f"({runner['subtitle']} · Cushion {runner['cushion']}).\n\n"
                f"*Use code **STRIDE10** to get 10% off your first order!*"
            )
            voice = f"Our most affordable footwear is the Monolith Foam Slide at {slide['price_inr']}, and our lowest priced runner is the CloudNitro Carbon Pro at {runner['price_inr']}."
            return md, voice
        else:
            affordable = context.get("top_affordable", [])
            lines = ["Here are our most accessible pieces in Drop 04:\n"]
            for idx, item in enumerate(affordable, 1):
                lines.append(f"{idx}. **{item['name']}** — **{item['price_inr']}** ({item['category']})")
            lines.append("\nApply code **STRIDE10** at checkout for an instant 10% discount!")
            md = "\n".join(lines)
            voice = f"Our lowest priced item is the Oversized Graphic Tee at 1,899, followed by the Fidlock Crossbody Sling at 2,999."
            return md, voice

    # 10e. Flagship / Premium Products
    if intent == "premium_product":
        flagships = context.get("flagship_items", [])
        lines = ["Here are STRIDE's top-tier archival pieces in Drop 04:\n"]
        for idx, item in enumerate(flagships, 1):
            lines.append(f"{idx}. **{item['name']}** — **{item['price_inr']}** ({item['category']})\n   *{item.get('material', 'Archival Build')}*")
        lines.append("\nAll limited silhouettes ship with an encrypted STRIDE NFC authenticity tag and undergo 12-point UV inspection.")
        md = "\n".join(lines)
        voice = "Our pinnacle silhouette is the Air Retro High Obsidian at 14,999, followed by the Apex Trail Gore-Tex Boot at 13,499."
        return md, voice

    # 10f. Care & Cleaning Instructions
    if intent == "care_instructions":
        target = context.get("target_product", {})
        md = (
            f"**Care & Maintenance for {target.get('name', 'STRIDE Gear')}:**\n\n"
            f"• **Material Grade**: {target.get('material', 'Archival Spec')}\n"
            f"• **Cleaning Guide**: {target.get('care', 'Spot clean with mild damp cloth. Air dry away from direct sunlight.')}\n\n"
            f"*Never machine dry or expose technical footwear to high-heat radiators.*"
        )
        voice = f"For {target.get('name')}, {target.get('care')}"
        return md, voice

    # 10g. Foot Shape & Orthopedic Fit Guidance
    if intent == "foot_shape_fit":
        recs = context.get("shape_recommendations", {})
        md = (
            "**STRIDE Foot Shape & Fit Recommendations:**\n\n"
            f"• **Wide Feet**: {recs.get('wide_feet')}\n\n"
            f"• **Flat Feet & Arch Support**: {recs.get('flat_feet_arch_support')}\n\n"
            "*Remember, all footwear comes with 7-day free instant doorstep size exchange across India.*"
        )
        voice = "For wide feet, size up half a size on the Air Retro High. For flat feet or arch relief, the Monolith Slide offers 96 cushion contouring."
        return md, voice

    # 11. Policy query
    if "store_policy" in context:
        rule = context["store_policy"]
        md = f"**{rule['title']}**\n\n{rule['summary']}"
        voice = rule["summary"]
        return md, voice

    # 12. Pinned or single product query
    if "pinned_product" in context:
        p = context["pinned_product"]
        md = (
            f"Here are the editorial specs for **{p['name']}**:\n\n"
            f"- **Price**: {p['price_inr']} (Original: ~~{p['original_price_inr']}~~)\n"
            f"- **Category & Fit**: {p['category']} · Sizes: {', '.join(p['sizes'])}\n"
            f"- **Telemetry**: Cushioning **{p['cushion_score']}/100** · Durability **{p['durability_score']}/100** · Weight **{p['weight_grams']}g**\n"
            f"- **Stock Status**: {p['stock_count']} pairs remaining in Mumbai & Bengaluru hubs\n\n"
            f"*{p['description']}*"
        )
        voice = f"The {p['name']} is priced at {p['price_inr']} with an energy return rating of {p['cushion_score']} out of 100."
        return md, voice

    # 13. Matched products from specific search
    if "matched_products" in context and len(context["matched_products"]) > 0:
        prods = context["matched_products"]
        lines = [f"I matched **{len(prods)} item(s)** from our collection:\n"]
        for p in prods:
            lines.append(
                f"- **{p['name']}** ({p['price_inr']}) — {p['category']}\n"
                f"  Material: {p.get('material', 'Technical')} · Cushion: {p.get('cushion', '90/100')}\n"
                f"  Available Sizes: {', '.join(p.get('sizes', []))}"
            )
        lines.append("\nUse code **STRIDE10** for 10% off your first checkout with free express shipping.")
        md = "\n".join(lines)
        voice = f"I found {len(prods)} matching pieces from our collection, including {prods[0]['name']} at {prods[0]['price_inr']}."
        return md, voice

    # 14. Order tracking
    if "user_order_status" in context:
        latest = context["user_order_status"]
        items_desc = ", ".join([f"{item['name']} ({item['size']})" for item in latest["items"]])
        md = (
            f"**Order #{latest['order_id']} Status:**\n\n"
            f"- **Status**: `{latest['status'].upper()}`\n"
            f"- **Item(s)**: {items_desc}\n"
            f"- **Order Total**: ₹{latest['total_inr']:,} ({latest['payment_method']})\n"
            f"- **Destination**: {latest['shipping_city']}\n"
            f"- **Estimated Delivery**: **{latest['delivery_eta']}**\n"
            f"- **NFC Batch**: `{latest.get('nfc_id', 'NFC-PENDING')}`"
        )
        voice = f"Your order #{latest['order_id']} is confirmed and packing at our Bengaluru hub. Estimated delivery is {latest['delivery_eta']}."
        return md, voice

    # Default welcoming response
    md = (
        "Welcome to **STRIDE Copilot ✦**.\n\n"
        "Ask me about sizing, materials, cushion telemetry, outfit rotations, or store policies."
    )
    voice = "Welcome to STRIDE. How can I assist with your footwear, streetwear, or order today?"
    return md, voice

async def query_llm_or_fallback(
    query: str,
    context: Dict[str, Any],
    history: Optional[List[Dict[str, str]]] = None
) -> Tuple[str, str]:
    """
    Executes fast Company LLM inference with multi-turn conversation memory.
    Deterministic fast-path for recognized intents (<1ms).
    """
    api_key = os.getenv("LLM_API_KEY", LLM_API_KEY).strip()
    intent = context.get("intent")

    # Fast-path: Greetings, name recalls, sizing guides, comparisons, cushion telemetry, materials, seasonality, and budgets
    deterministic_intents = {
        "user_name_recall", "user_name_unknown", "greeting", "footwear_sizing", 
        "compare_products", "cushion_telemetry", "footwear_materials", 
        "streetwear_seasonality", "budget_recommendation", "list_shoes", 
        "list_streetwear", "list_accessories", "list_full_catalog", "product_not_found",
        "cheapest_product", "premium_product", "care_instructions", "foot_shape_fit"
    }
    if intent in deterministic_intents:
        logger.info(f"Instant in-memory synthesis for intent: {intent}")
        return generate_smart_fallback(query, context)
    
    # Check if placeholder or missing
    if api_key in PLACEHOLDER_KEYS or not api_key:
        logger.info("Using smart local fallback (LLM_API_KEY is placeholder or unconfigured).")
        return generate_smart_fallback(query, context)

    # Format compact context & prompt
    context_str = json.dumps(context, indent=2)
    user_prompt = f"[RELEVANT STORE CONTEXT]:\n{context_str}\n\n[USER QUERY]:\n{query}"

    try:
        model_to_use = await resolve_available_model(api_key)
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Build multi-turn conversational messages list
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        if history:
            # Include recent turns (last 6 items = 3 back-and-forth pairs)
            for turn in history[-6:]:
                messages.append({
                    "role": turn.get("role", "user"),
                    "content": turn.get("content", "")
                })
        messages.append({"role": "user", "content": user_prompt})

        payload = {
            "model": model_to_use,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 180
        }

        resp = await client.post(
            f"{LLM_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=5.0
        )

        if resp.status_code == 200:
            result = resp.json()
            raw_text = result["choices"][0]["message"]["content"]
            
            # Split by "---VOICE---"
            if "---VOICE---" in raw_text:
                parts = raw_text.split("---VOICE---")
                reply_md = parts[0].strip()
                voice_text = parts[1].strip()
            else:
                reply_md = raw_text.strip()
                voice_text = reply_md.split("\n")[0].replace("*", "").replace("#", "").strip()

            return reply_md, voice_text

        logger.warning(f"Company LLM returned status {resp.status_code}: {resp.text}. Falling back.")
        return generate_smart_fallback(query, context)

    except Exception as e:
        logger.warning(f"Company LLM call exception: {e}. Falling back safely.")
        return generate_smart_fallback(query, context)
