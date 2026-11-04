"""
STRIDE Data Store — Seeded In-Memory Catalog, Policies & Session State
"""

from typing import Dict, List, Any

# Curated High-Resolution Unsplash Images (reliable sneaker and menswear photography)
PRODUCTS: List[Dict[str, Any]] = [
    {
        "id": "STR-01",
        "name": "Air Retro High 'Obsidian'",
        "subtitle": "Limited Edition Leather High-Top",
        "category": "Sneakers",
        "price_inr": 14999,
        "original_price_inr": 17999,
        "sizes": ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
        "stock_count": 8,
        "rating": 4.95,
        "hype_delta": "+18.4% demand",
        "telemetry": {
            "cushion_score": 92,
            "durability_score": 96,
            "weight_grams": 420,
            "material_grade": "Full-Grain Obsidian Calfskin & Air-Sole Unit",
            "trend_points": [32, 45, 62, 78, 88, 98]
        },
        "image_url": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80",
        "description": "Hand-stitched obsidian and sail leather silhouette with encapsulated air sole cushioning and encrypted STRIDE NFC heel counter for instant authenticity verification.",
        "care_instructions": "Spot clean with gentle sneaker foaming cleanser. Do not machine wash. Store with cedar shoe trees.",
        "keywords": ["air", "retro", "high", "obsidian", "sneakers", "leather", "high-top", "str-01", "jordan", "dunk", "limited", "hype"]
    },
    {
        "id": "STR-02",
        "name": "CloudNitro Carbon Pro",
        "subtitle": "Marathon Carbon-Plate Runner",
        "category": "Runners",
        "price_inr": 9499,
        "original_price_inr": 11999,
        "sizes": ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
        "stock_count": 14,
        "rating": 4.92,
        "hype_delta": "+24.8% marathoners",
        "telemetry": {
            "cushion_score": 98,
            "durability_score": 88,
            "weight_grams": 198,
            "material_grade": "Curved 3K Carbon Plate & Supercritical Nitrogen Foam",
            "trend_points": [40, 52, 68, 74, 91, 99]
        },
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
        "description": "Ultra-lightweight marathon racer powered by dual-density supercritical nitrogen foam and a full-length 3K carbon propulsion plate for maximum energy return.",
        "care_instructions": "Wipe with damp microfibre cloth. Air dry away from direct tropical sunlight.",
        "keywords": ["cloudnitro", "carbon", "pro", "runner", "running", "marathon", "lightweight", "nitro", "str-02", "race", "energy return"]
    },
    {
        "id": "STR-03",
        "name": "Vortex Low 'Sienna Craft'",
        "subtitle": "Suede & Ballistic Mesh Low-Top",
        "category": "Sneakers",
        "price_inr": 11299,
        "original_price_inr": 13499,
        "sizes": ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
        "stock_count": 11,
        "rating": 4.88,
        "hype_delta": "+14.2% editorial",
        "telemetry": {
            "cushion_score": 89,
            "durability_score": 93,
            "weight_grams": 360,
            "material_grade": "Roughout Sienna Suede & 1000D Cordura Mesh",
            "trend_points": [28, 41, 55, 69, 82, 94]
        },
        "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80",
        "description": "Tactile warm sienna roughout suede balanced by breathable 1000D ballistic mesh panelling on a sculpted dual-density rubber cupsole.",
        "care_instructions": "Use brass suede brush to maintain nap. Treat with water-repellent protector spray.",
        "keywords": ["vortex", "low", "sienna", "craft", "suede", "mesh", "sneakers", "str-03", "low-top", "brown", "earth"]
    },
    {
        "id": "STR-04",
        "name": "Monolith Foam Slide 02",
        "subtitle": "Sculpted EVA Recovery Slide",
        "category": "Sneakers",
        "price_inr": 3499,
        "original_price_inr": 4499,
        "sizes": ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
        "stock_count": 22,
        "rating": 4.79,
        "hype_delta": "+32.1% recovery",
        "telemetry": {
            "cushion_score": 96,
            "durability_score": 84,
            "weight_grams": 165,
            "material_grade": "Monolithic Bio-Based Injected EVA Compound",
            "trend_points": [50, 61, 72, 85, 92, 97]
        },
        "image_url": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80",
        "description": "Injection-molded monolithic recovery slide with anatomical arch contouring and deep tread grooves for everyday ease and post-run rejuvenation.",
        "care_instructions": "Hand wash with cold soapy water. Avoid leaving in hot cars or direct boiling sun to prevent shrinkage.",
        "keywords": ["monolith", "foam", "slide", "slides", "sandals", "recovery", "eva", "comfort", "str-04", "cheap", "summer"]
    },
    {
        "id": "STR-05",
        "name": "Apex Trail Gore-Tex Boot",
        "subtitle": "All-Terrain Waterproof Sneakerboot",
        "category": "Runners",
        "price_inr": 13499,
        "original_price_inr": 15999,
        "sizes": ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
        "stock_count": 6,
        "rating": 4.97,
        "hype_delta": "+19.0% monsoon",
        "telemetry": {
            "cushion_score": 91,
            "durability_score": 99,
            "weight_grams": 445,
            "material_grade": "Gore-Tex Invisible Fit Membrane & Vibram Megagrip",
            "trend_points": [30, 48, 59, 75, 87, 95]
        },
        "image_url": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=80",
        "description": "Technical weatherproof hybrid engineered with Gore-Tex breathable lining, Vibram Megagrip lugged outsoles, and rapid-cinch cordlock lacing for monsoon and alpine trails.",
        "care_instructions": "Rinse mud under cold tap. Reapply DWR waterproofing spray seasonally.",
        "keywords": ["apex", "trail", "boot", "gore-tex", "waterproof", "sneakerboot", "vibram", "str-05", "monsoon", "hiking", "runners"]
    },
    {
        "id": "STR-06",
        "name": "Heavyweight 480GSM Box Hoodie",
        "subtitle": "Vintage Washed Charcoal Fleece",
        "category": "Streetwear",
        "price_inr": 3999,
        "original_price_inr": 4999,
        "sizes": ["S", "M", "L", "XL"],
        "stock_count": 18,
        "rating": 4.91,
        "hype_delta": "+27.5% essential",
        "telemetry": {
            "cushion_score": 95,
            "durability_score": 97,
            "weight_grams": 790,
            "material_grade": "480GSM 100% Combed Cotton French Terry",
            "trend_points": [44, 55, 70, 81, 90, 96]
        },
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
        "description": "Substantial 480GSM loopback cotton hoodie with double-needle drop shoulder construction, blind hem pocket, and pre-shrunk vintage mineral wash.",
        "care_instructions": "Machine wash cold inside out with like darks. Hang dry flat to preserve boxy silhouette.",
        "keywords": ["heavyweight", "480gsm", "hoodie", "box", "streetwear", "charcoal", "fleece", "sweatshirt", "str-06", "oversized"]
    },
    {
        "id": "STR-07",
        "name": "Tactical Parachute Ripstop Cargos",
        "subtitle": "8-Pocket Articulated Fit in Olive/Black",
        "category": "Streetwear",
        "price_inr": 4299,
        "original_price_inr": 5499,
        "sizes": ["S", "M", "L", "XL"],
        "stock_count": 12,
        "rating": 4.86,
        "hype_delta": "+16.8% techwear",
        "telemetry": {
            "cushion_score": 82,
            "durability_score": 98,
            "weight_grams": 510,
            "material_grade": "Tear-Resistant Diamond Ripstop with Teflon Shield",
            "trend_points": [35, 48, 63, 76, 85, 93]
        },
        "image_url": "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=900&q=80",
        "description": "Ergonomically articulated cargo trousers featuring 8 expandable bellows pockets, magnetic storm flaps, and bungee hem toggles to cinch over high-top sneakers.",
        "care_instructions": "Gentle cycle cold. Fasten all snaps and hook-and-loop closures before laundering.",
        "keywords": ["tactical", "parachute", "ripstop", "cargos", "cargo", "pants", "streetwear", "str-07", "olive", "pockets"]
    },
    {
        "id": "STR-08",
        "name": "Oversized Drop-Shoulder Graphic Tee",
        "subtitle": "280GSM Combed Supima Cotton",
        "category": "Streetwear",
        "price_inr": 1899,
        "original_price_inr": 2499,
        "sizes": ["S", "M", "L", "XL"],
        "stock_count": 30,
        "rating": 4.82,
        "hype_delta": "+38.0% volume",
        "telemetry": {
            "cushion_score": 87,
            "durability_score": 92,
            "weight_grams": 310,
            "material_grade": "280GSM Long-Staple Indian Supima Cotton",
            "trend_points": [52, 64, 75, 83, 94, 98]
        },
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
        "description": "Heavyweight architectural t-shirt tailored with dropped armholes, 1.2-inch thick ribbed collar that never sags, and subtle tonal back telemetry typography.",
        "care_instructions": "Cold gentle machine wash. Do not iron directly on graphic discharge print.",
        "keywords": ["oversized", "tee", "t-shirt", "graphic", "280gsm", "supima", "cotton", "streetwear", "str-08", "cheap", "tshirt"]
    },
    {
        "id": "STR-09",
        "name": "Structured Technical Coach Jacket",
        "subtitle": "Water-Repellent Matte Nylon",
        "category": "Streetwear",
        "price_inr": 5499,
        "original_price_inr": 6999,
        "sizes": ["S", "M", "L", "XL"],
        "stock_count": 9,
        "rating": 4.93,
        "hype_delta": "+15.3% layering",
        "telemetry": {
            "cushion_score": 80,
            "durability_score": 95,
            "weight_grams": 460,
            "material_grade": "Japanese Taslan Matte Nylon with DWR Coating",
            "trend_points": [26, 39, 58, 71, 84, 92]
        },
        "image_url": "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80",
        "description": "Minimalist coach jacket cut from crisp matte Japanese nylon. Features gunmetal snap closures, internal chest passport pocket, and elasticized cuffs.",
        "care_instructions": "Wipe clean with moist sponge or machine wash cold gentle. Do not tumble dry.",
        "keywords": ["structured", "technical", "coach", "jacket", "windbreaker", "nylon", "outerwear", "streetwear", "str-09", "layering"]
    },
    {
        "id": "STR-10",
        "name": "Chrono-01 Brushed Titanium Watch",
        "subtitle": "Sapphire Crystal Minimalist Field Watch",
        "category": "Accessories",
        "price_inr": 12999,
        "original_price_inr": 14999,
        "sizes": ["One Size (40mm)"],
        "stock_count": 7,
        "rating": 4.96,
        "hype_delta": "+21.2% collectors",
        "telemetry": {
            "cushion_score": 75,
            "durability_score": 99,
            "weight_grams": 68,
            "material_grade": "Grade 2 Sandblasted Titanium & Anti-Reflective Sapphire",
            "trend_points": [38, 49, 64, 79, 89, 97]
        },
        "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80",
        "description": "Featherlight 68g field chronograph encased in aerospace titanium with scratchproof double-domed sapphire crystal and 100M water resistance.",
        "care_instructions": "Rinse in freshwater after saltwater exposure. Wipe casing with jewellery polishing cloth.",
        "keywords": ["chrono", "titanium", "watch", "timepiece", "accessories", "sapphire", "str-10", "field watch", "chronograph"]
    },
    {
        "id": "STR-11",
        "name": "Acetate Frame 'Kuro' Sunglasses",
        "subtitle": "Polarized UV400 Japanese Acetate",
        "category": "Accessories",
        "price_inr": 4499,
        "original_price_inr": 5499,
        "sizes": ["One Size (51-20-145)"],
        "stock_count": 15,
        "rating": 4.84,
        "hype_delta": "+19.7% summer",
        "telemetry": {
            "cushion_score": 70,
            "durability_score": 94,
            "weight_grams": 42,
            "material_grade": "Custom 8mm Takiron Japanese Cellulose Acetate",
            "trend_points": [41, 53, 67, 80, 88, 95]
        },
        "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
        "description": "Architectural square silhouette sculpted from hand-beveled Japanese black acetate with 5-barrel custom hinges and Category 3 polarized grey lenses.",
        "care_instructions": "Clean lenses with included microfiber cloth. Store in magnetic hard case.",
        "keywords": ["acetate", "kuro", "sunglasses", "shades", "eyewear", "accessories", "polarized", "uv400", "str-11"]
    },
    {
        "id": "STR-12",
        "name": "Ballistic Nylon Crossbody Sling",
        "subtitle": "Fidlock Magnetic Buckle Tech Bag",
        "category": "Accessories",
        "price_inr": 2999,
        "original_price_inr": 3799,
        "sizes": ["One Size (3.5L)"],
        "stock_count": 25,
        "rating": 4.89,
        "hype_delta": "+33.4% edc",
        "telemetry": {
            "cushion_score": 86,
            "durability_score": 97,
            "weight_grams": 280,
            "material_grade": "1680D Ballistic Cordura with German Fidlock V-Buckle",
            "trend_points": [45, 59, 73, 84, 93, 99]
        },
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
        "description": "Ergonomic 3.5-litre daily carry pack fitted with instantaneous Fidlock magnetic V-buckle, YKK Aquaguard weather zippers, and padded tablet partition.",
        "care_instructions": "Spot clean exterior using mild detergent and soft bristle brush.",
        "keywords": ["ballistic", "nylon", "crossbody", "sling", "bag", "fidlock", "accessories", "edc", "techwear", "str-12"]
    }
]

