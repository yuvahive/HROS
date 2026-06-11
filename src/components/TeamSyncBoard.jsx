import React, { useState, useEffect, useContext } from 'react'
import {
  Users, Clock, AlertTriangle, CheckCircle, Coffee,
  Eye, Activity, ArrowUpRight, MessageSquare, Zap,
  RefreshCw, Filter, Search, Wifi, WifiOff
} from 'lucide-react'
import { getAllFromDB, STORES } from '../utils/indexedDB'
import { AuthContext, useCloudPulse } from '../context/AuthContext'

export default function TeamSyncBoard() {
  const { currentUser, filterByTeam } = useContext(AuthContext)
  const lastPulse = useCloudPulse()
  const [teamData, setTeamData] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('sync') // 'sync' | 'feed' | 'blockers'
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [teams, setTeams] = useState([])

  useEffect(() => {
    loadTeamSync()
  }, [lastPulse]) // Refresh on every cloud sync pulse

  const loadTeamSync = async () => {
    try {
      const [peopleRaw, workLogs, tasks, oneOnOnes, actionItems] = await Promise.all([
        getAllFromDB(STORES.people),
        getAllFromDB(STORES.workLogs),
        getAllFromDB(STORES.tasks),
        getAllFromDB(STORES.oneOnOnes),
        getAllFromDB(STORES.actionItems)
      ])
      const people = filterByTeam(peopleRaw)

      const today = new Date().toISOString().split('T')[0]

      // Get unique teams
      const uniqueTeams = [...new Set(people.map(p => p.team).filter(Boolean))]
      setTeams(uniqueTeams)

      // Build per-person sync data
      const syncData = people.map(person => {
        // Today's work
        const todayWork = workLogs.filter(w =>
          (w.personId === person.id || w.personName === person.name) && w.date === today
        )

        // Recent work (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
        const recentWork = workLogs.filter(w =>
          (w.personId === person.id || w.personName === person.name) && w.date >= weekAgo
        )

        // Active tasks
        const activeTasks = tasks.filter(t =>
          (t.ownerId === person.id || t.ownerName === person.name) &&
          !['done', 'completed'].includes(t.status)
        )

        // Blocked items
        const blockedItems = [
          ...workLogs.filter(w =>
            (w.personId === person.id || w.personName === person.name) &&
            w.status === 'blocked' && w.date >= weekAgo
          ).map(w => ({ type: 'work', text: w.taskName, reason: w.blockers?.[0] || 'No reason given' })),
          ...tasks.filter(t =>
            (t.ownerId === person.id || t.ownerName === person.name) &&
            t.status === 'blocked'
          ).map(t => ({ type: 'task', text: t.title, reason: t.blockers?.[0] || 'No reason given' }))
        ]

        // Upcoming meetings
        const upcomingMeetings = oneOnOnes.filter(m =>
          (m.personId === person.id || m.managerId === person.id) &&
          m.status === 'scheduled' &&
          new Date(m.scheduledDate) >= new Date(today)
        )

        // Action items pending
        const pendingActions = actionItems.filter(a =>
          (a.owner === person.id || a.ownerName === person.name) &&
          a.status !== 'complete'
        )

        // Calculate status
        const hoursToday = todayWork.reduce((sum, w) => sum + (w.hoursWorked || 0), 0)
        const hasBlockers = blockedItems.length > 0
        const hasTodayWork = todayWork.length > 0
        const lastActivity = recentWork.length > 0
          ? recentWork.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
          : null

        // Determine status label
        let status = 'offline'
        let statusLabel = 'No activity today'
        if (hasBlockers) {
          status = 'blocked'
          statusLabel = 'Has blockers'
        } else if (hasTodayWork) {
          status = 'active'
          statusLabel = `Working • ${hoursToday}h logged`
        } else if (lastActivity) {
          const daysSince = Math.floor((Date.now() - new Date(lastActivity.date)) / 86400000)
          if (daysSince <= 1) {
            status = 'idle'
            statusLabel = `Last active ${daysSince === 0 ? 'today' : 'yesterday'}`
          }
        }

        return {
          ...person,
          todayWork,
          recentWork,
          activeTasks,
          blockedItems,
          upcomingMeetings,
          pendingActions: pendingActions,
          hoursToday,
          status,
          statusLabel,
          tasksCompleted: recentWork.filter(w => w.status === 'done').length,
          totalHoursWeek: recentWork.reduce((sum, w) => sum + (w.hoursWorked || 0), 0)
        }
      }).filter(p => p.todayWork.length > 0 || p.activeTasks.length > 0 || p.recentWork.length > 0)

      setTeamData(syncData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading team sync:', error)
      setLoading(false)
    }
  }

  const filteredTeam = selectedTeam === 'all'
    ? teamData
    : teamData.filter(p => p.team === selectedTeam)

  const statusCounts = {
    active: teamData.filter(p => p.status === 'active').length,
    blocked: teamData.filter(p => p.status === 'blocked').length,
    idle: teamData.filter(p => p.status === 'idle').length,
    offline: teamData.filter(p => p.status === 'offline').length
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Syncing team data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Team Sync
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Real-time view of what everyone is working on
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Team Filter */}
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'sync', label: 'Sync View', icon: <RefreshCw className="w-3.5 h-3.5" /> },
                { id: 'feed', label: 'Activity Feed', icon: <Clock className="w-3.5 h-3.5" /> },
                { id: 'blockers', label: 'Blockers', icon: <AlertTriangle className="w-3.5 h-3.5" /> }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === mode.id
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Summary Bar */}
        <div className="flex gap-4 mt-4">
          <StatusPill icon={<Zap className="w-3.5 h-3.5" />} label="Working" count={statusCounts.active} color="green" />
          <StatusPill icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Blocked" count={statusCounts.blocked} color="red" />
          <StatusPill icon={<Eye className="w-3.5 h-3.5" />} label="Idle" count={statusCounts.idle} color="yellow" />
          <StatusPill icon={<WifiOff className="w-3.5 h-3.5" />} label="No Activity" count={statusCounts.offline} color="gray" />
          <div className="ml-auto text-xs text-gray-400 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live sync active
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'sync' && (
          <SyncView team={filteredTeam} currentUser={currentUser} />
        )}
        {viewMode === 'feed' && (
          <FeedView team={filteredTeam} />
        )}
        {viewMode === 'blockers' && (
          <BlockersView team={filteredTeam} />
        )}
      </div>
    </div>
  )
}

