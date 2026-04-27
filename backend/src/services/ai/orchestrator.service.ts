import { AIFactory } from './ai.factory';
import { AIProvider } from './ai.interface';
import { OllamaProvider } from './ollama.service';
import { GeminiProvider } from './gemini.service';

export class UnifiedAIService {
  private primaryProvider: AIProvider;
  private fallbackProvider: AIProvider;

  constructor() {
    this.primaryProvider = AIFactory.getProvider();
    // Always use Ollama as fallback if it's not primary
    this.fallbackProvider = this.primaryProvider.name === 'ollama' 
      ? AIFactory.getProvider('gemini') 
      : AIFactory.getProvider('ollama');
  }

  async generateText(prompt: string): Promise<{ text: string; provider: string }> {
    try {
      console.log(`[AI] Attempting with primary provider: ${this.primaryProvider.name}`);
      const text = await this.primaryProvider.generateText(prompt);
      return { text, provider: this.primaryProvider.name };
    } catch (error: any) {
      console.warn(`[AI] Primary provider (${this.primaryProvider.name}) failed. Falling back to ${this.fallbackProvider.name}...`);
      
      try {
        const text = await this.fallbackProvider.generateText(prompt);
        return { text, provider: this.fallbackProvider.name };
      } catch (fallbackError: any) {
        console.error('[AI] All AI providers failed.');
        throw new Error('AI services are currently unavailable.');
      }
    }
  }
}

export const aiOrchestrator = new UnifiedAIService();
