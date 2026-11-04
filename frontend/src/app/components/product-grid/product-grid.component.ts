import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { Product } from '../../models/stride.models';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="products-section" class="catalog-section">
      <div class="catalog-container">
        
        <!-- Editorial Section Header -->
        <div class="section-header">
          <div class="header-left">
            <span class="catalog-pretitle font-sohne">CATALOG ARCHIVE</span>
            <h2 class="headline-lg">Curated Drop <em>04</em> Telemetry.</h2>
          </div>
          <div class="header-right">
            <!-- Animated High-Editorial Telemetry HUD Console -->
            <div class="telemetry-hud-widget font-sohne">
              <div class="hud-top-bar">
                <div class="hud-radar-group">
                  <span class="hud-live-ring"></span>
                  <span class="hud-title">LIVE TELEMETRY STREAM</span>
                </div>
                <span class="hud-node-tag">HUB-IST-04</span>
              </div>

              <!-- Micro telemetry telemetry stat row with live metrics -->
              <div class="hud-stat-grid">
                <div class="hud-stat-cell">
                  <span class="hud-stat-val">12/12</span>
                  <span class="hud-stat-lbl">UV & NFC Audited</span>
                </div>
                <div class="hud-divider"></div>
                <div class="hud-stat-cell">
                  <span class="hud-stat-val">96.4%</span>
                  <span class="hud-stat-lbl">Avg Cushion Index</span>
                </div>
                <div class="hud-divider"></div>
                <div class="hud-stat-cell">
                  <span class="hud-stat-val highlight">1-DAY AIR</span>
                  <span class="hud-stat-lbl">Metro Fulfillment</span>
                </div>
              </div>

              <!-- Animated laser sweep line -->
              <div class="hud-scan-line-wrap">
                <div class="hud-scan-line"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="catalog-toolbar">
          <!-- Category Filter Tabs -->
          <div class="category-pills">
            @for (cat of categories; track cat) {
              <button 
                type="button"
                (click)="selectCategory(cat)"
                class="category-pill"
                [class.active]="store.selectedCategory() === cat"
              >
                {{ cat }}
              </button>
            }
          </div>

          <!-- Search & Sort Controls -->
          <div class="filter-controls">
            <div class="search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                [ngModel]="store.searchQuery()" 
                (ngModelChange)="store.searchQuery.set($event)"
                placeholder="Search silhouettes, materials, GSM…"
                class="search-input font-sohne"
              />
            </div>

            <div class="sort-select-wrapper">
              <select 
                [ngModel]="store.sortBy()" 
                (ngModelChange)="store.sortBy.set($event)"
                class="sort-select font-sohne"
              >
                <option value="featured">Featured Allocation</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="cushion">Highest Cushioning</option>
                <option value="hype">Highest Durability</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Product Cards Grid (First 6 items) -->
        <div class="products-grid">
          @for (prod of firstBatch(); track prod.id) {
            <div class="neutral-card product-card">
              <!-- Top Row: Ghost Category Label + Hype Delta -->
              <div class="card-top-meta">
                <span class="ghost-cat-label">{{ prod.category }} · {{ prod.id }}</span>
                <span class="hype-delta-badge">{{ prod.hype_delta }}</span>
              </div>

              <!-- Product Image with Hover Quick-Size Pills -->
              <div class="image-wrapper">
                <img [src]="prod.image_url" [alt]="prod.name" class="product-img" loading="lazy" />
                
                <div class="quick-size-overlay">
                  <span class="size-hint">Quick Select Size:</span>
                  <div class="quick-sizes">
                    @for (s of prod.sizes; track s) {
                      <button 
                        type="button" 
                        (click)="quickAdd(prod, s, $event)" 
                        class="size-pill-btn"
                        [class.selected]="selectedSizes()[prod.id] === s"
                      >
                        {{ s }}
                      </button>
                    }
                  </div>
                </div>
              </div>

              <!-- Title, Subtitle & Price -->
              <div class="card-details">
                <div class="title-price-row">
                  <h3 class="product-title font-sohne">{{ prod.name }}</h3>
                  <span class="product-price font-sohne">₹{{ prod.price_inr | number }}</span>
                </div>
                <div class="product-subtitle font-sohne">{{ prod.subtitle }}</div>

                <!-- Mini Inline SVG Telemetry Sparkline in #5d2a1a stroke -->
                <div class="telemetry-spark-row">
                  <div class="spark-label">
                    <span>Cushion: <strong>{{ prod.telemetry.cushion_score }}/100</strong></span>
                    <span>·</span>
                    <span>Durability: <strong>{{ prod.telemetry.durability_score }}/100</strong></span>
                  </div>
                  <svg class="sparkline-svg" width="90" height="24" viewBox="0 0 90 24">
                    <path 
                      [attr.d]="generateSparkPath(prod.telemetry.trend_points)" 
                      fill="none" 
                      stroke="#5d2a1a" 
                      stroke-width="2" 
                      stroke-linecap="round"
                    />
                    <circle 
                      [attr.cx]="84" 
                      [attr.cy]="scaleY(prod.telemetry.trend_points[5])" 
                      r="3" 
                      fill="#5d2a1a"
                    />
                  </svg>
                </div>
              </div>

              <!-- Action Row -->
              <div class="card-action-row">
                <div class="btn-pair">
                  <button (click)="addToBag(prod)" class="pill-btn-filled btn-sm">
                    Add to Bag
                  </button>
                  <button 
                    (click)="store.toggleCompare(prod)" 
                    class="pill-btn-ghost btn-sm"
                    [class.in-compare]="isInCompare(prod.id)"
                  >
                    {{ isInCompare(prod.id) ? '✓ In Compare' : '+ Compare' }}
                  </button>
                </div>

                <!-- Product-Integrated AI Stylist Trigger Pill -->
                <button (click)="askConcierge(prod)" class="ai-stylist-pill font-sohne" title="Ask STRIDE AI about this silhouette">
                  <span class="ai-spark-icon">✦</span>
                  <span>Ask AI</span>
                </button>
              </div>

            </div>
          }
        </div>

        <!-- ================= THE SINGLE ACCENT PEACH CARD ================= -->
        <!-- Placed ONCE per page view: Syndicate Drop Editorial Highlight -->
        <div class="accent-peach-card syndicate-editorial-card">
          <div class="peach-card-grid">
            <div class="peach-left">
              <span class="peach-badge font-sohne">EDITORIAL SYNDICATE DROP SPOTLIGHT</span>
              <h3 class="headline-md peach-title">
                Air Retro High <em>'Obsidian'</em> & The STRIDE Authenticity Standard.
              </h3>
              <p class="peach-quote font-sohne">
                "In an era flooded with aftermarket replicas and inflated secondary markups, STRIDE locks down the supply chain at source. Every obsidian calfskin panel is inspected under 365nm UV luminescence and sealed with encrypted NFC provenance."
              </p>
              
              <div class="peach-specs-row font-sohne">
                <div class="spec-col">
                  <span class="spec-val">12-Point</span>
                  <span class="spec-lbl">Physical & UV Audit</span>
                </div>
                <div class="spec-col">
                  <span class="spec-val">420 Grams</span>
                  <span class="spec-lbl">Encapsulated Sole</span>
                </div>
                <div class="spec-col">
                  <span class="spec-val">7-Day</span>
                  <span class="spec-lbl">Doorstep Return</span>
                </div>
              </div>

              <div class="peach-action-row">
                <button (click)="quickAddObsidian()" class="pill-btn-peach">
                  Claim Allocation · ₹14,999
                </button>
                <div class="promo-callout font-sohne">
                  <span>10% OFF FIRST ORDER:</span>
                  <span class="promo-code-pill">CODE: STRIDE10</span>
                </div>
              </div>
            </div>

            <div class="peach-right">
              <div class="peach-image-frame">
                <img 
                  src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80" 
                  alt="Air Retro High Obsidian Spotlight"
                  class="peach-spotlight-img"
                />
                <div class="nfc-chip-tag font-sohne">
                  <span class="nfc-pulse"></span>
                  NFC #8492-BLR VERIFIED
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Remaining Product Cards Grid (Second Batch) -->
        <div class="products-grid remaining-grid">
          @for (prod of secondBatch(); track prod.id) {
            <div class="neutral-card product-card">
              <!-- Top Row: Ghost Category Label + Hype Delta -->
              <div class="card-top-meta">
                <span class="ghost-cat-label">{{ prod.category }} · {{ prod.id }}</span>
                <span class="hype-delta-badge">{{ prod.hype_delta }}</span>
              </div>

              <!-- Product Image with Hover Quick-Size Pills -->
              <div class="image-wrapper">
                <img [src]="prod.image_url" [alt]="prod.name" class="product-img" loading="lazy" />
                
                <div class="quick-size-overlay">
                  <span class="size-hint">Quick Select Size:</span>
                  <div class="quick-sizes">
                    @for (s of prod.sizes; track s) {
                      <button 
                        type="button" 
                        (click)="quickAdd(prod, s, $event)" 
                        class="size-pill-btn"
                        [class.selected]="selectedSizes()[prod.id] === s"
                      >
                        {{ s }}
                      </button>
                    }
                  </div>
                </div>
              </div>

              <!-- Title, Subtitle & Price -->
              <div class="card-details">
                <div class="title-price-row">
                  <h3 class="product-title font-sohne">{{ prod.name }}</h3>
                  <span class="product-price font-sohne">₹{{ prod.price_inr | number }}</span>
                </div>
                <div class="product-subtitle font-sohne">{{ prod.subtitle }}</div>

                <!-- Mini Inline SVG Telemetry Sparkline in #5d2a1a stroke -->
                <div class="telemetry-spark-row">
                  <div class="spark-label">
                    <span>Cushion: <strong>{{ prod.telemetry.cushion_score }}/100</strong></span>
                    <span>·</span>
                    <span>Durability: <strong>{{ prod.telemetry.durability_score }}/100</strong></span>
                  </div>
                  <svg class="sparkline-svg" width="90" height="24" viewBox="0 0 90 24">
                    <path 
                      [attr.d]="generateSparkPath(prod.telemetry.trend_points)" 
                      fill="none" 
                      stroke="#5d2a1a" 
                      stroke-width="2" 
                      stroke-linecap="round"
                    />
                    <circle 
                      [attr.cx]="84" 
                      [attr.cy]="scaleY(prod.telemetry.trend_points[5])" 
                      r="3" 
                      fill="#5d2a1a"
                    />
                  </svg>
                </div>
              </div>

              <!-- Action Row -->
              <div class="card-action-row">
                <div class="btn-pair">
                  <button (click)="addToBag(prod)" class="pill-btn-filled btn-sm">
                    Add to Bag
                  </button>
                  <button 
                    (click)="store.toggleCompare(prod)" 
                    class="pill-btn-ghost btn-sm"
                    [class.in-compare]="isInCompare(prod.id)"
                  >
                    {{ isInCompare(prod.id) ? '✓ In Compare' : '+ Compare' }}
                  </button>
                </div>

                <!-- Product-Integrated AI Stylist Trigger Pill -->
                <button (click)="askConcierge(prod)" class="ai-stylist-pill font-sohne" title="Ask STRIDE AI about this silhouette">
                  <span class="ai-spark-icon">✦</span>
                  <span>Ask AI</span>
                </button>
              </div>

            </div>
          }
        </div>

      </div>
    </section>
  `,
  styles: [`
    .catalog-section {
      max-width: var(--page-max-width);
      margin: 0 auto;
      padding: 40px 24px 80px 24px;
    }

    .catalog-container {
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 32px;
      border-bottom: 1px solid var(--color-mist-gray);
      padding-bottom: 24px;
    }

    .catalog-pretitle {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1.5px;
      color: var(--color-ash-gray);
      margin-bottom: 8px;
      display: block;
    }

    /* Animated Telemetry HUD Widget */
    .telemetry-hud-widget {
      background: var(--color-fog-white);
      border: 1px solid var(--color-mist-gray);
      border-radius: var(--radius-inputs);
      padding: 14px 20px;
      min-width: 360px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
    }

    .hud-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .hud-radar-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hud-live-ring {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: radar-ping 1.8s infinite;
    }

    @keyframes radar-ping {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }

    .hud-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-ink-black);
      letter-spacing: 1px;
    }

    .hud-node-tag {
      font-size: 10px;
      font-weight: 600;
      color: var(--color-sienna-brown);
      background: var(--color-blush-peach);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .hud-stat-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .hud-stat-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .hud-stat-val {
      font-size: 15px;
      font-weight: 700;
      color: var(--color-ink-black);
    }

    .hud-stat-val.highlight {
      color: #059669;
    }

    .hud-stat-lbl {
      font-size: 10px;
      color: var(--color-slate-gray);
      letter-spacing: 0.2px;
    }

    .hud-divider {
      width: 1px;
      height: 24px;
      background: var(--color-mist-gray);
    }

    .hud-scan-line-wrap {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: rgba(0, 0, 0, 0.04);
      overflow: hidden;
    }

    .hud-scan-line {
      width: 30%;
      height: 100%;
      background: linear-gradient(90deg, transparent, var(--color-sienna-brown), transparent);
      animation: scan-sweep 2.8s linear infinite;
    }

    @keyframes scan-sweep {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(400%); }
    }

    /* Toolbar */
    .catalog-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .category-pills {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .category-pill {
      background: var(--color-mist-gray);
      border: 1px solid transparent;
      border-radius: 9999px;
      padding: 8px 18px;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-slate-gray);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .category-pill:hover {
      color: var(--color-ink-black);
      background: #e7e7e8;
    }

    .category-pill.active {
      background: var(--color-ink-black);
      color: var(--color-paper-white);
    }

    .filter-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-mist-gray);
      border-radius: 9999px;
      padding: 8px 16px;
      color: var(--color-slate-gray);
    }

    .search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
      color: var(--color-ink-black);
      width: 220px;
    }

    .sort-select {
      background: var(--color-mist-gray);
      border: none;
      border-radius: 9999px;
      padding: 9px 16px;
      font-size: 14px;
      color: var(--color-ink-black);
      outline: none;
      cursor: pointer;
    }

    /* Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .product-card {
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: transform 0.2s ease;
    }

    .product-card:hover {
      transform: translateY(-2px);
    }

    .card-top-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .ghost-cat-label {
      font-size: 13px;
      color: var(--color-ash-gray);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .hype-delta-badge {
      font-size: 12px;
      color: #059669;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.08);
      padding: 2px 8px;
      border-radius: 9999px;
    }

    .image-wrapper {
      position: relative;
      width: 100%;
      height: 250px;
      border-radius: var(--radius-images);
      overflow: hidden;
      background: #e7e7e8;
    }

    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-img {
      transform: scale(1.03);
    }

    .quick-size-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(23, 25, 28, 0.88);
      backdrop-filter: blur(6px);
      padding: 10px 12px;
      transform: translateY(100%);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .image-wrapper:hover .quick-size-overlay {
      transform: translateY(0);
    }

    .size-hint {
      font-size: 11px;
      color: #d1d5db;
      font-weight: 500;
    }

    .quick-sizes {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .size-pill-btn {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      border-radius: 9999px;
      padding: 2px 8px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .size-pill-btn:hover, .size-pill-btn.selected {
      background: #ffffff;
      color: var(--color-ink-black);
    }

    .card-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .title-price-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
    }

    .product-title {
      font-size: 19px;
      font-weight: 500;
      color: var(--color-ink-black);
      line-height: 1.25;
    }

    .product-price {
      font-size: 17px;
      font-weight: 600;
      color: var(--color-ink-black);
      white-space: nowrap;
    }

    .product-subtitle {
      font-size: 13px;
      color: var(--color-slate-gray);
    }

    .telemetry-spark-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
      padding-top: 8px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    .spark-label {
      font-size: 12px;
      color: var(--color-slate-gray);
      display: flex;
      gap: 4px;
    }

    .card-action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 8px;
    }

    .btn-pair {
      display: flex;
      gap: 8px;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 13px;
    }

    .in-compare {
      background: var(--color-sienna-brown) !important;
      color: var(--color-blush-peach) !important;
      border-color: var(--color-sienna-brown) !important;
    }

    /* Tactile UI-Oriented AI Stylist Button */
    .ai-stylist-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, rgba(251, 225, 209, 0.45) 0%, rgba(255, 255, 255, 0.9) 100%);
      border: 1px solid rgba(93, 42, 26, 0.22);
      border-radius: 9999px;
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-sienna-brown);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 2px 8px rgba(93, 42, 26, 0.06);
      white-space: nowrap;
    }

    .ai-stylist-pill:hover {
      background: linear-gradient(135deg, rgba(251, 225, 209, 0.8) 0%, #ffffff 100%);
      border-color: rgba(93, 42, 26, 0.45);
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(93, 42, 26, 0.16);
    }

    .ai-spark-icon {
      font-size: 13px;
      color: var(--color-sienna-brown);
      display: inline-block;
      transition: transform 0.25s ease;
    }

    .ai-stylist-pill:hover .ai-spark-icon {
      transform: rotate(20deg) scale(1.2);
    }

    /* ================= SINGLE ACCENT PEACH CARD ================= */
    .syndicate-editorial-card {
      margin: 20px 0;
    }

    .peach-card-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 40px;
      align-items: center;
    }

    .peach-badge {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1.5px;
      color: var(--color-sienna-brown);
      margin-bottom: 12px;
      display: block;
      opacity: 0.85;
    }

    .peach-title {
      color: var(--color-sienna-brown);
      margin-bottom: 16px;
    }

    .peach-quote {
      font-size: 16px;
      line-height: 1.6;
      color: #6d3322;
      margin-bottom: 24px;
      font-style: italic;
    }

    .peach-specs-row {
      display: flex;
      gap: 32px;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(93, 42, 26, 0.15);
    }

    .spec-col {
      display: flex;
      flex-direction: column;
    }

    .spec-val {
      font-size: 20px;
      font-weight: 700;
      color: var(--color-sienna-brown);
    }

    .spec-lbl {
      font-size: 12px;
      color: #7b4231;
    }

    .peach-action-row {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .promo-callout {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-sienna-brown);
    }

    .promo-code-pill {
      background: var(--color-sienna-brown);
      color: var(--color-blush-peach);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      letter-spacing: 0.5px;
    }

    .peach-image-frame {
      position: relative;
      border-radius: var(--radius-images);
      overflow: hidden;
      height: 320px;
      box-shadow: 0 12px 32px rgba(93, 42, 26, 0.15);
    }

    .peach-spotlight-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .nfc-chip-tag {
      position: absolute;
      bottom: 14px;
      left: 14px;
      background: rgba(23, 25, 28, 0.9);
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .nfc-pulse {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    @media (max-width: 1024px) {
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .peach-card-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .products-grid {
        grid-template-columns: 1fr;
      }
      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class ProductGridComponent {
  store = inject(StoreService);

  categories = ['All', 'Sneakers', 'Runners', 'Streetwear', 'Accessories'];
  selectedSizes = signal<Record<string, string>>({});

  selectCategory(cat: string) {
    this.store.selectedCategory.set(cat);
  }

  firstBatch() {
    return this.store.filteredProducts().slice(0, 6);
  }

  secondBatch() {
    return this.store.filteredProducts().slice(6);
  }

  isInCompare(id: string): boolean {
    return this.store.comparedProducts().some(p => p.id === id);
  }

  quickAdd(prod: Product, size: string, event: Event) {
    event.stopPropagation();
    const current = { ...this.selectedSizes() };
    current[prod.id] = size;
    this.selectedSizes.set(current);
    this.store.addToCart(prod, size);
  }

  addToBag(prod: Product) {
    const size = this.selectedSizes()[prod.id] || prod.sizes[0] || 'UK 9';
    this.store.addToCart(prod, size);
  }

  quickAddObsidian() {
    const obsidian = this.store.products().find(p => p.id === 'STR-01');
    if (obsidian) {
      this.store.addToCart(obsidian, 'UK 9');
    }
  }

  askConcierge(prod: Product) {
    this.store.openConcierge(prod);
  }

  generateSparkPath(points: number[]): string {
    if (!points || points.length < 2) return 'M 0 12 L 90 12';
    const step = 84 / (points.length - 1);
    const coords = points.map((val, idx) => {
      const x = idx * step + 4;
      const y = this.scaleY(val);
      return `${x},${y}`;
    });
    return 'M ' + coords.join(' L ');
  }

  scaleY(val: number): number {
    // scale 0-100 to y (20 to 4)
    const norm = Math.max(0, Math.min(100, val));
    return 20 - (norm / 100) * 16;
  }
}