# Granular Store Policies for Keyword Matching
STORE_POLICIES: Dict[str, str] = {
    "refund_return": (
        "7-Day No-Questions-Asked Return & Refund Policy for unworn items with original STRIDE NFC authenticity tag intact. "
        "Refunds are processed within 24 hours to the original UPI/Card payment method or within 48 hours for COD orders via IMPS bank transfer. "
        "Final Sale / Syndicate Raffle items are eligible for size exchange only."
    ),
    "exchange_sizing": (
        "Free doorstep instant size exchange across India within 7 days. "
        "All footwear follows standard UK/India sizing (UK 6 to UK 11). "
        "If between sizes, size up 0.5 for narrow high-tops (like Air Retro High) and stay true-to-size for CloudNitro runners and streetwear."
    ),
    "shipping_delivery": (
        "Free Express Air Shipping on all orders above ₹2,999 (₹149 flat fee below ₹2,999). "
        "Same-day dispatch for orders placed before 4:00 PM IST. "
        "Delivery takes 1–2 business days for Metro cities (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune) and 3–4 days for rest of India."
    ),
    "cancellation": (
        "Orders can be cancelled instantly with a 100% refund anytime before the status changes to 'Dispatched'. "
        "Once dispatched, you can refuse doorstep delivery for an automatic refund."
    ),
    "authenticity_legit_check": (
        "Every STRIDE sneaker undergoes a 12-point physical & UV inspection by our master authenticators and ships with an encrypted STRIDE NFC Tag. "
        "Scan the tag with your phone to view the factory batch, material provenance, and digital inspection certificate."
    ),
    "payment_gst_cod": (
        "All prices are inclusive of 18% GST. We accept UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, No-Cost EMI (3/6 months on orders above ₹7,000), "
        "and Cash on Delivery (COD available on orders up to ₹15,000). Use code STRIDE10 for 10% off your first order."
    )
}

