import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Head>
        <title>AI Poster Studio - 3 分钟生成专业电商海报</title>
        <meta name="description" content="将产品照片转化为专业营销视觉，文字可编辑" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🎨</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Poster Studio
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-purple-600 transition-colors">
                功能
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors">
                价格
              </Link>
              <Link href="#examples" className="text-gray-700 hover:text-purple-600 transition-colors">
                案例
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-purple-600 transition-colors">
                登录
              </Link>
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all"
              >
                免费注册
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-4">
              <Link href="#features" className="block text-gray-700 hover:text-purple-600">
                功能
              </Link>
              <Link href="#pricing" className="block text-gray-700 hover:text-purple-600">
                价格
              </Link>
              <Link href="/login" className="block text-gray-700 hover:text-purple-600">
                登录
              </Link>
              <Link 
                href="/signup" 
                className="block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-center"
              >
                免费注册
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span>AI 驱动 · 文字可编辑 · 3 分钟出图</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            将产品照片转化为
            <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              专业营销海报
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            不同于 Midjourney，我们的 AI 生成<strong className="text-purple-600">文字可编辑</strong>的海报，让设计更灵活 ✨
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link 
              href="/editor" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all"
            >
              🚀 立即开始 - 免费制作
            </Link>
            <Link 
              href="#how-it-works" 
              className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all border-2 border-purple-200"
            >
              📖 查看教程
            </Link>
          </div>

          {/* Upload Demo */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl mx-auto mb-16 border border-purple-100">
            <div className="border-2 border-dashed border-purple-300 rounded-2xl p-12 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer group">
              <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">📸</div>
              <p className="text-lg text-gray-700 font-medium mb-2">
                拖拽产品图到此处，或点击上传
              </p>
              <p className="text-sm text-gray-500">
                支持 JPG, PNG, WEBP（最大 20MB）
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mb-16">
            <p className="text-sm text-gray-500 mb-6">已帮助 10,000+ 电商卖家提升设计效率</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">Amazon</div>
              <div className="text-2xl font-bold text-gray-400">Shopify</div>
              <div className="text-2xl font-bold text-gray-400">eBay</div>
              <div className="text-2xl font-bold text-gray-400">Etsy</div>
              <div className="text-2xl font-bold text-gray-400">TikTok Shop</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              为什么选择 AI Poster Studio？
            </h2>
            <p className="text-xl text-gray-600">
              专为电商卖家设计的 AI 设计工具
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI 背景生成</h3>
              <p className="text-gray-600 leading-relaxed">
                输入文字描述，AI 自动生成专业级背景。支持现代客厅、海滩、办公室等 100+ 场景。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
              <div className="text-5xl mb-4">✏️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">文字可编辑</h3>
              <p className="text-gray-600 leading-relaxed">
                核心差异化功能！生成后仍可修改文字内容、字体、颜色、位置，真正所见即所得。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
              <div className="text-5xl mb-4">✂️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">智能抠图</h3>
              <p className="text-gray-600 leading-relaxed">
                上传产品图自动去除背景，保留主体。支持手动微调边缘，完美融合新背景。
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">10+ 字体样式</h3>
              <p className="text-gray-600 leading-relaxed">
                提供 10+ 英文字体、多种颜色选择、字号调整、旋转等完整文字编辑功能。
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">多平台适配</h3>
              <p className="text-gray-600 leading-relaxed">
                一键生成 Amazon、Shopify、Instagram 等不同平台要求的尺寸和比例。
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
              <div className="text-5xl mb-4">💾</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">高清导出</h3>
              <p className="text-gray-600 leading-relaxed">
                付费用户可下载无水印高清图（2K/4K），支持 PNG 透明背景、JPG 压缩等格式。
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="py-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl px-8 my-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              3 步完成专业海报设计
            </h2>
            <p className="text-xl text-gray-600">
              无需设计经验，人人都是设计师
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">上传产品图</h3>
              <p className="text-gray-600">
                拖拽上传或拍照，AI 自动抠图去除背景
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">描述背景</h3>
              <p className="text-gray-600">
                输入英文描述，如"modern living room with plants"
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">编辑文字并导出</h3>
              <p className="text-gray-600">
                修改文字内容、样式，下载高清海报
              </p>
            </div>
          </div>
        </div>

        {/* Before/After Demo */}
        <div id="examples" className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              效果展示
            </h2>
            <p className="text-xl text-gray-600">
              看看 AI 如何 transforms 普通产品图
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center text-sm text-gray-500 mb-4 font-medium">Before (产品原图)</div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-64 flex items-center justify-center">
                <span className="text-6xl">📦</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center text-sm text-gray-500 mb-4 font-medium">After (AI 生成)</div>
              <div className="bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 rounded-xl h-64 flex items-center justify-center">
                <span className="text-6xl">✨</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center text-sm text-gray-500 mb-4 font-medium">After (文字编辑)</div>
              <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 rounded-xl h-64 flex items-center justify-center">
                <span className="text-6xl">🎯</span>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="py-16 my-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl px-8 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-5xl mb-6">⭐⭐⭐⭐⭐</div>
            <p className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
              "这个工具节省了我数小时的 Photoshop 时间。<strong className="text-yellow-300">文字可编辑</strong>功能是革命性的，我终于可以快速制作不同版本的广告素材了！"
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                👤
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">Amazon 卖家</p>
                <p className="text-purple-200">月销 10 万+</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              简单透明的价格
            </h2>
            <p className="text-xl text-gray-600">
              免费开始，按需升级
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-2">免费版</h3>
              <p className="text-gray-600 mb-6">适合偶尔使用</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">$0</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">5 次生成/月</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">带水印预览</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">标准清晰度 (1K)</span>
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-3">✕</span>
                  <span>文字编辑功能</span>
                </li>
              </ul>
              <Link 
                href="/signup" 
                className="block text-center bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                免费注册
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                热门
              </div>
              <h3 className="text-2xl font-bold mb-2">专业版</h3>
              <p className="text-purple-200 mb-6">适合电商卖家</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">$9.9</span>
                <span className="text-purple-200">/月</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-3">✓</span>
                  <span>50 次生成/月</span>
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-3">✓</span>
                  <span>无水印高清下载</span>
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-3">✓</span>
                  <span>2K 分辨率</span>
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-3">✓</span>
                  <span>完整文字编辑功能</span>
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-3">✓</span>
                  <span>优先支持</span>
                </li>
              </ul>
              <Link 
                href="/signup" 
                className="block text-center bg-white text-purple-600 py-3 rounded-xl hover:bg-gray-100 transition-colors font-bold"
              >
                开始 7 天免费试用
              </Link>
            </div>
          </div>

          {/* Annual Plan */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 text-center border-2 border-purple-200">
              <h3 className="text-2xl font-bold mb-2">年付计划</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-purple-600">$99</span>
                <span className="text-gray-600">/年</span>
                <span className="ml-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  省 20%
                </span>
              </div>
              <p className="text-gray-600 mb-6">相当于每月仅 $8.25</p>
              <Link 
                href="/signup" 
                className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                选择年付
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            准备好提升你的设计效率了吗？
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            立即开始免费制作，无需信用卡
          </p>
          <Link 
            href="/signup" 
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all"
          >
            🎨 免费开始设计
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🎨</span>
                <span className="font-bold text-lg">AI Poster Studio</span>
              </div>
              <p className="text-gray-600 text-sm">
                让电商设计更简单、更高效
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">产品</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features" className="hover:text-purple-600">功能</Link></li>
                <li><Link href="#pricing" className="hover:text-purple-600">价格</Link></li>
                <li><Link href="#examples" className="hover:text-purple-600">案例</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">公司</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-purple-600">关于我们</Link></li>
                <li><Link href="#" className="hover:text-purple-600">联系方式</Link></li>
                <li><Link href="#" className="hover:text-purple-600">隐私政策</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">关注</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-purple-600">Twitter</Link></li>
                <li><Link href="#" className="hover:text-purple-600">Instagram</Link></li>
                <li><Link href="#" className="hover:text-purple-600">Facebook</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-600 text-sm">
            <p>© 2026 AI Poster Studio. Built with ❤️ by Linda</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
