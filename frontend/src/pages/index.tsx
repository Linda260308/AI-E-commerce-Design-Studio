import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Head>
        <title>AI Poster Studio - Create Professional E-commerce Posters in 3 Minutes</title>
        <meta name="description" content="Transform product photos into professional marketing visuals with editable text" />
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
                Features
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors">
                Pricing
              </Link>
              <Link href="#examples" className="text-gray-700 hover:text-purple-600 transition-colors">
                Examples
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-purple-600 transition-colors">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all"
              >
                Sign Up Free
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
                Features
              </Link>
              <Link href="#pricing" className="block text-gray-700 hover:text-purple-600">
                Pricing
              </Link>
              <Link href="/login" className="block text-gray-700 hover:text-purple-600">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-center"
              >
                Sign Up Free
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
            <span>AI-Powered · Editable Text · 3-Minute Creation</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Product Photos into
            <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              Professional Marketing Posters
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Upload your product image, add custom text, and let AI generate stunning backgrounds. 
            Perfect for Amazon, TikTok, Instagram, and more.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              href="/editor" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all"
            >
              ✨ Start Creating Free
            </Link>
            <Link 
              href="#examples" 
              className="bg-white text-purple-600 border-2 border-purple-200 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transition-all"
            >
              🎬 View Examples
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="text-xl">✅</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚡</span>
              <span>Generate in seconds</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎨</span>
              <span>Fully editable designs</span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20 mt-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for E-commerce Success
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to create stunning product visuals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📷</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Background Removal</h3>
              <p className="text-gray-600">
                Automatically remove backgrounds from product photos with AI precision. 
                Perfect cutouts every time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Background Generation</h3>
              <p className="text-gray-600">
                Describe your ideal background and watch AI create it. From minimalist podiums 
                to luxury marble surfaces.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">✏️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Editable Text Layers</h3>
              <p className="text-gray-600">
                Add, edit, and customize text with full control over fonts, colors, and positioning. 
                Make it yours.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Platform Sizes</h3>
              <p className="text-gray-600">
                One-click resize for Amazon, TikTok, Instagram, YouTube, and more. 
                Perfect dimensions for every platform.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Templates</h3>
              <p className="text-gray-600">
                Start with pre-designed templates optimized for conversions. 
                Customize to match your brand.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Download</h3>
              <p className="text-gray-600">
                Export high-resolution images ready for upload. 
                No watermarks, no restrictions.
              </p>
            </div>
          </div>
        </section>

        {/* Examples Section */}
        <section id="examples" className="py-20 mt-20 bg-white rounded-3xl px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See What You Can Create
            </h2>
            <p className="text-xl text-gray-600">
              From simple product photos to professional marketing visuals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example 1 */}
            <div className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                <span className="text-6xl">🧴</span>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-semibold">Cosmetics</p>
              </div>
            </div>

            {/* Example 2 */}
            <div className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <span className="text-6xl">⌚</span>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-semibold">Electronics</p>
              </div>
            </div>

            {/* Example 3 */}
            <div className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-pink-100 flex items-center justify-center">
                <span className="text-6xl">👟</span>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-semibold">Fashion</p>
              </div>
            </div>

            {/* Example 4 */}
            <div className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <span className="text-6xl">🍷</span>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-semibold">Food & Beverage</p>
              </div>
            </div>

            {/* Example 5 */}
            <div className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <span className="text-6xl">💎</span>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-semibold">Jewelry</p>
              </div>
            </div>

            {/* Example 6 */}
            <div className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-blue-100 flex items-center justify-center">
                <span className="text-6xl">🏠</span>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-semibold">Home & Living</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 mt-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Perfect for trying out</p>
              <div className="text-4xl font-bold mb-6">
                $0
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">5 credits per month</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Standard resolution (1080x1080)</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Basic templates</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Watermarked</span>
                </li>
              </ul>
              <Link 
                href="/signup" 
                className="block w-full bg-purple-100 text-purple-700 text-center py-3 rounded-lg font-semibold hover:bg-purple-200 transition-colors"
              >
                Get Started
              </Link>
              <p className="text-xs text-gray-500 text-center mt-3">
                1 次生成 = 1 credit
              </p>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 rounded-2xl shadow-lg text-white relative">
              <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-purple-100 mb-6">For growing businesses</p>
              <div className="text-4xl font-bold mb-6">
                $19
                <span className="text-lg font-normal text-purple-100">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-white">150 credits per month</span>
                </li>
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-white">HD resolution (2048x2048)</span>
                </li>
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-white">All templates</span>
                </li>
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-white">No watermark</span>
                </li>
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-white">Batch processing (up to 5)</span>
                </li>
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-white">Priority email support</span>
                </li>
              </ul>
              <Link 
                href="/profile" 
                className="block w-full bg-white text-purple-600 text-center py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Start 7-Day Free Trial
              </Link>
              <p className="text-xs text-purple-100 text-center mt-3 opacity-90">
                1 次生成 = 1 credit · 随时取消
              </p>
            </div>
          </div>

          {/* Annual Billing Note */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              💡 Save 15% with annual billing: <span className="font-semibold text-purple-600">$199/year</span>
            </p>
          </div>

          {/* Credit Usage Guide */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">💡 Credits 如何计算？</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-red-600 mb-2 text-sm">消耗 Credits</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• AI 生成海报：1 credit/次</li>
                    <li>• HD 导出：+1 credit/张</li>
                    <li>• 批量处理：每张独立计算</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-600 mb-2 text-sm">免费操作</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 编辑文字/颜色/字体</li>
                    <li>• 更换模板</li>
                    <li>• 保存草稿</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 mt-20">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Create Stunning Posters?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of e-commerce sellers creating professional product visuals in minutes.
            </p>
            <Link 
              href="/signup" 
              className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              Start Creating Free Today
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 mt-20 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎨</span>
              <span className="font-bold text-gray-700">AI Poster Studio</span>
            </div>
            <div className="text-sm text-gray-600">
              © 2026 AI Poster Studio. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link href="#" className="hover:text-purple-600">Privacy</Link>
              <Link href="#" className="hover:text-purple-600">Terms</Link>
              <Link href="#" className="hover:text-purple-600">Contact</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