// ==================== STATUS PILL ====================

function StatusPill({ icon, label, count, color }) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    gray: 'bg-gray-50 text-gray-500 border-gray-200'
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {icon}
      <span>{count}</span>
      <span className="opacity-70">{label}</span>
    </div>
  )
}

// ==================== SYNC VIEW ====================

function SyncView({ team, currentUser }) {
  // Sort: blocked first, then active, then idle, then offline
  const sorted = [...team].sort((a, b) => {
    const order = { blocked: 0, active: 1, idle: 2, offline: 3 }
    return (order[a.status] || 3) - (order[b.status] || 3)
  })

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-semibold mb-2">No Team Activity Yet</h3>
        <p className="text-sm max-w-md mx-auto">
          When team members log work or update tasks, their status will appear here in real-time.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sorted.map(person => (
        <PersonSyncCard key={person.id} person={person} currentUser={currentUser} />
      ))}
    </div>
  )
}

function PersonSyncCard({ person, currentUser }) {
  const [expanded, setExpanded] = useState(false)

  const statusConfig = {
    active: { dot: 'bg-green-400', ring: 'ring-green-100', bg: 'hover:border-green-200' },
    blocked: { dot: 'bg-red-400', ring: 'ring-red-100', bg: 'border-red-200 bg-red-50/30' },
    idle: { dot: 'bg-yellow-400', ring: 'ring-yellow-100', bg: 'hover:border-yellow-200' },
    offline: { dot: 'bg-gray-300', ring: 'ring-gray-100', bg: '' }
  }

  const config = statusConfig[person.status] || statusConfig.offline

  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm transition-all ${config.bg}`}>
      <div
        className="px-5 py-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {/* Avatar with status */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
              {person.name?.charAt(0) || '?'}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${config.dot} ring-4 ${config.ring}`}></div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{person.name}</h3>
              {person.id === currentUser?.id && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">You</span>
              )}
            </div>
            <p className="text-sm text-gray-500">{person.role} • {person.team}</p>
          </div>

          {/* Status */}
          <div className="text-right flex-shrink-0">
            <p className={`text-sm font-medium ${
              person.status === 'active' ? 'text-green-600' :
              person.status === 'blocked' ? 'text-red-600' :
              person.status === 'idle' ? 'text-yellow-600' :
              'text-gray-400'
            }`}>
              {person.statusLabel}
            </p>
            {person.todayWork.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {person.todayWork.length} task{person.todayWork.length > 1 ? 's' : ''} today
              </p>
            )}
          </div>

          {/* Expand Arrow */}
          <div className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            ▾
          </div>
        </div>

        {/* Progress Bar */}
        {person.totalHoursWeek > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  person.status === 'blocked' ? 'bg-red-400' :
                  person.status === 'active' ? 'bg-green-400' :
                  'bg-gray-300'
                }`}
                style={{ width: `${Math.min((person.totalHoursWeek / 40) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{person.totalHoursWeek}h this week</span>
          </div>
        )}
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-5 pb-4 border-t border-gray-50 pt-3 space-y-3">
          {/* Today's Work */}
          {person.todayWork.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Today's Work</h4>
              <div className="space-y-1.5">
                {person.todayWork.map((work, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span>{work.status === 'done' ? '✅' : work.status === 'blocked' ? '🛑' : '🔨'}</span>
                    <span className="text-gray-700">{work.taskName}</span>
                    <span className="text-gray-400 text-xs ml-auto">{work.hoursWorked}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Tasks */}
          {person.activeTasks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Tasks</h4>
              <div className="space-y-1.5">
                {person.activeTasks.slice(0, 3).map((task, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`}></span>
                    <span className="text-gray-700">{task.title}</span>
                    {task.deadline && (
                      <span className="text-xs text-gray-400 ml-auto">Due {task.deadline}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blockers */}
          {person.blockedItems.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Blockers
              </h4>
              <div className="space-y-1.5">
                {person.blockedItems.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="text-red-700 font-medium">{item.text}</span>
                    <p className="text-red-500 text-xs mt-0.5">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Actions */}
          {person.pendingActions?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pending Actions</h4>
              <div className="space-y-1.5">
                {person.pendingActions.slice(0, 3).map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Zap className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-gray-700">{action.title}</span>
                    {action.dueDate && (
                      <span className="text-xs text-gray-400 ml-auto">Due {action.dueDate}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {person.recentWork.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">This Week</h4>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>📊 {person.tasksCompleted} completed</span>
                <span>⏱️ {person.totalHoursWeek}h logged</span>
                <span>📋 {person.recentWork.length} work entries</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ==================== FEED VIEW ====================

function FeedView({ team }) {
  // Build activity feed from all team data
  const feed = []
  team.forEach(person => {
    person.todayWork.forEach(work => {
      feed.push({
        person: person.name,
        personRole: person.role,
        personTeam: person.team,
        action: work.status === 'done' ? 'completed' : work.status === 'blocked' ? 'reported blocker on' : 'is working on',
        target: work.taskName,
        detail: `${work.hoursWorked}h logged`,
        time: work.date,
        type: work.status === 'done' ? 'success' : work.status === 'blocked' ? 'error' : 'info'
      })
    })
    person.recentWork
      .filter(w => w.date !== new Date().toISOString().split('T')[0])
      .forEach(work => {
        feed.push({
          person: person.name,
          personRole: person.role,
          personTeam: person.team,
          action: work.status === 'done' ? 'completed' : 'worked on',
          target: work.taskName,
          detail: `${work.hoursWorked}h • ${work.date}`,
          time: work.date,
          type: work.status === 'done' ? 'success' : 'info'
        })
      })
  })

  feed.sort((a, b) => new Date(b.time) - new Date(a.time))

  if (feed.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
        <p className="text-sm">Team activity will appear here as people log work.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-50">
        {feed.slice(0, 30).map((item, idx) => (
          <div key={idx} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              item.type === 'success' ? 'bg-green-400' :
              item.type === 'error' ? 'bg-red-400' :
              'bg-blue-400'
            }`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{item.person}</span>
                {' '}{item.action}{' '}
                <span className="font-medium text-gray-900">{item.target}</span>
              </p>
              <p className="text-xs text-gray-400">{item.detail} • {item.personTeam}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== BLOCKERS VIEW ====================

function BlockersView({ team }) {
  const allBlockers = []
  team.forEach(person => {
    person.blockedItems.forEach(blocker => {
      allBlockers.push({
        ...blocker,
        person: person.name,
        personId: person.id,
        personRole: person.role,
        team: person.team
      })
    })
  })

  if (allBlockers.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400 opacity-50" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">All Clear!</h3>
        <p className="text-sm">No blockers across the team right now.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-red-800">{allBlockers.length} Active Blocker{allBlockers.length > 1 ? 's' : ''}</h3>
        </div>
        <p className="text-sm text-red-600 mt-1">These need attention to keep the team unblocked.</p>
      </div>

      {allBlockers.map((blocker, idx) => (
        <div key={idx} className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {blocker.person?.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900">{blocker.person}</h4>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{blocker.team}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{blocker.text}</p>
              <p className="text-sm text-red-600 mt-1 font-medium">Reason: {blocker.reason}</p>
            </div>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
              {blocker.type === 'work' ? 'Work Log' : 'Task'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
