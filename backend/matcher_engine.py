"""
STRIDE Matcher Engine — Pure Python Keyword, Intent & Guardrail Engine
STRICTLY NO RAG / NO VECTOR DB / NO EMBEDDINGS
Precision Intent Routing: Conversational Memory, Sizing, Materials, Telemetry, Comparisons & Budgeting
Latency: < 2ms
"""

import re
from typing import Dict, List, Any, Optional, Tuple
from data_store import PRODUCTS, STORE_POLICIES, get_or_create_session

# Guardrail Patterns
INJECTION_TRIGGERS = [
    "ignore previous instructions",
    "ignore all previous",
    "system prompt",
    "system instructions",
    "developer mode",
    "act as",
    "jailbreak",
    "bypass",
    "dan mode",
    "reveal prompt",
    "what are your instructions",
    "print your rules"
]

OFF_TOPIC_KEYWORDS = [
    "python", "javascript", "java code", "c++", "write a code", "write a script", "debug this",
    "algorithm", "function", "programming", "sql query", "html boilerplate", "css fix",
    "politics", "politician", "prime minister", "president", "election", "parliament", "congress", "bjp",
    "recipe", "how to cook", "ingredients for", "bake a cake",
    "homework", "solve for x", "solve this math", "calculus", "algebra", "derivative",
    "movie review", "who acted in", "marvel", "cinema",
    "weather tomorrow", "forecast in", "temperature in",
    "diagnose", "medical advice", "headache cure", "symptoms of", "prescription",
    "legal advice", "lawsuit", "court",
    "amazon", "flipkart", "myntra", "nike direct", "adidas store"
]

POLICY_TRIGGERS = {
    "refund_return": ["refund", "return", "money back", "exchange policy", "return window", "take back", "reimburse"],
    "exchange_sizing": ["size", "sizing", "fit", "true to size", "uk 7", "uk 8", "uk 9", "uk 10", "uk 11", "half size", "narrow", "exchange size", "tight", "loose"],
    "shipping_delivery": ["shipping", "ship", "delivery", "dispatch", "courier", "express", "days", "when will it arrive", "bengaluru", "mumbai", "delhi", "metro", "pincode"],
    "cancellation": ["cancel", "cancellation", "abort order", "stop delivery"],
    "authenticity_legit_check": ["authentic", "authenticity", "fake", "real", "replica", "first copy", "legit", "nfc", "inspection", "uv", "certificate"],
    "payment_gst_cod": ["pay", "payment", "cod", "cash on delivery", "upi", "gpay", "phonepe", "emi", "gst", "discount", "promo", "coupon", "code", "stride10", "10%"]
}

POLICY_TITLES = {
    "refund_return": "7-Day Doorstep Returns & Refunds",
    "exchange_sizing": "Size & Fit Guidance (UK/India Sizing)",
    "shipping_delivery": "Express Air Shipping & Metro Delivery",
    "cancellation": "Order Cancellation Policy",
    "authenticity_legit_check": "12-Point UV & NFC Legit Check",
    "payment_gst_cod": "Payment Methods, UPI & 18% GST"
}

# ---------------------------------------------------------------
# Synonym / Alias Map: maps casual user terms -> canonical keywords
# that exist in product names, keywords arrays, or descriptions.
# This allows "cooling glasses" to match "sunglasses", "tshirt" to match "tee", etc.
# ---------------------------------------------------------------
SYNONYM_MAP = {
    # Sunglasses / Eyewear
    "cooling glasses": "sunglasses", "cooling glass": "sunglasses", "glasses": "sunglasses",
    "shades": "sunglasses", "goggles": "sunglasses", "eyewear": "sunglasses",
    "sunnies": "sunglasses", "glares": "sunglasses", "chasma": "sunglasses",
    "sun glass": "sunglasses", "sun glasses": "sunglasses",
    # Watch / Timepiece
    "watch": "watch", "watches": "watch", "timepiece": "watch", "wristwatch": "watch",
    "wrist watch": "watch", "chronograph": "watch", "chrono": "watch",
    # Bag / Sling
    "bag": "sling", "bags": "sling", "backpack": "sling", "sling bag": "sling",
    "crossbody": "sling", "cross body": "sling", "messenger bag": "sling",
    "fanny pack": "sling", "waist bag": "sling", "bum bag": "sling",
    "pouch": "sling", "edc bag": "sling", "carry bag": "sling",
    # T-shirt
    "tshirt": "tee", "tshirts": "tee", "t-shirt": "tee", "t shirt": "tee",
    "t-shirts": "tee", "t shirts": "tee", "tees": "tee",
    # Hoodie / Sweatshirt
    "hoodies": "hoodie", "sweatshirt": "hoodie", "sweatshirts": "hoodie",
    "pullover": "hoodie", "fleece": "hoodie",
    # Jacket / Outerwear
    "jackets": "jacket", "windbreaker": "jacket", "windbreakers": "jacket",
    "coat": "jacket", "outerwear": "jacket", "rain jacket": "jacket",
    # Cargo / Pants
    "cargos": "cargo", "pants": "cargo", "trousers": "cargo",
    "joggers": "cargo", "bottoms": "cargo", "lowers": "cargo",
    # Slide / Sandals
    "slides": "slide", "sandals": "slide", "flip flops": "slide",
    "slippers": "slide", "chappal": "slide", "chappals": "slide",
    # Boot / Trail
    "boots": "boot", "hiking boots": "boot", "trekking shoes": "boot",
    "trail shoes": "trail", "hiking shoes": "trail",
    # Sneakers / Shoes
    "shoes": "sneakers", "shoe": "sneakers", "kicks": "sneakers",
    "footwear": "sneakers", "trainers": "sneakers", "sport shoes": "sneakers",
    "sports shoes": "sneakers", "casual shoes": "sneakers",
    # Runners
    "running shoes": "runner", "running shoe": "runner",
    "jogging shoes": "runner", "marathon shoes": "runner",
}

