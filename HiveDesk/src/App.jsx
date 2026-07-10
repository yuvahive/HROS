import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ConfigProvider, useConfig } from './config/ConfigContext';
import { RBACProvider, useRBAC } from './auth/RBAC';
import { NotificationProvider } from './auth/Notifications';
import { RefreshProvider, useRefreshTrigger } from './auth/RefreshContext';
import { bustCache } from './services/HiveDeskStorage';
import ErrorBoundary from './components/shared/ErrorBoundary';
import LoginScreen from './auth/LoginScreen';
import Layout from './components/layout/Layout';
import WarRoomDashboard from './components/dashboard/WarRoomDashboard';
import QuestionBank from './components/questions/QuestionBank';
import QuestionPipeline from './components/dashboard/QuestionPipeline';
import SprintBoard from './components/sprints/SprintBoard';
import SprintTimeline from './components/sprints/SprintTimeline';
import SprintBurndown from './components/sprints/SprintBurndown';
import SprintRetrospective from './components/sprints/SprintRetrospective';
import ReviewQueue from './components/reviews/ReviewQueue';
import ReviewHistory from './components/reviews/ReviewHistory';
import TeamRoster from './components/team/TeamRoster';
import IndividualDashboard from './components/team/IndividualDashboard';
import BuddyPairView from './components/team/BuddyPairView';
import BuddyPairForm from './components/team/BuddyPairForm';
import MemberForm from './components/team/MemberForm';
import WorkLogList from './components/team/WorkLogList';
import WorkloadView from './components/team/WorkloadView';
import CheckInForm from './components/team/CheckInForm';
import UserManagement from './components/team/UserManagement';
import TeamAnalytics from './components/analytics/TeamAnalytics';
import MyQueue from './components/queue/MyQueue';
import SettingsPanel from './components/settings/SettingsPanel';
import AuditLogViewer from './components/settings/AuditLogViewer';
import KudosBoard from './components/team/KudosBoard';
import WeeklyWrapped from './components/team/WeeklyWrapped';
import StreaksBadges from './components/team/StreaksBadges';
import QuestionBounties from './components/team/QuestionBounties';
import SkillTracker from './components/team/SkillTracker';
import AsyncStandup from './components/team/AsyncStandup';
import GoalSetting from './components/team/GoalSetting';
import MoodTrends from './components/team/MoodTrends';
import SchemaEditor from './components/admin/SchemaEditor';
import ImportBridge from './components/imports/ImportBridge';
import MissionTree from './components/missions/MissionTree';
import CuratorProfile from './components/profile/CuratorProfile';
import Leaderboard from './components/leaderboard/Leaderboard';
import StreakTracker from './components/streak/StreakTracker';
import TeamActivityFeed from './components/feed/TeamActivityFeed';
import AdminDashboard from './components/admin/AdminDashboard';
import OnboardingPrompt from './components/shared/OnboardingPrompt';

