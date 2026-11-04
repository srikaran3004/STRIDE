import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { VoiceChatService } from '../../services/voice-chat.service';

@Component({
  selector: 'app-compare-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (store.isCompareOpen()) {
      <div class="modal-backdrop" (click)="close()">
        <div class="floating-artifact compare-modal" (click)="$event.stopPropagation()">
          
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-titles">
              <span class="compare-badge font-sohne">STEEP TELEMETRY COMPARISON</span>
              <h3 class="headline-md modal-title">
                Side-by-Side <em>Audit</em>.
              </h3>
            </div>
            <button (click)="close()" class="close-btn" title="Close">✕</button>
          </div>

          @if (store.comparedProducts().length === 0) {
            <div class="empty-state font-sohne">
              <p>No products selected for comparison yet.</p>
              <p class="empty-hint">Click "+ Compare" on any 2 footwear or garment cards in the catalog to overlay telemetry.</p>
            </div>
          } @else {

            <!-- Side-by-Side Product Header Columns -->
            <div class="compare-grid">
              @for (prod of store.comparedProducts(); track prod.id; let idx = $index) {
                <div class="compare-col" [class.prod-one]="idx === 0" [class.prod-two]="idx === 1">
                  <div class="col-product-card">
                    <img [src]="prod.image_url" [alt]="prod.name" class="compare-thumb" />
                    <div class="col-meta">
                      <div class="col-id font-sohne">
                        <span class="color-dot" [style.background]="idx === 0 ? '#17191c' : '#5d2a1a'"></span>
                        {{ prod.id }} · {{ prod.category }}
                      </div>
                      <h4 class="col-name font-sohne">{{ prod.name }}</h4>
                      <div class="col-price font-sohne">₹{{ prod.price_inr | number }}</div>
                    </div>
                    <button (click)="store.removeFromCompare(prod.id)" class="remove-pill-btn" title="Remove">
                      Remove
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Overlaid SVG Performance Curves (#17191c vs #5d2a1a) -->
            <div class="curve-section">
              <div class="curve-header font-sohne">
                <span>Overlaid Hype & Demand Trajectory</span>
                <div class="curve-legend">
                  @if (store.comparedProducts()[0]) {
                    <span class="legend-item"><span class="legend-dot dot-black"></span> {{ store.comparedProducts()[0].name }}</span>
                  }
                  @if (store.comparedProducts()[1]) {
                    <span class="legend-item"><span class="legend-dot dot-sienna"></span> {{ store.comparedProducts()[1].name }}</span>
                  }
                </div>
              </div>

              <div class="curve-svg-box">
                <svg viewBox="0 0 500 120" preserveAspectRatio="none" class="overlaid-svg">
                  <!-- Curve 1: #17191c -->
                  @if (store.comparedProducts()[0]) {
                    <path 
                      [attr.d]="generateCurve(store.comparedProducts()[0].telemetry.trend_points)" 
                      fill="none" 
                      stroke="#17191c" 
                      stroke-width="3" 
                      stroke-linecap="round"
                    />
                  }
                  <!-- Curve 2: #5d2a1a -->
                  @if (store.comparedProducts()[1]) {
                    <path 
                      [attr.d]="generateCurve(store.comparedProducts()[1].telemetry.trend_points)" 
                      fill="none" 
                      stroke="#5d2a1a" 
                      stroke-width="3" 
                      stroke-dasharray="4,4"
                      stroke-linecap="round"
                    />
                  }
                </svg>
              </div>
            </div>

            <!-- Spec Telemetry Comparison Rows -->
            <div class="telemetry-table font-sohne">
              <div class="table-row">
                <span class="row-label">Cushioning Score</span>
                <div class="row-values">
                  @for (prod of store.comparedProducts(); track prod.id; let idx = $index) {
                    <div class="val-metric">
                      <div class="bar-outer">
                        <div class="bar-inner" 
                             [style.width.%]="prod.telemetry.cushion_score"
                             [style.background]="idx === 0 ? '#17191c' : '#5d2a1a'"></div>
                      </div>
                      <span class="num">{{ prod.telemetry.cushion_score }}/100</span>
                    </div>
                  }
                </div>
              </div>

              <div class="table-row">
                <span class="row-label">Durability Index</span>
                <div class="row-values">
                  @for (prod of store.comparedProducts(); track prod.id; let idx = $index) {
                    <div class="val-metric">
                      <div class="bar-outer">
                        <div class="bar-inner" 
                             [style.width.%]="prod.telemetry.durability_score"
                             [style.background]="idx === 0 ? '#17191c' : '#5d2a1a'"></div>
                      </div>
                      <span class="num">{{ prod.telemetry.durability_score }}/100</span>
                    </div>
                  }
                </div>
              </div>

              <div class="table-row">
                <span class="row-label">Weight</span>
                <div class="row-values">
                  @for (prod of store.comparedProducts(); track prod.id) {
                    <div class="val-metric">
                      <strong>{{ prod.telemetry.weight_grams }} grams</strong>
                    </div>
                  }
                </div>
              </div>

              <div class="table-row">
                <span class="row-label">Material Provenance</span>
                <div class="row-values">
                  @for (prod of store.comparedProducts(); track prod.id) {
                    <div class="val-metric material-text">
                      {{ prod.telemetry.material_grade }}
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- 1-Click "Ask AI Which Suits Me Better →" Action -->
            <div class="modal-footer">
              <button (click)="askAiWhichSuitsMe()" class="pill-btn-peach font-sohne">
                Ask AI Which Suits Me Better →
              </button>
            </div>

          }

        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(23, 25, 28, 0.45);
      backdrop-filter: blur(8px);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .compare-modal {
      width: 100%;
      max-width: 720px;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 32px;
      animation: modalFadeIn 0.25s ease-out;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .compare-badge {
      font-size: 11px;
      letter-spacing: 1.5px;
      font-weight: 600;
      color: var(--color-sienna-brown);
      display: block;
      margin-bottom: 4px;
    }

    .modal-title {
      font-size: 32px;
    }

    .close-btn {
      background: var(--color-mist-gray);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-slate-gray);
    }

    .close-btn:hover {
      background: #e5e5e6;
      color: var(--color-ink-black);
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--color-slate-gray);
    }

    .empty-hint {
      font-size: 14px;
      color: var(--color-ash-gray);
      margin-top: 8px;
    }

    .compare-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .col-product-card {
      background: var(--color-fog-white);
      border: 1px solid var(--color-mist-gray);
      border-radius: var(--radius-images);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: relative;
    }

    .compare-thumb {
      width: 100%;
      height: 140px;
      object-fit: cover;
      border-radius: 8px;
    }

    .col-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .col-id {
      font-size: 11px;
      color: var(--color-slate-gray);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .color-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .col-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-ink-black);
    }

    .col-price {
      font-size: 15px;
      font-weight: 700;
      color: var(--color-ink-black);
    }

    .remove-pill-btn {
      align-self: flex-start;
      background: none;
      border: 1px solid var(--color-mist-gray);
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 11px;
      color: var(--color-slate-gray);
      cursor: pointer;
    }

    .remove-pill-btn:hover {
      border-color: #ef4444;
      color: #ef4444;
    }

    /* Curve section */
    .curve-section {
      background: var(--color-fog-white);
      border-radius: var(--radius-images);
      padding: 16px;
      border: 1px solid var(--color-mist-gray);
    }

    .curve-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 12px;
      color: var(--color-slate-gray);
    }

    .curve-legend {
      display: flex;
      gap: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot-black { background: #17191c; }
    .dot-sienna { background: #5d2a1a; }

    .curve-svg-box {
      width: 100%;
      height: 100px;
    }

    .overlaid-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    /* Telemetry table */
    .telemetry-table {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .table-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      align-items: center;
      gap: 16px;
      padding: 8px 0;
      border-bottom: 1px solid var(--color-mist-gray);
    }

    .row-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-slate-gray);
    }

    .row-values {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .val-metric {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .bar-outer {
      flex: 1;
      height: 6px;
      background: var(--color-mist-gray);
      border-radius: 9999px;
      overflow: hidden;
    }

    .bar-inner {
      height: 100%;
      border-radius: 9999px;
    }

    .num {
      font-size: 11px;
      font-weight: 600;
      min-width: 48px;
    }

    .material-text {
      font-size: 12px;
      color: var(--color-slate-gray);
      line-height: 1.3;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 8px;
    }

    @media (max-width: 600px) {
      .compare-grid, .row-values {
        grid-template-columns: 1fr;
      }
      .table-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CompareDrawerComponent {
  store = inject(StoreService);
  voice = inject(VoiceChatService);

  close() {
    this.store.isCompareOpen.set(false);
  }

  generateCurve(points: number[]): string {
    if (!points || points.length < 2) return 'M 0,60 L 500,60';
    const step = 480 / (points.length - 1);
    const coords = points.map((val, idx) => {
      const x = idx * step + 10;
      const y = 110 - (val / 100) * 90;
      return `${x},${y}`;
    });
    return 'M ' + coords.join(' L ');
  }

  askAiWhichSuitsMe() {
    const prods = this.store.comparedProducts();
    if (prods.length === 0) return;
    
    let query = '';
    if (prods.length === 1) {
      query = `Which runner or sneaker should I pair with the ${prods[0].name}?`;
    } else {
      query = `Compare ${prods[0].name} (₹${prods[0].price_inr}) vs ${prods[1].name} (₹${prods[1].price_inr}). Which silhouette suits high-energy city walking and long wear better?`;
    }

    this.close();
    this.store.openConcierge(prods[0], query);
    this.voice.sendMessage(query, this.store.sessionId, prods[0].id);
  }
}
