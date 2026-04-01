import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'Forever Free',
      description: 'Perfect for trying out',
      features: [
        '5 credits/month',
        'Watermarked',
        'Standard resolution (1080x1080)',
        'Basic templates',
        '1 Generate = 1 credit'
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      name: 'Pro',
      price: isAnnual ? 199 : 19,
      period: isAnnual ? '/year' : '/month',
      description: 'For e-commerce sellers and creators',
      features: [
        '150 credits/month',
        'No watermark',
        'HD resolution (2048x2048)',
        'All templates',
        'Editable text',
        'Batch processing (up to 5)',
        'Priority email support',
        'Commercial use license'
      ],
      cta: 'Start 7-Day Free Trial',
      highlighted: true,
      savings: isAnnual ? 'Save 15%' : null
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <Head>
        <title>Pricing - AI Poster Studio</title>
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
                Login
              </Link>
              <Link href="/signup" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose your plan, upgrade or cancel anytime
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
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
              Annual
              <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Save 20%
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

              <Link
                href={plan.name === 'Free' ? '/signup' : '/profile'}
                className={`block w-full py-3 px-4 rounded-lg font-semibold transition-all text-center ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Credit Usage Guide */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-6">💡 How Credits Work</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-purple-700">Uses Credits</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-0.5">●</span>
                  <span className="text-gray-700"><strong>AI Generate</strong>: 1 credit per generation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-0.5">●</span>
                  <span className="text-gray-700"><strong>HD Export</strong>: +1 credit per image</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-0.5">●</span>
                  <span className="text-gray-700"><strong>Batch Processing</strong>: Per image basis</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3 text-green-700">Free Operations</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700"><strong>Edit Text</strong>: Add, modify, delete</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700"><strong>Adjust Colors/Fonts</strong>: Any style changes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700"><strong>Change Templates</strong>: Switch designs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700"><strong>Save Drafts</strong>: Unlimited saves</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 text-center">
              💡 <strong>Note:</strong> Credits reset on the 1st of each month. Unused credits don't roll over. Plan upgrades take effect immediately with prorated credits.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-2">💳 How to pay?</h3>
              <p className="text-gray-600">We accept PayPal, credit cards, and other payment methods. All transactions are secure.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🔄 Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes! You can cancel anytime. Payments are non-refundable but you keep access until the end of your billing period.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">📧 Do Pro users get invoices?</h3>
              <p className="text-gray-600">Invoices are automatically sent to your email after payment. For company invoices, add your company details in account settings.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🎯 What if I run out of credits?</h3>
              <p className="text-gray-600">You can purchase additional credit packs in your profile or upgrade to Pro for more credits.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Stunning Posters?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Create professional e-commerce posters in 3 minutes, no design experience needed
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 shadow-lg">
              Start Free
            </Link>
            <Link href="/editor" className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 shadow-lg border-2 border-purple-600">
              Try It Now
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
