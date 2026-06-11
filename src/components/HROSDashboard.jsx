import React, { useState, useEffect, useCallback } from 'react'
import { Users, Briefcase, CheckSquare, LogOut, GitBranch, Zap, Heart, Settings, AlertTriangle, Code, BarChart3, Shield, Award, Home, User, Globe, Activity, Sparkles, Menu, X, Sun, Moon, Bell, Search, Command, Clock, Eye, ArrowLeftRight, Upload } from 'lucide-react'
import MyDashboard from './MyDashboard'
import OrgChart from './OrgChart'
import TeamSyncBoard from './TeamSyncBoard'
import EmployeeSelfService from './EmployeeSelfService'
import WellnessBoard from './WellnessBoard'
import HiringPipelineBoard from './HiringPipelineBoard'
import DailyWorkBoard from './DailyWorkBoard'
import TeamPulseBoard from './TeamPulseBoard'
import OneOnOneBoard from './OneOnOneBoard'
import OnboardingBoard from './OnboardingBoard'
import InternshipBoard from './InternshipBoard'
import ExitsBoard from './ExitsBoard'
import ProjectHealthBoard from './ProjectHealthBoard'
import ActionItemsBoard from './ActionItemsBoard'
import ReportsBoard from './ReportsBoard'
import SlackCommandConsole from './SlackCommandConsole'
import MetricsDashboard from './MetricsDashboard'
import AdminSettings from './AdminSettings'
import AdminLogViewer from './AdminLogViewer'
import TeamArena from './TeamArena'
import WorkUploadsBoard from './WorkUploadsBoard'
import LoggingService from '../services/LoggingService'
import ErrorBoundary from './ErrorBoundary'
import NotificationPanel from './NotificationPanel'
import GlobalSearch from './GlobalSearch'
import CommandPalette from './CommandPalette'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../context/AuthContext'

