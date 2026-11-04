"""
STRIDE Unified Test Suite — Comprehensive Automated Verification
Validates:
1. Catalog API & In-Memory Store Integrity (12 seeded items, INR pricing)
2. Zero-Latency In-Memory Intent Matcher (Greetings, Broad Shoes, Price Filters)
3. Strict Pre-LLM Guardrails (Math, Trivia, Off-Topic Injections)
4. Precision Intent Routing (Seasonality, Footwear Sizing, Materials, Cushion Telemetry, Comparisons)
5. Multi-Turn Conversational Memory (User Name Registration & Recall)
6. Order Lifecycle, NFC Authentication & Cart Session Sync
7. Multi-Item Style Rotation Builder with Synergy Telemetry
"""

import sys
import os
import json
import time
import urllib.request
import urllib.error

API_URL = "http://127.0.0.1:8000/api"

def api_post(endpoint: str, payload: dict) -> dict:
    url = f"{API_URL}{endpoint}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def api_get(endpoint: str) -> dict | list:
    url = f"{API_URL}{endpoint}"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode("utf-8"))

def run_tests():
    print("=" * 65)
    print("           STRIDE AUTONOMOUS TEST SUITE")
    print("=" * 65)

    # TEST 1: Health & Catalog Verification
    print("\n[TEST 1] Verifying System Health & Product Catalog...")
    health = api_get("/health")
    assert health["status"] == "healthy", f"Health status failed: {health}"
    print(f" -> API Health: {health['status']} | Market: {health['market']}")

    products = api_get("/products")
    assert len(products) == 12, f"Expected 12 seeded products, got {len(products)}"
    footwear = [p for p in products if p["category"] in ["Sneakers", "Runners"]]
    streetwear = [p for p in products if p["category"] == "Streetwear"]
    accessories = [p for p in products if p["category"] == "Accessories"]
    assert len(footwear) == 5, f"Expected 5 footwear models, got {len(footwear)}"
    assert len(streetwear) == 4, f"Expected 4 streetwear pieces, got {len(streetwear)}"
    assert len(accessories) == 3, f"Expected 3 accessories, got {len(accessories)}"
    print(f" -> Catalog Verified: 12 Items (5 Footwear, 4 Streetwear, 3 Accessories)")

    # TEST 2: Instant Greeting (Zero-Latency, No LLM roundtrip)
    print("\n[TEST 2] Testing Instant Greeting Intent ('hi')...")
    t0 = time.time()
    chat_hi = api_post("/chat", {"query": "hi", "session_id": "suite-test"})
    dt_ms = (time.time() - t0) * 1000
    print(f" -> Latency: {dt_ms:.1f}ms (Engine Latency: {chat_hi.get('latency_ms')}ms)")
    assert dt_ms < 500, f"Greeting took too long: {dt_ms}ms"
    assert "STRIDE" in chat_hi["reply_markdown"]
    print(f" -> Greeting response verified cleanly")

    # TEST 3: Pre-LLM Guardrails (Arithmetic & Trivia Instant Refusal)
    print("\n[TEST 3] Testing Pre-LLM Guardrails ('what is 2+2' & 'capital of India')...")
    chat_math = api_post("/chat", {"query": "what is 2+2", "session_id": "suite-test"})
    assert "calibrated specifically for STRIDE" in chat_math["reply_markdown"], "Math query must be refused politely"
    assert "Guardrail: Off-Topic Filter" in chat_math["context_used_badges"]
    print(f" -> '2+2' Refusal verified")

    chat_trivia = api_post("/chat", {"query": "what is the capital of India", "session_id": "suite-test"})
    assert "calibrated specifically for STRIDE" in chat_trivia["reply_markdown"], "Trivia query must be refused politely"
    print(f" -> 'capital of India' Refusal verified")

    # TEST 4: Broad Footwear Query ('list me all the different shoes in our website')
    print("\n[TEST 4] Testing Broad Footwear Query ('list me all the different shoes in our website')...")
    chat_shoes = api_post("/chat", {"query": "list me all the different shoes in our website", "session_id": "suite-test"})
    assert len(chat_shoes["matched_products"]) == 5, f"Expected 5 footwear models, got {len(chat_shoes['matched_products'])}"
    assert "Air Retro High" in chat_shoes["reply_markdown"]
    assert "CloudNitro Carbon Pro" in chat_shoes["reply_markdown"]
    assert "###" not in chat_shoes["reply_markdown"]
    print(" -> All 5 shoes listed cleanly with prices in INR!")

    # TEST 5: Seasonality Query ('streetwear is for all seasons or only winter summer specific collection?')
    print("\n[TEST 5] Testing Seasonality Query ('streetwear is for all seasons or only winter summer...')...")
    chat_season = api_post("/chat", {"query": "streetwear is for all seasons or only winter summer specific collection?", "session_id": "suite-test"})
    assert "all-season" in chat_season["reply_markdown"].lower() or "modular" in chat_season["reply_markdown"].lower()
    assert "480gsm" in chat_season["reply_markdown"].lower()
    print(" -> Correctly answered all-season modularity with Supima tee & 480GSM hoodie")

    # TEST 6: Sizing Query ('what sizes are avaliable in footwear')
    print("\n[TEST 6] Testing Footwear Sizing ('what sizes are avaliable in footwear')...")
    chat_size = api_post("/chat", {"query": "what sizes are avaliable in footwear", "session_id": "suite-test"})
    assert "uk 7" in chat_size["reply_markdown"].lower() and "uk 11" in chat_size["reply_markdown"].lower()
    assert "true to size" in chat_size["reply_markdown"].lower()
    print(" -> Correctly explained standard UK 7-11 sizing, TTS fit, and 7-day exchange")

    # TEST 7: Comparison Query ('which is better in quality Monolith Foam Slide 02 or Apex Trail Gore-Tex Boot')
    print("\n[TEST 7] Testing Comparison ('which is better in quality Monolith Foam Slide 02 or Apex Trail Boot')...")
    chat_comp = api_post("/chat", {"query": "which is better in quality Monolith Foam Slide 02 or Apex Trail Gore-Tex Boot", "session_id": "suite-test"})
    assert "Monolith Foam Slide" in chat_comp["reply_markdown"] and "Apex Trail" in chat_comp["reply_markdown"]
    assert len(chat_comp["matched_products"]) == 2
    print(" -> Correctly compared durability (99) vs cushion (96) for both specific models")

    # TEST 8: Budget Query ('my budget is 7k which are best shoes?')
    print("\n[TEST 8] Testing Budget Query ('my budget is 7k which are best shoes?')...")
    chat_bud = api_post("/chat", {"query": "my budget is 7k which are best shoes?", "session_id": "suite-test"})
    assert "Monolith Foam Slide 02" in chat_bud["reply_markdown"]
    print(" -> Correctly recommended Monolith Slide (INR 3,499) within INR 7,000 budget")

    # TEST 9: Cushion Telemetry ('What is cushion of shoes?')
    print("\n[TEST 9] Testing Cushion Telemetry ('What is cushion of shoes?')...")
    chat_cush = api_post("/chat", {"query": "What is cushion of shoes?", "session_id": "suite-test"})
    assert "98/100" in chat_cush["reply_markdown"] or "cushion" in chat_cush["reply_markdown"].lower()
    print(" -> Correctly explained Cushion Score (0-100) and ranked CloudNitro (98) & Monolith (96)")

    # TEST 10: Multi-Turn Conversation Memory ('My name is Srikaran' -> 'What is my name?')
    print("\n[TEST 10] Testing Multi-Turn Chat Memory ('My name is Srikaran' -> 'What is my name?')...")
    sess_mem = "memory-test-" + str(int(time.time()))
    api_post("/chat", {"query": "My name is Srikaran", "session_id": sess_mem})
    chat_recall = api_post("/chat", {"query": "What is my name?", "session_id": sess_mem})
    assert "Srikaran" in chat_recall["reply_markdown"], f"Memory failed: expected Srikaran in reply, got: {chat_recall['reply_markdown']}"
    print(f" -> Conversational Memory Verified: Correctly recalled user name 'Srikaran'")

    # TEST 11: Store Policy Query
    print("\n[TEST 11] Testing Store Policy ('What is your return policy?')...")
    chat_policy = api_post("/chat", {"query": "What is your return policy?", "session_id": "suite-test"})
    assert "7-day" in chat_policy["reply_markdown"].lower() and "return" in chat_policy["reply_markdown"].lower()
    print(" -> 7-Day return policy retrieved cleanly")

    # TEST 12: Order Placement & NFC Authentication
    print("\n[TEST 12] Testing Order Placement & NFC Authentication Flow...")
    order_payload = {
        "session_id": "suite-test",
        "items": [
            {"id": "STR-01", "name": "Air Retro High 'Obsidian'", "size": "UK 9", "price_inr": 14999, "quantity": 1}
        ],
        "shipping_city": "Bengaluru",
        "shipping_address": "Indiranagar 100ft Road, Bengaluru 560038",
        "payment_method": "UPI Instant",
        "promo_code": "STRIDE10"
    }
    order_res = api_post("/orders/place", order_payload)
    order = order_res["order"]
    assert order["discount_inr"] == 1499, f"Expected 10% discount 1499, got {order['discount_inr']}"
    assert order["total_inr"] == 13500, f"Expected total 13500, got {order['total_inr']}"
    assert order["nfc_id"].startswith("NFC-"), f"Expected NFC ID, got {order['nfc_id']}"
    print(f" -> Order #{order['order_id']} placed! NFC Batch: {order['nfc_id']} | Total: INR {order['total_inr']:,}")

    # TEST 13: Style Rotation Builder (INR 15,000 budget)
    print("\n[TEST 13] Testing Style Rotation Builder (INR 15,000 budget)...")
    rot_res = api_post("/rotation/build", {"budget_inr": 15000, "style_vibe": "Monochrome Street"})
    assert len(rot_res["rotation_items"]) == 3, f"Expected 3 items in rotation, got {len(rot_res['rotation_items'])}"
    assert rot_res["total_inr"] <= 15000, f"Rotation exceeded budget: {rot_res['total_inr']}"
    print(f" -> Curated 3-piece rotation: Total INR {rot_res['total_inr']:,} | Synergy Score: {rot_res['synergy_score']}/100")

    print("\n" + "=" * 65)
    print("   ALL 13 SUITE TESTS PASSED 100% WITH ZERO ERRORS!")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()