# Live Telemetry Hub Data
HERO_TELEMETRY = {
    "edition": "ISSUE 04 · ARCHIVAL TELEMETRY & STREETWEAR",
    "velocity_multiplier": "4.8x",
    "demand_delta": "+18.4% vs last drop",
    "energy_return": "96.4%",
    "fleece_density": "480GSM",
    "hubs": [
        {"city": "Mumbai Hub", "claimed_percent": 94, "status": "Critical Low"},
        {"city": "Bengaluru Hub", "claimed_percent": 88, "status": "Active Packing"},
        {"city": "Delhi NCR", "claimed_percent": 91, "status": "Express Hub"},
        {"city": "Hyderabad", "claimed_percent": 82, "status": "Normal Stock"}
    ],
    "active_shoppers": 142
}

# In-Memory Session Store by session_id
# Stores: { session_id: { "cart": [...], "orders": [...] } }
SESSION_STORE: Dict[str, Dict[str, Any]] = {}

def get_or_create_session(session_id: str) -> Dict[str, Any]:
    if not session_id:
        session_id = "default-guest"
    if session_id not in SESSION_STORE:
        # Pre-seed with one realistic confirmed order so order tracking / concierge inquiries are immediately demonstratable
        SESSION_STORE[session_id] = {
            "cart": [],
            "history": [],
            "user_profile": {},
            "orders": [
                {
                    "order_id": "STR-8492",
                    "items": [
                        {
                            "id": "STR-01",
                            "name": "Air Retro High 'Obsidian'",
                            "size": "UK 9",
                            "price_inr": 14999,
                            "quantity": 1
                        }
                    ],
                    "subtotal_inr": 14999,
                    "discount_inr": 1500,
                    "gst_inr": 2059,
                    "total_inr": 13499,
                    "shipping_city": "Bengaluru",
                    "payment_method": "UPI (Instant)",
                    "status": "Confirmed — Packing at Bengaluru Hub",
                    "delivery_eta": "Tomorrow by 2:00 PM IST",
                    "placed_at": "2026-11-03T11:20:00+05:30",
                    "nfc_id": "NFC-8492-BLR-01"
                }
            ]
        }
    return SESSION_STORE[session_id]
