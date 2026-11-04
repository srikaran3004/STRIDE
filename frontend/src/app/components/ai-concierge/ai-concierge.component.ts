import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { VoiceChatService } from '../../services/voice-chat.service';
import { Product, ChatMessage } from '../../models/stride.models';

@Component({
  selector: 'app-ai-concierge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- ================= GEN-Z SNEAKERHEAD AI COPILOT LAUNCHER ================= -->
    <button 
      (click)="toggleConcierge()" 
      class="copilot-floating-pill font-sohne"
      [class.active]="store.isConciergeOpen()"
      title="STRIDE AI Copilot — GenZ Streetwear & Sneaker Stylist"
    >
      <div class="copilot-icon-badge">
        @if (voice.isSpeaking()) {
          <span class="voice-visualizer">
            <span class="visualizer-bar"></span>
            <span class="visualizer-bar"></span>
            <span class="visualizer-bar"></span>
            <span class="visualizer-bar"></span>
            <span class="visualizer-bar"></span>
          </span>
        } @else {
          <!-- Stylized Sneaker Silhouette with Sparkle -->
          <svg class="copilot-sneaker-svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M2 17.5C2 17.5 4 18 6 18C9 18 10.5 16.5 13 16.5C16 16.5 18 18 22 18V15C20 15 18.5 14 17 12L15 8C14.5 7 13.5 6.5 12 6.5H9C8 6.5 7.5 7 7 8L5 13C4 13.5 2 14.5 2 17.5Z" stroke="#fbe1d1" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M8 11.5L10 8" stroke="#fbe1d1" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M11 11.5L13 8" stroke="#fbe1d1" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="19" cy="8" r="1.5" fill="#fbe1d1"/>
            <path d="M19 4V6M17 5H21" stroke="#fbe1d1" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        }
      </div>

      <div class="copilot-text-group">
        <span class="copilot-tag">COPILOT ✦</span>
        <span class="copilot-status">
          <span class="live-dot-pulse"></span>
          <span>ONLINE</span>
        </span>
      </div>

      @if (store.pinnedProduct()) {
        <span class="pinned-indicator">@{{ store.pinnedProduct()?.id }}</span>
      }
    </button>

    <!-- ================= CONCIERGE CHAT WINDOW ================= -->
    @if (store.isConciergeOpen()) {
      <div 
        class="concierge-modal-container font-sohne" 
        (click)="$event.stopPropagation()"
        [style.width.px]="windowWidth()"
        [style.height.px]="windowHeight()"
      >
        <!-- Corner & Edge Resize Handles (Arrow cursor hover extension) -->
        <div class="resize-handle top-edge" (mousedown)="onResizeStart($event, 'top')" title="Drag to resize height"></div>
        <div class="resize-handle left-edge" (mousedown)="onResizeStart($event, 'left')" title="Drag to resize width"></div>
        <div class="resize-handle top-left" (mousedown)="onResizeStart($event, 'both')" title="Drag corner to resize">
          <div class="corner-grip-notch">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <!-- Header -->
        <div class="concierge-header">
          <div class="header-info">
            <div class="concierge-title-row">
              <span class="copilot-avatar-icon">👟</span>
              <h3 class="font-signifier concierge-title">STRIDE Copilot ✦</h3>
              <span class="engine-badge">In-Memory Engine</span>
            </div>
            <div class="concierge-subtitle">
              Sizing fits, 3-piece rotations, legit checks & live orders
            </div>
          </div>

          <div class="header-actions">
            <!-- Voice Mute/Unmute Toggle -->
            <button 
              (click)="toggleVoiceMute()" 
              class="icon-header-btn" 
              [title]="voice.isMuted() ? 'Unmute Voice Assistant' : 'Mute Voice Assistant'"
            >
              @if (voice.isMuted()) {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="1" y1="1" x2="23" y2="23"/>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              } @else {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              }
            </button>

            <!-- Close Window -->
            <button (click)="store.closeConcierge()" class="icon-header-btn" title="Close">✕</button>
          </div>
        </div>

        <!-- Speaking Visualizer Banner -->
        @if (voice.isSpeaking()) {
          <div class="speaking-banner">
            <span class="speaking-label font-sohne">Voice Assistant Speaking:</span>
            <div class="voice-visualizer">
              <span class="visualizer-bar"></span>
              <span class="visualizer-bar"></span>
              <span class="visualizer-bar"></span>
              <span class="visualizer-bar"></span>
              <span class="visualizer-bar"></span>
            </div>
            <button (click)="voice.stopSpeaking()" class="stop-speech-pill">Stop</button>
          </div>
        }

        <!-- Chat Conversation Messages Body -->
        <div class="messages-container" #scrollContainer>
          @for (msg of voice.messages(); track msg.id) {
            <div class="chat-message-row" [class.user-row]="msg.sender === 'user'" [class.concierge-row]="msg.sender === 'concierge'">
              
              <div class="bubble-wrap">
                <!-- Context Badges (proving keyword slicer only sent matched data) -->
                @if (msg.badges && msg.badges.length > 0) {
                  <div class="badges-row">
                    @for (badge of msg.badges; track badge) {
                      <span class="context-badge font-sohne">{{ badge }}</span>
                    }
                    @if (msg.latency_ms) {
                      <span class="latency-badge">{{ msg.latency_ms }}ms</span>
                    }
                  </div>
                }

                <div class="message-bubble" [innerHTML]="formatMarkdown(msg.text)"></div>

                <!-- Interactive Listen to Audio Summary Button (Only speaks when clicked!) -->
                @if (msg.sender === 'concierge' && msg.spoken_text) {
                  <div class="speech-replay-row">
                    <button (click)="togglePlayMessage(msg)" class="listen-audio-btn font-sohne" [class.playing]="isPlaying(msg.id)">
                      @if (isPlaying(msg.id)) {
                        <span class="btn-soundwave">
                          <span class="bar"></span><span class="bar"></span><span class="bar"></span>
                        </span>
                        <span>Playing Summary · Click to Stop</span>
                      } @else {
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                        </svg>
                        <span>Listen to Audio Summary</span>
                      }
                    </button>
                  </div>
                }

                <!-- Matched Mini Product Cards in Chat -->
                @if (msg.matched_products && msg.matched_products.length > 0) {
                  <div class="matched-products-scroll">
                    @for (prod of msg.matched_products; track prod.id) {
                      <div class="chat-product-chip">
                        <img [src]="prod.image_url" [alt]="prod.name" class="chip-img" />
                        <div class="chip-info">
                          <span class="chip-id">{{ prod.id }}</span>
                          <span class="chip-name">{{ prod.name }}</span>
                          <span class="chip-price">₹{{ prod.price_inr | number }}</span>
                        </div>
                        <button (click)="store.addToCart(prod)" class="chip-add-btn">
                          + Bag
                        </button>
                      </div>
                    }
                  </div>
                }

                <!-- Follow-Up Suggestion Pills -->
                @if (msg.suggested_followups && msg.suggested_followups.length > 0) {
                  <div class="followup-pills-row">
                    @for (f of msg.suggested_followups; track f) {
                      <button (click)="sendQuery(f)" class="followup-pill font-sohne">
                        {{ f }}
                      </button>
                    }
                  </div>
                }

              </div>

            </div>
          }

          @if (voice.isLoading()) {
            <div class="chat-message-row concierge-row">
              <div class="bubble-wrap">
                <div class="message-bubble loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Composer & Context Area -->
        <div class="concierge-composer-box">
          <!-- Active Pinned Product Chip -->
          @if (store.pinnedProduct(); as pinned) {
            <div class="pinned-context-bar font-sohne">
              <div class="pinned-meta">
                <span class="pinned-label">Pinned Context:</span>
                <span class="pinned-chip">@{{ pinned.name }} (₹{{ pinned.price_inr | number }})</span>
              </div>
              <button (click)="clearPin()" class="clear-pin-btn" title="Remove Context Pin">✕</button>
            </div>
          }

          <form (submit)="onFormSubmit($event)" class="composer-form">
            <input 
              type="text" 
              [(ngModel)]="chatInput" 
              name="chatQuery"
              [placeholder]="store.pinnedProduct() ? 'Ask about ' + store.pinnedProduct()?.name + '…' : 'Ask about sizing, runners, returns, or order #…'" 
              class="concierge-input font-sohne"
              autocomplete="off"
            />

            <!-- Speech-to-Text Microphone Button -->
            <button 
              type="button" 
              (click)="toggleListening()" 
              class="composer-mic-btn"
              [class.pulsing-mic]="voice.isListening()"
              title="Voice Input (Speech-to-Text)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>

            <!-- Send Button -->
            <button type="submit" class="composer-send-btn" [disabled]="!chatInput.trim()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">
                <path d="M5 12h14"/>
                <path d="M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>
        </div>

      </div>
    }
  `,
  styles: [`
    /* Gen-Z Sneakerhead Floating Copilot Pill */
    .copilot-floating-pill {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 150;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #17191c;
      color: #ffffff;
      border: 1px solid rgba(251, 225, 209, 0.35);
      border-radius: 9999px;
      padding: 10px 20px 10px 14px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.28), 0 0 16px rgba(93, 42, 26, 0.2);
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .copilot-floating-pill:hover {
      background: #23262c;
      transform: translateY(-3px) scale(1.02);
      border-color: rgba(251, 225, 209, 0.6);
      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.35), 0 0 24px rgba(93, 42, 26, 0.35);
    }

    .copilot-floating-pill.active {
      background: #5d2a1a;
      border-color: #fbe1d1;
      box-shadow: 0 8px 32px rgba(93, 42, 26, 0.45);
    }

    .copilot-icon-badge {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s ease;
    }

    .copilot-floating-pill:hover .copilot-icon-badge {
      transform: scale(1.1) rotate(-6deg);
    }

    .copilot-text-group {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.15;
    }

    .copilot-tag {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #fbe1d1;
    }

    .copilot-status {
      font-size: 9px;
      color: #9ca3af;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .live-dot-pulse {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    .copilot-avatar-icon {
      font-size: 18px;
    }

    .pinned-indicator {
      background: rgba(255, 255, 255, 0.2);
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 9999px;
    }

    /* Modal Container */
    .concierge-modal-container {
      position: fixed;
      bottom: 84px;
      right: 24px;
      width: 380px;
      height: 500px;
      min-width: 320px;
      max-width: calc(100vw - 32px);
      min-height: 360px;
      max-height: calc(100vh - 125px);
      background: var(--color-paper-white);
      border-radius: 20px;
      box-shadow: var(--shadow-subtle-3);
      border: 1px solid rgba(0, 0, 0, 0.08);
      z-index: 160;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: popoverFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Arrow cursor resize handles */
    .resize-handle {
      position: absolute;
      z-index: 200;
      user-select: none;
    }

    .resize-handle.top-edge {
      top: 0;
      left: 20px;
      right: 0;
      height: 8px;
      cursor: ns-resize;
    }

    .resize-handle.left-edge {
      top: 20px;
      left: 0;
      bottom: 0;
      width: 8px;
      cursor: ew-resize;
    }

    .resize-handle.top-left {
      top: 0;
      left: 0;
      width: 24px;
      height: 24px;
      cursor: nwse-resize;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .corner-grip-notch {
      display: flex;
      gap: 2px;
      opacity: 0.3;
      transform: rotate(-45deg);
      transition: opacity 0.2s ease;
    }

    .resize-handle.top-left:hover .corner-grip-notch {
      opacity: 0.9;
    }

    .corner-grip-notch span {
      width: 3px;
      height: 3px;
      background: var(--color-slate-gray);
      border-radius: 50%;
    }

    @keyframes popoverFadeIn {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .concierge-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-mist-gray);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--color-paper-white);
    }

    .concierge-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .concierge-title {
      font-size: 20px;
      color: var(--color-ink-black);
    }

    .live-dot-green {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    .engine-badge {
      font-size: 10px;
      background: var(--color-mist-gray);
      color: var(--color-slate-gray);
      padding: 2px 6px;
      border-radius: 9999px;
      font-weight: 600;
    }

    .concierge-subtitle {
      font-size: 12px;
      color: var(--color-slate-gray);
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon-header-btn {
      background: var(--color-mist-gray);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-slate-gray);
      transition: all 0.15s ease;
    }

    .icon-header-btn:hover {
      background: #e4e4e5;
      color: var(--color-ink-black);
    }

    .speaking-banner {
      background: var(--color-blush-peach);
      color: var(--color-sienna-brown);
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 500;
    }

    .stop-speech-pill {
      background: var(--color-sienna-brown);
      color: var(--color-blush-peach);
      border: none;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 11px;
      cursor: pointer;
    }

    /* Messages container */
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--color-fog-white);
    }

    .chat-message-row {
      display: flex;
      width: 100%;
    }

    .user-row {
      justify-content: flex-end;
    }

    .concierge-row {
      justify-content: flex-start;
    }

    .bubble-wrap {
      max-width: 90%;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .badges-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .context-badge {
      font-size: 10px;
      background: rgba(93, 42, 26, 0.08);
      color: var(--color-sienna-brown);
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 600;
    }

    .latency-badge {
      font-size: 10px;
      color: var(--color-ash-gray);
    }

    .message-bubble {
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
    }

    .user-row .message-bubble {
      background: var(--color-ink-black);
      color: var(--color-paper-white);
      border-bottom-right-radius: 4px;
    }

    .concierge-row .message-bubble {
      background: var(--color-paper-white);
      color: var(--color-ink-black);
      border: 1px solid var(--color-mist-gray);
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }

    .speech-replay-row {
      display: flex;
      margin-top: 4px;
    }

    .listen-audio-btn {
      background: rgba(93, 42, 26, 0.08);
      border: 1px solid rgba(93, 42, 26, 0.2);
      border-radius: 9999px;
      color: var(--color-sienna-brown);
      font-size: 11px;
      font-weight: 600;
      padding: 5px 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .listen-audio-btn:hover {
      background: var(--color-blush-peach);
      border-color: var(--color-sienna-brown);
      transform: translateY(-1px);
    }

    .listen-audio-btn.playing {
      background: var(--color-sienna-brown);
      color: var(--color-blush-peach);
      border-color: var(--color-sienna-brown);
    }

    .btn-soundwave {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      height: 12px;
    }

    .btn-soundwave .bar {
      width: 2px;
      background: currentColor;
      border-radius: 1px;
      animation: bar-pulse 0.6s infinite alternate;
    }

    .btn-soundwave .bar:nth-child(1) { height: 6px; }
    .btn-soundwave .bar:nth-child(2) { height: 12px; animation-delay: 0.2s; }
    .btn-soundwave .bar:nth-child(3) { height: 8px; animation-delay: 0.1s; }

    @keyframes bar-pulse {
      0% { transform: scaleY(0.4); }
      100% { transform: scaleY(1); }
    }

    /* Matched product chips in chat */
    .matched-products-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 4px 0;
    }

    .chat-product-chip {
      background: var(--color-paper-white);
      border: 1px solid var(--color-mist-gray);
      border-radius: 12px;
      padding: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 220px;
    }

    .chip-img {
      width: 44px;
      height: 44px;
      border-radius: 6px;
      object-fit: cover;
    }

    .chip-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .chip-id {
      font-size: 10px;
      color: var(--color-sienna-brown);
      font-weight: 600;
    }

    .chip-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-ink-black);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 110px;
    }

    .chip-price {
      font-size: 12px;
      font-weight: 700;
      color: var(--color-ink-black);
    }

    .chip-add-btn {
      background: var(--color-mist-gray);
      border: none;
      padding: 4px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }

    .chip-add-btn:hover {
      background: var(--color-ink-black);
      color: #ffffff;
    }

    /* Follow-up pills */
    .followup-pills-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }

    .followup-pill {
      background: var(--color-paper-white);
      border: 1px solid var(--color-mist-gray);
      border-radius: 9999px;
      padding: 6px 14px;
      font-size: 12px;
      color: var(--color-ink-black);
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .followup-pill:hover {
      background: var(--color-blush-peach);
      border-color: var(--color-sienna-brown);
      color: var(--color-sienna-brown);
    }

    /* Composer */
    .concierge-composer-box {
      padding: 14px 16px;
      background: var(--color-paper-white);
      border-top: 1px solid var(--color-mist-gray);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .pinned-context-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--color-mist-gray);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
    }

    .pinned-meta {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .pinned-label {
      color: var(--color-slate-gray);
    }

    .pinned-chip {
      color: var(--color-sienna-brown);
      font-weight: 600;
    }

    .clear-pin-btn {
      background: none;
      border: none;
      color: var(--color-slate-gray);
      cursor: pointer;
      font-size: 12px;
    }

    .composer-form {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-mist-gray);
      border-radius: 9999px;
      padding: 4px 6px 4px 16px;
    }

    .concierge-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
      color: var(--color-ink-black);
      padding: 6px 0;
    }

    .composer-mic-btn {
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
    }

    .composer-mic-btn:hover {
      color: var(--color-sienna-brown);
    }

    .pulsing-mic {
      color: #ef4444 !important;
      background: #fee2e2;
      animation: pulse-mic 1s infinite;
    }

    .composer-send-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--color-ink-black);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .composer-send-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .loading-dots {
      display: flex;
      gap: 4px;
      padding: 12px 18px;
    }

    .loading-dots span {
      width: 6px;
      height: 6px;
      background: var(--color-sienna-brown);
      border-radius: 50%;
      animation: bounce 1.2s infinite;
    }

    .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
    .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1.1); opacity: 1; }
    }

    @media (max-width: 500px) {
      .concierge-modal-container {
        right: 12px;
        left: 12px;
        width: auto;
        bottom: 80px;
      }
      .concierge-floating-pill {
        right: 16px;
        bottom: 16px;
      }
    }
  `]
})
export class AiConciergeComponent implements AfterViewChecked {
  store = inject(StoreService);
  voice = inject(VoiceChatService);

  @ViewChild('scrollContainer') scrollContainer?: ElementRef;

  chatInput = '';
  currentlyPlayingId = signal<string | null>(null);

  // Resizable state
  windowWidth = signal<number>(380);
  windowHeight = signal<number>(500);

  constructor() {
    effect(() => {
      const prompt = this.store.initialPrompt();
      if (prompt && this.store.isConciergeOpen()) {
        this.chatInput = prompt;
        this.store.initialPrompt.set('');
        this.submitQuery();
      }
    });
  }

  private resizingMode: 'top' | 'left' | 'both' | null = null;
  private startX = 0;
  private startY = 0;
  private startW = 380;
  private startH = 500;

  // Smart scrolling state: tracks message additions so we frame the question + response at the top,
  // preventing the view from overscrolling past the answer down to follow-up pills.
  private lastMessageCount = 0;
  private wasLoading = false;
  private pendingScroll: 'user-message' | 'response-start' | 'top' | null = null;
  private isFirstOpen = true;

  onResizeStart(e: MouseEvent, mode: 'top' | 'left' | 'both') {
    e.preventDefault();
    e.stopPropagation();
    this.resizingMode = mode;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startW = this.windowWidth();
    this.startH = this.windowHeight();

    const onMouseMove = (ev: MouseEvent) => {
      if (!this.resizingMode) return;

      if (this.resizingMode === 'left' || this.resizingMode === 'both') {
        const deltaX = this.startX - ev.clientX; // dragging left expands width
        const maxW = Math.min(640, window.innerWidth - 32);
        const newW = Math.max(320, Math.min(maxW, this.startW + deltaX));
        this.windowWidth.set(newW);
      }

      if (this.resizingMode === 'top' || this.resizingMode === 'both') {
        const deltaY = this.startY - ev.clientY; // dragging up expands height
        const maxH = Math.min(700, window.innerHeight - 125);
        const newH = Math.max(360, Math.min(maxH, this.startH + deltaY));
        this.windowHeight.set(newH);
      }
    };

    const onMouseUp = () => {
      this.resizingMode = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  ngAfterViewChecked() {
    const currentCount = this.voice.messages().length;
    const isLoading = this.voice.isLoading();

    // Check if messages count or loading state changed
    if (currentCount !== this.lastMessageCount || isLoading !== this.wasLoading) {
      if (this.isFirstOpen) {
        this.pendingScroll = 'top';
        this.isFirstOpen = false;
      } else if (currentCount > this.lastMessageCount) {
        const lastMsg = this.voice.messages()[currentCount - 1];
        if (lastMsg.sender === 'user') {
          // User just asked a question: scroll to reveal question and loading indicator
          this.pendingScroll = 'user-message';
        } else if (lastMsg.sender === 'concierge') {
          // AI response arrived: scroll so the question and start of response are framed at the top
          this.pendingScroll = 'response-start';
        }
      } else if (isLoading && !this.wasLoading) {
        this.pendingScroll = 'user-message';
      }

      this.lastMessageCount = currentCount;
      this.wasLoading = isLoading;
    }

    if (this.pendingScroll) {
      const mode = this.pendingScroll;
      this.pendingScroll = null;
      setTimeout(() => this.performScroll(mode), 40);
    }
  }

  private performScroll(mode: 'user-message' | 'response-start' | 'top') {
    if (!this.scrollContainer) return;
    const container = this.scrollContainer.nativeElement as HTMLElement;

    if (mode === 'top') {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (mode === 'user-message') {
      // Scroll down to keep the newly sent question and loading animation in view
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      return;
    }

    if (mode === 'response-start') {
      // Frame the conversation exchange: align the user's question at the top of the container
      // so the user immediately sees what was asked and the beginning of the AI response,
      // without needing to scroll up!
      const userRows = container.querySelectorAll('.user-row');
      if (userRows.length > 0) {
        const lastUserRow = userRows[userRows.length - 1] as HTMLElement;
        const containerRect = container.getBoundingClientRect();
        const userRowRect = lastUserRow.getBoundingClientRect();
        const targetScrollTop = container.scrollTop + (userRowRect.top - containerRect.top) - 14;

        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });
      } else {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  scrollToBottom() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  toggleConcierge() {
    if (this.store.isConciergeOpen()) {
      this.store.closeConcierge();
    } else {
      this.store.openConcierge();
      this.pendingScroll = 'response-start';
    }
  }

  toggleVoiceMute() {
    this.voice.toggleMute();
  }

  toggleListening() {
    if (this.voice.isListening()) {
      this.voice.stopListening();
    } else {
      this.voice.startListening((transcript) => {
        this.chatInput = transcript;
        this.submitQuery();
      });
    }
  }

  togglePlayMessage(msg: ChatMessage) {
    if (this.isPlaying(msg.id)) {
      this.voice.stopSpeaking();
      this.currentlyPlayingId.set(null);
    } else {
      this.currentlyPlayingId.set(msg.id);
      this.voice.speak(msg.spoken_text || msg.text);
    }
  }

  isPlaying(id: string): boolean {
    return this.currentlyPlayingId() === id && this.voice.isSpeaking();
  }

  clearPin() {
    this.store.pinnedProduct.set(null);
  }

  onFormSubmit(e: Event) {
    e.preventDefault();
    this.submitQuery();
  }

  submitQuery() {
    const q = this.chatInput.trim();
    if (!q) return;

    this.sendQuery(q);
    this.chatInput = '';
  }

  sendQuery(query: string) {
    const pinned = this.store.pinnedProduct();
    this.voice.sendMessage(query, this.store.sessionId, pinned?.id);
  }

  formatMarkdown(text: string): string {
    if (!text) return '';

    let formatted = text;

    // Headers: replace raw markdown hashes like ### or ## with clean bold editorial titles!
    formatted = formatted.replace(/^### (.*$)/gim, '<div style="font-weight:700;font-size:13px;color:#17191c;margin:6px 0 2px 0;">$1</div>');
    formatted = formatted.replace(/^## (.*$)/gim, '<div style="font-weight:700;font-size:14px;color:#17191c;margin:8px 0 2px 0;">$1</div>');
    formatted = formatted.replace(/^# (.*$)/gim, '<div style="font-weight:700;font-size:15px;color:#17191c;margin:8px 0 2px 0;">$1</div>');

    // Horizontal dividers
    formatted = formatted.replace(/^---$/gim, '<div style="height:1px;background:#e5e5e6;margin:6px 0;"></div>');

    // Bold **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#17191c;font-weight:600;">$1</strong>');

    // Strikethrough ~~text~~
    formatted = formatted.replace(/~~(.*?)~~/g, '<del style="opacity:0.6;">$1</del>');

    // Italics *text*
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em style="color:#5d2a1a;font-style:italic;">$1</em>');

    // Inline code `text`
    formatted = formatted.replace(/`([^`]+)`/g, '<code style="background:#f2f2f3;color:#5d2a1a;padding:2px 5px;border-radius:4px;font-size:11px;font-family:monospace;">$1</code>');

    // Numbered lists e.g. "1. Item"
    formatted = formatted.replace(/^(\d+)\.\s+(.*)$/gim, '<div style="display:flex;gap:6px;margin:2px 0 2px 2px;line-height:1.35;"><span style="font-weight:700;color:#5d2a1a;min-width:16px;">$1.</span><span>$2</span></div>');

    // Bullet points e.g. "- Item" or "* Item" or "• Item"
    formatted = formatted.replace(/^[-*•]\s+(.*)$/gim, '<div style="display:flex;gap:6px;margin:2px 0 2px 4px;line-height:1.35;"><span style="color:#5d2a1a;">•</span><span>$1</span></div>');

    // Remove double breaks after closing divs
    formatted = formatted.replace(/<\/div>\n+/g, '</div>');

    // Clean paragraph breaks without excessive vertical space
    formatted = formatted.replace(/\n\n+/g, '<div style="margin-bottom:6px;"></div>');
    formatted = formatted.replace(/\n/g, '<br/>');

    return formatted;
  }
}
