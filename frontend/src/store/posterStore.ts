import { create } from 'zustand';

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  color: string;
  textAlign: string;
  rotation: number;
  opacity: number;
}

interface PosterState {
  // 图片状态
  productImage: string | null;
  generatedImage: string | null;
  backgroundImage: string | null;
  
  // 文字图层
  textLayers: TextLayer[];
  selectedLayerId: string | null;
  
  // 生成参数
  prompt: string;
  aspectRatio: string;
  isGenerating: boolean;
  
  // 用户状态
  credits: number;
  subscriptionPlan: 'free' | 'pro' | 'premium';
  
  // Actions
  setProductImage: (image: string | null) => void;
  setGeneratedImage: (image: string | null) => void;
  addTextLayer: (layer: Partial<TextLayer>) => void;
  updateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
  removeTextLayer: (id: string) => void;
  selectTextLayer: (id: string | null) => void;
  setPrompt: (prompt: string) => void;
  setAspectRatio: (ratio: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setCredits: (credits: number) => void;
  setSubscriptionPlan: (plan: 'free' | 'pro' | 'premium') => void;
}

export const usePosterStore = create<PosterState>((set) => ({
  // 初始状态
  productImage: null,
  generatedImage: null,
  backgroundImage: null,
  textLayers: [],
  selectedLayerId: null,
  prompt: '',
  aspectRatio: '1:1',
  isGenerating: false,
  credits: 5,
  subscriptionPlan: 'free',
  
  // Actions
  setProductImage: (image) => set({ productImage: image }),
  setGeneratedImage: (image) => set({ generatedImage: image }),
  
  addTextLayer: (layer) => set((state) => ({
    textLayers: [
      ...state.textLayers,
      {
        id: Date.now().toString(),
        text: layer.text || 'New Text',
        x: layer.x || 100,
        y: layer.y || 100,
        fontSize: layer.fontSize || 24,
        fontFamily: layer.fontFamily || 'Arial',
        fontWeight: layer.fontWeight || 'normal',
        fontStyle: layer.fontStyle || 'normal',
        color: layer.color || '#000000',
        textAlign: layer.textAlign || 'left',
        rotation: layer.rotation || 0,
        opacity: layer.opacity || 1,
      },
    ],
  })),
  
  updateTextLayer: (id, updates) => set((state) => ({
    textLayers: state.textLayers.map((layer) =>
      layer.id === id ? { ...layer, ...updates } : layer
    ),
  })),
  
  removeTextLayer: (id) => set((state) => ({
    textLayers: state.textLayers.filter((layer) => layer.id !== id),
    selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
  })),
  
  selectTextLayer: (id) => set({ selectedLayerId: id }),
  setPrompt: (prompt) => set({ prompt }),
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setCredits: (credits) => set({ credits }),
  setSubscriptionPlan: (plan) => set({ subscriptionPlan: plan }),
}));