function MainApp() {
  const { currentUser, loading: authLoading } = useAuth();
  const { config, refresh: refreshConfig } = useConfig();
  const { role } = useRBAC();
  const triggerRefresh = useRefreshTrigger();
  const [page, setPage] = useState('dashboard');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddPair, setShowAddPair] = useState(false);
  const [editingPair, setEditingPair] = useState(null);
  const [showCheckIn, setShowCheckIn] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const interval = Number(config.dashboard_refresh_interval_seconds) || 0;
    if (interval <= 0) return;
    const timer = setInterval(() => {
      triggerRefresh();
      refreshConfig();
    }, interval * 1000);
    return () => clearInterval(timer);
  }, [currentUser, config.dashboard_refresh_interval_seconds, triggerRefresh]);

  const handleRefresh = useCallback(() => {
    bustCache();
    triggerRefresh();
    refreshConfig();
  }, [triggerRefresh, refreshConfig]);

  if (authLoading) return (
    <div className="min-h-screen bg-hd-bg flex flex-col items-center justify-center gap-6 animate-in fade-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-xl animate-pulse"></div>
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 animate-in zoom-in">
          <svg viewBox="0 0 32 32" fill="none" className="w-9 h-9">
            <path d="M10 22V14l6-4 6 4v8l-6-3-6 3z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <circle cx="16" cy="15" r="2" fill="white"/>
          </svg>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 animate-in slide-up" style={{ animationDelay: '100ms' }}>
        <h1 className="text-lg font-bold text-gradient">HiveDesk</h1>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-xs text-hd-muted mt-1">Setting up your workspace</p>
      </div>
    </div>
  );
  if (!currentUser) return <LoginScreen />;

  const renderPage = () => {
    if (page === 'team' && selectedMember) {
      return <IndividualDashboard member={selectedMember} onBack={() => setSelectedMember(null)} />;
    }
    switch (page) {
      case 'dashboard': return <WarRoomDashboard onNavigate={setPage} />;
      case 'questions': return <QuestionBank />;
      case 'pipeline': return <QuestionPipeline />;
      case 'sprints': return <div className="space-y-6"><SprintBoard /><SprintBurndown /><SprintTimeline /></div>;
      case 'reviews': return <div className="space-y-6"><ReviewQueue /><ReviewHistory /></div>;
      case 'team': return <div className="space-y-6">
        <TeamRoster onSelectMember={setSelectedMember} onAddMember={() => setShowAddMember(true)} />
        <BuddyPairView onEdit={(p) => { setEditingPair(p); setShowAddPair(true); }} onAdd={() => { setEditingPair(null); setShowAddPair(true); }} />
      </div>;
      case 'workload': return <WorkloadView />;
      case 'analytics': return <TeamAnalytics />;
      case 'worklogs': return <WorkLogList />;
      case 'queue': return <MyQueue />;
      case 'bounties': return <QuestionBounties />;
      case 'standup': return <AsyncStandup />;
      case 'skills': return <SkillTracker />;
      case 'kudos': return <KudosBoard />;
      case 'goals': return <GoalSetting />;
      case 'achievements': return <StreaksBadges />;
      case 'wrapped': return <WeeklyWrapped />;
      case 'moods': return <MoodTrends />;
      case 'checkins': return <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-hd-text">Weekly Check-In</h2>
          <button onClick={() => setShowCheckIn(true)} className="accent-gradient text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity">
            New Check-In
          </button>
        </div>
        {showCheckIn && <CheckInForm onClose={() => setShowCheckIn(false)} onSaved={handleRefresh} />}
      </div>;
      case 'retro': return <SprintRetrospective />;
      case 'users': return <UserManagement />;
      case 'import': return <ImportBridge onClose={() => setPage('questions')} onSaved={handleRefresh} />;
      case 'audit': return <AuditLogViewer />;
      case 'settings': return <SettingsPanel />;
      case 'schema': return <SchemaEditor />;
      case 'missions': return <MissionTree />;
      case 'profile': return <CuratorProfile />;
      case 'leaderboard': return <Leaderboard />;
      case 'streak': return <StreakTracker />;
      case 'activity': return <TeamActivityFeed />;
      case 'admin': return <AdminDashboard />;
      default: return <WarRoomDashboard onNavigate={setPage} />;
    }
  };

  const pageTitles = {
    dashboard: { title: 'War Room', subtitle: `${role?.charAt(0).toUpperCase() + role?.slice(1)} Dashboard` },
    questions: { title: 'Question Bank', subtitle: 'Create, review, and publish coding questions' },
    pipeline: { title: 'Question Pipeline', subtitle: 'Visual kanban board for question workflow' },
    sprints: { title: 'Sprint Board', subtitle: 'Plan sprints, track progress, and burndown' },
    reviews: { title: 'Review System', subtitle: 'Peer review queue and quality scoring' },
    team: { title: 'Team Management', subtitle: 'Roster, workload, and buddy pairs' },
    workload: { title: 'Workload View', subtitle: 'Team capacity and allocation overview' },
    analytics: { title: 'Team Analytics', subtitle: 'Performance metrics, leaderboards, and trends' },
    worklogs: { title: 'Work Logs', subtitle: 'Track time and productivity' },
    queue: { title: 'My Queue', subtitle: 'Your assigned questions and tasks' },
    bounties: { title: 'Question Bounties', subtitle: 'High-value questions with bonus points' },
    standup: { title: 'Async Standup', subtitle: 'Daily team updates and blockers' },
    skills: { title: 'Skill Tracker', subtitle: 'Track and grow team skills' },
    kudos: { title: 'Kudos Board', subtitle: 'Appreciate your teammates' },
    goals: { title: 'Goals & OKRs', subtitle: 'Weekly goal setting and tracking' },
    achievements: { title: 'Achievements', subtitle: 'Streaks, badges, and milestones' },
    wrapped: { title: 'Weekly Wrapped', subtitle: 'Your week in review' },
    moods: { title: 'Mood Trends', subtitle: 'Team wellness and sentiment over time' },
    checkins: { title: 'Weekly Check-In', subtitle: 'Share updates and blockers' },
    retro: { title: 'Sprint Retrospective', subtitle: 'Analyze completed sprints' },
    users: { title: 'User Management', subtitle: 'Manage team members and roles' },
    import: { title: 'Batch Import', subtitle: 'Import questions from CSV' },
    audit: { title: 'Audit Log', subtitle: 'System activity history' },
    settings: { title: 'System Settings', subtitle: 'Configure targets, weights, and permissions' },
    schema: { title: 'Question Schema', subtitle: 'Define structure for uploaded questions' },
    missions: { title: 'Mission Tree', subtitle: 'Visual curriculum progress' },
    profile: { title: 'Your Profile', subtitle: 'Stats, level, and impact' },
    leaderboard: { title: 'Leaderboard', subtitle: 'Quality-ranked team performance' },
    streak: { title: 'Streak Tracker', subtitle: 'Contribution streaks' },
    activity: { title: 'Team Activity', subtitle: 'Real-time activity feed' },
    admin: { title: 'Admin Dashboard', subtitle: 'Full system visibility' },
  };

  const current = pageTitles[page] || pageTitles.dashboard;

  return (
    <Layout title={current.title} subtitle={current.subtitle} onRefresh={handleRefresh} activePage={page} onNavigate={setPage}>
      {renderPage()}
      <OnboardingPrompt />
      {showAddMember && <MemberForm onClose={() => setShowAddMember(false)} onSaved={handleRefresh} />}
      {showAddPair && <BuddyPairForm pair={editingPair} onClose={() => { setShowAddPair(false); setEditingPair(null); }} onSaved={handleRefresh} />}
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ConfigProvider>
          <RBACProvider>
            <NotificationProvider>
              <RefreshProvider>
                <MainApp />
              </RefreshProvider>
            </NotificationProvider>
          </RBACProvider>
        </ConfigProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

