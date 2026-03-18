import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// 文字图层类型
interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  fontStyle: string;
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
  opacity: number;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

// 预设字体样式
const FONT_PRESETS = [
  { id: 'modern', name: '现代简约', family: 'Inter, system-ui, sans-serif', weight: '500', style: 'normal' },
  { id: 'elegant', name: '优雅衬线', family: 'Playfair Display, Georgia, serif', weight: '400', style: 'normal' },
  { id: 'bold', name: '粗体强调', family: 'Inter, system-ui, sans-serif', weight: '900', style: 'normal' },
  { id: 'creative', name: '创意设计', family: 'Poppins, sans-serif', weight: '600', style: 'italic' },
  { id: 'handwriting', name: '手写风格', family: 'Dancing Script, cursive', weight: '400', style: 'normal' },
  { id: 'tech', name: '科技感', family: 'Orbitron, monospace', weight: '500', style: 'normal' },
  { id: 'luxury', name: '奢华风格', family: 'Cinzel, serif', weight: '400', style: 'normal' },
  { id: 'cute', name: '可爱风格', family: 'Comic Neue, cursive', weight: '600', style: 'normal' },
];

// 预设颜色方案
const COLOR_PRESETS = [
  { name: '经典紫', value: '#8B5CF6', gradient: 'from-purple-500 to-purple-600' },
  { name: '热情红', value: '#EF4444', gradient: 'from-red-500 to-red-600' },
  { name: '活力橙', value: '#F97316', gradient: 'from-orange-500 to-orange-600' },
  { name: '清新绿', value: '#10B981', gradient: 'from-green-500 to-green-600' },
  { name: '海洋蓝', value: '#3B82F6', gradient: 'from-blue-500 to-blue-600' },
  { name: '奢华金', value: '#F59E0B', gradient: 'from-yellow-500 to-yellow-600' },
  { name: '樱花粉', value: '#EC4899', gradient: 'from-pink-500 to-pink-600' },
  { name: '经典黑', value: '#1F2937', gradient: 'from-gray-700 to-gray-900' },
  { name: '纯净白', value: '#FFFFFF', gradient: 'from-gray-100 to-white' },
];

// 预设文字效果
const TEXT_EFFECTS = [
  { id: 'none', name: '无效果' },
  { id: 'shadow', name: '阴影' },
  { id: 'outline', name: '描边' },
  { id: 'glow', name: '发光' },
  { id: 'gradient', name: '渐变' },
];

// 预设背景风格提示词
const BG_PROMPTS = [
  { name: '简约白色', prompt: 'minimalist white background, clean studio lighting, professional product photography, soft shadows, high key lighting' },
  { name: '奢华金色', prompt: 'luxury golden background, elegant gradient, premium feel, warm lighting, sophisticated atmosphere, bokeh effect' },
  { name: '清新自然', prompt: 'natural outdoor setting, soft sunlight, green plants background, fresh and clean, organic feel, bright and airy' },
  { name: '科技感', prompt: 'futuristic tech background, neon lights, cyberpunk style, blue and purple gradient, digital aesthetic, modern' },
  { name: '节日氛围', prompt: 'festive celebration background, confetti, party atmosphere, colorful balloons, joyful mood, vibrant colors' },
  { name: '深色高级', prompt: 'dark premium background, dramatic lighting, moody atmosphere, professional studio, deep shadows, luxury feel' },
  { name: '渐变色', prompt: 'smooth gradient background, pastel colors, soft transition, modern aesthetic, clean design, instagram style' },
  { name: '纹理质感', prompt: 'textured background, concrete wall, artistic feel, urban style, rough texture, contemporary design' },
];

