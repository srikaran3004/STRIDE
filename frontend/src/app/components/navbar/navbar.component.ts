import { Component, inject, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Floating Capsule Container -->
    <div class="floating-nav-anchor">
      <header 
        class="capsule-nav"
        [class.scrolled]="isScrolled()"
        [class.collapsed]="isCollapsed()"
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()"
      >
        <!-- ================= COLLAPSED BADGE STATE ================= -->
        <div class="collapsed-monogram" (click)="expandFromBadge()" title="STRIDE">
          <span class="terracotta-icon font-signifier">S.</span>
          <span class="badge-breathing-ring"></span>
        </div>

        <!-- ================= FULL EXPANDED CONTENT ================= -->
        <div class="expanded-content">
          <!-- Left: Pure Logo -->
          <div class="nav-left">
            <a href="#" class="brand-logo font-signifier">STRIDE.</a>
          </div>

          <!-- Center: Editorial Nav Options -->
          <nav class="nav-center font-sohne">
            <button (click)="filterCategory('Footwear')" class="nav-link">
              <span>Footwear</span>
            </button>
            <button (click)="filterCategory('Streetwear')" class="nav-link">
              <span>Streetwear</span>
            </button>
            <button (click)="openCompare()" class="nav-link compare-link">
              <span>Telemetry Compare</span>
              @if (store.comparedProducts().length > 0) {
                <span class="compare-badge-pill">{{ store.comparedProducts().length }}</span>
              }
            </button>
            <button (click)="scrollTo('rotation-section')" class="nav-link">
              <span>Rotation Builder</span>
            </button>
            <button (click)="openOrders()" class="nav-link">
              <span>Track Order</span>
            </button>
          </nav>

          <!-- Right: Market Currency & Shopping Bag -->
          <div class="nav-right font-sohne">
            <!-- Market Currency Indicator -->
            <div class="currency-tag" title="Fulfillment Market: India">
              <span class="market-flag">🇮🇳</span>
              <span class="currency-code">₹ INR</span>
            </div>

            <!-- Shopping Bag Pill -->
            <button (click)="openCart()" class="cart-pill-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span>Bag ({{ store.cartCount() }}) · ₹{{ store.cartSubtotal() | number }}</span>
            </button>
          </div>
        </div>
      </header>
    </div>
  `,
  styles: [`
    /* Fixed Positioning: Floating in the Air */
    .floating-nav-anchor {
      position: fixed;
      top: 14px;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      justify-content: center;
      pointer-events: none;
      padding: 0 16px;
    }

    .capsule-nav {
      pointer-events: auto;
      width: 100%;
      max-width: 1060px;
      height: 58px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.90);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.07);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
    }

    /* Scrolled State: stays floating with elevated shadow */
    .capsule-nav.scrolled:not(.collapsed) {
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.13);
      border-color: rgba(0, 0, 0, 0.1);
    }

    /* ================= COMPRESSED 48px CIRCULAR BADGE ================= */
    .capsule-nav.collapsed {
      width: 48px;
      height: 48px;
      max-width: 48px;
      padding: 0;
      border-radius: 50%;
      background: #5d2a1a;
      border-color: #5d2a1a;
      box-shadow: 0 4px 20px rgba(93, 42, 26, 0.35);
      cursor: pointer;
      justify-content: center;
    }

    .collapsed-monogram {
      display: none;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .capsule-nav.collapsed .collapsed-monogram {
      display: flex;
    }

    .terracotta-icon {
      color: #fbe1d1;
      font-size: 26px;
      font-weight: 400;
      line-height: 1;
      transform: translateY(-1px);
    }

    /* Soft Terracotta Breathing Glow */
    .badge-breathing-ring {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid rgba(251, 225, 209, 0.4);
      animation: terracotta-breathe 2.4s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes terracotta-breathe {
      0%, 100% {
        transform: scale(1);
        opacity: 0.3;
        box-shadow: 0 0 10px rgba(93, 42, 26, 0.3);
      }
      50% {
        transform: scale(1.15);
        opacity: 0.8;
        box-shadow: 0 0 20px rgba(93, 42, 26, 0.6);
      }
    }

    /* ================= EXPANDED CONTENT ================= */
    .expanded-content {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      opacity: 1;
      transform: scale(1);
      transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .capsule-nav.collapsed .expanded-content {
      opacity: 0;
      transform: scale(0.9);
      pointer-events: none;
      display: none;
    }

    .nav-left {
      display: flex;
      align-items: center;
    }

    .brand-logo {
      font-size: 26px;
      color: var(--color-ink-black);
      text-decoration: none;
      letter-spacing: -0.5px;
      line-height: 1;
    }

    /* Center Nav Links */
    .nav-center {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .nav-link {
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-slate-gray);
      cursor: pointer;
      padding: 6px 4px;
      position: relative;
      transition: color 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .nav-link:hover {
      color: var(--color-ink-black);
    }

    .compare-badge-pill {
      background: var(--color-sienna-brown);
      color: var(--color-blush-peach);
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 9999px;
      font-weight: 700;
    }

    /* Right Actions */
    .nav-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .currency-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(0, 0, 0, 0.04);
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-ink-black);
    }

    .market-flag {
      font-size: 13px;
    }

    .cart-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--color-ink-black);
      color: #ffffff;
      border: 1px solid var(--color-ink-black);
      border-radius: 9999px;
      padding: 9px 20px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
    }

    .cart-pill-btn:hover {
      background: #2b2e34;
      transform: translateY(-1px);
    }

    @media (max-width: 900px) {
      .nav-center {
        display: none;
      }
      .capsule-nav {
        height: 52px;
        padding: 0 16px;
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  store = inject(StoreService);

  isScrolled = signal<boolean>(false);
  isHovered = signal<boolean>(false);

  private leaveTimeout: any = null;

  ngOnInit() {
    this.checkScroll();
  }

  ngOnDestroy() {
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.checkScroll();
  }

  private checkScroll() {
    if (typeof window !== 'undefined') {
      const scrolled = window.scrollY > 60;
      this.isScrolled.set(scrolled);
    }
  }

  isCollapsed(): boolean {
    // If the cart drawer or compare modal is open, IMMEDIATELY compress so it never collides
    if (this.store.isCartOpen() || this.store.isCompareOpen()) {
      return true;
    }
    // When scrollY > 60px, collapses unless user is hovering over it
    return this.isScrolled() && !this.isHovered();
  }

  onMouseEnter() {
    // If cart drawer is open, keep navbar compressed so it doesn't collide
    if (this.store.isCartOpen() || this.store.isCompareOpen()) {
      return;
    }
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
      this.leaveTimeout = null;
    }
    this.isHovered.set(true);
  }

  onMouseLeave() {
    // 160ms grace period so quick movements across links don't trigger accidental collapse
    this.leaveTimeout = setTimeout(() => {
      this.isHovered.set(false);
    }, 160);
  }

  expandFromBadge() {
    if (this.store.isCartOpen()) {
      // If cart is open, clicking the monogram badge closes the cart drawer
      this.store.isCartOpen.set(false);
    }
    this.isHovered.set(true);
  }

  filterCategory(cat: string) {
    if (cat === 'Footwear') {
      this.store.selectedCategory.set('Sneakers');
    } else {
      this.store.selectedCategory.set(cat);
    }
    this.scrollTo('products-section');
  }

  openCompare() {
    this.store.isCompareOpen.set(true);
  }

  openCart() {
    this.store.activeDrawerTab.set('cart');
    this.store.isCartOpen.set(true);
  }

  openOrders() {
    this.store.activeDrawerTab.set('orders');
    this.store.isCartOpen.set(true);
  }

  scrollTo(elementId: string) {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
