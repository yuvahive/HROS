import React, { useState, useEffect } from 'react'
import { Users, Briefcase, CheckSquare, LogOut, GitBranch, Zap, Heart, Settings, AlertTriangle, Code, BarChart3, Shield } from 'lucide-react'
import HiringPipelineBoard from './HiringPipelineBoard'
import DailyWorkBoard from './DailyWorkBoard'
import TeamPulseBoard from './TeamPulseBoard'
import OneOnOneBoard from './OneOnOneBoard'
import OnboardingBoard from './OnboardingBoard'
import ExitsBoard from './ExitsBoard'
import ProjectHealthBoard from './ProjectHealthBoard'
import ActionItemsBoard from './ActionItemsBoard'
import ReportsBoard from './ReportsBoard'
import RedFlagAlert from './RedFlagAlert'
import SlackCommandConsole from './SlackCommandConsole'
import MetricsDashboard from './MetricsDashboard'
import AdminSettings from './AdminSettings'
import AdminLogViewer from './AdminLogViewer'
import LoggingService from '../services/LoggingService'

// HROS Dashboard - Main hub for all HR boards
export default function HROSDashboard({ currentUser, logout, onBackToCalendar }) {
  // Find first allowed board to set as default
  const getInitialBoard = () => {
    if (currentUser?.role === 'admin') return 'hiring';
    if (currentUser?.role === 'manager') return 'hiring';
    return 'daily-work'; // Default for employees/interns
  };

  const [activeBoard, setActiveBoard] = useState(getInitialBoard())

  useEffect(() => {
    LoggingService.log(currentUser, 'VIEW', 'BOARD', `Opened HR Board: ${activeBoard}`);
  }, [activeBoard, currentUser]);

  // All available boards with metadata
  const boards = [
    {
      id: 'hiring',
      name: 'Hiring Pipeline',
      description: 'Track candidates from application to hire',
      icon: Users,
      component: HiringPipelineBoard,
      category: 'HR',
      allowedRoles: ['admin', 'manager']
    },
    {
      id: 'daily-work',
      name: 'Daily Work',
      description: 'Real-time shipping tracker for today',
      icon: CheckSquare,
      component: DailyWorkBoard,
      category: 'Execution',
      allowedRoles: ['admin', 'manager', 'employee', 'intern']
    },
    {
      id: 'onboarding',
      name: 'Onboarding',
      description: 'Track new hire 30-day progress',
      icon: Zap,
      component: OnboardingBoard,
      category: 'HR',
      allowedRoles: ['admin', 'manager', 'employee', 'intern']
    },
    {
      id: 'performance',
      name: 'Team Pulse',
      description: 'Team health & sentiment tracking',
      icon: Heart,
      component: TeamPulseBoard,
      category: 'HR',
      allowedRoles: ['admin', 'manager', 'employee', 'intern']
    },
    {
      id: 'exits',
      name: 'Exits & Alumni',
      description: 'Departures and alumni network',
      icon: LogOut,
      component: ExitsBoard,
      category: 'HR',
      allowedRoles: ['admin', 'manager']
    },
    {
      id: 'project-health',
      name: 'Project Health',
      description: 'Project status and blockers',
      icon: GitBranch,
      component: ProjectHealthBoard,
      category: 'Execution',
      allowedRoles: ['admin', 'manager', 'employee', 'intern']
    },
    {
      id: 'action-items',
      name: 'Action Items',
      description: 'Decisions and action tracking',
      icon: Zap,
      component: ActionItemsBoard,
      category: 'Execution',
      allowedRoles: ['admin', 'manager', 'employee', 'intern']
    },
    {
      id: 'one-on-ones',
      name: '1:1 Meetings',
      description: 'Schedule and track conversations',
      icon: Settings,
      component: OneOnOneBoard,
      category: 'Support',
      allowedRoles: ['admin', 'manager', 'employee', 'intern']
    },
    {
      id: 'red-flags',
      name: 'Red Flags',
      description: 'Auto-detect burnout, blockers & disengagement',
      icon: AlertTriangle,
      component: RedFlagAlert,
      category: 'Support',
      allowedRoles: ['admin', 'manager']
    },
    {
      id: 'commands',
      name: 'Commands',
      description: 'Slack-like command interface',
      icon: Code,
      component: SlackCommandConsole,
      category: 'Support',
      allowedRoles: ['admin', 'manager']
    },
    {
      id: 'metrics',
      name: 'Metrics',
      description: 'KPIs and analytics dashboard',
      icon: BarChart3,
      component: MetricsDashboard,
      category: 'Support',
      allowedRoles: ['admin', 'manager']
    },
    {
      id: 'reports',
      name: 'Reports',
      description: 'Company-wide analytics & exports',
      icon: BarChart3,
      component: ReportsBoard,
      category: 'Support',
      allowedRoles: ['admin', 'manager']
    },
    {
      id: 'logs',
      name: 'System Logs',
      description: 'Audit logs and system activity tracking',
      icon: Shield,
      component: AdminLogViewer,
      category: 'Admin',
      allowedRoles: ['admin']
    },
    {
      id: 'settings',
      name: 'Admin Settings',
      description: 'User management & IDP configuration',
      icon: Settings,
      component: AdminSettings,
      category: 'Admin',
      allowedRoles: ['admin']
    }
  ]

  const activeBoardConfig = boards.find((b) => b.id === activeBoard)
  const BoardComponent = activeBoardConfig?.component

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top Navigation */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-4 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between gap-4 max-w-[1920px] mx-auto w-full">
          {/* Left: User Info */}
          <div className="flex-shrink-0 min-w-[150px]">
            {currentUser && (
              <div className="text-left">
                <p className="text-blue-100 text-[10px] uppercase tracking-wider mb-1">Logged in as</p>
                <p className="font-bold text-sm truncate max-w-[200px]">{currentUser.name}</p>
                <p className="text-[10px] text-blue-200 capitalize opacity-80">{currentUser.role}</p>
              </div>
            )}
          </div>

          {/* Center: Logo & Branding */}
          <div className="flex items-center justify-center gap-3 px-4">
            <div className="bg-white/10 p-1.5 rounded-xl backdrop-blur-sm border border-white/10 flex-shrink-0">
              <img src="/logo.png" alt="YUVAHIVE" className="h-10 w-10 object-contain" />
            </div>
            <div className="text-center hidden sm:block">
              <p className="font-black text-2xl tracking-tighter leading-none italic">YUVAHIVE</p>
              <p className="text-[10px] text-blue-100 font-medium tracking-[0.2em] uppercase mt-0.5 opacity-70">HR Management</p>
            </div>
          </div>

          {/* Right: Back to Calendar & Logout */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onBackToCalendar}
              className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm border border-white/10"
              title="Back to Calendar"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
              <span>Back to Calendar</span>
            </button>
            {logout && (
              <button
                onClick={logout}
                className="flex items-center justify-center w-10 h-10 bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition-all duration-300 border border-white/10"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
              HR Boards
            </h2>
            <div className="space-y-1">
              {boards
                .filter((b) => b.category === 'HR' && b.allowedRoles.includes(currentUser?.role))
                .map((board) => (
                  <button
                    key={board.id}
                    onClick={() => setActiveBoard(board.id)}
                    disabled={!board.component}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      activeBoard === board.id
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <board.icon className="w-4 h-4" />
                    <span className="flex-1">{board.name}</span>
                    {!board.component && (
                      <span className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded">
                        Soon
                      </span>
                    )}
                  </button>
                ))}
            </div>

            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-6 mb-4">
              Execution Boards
            </h2>
            <div className="space-y-1">
              {boards
                .filter((b) => b.category === 'Execution' && b.allowedRoles.includes(currentUser?.role))
                .map((board) => (
                  <button
                    key={board.id}
                    onClick={() => setActiveBoard(board.id)}
                    disabled={!board.component}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      activeBoard === board.id
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <board.icon className="w-4 h-4" />
                    <span className="flex-1">{board.name}</span>
                    {!board.component && (
                      <span className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded">
                        Soon
                      </span>
                    )}
                  </button>
                ))}
            </div>

            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-6 mb-4">
              Support
            </h2>
            <div className="space-y-1">
              {boards
                .filter((b) => b.category === 'Support' && b.allowedRoles.includes(currentUser?.role))
                .map((board) => (
                  <button
                    key={board.id}
                    onClick={() => setActiveBoard(board.id)}
                    disabled={!board.component}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      activeBoard === board.id
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <board.icon className="w-4 h-4" />
                    <span className="flex-1">{board.name}</span>
                    {!board.component && (
                      <span className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded">
                        Soon
                      </span>
                    )}
                  </button>
                ))}
            </div>

            {/* Admin Section - Only show for admins */}
            {currentUser?.role === 'admin' && (
              <>
                <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-6 mb-4">
                  Administration
                </h2>
                <div className="space-y-1">
                  {boards
                    .filter((b) => b.category === 'Admin')
                    .map((board) => (
                      <button
                        key={board.id}
                        onClick={() => setActiveBoard(board.id)}
                        disabled={!board.component}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          activeBoard === board.id
                            ? 'bg-red-100 text-red-900 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        <board.icon className="w-4 h-4" />
                        <span className="flex-1">{board.name}</span>
                        {!board.component && (
                          <span className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded">
                            Soon
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {BoardComponent ? (
            <BoardComponent />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {activeBoardConfig?.name} Coming Soon
                </h2>
                <p className="text-gray-600 mb-6">{activeBoardConfig?.description}</p>
                <button
                  onClick={() => setActiveBoard('hiring')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Hiring Pipeline
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}
