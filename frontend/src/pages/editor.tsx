import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Editor() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Edit, 3: Result
  const [textContent, setTextContent] = useState('限时特价！');
  const [fontStyle, setFontStyle] = useState('modern');
  const [colorScheme, setColorScheme] = useState('#8B5CF6');
  const [prompt, setPrompt] = useState('professional product photography, studio lighting, clean background');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    try {
      // Call backend API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          prompt,
          text_content: textContent,
          font_style: fontStyle,
          color_scheme: colorScheme
        })
      });
      const result = await response.json();
      setGeneratedImage(result.image_url);
      setStep(3);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('生成失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    // Download the generated image
    const link = document.createElement('a');
    link.href = generatedImage || '';
    link.download = 'ai-poster.png';
    link.click();
  };

  const fontStyles = [
    { id: 'modern', name: '现代', preview: 'font-sans' },
    { id: 'elegant', name: '优雅', preview: 'font-serif' },
    { id: 'bold', name: '粗体', preview: 'font-bold' },
    { id: 'handwriting', name: '手写', preview: 'font-mono' },
    { id: 'creative', name: '创意', preview: 'italic' },
  ];

  const colors = [
    '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', 
    '#10B981', '#3B82F6', '#6366F1', '#000000'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI Poster Editor - Create Professional E-commerce Posters</title>
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🎨</span>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Poster Studio
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">剩余次数：47/50</span>
              <Link href="/upgrade" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                升级套餐
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[
            { num: 1, label: '上传图片' },
            { num: 2, label: '编辑设计' },
            { num: 3, label: '下载结果' }
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s.num ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s.num}
              </div>
              <span className={`ml-2 ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {i < 2 && <div className={`w-16 h-0.5 mx-4 ${step > s.num ? 'bg-purple-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">上传产品图片</h2>
            <div 
              className="border-2 border-dashed border-purple-300 rounded-xl p-16 hover:border-purple-500 transition-colors cursor-pointer text-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="text-6xl mb-4">📸</div>
              <p className="text-lg text-gray-700 font-medium mb-2">
                点击或拖拽上传图片
              </p>
              <p className="text-sm text-gray-500">
                支持 JPG, PNG, WEBP (最大 10MB)
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl mb-2">🤖</div>
                <div>AI 自动抠图</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl mb-2">✨</div>
                <div>智能背景生成</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl mb-2">✏️</div>
                <div>可编辑文字</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Edit */}
        {step === 2 && uploadedImage && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Preview */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">图片预览</h3>
              <div className="relative bg-gray-100 rounded-xl overflow-hidden" style={{ minHeight: '400px' }}>
                <img 
                  src={uploadedImage} 
                  alt="Uploaded product" 
                  className="w-full h-full object-contain"
                />
                {generatedImage && (
                  <img 
                    src={generatedImage} 
                    alt="Generated poster" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              {/* Text Content */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-4">文字内容</h3>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="输入海报文字，例如：限时特价！"
                />
              </div>

              {/* Font Style */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-4">字体样式</h3>
                <div className="grid grid-cols-3 gap-3">
                  {fontStyles.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setFontStyle(font.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        fontStyle === font.id 
                          ? 'border-purple-600 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`text-sm ${font.preview}`}>{font.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Scheme */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-4">文字颜色</h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setColorScheme(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        colorScheme === color ? 'border-gray-900 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* AI Prompt */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-4">背景风格</h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  placeholder="描述你想要的背景风格..."
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {['简约白色', '奢华金色', '清新自然', '科技感', '节日氛围'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setPrompt(style)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    AI 生成中...
                  </span>
                ) : (
                  '✨ 生成海报'
                )}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
              >
                ← 返回重新选择
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && generatedImage && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">🎉 生成成功！</h2>
            <div className="bg-gray-100 rounded-xl overflow-hidden mb-8" style={{ maxHeight: '500px' }}>
              <img src={generatedImage} alt="Generated poster" className="w-full h-full object-contain" />
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDownload}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                📥 下载高清图片
              </button>
              <button
                onClick={() => { setStep(2); setGeneratedImage(null); }}
                className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-all"
              >
                ✏️ 重新编辑
              </button>
              <button
                onClick={() => { setStep(1); setUploadedImage(null); setGeneratedImage(null); }}
                className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-all"
              >
                📸 新建海报
              </button>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              剩余免费次数：46/50 | 升级 Pro 解锁无限生成
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
