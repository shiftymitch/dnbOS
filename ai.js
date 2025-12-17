
import { GoogleGenAI } from "@google/genai";
import { EVENTS, SYSTEM_SPECS } from './eventData.js';

class GeminiService {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async querySystem(prompt) {
    try {
      const eventContext = EVENTS.map(e => `- ${e.title} on ${e.date} at ${e.location}. Lineup: ${e.lineup.join(', ')}. Status: ${e.status}.`).join('\n');
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: `You are dnbOS System Intelligence (v3.0). You represent a Salt Lake City based Drum & Bass promoter. 
Your personality is a mix of a retro terminal AI and a bass music enthusiast. Use tech jargon (buffers, kernels, parity, latency, BPM). 
Keep responses concise, hacker-ish, and slightly cryptic. Always refer to SLC as 'Sector SLC'.

CRITICAL RESTRICTION: You MUST ONLY reference information provided in the SYSTEM DATA and EVENTS list below. 
Do not discuss any topics, news, or general knowledge outside of dnbOS and these specific SLC Drum & Bass events. 
If a user asks about something outside this scope, you must respond with: "ACCESS DENIED: SUBJECT OUTSIDE SYSTEM SCOPE".

SYSTEM DATA:
- OS: dnbOS
- Version: ${SYSTEM_SPECS.version}
- Kernel: ${SYSTEM_SPECS.kernel}
- CPU: ${SYSTEM_SPECS.cpu}
- Memory: ${SYSTEM_SPECS.ram}

CURRENT OPERATIONS (EVENTS):
${eventContext}

Always address the user as 'guest'.`,
          temperature: 0.5,
        }
      });
      return response.text || "SYSTEM ERROR: NULL_RESPONSE";
    } catch (error) {
      console.error("AI Query Failed", error);
      return "CRITICAL ERROR: AI INTERFACE OFFLINE";
    }
  }
}

export const gemini = new GeminiService();
