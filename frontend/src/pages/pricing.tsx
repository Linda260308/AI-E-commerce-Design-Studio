import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: '永远免费',
      description: '适合试用和体验',
      features: [
        '5 credits/月',
        '带水印',
        '标准分辨率 (1080x1080)',
        '基础模板',
        '1 次生成 = 1 credit'
      ],
      cta: '开始免费使用',
      highlighted: false
    },
    {
      name: 'Pro',
      price: isAnnual ? 199 : 19,
      period: isAnnual ? '/年' : '/月',
      description: '适合电商卖家和专业创作者',
      features: [
        '150 credits/月',
        '无水印',
        'HD 分辨率 (2048x2048)',
        '全部模板',
        '可编辑文字',
        '批量处理 (最多 5 张)',
        '邮件优先支持',
        '商业使用授权'
      ],
      cta: '开始 7 天免费试用',
      highlighted: true,
      savings: isAnnual ? '省 15%' : null
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <Head>
        <title>定价 - AI Poster Studio</title>
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🎨</span>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Poster Studio
              </span>
            </Link>
            <div className="flex space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-purple-600 px-3 py-2">
                登录
              </Link>
              <Link href="/signup" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            简单透明的定价
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            选择适合你的套餐，随时升级或取消
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              月付
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                isAnnual ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  isAnnual ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              年付
              <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                省 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-xl p-8 ${
                plan.highlighted ? 'ring-2 ring-purple-600 scale-105' : ''
              }`}
            >
              {plan.savings && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  {plan.savings}
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              <div className="mb-6">
                {typeof plan.price === 'number' ? (
                  <>
                    <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">常见问题</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-2">💳 如何付款？</h3>
              <p className="text-gray-600">我们支持 PayPal、信用卡等多种支付方式。所有交易都是安全的。</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🔄 可以随时取消吗？</h3>
              <p className="text-gray-600">当然可以！你可以随时取消订阅，已支付的费用不会退还，但你可以继续使用到周期结束。</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🎨 Credits 如何计算？</h3>
              <p className="text-gray-600">每次 AI 生成海报消耗 1 credit。编辑文字、调整颜色、更换模板不消耗 credits。每月 1 号重置，未用完的 credits 不结转。</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">📧 Pro 用户有发票吗？</h3>
              <p className="text-gray-600">付款后系统会自动发送发票到你的邮箱。如需公司抬头发票，请在账户设置中填写公司信息。</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">准备好开始创作了吗？</h2>
          <p className="text-xl text-gray-600 mb-8">
            3 分钟创建专业电商海报，无需设计经验
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 shadow-lg">
              免费开始
            </Link>
            <Link href="/editor" className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 shadow-lg border-2 border-purple-600">
              先试试看
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2026 AI Poster Studio. Built with ❤️ by Linda</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
