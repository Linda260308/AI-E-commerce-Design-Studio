import { useState, useRef } from 'react';
import { usePosterStore } from '../store/posterStore';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import Head from 'next/head';

export default function Editor() {
  const {
    productImage,
    generatedImage,
    textLayers,
    selectedLayerId,
    prompt: promptText,
    aspectRatio,
    isGenerating,
    credits,
    setProductImage,
    setGeneratedImage,
    addTextLayer,
    updateTextLayer,
    removeTextLayer,
    selectTextLayer,
    setPrompt,
    setAspectRatio,
    setIsGenerating,
  } = usePosterStore();

  const [showTextTools, setShowTextTools] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [backgroundType, setBackgroundType] = useState('White Podium');
  const canvasRef = useRef<HTMLDivElement>(null);

  // 画布尺寸配置
  const aspectRatios = [
    { ratio: '1:1', platforms: 'Amazon, Instagram Square', width: 1080, height: 1080 },
    { ratio: '4:3', platforms: 'Facebook, LinkedIn', width: 1200, height: 900 },
    { ratio: '9:16', platforms: 'TikTok, Instagram Stories, Reels', width: 1080, height: 1920 },
    { ratio: '16:9', platforms: 'YouTube, Facebook Cover', width: 1920, height: 1080 },
  ];

  // 背景类型配置
  const backgroundTypes = [
    { name: 'White Podium', desc: 'Minimalist white background', preview: '🤍' },
    { name: 'Luxury Marble', desc: 'Marble / Dark luxury background', preview: '🖤' },
    { name: 'Natural Wood', desc: 'Wood / Natural background', preview: '🪵' },
    { name: 'Gradient', desc: 'Gradient / Abstract background', preview: '🌈' },
  ];

  // 图片上传处理
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
  });

  // Remove BG 抠图（模拟）
  const handleRemoveBG = async () => {
    if (!productImage) return;
    setIsGenerating(true);
    // TODO: 调用 Remove.bg API
    setTimeout(() => {
      setIsGenerating(false);
      alert('Remove BG feature requires API configuration');
    }, 1500);
  };

  // 根据关键词匹配背景
  const matchBackground = (keyword: string) => {
    const lowerKeyword = keyword.toLowerCase();
    if (lowerKeyword.includes('white') || lowerKeyword.includes('clean') || lowerKeyword.includes('minimal')) {
      return 'White Podium';
    } else if (lowerKeyword.includes('luxury') || lowerKeyword.includes('marble') || lowerKeyword.includes('dark')) {
      return 'Luxury Marble';
    } else if (lowerKeyword.includes('wood') || lowerKeyword.includes('natural') || lowerKeyword.includes('organic')) {
      return 'Natural Wood';
    } else if (lowerKeyword.includes('gradient') || lowerKeyword.includes('colorful') || lowerKeyword.includes('abstract')) {
      return 'Gradient';
    }
    return 'White Podium';
  };

  // 背景关键词变化时自动匹配
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    const matched = matchBackground(newPrompt);
    setBackgroundType(matched);
  };

  // 添加文字
  const handleAddText = () => {
    addTextLayer({
      text: 'Click to edit',
      x: 100,
      y: 100,
      fontSize: 32,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
    });
    setShowTextTools(true);
  };

  // 下载海报
  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);
    
    // TODO: 使用 html2canvas 或类似库生成图片
    setTimeout(() => {
      setIsGenerating(false);
      // 模拟下载
      const link = document.createElement('a');
      link.download = 'ai-poster-studio.png';
      link.href = productImage || '';
      link.click();
      alert('Poster downloaded successfully!');
    }, 1500);
  };

  // 字体选项
  const fonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Impact',
    'Comic Sans MS',
    'Courier New',
  ];

  return (
    <>
      <Head>
        <title>Editor - AI Poster Studio</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 顶部导航 */}
        <nav className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14 items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">🎨</span>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Poster Studio
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Credits: <span className="font-bold text-purple-600">{credits}</span>
                </span>
                <Link 
                  href="/pricing" 
                  className="text-sm text-purple-600 hover:underline"
                >
                  Upgrade
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <button
                    onClick={handleDownload}
                    disabled={!productImage}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm font-medium"
                  >
                    📥 Download Poster
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* 主内容区 */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* 左侧步骤面板 */}
            <aside className="w-80 bg-white rounded-xl shadow-sm border p-4 h-fit">
              {/* Step 1 */}
              <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>
                Upload Product
              </h3>
              
              <div 
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <span className="text-4xl block mb-2">📷</span>
                <p className="text-sm text-gray-600">
                  {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP</p>
              </div>

              {productImage && (
                <button
                  onClick={handleRemoveBG}
                  disabled={isGenerating}
                  className="w-full mt-3 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  ✂️ Remove BG
                </button>
              )}

              {/* Step 2: Canvas Size & Background */}
              <div className="mt-6">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs mr-2">2</span>
                  Canvas & Background
                </h3>
                
                {/* Canvas Size */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Canvas Size
                  </label>
                  <div className="space-y-2">
                    {aspectRatios.map((item) => (
                      <button
                        key={item.ratio}
                        onClick={() => setAspectRatio(item.ratio)}
                        className={`w-full p-2 rounded-lg border text-left transition-colors ${
                          aspectRatio === item.ratio
                            ? 'bg-purple-50 border-purple-500'
                            : 'bg-white border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm">{item.ratio}</span>
                          <span className="text-xs text-gray-500">{item.width}×{item.height}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{item.platforms}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Background
                  </label>
                  <textarea
                    value={promptText}
                    onChange={handlePromptChange}
                    placeholder="e.g., white minimalist podium, luxury marble..."
                    className="w-full border border-gray-300 rounded-lg p-2 h-16 text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {backgroundTypes.map((bg) => (
                      <button
                        key={bg.name}
                        onClick={() => setBackgroundType(bg.name)}
                        className={`p-2 rounded-lg border text-left transition-colors ${
                          backgroundType === bg.name
                            ? 'bg-purple-50 border-purple-500'
                            : 'bg-white border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        <span className="text-lg block">{bg.preview}</span>
                        <span className="text-xs font-medium block truncate">{bg.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: Add Text */}
              <div className="mt-6">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs mr-2">3</span>
                  Add Text
                </h3>
                
                <button
                  onClick={handleAddText}
                  className="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  ➕ Add Text Layer
                </button>

                {textLayers.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {textLayers.map((layer, index) => (
                      <div
                        key={layer.id}
                        onClick={() => {
                          selectTextLayer(layer.id);
                          setShowTextTools(true);
                        }}
                        className={`p-2 rounded border text-xs cursor-pointer flex justify-between items-center ${
                          selectedLayerId === layer.id
                            ? 'bg-purple-50 border-purple-500'
                            : 'bg-white border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        <span className="truncate flex-1">{layer.text}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTextLayer(layer.id);
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* 中间画布区域 */}
            <div 
              ref={canvasRef}
              className="flex-1 bg-white rounded-xl shadow-sm border p-6 min-h-[600px] flex items-center justify-center relative overflow-hidden"
              style={{
                aspectRatio: aspectRatio.replace(':', '/'),
                maxHeight: '700px',
              }}
            >
              {!productImage ? (
                <div className="text-center text-gray-400">
                  <span className="text-6xl block mb-4">📷</span>
                  <p className="text-lg">Upload a product image to start</p>
                  <p className="text-sm mt-2">Step 1: Upload your product photo</p>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={productImage}
                    alt="Product"
                    className="w-full h-full object-contain"
                  />
                  
                  {/* 文字图层 */}
                  {textLayers.map((layer) => (
                    <div
                      key={layer.id}
                      onClick={() => {
                        selectTextLayer(layer.id);
                        setShowTextTools(true);
                      }}
                      className={`absolute cursor-move p-1 hover:bg-purple-100 rounded ${
                        selectedLayerId === layer.id ? 'ring-2 ring-purple-500' : ''
                      }`}
                      style={{
                        left: layer.x,
                        top: layer.y,
                        fontSize: layer.fontSize,
                        fontFamily: layer.fontFamily,
                        fontWeight: layer.fontWeight,
                        fontStyle: layer.fontStyle,
                        color: layer.color,
                      }}
                    >
                      {layer.text}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTextLayer(layer.id);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧文字属性面板 */}
            {showTextTools && selectedLayerId && (
              <aside className="w-72 bg-white rounded-xl shadow-sm border p-4 h-fit">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700 text-sm">Text Properties</h3>
                  <button
                    onClick={() => setShowTextTools(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Text Content</label>
                    <input
                      type="text"
                      value={textLayers.find(l => l.id === selectedLayerId)?.text || ''}
                      onChange={(e) => updateTextLayer(selectedLayerId, { text: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Font Family</label>
                    <select
                      value={textLayers.find(l => l.id === selectedLayerId)?.fontFamily || 'Arial'}
                      onChange={(e) => updateTextLayer(selectedLayerId, { fontFamily: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      {fonts.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Font Size: {textLayers.find(l => l.id === selectedLayerId)?.fontSize || 24}px</label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={textLayers.find(l => l.id === selectedLayerId)?.fontSize || 24}
                      onChange={(e) => updateTextLayer(selectedLayerId, { fontSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={textLayers.find(l => l.id === selectedLayerId)?.color || '#000000'}
                        onChange={(e) => updateTextLayer(selectedLayerId, { color: e.target.value })}
                        className="w-12 h-10 rounded-lg cursor-pointer border"
                      />
                      <div className="flex-1 grid grid-cols-5 gap-1">
                        {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'].map((color) => (
                          <button
                            key={color}
                            onClick={() => updateTextLayer(selectedLayerId, { color })}
                            className="w-full h-6 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Style</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const layer = textLayers.find(l => l.id === selectedLayerId);
                          updateTextLayer(selectedLayerId, { 
                            fontWeight: layer?.fontWeight === 'bold' ? 'normal' : 'bold' 
                          });
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm font-bold ${
                          textLayers.find(l => l.id === selectedLayerId)?.fontWeight === 'bold'
                            ? 'bg-purple-100 border-purple-500'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        B
                      </button>
                      <button
                        onClick={() => {
                          const layer = textLayers.find(l => l.id === selectedLayerId);
                          updateTextLayer(selectedLayerId, { 
                            fontStyle: layer?.fontStyle === 'italic' ? 'normal' : 'italic' 
                          });
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm italic ${
                          textLayers.find(l => l.id === selectedLayerId)?.fontStyle === 'italic'
                            ? 'bg-purple-100 border-purple-500'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        I
                      </button>
                      <button
                        onClick={() => {
                          const layer = textLayers.find(l => l.id === selectedLayerId);
                          updateTextLayer(selectedLayerId, { 
                            fontStyle: layer?.fontStyle === 'underline' ? 'normal' : 'underline' 
                          });
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm underline ${
                          textLayers.find(l => l.id === selectedLayerId)?.fontStyle === 'underline'
                            ? 'bg-purple-100 border-purple-500'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        U
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Position</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500">X</span>
                        <input
                          type="number"
                          value={textLayers.find(l => l.id === selectedLayerId)?.x || 0}
                          onChange={(e) => updateTextLayer(selectedLayerId, { x: parseInt(e.target.value) })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Y</span>
                        <input
                          type="number"
                          value={textLayers.find(l => l.id === selectedLayerId)?.y || 0}
                          onChange={(e) => updateTextLayer(selectedLayerId, { y: parseInt(e.target.value) })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeTextLayer(selectedLayerId)}
                    className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    🗑️ Delete Text
                  </button>
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
