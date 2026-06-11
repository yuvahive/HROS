import React, { useState, useEffect, useContext } from 'react'
import {
  Users, Calendar, Clock, CheckCircle, Plus, X, Send,
  MessageSquare, ArrowRight, Star, Heart, AlertTriangle,
  ChevronDown, ChevronRight, FileText, Target
} from 'lucide-react'
import { getAllFromDB, addToDB, updateInDB, STORES } from '../utils/indexedDB'
import { AuthContext, useCloudPulse } from '../context/AuthContext'
import { generateID } from '../utils/sampleData'

function formatMeetingTime(time) {
  if (!time) return 'TBD'
  // If it looks like an ISO date string, extract the time from it
  if (typeof time === 'string' && time.includes('T')) {
    try {
      const d = new Date(time)
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      }
    } catch {}
  }
  return time
}

function sanitizeTime(value) {
  if (!value) return ''
  // If it's an ISO date string, extract just the time
  if (typeof value === 'string' && value.includes('T')) {
    try {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      }
    } catch {}
  }
  return value
}

export default function OneOnOneBoard() {
  const { currentUser, filterByTeam } = useContext(AuthContext)
  const lastPulse = useCloudPulse()
  const [meetings, setMeetings] = useState([])
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('upcoming') // 'upcoming' | 'history' | 'request'
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [activeMeeting, setActiveMeeting] = useState(null)
  const [prepModalOpen, setPrepModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [lastPulse])

  const loadData = async () => {
    try {
      const [meetingsData, peopleData] = await Promise.all([
        getAllFromDB(STORES.oneOnOnes),
        getAllFromDB(STORES.people)
      ])
      const filtered = filterByTeam(meetingsData)
      setMeetings(filtered)
      setPeople(peopleData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading 1:1 data:', error)
      setLoading(false)
    }
  }

  const getPerson = (id) => people.find(p => p.id === id)

  // Split meetings by role perspective
  const myUpcoming = meetings
    .filter(m => {
      if (m.status !== 'scheduled') return false
      const isMe = m.personId === currentUser?.id || m.managerId === currentUser?.id
      return isMe
    })
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))

  const myHistory = meetings
    .filter(m => {
      if (m.status !== 'completed') return false
      return m.personId === currentUser?.id || m.managerId === currentUser?.id
    })
    .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))

  // All meetings (for managers/admins viewing team)
  const allUpcoming = meetings
    .filter(m => m.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))

  const displayUpcoming = ['admin', 'HR', 'TeamLead'].includes(currentUser?.role) ? allUpcoming : myUpcoming
  const displayHistory = ['admin', 'HR', 'TeamLead'].includes(currentUser?.role)
    ? meetings.filter(m => m.status === 'completed').sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))
    : myHistory

  const handleRequestMeeting = async (meetingData) => {
    const newMeeting = {
      id: generateID('1o1'),
      personId: currentUser?.id,
      personName: currentUser?.name,
      managerId: meetingData.withPerson,
      managerName: people.find(p => p.id === meetingData.withPerson)?.name || '',
      scheduledDate: meetingData.date || new Date().toISOString().split('T')[0],
      scheduledTime: sanitizeTime(meetingData.time) || '10:00',
      duration: Number(meetingData.duration),
      meetingType: meetingData.type || 'regular',
      status: 'scheduled',
      requestedBy: ['admin', 'HR', 'TeamLead'].includes(currentUser?.role) ? 'manager' : 'employee',
      // Prep
      prepNotes: meetingData.prepNotes || '',
      topicsToDiscuss: meetingData.topics || [],
      // Meeting content
      shippingUpdate: '',
      growthFeedback: '',
      wellbeingScore: 5,
      wellbeingNotes: '',
      blockers: '',
      blockerHelp: '',
      // Outcomes
      decisions: '',
      actionItems: '',
      nextMeetingDate: '',
      notes: '',
      createdAt: new Date().toISOString()
    }
    await addToDB(STORES.oneOnOnes, newMeeting)
    await loadData()
    setRequestModalOpen(false)
  }

  const handleCompleteMeeting = async (meetingId, outcomes) => {
    const meeting = meetings.find(m => m.id === meetingId)
    if (!meeting) return
    await updateInDB(STORES.oneOnOnes, {
      ...meeting,
      status: 'completed',
      ...outcomes,
      completionDate: new Date().toISOString()
    })
    // Track decisions made in this meeting
    if (outcomes.decisions && outcomes.decisions.trim()) {
      await addToDB(STORES.decisions, {
        id: generateID('decision'),
        meetingId: meeting.id,
        personId: meeting.personId,
        personName: meeting.personName,
        managerId: meeting.managerId,
        managerName: meeting.managerName,
        decisionText: outcomes.decisions,
        date: new Date().toISOString(),
        recordedBy: currentUser?.id
      })
    }
    await loadData()
    setActiveMeeting(null)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading meetings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-purple-50/20">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              1:1 Meetings
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {['admin', 'HR', 'TeamLead'].includes(currentUser?.role)
                ? 'Manage and track all team conversations'
                : 'Your conversations with your team lead'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('upcoming')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  view === 'upcoming' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                Upcoming ({displayUpcoming.length})
              </button>
              <button
                onClick={() => setView('history')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  view === 'history' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                History ({displayHistory.length})
              </button>
            </div>
            <button
              onClick={() => setRequestModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Request 1:1
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {view === 'upcoming' ? (
          <UpcomingView
            meetings={displayUpcoming}
            currentUser={currentUser}
            people={people}
            onStartMeeting={setActiveMeeting}
            onPrep={(meeting) => { setActiveMeeting(meeting); setPrepModalOpen(true) }}
          />
        ) : (
          <HistoryView
            meetings={displayHistory}
            currentUser={currentUser}
            people={people}
            onSelect={setActiveMeeting}
          />
        )}
      </div>

      {/* Request Modal */}
      {requestModalOpen && (
        <RequestMeetingModal
          onClose={() => setRequestModalOpen(false)}
          onSubmit={handleRequestMeeting}
          currentUser={currentUser}
          people={people}
        />
      )}

      {/* Prep Modal */}
      {prepModalOpen && activeMeeting && (
        <PrepModal
          meeting={activeMeeting}
          onClose={() => { setPrepModalOpen(false); setActiveMeeting(null) }}
          onSave={async (prep) => {
            await updateInDB(STORES.oneOnOnes, { ...activeMeeting, ...prep })
            await loadData()
            setPrepModalOpen(false)
            setActiveMeeting(null)
          }}
        />
      )}

      {/* Meeting Detail / Complete Modal */}
      {activeMeeting && !prepModalOpen && (
        <MeetingDetailModal
          meeting={activeMeeting}
          onClose={() => setActiveMeeting(null)}
          onComplete={handleCompleteMeeting}
          currentUser={currentUser}
          people={people}
        />
      )}
    </div>
  )
}

// ==================== UPCOMING VIEW ====================

function UpcomingView({ meetings, currentUser, people, onStartMeeting, onPrep }) {
  const now = new Date()

  if (meetings.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Upcoming 1:1s</h3>
        <p className="text-sm max-w-md mx-auto mb-4">
          {['admin', 'HR', 'TeamLead'].includes(currentUser?.role)
            ? 'Schedule 1:1s with your team members to stay connected.'
            : 'Request a 1:1 with your team lead to discuss your progress, blockers, or growth.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {meetings.map(meeting => {
        const meetingDate = new Date(meeting.scheduledDate)
        const isToday = meetingDate.toDateString() === now.toDateString()
        const isTomorrow = meetingDate.toDateString() === new Date(now.getTime() + 86400000).toDateString()
        const isPast = meetingDate < now

        const personId = meeting.personId || meeting.employeeId
        const personName = meeting.personName || meeting.employeeName
        const managerId = meeting.managerId
        const managerName = meeting.managerName

        const isPerson = personId === currentUser?.id
        const isManager = managerId === currentUser?.id

        let otherPerson, otherName
        if (isPerson) {
          otherPerson = people.find(p => p.id === managerId)
          otherName = otherPerson?.name || managerName || 'Unknown'
        } else if (isManager) {
          otherPerson = people.find(p => p.id === personId)
          otherName = otherPerson?.name || personName || 'Unknown'
        } else {
          otherPerson = people.find(p => p.id === managerId) || people.find(p => p.id === personId)
          otherName = otherPerson?.name || managerName || personName || 'Unknown'
        }
        const otherRole = otherPerson?.role || ''

        const requestedByEmployee = meeting.requestedBy === 'employee'

        return (
          <div
            key={meeting.id}
            className={`bg-white rounded-xl border shadow-sm p-5 transition-all hover:shadow-md ${
              isToday ? 'border-purple-300 bg-purple-50/30' :
              isPast ? 'border-red-200 bg-red-50/20' :
              'border-gray-100'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {otherName?.charAt(0) || '?'}
                </div>
                {isToday && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{otherName}</h3>
                  {requestedByEmployee && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">You requested</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{otherRole}</p>

                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Calendar className="w-3.5 h-3.5" />
                    {meetingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-3.5 h-3.5" />
                    {formatMeetingTime(meeting.scheduledTime)} • {meeting.duration}min
                  </span>
                </div>

                {meeting.topic && (
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                    💬 {meeting.topic}
                  </p>
                )}

                {meeting.prepNotes && (
                  <div className="mt-2 bg-yellow-50 rounded-lg px-3 py-2 border border-yellow-100">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">📝 Prep Notes</p>
                    <p className="text-sm text-yellow-800">{meeting.prepNotes}</p>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-end gap-2">
                {isToday && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Today</span>}
                {isTomorrow && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Tomorrow</span>}
                {isPast && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">Overdue</span>}

                <button
                  onClick={() => onPrep(meeting)}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Prep
                </button>
                <button
                  onClick={() => onStartMeeting(meeting)}
                  className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-purple-700"
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ==================== HISTORY VIEW ====================

function HistoryView({ meetings, currentUser, people, onSelect }) {
  if (meetings.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Completed 1:1s Yet</h3>
        <p className="text-sm">Completed meetings will appear here with notes and action items.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {meetings.map(meeting => {
        const personId = meeting.personId || meeting.employeeId
        const personName = meeting.personName || meeting.employeeName
        const managerId = meeting.managerId
        const managerName = meeting.managerName

        const isPerson = personId === currentUser?.id
        const isManager = managerId === currentUser?.id

        let otherPerson, otherName
        if (isPerson) {
          otherPerson = people.find(p => p.id === managerId)
          otherName = otherPerson?.name || managerName || 'Unknown'
        } else if (isManager) {
          otherPerson = people.find(p => p.id === personId)
          otherName = otherPerson?.name || personName || 'Unknown'
        } else {
          otherPerson = people.find(p => p.id === managerId) || people.find(p => p.id === personId)
          otherName = otherPerson?.name || managerName || personName || 'Unknown'
        }

        const wellbeingColor =
          meeting.wellbeingScore <= 3 ? 'text-red-600 bg-red-50' :
          meeting.wellbeingScore <= 6 ? 'text-yellow-600 bg-yellow-50' :
          'text-green-600 bg-green-50'

        return (
          <div
            key={meeting.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md cursor-pointer transition-all"
            onClick={() => onSelect(meeting)}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-sm font-bold">
              {otherName?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{otherName}</p>
              <p className="text-xs text-gray-500">
                {new Date(meeting.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {meeting.topic ? ` • ${meeting.topic}` : ''}
              </p>
            </div>
            {meeting.wellbeingScore && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${wellbeingColor}`}>
                Wellbeing: {meeting.wellbeingScore}/10
              </span>
            )}
            {meeting.decisions && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">Has notes</span>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        )
      })}
    </div>
  )
}

