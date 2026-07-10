import { useState, useEffect } from 'react';
import { Shield, Users, FileCode2, Activity, Settings, UserCheck, UserX } from 'lucide-react';
import { useRBAC } from '../../auth/RBAC';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';

export default function AdminDashboard() {
  const { isAdmin } = useRBAC();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    users: [], questions: [], reviews: [], logs: [], schema: []
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [users, questions, reviews, logs, schema] = await Promise.all([
        HiveDeskStorage.getAll('HiveDeskUsers'),
        HiveDeskStorage.getAll('HiveDeskQuestions'),
        HiveDeskStorage.getAll('HiveDeskReviews'),
        HiveDeskStorage.getAll('HiveDeskLogs'),
        HiveDeskStorage.getAll('HiveDeskSchema'),
      ]);
      setData({ users, questions, reviews, logs, schema });
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeUsers = data.users.filter(u => u.isActive === 'true' || u.isActive === true);
  const totalPublished = data.questions.filter(q => q.status === 'published').length;
  const totalInReview = data.questions.filter(q => q.status === 'in-review').length;
  const totalDraft = data.questions.filter(q => q.status === 'draft' || !q.status).length;
  const pendingReviews = data.reviews.filter(r => r.status === 'pending').length;

  const recentLogs = [...data.logs]
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
    .slice(0, 20);

  const roleBreakdown = {
    admin: data.users.filter(u => u.role === 'admin').length,
    lead: data.users.filter(u => u.role === 'lead').length,
    senior: data.users.filter(u => u.role === 'senior').length,
    curator: data.users.filter(u => u.role === 'curator').length,
    newcomer: data.users.filter(u => u.role === 'newcomer').length,
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-gray-600">Admin access required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Full system visibility and management</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <Users className="w-6 h-6 text-indigo-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{activeUsers.length}</p>
          <p className="text-xs text-gray-500">Active Users</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <FileCode2 className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{data.questions.length}</p>
          <p className="text-xs text-gray-500">Total Questions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <Activity className="w-6 h-6 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalPublished}</p>
          <p className="text-xs text-gray-500">Published</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <Settings className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{data.schema.length}</p>
          <p className="text-xs text-gray-500">Schema Fields</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {['overview', 'users', 'activity', 'schema'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Role Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(roleBreakdown).map(([role, count]) => (
                <div key={role} className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    role === 'lead' ? 'bg-blue-100 text-blue-700' :
                    role === 'senior' ? 'bg-green-100 text-green-700' :
                    role === 'curator' ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {role}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 rounded-full h-2"
                      style={{ width: `${activeUsers.length > 0 ? (count / activeUsers.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Question Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Published</span>
                <span className="text-sm font-semibold text-green-600">{totalPublished}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Review</span>
                <span className="text-sm font-semibold text-yellow-600">{totalInReview}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Draft</span>
                <span className="text-sm font-semibold text-gray-600">{totalDraft}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Reviews</span>
                <span className="text-sm font-semibold text-orange-600">{pendingReviews}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Domain</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                        {user.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'lead' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'senior' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.domain || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {user.isActive === 'true' || user.isActive === true ? (
                      <UserCheck className="w-4 h-4 text-green-500 inline" />
                    ) : (
                      <UserX className="w-4 h-4 text-red-500 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {recentLogs.map((log, i) => (
              <div key={log.id || i} className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-50">
                <Activity className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{log.userName || 'System'}</span>{' '}
                    {log.action} on {log.resource}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Field</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Required</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Constraints</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.schema.map(field => (
                <tr key={field.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 font-mono">{field.field}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {field.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      field.required ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {field.required ? 'Required' : 'Optional'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{field.constraints || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{field.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
