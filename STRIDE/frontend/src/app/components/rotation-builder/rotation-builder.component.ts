import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { RotationResult } from '../../models/stride.models';

@Component({
  selector: 'app-rotation-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="rotation-section" class="rotation-section">
      <div class="rotation-container">
        
        <!-- Section Header -->
        <div class="rotation-header">
          <span class="rotation-pretitle font-sohne">ALGORITHMIC CURATION</span>
          <h2 class="headline-lg">AI Outfit <em>&</em> Rotation Builder.</h2>
          <p class="rotation-desc font-sohne">
            Set your budget and aesthetic direction. STRIDE's in-memory synergy algorithm pairs 1 Footwear, 1 Streetwear garment, and 1 Accessory with unified telemetry.
          </p>
        </div>

        <!-- Controls Box -->
        <div class="neutral-card controls-card">
          <!-- Vibe Selector -->
          <div class="vibe-group">
            <span class="control-label font-sohne">Select Aesthetic Vibe:</span>
            <div class="vibe-pills">
              @for (v of vibes; track v) {
                <button 
                  type="button" 
                  (click)="setVibe(v)" 
                  class="vibe-pill-btn font-sohne"
                  [class.active]="selectedVibe() === v"
                >
                  {{ v }}
                </button>
              }
            </div>
          </div>

          <!-- Budget Slider -->
          <div class="budget-group">
            <div class="budget-meta font-sohne">
              <span class="control-label">Target INR Budget:</span>
              <span class="budget-value">₹{{ budget() | number }}</span>
            </div>
            <input 
              type="range" 
              min="8000" 
              max="35000" 
              step="1000" 
              [(ngModel)]="budget" 
              (ngModelChange)="onBudgetChange()" 
              class="budget-slider"
            />
            <div class="slider-limits font-sohne">
              <span>₹8,000</span>
              <span>₹20,000</span>
              <span>₹35,000</span>
            </div>
          </div>
        </div>

        <!-- Curated 3-Piece Rotation Display -->
        @if (loading()) {
          <div class="loading-state font-sohne">
            <span class="loading-spinner"></span>
            <span>Synthesizing optimal rotation telemetry…</span>
          </div>
        } @else if (rotation()) {
          <div class="rotation-result-box">
            
            <!-- Telemetry Synergy Summary Bar -->
            <div class="synergy-bar font-sohne">
              <div class="synergy-col">
                <span class="syn-label">Synergy Score</span>
                <span class="syn-value">{{ rotation()?.synergy_score }}/100</span>
              </div>
              <div class="synergy-col">
                <span class="syn-label">Rotation Total</span>
                <span class="syn-value price">₹{{ rotation()?.total_inr | number }}</span>
                <span class="syn-orig">Original: ₹{{ rotation()?.original_total_inr | number }}</span>
              </div>
              <div class="synergy-col">
                <span class="syn-label">Bundle Savings</span>
                <span class="syn-value savings">Save ₹{{ rotation()?.savings_inr | number }}</span>
              </div>
              <div class="synergy-col">
                <span class="syn-label">Total Carry Weight</span>
                <span class="syn-value">{{ rotation()?.telemetry_summary?.total_weight_grams }}g</span>
              </div>
            </div>

            <!-- 3 Item Cards Grid -->
            <div class="items-grid">
              @for (item of rotation()?.rotation_items; track item.id; let idx = $index) {
                <div class="item-card neutral-card">
                  <div class="item-role font-sohne">
                    <span class="role-badge">
                      {{ idx === 0 ? '01 · FOOTWEAR' : idx === 1 ? '02 · STREETWEAR' : '03 · ACCESSORY' }}
                    </span>
                    <span class="item-id">{{ item.id }}</span>
                  </div>

                  <div class="item-thumb-wrap">
                    <img [src]="item.image_url" [alt]="item.name" class="item-thumb" />
                  </div>

                  <div class="item-info">
                    <h4 class="item-title font-sohne">{{ item.name }}</h4>
                    <p class="item-sub font-sohne">{{ item.subtitle }}</p>
                    <div class="item-price font-sohne">₹{{ item.price_inr | number }}</div>
                  </div>

                  <div class="item-telemetry-pill font-sohne">
                    <span>Cushion: <strong>{{ item.telemetry.cushion_score }}</strong></span>
                    <span>·</span>
                    <span>Durability: <strong>{{ item.telemetry.durability_score }}</strong></span>
                  </div>
                </div>
              }
            </div>

            <!-- 1-Click Action Bar -->
            <div class="action-footer">
              <button (click)="addFullRotationToBag()" class="pill-btn-filled font-sohne btn-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <span>Add Full 3-Piece Rotation to Bag · ₹{{ rotation()?.total_inr | number }}</span>
              </button>
            </div>

          </div>
        }

      </div>
    </section>
  `,
  styles: [`
    .rotation-section {
      background-color: var(--color-fog-white);
      padding: 80px 24px;
      border-top: 1px solid var(--color-mist-gray);
      border-bottom: 1px solid var(--color-mist-gray);
    }

    .rotation-container {
      max-width: var(--page-max-width);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    .rotation-header {
      text-align: center;
      max-width: 720px;
      margin: 0 auto;
    }

    .rotation-pretitle {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1.5px;
      color: var(--color-sienna-brown);
      margin-bottom: 8px;
      display: block;
    }

    .rotation-desc {
      font-size: 16px;
      color: var(--color-slate-gray);
      line-height: 1.6;
      margin-top: 14px;
    }

    .controls-card {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 36px;
      padding: 28px 36px;
      background: var(--color-paper-white);
      border: 1px solid var(--color-mist-gray);
    }

    .control-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-ink-black);
      display: block;
      margin-bottom: 12px;
    }

    .vibe-pills {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .vibe-pill-btn {
      background: var(--color-mist-gray);
      border: 1px solid transparent;
      border-radius: 9999px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      color: var(--color-slate-gray);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .vibe-pill-btn:hover {
      color: var(--color-ink-black);
      background: #e6e6e8;
    }

    .vibe-pill-btn.active {
      background: var(--color-ink-black);
      color: var(--color-paper-white);
    }

    .budget-meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 12px;
    }

    .budget-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--color-sienna-brown);
    }

    .budget-slider {
      width: 100%;
      height: 6px;
      background: var(--color-mist-gray);
      border-radius: 9999px;
      outline: none;
      -webkit-appearance: none;
      appearance: none;
      accent-color: var(--color-sienna-brown);
      cursor: pointer;
    }

    .slider-limits {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--color-ash-gray);
      margin-top: 6px;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 40px;
      color: var(--color-slate-gray);
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-mist-gray);
      border-top-color: var(--color-sienna-brown);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .rotation-result-box {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .synergy-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      background: var(--color-paper-white);
      border: 1px solid var(--color-mist-gray);
      border-radius: var(--radius-inputs);
      padding: 16px 24px;
      gap: 16px;
    }

    .synergy-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .syn-label {
      font-size: 11px;
      color: var(--color-slate-gray);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .syn-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-ink-black);
    }

    .syn-value.price {
      color: var(--color-ink-black);
    }

    .syn-orig {
      font-size: 12px;
      color: var(--color-ash-gray);
      text-decoration: line-through;
    }

    .syn-value.savings {
      color: #059669;
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .item-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--color-paper-white);
      border: 1px solid var(--color-mist-gray);
    }

    .item-role {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
    }

    .role-badge {
      font-weight: 700;
      color: var(--color-sienna-brown);
      letter-spacing: 0.5px;
    }

    .item-id {
      color: var(--color-slate-gray);
    }

    .item-thumb-wrap {
      width: 100%;
      height: 180px;
      border-radius: var(--radius-images);
      overflow: hidden;
      background: var(--color-mist-gray);
    }

    .item-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-title {
      font-size: 17px;
      font-weight: 600;
      color: var(--color-ink-black);
    }

    .item-sub {
      font-size: 13px;
      color: var(--color-slate-gray);
      margin: 2px 0 6px 0;
    }

    .item-price {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-ink-black);
    }

    .item-telemetry-pill {
      font-size: 12px;
      color: var(--color-slate-gray);
      background: var(--color-mist-gray);
      padding: 6px 12px;
      border-radius: 9999px;
      display: flex;
      gap: 6px;
      margin-top: auto;
    }

    .action-footer {
      display: flex;
      justify-content: center;
      padding-top: 12px;
    }

    .btn-lg {
      padding: 16px 36px;
      font-size: 16px;
    }

    @media (max-width: 900px) {
      .controls-card {
        grid-template-columns: 1fr;
      }
      .synergy-bar {
        grid-template-columns: repeat(2, 1fr);
      }
      .items-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RotationBuilderComponent implements OnInit {
  store = inject(StoreService);

  vibes = ["Monochrome Street", "Marathon & Recovery", "Boardroom to Afterhours"];
  selectedVibe = signal<string>("Monochrome Street");
  budget = signal<number>(15000);
  rotation = signal<RotationResult | null>(null);
  loading = signal<boolean>(false);

  ngOnInit() {
    this.generateRotation();
  }

  setVibe(v: string) {
    this.selectedVibe.set(v);
    this.generateRotation();
  }

  onBudgetChange() {
    this.generateRotation();
  }

  generateRotation() {
    this.loading.set(true);
    this.store.buildRotation(this.budget(), this.selectedVibe()).subscribe({
      next: (res) => {
        this.rotation.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.warn('Rotation builder error:', err);
        this.loading.set(false);
      }
    });
  }

  addFullRotationToBag() {
    const rot = this.rotation();
    if (!rot) return;

    for (const item of rot.rotation_items) {
      this.store.addToCart(item, item.sizes[0]);
    }
  }
}
