export interface ProductTelemetry {
  cushion_score: number;
  durability_score: number;
  weight_grams: number;
  material_grade: string;
  trend_points: number[];
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: 'Sneakers' | 'Runners' | 'Streetwear' | 'Accessories';
  price_inr: number;
  original_price_inr: number;
  sizes: string[];
  stock_count: number;
  rating: number;
  hype_delta: string;
  telemetry: ProductTelemetry;
  image_url: string;
  description: string;
  care_instructions: string;
  keywords: string[];
}

export interface CartItem {
  id: string;
  name: string;
  size: string;
  price_inr: number;
  quantity: number;
  image_url?: string;
}

export interface Order {
  order_id: string;
  items: CartItem[];
  subtotal_inr: number;
  discount_inr: number;
  gst_inr: number;
  total_inr: number;
  shipping_city: string;
  shipping_address?: string;
  payment_method: string;
  status: string;
  delivery_eta: string;
  placed_at: string;
  nfc_id: string;
}

export interface DropHub {
  city: string;
  claimed_percent: number;
  status: string;
}

export interface HeroTelemetry {
  edition: string;
  velocity_multiplier: string;
  demand_delta: string;
  energy_return: string;
  fleece_density: string;
  hubs: DropHub[];
  active_shoppers: number;
}

export interface RotationResult {
  vibe: string;
  budget_inr: number;
  total_inr: number;
  original_total_inr: number;
  savings_inr: number;
  synergy_score: number;
  rotation_items: Product[];
  telemetry_summary: {
    cushion_index: number;
    durability_index: number;
    total_weight_grams: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'concierge';
  text: string;
  spoken_text?: string;
  timestamp: string;
  badges?: string[];
  matched_products?: Product[];
  suggested_followups?: string[];
  latency_ms?: number;
}

export interface ChatResponse {
  reply_markdown: string;
  spoken_text: string;
  matched_products: Product[];
  suggested_followups: string[];
  context_used_badges: string[];
  latency_ms: number;
}
