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
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // 检查登录状态
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    
    // 加载用户数据
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = getAccessToken();
      const [userRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <Head>
        <title>个人中心 - AI Poster Studio</title>
      </Head>

      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/editor" className="text-2xl mr-4">🎨</Link>
              <h1 className="text-xl font-bold text-gray-900">AI Poster Studio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.name || user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                退出登录
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
                <h2 className="text-lg font-semibold text-gray-900">{user.name || '未设置昵称'}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {user.plan === 'free' ? '免费用户' : user.plan === 'pro' ? '专业版' : '企业版'}
                </span>
              </div>

              {/* 积分余额 */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 text-white text-center mb-6">
                <p className="text-sm opacity-90">当前积分</p>
                <p className="text-3xl font-bold">{user.credits}</p>
              </div>

              {/* 导航菜单 */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📊 概览
                </button>
                <button
                  onClick={() => setActiveTab('posters')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'posters'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🎨 我的海报
                </button>
                <button
                  onClick={() => setActiveTab('credits')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'credits'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  💰 积分明细
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'subscription'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📦 订阅管理
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ⚙️ 设置
                </button>
              </nav>
            </div>
          </div>

          {/* 右侧内容区 */}
          <div className="md:col-span-3">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 账户概览</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">海报总数</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_posters || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">积分消耗</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_credits_used || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">当前积分</p>
                    <p className="text-3xl font-bold text-gray-900">{user.credits}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      href="/editor"
                      className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <span className="text-2xl mr-3">🎨</span>
                      <div>
                        <p className="font-semibold">创作新海报</p>
                        <p className="text-sm opacity-90">开始设计你的作品</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => setActiveTab('subscription')}
                      className="flex items-center p-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <span className="text-2xl mr-3">📦</span>
                      <div>
                        <p className="font-semibold">升级订阅</p>
                        <p className="text-sm opacity-90">获取更多积分和功能</p>
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

// ==================== 海报列表组件 ====================
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
    if (!confirm('确定要删除这张海报吗？')) return;
    
    try {
      const token = getAccessToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/posters/${posterId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPosters(posters.filter(p => p.id !== posterId));
        alert('海报已删除');
      }
    } catch (error) {
      console.error('Failed to delete poster:', error);
      alert('删除失败');
    }
  };

  if (loading) return <div className="text-center py-12">加载中...</div>;

  if (posters.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有海报</h3>
        <p className="text-gray-600 mb-6">开始创作你的第一张海报吧！</p>
        <Link
          href="/editor"
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90"
        >
          立即创作
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🎨 我的海报</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posters.map(poster => (
          <div key={poster.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img src={poster.image_url} alt={poster.title || 'Poster'} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{poster.title || '未命名海报'}</h3>
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

// ==================== 积分明细组件 ====================
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
      purchase: '💳 购买',
      consumption: '💰 消费',
      bonus: '🎁 赠送',
      refund: '↩️ 退款'
    };
    return labels[type] || type;
  };

  if (loading) return <div className="text-center py-12">加载中...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 积分明细</h2>
      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-600">暂无积分记录</div>
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

// ==================== 订阅管理组件 ====================
function SubscriptionTab({ user, onUpdateUser }: any) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planType: string) => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/subscription/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_type: planType,
          payment_method: 'stripe'
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`订阅升级成功！赠送${data.bonus_credits}积分`);
        onUpdateUser({ ...user, plan: planType, credits: user.credits + data.bonus_credits });
      } else {
        alert('升级失败，请稍后重试');
      }
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      alert('升级失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📦 订阅管理</h2>
      
      {/* 当前计划 */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg">
        <p className="text-sm opacity-90 mb-2">当前计划</p>
        <p className="text-3xl font-bold mb-2">
          {user.plan === 'free' ? '免费用户' : user.plan === 'pro' ? '专业版' : '企业版'}
        </p>
        <p className="text-sm opacity-90">当前积分：{user.credits}</p>
      </div>

      {/* 升级选项 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">升级计划</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 专业版 */}
        <div className="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-500 transition-colors">
          <div className="mb-4">
            <h4 className="text-xl font-bold text-gray-900">专业版</h4>
            <p className="text-3xl font-bold text-purple-600 mt-2">¥99<span className="text-sm text-gray-600">/月</span></p>
          </div>
          <ul className="space-y-2 mb-6 text-sm text-gray-600">
            <li>✅ 500 积分/月</li>
            <li>✅ 高清导出</li>
            <li>✅ 优先支持</li>
            <li>✅ 无水印</li>
          </ul>
          <button
            onClick={() => handleUpgrade('pro')}
            disabled={loading || user.plan === 'pro'}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {user.plan === 'pro' ? '当前计划' : loading ? '处理中...' : '升级专业版'}
          </button>
        </div>

        {/* 企业版 */}
        <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
          <div className="mb-4">
            <h4 className="text-xl font-bold text-gray-900">企业版</h4>
            <p className="text-3xl font-bold text-blue-600 mt-2">¥299<span className="text-sm text-gray-600">/月</span></p>
          </div>
          <ul className="space-y-2 mb-6 text-sm text-gray-600">
            <li>✅ 2000 积分/月</li>
            <li>✅ 4K 超清导出</li>
            <li>✅ 专属客服</li>
            <li>✅ API 访问</li>
            <li>✅ 团队协作</li>
          </ul>
          <button
            onClick={() => handleUpgrade('enterprise')}
            disabled={loading || user.plan === 'enterprise'}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {user.plan === 'enterprise' ? '当前计划' : loading ? '处理中...' : '升级企业版'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 设置组件 ====================
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
        alert('保存成功');
      } else {
        alert('保存失败');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ 账号设置</h2>
      
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
