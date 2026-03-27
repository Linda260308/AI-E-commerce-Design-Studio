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
  const [selectedText, setSelectedText] = useState<any>(null);

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

  // 添加文字
  const handleAddText = () => {
    addTextLayer({
      text: '点击编辑文字',
      x: 100,
      y: 100,
      fontSize: 32,
      color: '#000000',
    });
    setShowTextTools(true);
  };

  // 生成海报（模拟）
  const handleGenerate = async () => {
    setIsGenerating(true);
    // 模拟生成过程
    setTimeout(() => {
      setIsGenerating(false);
      alert('生成功能需要配置后端 API');
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>编辑器 - AI Poster Studio</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        {/* 顶部导航 */}
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-3xl">🎨</span>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Poster Studio
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  剩余点数：<span className="font-bold text-purple-600">{credits}</span>
                </span>
                <Link 
                  href="/pricing" 
                  className="text-sm text-purple-600 hover:underline"
                >
                  充值
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* 主内容区 */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* 左侧工具栏 */}
            <aside className="w-64 bg-white rounded-xl shadow-sm border p-4 h-fit">
              <h3 className="font-bold text-gray-700 mb-4">工具</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleAddText}
                  className="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  ➕ 添加文字
                </button>
                
                <div {...getRootProps()} className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer">
                  📷 上传产品图
                  <input {...getInputProps()} />
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !productImage}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isGenerating ? '生成中...' : '✨ 生成海报'}
                </button>
              </div>

              {/* 背景描述 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  背景描述
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述想要的背景效果..."
                  className="w-full border border-gray-300 rounded-lg p-3 h-24 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* 宽高比选择 */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  宽高比
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['1:1', '4:3', '16:9'].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                        aspectRatio === ratio
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* 中间画布区域 */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border p-6 min-h-[600px]">
              {!productImage ? (
                <div
                  {...getRootProps()}
                  className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg ${
                    isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                  }`}
                >
                  <input {...getInputProps()} />
                  <span className="text-6xl mb-4">📷</span>
                  <p className="text-gray-600 mb-2">拖拽产品图片到此处</p>
                  <p className="text-gray-500 text-sm">或点击上传</p>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={productImage}
                    alt="Product"
                    className="w-full h-full object-contain"
                  />
                  
                  {/* 文字图层（简化版，使用 HTML 渲染） */}
                  {textLayers.map((layer) => (
                    <div
                      key={layer.id}
                      onClick={() => {
                        selectTextLayer(layer.id);
                        setSelectedText(layer);
                        setShowTextTools(true);
                      }}
                      className={`absolute cursor-move p-2 hover:bg-purple-100 rounded ${
                        selectedLayerId === layer.id ? 'ring-2 ring-purple-500' : ''
                      }`}
                      style={{
                        left: layer.x,
                        top: layer.y,
                        fontSize: layer.fontSize,
                        color: layer.color,
                        fontWeight: layer.fontWeight,
                        fontStyle: layer.fontStyle,
                      }}
                    >
                      {layer.text}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTextLayer(layer.id);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧属性面板 */}
            {showTextTools && selectedLayerId && (
              <aside className="w-72 bg-white rounded-xl shadow-sm border p-4 h-fit">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700">文字属性</h3>
                  <button
                    onClick={() => setShowTextTools(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">文字内容</label>
                    <input
                      type="text"
                      value={textLayers.find(l => l.id === selectedLayerId)?.text || ''}
                      onChange={(e) => updateTextLayer(selectedLayerId, { text: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">字体大小</label>
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
                    <label className="block text-sm text-gray-600 mb-1">颜色</label>
                    <input
                      type="color"
                      value={textLayers.find(l => l.id === selectedLayerId)?.color || '#000000'}
                      onChange={(e) => updateTextLayer(selectedLayerId, { color: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">字体样式</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const layer = textLayers.find(l => l.id === selectedLayerId);
                          updateTextLayer(selectedLayerId, { 
                            fontWeight: layer?.fontWeight === 'bold' ? 'normal' : 'bold' 
                          });
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                          textLayers.find(l => l.id === selectedLayerId)?.fontWeight === 'bold'
                            ? 'bg-purple-100 border-purple-500'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <b>B</b>
                      </button>
                      <button
                        onClick={() => {
                          const layer = textLayers.find(l => l.id === selectedLayerId);
                          updateTextLayer(selectedLayerId, { 
                            fontStyle: layer?.fontStyle === 'italic' ? 'normal' : 'italic' 
                          });
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                          textLayers.find(l => l.id === selectedLayerId)?.fontStyle === 'italic'
                            ? 'bg-purple-100 border-purple-500'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <i>I</i>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeTextLayer(selectedLayerId)}
                    className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    🗑️ 删除文字
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
