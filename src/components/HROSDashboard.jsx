import React, { useState, useEffect } from 'react'
import { Users, Briefcase, CheckSquare, LogOut, GitBranch, Zap, Heart, Settings, AlertTriangle, Code, BarChart3 } from 'lucide-react'
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

// HROS Dashboard - Main hub for all HR boards
export default function HROSDashboard({ currentUser, logout }) {
  const [activeBoard, setActiveBoard] = useState('hiring')

  // All available boards with metadata
  const boards = [
    {
      id: 'hiring',
      name: 'Hiring Pipeline',
      description: 'Track candidates from application to hire',
      icon: Users,
      component: HiringPipelineBoard,
      category: 'HR'
    },
    {
      id: 'daily-work',
      name: 'Daily Work',
      description: 'Real-time shipping tracker for today',
      icon: CheckSquare,
      component: DailyWorkBoard,
      category: 'Execution'
    },
    {
      id: 'onboarding',
      name: 'Onboarding',
      description: 'Track new hire 30-day progress',
      icon: Zap,
      component: OnboardingBoard,
      category: 'HR'
    },
    {
      id: 'performance',
      name: 'Team Pulse',
      description: 'Team health & sentiment tracking',
      icon: Heart,
      component: TeamPulseBoard,
      category: 'HR'
    },
    {
      id: 'exits',
      name: 'Exits & Alumni',
      description: 'Departures and alumni network',
      icon: LogOut,
      component: ExitsBoard,
      category: 'HR'
    },
    {
      id: 'project-health',
      name: 'Project Health',
      description: 'Project status and blockers',
      icon: GitBranch,
      component: ProjectHealthBoard,
      category: 'Execution'
    },
    {
      id: 'action-items',
      name: 'Action Items',
      description: 'Decisions and action tracking',
      icon: Zap,
      component: ActionItemsBoard,
      category: 'Execution'
    },
    {
      id: 'one-on-ones',
      name: '1:1 Meetings',
      description: 'Schedule and track conversations',
      icon: Settings,
      component: OneOnOneBoard,
      category: 'Support'
    },
    {
      id: 'red-flags',
      name: 'Red Flags',
      description: 'Auto-detect burnout, blockers & disengagement',
      icon: AlertTriangle,
      component: RedFlagAlert,
      category: 'Support'
    },
    {
      id: 'commands',
      name: 'Commands',
      description: 'Slack-like command interface',
      icon: Code,
      component: SlackCommandConsole,
      category: 'Support'
    },
    {
      id: 'metrics',
      name: 'Metrics',
      description: 'KPIs and analytics dashboard',
      icon: BarChart3,
      component: MetricsDashboard,
      category: 'Support'
    },
    {
      id: 'reports',
      name: 'Reports',
      description: 'Company-wide analytics & exports',
      icon: BarChart3,
      component: ReportsBoard,
      category: 'Support'
    },
    {
      id: 'settings',
      name: 'Admin Settings',
      description: 'User management & IDP configuration',
      icon: Settings,
      component: AdminSettings,
      category: 'Admin',
      requiresAdmin: true
    }
  ]

  const activeBoardConfig = boards.find((b) => b.id === activeBoard)
  const BoardComponent = activeBoardConfig?.component

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🚀 YuvaHive HROS</h1>
            <p className="text-blue-100 text-sm">Human Resources Operating System</p>
          </div>
          <div className="flex items-center gap-8">
            {currentUser && (
              <div className="text-right border-r border-blue-400 pr-6">
                <p className="text-blue-100 text-sm">Logged in as:</p>
                <p className="font-semibold">{currentUser.name}</p>
                <p className="text-xs text-blue-200 capitalize">{currentUser.role}</p>
              </div>
            )}
            <div className="text-right">
              <p className="text-blue-100">Powered by IndexedDB</p>
              <p className="text-xs text-blue-200">All data saved locally • No backend required</p>
            </div>
            {logout && (
              <button
                onClick={logout}
                className="ml-4 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-medium"
                title="Logout"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
              HR Boards
            </h2>
            <div className="space-y-1">
              {boards
                .filter((b) => b.category === 'HR')
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
                .filter((b) => b.category === 'Execution')
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
                .filter((b) => b.category === 'Support')
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

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <p>HROS Dashboard • {boards.length} boards available</p>
          <p>
            ✅ {boards.filter((b) => b.component).length} Active • 🚧{' '}
            {boards.filter((b) => !b.component).length} Coming Soon
          </p>
        </div>
      </div>
    </div>
  )
}
