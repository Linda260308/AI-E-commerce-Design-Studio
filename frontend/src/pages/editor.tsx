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
  const [backgroundType, setBackgroundType] = useState('White Podium');
  const [productScale, setProductScale] = useState(100);
  const [productPosition, setProductPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const productImgRef = useRef<HTMLImageElement>(null);

  // Remove.bg API Key
  const REMOVE_BG_API_KEY = 'bh1QY29JdqoMv4JeWzeZa8Zm';

  // 画布尺寸配置
  const aspectRatios = [
    { ratio: '1:1', platforms: 'Amazon, Instagram Square', width: 1080, height: 1080, color: 'from-purple-400 to-blue-400' },
    { ratio: '4:3', platforms: 'Facebook, LinkedIn', width: 1200, height: 900, color: 'from-blue-400 to-green-400' },
    { ratio: '9:16', platforms: 'TikTok, Instagram Stories, Reels', width: 1080, height: 1920, color: 'from-pink-400 to-purple-400' },
    { ratio: '16:9', platforms: 'YouTube, Facebook Cover', width: 1920, height: 1080, color: 'from-orange-400 to-pink-400' },
  ];

  // 背景类型配置
  const backgroundTypes = [
    { name: 'White Podium', desc: 'Minimalist white', preview: '🤍', color: 'from-gray-50 to-gray-200' },
    { name: 'Luxury Marble', desc: 'Marble / Dark luxury', preview: '🖤', color: 'from-gray-800 to-gray-900' },
    { name: 'Natural Wood', desc: 'Wood / Natural', preview: '🪵', color: 'from-amber-200 to-amber-400' },
    { name: 'Gradient', desc: 'Gradient / Abstract', preview: '🌈', color: 'from-purple-300 via-pink-300 to-blue-300' },
  ];

  // 图片上传处理
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductImage(e.target?.result as string);
        setProductPosition({ x: 0, y: 0 }); // 重置位置
        setProductScale(100); // 重置缩放
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

  // Remove BG 抠图
  const handleRemoveBG = async () => {
    if (!productImage) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch(productImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image_file', blob, 'product.png');
      formData.append('size', 'auto');
      
      const apiResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
        },
        body: formData,
      });
      
      if (apiResponse.ok) {
        const resultBlob = await apiResponse.blob();
        const reader = new FileReader();
        reader.onload = (e) => {
          setProductImage(e.target?.result as string);
        };
        reader.readAsDataURL(resultBlob);
        alert('Background removed successfully!');
      } else {
        const error = await apiResponse.json();
        alert(`Remove BG failed: ${error.errors?.[0]?.title || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Remove BG error:', error);
      alert('Remove BG failed. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
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

  // 产品图片拖拽处理
  const handleProductMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - productPosition.x,
      y: e.clientY - productPosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setProductPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 下载海报 - 使用 canvas 合成图片
  const handleDownload = async () => {
    if (!canvasRef.current || !productImage) return;
    setIsGenerating(true);
    
    try {
      // 创建 canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 设置 canvas 尺寸
      const selectedRatio = aspectRatios.find(a => a.ratio === aspectRatio);
      canvas.width = selectedRatio?.width || 1080;
      canvas.height = selectedRatio?.height || 1080;
      
      if (!ctx) return;
      
      // 1. 绘制背景
      const bgType = backgroundTypes.find(b => b.name === backgroundType);
      if (bgType) {
        // 根据背景类型绘制不同颜色
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        switch (backgroundType) {
          case 'White Podium':
            gradient.addColorStop(0, '#f9fafb');
            gradient.addColorStop(1, '#e5e7eb');
            break;
          case 'Luxury Marble':
            gradient.addColorStop(0, '#1f2937');
            gradient.addColorStop(1, '#111827');
            break;
          case 'Natural Wood':
            gradient.addColorStop(0, '#fde68a');
            gradient.addColorStop(1, '#f59e0b');
            break;
          case 'Gradient':
            gradient.addColorStop(0, '#d8b4fe');
            gradient.addColorStop(0.5, '#f9a8d4');
            gradient.addColorStop(1, '#93c5fd');
            break;
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // 2. 绘制产品图片
      const productImg = new Image();
      productImg.crossOrigin = 'anonymous';
      productImg.src = productImage;
      
      await new Promise((resolve) => {
        productImg.onload = resolve;
      });
      
      // 计算绘制尺寸（应用缩放）
      const scale = productScale / 100;
      const imgWidth = productImg.width * scale;
      const imgHeight = productImg.height * scale;
      
      // 居中绘制
      const centerX = (canvas.width - imgWidth) / 2 + productPosition.x;
      const centerY = (canvas.height - imgHeight) / 2 + productPosition.y;
      
      ctx.drawImage(productImg, centerX, centerY, imgWidth, imgHeight);
      
      // 3. 绘制文字图层
      textLayers.forEach((layer) => {
        ctx.font = `${layer.fontStyle === 'italic' ? 'italic' : ''} ${layer.fontWeight === 'bold' ? 'bold' : ''} ${layer.fontSize}px ${layer.fontFamily}`;
        ctx.fillStyle = layer.color;
        ctx.fillText(layer.text, layer.x, layer.y);
      });
      
      // 4. 导出并下载
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ai-poster-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      alert('Poster downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download poster. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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

  // 获取当前选中的画布尺寸
  const selectedAspectRatio = aspectRatios.find(a => a.ratio === aspectRatio);

  // 获取当前背景颜色
  const getCurrentBackground = () => {
    const bg = backgroundTypes.find(b => b.name === backgroundType);
    if (!bg) return 'from-gray-50 to-gray-200';
    return bg.color;
  };

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
                  className="w-full mt-3 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>✂️</span>
                      <span className="ml-1">Remove BG</span>
                    </>
                  )}
                </button>
              )}

              {/* Step 2: Canvas Size & Background */}
              <div className="mt-6">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs mr-2">2</span>
                  Canvas & Background
                </h3>
                
                {/* Product Scale */}
                {productImage && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Product Size: {productScale}%
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      value={productScale}
                      onChange={(e) => setProductScale(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>20%</span>
                      <span>100%</span>
                      <span>150%</span>
                    </div>
                  </div>
                )}

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
                        className={`w-full p-3 rounded-lg border text-left transition-all relative overflow-hidden ${
                          aspectRatio === item.ratio
                            ? 'ring-2 ring-purple-500 border-purple-500'
                            : 'border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20`}></div>
                        <div className="relative flex justify-between items-center">
                          <span className="font-semibold text-sm">{item.ratio}</span>
                          <span className="text-xs text-gray-600">{item.width}×{item.height}</span>
                        </div>
                        <div className="relative text-xs text-gray-600 mt-1">{item.platforms}</div>
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
                        className={`p-2 rounded-lg border text-left transition-all relative overflow-hidden ${
                          backgroundType === bg.name
                            ? 'ring-2 ring-purple-500 border-purple-500'
                            : 'border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${bg.color} opacity-30`}></div>
                        <div className="relative">
                          <span className="text-lg block">{bg.preview}</span>
                          <span className="text-xs font-medium block truncate">{bg.name}</span>
                          <span className="text-[10px] text-gray-500 truncate">{bg.desc}</span>
                        </div>
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
            <div className="flex-1 flex flex-col">
              <div 
                ref={canvasRef}
                className={`bg-gradient-to-br ${getCurrentBackground()} rounded-xl shadow-sm border p-6 min-h-[600px] flex items-center justify-center relative overflow-hidden`}
                style={{
                  aspectRatio: aspectRatio?.replace(':', '/') || '1',
                  maxHeight: '700px',
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {!productImage ? (
                  <div className="text-center text-gray-600">
                    <span className="text-6xl block mb-4">📷</span>
                    <p className="text-lg">Upload a product image to start</p>
                    <p className="text-sm mt-2">Step 1: Upload your product photo</p>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    {/* 产品图片 - 可拖拽 */}
                    <img
                      ref={productImgRef}
                      src={productImage}
                      alt="Product"
                      className="absolute cursor-move select-none"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(calc(-50% + ${productPosition.x}px), calc(-50% + ${productPosition.y}px)) scale(${productScale / 100})`,
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                      onMouseDown={handleProductMouseDown}
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

              {/* Step 4: Download Button - 图片正下方 */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleDownload}
                  disabled={!productImage || isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-lg font-semibold flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>📥</span>
                      <span>Download Poster</span>
                    </>
                  )}
                </button>
              </div>
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
