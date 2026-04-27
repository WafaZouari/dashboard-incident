import { AIProvider } from './ai.interface.js';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  private model: string;
  private baseUrl: string;

  constructor() {
    this.model = process.env.OLLAMA_MODEL || 'llama3';
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  }

  async generateText(prompt: string): Promise<string> {
    try {
      console.log(`[Ollama] Generating with model: ${this.model}...`);
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.7,
            num_predict: 2048,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data = await response.json() as { response: string };
      return data.response;
    } catch (error: any) {
      console.error('[Ollama] Error:', error.message);
      throw error;
    }
  }
}