def check_guardrails(query: str) -> Optional[str]:
    """
    Layer 1: Pre-LLM Deterministic Guardrail.
    Catches injections, off-topic domains, math expressions (e.g. 2+2), and trivia questions instantly (<1ms).
    """
    lower = query.lower().strip()

    # 1. Prompt Injection Block
    for trigger in INJECTION_TRIGGERS:
        if trigger in lower:
            return (
                "I'm calibrated specifically for STRIDE footwear, streetwear, and orders. "
                "How can I assist with your fit or drop today?"
            )

    # 2. Arithmetic / Math Block (e.g. "what is 2+2", "5 * 10", "15 + 30")
    if re.search(r'\b\d+\s*[\+\-\*\/\^%]\s*\d+\b', lower) or any(
        m in lower for m in ["2+2", "what is 2 + 2", "calculate", "solve math", "square root of", "plus", "minus", "divided by"]
    ):
        return (
            "I'm calibrated specifically for STRIDE footwear, streetwear, and orders. "
            "How can I assist with your fit or drop today?"
        )

    # 3. General Knowledge / Non-Fashion Trivia Block (e.g. "capital of India", "who is president", "tell me a joke")
    trivia_patterns = [
        r'\bcapital of\b',
        r'\bpresident of\b',
        r'\bprime minister\b',
        r'\bwho is\b',
        r'\bwho was\b',
        r'\btell me a joke\b',
        r'\bwrite a poem\b',
        r'\bweather in\b',
        r'\btranslate\b',
        r'\bpopulation of\b'
    ]
    for pat in trivia_patterns:
        if re.search(pat, lower):
            return (
                "I'm calibrated specifically for STRIDE footwear, streetwear, and orders. "
                "How can I assist with your fit or drop today?"
            )

    # 4. Off-Topic Domain Block
    for token in OFF_TOPIC_KEYWORDS:
        if token in lower:
            return (
                "I'm calibrated specifically for STRIDE footwear, streetwear, and orders. "
                "How can I assist with your fit or drop today?"
            )

    return None

def _expand_query_with_synonyms(raw_lower: str) -> str:
    """
    Expands the user query by appending canonical synonyms.
    e.g. "i want cooling glasses" -> "i want cooling glasses sunglasses"
    This enriches matching without altering the original query for display.
    """
    expanded_tokens = set()
    for alias, canonical in SYNONYM_MAP.items():
        if alias in raw_lower:
            expanded_tokens.add(canonical)
    if expanded_tokens:
        return raw_lower + " " + " ".join(expanded_tokens)
    return raw_lower


