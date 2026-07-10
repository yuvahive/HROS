import { useState, useEffect } from 'react';
import { Trophy, Flame, Star, TrendingUp } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('quality');

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, questionsData] = await Promise.all([
        HiveDeskStorage.getAll('HiveDeskUsers'),
        HiveDeskStorage.getAll('HiveDeskQuestions'),
      ]);
      setUsers(usersData.filter(u => u.isActive === 'true' || u.isActive === true));
      setQuestions(questionsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUserStats = (userId) => {
    const userQs = questions.filter(q => q.creatorId === userId);
    const approved = userQs.filter(q => q.status === 'published' || q.status === 'approved');
    const reviewed = questions.filter(q => q.reviewerId === userId);
    const scores = userQs.filter(q => q.qualityScore && Number(q.qualityScore) > 0);
    const avgQuality = scores.length > 0
      ? scores.reduce((sum, q) => sum + Number(q.qualityScore), 0) / scores.length
      : 0;
    return {
      written: userQs.length,
      approved: approved.length,
      reviewed: reviewed.length,
      avgQuality: Math.round(avgQuality * 10) / 10,
      approvalRate: userQs.length > 0 ? Math.round((approved.length / userQs.length) * 100) : 0,
    };
  };

  const ranked = users.map(u => ({
    ...u,
    stats: getUserStats(u.id),
  })).filter(u => u.stats.written > 0 || u.stats.reviewed > 0);

  if (sortBy === 'quality') ranked.sort((a, b) => b.stats.avgQuality - a.stats.avgQuality);
  else if (sortBy === 'written') ranked.sort((a, b) => b.stats.written - a.stats.written);
  else if (sortBy === 'approved') ranked.sort((a, b) => b.stats.approved - a.stats.approved);
  else if (sortBy === 'reviews') ranked.sort((a, b) => b.stats.reviewed - a.stats.reviewed);

  const medals = ['🥇', '🥈', '🥉'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-gray-100 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-sm text-gray-500 mt-1">Quality-ranked team performance</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-1">
          {[
            { key: 'quality', label: 'Quality', icon: Star },
            { key: 'written', label: 'Written', icon: TrendingUp },
            { key: 'approved', label: 'Approved', icon: Trophy },
            { key: 'reviews', label: 'Reviews', icon: Flame },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                sortBy === s.key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Curator</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Written</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Approved</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Quality</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Approval %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ranked.map((user, i) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="text-lg">{medals[i] || `#${i + 1}`}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                      {user.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
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
                <td className="px-4 py-3 text-right text-sm text-gray-700">{user.stats.written}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">{user.stats.approved}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-semibold ${
                    user.stats.avgQuality >= 4.5 ? 'text-green-600' :
                    user.stats.avgQuality >= 4.0 ? 'text-blue-600' :
                    user.stats.avgQuality >= 3.5 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {user.stats.avgQuality > 0 ? user.stats.avgQuality.toFixed(1) : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">{user.stats.approvalRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ranked.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No data yet. Start writing questions to appear on the leaderboard.</p>
        </div>
      )}
    </div>
  );
}
