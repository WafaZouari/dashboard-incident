import { AIProvider } from './ai.interface';
import { OllamaProvider } from './ollama.service';
import { GeminiProvider } from './gemini.service';

export class AIFactory {
  static getProvider(type?: string): AIProvider {
    const providerType = type || process.env.AI_PROVIDER || 'ollama';

    switch (providerType.toLowerCase()) {
      case 'gemini':
        return new GeminiProvider();
      case 'ollama':
      default:
        return new OllamaProvider();
    }
  }
}
