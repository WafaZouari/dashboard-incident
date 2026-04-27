export interface AIProvider {
  name: string;
  generateText(prompt: string): Promise<string>;
}

export interface AIResponse {
  text: string;
  provider: string;
  success: boolean;
}
