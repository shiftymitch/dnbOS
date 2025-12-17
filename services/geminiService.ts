
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  // Use specific type from @google/genai for better type safety
  private ai: GoogleGenAI;

  constructor() {
    // Fix: Always use the exact format from guidelines for initialization
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async querySystem(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are dnbOS System Intelligence (v1.0). You represent a Salt Lake City based Drum & Bass promoter. Your personality is a mix of a retro terminal AI and a bass music enthusiast. Use tech jargon (buffers, kernels, parity, latency, BPM). Keep responses concise, hacker-ish, and slightly cryptic. Always refer to SLC as 'Sector SLC'. If users ask about events, mention that the data is stored in /usr/bin/events. Be helpful but 'system-like'.",
          temperature: 0.7,
        }
      });
      // Correctly access text as a property
      return response.text || "SYSTEM ERROR: NULL_RESPONSE";
    } catch (error) {
      console.error("AI Query Failed", error);
      return "CRITICAL ERROR: AI INTERFACE OFFLINE";
    }
  }
}

export const gemini = new GeminiService();