def extract_relevant_context(
    query: str, 
    session_id: str, 
    pinned_product_id: Optional[str] = None
) -> Tuple[Dict[str, Any], List[str], List[Dict[str, Any]]]:
    """
    Layer 2: Selective In-Memory Context Slicer & Intent Classifier.
    Extracts matched products, policies, user memory, and specific intents.
    Returns: (context_for_llm, badges_list, full_matched_products_for_ui)
    """
    raw_lower = query.lower().strip()
    clean_lower = re.sub(r'[^\w\s]', '', raw_lower).strip()
    # Expand with synonyms for richer matching
    expanded_lower = _expand_query_with_synonyms(raw_lower)
    tokens = set(re.findall(r'\b[a-z0-9\-]+\b', expanded_lower))

    session = get_or_create_session(session_id)
    context: Dict[str, Any] = {}
    badges: List[str] = []
    matched_products_for_ui: List[Dict[str, Any]] = []

    # -------------------------------------------------------------
    # 0. User Profile Memory (Name registration & recall)
    # -------------------------------------------------------------
    m_name = re.search(r'\b(?:my name is|i am|call me|name\'?s)\s+([A-Za-z]+)\b', raw_lower)
    if m_name:
        name_cand = m_name.group(1).capitalize()
        ignored = {"interested", "looking", "here", "stride", "asking", "buying", "cop", "a", "the", "not", "just", "someone"}
        if name_cand.lower() not in ignored:
            session.setdefault("user_profile", {})["name"] = name_cand

    is_asking_name = any(p in raw_lower for p in ["what is my name", "what's my name", "whats my name", "who am i", "do you know my name", "tell me my name", "my name?"])
    if is_asking_name:
        user_name = session.get("user_profile", {}).get("name")
        if user_name:
            context["intent"] = "user_name_recall"
            context["user_name"] = user_name
            badges.append("Memory: User Profile")
            return context, badges, matched_products_for_ui
        else:
            context["intent"] = "user_name_unknown"
            badges.append("Memory: User Profile")
            return context, badges, matched_products_for_ui

    # -------------------------------------------------------------
    # 1. Instant Greeting Detection (<1ms)
    # -------------------------------------------------------------
    greetings = {"hi", "hello", "hey", "sup", "yo", "good morning", "good evening", "namaste", "whats up", "what's up", "hi there", "hello there", "greetings"}
    if clean_lower in greetings or (re.match(r'^(hi|hello|hey|yo)\b', clean_lower) and len(clean_lower.split()) <= 3):
        context["intent"] = "greeting"
        if session.get("user_profile", {}).get("name"):
            context["user_name"] = session["user_profile"]["name"]
        badges.append("✦ AI Copilot")
        return context, badges, matched_products_for_ui

    # -------------------------------------------------------------
    # 2. Pinned Product Slicing (User clicked "✦ Ask AI" on a card)
    # -------------------------------------------------------------
    pinned_prod = None
    if pinned_product_id:
        for p in PRODUCTS:
            if p["id"].lower() == pinned_product_id.lower() or p["name"].lower() == pinned_product_id.lower():
                pinned_prod = p
                break
                
    if pinned_prod:
        matched_products_for_ui.append(pinned_prod)
        badges.append(f"Pinned: {pinned_prod['name']}")
        context["pinned_product"] = {
            "id": pinned_prod["id"],
            "name": pinned_prod["name"],
            "category": pinned_prod["category"],
            "price_inr": f"₹{pinned_prod['price_inr']:,}",
            "original_price_inr": f"₹{pinned_prod['original_price_inr']:,}",
            "sizes": pinned_prod["sizes"],
            "stock_count": pinned_prod["stock_count"],
            "material_grade": pinned_prod["telemetry"]["material_grade"],
            "cushion_score": pinned_prod["telemetry"]["cushion_score"],
            "durability_score": pinned_prod["telemetry"]["durability_score"],
            "weight_grams": pinned_prod["telemetry"]["weight_grams"],
            "description": pinned_prod["description"],
            "care_instructions": pinned_prod["care_instructions"]
        }

    # -------------------------------------------------------------
    # 3. Product Comparison Intent (e.g. "Monolith Foam Slide 02 or Apex Trail Boot")
    # -------------------------------------------------------------
    mentioned_prods = []
    for prod in PRODUCTS:
        # Match exact ID or significant name substring
        name_lower = prod["name"].lower()
        id_lower = prod["id"].lower()
        if id_lower in raw_lower or name_lower in raw_lower:
            if prod not in mentioned_prods:
                mentioned_prods.append(prod)
        else:
            # Check distinct model tokens
            key_tokens = [k for k in name_lower.split() if k not in ["the", "low", "high", "pro", "boot", "02"]]
            if any(k in raw_lower for k in key_tokens if len(k) > 4):
                if prod not in mentioned_prods:
                    mentioned_prods.append(prod)

    is_comparison_word = any(w in raw_lower for w in ["better", "compare", "difference", "vs", "versus", " or ", "which one", "recommend between"])
    if len(mentioned_prods) >= 2 and is_comparison_word:
        p1, p2 = mentioned_prods[0], mentioned_prods[1]
        context["intent"] = "compare_products"
        context["product_1"] = {
            "name": p1["name"],
            "price_inr": f"₹{p1['price_inr']:,}",
            "category": p1["category"],
            "cushion": f"{p1['telemetry']['cushion_score']}/100",
            "durability": f"{p1['telemetry']['durability_score']}/100",
            "weight": f"{p1['telemetry']['weight_grams']}g",
            "material": p1["telemetry"]["material_grade"],
            "description": p1["description"]
        }
        context["product_2"] = {
            "name": p2["name"],
            "price_inr": f"₹{p2['price_inr']:,}",
            "category": p2["category"],
            "cushion": f"{p2['telemetry']['cushion_score']}/100",
            "durability": f"{p2['telemetry']['durability_score']}/100",
            "weight": f"{p2['telemetry']['weight_grams']}g",
            "material": p2["telemetry"]["material_grade"],
            "description": p2["description"]
        }
        matched_products_for_ui.extend([p1, p2])
        badges.append(f"Compare: {p1['name']} vs {p2['name']}")
        return context, badges, matched_products_for_ui

    # -------------------------------------------------------------
    # 4. Sizing Inquiry Intent ("what sizes are available in footwear", "how does sizing run")
    # -------------------------------------------------------------
    is_sizing_query = any(w in raw_lower for w in [
        "what size", "what sizes", "which size", "sizes available", "available sizes",
        "sizes in footwear", "sizes do you have", "sizing in", "sizing run", "half size",
        "size up", "size down", "true to size", "tts", "sizing guide", "size options"
    ])
    if is_sizing_query:
        footwear_prods = [p for p in PRODUCTS if p["category"] in ["Sneakers", "Runners"]]
        context["intent"] = "footwear_sizing"
        context["sizes_available"] = ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]
        context["model_fits"] = [
            {"model": "Air Retro High 'Obsidian'", "fit": "Narrow toe box · Size up 0.5 for wide feet", "sizes": "UK 7-11"},
            {"model": "CloudNitro Carbon Pro", "fit": "True to size (TTS) with anatomical race snugness", "sizes": "UK 7-11"},
            {"model": "Vortex Low 'Sienna Craft'", "fit": "True to size (TTS) standard cupsole fit", "sizes": "UK 7-11"},
            {"model": "Monolith Foam Slide 02", "fit": "True to size (TTS) relaxed recovery contour", "sizes": "UK 7-11"},
            {"model": "Apex Trail Gore-Tex Boot", "fit": "True to size (TTS) accommodates thick trail socks", "sizes": "UK 7-11"}
        ]
        context["policy"] = "7-Day Free Instant Doorstep Size Exchange across India"
        matched_products_for_ui.extend(footwear_prods)
        badges.append("Footwear Sizing: UK 7 - UK 11")
        return context, badges, matched_products_for_ui

    # -------------------------------------------------------------
    # 5. Cushion & Telemetry Intent ("What is cushion of shoes?", "which shoe has highest cushion")
    # -------------------------------------------------------------
    is_cushion_query = any(w in raw_lower for w in [
        "cushion of shoes", "what is cushion", "cushion score", "cushioning", 
        "energy return", "cushion rating", "highest cushion", "best cushioning",
        "softest shoe", "cushion telemetry"
    ])
    if is_cushion_query:
        footwear_prods = [p for p in PRODUCTS if p["category"] in ["Sneakers", "Runners"]]
        context["intent"] = "cushion_telemetry"
        context["cushion_rankings"] = [
            {"model": "CloudNitro Carbon Pro", "cushion": "98/100", "tech": "Supercritical Nitrogen Foam + 3K Carbon Plate", "price": "₹9,499"},
            {"model": "Monolith Foam Slide 02", "cushion": "96/100", "tech": "High-Rebound Anatomical EVA Foam", "price": "₹3,499"},
            {"model": "Air Retro High 'Obsidian'", "cushion": "92/100", "tech": "Encapsulated Heel Air-Sole Cushioning", "price": "₹14,999"},
            {"model": "Apex Trail Gore-Tex Boot", "cushion": "91/100", "tech": "Multi-Density All-Terrain Trail Midsole", "price": "₹13,499"},
            {"model": "Vortex Low 'Sienna Craft'", "cushion": "89/100", "tech": "Dual-Density Rubber Shock Cupsole", "price": "₹11,299"}
        ]
        # Highlight top 2 cushioning shoes
        cushion_sorted = sorted(footwear_prods, key=lambda x: x["telemetry"]["cushion_score"], reverse=True)
        matched_products_for_ui.extend(cushion_sorted[:2])
        badges.append("Telemetry: Cushion Score 0-100")
        return context, badges, matched_products_for_ui

    # -------------------------------------------------------------
    # 6. Materials & Fabrics Intent ("What material is used in footwear", "what are shoes made of")
    # -------------------------------------------------------------
    is_material_query = any(w in raw_lower for w in [
        "what material", "what materials", "material is used", "materials used", 
        "what are shoes made of", "footwear materials", "leather used", "fabric used",
        "construction of shoes", "materials in footwear"
    ])
    if is_material_query:
        footwear_prods = [p for p in PRODUCTS if p["category"] in ["Sneakers", "Runners"]]
        context["intent"] = "footwear_materials"
        context["materials_breakdown"] = [
            {"model": "Air Retro High 'Obsidian'", "material": "Full-grain obsidian calfskin leather with encapsulated air-sole unit"},
            {"model": "CloudNitro Carbon Pro", "material": "Curved 3K carbon propulsion plate & supercritical nitrogen-infused foam"},
            {"model": "Vortex Low 'Sienna Craft'", "material": "Roughout sienna suede & breathable 1000D Cordura ballistic mesh"},
            {"model": "Monolith Foam Slide 02", "material": "Seamless injection-molded high-rebound anatomical EVA foam"},
            {"model": "Apex Trail Gore-Tex Boot", "material": "Waterproof Gore-Tex Invisible Fit membrane & Vibram Megagrip lugged rubber"}
        ]
        matched_products_for_ui.extend(footwear_prods[:3])
        badges.append("Telemetry: Materials & Build")
        return context, badges, matched_products_for_ui

    # -------------------------------------------------------------
    # 7. Seasonality & Weather Suitability ("streetwear is for all seasons or winter summer")
    # -------------------------------------------------------------
    is_seasonality_query = any(w in raw_lower for w in ["season", "seasons", "winter", "summer", "monsoon", "all season", "all-season", "weather", "hot", "cold"]) and any(
        s in raw_lower for s in ["streetwear", "hoodie", "jacket", "tee", "cargo", "clothes", "collection", "garment", "wear"]
    )
    if is_seasonality_query:
        streetwear_prods = [p for p in PRODUCTS if p["category"] == "Streetwear"]
        context["intent"] = "streetwear_seasonality"
        context["season_guide"] = {
            "all_season_overview": "Drop 04 Streetwear is engineered for 4-season modular layering across Indian microclimates.",
            "summer_hot_weather": [
                {"model": "Oversized Drop-Shoulder Tee", "spec": "280GSM breathable long-staple Indian Supima cotton keeps you cool in humid heat."},
                {"model": "Tactical Parachute Ripstop Cargos", "spec": "Lightweight breathable diamond ripstop with quick-drying Teflon coating."}
            ],
            "monsoon_rain": [
                {"model": "Structured Technical Coach Jacket", "spec": "Japanese Taslan matte nylon with DWR waterproof coating for downpours."}
            ],
            "winter_cold": [
                {"model": "Heavyweight 480GSM Box Hoodie", "spec": "High-density 480GSM loopback cotton French Terry for maximum thermal retention."}
            ]
        }
        matched_products_for_ui.extend(streetwear_prods)
        badges.append("Seasonality: All-Season Modular")
        return context, badges, matched_products_for_ui

    # -------------------------------------------------------------
    # 8. Budget / Price Ceiling Matching ("my budget is 7k which are best shoes?", "under 10k")
    # -------------------------------------------------------------
    price_ceiling = None
    price_match = re.search(r'(?:budget\s*(?:is|of)?|under|below|less than|within|max|up to|around|pricing less than)\s*(?:₹|rs\.?|inr)?\s*(\d+)(k)?', raw_lower)
    if price_match:
        val = int(price_match.group(1))
        if price_match.group(2) == 'k':
            val *= 1000
        price_ceiling = val

    if price_ceiling:
        shoe_terms = ["shoe", "shoes", "sneaker", "sneakers", "runner", "runners", "footwear", "slide", "kicks"]
        is_shoe_budget = any(s in raw_lower for s in shoe_terms) or not any(s in raw_lower for s in ["hoodie", "cargo", "tee", "streetwear", "watch", "sunglass"])
        
        pool = [p for p in PRODUCTS if p["category"] in ["Sneakers", "Runners"]] if is_shoe_budget else PRODUCTS
        under_budget = [p for p in pool if p["price_inr"] <= price_ceiling]
        
        context["intent"] = "budget_recommendation"
        context["budget_inr"] = price_ceiling
        context["category"] = "Footwear" if is_shoe_budget else "Catalog"
        context["under_budget_items"] = [
            {"name": p["name"], "price_inr": f"₹{p['price_inr']:,}", "subtitle": p["subtitle"], "cushion": f"{p['telemetry']['cushion_score']}/100"}
            for p in under_budget
        ]
        
        # Closest option if budget is lower than most items
        above_budget = [p for p in pool if p["price_inr"] > price_ceiling]
        if above_budget:
            closest = min(above_budget, key=lambda x: x["price_inr"])
            context["next_closest"] = {"name": closest["name"], "price_inr": f"₹{closest['price_inr']:,}", "with_discount": f"₹{int(closest['price_inr']*0.9):,}"}

        matched_products_for_ui.extend(under_budget)
        if not under_budget and above_budget:
            matched_products_for_ui.append(min(above_budget, key=lambda x: x["price_inr"]))

        badges.append(f"Budget: Under ₹{price_ceiling:,}")
        return context, badges, matched_products_for_ui

    # -------------------------------------------------------------
    # 8b. Cheapest / Most Affordable vs Premium / Most Expensive Intent
    # -------------------------------------------------------------
    is_cheapest_query = any(w in raw_lower for w in [
        "cheapest", "lowest price", "most affordable", "least expensive", "lowest cost",
        "cheaper", "pocket friendly", "budget friendly", "low price"
    ])
    if is_cheapest_query:
        is_shoe_specific = any(s in raw_lower for s in ["shoe", "shoes", "sneaker", "sneakers", "runner", "footwear", "slide", "kicks"])
        if is_shoe_specific:
            footwear_prods = [p for p in PRODUCTS if p["category"] in ["Sneakers", "Runners"]]
            sorted_footwear = sorted(footwear_prods, key=lambda x: x["price_inr"])
            cheapest_slide = sorted_footwear[0] # Monolith Slide ₹3,499
            cheapest_runner = [p for p in sorted_footwear if p["id"] == "STR-02"][0] # CloudNitro ₹9,499
            context["intent"] = "cheapest_product"
            context["category"] = "Footwear"
            context["cheapest_slide"] = {
                "name": cheapest_slide["name"],
                "price_inr": f"₹{cheapest_slide['price_inr']:,}",
                "subtitle": cheapest_slide["subtitle"],
                "cushion": f"{cheapest_slide['telemetry']['cushion_score']}/100"
            }
            context["cheapest_runner"] = {
                "name": cheapest_runner["name"],
                "price_inr": f"₹{cheapest_runner['price_inr']:,}",
                "subtitle": cheapest_runner["subtitle"],
                "cushion": f"{cheapest_runner['telemetry']['cushion_score']}/100"
            }
            matched_products_for_ui.extend([cheapest_slide, cheapest_runner])
            badges.append("Affordability: Most Accessible Footwear")
            return context, badges, matched_products_for_ui
        else:
            sorted_all = sorted(PRODUCTS, key=lambda x: x["price_inr"])
            context["intent"] = "cheapest_product"
            context["category"] = "All"
            context["top_affordable"] = [
                {"name": p["name"], "price_inr": f"₹{p['price_inr']:,}", "category": p["category"]}
                for p in sorted_all[:3]
            ]
            matched_products_for_ui.extend(sorted_all[:3])
            badges.append("Affordability: Lowest Price Pieces")
            return context, badges, matched_products_for_ui

    is_premium_query = any(w in raw_lower for w in [
        "most expensive", "highest price", "costliest", "priciest", "most premium",
        "top of the line", "flagship", "luxury", "high end"
    ])
    if is_premium_query:
        sorted_all = sorted(PRODUCTS, key=lambda x: x["price_inr"], reverse=True)
        context["intent"] = "premium_product"
        context["flagship_items"] = [
            {"name": p["name"], "price_inr": f"₹{p['price_inr']:,}", "category": p["category"], "material": p["telemetry"]["material_grade"]}
            for p in sorted_all[:3]
        ]
        matched_products_for_ui.extend(sorted_all[:3])
        badges.append("Archive: Flagship Silhouettes")
        return context, badges, matched_products_for_ui

    # -------------------------------------------------------------
    # 8c. Care, Cleaning & Washing Guidance Intent
    # -------------------------------------------------------------
    is_care_query = any(w in raw_lower for w in [
        "how to clean", "how to wash", "clean suede", "clean leather", "cleaning instructions",
        "washing instructions", "care instructions", "how to maintain", "washing", "laundry",
        "stain on", "dirty", "keep clean"
    ])
    if is_care_query:
        # Check if user mentioned a specific silhouette or material
        target_prod = None
        for p in PRODUCTS:
            p_name = p["name"].lower()
            p_mat = p["telemetry"]["material_grade"].lower()
            p_desc = p["description"].lower()
            if p["id"].lower() in raw_lower or p_name in raw_lower:
                target_prod = p
                break
            if "suede" in raw_lower and "suede" in p_mat:
                target_prod = p
                break
            if "hoodie" in raw_lower and "hoodie" in p_name:
                target_prod = p
                break
            if "jacket" in raw_lower and "jacket" in p_name:
                target_prod = p
                break
            if "watch" in raw_lower and "watch" in p_name:
                target_prod = p
                break
            if "slide" in raw_lower and "slide" in p_name:
                target_prod = p
                break
            if "gore-tex" in raw_lower or "boot" in raw_lower and "boot" in p_name:
                target_prod = p
                break
            if "tee" in raw_lower and "tee" in p_name:
                target_prod = p
                break

        if target_prod:
            context["intent"] = "care_instructions"
            context["target_product"] = {
                "name": target_prod["name"],
                "material": target_prod["telemetry"]["material_grade"],
                "care": target_prod["care_instructions"]
            }
            matched_products_for_ui.append(target_prod)
            badges.append(f"Care: {target_prod['name']}")
            return context, badges, matched_products_for_ui

    # -------------------------------------------------------------
    # 8d. Foot Shape & Orthopedic Fit (Wide Feet / Flat Feet / Arch Support)
    # -------------------------------------------------------------
    is_foot_shape_query = any(w in raw_lower for w in [
        "wide feet", "wide foot", "flat feet", "flat foot", "broad feet",
        "arch support", "plantar", "toe box", "wide toe"
    ])
    if is_foot_shape_query:
        footwear_prods = [p for p in PRODUCTS if p["category"] in ["Sneakers", "Runners"]]
        context["intent"] = "foot_shape_fit"
        context["shape_recommendations"] = {
            "wide_feet": "For wider feet, we advise sizing up 0.5 on the **Air Retro High 'Obsidian'** due to its tailored calfskin toe box. The **Apex Trail Boot** features an accommodating forefoot built for trail socks, and the **CloudNitro Carbon Pro** features an adaptable race knit.",
            "flat_feet_arch_support": "For flat feet or plantar relief, the **Monolith Foam Slide 02** features deep anatomical arch contouring and 96/100 cushion score for recovery. The **CloudNitro Carbon Pro** provides rigid longitudinal arch stability via its 3K carbon propulsion plate."
        }
        matched_products_for_ui.extend([p for p in footwear_prods if p["id"] in ["STR-01", "STR-02", "STR-04"]])
        badges.append("Fit: Foot Shape & Arch Support")
        return context, badges, matched_products_for_ui

    # -------------------------------------------------------------
    # 9. Explicit Full Category Listings (when user asks to list/show all models)
    # -------------------------------------------------------------
    is_explicit_list_shoes = bool(
        re.search(r'\b(list|show|browse|display)\b.*\b(all|every|different|full)?\s*(shoes|sneakers|runners|footwear|kicks)\b', raw_lower)
        or re.search(r'^\s*(all\s+shoes|list\s+shoes|show\s+shoes|shoes\s+collection|all\s+sneakers)\s*$', raw_lower)
        or re.search(r'\bwhat\s+(shoes|sneakers|runners|footwear)\s+(do you have|are available|are in stock)\b', raw_lower)
    )
    if is_explicit_list_shoes:
        footwear_prods = [p for p in PRODUCTS if p["category"] in ["Sneakers", "Runners"]]
        context["intent"] = "list_shoes"
        context["category_items"] = [
            {"id": p["id"], "name": p["name"], "subtitle": p["subtitle"], "category": p["category"], "price_inr": f"₹{p['price_inr']:,}"}
            for p in footwear_prods
        ]
        matched_products_for_ui.extend(footwear_prods)
        badges.append("Catalog: 5 Footwear Models")
        return context, badges, matched_products_for_ui

    is_explicit_list_streetwear = bool(
        re.search(r'\b(list|show|browse|display)\b.*\b(all|every|different|full)?\s*(streetwear|clothes|clothing|apparel|garments)\b', raw_lower)
        or re.search(r'^\s*(all\s+streetwear|list\s+streetwear|show\s+streetwear)\s*$', raw_lower)
    )
    if is_explicit_list_streetwear:
        streetwear_prods = [p for p in PRODUCTS if p["category"] == "Streetwear"]
        context["intent"] = "list_streetwear"
        context["category_items"] = [
            {"id": p["id"], "name": p["name"], "subtitle": p["subtitle"], "price_inr": f"₹{p['price_inr']:,}", "material": p["telemetry"]["material_grade"]}
            for p in streetwear_prods
        ]
        matched_products_for_ui.extend(streetwear_prods)
        badges.append("Catalog: 4 Streetwear Pieces")
        return context, badges, matched_products_for_ui

    is_explicit_list_accessories = bool(
        re.search(r'\b(list|show|browse|display)\b.*\b(all|every|different|full)?\s*(accessories|watches|sunglasses|slings|shades|eyewear)\b', raw_lower)
    )
    if is_explicit_list_accessories:
        acc_prods = [p for p in PRODUCTS if p["category"] == "Accessories"]
        context["intent"] = "list_accessories"
        context["category_items"] = [
            {"id": p["id"], "name": p["name"], "subtitle": p["subtitle"], "price_inr": f"₹{p['price_inr']:,}", "specs": p["telemetry"]["material_grade"]}
            for p in acc_prods
        ]
        matched_products_for_ui.extend(acc_prods)
        badges.append("Catalog: 3 Accessories")
        return context, badges, matched_products_for_ui

    # 9b. "List all products" / "What do you sell" / "Show everything"
    is_full_catalog_list = bool(
        re.search(r'\b(list|show|browse|display)\b.*\b(all|every|full|entire)\s*(products?|items?|collection|catalog|things)\b', raw_lower)
        or re.search(r'\bwhat\b.*\b(do you|does stride)\b.*\b(sell|have|offer|carry|stock)\b', raw_lower)
        or re.search(r'\b(show|list)\b.*\beverything\b', raw_lower)
        or re.search(r'\bwhat\b.*\b(all|products?|items?)\b.*\b(available|in stock|in store|on website|do you have)\b', raw_lower)
        or re.search(r'\bwhat all\b.*\b(do you have|is available|you sell|in your store|on your website)\b', raw_lower)
    )
    if is_full_catalog_list:
        context["intent"] = "list_full_catalog"
        context["catalog_summary"] = {
            "total_products": len(PRODUCTS),
            "categories": {
                "Footwear (Sneakers & Runners)": [
                    {"id": p["id"], "name": p["name"], "subtitle": p["subtitle"], "price_inr": f"₹{p['price_inr']:,}"}
                    for p in PRODUCTS if p["category"] in ["Sneakers", "Runners"]
                ],
                "Streetwear": [
                    {"id": p["id"], "name": p["name"], "subtitle": p["subtitle"], "price_inr": f"₹{p['price_inr']:,}"}
                    for p in PRODUCTS if p["category"] == "Streetwear"
                ],
                "Accessories": [
                    {"id": p["id"], "name": p["name"], "subtitle": p["subtitle"], "price_inr": f"₹{p['price_inr']:,}"}
                    for p in PRODUCTS if p["category"] == "Accessories"
                ]
            }
        }
        matched_products_for_ui.extend(PRODUCTS[:6])
        badges.append(f"Full Catalog: {len(PRODUCTS)} Products")
        return context, badges, matched_products_for_ui

    # -------------------------------------------------------------
    # 10. Store Policy Inquiries
    # -------------------------------------------------------------
    for policy_key, triggers in POLICY_TRIGGERS.items():
        if any(t in raw_lower for t in triggers):
            if policy_key in STORE_POLICIES:
                policy_text = STORE_POLICIES[policy_key]
                title = POLICY_TITLES.get(policy_key, "Store Policy")
                context["store_policy"] = {
                    "rule": policy_key,
                    "title": title,
                    "summary": policy_text,
                    "details": policy_text
                }
                badges.append(f"Policy: {title}")
                break

    # -------------------------------------------------------------
    # 11. Comprehensive Product Scoring Engine
    #     Checks: product ID, product name, keywords array, description,
    #     category aliases, and synonym-expanded tokens.
    # -------------------------------------------------------------
    scored_products = []
    for prod in PRODUCTS:
        if pinned_prod and prod["id"] == pinned_prod["id"]:
            continue
            
        score = 0

        # 11a. Exact product ID match (e.g., "str-01")
        if prod["id"].lower() in tokens or prod["id"].lower() in expanded_lower:
            score += 15

        # 11b. Full product name match
        if prod["name"].lower() in raw_lower:
            score += 12
        else:
            # Partial name token match (only tokens > 2 chars)
            for word in prod["name"].lower().split():
                if word in tokens and len(word) > 2:
                    score += 4

        # 11c. Keywords array match (the main fix — was completely missing before)
        for kw in prod.get("keywords", []):
            kw_lower = kw.lower()
            if kw_lower in tokens or kw_lower in expanded_lower:
                # Longer keyword matches are more significant
                if len(kw_lower) > 5:
                    score += 6
                elif len(kw_lower) > 3:
                    score += 4
                else:
                    score += 2

        # 11d. Style tags match (from telemetry)
        for tag in prod["telemetry"].get("style_tags", []):
            if tag.lower() in expanded_lower or tag.lower() in tokens:
                score += 5

        # 11e. Category-aware contextual boosters
        cat = prod["category"].lower()
        # Running / Marathon
        if any(r in expanded_lower for r in ["run", "running", "marathon", "jogging", "runner"]) and cat == "runners":
            score += 8
        # Carbon plate tech
        if "carbon" in expanded_lower and "carbon" in prod["description"].lower():
            score += 8
        # Trail / hiking / boot
        if any(t in expanded_lower for t in ["trail", "hiking", "trek", "boot", "boots"]) and ("trail" in prod["name"].lower() or "boot" in prod["name"].lower()):
            score += 8
        # Hoodie / sweatshirt
        if any(h in expanded_lower for h in ["hoodie", "hoodies", "sweatshirt", "pullover", "fleece"]) and "hoodie" in prod["name"].lower():
            score += 8
        # Cargo / pants / trousers
        if any(c in expanded_lower for c in ["cargo", "cargos", "pants", "trousers", "joggers"]) and "cargo" in prod["name"].lower():
            score += 8
        # Jacket / windbreaker / coat
        if any(j in expanded_lower for j in ["jacket", "jackets", "windbreaker", "coat", "outerwear"]) and "jacket" in prod["name"].lower():
            score += 8
        # Tee / t-shirt
        if any(t in expanded_lower for t in ["tee", "tshirt", "t-shirt"]) and "tee" in prod["name"].lower():
            score += 8
        # Watch / timepiece
        if any(w in expanded_lower for w in ["watch", "watches", "timepiece", "chronograph", "chrono"]) and "watch" in prod["name"].lower():
            score += 8
        # Sunglasses / shades / eyewear / goggles
        if any(s in expanded_lower for s in ["sunglasses", "shades", "eyewear", "goggles", "glasses"]) and "sunglasses" in prod["name"].lower():
            score += 8
        # Sling / bag / crossbody
        if any(b in expanded_lower for b in ["sling", "bag", "bags", "crossbody", "backpack", "pouch"]) and ("sling" in prod["name"].lower() or "crossbody" in prod["name"].lower()):
            score += 8
        # Slide / sandals / slippers
        if any(s in expanded_lower for s in ["slide", "slides", "sandals", "slippers", "chappal"]) and "slide" in prod["name"].lower():
            score += 8
        # Sneakers generic
        if any(s in expanded_lower for s in ["sneaker", "sneakers", "kicks", "shoe", "shoes"]) and cat == "sneakers":
            score += 3

        # 11f. Description keyword match (lower weight, broader reach)
        desc_lower = prod["description"].lower()
        for tok in tokens:
            if len(tok) > 4 and tok in desc_lower and tok not in {"want", "have", "need", "like", "looking", "about", "which", "where", "their", "there", "would", "could", "should"}:
                score += 2

        if score > 3:
            scored_products.append((score, prod))

    scored_products.sort(key=lambda x: x[0], reverse=True)
    top_prods = [p for _, p in scored_products[:3]]  # allow up to 3 matches

    if top_prods and "intent" not in context:
        context["matched_products"] = []
        for p in top_prods:
            if p not in matched_products_for_ui:
                matched_products_for_ui.append(p)
            badges.append(f"Product: {p['name']}")
            context["matched_products"].append({
                "id": p["id"],
                "name": p["name"],
                "category": p["category"],
                "price_inr": f"₹{p['price_inr']:,}",
                "material": p["telemetry"]["material_grade"],
                "cushion": f"{p['telemetry']['cushion_score']}/100",
                "durability": f"{p['telemetry']['durability_score']}/100",
                "sizes": p["sizes"],
                "description": p["description"]
            })

    # -------------------------------------------------------------
    # 12. Session Orders and Active Cart Context
    # -------------------------------------------------------------
    if any(k in raw_lower for k in ["order", "tracking", "status", "delivery status", "where is", "str-"]):
        order_match = re.search(r'str-\d{4}', raw_lower)
        target_order_id = order_match.group(0).upper() if order_match else None
        
        matched_order = None
        if target_order_id:
            for o in session.get("orders", []):
                if o["order_id"].upper() == target_order_id:
                    matched_order = o
                    break
        elif session.get("orders"):
            matched_order = session["orders"][-1]

        if matched_order:
            context["user_order_status"] = matched_order
            badges.append(f"Order: #{matched_order['order_id']}")

    if any(c in raw_lower for c in ["my cart", "my bag", "cart total", "in my cart", "in my bag", "checkout"]):
        if session.get("cart"):
            context["user_active_cart"] = session["cart"]
            badges.append(f"Bag: {len(session['cart'])} Items")

    # -------------------------------------------------------------
    # 13. "Not in catalog" fallback — if user asked to buy/want/need 
    #     something but nothing matched, tell them what we DO sell
    # -------------------------------------------------------------
    has_purchase_intent = bool(re.search(
        r'\b(buy|want|need|looking for|interested in|get|purchase|shop|give me|find me|i want|i need|do you sell|do you have|do you carry|do you stock|can i buy|can i get|are there|is there any|sell|stock)\b', 
        raw_lower
    ))
    if has_purchase_intent and not context.get("matched_products") and "intent" not in context and "store_policy" not in context:
        context["intent"] = "product_not_found"
        context["user_query"] = query
        context["available_categories"] = {
            "Footwear (Sneakers & Runners)": [p["name"] for p in PRODUCTS if p["category"] in ["Sneakers", "Runners"]],
            "Streetwear": [p["name"] for p in PRODUCTS if p["category"] == "Streetwear"],
            "Accessories": [p["name"] for p in PRODUCTS if p["category"] == "Accessories"]
        }
        badges.append("Catalog: No Match — Showing Alternatives")

    if not badges:
        badges.append("Catalog: Drop 04 General Query")

    return context, badges, matched_products_for_ui
