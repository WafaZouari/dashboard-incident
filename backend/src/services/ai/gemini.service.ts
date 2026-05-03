import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './ai.interface.js';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel(
      { model: 'gemini-flash-latest' }
    );
  }

  async generateText(prompt: string): Promise<string> {
    try {
      console.log('[Gemini] Generating text...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('[Gemini] Error:', error.message);
      throw error;
    }
  }
}
