import React, { useState, useEffect, useContext } from 'react'
import {
  User, Calendar, Clock, CheckCircle, AlertCircle, Plus,
  MessageSquare, Briefcase, TrendingUp, ArrowRight, Target,
  Coffee, Zap, Heart, Send, X
} from 'lucide-react'
import { getAllFromDB, addToDB, STORES } from '../utils/indexedDB'
import { AuthContext } from '../context/AuthContext'
import { generateID } from '../utils/sampleData'

export default function MyDashboard() {
  const { currentUser } = useContext(AuthContext)
  const [myTasks, setMyTasks] = useState([])
  const [myMeetings, setMyMeetings] = useState([])
  const [myTeam, setMyTeam] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestMeetingOpen, setRequestMeetingOpen] = useState(false)
  const [requestTimeOffOpen, setRequestTimeOffOpen] = useState(false)
  const [logWorkOpen, setLogWorkOpen] = useState(false)

  useEffect(() => {
    loadMyData()
  }, [currentUser])

  const loadMyData = async () => {
    try {
      const [workLogs, oneOnOnes, people, tasks, actionItems] = await Promise.all([
        getAllFromDB(STORES.workLogs),
        getAllFromDB(STORES.oneOnOnes),
        getAllFromDB(STORES.people),
        getAllFromDB(STORES.tasks),
        getAllFromDB(STORES.actionItems)
      ])

      const userId = currentUser?.id
      const userName = currentUser?.name

      // My tasks - filter by current user
      const myWork = workLogs.filter(w =>
        w.personId === userId || w.personName === userName
      ).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

      const myTasksList = tasks.filter(t =>
        t.ownerId === userId || t.ownerName === userName
      ).sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
      }).slice(0, 5)

      const myActions = actionItems.filter(a =>
        a.owner === userId || a.ownerName === userName
      ).filter(a => a.status !== 'complete').slice(0, 5)

      setMyTasks([...myTasksList.map(t => ({ ...t, type: 'task' })), ...myActions.map(a => ({ ...a, type: 'action' }))].slice(0, 8))

      // My meetings - upcoming 1:1s
      const myOneOnOnes = oneOnOnes.filter(m =>
        m.personId === userId || m.managerId === userId || m.personName === userName
      ).filter(m => m.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
        .slice(0, 5)

      setMyMeetings(myOneOnOnes)

      // My team - people who report to me or my manager/peers
      const myInfo = people.find(p => p.id === userId || p.name === userName)
      if (myInfo) {
        const teamMembers = people.filter(p =>
          p.manager === myInfo.id || p.id === myInfo.manager || p.team === myInfo.team
        )
        setMyTeam(teamMembers)
      } else {
        setMyTeam(people.slice(0, 6))
      }

      // Recent activity across my work
      const activity = [
        ...myWork.map(w => ({
          type: 'work',
          text: `Logged ${w.hoursWorked}h on "${w.taskName}"`,
          date: w.date,
          status: w.status
        })),
        ...myOneOnOnes.map(m => ({
          type: 'meeting',
          text: `1:1 ${m.status === 'completed' ? 'completed' : 'scheduled'} with ${m.personName || 'Team Lead'}`,
          date: m.scheduledDate,
          status: m.status
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)

      setRecentActivity(activity)
      setLoading(false)
    } catch (error) {
      console.error('Error loading my data:', error)
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getRoleEmoji = () => {
    switch (currentUser?.role) {
      case 'admin': return '👑'
      case 'HR': return '🎯'
      case 'TeamLead': return '🎯'
      case 'intern': return '🌱'
      default: return '💼'
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{getGreeting()}</p>
              <h1 className="text-2xl font-black mt-1">
                {currentUser?.name || 'Team Member'} {getRoleEmoji()}
              </h1>
              <p className="text-blue-100 text-sm mt-1 capitalize">
                {currentUser?.role} Dashboard
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-blue-100 text-xs uppercase tracking-wider">Today</p>
              <p className="text-3xl font-black">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction
            icon={<Plus className="w-5 h-5" />}
            label="Log Work"
            color="blue"
            onClick={() => setLogWorkOpen(true)}
          />
          <QuickAction
            icon={<MessageSquare className="w-5 h-5" />}
            label="Request 1:1"
            color="purple"
            onClick={() => setRequestMeetingOpen(true)}
          />
          <QuickAction
            icon={<Coffee className="w-5 h-5" />}
            label="Request Time Off"
            color="orange"
            onClick={() => setRequestTimeOffOpen(true)}
          />
          <QuickAction
            icon={<Target className="w-5 h-5" />}
            label="My Goals"
            color="green"
            onClick={() => {}}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: My Tasks */}
          <div className="lg:col-span-2 space-y-6">

            {/* My Tasks & Action Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  My Tasks & Actions
                </h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {myTasks.length} active
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {myTasks.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No pending tasks. You're all clear!</p>
                  </div>
                ) : (
                  myTasks.map((task, idx) => (
                    <TaskRow key={task.id || idx} task={task} />
                  ))
                )}
              </div>
            </div>

            {/* My Recent Work Logs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Recent Activity
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No recent activity yet</p>
                  </div>
                ) : (
                  recentActivity.map((activity, idx) => (
                    <ActivityRow key={idx} activity={activity} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Meetings + Team */}
          <div className="space-y-6">

            {/* Upcoming Meetings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Upcoming 1:1s
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {myMeetings.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No upcoming meetings</p>
                    <button
                      onClick={() => setRequestMeetingOpen(true)}
                      className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Request a 1:1 →
                    </button>
                  </div>
                ) : (
                  myMeetings.map((meeting, idx) => (
                    <MeetingCard key={meeting.id || idx} meeting={meeting} />
                  ))
                )}
              </div>
            </div>

            {/* My Team */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  My Team
                </h2>
              </div>
              <div className="p-4 space-y-2">
                {myTeam.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No team data yet</p>
                  </div>
                ) : (
                  myTeam.map((person, idx) => (
                    <TeamMemberRow key={person.id || idx} person={person} />
                  ))
                )}
              </div>
            </div>

            {/* Wellbeing Check */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-5">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-green-600" />
                Wellbeing Check
              </h3>
              <p className="text-sm text-gray-600 mb-3">How are you feeling today?</p>
              <div className="flex gap-2">
                {['😊', '😐', '😤', '😰'].map((emoji, idx) => (
                  <button
                    key={idx}
                    className="text-2xl hover:scale-125 transition-transform p-2 rounded-lg hover:bg-white/50"
                    title={['Great', 'Okay', 'Stressed', 'Overwhelmed'][idx]}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {requestMeetingOpen && (
        <RequestMeetingModal
          onClose={() => setRequestMeetingOpen(false)}
          currentUser={currentUser}
          myTeam={myTeam}
        />
      )}
      {requestTimeOffOpen && (
        <RequestTimeOffModal
          onClose={() => setRequestTimeOffOpen(false)}
          currentUser={currentUser}
        />
      )}
      {logWorkOpen && (
        <LogWorkModal
          onClose={() => setLogWorkOpen(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}

// ==================== SUB COMPONENTS ====================

function QuickAction({ icon, label, color, onClick }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-100'
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:shadow-md ${colorMap[color]}`}
    >
      {icon}
      <span className="font-semibold text-sm">{label}</span>
    </button>
  )
}

function TaskRow({ task }) {
  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  }

  const statusIcons = {
    'doing': '🔨',
    'todo': '📋',
    'review': '👀',
    'blocked': '🛑',
    'in-progress': '🔨',
    'assigned': '📌'
  }

  return (
    <div className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
      <span className="text-lg">{statusIcons[task.status] || '📋'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{task.title || task.taskName}</p>
        <p className="text-xs text-gray-500">
          {task.taskId || task.id} {task.deadline || task.dueDate ? `• Due ${task.deadline || task.dueDate}` : ''}
        </p>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || 'bg-gray-100 text-gray-600'}`}>
        {task.priority}
      </span>
    </div>
  )
}

function ActivityRow({ activity }) {
  const statusColors = {
    'done': 'text-green-600',
    'completed': 'text-green-600',
    'in-progress': 'text-blue-600',
    'scheduled': 'text-blue-600',
    'blocked': 'text-red-600'
  }

  return (
    <div className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
      <div className={`w-2 h-2 rounded-full ${activity.status === 'done' ? 'bg-green-500' : activity.status === 'blocked' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 truncate">{activity.text}</p>
        <p className="text-xs text-gray-400">{activity.date}</p>
      </div>
      <span className={`text-xs font-medium capitalize ${statusColors[activity.status] || 'text-gray-500'}`}>
        {activity.status}
      </span>
    </div>
  )
}

function MeetingCard({ meeting }) {
  const meetingDate = new Date(meeting.scheduledDate)
  const isToday = meetingDate.toDateString() === new Date().toDateString()
  const isTomorrow = meetingDate.toDateString() === new Date(Date.now() + 86400000).toDateString()

  return (
    <div className={`p-3 rounded-lg border ${isToday ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-100'}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-gray-900">
          {meeting.personName || 'Team Lead'}
        </p>
        {isToday && <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Today</span>}
        {isTomorrow && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Tomorrow</span>}
      </div>
      <p className="text-xs text-gray-500">
        {meetingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        {meeting.scheduledTime ? ` at ${meeting.scheduledTime.includes('T') ? new Date(meeting.scheduledTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : meeting.scheduledTime}` : ''}
        {meeting.duration ? ` • ${meeting.duration}min` : ''}
      </p>
    </div>
  )
}

function TeamMemberRow({ person }) {
  const statusColors = {
    'active': 'bg-green-400',
    'on-leave': 'bg-yellow-400',
    'on-notice': 'bg-red-400'
  }

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="relative">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
          {person.name?.charAt(0) || '?'}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusColors[person.status] || 'bg-gray-400'}`}></div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{person.name}</p>
        <p className="text-xs text-gray-500 truncate">{person.role}</p>
      </div>
    </div>
  )
}

// ==================== MODALS ====================

function RequestMeetingModal({ onClose, currentUser, myTeam }) {
  const [formData, setFormData] = useState({
    withPerson: '',
    topic: '',
    preferredDate: '',
    preferredTime: '',
    duration: '30',
    notes: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const meeting = {
      id: generateID('meeting-req'),
      personId: currentUser?.id,
      personName: currentUser?.name,
      managerId: formData.withPerson,
      managerName: myTeam.find(p => p.id === formData.withPerson)?.name || '',
      scheduledDate: formData.preferredDate,
      scheduledTime: formData.preferredTime,
      duration: Number(formData.duration),
      topic: formData.topic,
      prepNotes: formData.notes,
      status: 'scheduled',
      requestedBy: 'employee',
      createdAt: new Date().toISOString()
    }
    await addToDB(STORES.oneOnOnes, meeting)
    alert('Meeting request sent!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Request a 1:1 Meeting</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting with</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={formData.withPerson}
              onChange={(e) => setFormData(prev => ({ ...prev, withPerson: e.target.value }))}
              required
            >
              <option value="">Select person</option>
              {myTeam.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {p.role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="What would you like to discuss?"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={formData.preferredDate}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={formData.preferredTime}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows="2"
              placeholder="Any prep notes or agenda items..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
              <Send className="w-4 h-4" /> Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RequestTimeOffModal({ onClose, currentUser }) {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'vacation',
    reason: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

    const timeOff = {
      id: generateID('timeoff'),
      personId: currentUser?.id,
      personName: currentUser?.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: days,
      type: formData.type,
      status: 'planned',
      reason: formData.reason,
      createdAt: new Date().toISOString()
    }
    await addToDB(STORES.timeOff, timeOff)
    alert('Time off request submitted!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Request Time Off</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="vacation">Vacation</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal</option>
              <option value="focus-week">Focus Week</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows="2"
              placeholder="Brief reason..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LogWorkModal({ onClose, currentUser }) {
  const [formData, setFormData] = useState({
    taskName: '',
    hoursWorked: '4',
    hoursEstimated: '8',
    status: 'in-progress',
    mood: '',
    output: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const workLog = {
      id: generateID('worklog'),
      date: new Date().toISOString().split('T')[0],
      personId: currentUser?.id,
      personName: currentUser?.name,
      taskName: formData.taskName,
      hoursWorked: Number(formData.hoursWorked),
      hoursEstimated: Number(formData.hoursEstimated),
      status: formData.status,
      mood: formData.mood,
      output: formData.output,
      blockers: [],
      learnings: '',
      nextDayPlan: ''
    }
    await addToDB(STORES.workLogs, workLog)
    alert('Work logged successfully!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Log Today's Work</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What did you work on?</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Task name or description"
              value={formData.taskName}
              onChange={(e) => setFormData(prev => ({ ...prev, taskName: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
              <input
                type="number"
                step="0.5"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={formData.hoursWorked}
                onChange={(e) => setFormData(prev => ({ ...prev, hoursWorked: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours Estimated</label>
              <input
                type="number"
                step="0.5"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={formData.hoursEstimated}
                onChange={(e) => setFormData(prev => ({ ...prev, hoursEstimated: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How are you feeling?</label>
            <div className="flex gap-2">
              {['😊', '😐', '😤'].map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood: emoji }))}
                  className={`text-2xl p-2 rounded-lg transition-all ${formData.mood === emoji ? 'bg-blue-100 scale-110' : 'hover:bg-gray-100'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Log Work</button>
          </div>
        </form>
      </div>
    </div>
  )
}