export default function Editor() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // 状态管理
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState('');
  
  // 文字图层
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // 当前编辑的文字
  const [currentText, setCurrentText] = useState('限时特价！');
  const [currentFont, setCurrentFont] = useState(FONT_PRESETS[0]);
  const [currentColor, setCurrentColor] = useState(COLOR_PRESETS[0]);
  const [fontSize, setFontSize] = useState(48);
  const [textEffect, setTextEffect] = useState('shadow');
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('center');

  // 文件上传处理
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setStep(2);
        // 初始化默认文字图层
        setTextLayers([{
          id: 'text_1',
          text: '限时特价！',
          x: 50,
          y: 50,
          fontSize: 48,
          fontFamily: currentFont.family,
          fontWeight: currentFont.weight,
          fontStyle: currentFont.style,
          color: currentColor.value,
          textAlign: 'center',
          rotation: 0,
          opacity: 100,
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI 生成海报
  const handleGenerate = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          prompt: prompt || BG_PROMPTS[0].prompt,
          text_layers: textLayers,
        })
      });
      const result = await response.json();
      if (result.success) {
        setGeneratedImage(result.image_url);
        setStep(3);
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('生成失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 添加文字图层
  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: `text_${Date.now()}`,
      text: '点击编辑文字',
      x: 50,
      y: 50,
      fontSize: 40,
      fontFamily: currentFont.family,
      fontWeight: currentFont.weight,
      fontStyle: currentFont.style,
      color: currentColor.value,
      textAlign: 'center',
      rotation: 0,
      opacity: 100,
    };
    setTextLayers([...textLayers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  // 更新选中图层
  const updateSelectedLayer = (updates: Partial<TextLayer>) => {
    if (!selectedLayerId) return;
    setTextLayers(layers => layers.map(layer => 
      layer.id === selectedLayerId ? { ...layer, ...updates } : layer
    ));
  };

  // 删除选中图层
  const deleteSelectedLayer = () => {
    if (!selectedLayerId) return;
    setTextLayers(layers => layers.filter(layer => layer.id !== selectedLayerId));
    setSelectedLayerId(null);
  };

  // 画布鼠标事件 - 拖拽文字
  const handleCanvasMouseDown = (e: React.MouseEvent, layer: TextLayer) => {
    e.stopPropagation();
    setSelectedLayerId(layer.id);
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - layer.x,
        y: e.clientY - rect.top - layer.y
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedLayerId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    updateSelectedLayer({ x, y });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // 下载最终海报
  const handleDownload = async () => {
    // 实际项目中这里应该调用后端 API 生成最终图片
    const link = document.createElement('a');
    link.href = generatedImage || '';
    link.download = `ai-poster-${Date.now()}.png`;
    link.click();
  };

  const selectedLayer = textLayers.find(l => l.id === selectedLayerId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI 海报编辑器 - 专业电商海报设计工具</title>
        <meta name="description" content="3 分钟生成专业电商海报，支持文字编辑" />
      </Head>

      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🎨</span>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Poster Studio
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="text-sm">
                <span className="text-gray-500">剩余次数：</span>
                <span className="font-semibold text-purple-600">47/50</span>
              </div>
              <Link href="/pricing" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                升级套餐 →
              </Link>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                L
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 进度步骤 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center space-x-4">
          {[
            { num: 1, label: '上传图片', icon: '📸' },
            { num: 2, label: '编辑设计', icon: '✏️' },
            { num: 3, label: '下载海报', icon: '📥' }
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                step >= s.num 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-110' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.num ? '✓' : s.icon}
              </div>
              <span className={`ml-3 font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`w-16 sm:w-24 h-1 mx-4 rounded-full transition-all ${
                  step > s.num ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Step 1: 上传图片 */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">上传产品图片</h2>
              <p className="text-lg text-gray-600">支持 JPG、PNG、WEBP 格式，最大 10MB</p>
            </div>
            
            <div 
              className="border-3 border-dashed border-purple-300 rounded-2xl p-16 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer text-center group"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">📸</div>
              <p className="text-xl text-gray-700 font-semibold mb-3">
                点击或拖拽图片到此处
              </p>
              <p className="text-sm text-gray-500">
                AI 将自动抠图并生成专业背景
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="font-semibold text-gray-900 mb-2">AI 智能抠图</h3>
                <p className="text-sm text-gray-600">自动识别产品，精确去除背景</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="font-semibold text-gray-900 mb-2">专业背景生成</h3>
                <p className="text-sm text-gray-600">多种风格可选，影棚级效果</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">✏️</div>
                <h3 className="font-semibold text-gray-900 mb-2">自由编辑文字</h3>
                <p className="text-sm text-gray-600">核心功能！生成后仍可修改</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                💡 提示：使用清晰的产品照片效果更佳
              </p>
            </div>
          </div>
        )}

        {/* Step 2: 编辑设计 */}
        {step === 2 && uploadedImage && (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* 左侧：画布预览区 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  画布预览
                </h3>
                
                <div 
                  ref={canvasRef}
                  className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden cursor-crosshair"
                  style={{ aspectRatio: '1/1', minHeight: '400px' }}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onClick={() => setSelectedLayerId(null)}
                >
                  {/* 产品图片 */}
                  <img 
                    src={uploadedImage} 
                    alt="Product" 
                    className="w-full h-full object-contain p-8"
                  />
                  
                  {/* 文字图层 */}
                  {textLayers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`absolute cursor-move select-none group ${
                        selectedLayerId === layer.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                      }`}
                      style={{
                        left: `${layer.x}%`,
                        top: `${layer.y}%`,
                        fontSize: `${layer.fontSize}px`,
                        fontFamily: layer.fontFamily,
                        fontWeight: layer.fontWeight,
                        fontStyle: layer.fontStyle,
                        color: layer.color,
                        textAlign: layer.textAlign,
                        transform: `rotate(${layer.rotation}deg)`,
                        opacity: layer.opacity / 100,
                        textShadow: textEffect === 'shadow' ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
                        WebkitTextStroke: textEffect === 'outline' ? '1px rgba(0,0,0,0.5)' : 'none',
                        filter: textEffect === 'glow' ? 'drop-shadow(0 0 10px currentColor)' : 'none',
                      }}
                      onMouseDown={(e) => handleCanvasMouseDown(e, layer)}
                    >
                      {layer.text}
                      {selectedLayerId === layer.id && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteSelectedLayer(); }}
                            className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* 空状态提示 */}
                  {textLayers.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl">
                        <p className="text-gray-500 text-sm">点击右侧"添加文字"按钮</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2"
                  >
                    ← 重新选择图片
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        AI 生成中...
                      </>
                    ) : (
                      <>✨ 生成海报</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧：编辑工具栏 */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* 文字内容编辑 */}
              <div className="bg-white rounded-2xl shadow-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">📝 文字内容</h3>
                  <button
                    onClick={addTextLayer}
                    className="text-sm bg-purple-100 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-200 font-medium"
                  >
                    + 添加文字
                  </button>
                </div>
                
                {selectedLayer ? (
                  <div className="space-y-3">
                    <textarea
                      value={selectedLayer.text}
                      onChange={(e) => updateSelectedLayer({ text: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="输入海报文字..."
                    />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>图层 {textLayers.findIndex(l => l.id === selectedLayerId) + 1} / {textLayers.length}</span>
                      <button
                        onClick={deleteSelectedLayer}
                        className="text-red-500 hover:text-red-600 font-medium"
                      >
                        删除图层
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>点击画布中的文字进行编辑</p>
                    <p className="text-sm mt-1">或添加新文字图层</p>
                  </div>
                )}
              </div>

              {/* 字体样式 */}
              <div className="bg-white rounded-2xl shadow-xl p-5">
                <h3 className="text-lg font-semibold mb-4">🎨 字体样式</h3>
                <div className="grid grid-cols-2 gap-2">
                  {FONT_PRESETS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => {
                        setCurrentFont(font);
                        if (selectedLayerId) {
                          updateSelectedLayer({
                            fontFamily: font.family,
                            fontWeight: font.weight,
                            fontStyle: font.style
                          });
                        }
                      }}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        currentFont.id === font.id 
                          ? 'border-purple-600 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className="text-sm font-medium text-gray-900"
                        style={{ fontFamily: font.family, fontWeight: font.weight, fontStyle: font.style }}
                      >
                        {font.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Aa</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 颜色选择 */}
              <div className="bg-white rounded-2xl shadow-xl p-5">
                <h3 className="text-lg font-semibold mb-4">🌈 文字颜色</h3>
                <div className="grid grid-cols-5 gap-3">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setCurrentColor(color);
                        if (selectedLayerId) {
                          updateSelectedLayer({ color: color.value });
                        }
                      }}
                      className={`group relative w-full aspect-square rounded-xl transition-all ${
                        currentColor.name === color.name 
                          ? 'ring-2 ring-offset-2 ring-purple-600 scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ 
                        background: `linear-gradient(135deg, ${color.value}, ${color.value}dd)` 
                      }}
                    >
                      {currentColor.name === color.name && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-lg">✓</span>
                        </div>
                      )}
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {color.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 文字大小 */}
              <div className="bg-white rounded-2xl shadow-xl p-5">
                <h3 className="text-lg font-semibold mb-4">📏 文字大小</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setFontSize(Math.max(12, fontSize - 4))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                  >
                    −
                  </button>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={fontSize}
                      onChange={(e) => {
                        const size = parseInt(e.target.value);
                        setFontSize(size);
                        if (selectedLayerId) {
                          updateSelectedLayer({ fontSize: size });
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                  <button
                    onClick={() => setFontSize(Math.min(120, fontSize + 4))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                  >
                    +
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-700">{fontSize}px</span>
                </div>
              </div>

              {/* 文字效果 */}
              <div className="bg-white rounded-2xl shadow-xl p-5">
                <h3 className="text-lg font-semibold mb-4">✨ 文字效果</h3>
                <div className="grid grid-cols-3 gap-2">
                  {TEXT_EFFECTS.map((effect) => (
                    <button
                      key={effect.id}
                      onClick={() => setTextEffect(effect.id)}
                      className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        textEffect === effect.id 
                          ? 'border-purple-600 bg-purple-50 text-purple-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {effect.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 背景风格 */}
              <div className="bg-white rounded-2xl shadow-xl p-5">
                <h3 className="text-lg font-semibold mb-4">🖼️ 背景风格</h3>
                <div className="grid grid-cols-2 gap-2">
                  {BG_PROMPTS.map((bg, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(bg.prompt)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        prompt === bg.prompt 
                          ? 'border-purple-600 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{bg.name}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                    placeholder="或自定义描述背景风格..."
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Step 3: 下载结果 */}
        {step === 3 && generatedImage && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">生成成功！</h2>
              <p className="text-gray-600">你的专业电商海报已准备就绪</p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden mb-8 shadow-inner">
              <img 
                src={generatedImage} 
                alt="Generated poster" 
                className="w-full h-auto max-h-[500px] object-contain"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button
                onClick={handleDownload}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center"
              >
                📥 下载高清图片
              </button>
              <button
                onClick={() => { setStep(2); }}
                className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-all"
              >
                ✏️ 重新编辑
              </button>
              <button
                onClick={() => { 
                  setStep(1); 
                  setUploadedImage(null); 
                  setGeneratedImage(null);
                  setTextLayers([]);
                }}
                className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-all"
              >
                📸 新建海报
              </button>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm text-purple-800 font-medium">剩余免费次数</p>
                  <p className="text-2xl font-bold text-purple-600">46 / 50</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-800 font-medium">下次重置</p>
                  <p className="text-lg text-purple-700">2026 年 4 月 1 日</p>
                </div>
                <Link 
                  href="/pricing"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  升级 Pro 无限生成 →
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
