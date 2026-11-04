import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, CartItem, Order, HeroTelemetry, RotationResult } from '../models/stride.models';

const API_BASE = 'http://localhost:8000/api';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // Session Identity
  readonly sessionId = this.initSessionId();

  // Core Data Signals
  readonly products = signal<Product[]>([]);
  readonly selectedCategory = signal<string>('All');
  readonly searchQuery = signal<string>('');
  readonly sortBy = signal<string>('featured'); // 'featured', 'price-low', 'price-high', 'cushion', 'hype'
  readonly cart = signal<CartItem[]>(this.loadStoredCart());
  readonly orders = signal<Order[]>(this.loadStoredOrders());
  readonly comparedProducts = signal<Product[]>([]);
  readonly heroTelemetry = signal<HeroTelemetry | null>(null);
  readonly policies = signal<Record<string, string>>({});

  // UI Drawer / Modal States
  readonly isCartOpen = signal<boolean>(false);
  readonly isCompareOpen = signal<boolean>(false);
  readonly isConciergeOpen = signal<boolean>(false);
  readonly pinnedProduct = signal<Product | null>(null);
  readonly activeDrawerTab = signal<'cart' | 'checkout' | 'orders'>('cart');
  readonly initialPrompt = signal<string>('');

  // Derived Signals
  readonly cartCount = computed(() => 
    this.cart().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly cartSubtotal = computed(() => 
    this.cart().reduce((sum, item) => sum + (item.price_inr * item.quantity), 0)
  );

  readonly filteredProducts = computed(() => {
    let list = [...this.products()];
    const cat = this.selectedCategory();
    const query = this.searchQuery().toLowerCase().trim();
    const sort = this.sortBy();

    if (cat !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    }

    if (query) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.subtitle.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.keywords.some(k => k.includes(query))
      );
    }

    if (sort === 'price-low') {
      list.sort((a, b) => a.price_inr - b.price_inr);
    } else if (sort === 'price-high') {
      list.sort((a, b) => b.price_inr - a.price_inr);
    } else if (sort === 'cushion') {
      list.sort((a, b) => b.telemetry.cushion_score - a.telemetry.cushion_score);
    } else if (sort === 'hype') {
      list.sort((a, b) => b.telemetry.durability_score - a.telemetry.durability_score);
    }

    return list;
  });

  constructor(private http: HttpClient) {
    this.bootstrap();
  }

  private initSessionId(): string {
    const existing = sessionStorage.getItem('stride_session_id');
    if (existing) return existing;
    const fresh = 'stride-usr-' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('stride_session_id', fresh);
    return fresh;
  }

  private loadStoredCart(): CartItem[] {
    try {
      const data = sessionStorage.getItem('stride_cart');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private loadStoredOrders(): Order[] {
    try {
      const data = sessionStorage.getItem('stride_orders');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveSessionState() {
    sessionStorage.setItem('stride_cart', JSON.stringify(this.cart()));
    sessionStorage.setItem('stride_orders', JSON.stringify(this.orders()));
    this.syncWithBackend();
  }

  bootstrap() {
    this.http.get<any>(`${API_BASE}/bootstrap?session_id=${this.sessionId}`).subscribe({
      next: (res) => {
        if (res.products) {
          this.products.set(res.products);
        }
        if (res.policies) {
          this.policies.set(res.policies);
        }
        if (res.hero_telemetry) {
          this.heroTelemetry.set(res.hero_telemetry);
        }
        if (res.session) {
          // If frontend has empty orders but backend pre-seeded #STR-8492, sync into frontend
          if (this.orders().length === 0 && res.session.orders?.length > 0) {
            this.orders.set(res.session.orders);
            sessionStorage.setItem('stride_orders', JSON.stringify(res.session.orders));
          }
        }
      },
      error: (err) => console.warn('Could not bootstrap from backend:', err)
    });
  }

  syncWithBackend() {
    this.http.post(`${API_BASE}/session/sync`, {
      session_id: this.sessionId,
      cart: this.cart(),
      orders: this.orders()
    }).subscribe({
      error: (err) => console.warn('Session sync warning:', err)
    });
  }

  addToCart(product: Product, size?: string) {
    const selectedSize = size || product.sizes[0] || 'UK 9';
    const current = [...this.cart()];
    const existingIdx = current.findIndex(i => i.id === product.id && i.size === selectedSize);

    if (existingIdx > -1) {
      current[existingIdx].quantity += 1;
    } else {
      current.push({
        id: product.id,
        name: product.name,
        size: selectedSize,
        price_inr: product.price_inr,
        quantity: 1,
        image_url: product.image_url
      });
    }

    this.cart.set(current);
    this.saveSessionState();
    this.isCartOpen.set(true);
    this.activeDrawerTab.set('cart');
  }

  removeFromCart(index: number) {
    const current = [...this.cart()];
    current.splice(index, 1);
    this.cart.set(current);
    this.saveSessionState();
  }

  updateQuantity(index: number, delta: number) {
    const current = [...this.cart()];
    if (current[index]) {
      current[index].quantity += delta;
      if (current[index].quantity <= 0) {
        current.splice(index, 1);
      }
      this.cart.set(current);
      this.saveSessionState();
    }
  }

  clearCart() {
    this.cart.set([]);
    this.saveSessionState();
  }

  toggleCompare(product: Product) {
    const current = [...this.comparedProducts()];
    const idx = current.findIndex(p => p.id === product.id);

    if (idx > -1) {
      current.splice(idx, 1);
      this.comparedProducts.set(current);
    } else {
      if (current.length >= 2) {
        // Replace second product
        current[1] = product;
      } else {
        current.push(product);
      }
      this.comparedProducts.set(current);
      this.isCompareOpen.set(true);
    }
  }

  removeFromCompare(productId: string) {
    this.comparedProducts.set(this.comparedProducts().filter(p => p.id !== productId));
  }

  openConcierge(pinned?: Product, initialQuery?: string) {
    if (pinned) {
      this.pinnedProduct.set(pinned);
    }
    if (initialQuery) {
      this.initialPrompt.set(initialQuery);
    }
    this.isConciergeOpen.set(true);
  }

  closeConcierge() {
    this.isConciergeOpen.set(false);
  }

  placeOrder(details: {
    shipping_city: string;
    shipping_address: string;
    payment_method: string;
    promo_code?: string;
  }) {
    return this.http.post<any>(`${API_BASE}/orders/place`, {
      session_id: this.sessionId,
      items: this.cart(),
      shipping_city: details.shipping_city,
      shipping_address: details.shipping_address,
      payment_method: details.payment_method,
      promo_code: details.promo_code
    });
  }

  buildRotation(budget: number, vibe: string) {
    return this.http.post<RotationResult>(`${API_BASE}/rotation/build`, {
      budget_inr: budget,
      style_vibe: vibe
    });
  }
}
