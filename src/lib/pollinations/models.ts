export type Surface = 'image' | 'text' | 'audio';

export interface ModelInfo {
  id: string;
  label: string;
  surface: Surface;
  defaults?: Record<string, string | number | boolean>;
  supports?: {
    enhance?: boolean;
    negativePrompt?: boolean;
    sizes?: string[];
    voices?: string[];
  };
}

export const MODELS: ModelInfo[] = [
  {
    id: 'flux',
    label: 'Flux',
    surface: 'image',
    defaults: { width: 1024, height: 1024, quality: 'high' },
    supports: {
      enhance: true,
      negativePrompt: true,
      sizes: ['512x512', '768x768', '1024x1024', '1024x576', '576x1024']
    }
  },
  {
    id: 'gptimage',
    label: 'GPT-Image',
    surface: 'image',
    defaults: { width: 1024, height: 1024, quality: 'high' },
    supports: { enhance: true, negativePrompt: false, sizes: ['512x512', '1024x1024'] }
  },
  {
    id: 'imagen-4',
    label: 'Imagen 4',
    surface: 'image',
    defaults: { width: 1024, height: 1024, quality: 'hd' },
    supports: { enhance: false, negativePrompt: true, sizes: ['1024x1024', '1024x576', '576x1024'] }
  },

  {
    id: 'openai',
    label: 'OpenAI (text)',
    surface: 'text',
    defaults: { temperature: 0.7, max_tokens: 512 }
  },
  {
    id: 'mistral',
    label: 'Mistral',
    surface: 'text',
    defaults: { temperature: 0.7, max_tokens: 512 }
  },

  {
    id: 'tts-1',
    label: 'TTS Standard',
    surface: 'audio',
    defaults: { voice: 'alloy', speed: 1.0 },
    supports: { voices: ['alloy', 'aria', 'ember', 'nova', 'sage'] }
  }
];

export function modelById(id: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === id);
}
export function modelsFor(surface: Surface): ModelInfo[] {
  return MODELS.filter((m) => m.surface === surface);
}
