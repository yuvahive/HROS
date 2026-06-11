import React, { useState, useEffect, useContext } from 'react'
import {
  Heart, AlertTriangle, Clock, Users, TrendingUp,
  MessageSquare, CheckCircle, X, ArrowRight, Sparkles
} from 'lucide-react'
import { getAllFromDB, updateInDB, addToDB, STORES } from '../utils/indexedDB'
import { AuthContext } from '../context/AuthContext'
import { generateID } from '../utils/sampleData'
import KanbanBoard from './KanbanBoard'

export default function WellnessBoard() {
  const { currentUser, filterByTeam } = useContext(AuthContext)
  const [people, setPeople] = useState([])
  const [workLogs, setWorkLogs] = useState([])
  const [checkIns, setCheckIns] = useState([])
  const [oneOnOnes, setOneOnOnes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [careActionOpen, setCareActionOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [peopleDataRaw, workLogsData, checkInsData, meetingsData] = await Promise.all([
        getAllFromDB(STORES.people),
        getAllFromDB(STORES.workLogs),
        getAllFromDB(STORES.checkIns),
        getAllFromDB(STORES.oneOnOnes)
      ])
      const peopleData = filterByTeam(peopleDataRaw)
      setPeople(peopleData)
      setWorkLogs(workLogsData)
      setCheckIns(checkInsData)
      setOneOnOnes(meetingsData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading wellness data:', error)
      setLoading(false)
    }
  }

  const getWellnessSignals = (person) => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

    const recentWork = workLogs.filter(w =>
      (w.personId === person.id || w.personName === person.name) && w.date >= weekAgo
    )

    const recentMeetings = oneOnOnes.filter(m =>
      (m.personId === person.id || m.managerId === person.id) && m.status === 'completed'
    ).sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))

    const signals = []
    let score = 100

    const totalHoursWeek = recentWork.reduce((sum, w) => sum + (w.hoursWorked || 0), 0)
    const avgHoursDay = recentWork.length > 0 ? totalHoursWeek / Math.min(recentWork.length, 5) : 0

    if (avgHoursDay > 9) {
      signals.push({ type: 'burnout-risk', label: 'Working long hours', detail: `Avg ${avgHoursDay.toFixed(1)}h/day this week`, severity: 'high' })
      score -= 25
    } else if (avgHoursDay > 7) {
      signals.push({ type: 'overtime', label: 'Above average hours', detail: `Avg ${avgHoursDay.toFixed(1)}h/day`, severity: 'medium' })
      score -= 10
    }

    const blockedCount = recentWork.filter(w => w.status === 'blocked').length
    if (blockedCount > 0) {
      signals.push({ type: 'blocked', label: 'Has active blockers', detail: `${blockedCount} blocked item${blockedCount > 1 ? 's' : ''}`, severity: 'high' })
      score -= 20
    }

    const workDays = new Set(recentWork.map(w => w.date)).size
    if (workDays >= 6) {
      signals.push({ type: 'no-break', label: 'No days off this week', detail: `Worked ${workDays} days straight`, severity: 'medium' })
      score -= 15
    }

    const daysSinceCheckIn = person.lastCheckInDate
      ? Math.floor((Date.now() - new Date(person.lastCheckInDate)) / (1000 * 60 * 60 * 24))
      : 999

    if (daysSinceCheckIn > 30) {
      signals.push({ type: 'no-checkin', label: 'Overdue for check-in', detail: `${daysSinceCheckIn} days since last check-in`, severity: 'high' })
      score -= 20
    } else if (daysSinceCheckIn > 20) {
      signals.push({ type: 'checkin-due', label: 'Check-in due soon', detail: `${daysSinceCheckIn} days since last check-in`, severity: 'low' })
      score -= 5
    }

    const recentMoods = recentWork.filter(w => w.mood).map(w => w.mood)
    const negativeMoods = recentMoods.filter(m => m === '😤' || m === '😰')
    if (negativeMoods.length >= 2) {
      signals.push({ type: 'mood', label: 'Mood trending down', detail: `${negativeMoods.length} stressed days this week`, severity: 'medium' })
      score -= 15
    }

    let level = 'thriving'
    if (score < 50) level = 'needs-support'
    else if (score < 75) level = 'check-in-recommended'

    return {
      signals,
      score: Math.max(0, score),
      level,
      stats: {
        hoursThisWeek: totalHoursWeek,
        tasksCompleted: recentWork.filter(w => w.status === 'done').length,
        blockedItems: blockedCount,
        daysWorked: workDays,
        daysSinceCheckIn,
        lastMeeting: recentMeetings[0]?.scheduledDate || null
      }
    }
  }

  const wellnessData = people
    .filter(p => p.status === 'active')
    .map(p => ({
      person: p,
      ...getWellnessSignals(p)
    }))

  const getKanbanData = () => {
    const grouped = { 'needs-support': [], 'check-in-recommended': [], thriving: [] }
    wellnessData.forEach((item) => {
      grouped[item.level].push({
        id: item.person.id,
        title: item.person.name,
        subtitle: `${item.person.role} • ${item.person.team}`,
        details: [
          `${item.score}/100 wellness`,
          `${item.stats.hoursThisWeek}h this week`,
          `${item.stats.daysSinceCheckIn}d since check-in`
        ],
        tags: item.signals.slice(0, 2).map(s => s.label),
        status: item.level,
        data: item
      })
    })
    return grouped
  }

  const handleDragEnd = async ({ card, targetColumn }) => {
    if (card.status === targetColumn) return
    const person = card.data.person
    await updateInDB(STORES.people, { ...person, wellnessLevel: targetColumn })
    await loadData()
  }

  const handleCardDelete = () => {}
  const handleAddCard = () => {}

  const handleCardClick = (card) => {
    setSelectedPerson(card.data)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Analyzing team wellness...</p>
        </div>
      </div>
    )
  }

  const kanbanData = getKanbanData()
  const stages = [
    { id: 'needs-support', title: 'Needs Support', icon: '⚠️', color: 'red' },
    { id: 'check-in-recommended', title: 'Check-in Recommended', icon: '🔔', color: 'yellow' },
    { id: 'thriving', title: 'Thriving', icon: '✨', color: 'green' }
  ]

  const boardColumns = stages.map((stage) => ({
    id: stage.id,
    title: stage.title,
    icon: stage.icon,
    color: stage.color,
    cards: kanbanData[stage.id]
  }))

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-green-50/20">
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-green-600" />
            <div>
              <h1 className="text-xl font-black text-gray-900">Team Wellness</h1>
              <p className="text-sm text-gray-500 mt-0.5">Supporting your team's wellbeing and growth</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            {stages.map((stage) => (
              <div key={stage.id} className="text-right">
                <div className={`font-bold ${stage.id === 'needs-support' ? 'text-red-600' : stage.id === 'check-in-recommended' ? 'text-yellow-600' : 'text-green-600'}`}>
                  {kanbanData[stage.id].length}
                </div>
                <p className="text-xs text-gray-500">{stage.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={boardColumns}
          onCardClick={handleCardClick}
          onCardDelete={handleCardDelete}
          onAddCard={handleAddCard}
          onDragEnd={handleDragEnd}
          cardContentRenderer={(card) => {
            const { person, signals, score, stats } = card.data
            const scoreColor = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'
            const scoreBg = score >= 75 ? 'bg-green-100' : score >= 50 ? 'bg-yellow-100' : 'bg-red-100'
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                    {person.name?.charAt(0)}
                  </div>
                  <div className={`w-10 h-10 rounded-full ${scoreBg} flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-xs font-black ${scoreColor}`}>{score}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-sm text-gray-900">{card.title}</h4>
                <p className="text-xs text-gray-600">{card.subtitle}</p>
                <div className="flex flex-wrap gap-1">
                  {signals.slice(0, 2).map((signal, idx) => (
                    <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      signal.severity === 'high' ? 'bg-red-100 text-red-700' :
                      signal.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {signal.label}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 text-[10px] text-gray-500">
                  <span>{stats.hoursThisWeek}h/week</span>
                  <span>{stats.tasksCompleted} tasks</span>
                  <span>{stats.daysSinceCheckIn}d check-in</span>
                </div>
              </div>
            )
          }}
        />
      </div>

      {selectedPerson && (
        <WellnessDetailPanel
          data={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onCareAction={(person) => { setSelectedPerson(person); setCareActionOpen(true) }}
        />
      )}

      {careActionOpen && selectedPerson && (
        <CareActionModal
          person={selectedPerson.person}
          onClose={() => { setCareActionOpen(false); setSelectedPerson(null) }}
          onComplete={() => { setCareActionOpen(false); setSelectedPerson(null) }}
        />
      )}
    </div>
  )
}

// ==================== WELLNESS DETAIL PANEL ====================

function WellnessDetailPanel({ data, onClose, onCareAction }) {
  const { person, signals, score, stats } = data

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Wellness View</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Profile */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold mx-auto">
            {person.name?.charAt(0)}
          </div>
          <h2 className="text-lg font-black text-gray-900 mt-2">{person.name}</h2>
          <p className="text-sm text-gray-500">{person.role} • {person.team}</p>
        </div>

        {/* Wellness Score */}
        <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Wellness Score</p>
          <p className={`text-4xl font-black mt-1 ${
            score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'
          }`}>{score}</p>
          <p className="text-sm text-gray-600 mt-1">
            {score >= 75 ? 'Thriving — Keep it up!' : score >= 50 ? 'Check-in recommended' : 'Needs extra support'}
          </p>
        </div>

        {/* Signals */}
        {signals.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Signals Detected</h4>
            <div className="space-y-2">
              {signals.map((signal, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${
                  signal.severity === 'high' ? 'bg-red-50 border-red-100' :
                  signal.severity === 'medium' ? 'bg-yellow-50 border-yellow-100' :
                  'bg-gray-50 border-gray-100'
                }`}>
                  <p className={`text-sm font-medium ${
                    signal.severity === 'high' ? 'text-red-700' :
                    signal.severity === 'medium' ? 'text-yellow-700' :
                    'text-gray-700'
                  }`}>{signal.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{signal.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-black text-gray-900">{stats.hoursThisWeek}</p>
            <p className="text-xs text-gray-500">Hours this week</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-black text-gray-900">{stats.tasksCompleted}</p>
            <p className="text-xs text-gray-500">Tasks completed</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-black text-gray-900">{stats.daysWorked}</p>
            <p className="text-xs text-gray-500">Days worked</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-black text-gray-900">{stats.daysSinceCheckIn}</p>
            <p className="text-xs text-gray-500">Days since check-in</p>
          </div>
        </div>

        {/* Suggested Actions */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Suggested Actions</h4>
          <div className="space-y-2">
            {score < 75 && (
              <button
                onClick={() => onCareAction(data)}
                className="w-full text-left p-3 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors"
              >
                <p className="text-sm font-medium text-purple-700">📅 Schedule a check-in 1:1</p>
                <p className="text-xs text-purple-500">Have a quick conversation about how they're doing</p>
              </button>
            )}
            {signals.some(s => s.type === 'no-break') && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-700">🏖️ Suggest time off</p>
                <p className="text-xs text-blue-500">They've been working without a break</p>
              </div>
            )}
            {signals.some(s => s.type === 'blocked') && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm font-medium text-orange-700">🚧 Help remove blockers</p>
                <p className="text-xs text-orange-500">They have items blocking their progress</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== CARE ACTION MODAL ====================

function CareActionModal({ person, onClose, onComplete }) {
  const [action, setAction] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Create a 1:1 meeting request
    const meeting = {
      id: generateID('1o1'),
      personId: person.id,
      personName: person.name,
      managerId: person.manager || '',
      managerName: '',
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduledTime: '10:00',
      duration: 30,
      meetingType: 'checkin',
      status: 'scheduled',
      requestedBy: 'wellness-alert',
      prepNotes: `Wellness check-in: ${notes || action}`,
      topic: 'Wellness Check-in',
      wellbeingScore: 5,
      createdAt: new Date().toISOString()
    }
    await addToDB(STORES.oneOnOnes, meeting)
    alert(`Check-in scheduled with ${person.name}!`)
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Care Action</h3>
            <p className="text-sm text-gray-500">How would you like to support {person.name}?</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            {[
              { id: 'checkin', label: '📅 Schedule a check-in 1:1', desc: 'Quick conversation about how they\'re doing' },
              { id: 'timeoff', label: '🏖️ Suggest taking time off', desc: 'They\'ve been working hard, suggest a break' },
              { id: 'blocker', label: '🚧 Help remove blockers', desc: 'Ask what\'s blocking them and offer help' },
              { id: 'appreciate', label: '🎉 Send appreciation', desc: 'Recognize their hard work publicly' }
            ].map(opt => (
              <label
                key={opt.id}
                className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                  action === opt.id ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  value={opt.id}
                  checked={action === opt.id}
                  onChange={(e) => setAction(e.target.value)}
                  className="sr-only"
                />
                <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows="2"
              placeholder="Any specific notes or context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              type="submit"
              disabled={!action}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Take Action
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
