import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatMessage, ChatResponse } from '../models/stride.models';

const API_BASE = 'http://localhost:8000/api';

@Injectable({
  providedIn: 'root'
})
export class VoiceChatService {
  readonly isMuted = signal<boolean>(false);
  readonly isSpeaking = signal<boolean>(false);
  readonly isListening = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  
  readonly messages = signal<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'concierge',
      text: "Hey! Welcome to **STRIDE Copilot ✦**.\nHow can I help you today? Ask about sizing, latest Drop 04 footwear, or fit recommendations.",
      spoken_text: "Hey! Welcome to STRIDE Copilot. How can I assist with your footwear, streetwear, or order today?",
      timestamp: 'Just now',
      badges: ['✦ AI Copilot'],
      suggested_followups: [
        "List all shoes",
        "Best runners under ₹10,000",
        "What is STRIDE's 7-day return policy?"
      ]
    }
  ]);

  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initVoiceSelector();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.initVoiceSelector();
        }
      }
      this.initSpeechRecognition();
    }
  }

  private initVoiceSelector() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Strict priority hierarchy for sweet female voice:
    const priorities = [
      "Microsoft Neerja Online (Natural)",
      "Google UK English Female",
      "Microsoft Aria Online",
      "Samantha",
      "Google US English",
      "Microsoft Zira",
      "Microsoft Jenny Online",
      "Karen",
      "Victoria",
      "Moira",
      "Fiona"
    ];

    for (const name of priorities) {
      const match = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
      if (match) {
        this.selectedVoice = match;
        return;
      }
    }

    // Fallback: any female English voice
    const femaleEn = voices.find(v => 
      v.lang.startsWith('en') && (
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('girl') || 
        v.name.toLowerCase().includes('woman')
      )
    );
    if (femaleEn) {
      this.selectedVoice = femaleEn;
      return;
    }

    // Generic fallback: first English voice
    this.selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-IN';

      this.recognition.onstart = () => {
        this.isListening.set(true);
      };

      this.recognition.onend = () => {
        this.isListening.set(false);
      };

      this.recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        this.isListening.set(false);
      };
    }
  }

  speak(text: string) {
    if (!this.synth || this.isMuted()) return;

    this.stopSpeaking();

    // Clean any residual markdown characters for ultra smooth spoken audio
    const cleanSpoken = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanSpoken) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpoken);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    // Specific pitch and rate tuning for sweet, articulate tone
    utterance.pitch = 1.08;
    utterance.rate = 0.98;

    utterance.onstart = () => this.isSpeaking.set(true);
    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = () => this.isSpeaking.set(false);

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking.set(false);
  }

  toggleMute(): boolean {
    const next = !this.isMuted();
    this.isMuted.set(next);
    if (next) {
      this.stopSpeaking();
    }
    return next;
  }

  startListening(onResult: (text: string) => void) {
    if (!this.recognition) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    this.stopSpeaking();
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onResult(transcript);
      }
    };
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Speech recognition already active:", e);
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.isListening.set(false);
  }

  sendMessage(query: string, sessionId: string, pinnedProductId?: string) {
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query.trim(),
      timestamp: 'Just now'
    };

    this.messages.update(list => [...list, userMsg]);
    this.isLoading.set(true);

    this.http.post<ChatResponse>(`${API_BASE}/chat`, {
      query: query.trim(),
      session_id: sessionId,
      pinned_product_id: pinnedProductId || null
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const conciergeMsg: ChatMessage = {
          id: 'msg-' + (Date.now() + 1),
          sender: 'concierge',
          text: res.reply_markdown,
          spoken_text: res.spoken_text,
          timestamp: 'Just now',
          badges: res.context_used_badges,
          matched_products: res.matched_products,
          suggested_followups: res.suggested_followups,
          latency_ms: res.latency_ms
        };

        this.messages.update(list => [...list, conciergeMsg]);
        // Note: Audio is NOT spoken automatically. It only plays when the user explicitly presses the "Listen" button.
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Chat error:', err);
        const errorMsg: ChatMessage = {
          id: 'err-' + Date.now(),
          sender: 'concierge',
          text: "I experienced a brief connection blip with our telemetry node. Please try your question once more, or ask about our standard sizing, 7-day returns, or active orders.",
          spoken_text: "I experienced a brief connection blip. Please try your question once more.",
          timestamp: 'Just now',
          badges: ['Error: Fallback Alert']
        };
        this.messages.update(list => [...list, errorMsg]);
      }
    });
  }
}