// ==================== REQUEST MEETING MODAL ====================

function RequestMeetingModal({ onClose, onSubmit, currentUser, people }) {
  const [formData, setFormData] = useState({
    withPerson: '',
    date: '',
    time: '10:00',
    duration: '30',
    type: 'regular',
    topic: '',
    prepNotes: '',
    topics: []
  })
  const [topicInput, setTopicInput] = useState('')

  const filteredPeople = people.filter(p => p.id !== currentUser?.id)

  const addTopic = () => {
    if (topicInput.trim()) {
      setFormData(prev => ({ ...prev, topics: [...prev.topics, topicInput.trim()] }))
      setTopicInput('')
    }
  }

  const removeTopic = (idx) => {
    setFormData(prev => ({ ...prev, topics: prev.topics.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Request a 1:1</h3>
            <p className="text-sm text-gray-500">Schedule a conversation with your team</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting with *</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={formData.withPerson}
              onChange={(e) => setFormData(prev => ({ ...prev, withPerson: e.target.value }))}
              required
            >
              <option value="">Select person</option>
              {filteredPeople.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What would you like to discuss?</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g., Sprint review, Career growth, Blockers..."
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prep Notes</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows="3"
              placeholder="Anything you want to prepare or share before the meeting..."
              value={formData.prepNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, prepNotes: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agenda Items</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Add a topic to discuss..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
              />
              <button
                type="button"
                onClick={addTopic}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {formData.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.topics.map((topic, idx) => (
                  <span key={idx} className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                    <Target className="w-3 h-3" />
                    {topic}
                    <button onClick={() => removeTopic(idx)} className="text-purple-400 hover:text-purple-600">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
              <Send className="w-4 h-4" /> Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ==================== PREP MODAL ====================

function PrepModal({ meeting, onClose, onSave }) {
  const [prepNotes, setPrepNotes] = useState(meeting.prepNotes || '')
  const [topics, setTopics] = useState(meeting.topicsToDiscuss || meeting.topics || [])
  const [topicInput, setTopicInput] = useState('')

  const addTopic = () => {
    if (topicInput.trim()) {
      setTopics(prev => [...prev, topicInput.trim()])
      setTopicInput('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Meeting Prep</h3>
            <p className="text-sm text-gray-500">Prepare your talking points before the meeting</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What do you want to discuss?</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows="4"
              placeholder="Write your talking points, questions, or updates you want to share..."
              value={prepNotes}
              onChange={(e) => setPrepNotes(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agenda Items</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Add agenda item..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
              />
              <button
                type="button"
                onClick={addTopic}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {topics.length > 0 && (
              <div className="mt-2 space-y-1">
                {topics.map((topic, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-purple-500">•</span>
                    <span className="flex-1">{topic}</span>
                    <button onClick={() => setTopics(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => onSave({ prepNotes, topicsToDiscuss: topics })}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Prep Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== MEETING DETAIL MODAL ====================

function MeetingDetailModal({ meeting, onClose, onComplete, currentUser, people }) {
  const [outcomes, setOutcomes] = useState({
    shippingUpdate: meeting.shippingUpdate || '',
    growthFeedback: meeting.growthFeedback || '',
    wellbeingScore: meeting.wellbeingScore || 5,
    wellbeingNotes: meeting.wellbeingNotes || '',
    blockers: meeting.blockers || '',
    blockerHelp: meeting.blockerHelp || '',
    decisions: meeting.decisions || '',
    actionItems: meeting.actionItems || '',
    notes: meeting.notes || '',
    nextMeetingDate: meeting.nextMeetingDate || ''
  })

  const personId = meeting.personId || meeting.employeeId
  const personName = meeting.personName || meeting.employeeName
  const managerId = meeting.managerId
  const managerName = meeting.managerName

  const isPerson = personId === currentUser?.id
  const isManager = managerId === currentUser?.id

  let otherPerson, otherName
  if (isPerson) {
    otherPerson = people.find(p => p.id === managerId)
    otherName = otherPerson?.name || managerName || 'Unknown'
  } else if (isManager) {
    otherPerson = people.find(p => p.id === personId)
    otherName = otherPerson?.name || personName || 'Unknown'
  } else {
    otherPerson = people.find(p => p.id === managerId) || people.find(p => p.id === personId)
    otherName = otherPerson?.name || managerName || personName || 'Unknown'
  }

  const handleSave = async () => {
    await onComplete(meeting.id, outcomes)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">1:1 with {otherName}</h3>
            <p className="text-sm text-gray-500">
              {new Date(meeting.scheduledDate).toLocaleDateString()} at {formatMeetingTime(meeting.scheduledTime)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Prep Notes */}
          {(meeting.prepNotes || meeting.topicsToDiscuss?.length > 0) && (
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                <FileText className="w-4 h-4" /> Meeting Prep
              </h4>
              {meeting.prepNotes && <p className="text-sm text-yellow-700">{meeting.prepNotes}</p>}
              {meeting.topicsToDiscuss?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {meeting.topicsToDiscuss.map((t, i) => (
                    <span key={i} className="inline-block text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mr-1">• {t}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wellbeing */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-1">
              <Heart className="w-4 h-4" /> Wellbeing Check
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-green-700 font-medium">Score: {outcomes.wellbeingScore}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={outcomes.wellbeingScore}
                  onChange={(e) => setOutcomes(prev => ({ ...prev, wellbeingScore: Number(e.target.value) }))}
                  className="w-full accent-green-600"
                />
                <div className="flex justify-between text-xs text-green-600">
                  <span>Struggling</span>
                  <span>Thriving</span>
                </div>
              </div>
              <textarea
                className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm bg-white"
                rows="2"
                placeholder="How are you feeling? Anything on your mind?"
                value={outcomes.wellbeingNotes}
                onChange={(e) => setOutcomes(prev => ({ ...prev, wellbeingNotes: e.target.value }))}
              />
            </div>
          </div>

          {/* Discussion Areas */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What did you ship this week?</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows="2"
                placeholder="Progress, completed work, demos..."
                value={outcomes.shippingUpdate}
                onChange={(e) => setOutcomes(prev => ({ ...prev, shippingUpdate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Growth & Learning</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows="2"
                placeholder="What did you learn? What do you want to learn next?"
                value={outcomes.growthFeedback}
                onChange={(e) => setOutcomes(prev => ({ ...prev, growthFeedback: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blockers & Support Needed</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows="2"
                placeholder="What's blocking you? How can your lead help?"
                value={outcomes.blockers}
                onChange={(e) => setOutcomes(prev => ({ ...prev, blockers: e.target.value }))}
              />
            </div>
          </div>

          {/* Outcomes */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700">Meeting Outcomes</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Decisions</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows="2"
                placeholder="What was decided?"
                value={outcomes.decisions}
                onChange={(e) => setOutcomes(prev => ({ ...prev, decisions: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Items</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows="2"
                placeholder="Follow-ups and next steps..."
                value={outcomes.actionItems}
                onChange={(e) => setOutcomes(prev => ({ ...prev, actionItems: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Meeting</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={outcomes.nextMeetingDate}
                  onChange={(e) => setOutcomes(prev => ({ ...prev, nextMeetingDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Any other notes..."
                  value={outcomes.notes}
                  onChange={(e) => setOutcomes(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Complete & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
