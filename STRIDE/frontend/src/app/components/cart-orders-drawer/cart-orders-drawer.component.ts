import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { VoiceChatService } from '../../services/voice-chat.service';
import { Order } from '../../models/stride.models';

@Component({
  selector: 'app-cart-orders-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (store.isCartOpen()) {
      <div class="drawer-overlay" (click)="close()">
        <div class="drawer-panel" (click)="$event.stopPropagation()">
          
          <!-- Drawer Header with Tabs -->
          <div class="drawer-header">
            <div class="drawer-tabs font-sohne">
              <button 
                (click)="setTab('cart')" 
                class="tab-btn" 
                [class.active]="store.activeDrawerTab() === 'cart'"
              >
                Shopping Bag ({{ store.cartCount() }})
              </button>
              <button 
                (click)="setTab('orders')" 
                class="tab-btn" 
                [class.active]="store.activeDrawerTab() === 'orders'"
              >
                Orders & Telemetry ({{ store.orders().length }})
              </button>
            </div>
            <button (click)="close()" class="drawer-close-btn" title="Close">✕</button>
          </div>

          <!-- ================= TAB 1: SHOPPING BAG ================= -->
          @if (store.activeDrawerTab() === 'cart') {
            <div class="drawer-body">
              @if (store.cart().length === 0) {
                <div class="empty-cart-state font-sohne">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  <h4>Your STRIDE bag is empty</h4>
                  <p>Explore Drop 04 footwear or run the AI Rotation Builder.</p>
                </div>
              } @else {
                <!-- Cart Items List -->
                <div class="cart-items-list">
                  @for (item of store.cart(); track $index; let idx = $index) {
                    <div class="cart-item-card font-sohne">
                      <div class="item-img-box">
                        <img [src]="item.image_url" [alt]="item.name" class="item-thumb" />
                      </div>
                      <div class="item-content">
                        <div class="item-top">
                          <span class="item-id-tag">{{ item.id }}</span>
                          <button (click)="store.removeFromCart(idx)" class="remove-btn" title="Remove">✕</button>
                        </div>
                        <h4 class="item-title">{{ item.name }}</h4>
                        <div class="item-size-badge">Size: {{ item.size }}</div>
                        <div class="item-bottom-row">
                          <div class="qty-stepper">
                            <button (click)="store.updateQuantity(idx, -1)" class="step-btn">-</button>
                            <span class="qty-num">{{ item.quantity }}</span>
                            <button (click)="store.updateQuantity(idx, 1)" class="step-btn">+</button>
                          </div>
                          <span class="item-price">₹{{ item.price_inr * item.quantity | number }}</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <!-- Checkout Summary & Inputs -->
                <div class="cart-summary font-sohne">
                  <!-- Promo Code Input -->
                  <div class="promo-input-row">
                    <input 
                      type="text" 
                      [(ngModel)]="promoInput" 
                      placeholder="Enter promo code (e.g. STRIDE10)" 
                      class="promo-field"
                    />
                    <button (click)="applyPromo()" class="apply-promo-btn">
                      {{ promoApplied() ? 'Applied ✓' : 'Apply' }}
                    </button>
                  </div>
                  @if (promoApplied()) {
                    <div class="promo-success-note">
                      ✓ Code STRIDE10 applied: 10% First Order discount unlocked!
                    </div>
                  }

                  <!-- City Selector -->
                  <div class="city-selector-group">
                    <label class="summary-label">Select Metro Delivery Hub:</label>
                    <select [(ngModel)]="shippingCity" class="city-select">
                      <option value="Bengaluru">Bengaluru Hub (Next Day Air)</option>
                      <option value="Mumbai">Mumbai Hub (Next Day Air)</option>
                      <option value="Delhi NCR">Delhi NCR Hub (Next Day Air)</option>
                      <option value="Hyderabad">Hyderabad Hub (1-2 Days)</option>
                      <option value="Chennai">Chennai Hub (1-2 Days)</option>
                      <option value="Pune">Pune Hub (1-2 Days)</option>
                    </select>
                  </div>

                  <!-- Shipping Address -->
                  <div class="address-group">
                    <label class="summary-label">Doorstep Delivery Address:</label>
                    <input 
                      type="text" 
                      [(ngModel)]="shippingAddress" 
                      placeholder="Flat, building, locality…" 
                      class="address-field"
                    />
                  </div>

                  <!-- Payment Method -->
                  <div class="payment-method-group">
                    <label class="summary-label">Payment Method:</label>
                    <div class="pay-options">
                      <label class="pay-option">
                        <input type="radio" [(ngModel)]="paymentMethod" value="UPI (GPay / PhonePe / Instant)" name="payMethod" />
                        <span>UPI Instant (Fastest)</span>
                      </label>
                      <label class="pay-option">
                        <input type="radio" [(ngModel)]="paymentMethod" value="Credit/Debit Card" name="payMethod" />
                        <span>Credit / Debit Card</span>
                      </label>
                      <label class="pay-option">
                        <input type="radio" [(ngModel)]="paymentMethod" value="Cash on Delivery (COD)" name="payMethod" />
                        <span>Cash on Delivery (COD)</span>
                      </label>
                    </div>
                  </div>

                  <!-- Price Breakdown -->
                  <div class="breakdown-rows">
                    <div class="b-row">
                      <span>Subtotal</span>
                      <span>₹{{ store.cartSubtotal() | number }}</span>
                    </div>
                    @if (promoApplied()) {
                      <div class="b-row discount-row">
                        <span>10% Drop Discount</span>
                        <span>-₹{{ discountAmount() | number }}</span>
                      </div>
                    }
                    <div class="b-row">
                      <span>Express Air Shipping</span>
                      <span class="free-badge">FREE</span>
                    </div>
                    <div class="b-row">
                      <span>Included 18% GST</span>
                      <span>₹{{ gstAmount() | number }}</span>
                    </div>
                    <div class="b-row total-row">
                      <span>Total Amount Payable</span>
                      <span class="total-price">₹{{ finalTotal() | number }}</span>
                    </div>
                  </div>

                  <!-- 1-Click Checkout Button -->
                  <button 
                    (click)="submitOrder()" 
                    [disabled]="isPlacingOrder()" 
                    class="pill-btn-filled checkout-btn font-sohne"
                  >
                    @if (isPlacingOrder()) {
                      <span>Encrypting & Logging Order…</span>
                    } @else {
                      <span>Confirm Order · ₹{{ finalTotal() | number }}</span>
                    }
                  </button>

                  <div class="security-guarantee font-sohne">
                    <span>🔒 256-bit Encrypted Checkout</span>
                    <span>·</span>
                    <span>7-Day Doorstep Returns</span>
                  </div>
                </div>
              }
            </div>
          }

          <!-- ================= TAB 2: ORDERS & TELEMETRY ================= -->
          @if (store.activeDrawerTab() === 'orders') {
            <div class="drawer-body orders-view">
              @if (store.orders().length === 0) {
                <div class="empty-cart-state font-sohne">
                  <h4>No orders on record</h4>
                  <p>Place an order or ask Concierge to inspect your past delivery batches.</p>
                </div>
              } @else {
                <div class="orders-list">
                  @for (order of store.orders(); track order.order_id) {
                    <div class="order-card neutral-card font-sohne">
                      <div class="order-header-row">
                        <div class="order-id-group">
                          <span class="order-id-pill">#{{ order.order_id }}</span>
                          <span class="order-nfc-tag">NFC: {{ order.nfc_id }}</span>
                        </div>
                        <span class="order-status-badge">{{ order.status }}</span>
                      </div>

                      <!-- Ordered Items -->
                      <div class="order-items-mini">
                        @for (item of order.items; track item.name) {
                          <div class="order-mini-item">
                            <span class="mini-name">{{ item.name }}</span>
                            <span class="mini-size">Size: {{ item.size }}</span>
                            <span class="mini-price">₹{{ item.price_inr | number }}</span>
                          </div>
                        }
                      </div>

                      <!-- Delivery & ETA Info -->
                      <div class="order-logistics-box">
                        <div class="logistics-col">
                          <span class="log-label">Shipping Hub:</span>
                          <span class="log-val">{{ order.shipping_city }}</span>
                        </div>
                        <div class="logistics-col">
                          <span class="log-label">Estimated Delivery:</span>
                          <span class="log-val highlight">{{ order.delivery_eta }}</span>
                        </div>
                        <div class="logistics-col">
                          <span class="log-label">Total Paid:</span>
                          <span class="log-val font-semibold">₹{{ order.total_inr | number }}</span>
                        </div>
                      </div>

                      <!-- Immediate Chatbot Awareness Button -->
                      <div class="order-chat-cta">
                        <button (click)="askConciergeAboutOrder(order)" class="pill-btn-peach btn-sm font-sohne">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          <span>Ask Concierge About This Order →</span>
                        </button>
                      </div>

                    </div>
                  }
                </div>
              }
            </div>
          }

        </div>
      </div>
    }
  `,
  styles: [`
    .drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(23, 25, 28, 0.45);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      justify-content: flex-end;
    }

    .drawer-panel {
      width: 100%;
      max-width: 480px;
      height: 100%;
      background: var(--color-paper-white);
      box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      animation: slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-mist-gray);
    }

    .drawer-tabs {
      display: flex;
      gap: 8px;
    }

    .tab-btn {
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-slate-gray);
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 9999px;
      transition: all 0.2s ease;
    }

    .tab-btn.active {
      background: var(--color-ink-black);
      color: var(--color-paper-white);
    }

    .drawer-close-btn {
      background: var(--color-mist-gray);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 13px;
      cursor: pointer;
      color: var(--color-slate-gray);
    }

    .drawer-close-btn:hover {
      color: var(--color-ink-black);
      background: #e4e4e5;
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .empty-cart-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-slate-gray);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cart-item-card {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: 16px;
      padding: 12px;
      background: var(--color-fog-white);
      border-radius: var(--radius-images);
      border: 1px solid var(--color-mist-gray);
    }

    .item-img-box {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      background: var(--color-mist-gray);
    }

    .item-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-id-tag {
      font-size: 11px;
      color: var(--color-sienna-brown);
      font-weight: 600;
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--color-slate-gray);
      cursor: pointer;
      font-size: 13px;
    }

    .remove-btn:hover {
      color: #ef4444;
    }

    .item-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--color-ink-black);
    }

    .item-size-badge {
      font-size: 12px;
      color: var(--color-slate-gray);
    }

    .item-bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
    }

    .qty-stepper {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-mist-gray);
      border-radius: 9999px;
      padding: 2px 8px;
    }

    .step-btn {
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      color: var(--color-ink-black);
    }

    .qty-num {
      font-size: 12px;
      font-weight: 600;
      min-width: 16px;
      text-align: center;
    }

    .item-price {
      font-size: 15px;
      font-weight: 700;
      color: var(--color-ink-black);
    }

    /* Summary */
    .cart-summary {
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-top: 1px solid var(--color-mist-gray);
      padding-top: 20px;
    }

    .promo-input-row {
      display: flex;
      gap: 8px;
    }

    .promo-field, .address-field, .city-select {
      flex: 1;
      padding: 10px 14px;
      border-radius: var(--radius-inputs);
      border: 1px solid var(--color-mist-gray);
      background: var(--color-fog-white);
      font-size: 13px;
      color: var(--color-ink-black);
      outline: none;
    }

    .apply-promo-btn {
      background: var(--color-ink-black);
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 9999px;
      font-size: 13px;
      cursor: pointer;
    }

    .promo-success-note {
      font-size: 12px;
      color: #059669;
      font-weight: 600;
    }

    .summary-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-ink-black);
      display: block;
      margin-bottom: 6px;
    }

    .pay-options {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .pay-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--color-ink-black);
      cursor: pointer;
    }

    .breakdown-rows {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: var(--color-fog-white);
      padding: 14px;
      border-radius: var(--radius-inputs);
      border: 1px solid var(--color-mist-gray);
    }

    .b-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--color-slate-gray);
    }

    .free-badge {
      color: #059669;
      font-weight: 600;
    }

    .discount-row {
      color: #059669;
      font-weight: 600;
    }

    .total-row {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-ink-black);
      border-top: 1px solid var(--color-mist-gray);
      padding-top: 8px;
      margin-top: 4px;
    }

    .total-price {
      color: var(--color-ink-black);
      font-size: 18px;
    }

    .checkout-btn {
      width: 100%;
      padding: 14px;
      font-size: 16px;
    }

    .security-guarantee {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 11px;
      color: var(--color-ash-gray);
    }

    /* Orders Tab */
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .order-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--color-fog-white);
      border: 1px solid var(--color-mist-gray);
    }

    .order-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-id-pill {
      font-weight: 700;
      font-size: 15px;
      color: var(--color-ink-black);
    }

    .order-nfc-tag {
      font-size: 11px;
      color: var(--color-sienna-brown);
      background: var(--color-blush-peach);
      padding: 2px 8px;
      border-radius: 9999px;
      margin-left: 8px;
    }

    .order-status-badge {
      font-size: 12px;
      background: #dcfce7;
      color: #15803d;
      padding: 3px 10px;
      border-radius: 9999px;
      font-weight: 600;
    }

    .order-items-mini {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px 0;
      border-top: 1px solid var(--color-mist-gray);
      border-bottom: 1px solid var(--color-mist-gray);
    }

    .order-mini-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
    }

    .mini-name {
      font-weight: 500;
      color: var(--color-ink-black);
    }

    .mini-size {
      color: var(--color-slate-gray);
    }

    .order-logistics-box {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      font-size: 12px;
    }

    .log-label {
      color: var(--color-slate-gray);
      display: block;
      font-size: 11px;
    }

    .log-val.highlight {
      color: #059669;
      font-weight: 600;
    }

    .order-chat-cta {
      display: flex;
      justify-content: flex-end;
      padding-top: 6px;
    }
  `]
})
export class CartOrdersDrawerComponent {
  store = inject(StoreService);
  voice = inject(VoiceChatService);

  promoInput = 'STRIDE10';
  promoApplied = signal<boolean>(true);
  shippingCity = 'Bengaluru';
  shippingAddress = 'Indiranagar 100ft Road, Bengaluru 560038';
  paymentMethod = 'UPI (GPay / PhonePe / Instant)';
  isPlacingOrder = signal<boolean>(false);

  close() {
    this.store.isCartOpen.set(false);
  }

  setTab(tab: 'cart' | 'checkout' | 'orders') {
    this.store.activeDrawerTab.set(tab);
  }

  applyPromo() {
    if (this.promoInput.trim().toUpperCase() === 'STRIDE10') {
      this.promoApplied.set(true);
    } else {
      alert("Invalid code. Use code 'STRIDE10' for 10% off.");
    }
  }

  discountAmount(): number {
    return this.promoApplied() ? Math.round(this.store.cartSubtotal() * 0.10) : 0;
  }

  finalTotal(): number {
    return Math.max(0, this.store.cartSubtotal() - this.discountAmount());
  }

  gstAmount(): number {
    return Math.round((this.finalTotal() * 0.18) / 1.18);
  }

  submitOrder() {
    if (this.store.cart().length === 0) return;

    this.isPlacingOrder.set(true);
    this.store.placeOrder({
      shipping_city: this.shippingCity,
      shipping_address: this.shippingAddress,
      payment_method: this.paymentMethod,
      promo_code: this.promoApplied() ? 'STRIDE10' : undefined
    }).subscribe({
      next: (res) => {
        this.isPlacingOrder.set(false);
        if (res.order) {
          const updatedOrders = [...this.store.orders(), res.order];
          this.store.orders.set(updatedOrders);
          sessionStorage.setItem('stride_orders', JSON.stringify(updatedOrders));
          this.store.clearCart();
          this.setTab('orders');
        }
      },
      error: (err) => {
        this.isPlacingOrder.set(false);
        console.warn('Order placement fallback:', err);
      }
    });
  }

  askConciergeAboutOrder(order: Order) {
    const query = `What is the status of my order #${order.order_id}?`;
    this.store.isCartOpen.set(false);
    this.store.openConcierge(undefined, query);
    this.voice.sendMessage(query, this.store.sessionId);
  }
}
