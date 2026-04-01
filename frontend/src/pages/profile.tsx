import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getAccessToken, isLoggedIn, logout } from '../lib/auth';

interface User {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  credits: number;
  plan: string;
  created_at: string;
}

interface UserStats {
  total_posters: number;
  total_credits_used: number;
  last_login_at: string | null;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check login status
    const checkAuth = async () => {
      const token = getAccessToken();
      console.log('Profile: Checking auth, token exists:', !!token);
      
      if (!token || !isLoggedIn()) {
        console.log('Profile: No token, redirecting to login');
        router.push('/login');
        return;
      }
      
      // 加载用户数据
      await loadUserData();
    };
    
    checkAuth();
  }, []);

  const loadUserData = async () => {
    try {
      const token = getAccessToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      
      console.log('Profile: Loading data from', backendUrl);
      
      const userRes = await fetch(`${backendUrl}/api/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile: User API response status:', userRes.status);
      
      if (userRes.status === 401 || userRes.status === 404) {
        console.log('Profile: Token expired or API not found');
        setError('Failed to load user info (Status: ' + userRes.status + '). Please login again');
        return;
      }
      
      if (userRes.ok) {
        const userData = await userRes.json();
        console.log('Profile: User data loaded:', userData);
        setUser(userData);
      } else {
        const errorText = await userRes.text();
        console.error('Profile: Failed to load user data:', userRes.status, errorText);
        setError(`Failed to load user info (Status: ${userRes.status}). Please login again`);
        return;
      }
      
      // Stats API 暂时不启用（后端未实现）
      // const statsRes = await fetch(`${backendUrl}/api/user/stats`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // if (statsRes.ok) {
      //   const statsData = await statsRes.json();
      //   setStats(statsData);
      // }
    } catch (error) {
      console.error('Profile: Failed to load user data:', error);
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setError(`加载失败：${errorMsg}。请检查网络连接或刷新页面重试`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout(process.env.NEXT_PUBLIC_BACKEND_URL);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Load Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md">
          <div className="text-4xl mb-4">❓</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">User Info Not Found</h2>
          <p className="text-gray-600 mb-6">Login session may have expired. Please login again.</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90"
            >
              Back to Login
            </button>
            <button
              onClick={() => router.push('/editor')}
              className="w-full px-6 py-3 bg-white border-2 border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50"
            >
              🎨 Go to Editor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <Head>
        <title>Profile - AI Poster Studio</title>
      </Head>

      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/editor" className="text-2xl mr-4">🎨</Link>
              <h1 className="text-xl font-bold text-gray-900">AI Poster Studio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/editor"
                className="text-sm px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90"
              >
                🎨 Editor
              </Link>
              <span className="text-sm text-gray-600">{user.name || user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 左侧边栏 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* 用户头像和信息 */}
              <div className="text-center mb-6">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name || 'User'}
                    className="w-24 h-24 rounded-full mx-auto mb-3"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl text-white">
                      {(user.name || user.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <h2 className="text-lg font-semibold text-gray-900">{user.name || 'Not set'}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {user.plan === 'free' ? 'Free' : user.plan === 'pro' ? 'Pro' : 'Enterprise'}
                </span>
              </div>

              {/* Credits Balance */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 text-white text-center mb-6">
                <p className="text-sm opacity-90">Credits</p>
                <p className="text-3xl font-bold">{user.credits}</p>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => setActiveTab('posters')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'posters'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🎨 My Posters
                </button>
                <button
                  onClick={() => setActiveTab('credits')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'credits'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  💰 Credits History
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'subscription'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📦 Subscription
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ⚙️ Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Account Overview</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Total Posters</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_posters || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Credits Used</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_credits_used || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Available Credits</p>
                    <p className="text-3xl font-bold text-gray-900">{user.credits}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      href="/editor"
                      className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <span className="text-2xl mr-3">🎨</span>
                      <div>
                        <p className="font-semibold">Create New Poster</p>
                        <p className="text-sm opacity-90">Start designing your work</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => setActiveTab('subscription')}
                      className="flex items-center p-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <span className="text-2xl mr-3">📦</span>
                      <div>
                        <p className="font-semibold">Upgrade Subscription</p>
                        <p className="text-sm opacity-90">Get more credits and features</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'posters' && <PostersTab />}
            {activeTab === 'credits' && <CreditsTab />}
            {activeTab === 'subscription' && <SubscriptionTab user={user} />}
            {activeTab === 'settings' && <SettingsTab user={user} onUpdateUser={setUser} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Posters List Component ====================
function PostersTab() {
  const [posters, setPosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosters();
  }, []);

  const loadPosters = async () => {
    try {
      const token = getAccessToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/posters`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosters(data);
      }
    } catch (error) {
      console.error('Failed to load posters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (posterId: string) => {
    if (!confirm('Are you sure you want to delete this poster?')) return;
    
    try {
      const token = getAccessToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/posters/${posterId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPosters(posters.filter(p => p.id !== posterId));
        alert('Poster deleted');
      }
    } catch (error) {
      console.error('Failed to delete poster:', error);
      alert('Delete failed');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  if (posters.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Posters Yet</h3>
        <p className="text-gray-600 mb-6">Start creating your first poster!</p>
        <Link
          href="/editor"
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90"
        >
          Create Now
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🎨 My Posters</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posters.map(poster => (
          <div key={poster.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img src={poster.image_url} alt={poster.title || 'Poster'} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{poster.title || 'Untitled Poster'}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {new Date(poster.created_at).toLocaleDateString('zh-CN')}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(poster.image_url, '_blank')}
                  className="flex-1 px-3 py-2 bg-purple-100 text-purple-800 text-sm rounded hover:bg-purple-200"
                >
                  查看
                </button>
                <button
                  onClick={() => handleDelete(poster.id)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Credits History Component ====================
function CreditsTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const token = getAccessToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/transactions?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: '💳 Purchase',
      consumption: '💰 Consumption',
      bonus: '🎁 Bonus',
      refund: '↩️ Refund'
    };
    return labels[type] || type;
  };

  if (loading) return <div className="text-center py-12">加载中...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 Credits History</h2>
      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-600">No credit records</div>
      ) : (
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{getTypeLabel(tx.type)}</p>
                <p className="text-sm text-gray-600">{tx.description || '-'}</p>
                <p className="text-xs text-gray-500">
                  {new Date(tx.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
              <span className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== Subscription Management Component ====================
function SubscriptionTab({ user, onUpdateUser }: any) {
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'paypal' | null>(null);

  const handlePurchase = async (productId: string, productType: string) => {
    setLoading(true);
    try {
      const token = getAccessToken();
      
      // 1. 创建订单
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_type: productType,
          product_id: productId,
          payment_method: selectedPayment
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || '创建订单失败');
      }
      
      const order = await res.json();
      
      // 2. Redirect to PayPal
      if (selectedPayment === 'paypal') {
        if (order.paypal_order_id || order.alipay_url) {
          const paypalUrl = order.alipay_url || order.paypal_url;
          if (paypalUrl) {
            window.open(paypalUrl, '_blank');
            pollOrderStatus(order.order_no);
          } else {
            alert('PayPal order created. Please check your PayPal account.');
          }
        } else {
          alert('Failed to create PayPal order. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      alert(`Purchase failed: ${error.message}`);
    } finally {
      setLoading(false);
      setSelectedPayment(null);
    }
  };

  const pollOrderStatus = async (orderNo: string) => {
    const token = getAccessToken();
    const maxAttempts = 30; // 最多轮询 30 次（5 分钟）
    let attempts = 0;
    
    const poll = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/order/${orderNo}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const order = await res.json();
          if (order.status === 'paid') {
            alert('支付成功！Credits 已到账');
            onUpdateUser({ ...user, credits: user.credits + order.credits_amount, plan: 'pro' });
            return;
          } else if (order.status === 'failed') {
            alert('支付失败，请重试');
            return;
          }
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(poll, 10000); // 每 10 秒轮询一次
      }
    };
    
    poll();
  };



  const products = [
    {
      id: 'pro_monthly',
      name: 'Pro 月度',
      price: '$19',
      period: '/月',
      credits: 150,
      features: ['150 credits/month', 'HD resolution', 'No watermark', 'Batch processing'],
      popular: true
    },
    {
      id: 'pro_annual',
      name: 'Pro 年度',
      price: '$199',
      period: '/年',
      credits: 1800,
      features: ['150 credits/month', 'Save 15%', 'HD resolution', 'No watermark', 'Batch processing'],
      popular: false,
      savings: '省 15%'
    },
    {
      id: 'credits_100',
      name: '100 Credits',
      price: '$9.99',
      period: '',
      credits: 100,
      features: ['100 credits', '永久有效', '随时使用'],
      popular: false
    },
    {
      id: 'credits_500',
      name: '500 Credits',
      price: '$39.99',
      period: '',
      credits: 500,
      features: ['500 credits', '永久有效', '超值优惠'],
      popular: false,
      savings: '省 20%'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📦 Subscription & Credits</h2>
      
      {/* Current Plan */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg">
        <p className="text-sm opacity-90 mb-2">当前套餐</p>
        <p className="text-3xl font-bold mb-2">
          {user.plan === 'free' ? 'Free' : user.plan === 'pro' ? 'Pro' : 'Enterprise'}
        </p>
        <p className="text-sm opacity-90">可用 Credits: {user.credits}</p>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Method</h3>
        <div className="max-w-xs">
          <button
            onClick={() => setSelectedPayment('paypal')}
            className={`w-full p-4 border-2 rounded-lg flex items-center justify-center space-x-3 transition-all ${
              selectedPayment === 'paypal'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 4.47a.77.77 0 0 1 .76-.63h7.194c1.024 0 1.925.183 2.683.548.758.365 1.347.885 1.767 1.56.42.675.63 1.465.63 2.37 0 1.155-.315 2.175-.945 3.06-.63.885-1.5 1.575-2.61 2.07-1.11.495-2.385.743-3.825.743h-1.935a.641.641 0 0 0-.633.74l-.765 4.86a.641.641 0 0 1-.633.555z"/>
            </svg>
            <span className="font-semibold">PayPal</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">选择套餐</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map(product => (
          <div
            key={product.id}
            className={`border-2 rounded-lg p-6 transition-all ${
              product.popular
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {product.popular && (
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                热门
              </div>
            )}
            {product.savings && (
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                {product.savings}
              </div>
            )}
            
            <div className="mb-4">
              <h4 className="text-xl font-bold text-gray-900">{product.name}</h4>
              <div className="mt-2">
                <span className="text-3xl font-bold text-purple-600">{product.price}</span>
                <span className="text-gray-600">{product.period}</span>
              </div>
            </div>
            
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handlePurchase(product.id, product.id.includes('credits') ? 'credits' : 'subscription')}
              disabled={loading || !selectedPayment}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {!selectedPayment ? 'Select Payment Method' : loading ? 'Processing...' : `Buy - ${product.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Notice */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Click Buy to proceed with PayPal. You will be redirected to PayPal's secure payment page. Credits are added instantly after successful payment.
        </p>
      </div>
    </div>
  );
}

// ==================== Settings Component ====================
function SettingsTab({ user, onUpdateUser }: any) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });
      
      if (res.ok) {
        const data = await res.json();
        onUpdateUser(data);
        alert('Saved successfully');
      } else {
        alert('Save failed');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Account Settings</h2>
      
      <div className="space-y-6 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="输入昵称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="输入邮箱"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存修改'}
        </button>
      </div>
    </div>
  );
}
