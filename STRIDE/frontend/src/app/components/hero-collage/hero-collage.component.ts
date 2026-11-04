import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { VoiceChatService } from '../../services/voice-chat.service';

@Component({
  selector: 'app-hero-collage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="hero-section">
      <div class="hero-layout">
        
        <!-- ================= TOP FLOATING ARTIFACTS ================= -->
        <div class="hero-artifacts-row top-row">
          
          <!-- Artifact 1: Live Drop Allocation Table (Top-Left) -->
          <div class="floating-artifact drop-allocation-card">
            <div class="card-header">
              <div class="card-title-group">
                <span class="live-dot-pulse"></span>
                <span class="artifact-label">Live Drop Allocation</span>
              </div>
              <span class="batch-tag">Drop 04 · India</span>
            </div>

            <div class="hub-rows">
              @for (hub of hubs(); track hub.city) {
                <div class="hub-item">
                  <div class="hub-meta">
                    <span class="hub-name">{{ hub.city }}</span>
                    <span class="hub-pct">{{ hub.claimed_percent }}% Claimed</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" [style.width.%]="hub.claimed_percent"></div>
                  </div>
                </div>
              }
            </div>

            <!-- Shopper Avatar Bubble with Directional Cursor Pointer -->
            <div class="avatar-cursor-bubble top-left-cursor">
              <div class="shopper-avatar-pill">
                <span class="avatar-circle avatar-green">AR</span>
                <span>Ankit R. claimed UK 9 in Mumbai</span>
              </div>
              <svg class="cursor-pointer" width="16" height="16" viewBox="0 0 24 24" fill="#17191c">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
              </svg>
            </div>
          </div>

          <!-- Artifact 2: Resale & Demand Telemetry Card (Top-Right) -->
          <div class="floating-artifact telemetry-hype-card">
            <div class="telemetry-top">
              <span class="telemetry-badge">Market Telemetry</span>
              <span class="telemetry-time">Live Sync (IST)</span>
            </div>
            
            <div class="metric-display">
              <div class="primary-metric font-sohne">↑ 4.8x Velocity</div>
              <div class="metric-delta">+18.4% vs last drop</div>
            </div>

            <!-- Smooth SVG Gestural Line Chart in #5d2a1a Sienna Brown (No gridlines) -->
            <div class="chart-container">
              <svg class="hype-chart" viewBox="0 0 240 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="siennaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#5d2a1a" stop-opacity="0.18"/>
                    <stop offset="100%" stop-color="#5d2a1a" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <!-- Area Fill -->
                <path d="M 0,55 Q 35,48 70,36 T 140,24 T 195,12 T 240,4 L 240,60 L 0,60 Z" fill="url(#siennaGrad)"/>
                <!-- Pure Sienna Stroke Curve -->
                <path d="M 0,55 Q 35,48 70,36 T 140,24 T 195,12 T 240,4" 
                      fill="none" 
                      stroke="#5d2a1a" 
                      stroke-width="2.5" 
                      stroke-linecap="round"/>
                <!-- End point ping -->
                <circle cx="238" cy="5" r="4" fill="#5d2a1a"/>
                <circle cx="238" cy="5" r="7" fill="none" stroke="#5d2a1a" stroke-width="1.5" opacity="0.5"/>
              </svg>
            </div>

            <div class="telemetry-footer">
              <span class="footer-stat">Peak Velocity: <strong>Bengaluru Hub</strong></span>
              <span class="nfc-verified-tag">✓ 12-Pt UV Verified</span>
            </div>
          </div>

        </div>

        <!-- ================= CENTER EDITORIAL HERO HEADLINE ================= -->
        <div class="hero-centerpiece">
          <!-- Dynamic High-Impact Marketing Selling Point -->
          <div class="hype-marketing-pill font-sohne">
            <span class="live-flame-icon">🔥</span>
            <span class="pill-headline">DROP 04 IS LIVE</span>
            <span class="pill-dot-sep"></span>
            <span class="pill-stat">84% ALLOCATED</span>
            <span class="pill-dot-sep"></span>
            <span class="pill-highlight">ZERO BOTS · 100% NFC VERIFIED</span>
            <span class="promo-pill-badge">CODE: STRIDE10</span>
          </div>

          <h1 class="headline-display hero-title">
            Engineered for the street , <em>measured to the millimeter</em>.
          </h1>

          <p class="hero-subhead font-sohne">
            Limited-allocation footwear and heavyweight 480GSM garments backed by live market telemetry and encrypted NFC verification.
          </p>

          <!-- Matched Pill Button Pair -->
          <div class="hero-cta-group">
            <button (click)="scrollTo('products-section')" class="pill-btn-filled">
              Explore Drop 04
            </button>
            <button (click)="scrollTo('rotation-section')" class="pill-btn-ghost">
              Build ₹15k Rotation →
            </button>
          </div>
        </div>

        <!-- ================= BOTTOM FLOATING ARTIFACTS ================= -->
        <div class="hero-artifacts-row bottom-row">

          <!-- Artifact 3: Cushion & GSM Radial Ring (Bottom-Left) -->
          <div class="floating-artifact radial-spec-card">
            <div class="radial-content">
              <!-- SVG Radial Ring in #5d2a1a Sienna Brown -->
              <div class="svg-radial-wrap">
                <svg class="radial-ring-svg" width="72" height="72" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#f2f2f3" stroke-width="6"/>
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#5d2a1a" stroke-width="6"
                          stroke-dasharray="201" stroke-dashoffset="18" stroke-linecap="round"/>
                </svg>
                <div class="radial-center-val font-sohne">96.4%</div>
              </div>
              <div class="radial-text">
                <div class="radial-headline font-sohne">Energy Return</div>
                <div class="radial-sub">480GSM Fleece Density</div>
                <div class="radial-spec-tag">Subcritical Nitrogen</div>
              </div>
            </div>

            <!-- Shopper Avatar Bubble with Cursor Pointer -->
            <div class="avatar-cursor-bubble bottom-left-cursor">
              <div class="shopper-avatar-pill">
                <span class="avatar-circle avatar-blue">VK</span>
                <span>Varun K. reviewing CloudNitro</span>
              </div>
              <svg class="cursor-pointer" width="16" height="16" viewBox="0 0 24 24" fill="#17191c">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
              </svg>
            </div>
          </div>

          <!-- Artifact 4: Embedded Steep AI Composer (Bottom-Center) -->
          <div class="floating-artifact embedded-composer-card">
            <div class="composer-header">
              <span class="composer-badge">AI Editorial Concierge</span>
              <span class="composer-hint font-sohne">Voice & Context Aware</span>
            </div>

            <form (submit)="submitHeroPrompt($event)" class="composer-input-row">
              <!-- @ Product Selector Trigger -->
              <button type="button" (click)="toggleProductPicker()" class="context-at-btn" title="Pin specific product">
                {{ selectedProductPin() ? '@' + selectedProductPin()?.id : '@' }}
              </button>

              <input 
                type="text" 
                [(ngModel)]="composerQuery" 
                name="heroQuery"
                placeholder="Ask anything about STRIDE, sizes, or your order…" 
                class="composer-input font-sohne"
              />

              <!-- Microphone Voice Input Button -->
              <button 
                type="button" 
                (click)="toggleVoiceInput()" 
                class="mic-btn" 
                [class.listening]="voice.isListening()"
                title="Speak to STRIDE Concierge"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>

              <!-- 40px Circular Send Button -->
              <button type="submit" class="send-circle-btn" title="Send to Concierge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
              </button>
            </form>

            @if (showProductPicker()) {
              <div class="product-picker-popover">
                <div class="picker-header">Pin a product to context:</div>
                <div class="picker-list">
                  @for (prod of store.products(); track prod.id) {
                    <button type="button" (click)="selectPin(prod)" class="picker-item">
                      <span class="item-id">{{ prod.id }}</span>
                      <span class="item-name">{{ prod.name }}</span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>

        </div>

      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      max-width: var(--page-max-width);
      margin: 0 auto;
      padding: 96px 24px 80px 24px;
      position: relative;
    }

    .hero-layout {
      display: flex;
      flex-direction: column;
      gap: 36px;
      align-items: center;
    }

    /* Artifacts Rows */
    .hero-artifacts-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      align-items: flex-start;
      gap: 24px;
      position: relative;
    }

    .top-row {
      margin-bottom: -10px;
    }

    .bottom-row {
      margin-top: 20px;
      justify-content: space-between;
      align-items: center;
    }

    /* Artifact 1: Drop Allocation Table */
    .drop-allocation-card {
      width: 320px;
      position: relative;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .card-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .live-dot-pulse {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 1.8s infinite;
    }

    .artifact-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-ink-black);
      letter-spacing: -0.2px;
    }

    .batch-tag {
      font-size: 11px;
      color: var(--color-slate-gray);
      background: var(--color-mist-gray);
      padding: 2px 8px;
      border-radius: 9999px;
    }

    .hub-rows {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .hub-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .hub-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }

    .hub-name {
      color: var(--color-ink-black);
      font-weight: 500;
    }

    .hub-pct {
      color: var(--color-slate-gray);
      font-size: 11px;
    }

    .progress-bar-bg {
      height: 4px;
      background: var(--color-mist-gray);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--color-sienna-brown);
      border-radius: 9999px;
      transition: width 1s ease;
    }

    /* Avatar Cursor Bubbles */
    .avatar-cursor-bubble {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 10;
      pointer-events: none;
    }

    .top-left-cursor {
      bottom: -18px;
      right: -24px;
    }

    .bottom-left-cursor {
      top: -18px;
      right: -24px;
    }

    .cursor-pointer {
      transform: rotate(-15deg);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
    }

    /* Artifact 2: Telemetry Card */
    .telemetry-hype-card {
      width: 320px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .telemetry-top {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--color-slate-gray);
    }

    .telemetry-badge {
      font-weight: 600;
      color: var(--color-ink-black);
    }

    .metric-display {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .primary-metric {
      font-size: 22px;
      font-weight: 600;
      color: var(--color-ink-black);
      letter-spacing: -0.5px;
    }

    .metric-delta {
      font-size: 13px;
      color: #059669;
      font-weight: 500;
    }

    .chart-container {
      width: 100%;
      height: 60px;
    }

    .hype-chart {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .telemetry-footer {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--color-slate-gray);
      border-top: 1px solid var(--color-mist-gray);
      padding-top: 8px;
    }

    .nfc-verified-tag {
      color: var(--color-sienna-brown);
      font-weight: 600;
    }

    /* Centerpiece */
    .hero-centerpiece {
      text-align: center;
      max-width: 860px;
      padding: 10px 0;
      z-index: 5;
    }

    .hype-marketing-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(251, 225, 209, 0.45);
      border: 1px solid rgba(93, 42, 26, 0.2);
      border-radius: 9999px;
      padding: 6px 16px;
      font-size: 12px;
      margin-bottom: 24px;
      box-shadow: 0 2px 12px rgba(93, 42, 26, 0.08);
      backdrop-filter: blur(8px);
      transition: all 0.25s ease;
    }

    .hype-marketing-pill:hover {
      background: rgba(251, 225, 209, 0.7);
      border-color: rgba(93, 42, 26, 0.4);
      transform: translateY(-1px);
    }

    .live-flame-icon {
      font-size: 14px;
      animation: flame-pulse 1.4s ease-in-out infinite alternate;
    }

    @keyframes flame-pulse {
      0% { transform: scale(0.9) rotate(-3deg); }
      100% { transform: scale(1.15) rotate(3deg); }
    }

    .pill-headline {
      font-weight: 700;
      color: var(--color-sienna-brown);
      letter-spacing: 0.5px;
    }

    .pill-dot-sep {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--color-sienna-brown);
      opacity: 0.5;
    }

    .pill-stat {
      font-weight: 600;
      color: #059669;
    }

    .pill-highlight {
      font-weight: 600;
      color: var(--color-ink-black);
    }

    .promo-pill-badge {
      background: var(--color-sienna-brown);
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .hero-title {
      margin-bottom: 24px;
    }

    .hero-subhead {
      font-size: 18px;
      line-height: 1.6;
      color: var(--color-slate-gray);
      max-width: 620px;
      margin: 0 auto 36px auto;
    }

    .hero-cta-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    /* Artifact 3: Radial Spec Card */
    .radial-spec-card {
      width: 320px;
      position: relative;
    }

    .radial-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .svg-radial-wrap {
      position: relative;
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .radial-ring-svg {
      transform: rotate(-90deg);
    }

    .radial-center-val {
      position: absolute;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-ink-black);
    }

    .radial-headline {
      font-size: 15px;
      font-weight: 600;
      color: var(--color-ink-black);
    }

    .radial-sub {
      font-size: 13px;
      color: var(--color-slate-gray);
      margin: 2px 0 4px 0;
    }

    .radial-spec-tag {
      font-size: 11px;
      color: var(--color-sienna-brown);
      background: var(--color-blush-peach);
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 600;
    }

    /* Artifact 4: Embedded Composer */
    .embedded-composer-card {
      width: 480px;
      position: relative;
      padding: 12px 16px;
    }

    .composer-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-bottom: 8px;
    }

    .composer-badge {
      font-weight: 600;
      color: var(--color-ink-black);
    }

    .composer-hint {
      color: var(--color-ash-gray);
    }

    .composer-input-row {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-mist-gray);
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 16px;
      padding: 4px 6px 4px 12px;
    }

    .context-at-btn {
      background: var(--color-paper-white);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 9999px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-ink-black);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .context-at-btn:hover {
      background: var(--color-blush-peach);
      color: var(--color-sienna-brown);
    }

    .composer-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
      color: var(--color-ink-black);
      padding: 8px 0;
    }

    .composer-input::placeholder {
      color: var(--color-ash-gray);
    }

    .mic-btn {
      background: none;
      border: none;
      color: var(--color-slate-gray);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .mic-btn:hover {
      color: var(--color-sienna-brown);
      background: rgba(93, 42, 26, 0.08);
    }

    .mic-btn.listening {
      color: #ef4444;
      background: #fee2e2;
      animation: pulse-mic 1s infinite;
    }

    @keyframes pulse-mic {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    .send-circle-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-ink-black);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .send-circle-btn:hover {
      background: #2e3239;
      transform: scale(1.05);
    }

    .product-picker-popover {
      position: absolute;
      top: 100%;
      left: 16px;
      right: 16px;
      margin-top: 8px;
      background: var(--color-paper-white);
      border-radius: 16px;
      box-shadow: var(--shadow-subtle-2);
      border: 1px solid rgba(0, 0, 0, 0.08);
      padding: 12px;
      z-index: 50;
      max-height: 220px;
      overflow-y: auto;
    }

    .picker-header {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-slate-gray);
      margin-bottom: 8px;
    }

    .picker-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .picker-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 8px;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      font-size: 13px;
    }

    .picker-item:hover {
      background: var(--color-mist-gray);
    }

    .item-id {
      font-weight: 600;
      color: var(--color-sienna-brown);
      font-size: 11px;
    }

    .item-name {
      color: var(--color-ink-black);
    }

    @media (max-width: 1024px) {
      .hero-artifacts-row {
        flex-direction: column;
        align-items: center;
      }
      .drop-allocation-card, .telemetry-hype-card, .radial-spec-card, .embedded-composer-card {
        width: 100%;
        max-width: 480px;
      }
      .headline-display {
        font-size: 56px;
        letter-spacing: -1.2px;
      }
    }
  `]
})
export class HeroCollageComponent {
  store = inject(StoreService);
  voice = inject(VoiceChatService);

  composerQuery = '';
  selectedProductPin = signal<any>(null);
  showProductPicker = signal<boolean>(false);

  hubs = signal([
    { city: 'Mumbai Hub', claimed_percent: 94, status: 'Critical Low' },
    { city: 'Bengaluru Hub', claimed_percent: 88, status: 'Active Packing' },
    { city: 'Delhi NCR', claimed_percent: 91, status: 'Express Hub' },
    { city: 'Hyderabad', claimed_percent: 82, status: 'Normal Stock' }
  ]);

  toggleProductPicker() {
    this.showProductPicker.update(v => !v);
  }

  selectPin(prod: any) {
    if (this.selectedProductPin()?.id === prod.id) {
      this.selectedProductPin.set(null);
    } else {
      this.selectedProductPin.set(prod);
    }
    this.showProductPicker.set(false);
  }

  toggleVoiceInput() {
    if (this.voice.isListening()) {
      this.voice.stopListening();
    } else {
      this.voice.startListening((transcript) => {
        this.composerQuery = transcript;
        this.submitHeroPrompt();
      });
    }
  }

  submitHeroPrompt(event?: Event) {
    if (event) event.preventDefault();
    const query = this.composerQuery.trim();
    if (!query) return;

    const pinned = this.selectedProductPin();
    this.store.openConcierge(pinned, query);
    this.voice.sendMessage(query, this.store.sessionId, pinned?.id);

    this.composerQuery = '';
    this.selectedProductPin.set(null);
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