export default function HROSDashboard({ currentUser, logout, onBackToCalendar, isDark, onToggleDarkMode }) {
  const [activeBoard, setActiveBoard] = useState('my-dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showViewAs, setShowViewAs] = useState(false)
  const { viewingAs, setViewingAs, stopImpersonation, hasPermission } = useAuth()

  const effectiveRole = (viewingAs && currentUser?.role === 'admin') ? viewingAs : currentUser?.role

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K = Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      // Cmd/Ctrl + / = Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      // Escape closes panels
      if (e.key === 'Escape') {
        setShowSearch(false)
        setShowCommandPalette(false)
        setShowNotifications(false)
      }
      // Number keys 1-9 for quick board switch (no modifier)
      if (!e.metaKey && !e.ctrlKey && !e.altKey && e.target.tagName === 'BODY') {
        const num = parseInt(e.key)
        if (num >= 1 && num <= 9) {
          const visible = boards.filter(b => b.allowedRoles.includes(effectiveRole))
          if (visible[num - 1]) setActiveBoard(visible[num - 1].id)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentUser, effectiveRole])

  useEffect(() => {
    LoggingService.log(currentUser, 'VIEW', 'BOARD', `Opened HR Board: ${activeBoard}`);
    setSidebarOpen(false) // Close sidebar on board change (mobile)
  }, [activeBoard, currentUser]);

  const boards = [
    // MY SPACE
    { id: 'my-dashboard', name: 'My Dashboard', description: 'Your personal workspace', icon: Home, component: MyDashboard, category: 'My Space', allowedRoles: ['admin', 'HR', 'TeamLead', 'employee', 'intern'] },
    { id: 'my-profile', name: 'My Profile', description: 'Manage your profile & preferences', icon: User, component: EmployeeSelfService, category: 'My Space', allowedRoles: ['admin', 'HR', 'TeamLead', 'employee', 'intern'] },
    { id: 'org-chart', name: 'Organization', description: 'Team structure & who does what', icon: Globe, component: OrgChart, category: 'My Space', allowedRoles: ['admin', 'HR', 'TeamLead', 'employee', 'intern'] },
    { id: 'work-uploads', name: 'Work Uploads', description: 'Upload & review work deliverables', icon: Upload, component: WorkUploadsBoard, category: 'My Space', allowedRoles: ['admin', 'HR', 'TeamLead', 'employee', 'intern'] },
    // TEAM
    { id: 'team-sync', name: 'Team Sync', description: 'Real-time what everyone is working on', icon: Activity, component: TeamSyncBoard, category: 'Team', allowedRoles: ['admin', 'HR', 'TeamLead', 'employee', 'intern'] },
    { id: 'daily-work', name: 'Team Work', description: 'What the team is working on today', icon: CheckSquare, component: DailyWorkBoard, category: 'Team', allowedRoles: ['admin', 'HR', 'TeamLead', 'employee', 'intern'] },
    { id: 'one-on-ones', name: '1:1 Meetings', description: 'Schedule and track conversations', icon: Heart, component: OneOnOneBoard, category: 'Team', allowedRoles: ['admin', 'HR', 'TeamLead', 'employee', 'intern'] },
    { id: 'project-health', name: 'Projects', description: 'Project status and blockers', icon: GitBranch, component: ProjectHealthBoard, category: 'Team', allowedRoles: ['admin', 'HR', 'TeamLead', 'employee'] },
    { id: 'action-items', name: 'Action Items', description: 'Decisions and action tracking', icon: Zap, component: ActionItemsBoard, category: 'Team', allowedRoles: ['admin', 'HR', 'TeamLead', 'employee'] },
    // HR OPERATIONS
    { id: 'hiring', name: 'Hiring Pipeline', description: 'Track candidates from application to hire', icon: Users, component: HiringPipelineBoard, category: 'HR Operations', allowedRoles: ['admin', 'HR', 'TeamLead'] },
    { id: 'onboarding', name: 'Onboarding', description: 'Track new hire 30-day progress', icon: Zap, component: OnboardingBoard, category: 'HR Operations', allowedRoles: ['admin', 'HR', 'TeamLead'] },
    { id: 'internships', name: 'Internships', description: 'Internship onboarding & evaluation', icon: Award, component: InternshipBoard, category: 'HR Operations', allowedRoles: ['admin', 'HR', 'TeamLead'] },
    { id: 'performance', name: 'Team Pulse', description: 'Team health & sentiment tracking', icon: Heart, component: TeamPulseBoard, category: 'HR Operations', allowedRoles: ['admin', 'HR', 'TeamLead'] },
    { id: 'exits', name: 'Exits & Alumni', description: 'Departures and alumni network', icon: LogOut, component: ExitsBoard, category: 'HR Operations', allowedRoles: ['admin', 'HR', 'TeamLead'] },
    // TEAMS
    { id: 'teams', name: 'Teams', description: 'Manage teams, members & assignments', icon: Users, component: TeamArena, category: 'Teams', allowedRoles: ['admin', 'HR', 'TeamLead', 'employee', 'intern'] },
    // WELLBEING
    { id: 'wellness', name: 'Team Wellness', description: "Support your team's wellbeing", icon: Sparkles, component: WellnessBoard, category: 'Wellbeing', allowedRoles: ['admin', 'HR', 'TeamLead', 'employee'] },
    // INSIGHTS
    { id: 'metrics', name: 'Metrics', description: 'KPIs and analytics', icon: BarChart3, component: MetricsDashboard, category: 'Insights', allowedRoles: ['admin', 'HR', 'TeamLead', 'employee'] },
    { id: 'reports', name: 'Reports', description: 'Company-wide analytics', icon: BarChart3, component: ReportsBoard, category: 'Insights', allowedRoles: ['admin', 'HR', 'TeamLead'] },
    // ADMIN
    { id: 'commands', name: 'Commands', description: 'System command interface', icon: Code, component: SlackCommandConsole, category: 'Admin', allowedRoles: ['admin'] },
    { id: 'logs', name: 'System Logs', description: 'Audit logs & activity', icon: Shield, component: AdminLogViewer, category: 'Admin', allowedRoles: ['admin'] },
    { id: 'settings', name: 'Admin Settings', description: 'User management & config', icon: Settings, component: AdminSettings, category: 'Admin', allowedRoles: ['admin'] },
  ]

  const categories = [...new Set(boards.map(b => b.category))]
  const activeBoardConfig = boards.find((b) => b.id === activeBoard)
  const BoardComponent = activeBoardConfig?.component

  const visibleCategories = categories.filter(cat =>
    boards.some(b => b.category === cat && b.allowedRoles.includes(effectiveRole))
  )

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Top Navigation */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 dark:from-gray-800 dark:to-gray-900 text-white px-4 sm:px-6 py-3 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between gap-4 max-w-[1920px] mx-auto w-full">
          {/* Left: Mobile Menu + User Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {currentUser && (
              <div className="text-left">
                <p className="font-bold text-sm truncate max-w-[200px]">
                  {currentUser.name}
                  {viewingAs && (
                    <span className="ml-2 text-[10px] bg-yellow-400/20 text-yellow-200 px-1.5 py-0.5 rounded font-normal">
                      Viewing as {viewingAs}
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-blue-200 capitalize opacity-80">{currentUser.role}</p>
              </div>
            )}
            {currentUser?.role === 'admin' && (
              <div className="relative">
                <button
                  onClick={() => setShowViewAs(!showViewAs)}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg transition-colors text-[11px]"
                  title="View boards as another role"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View As</span>
                </button>
                {showViewAs && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 w-48">
                    {viewingAs && (
                      <button
                        onClick={() => { stopImpersonation(); setShowViewAs(false) }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" /> Back to Admin
                      </button>
                    )}
                    {['admin', 'HR', 'TeamLead', 'employee', 'intern'].map(role => (
                      <button
                        key={role}
                        onClick={() => { setViewingAs(role === 'admin' ? null : role); setShowViewAs(false) }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                          (role === 'admin' && !viewingAs) || viewingAs === role ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current opacity-50"></span>
                        {role === 'HR' ? 'HR' : role === 'TeamLead' ? 'Team Lead' : role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center: Logo */}
          <div className="flex items-center justify-center gap-3 px-4">
            <div className="bg-white/10 p-1.5 rounded-xl backdrop-blur-sm border border-white/10 flex-shrink-0">
              <img src="/HROS/logo.png" alt="YUVAHIVE" className="h-8 w-8 object-contain" />
            </div>
            <div className="text-center hidden sm:block">
              <p className="font-black text-xl tracking-tighter leading-none italic">YUVAHIVE</p>
              <p className="text-[9px] text-blue-100 font-medium tracking-[0.2em] uppercase mt-0.5 opacity-70">HR Management</p>
            </div>
          </div>

          {/* Right: Search + Notifications + Dark Mode + Back + Logout */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors text-xs"
              title="Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline text-[10px] bg-white/20 px-1 rounded">⌘K</kbd>
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCommandPalette(true)}
              className="hidden sm:flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Commands (Ctrl+/)"
            >
              <Command className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleDarkMode}
              className="flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onBackToCalendar}
              className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl transition-all duration-300 font-semibold text-sm border border-white/10"
              title="Back to Calendar"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-300 hidden sm:inline">←</span>
              <span className="hidden sm:inline">Calendar</span>
            </button>
            {logout && (
              <button
                onClick={logout}
                className="flex items-center justify-center w-9 h-9 bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition-all duration-300 border border-white/10"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex-shrink-0 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-3 pt-4 lg:pt-3">
            {visibleCategories.map((category) => {
              const categoryBoards = boards.filter(
                (b) => b.category === category && b.allowedRoles.includes(effectiveRole)
              )

              const isAdminCategory = category === 'Admin'
              const isMySpace = category === 'My Space'
              const isWellbeing = category === 'Wellbeing'

              return (
                <div key={category} className="mb-4">
                  <h2 className={`text-[10px] font-bold uppercase tracking-wider mb-2 px-2 ${
                    isAdminCategory ? 'text-red-500 dark:text-red-400' :
                    isMySpace ? 'text-blue-600 dark:text-blue-400' :
                    isWellbeing ? 'text-green-600 dark:text-green-400' :
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {category}
                  </h2>
                  <div className="space-y-0.5">
                    {categoryBoards.map((board) => {
                      const Icon = board.icon
                      return (
                        <button
                          key={board.id}
                          onClick={() => setActiveBoard(board.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2.5 text-sm ${
                            activeBoard === board.id
                              ? isMySpace
                                ? 'bg-blue-600 text-white shadow-md'
                                : isAdminCategory
                                  ? 'bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-300 font-semibold border border-red-200 dark:border-red-800'
                                  : isWellbeing
                                    ? 'bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-300 font-semibold border border-green-200 dark:border-green-800'
                                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 font-semibold'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${
                            activeBoard === board.id && isMySpace ? 'text-white' : ''
                          }`} />
                          <span className="flex-1 truncate">{board.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
          {BoardComponent ? (
            <ErrorBoundary boardName={activeBoardConfig?.name} key={activeBoard}>
              <ProtectedRoute resource={activeBoard} action="read">
                <BoardComponent />
              </ProtectedRoute>
            </ErrorBoundary>
          ) : (
            <div className="flex-1 flex items-center justify-center dark:bg-gray-900">
              <div className="text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {activeBoardConfig?.name} Coming Soon
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{activeBoardConfig?.description}</p>
                <button
                  onClick={() => setActiveBoard('my-dashboard')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to My Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlays */}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} currentUser={currentUser} />
      )}
      {showSearch && (
        <GlobalSearch onClose={() => setShowSearch(false)} onNavigate={(boardId) => { setActiveBoard(boardId); setShowSearch(false) }} currentUser={currentUser} />
      )}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} onNavigate={(boardId) => { setActiveBoard(boardId); setShowCommandPalette(false) }} currentUser={currentUser} isDark={isDark} onToggleDarkMode={onToggleDarkMode} />
      )}
    </div>
  )
}
