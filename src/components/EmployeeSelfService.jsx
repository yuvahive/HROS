import React, { useState, useEffect, useContext } from 'react'
import {
  User, Mail, Phone, MapPin, Briefcase, Calendar, Star,
  Edit2, Save, X, Clock, CheckCircle, Award, BookOpen,
  Coffee, ArrowRight, FileText, Settings
} from 'lucide-react'
import { getAllFromDB, updateInDB, addToDB, STORES } from '../utils/indexedDB'
import { AuthContext } from '../context/AuthContext'
import { generateID } from '../utils/sampleData'

export default function EmployeeSelfService() {
  const { currentUser } = useContext(AuthContext)
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({})
  const [myWork, setMyWork] = useState([])
  const [myMeetings, setMyMeetings] = useState([])
  const [myTimeOff, setMyTimeOff] = useState([])
  const [requests, setRequests] = useState([])

  useEffect(() => {
    loadMyProfile()
  }, [currentUser])

  const loadMyProfile = async () => {
    try {
      const [people, workLogs, meetings, timeOff] = await Promise.all([
        getAllFromDB(STORES.people),
        getAllFromDB(STORES.workLogs),
        getAllFromDB(STORES.oneOnOnes),
        getAllFromDB(STORES.timeOff)
      ])

      let myPerson = people.find(p => p.id === currentUser?.id || p.name === currentUser?.name)

      // If no person record exists, create one from auth user data
      if (!myPerson && currentUser) {
        myPerson = {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          team: '',
          startDate: '',
          seniority: '',
          skills: [],
          notes: '',
          createdAt: currentUser.loginTime || new Date().toISOString(),
          isActive: true
        }
        await addToDB(STORES.people, myPerson)
      }

      if (myPerson) {
        setPerson(myPerson)
        setFormData(myPerson)
      }

      setMyWork(
        workLogs
          .filter(w => w.personId === currentUser?.id || w.personName === currentUser?.name)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      )

      setMyMeetings(
        meetings
          .filter(m => m.personId === currentUser?.id || m.managerId === currentUser?.id)
          .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))
      )

      setMyTimeOff(
        timeOff
          .filter(t => t.personId === currentUser?.id)
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      )

      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (person) {
      await updateInDB(STORES.people, { ...formData, id: person.id })
      // Track skills changes
      const oldSkills = JSON.stringify(person.skills || [])
      const newSkills = JSON.stringify(formData.skills || [])
      if (oldSkills !== newSkills) {
        await addToDB(STORES.skills, {
          id: generateID('skill'),
          personId: person.id,
          personName: person.name,
          skills: formData.skills || [],
          previousSkills: person.skills || [],
          changedBy: currentUser?.id,
          changedAt: new Date().toISOString()
        })
      }
      // Track compensation changes (only if user is admin/HR)
      if ((formData.salary !== person.salary || formData.equity !== person.equity) && ['admin', 'HR'].includes(currentUser?.role)) {
        await addToDB(STORES.compensationHistory, {
          id: generateID('comp'),
          personId: person.id,
          personName: person.name,
          previousSalary: person.salary,
          newSalary: formData.salary,
          previousEquity: person.equity,
          newEquity: formData.equity,
          effectiveDate: new Date().toISOString(),
          changedBy: currentUser?.id
        })
      }
      setPerson({ ...person, ...formData })
      setEditMode(false)
    }
  }

  const handleMarkOOO = async (startDate, endDate, type, reason) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

    const timeOff = {
      id: generateID('timeoff'),
      personId: currentUser?.id,
      personName: currentUser?.name,
      startDate,
      endDate,
      days,
      type,
      status: 'planned',
      reason,
      createdAt: new Date().toISOString()
    }
    await addToDB(STORES.timeOff, timeOff)
    await loadMyProfile()
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'work', label: 'My Work', icon: Briefcase },
    { id: 'meetings', label: 'My Meetings', icon: Calendar },
    { id: 'timeoff', label: 'Time Off', icon: Coffee },
    { id: 'settings', label: 'Preferences', icon: Settings }
  ]

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/20">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {person?.name?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">{person?.name || currentUser?.name}</h1>
              <p className="text-sm text-gray-500">{person?.role} • {person?.team}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditMode(false); setFormData(person) }}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-gray-100 rounded-lg p-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'profile' && (
          <ProfileTab person={person} formData={formData} setFormData={setFormData} editMode={editMode} currentUserRole={currentUser?.role} />
        )}
        {activeTab === 'work' && (
          <WorkTab work={myWork} />
        )}
        {activeTab === 'meetings' && (
          <MeetingsTab meetings={myMeetings} />
        )}
        {activeTab === 'timeoff' && (
          <TimeOffTab timeOff={myTimeOff} onMarkOOO={handleMarkOOO} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab person={person} />
        )}
      </div>
    </div>
  )
}

// ==================== PROFILE TAB ====================

function ProfileTab({ person, formData, setFormData, editMode, currentUserRole }) {
  const isCompensationEditable = ['admin', 'HR'].includes(currentUserRole)
  return (
    <div className="max-w-2xl space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" /> Basic Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <FieldRow label="Full Name" field="name" value={formData.name} editMode={editMode} onChange={setFormData} />
          <FieldRow label="Email" field="email" value={formData.email} editMode={editMode} onChange={setFormData} />
          <FieldRow label="Role" field="role" value={formData.role} editMode={editMode} onChange={setFormData} />
          <FieldRow label="Team" field="team" value={formData.team} editMode={editMode} onChange={setFormData} />
          <FieldRow label="Start Date" field="startDate" value={formData.startDate} editMode={editMode} onChange={setFormData} type="date" />
          <FieldRow label="Seniority" field="seniority" value={formData.seniority} editMode={editMode} onChange={setFormData} type="select" options={['junior', 'mid', 'senior', 'lead']} />
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" /> Skills & Expertise
        </h3>
        {person?.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {person.skills.map((skill, idx) => (
              <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No skills added yet</p>
        )}
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" /> About
        </h3>
        {editMode ? (
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            rows="3"
            placeholder="Tell us about yourself..."
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          />
        ) : (
          <p className="text-sm text-gray-700">{person?.notes || 'No bio added yet'}</p>
        )}
      </div>
    </div>
  )
}

function FieldRow({ label, field, value, editMode, onChange, type = 'text', options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {editMode ? (
        type === 'select' ? (
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={value || ''}
            onChange={(e) => onChange(prev => ({ ...prev, [field]: e.target.value }))}
          >
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={value || ''}
            onChange={(e) => onChange(prev => ({ ...prev, [field]: e.target.value }))}
          />
        )
      ) : (
        <p className="text-sm text-gray-900 font-medium">{value || '—'}</p>
      )}
    </div>
  )
}

// ==================== WORK TAB ====================

function WorkTab({ work }) {
  const today = new Date().toISOString().split('T')[0]
  const todayWork = work.filter(w => w.date === today)
  const recentWork = work.filter(w => w.date !== today).slice(0, 10)

  return (
    <div className="max-w-2xl space-y-6">
      {/* Today's Work */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" /> Today's Work
        </h3>
        {todayWork.length === 0 ? (
          <p className="text-sm text-gray-400">No work logged today yet</p>
        ) : (
          <div className="space-y-2">
            {todayWork.map((w, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span>{w.status === 'done' ? '✅' : w.status === 'blocked' ? '🛑' : '🔨'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{w.taskName}</p>
                  <p className="text-xs text-gray-500">{w.hoursWorked}h logged</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  w.status === 'done' ? 'bg-green-100 text-green-700' :
                  w.status === 'blocked' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{w.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Work */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" /> Recent History
        </h3>
        {recentWork.length === 0 ? (
          <p className="text-sm text-gray-400">No work history yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentWork.map((w, idx) => (
              <div key={idx} className="py-3 flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16">{w.date}</span>
                <span>{w.status === 'done' ? '✅' : '🔨'}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{w.taskName}</p>
                </div>
                <span className="text-xs text-gray-400">{w.hoursWorked}h</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-black text-blue-600">{work.length}</p>
          <p className="text-xs text-gray-500">Total Entries</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-black text-green-600">{work.filter(w => w.status === 'done').length}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-black text-orange-600">{work.reduce((sum, w) => sum + (w.hoursWorked || 0), 0)}h</p>
          <p className="text-xs text-gray-500">Total Hours</p>
        </div>
      </div>
    </div>
  )
}

// ==================== MEETINGS TAB ====================

function MeetingsTab({ meetings }) {
  const upcoming = meetings.filter(m => m.status === 'scheduled')
  const history = meetings.filter(m => m.status === 'completed')

  return (
    <div className="max-w-2xl space-y-6">
      {/* Upcoming */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" /> Upcoming 1:1s
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">No upcoming meetings</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((m, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <Calendar className="w-5 h-5 text-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    1:1 with {m.managerId ? 'my lead' : m.personName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(m.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {(m.scheduledTime && m.scheduledTime.includes('T') ? new Date(m.scheduledTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : m.scheduledTime) || 'TBD'} • {m.duration}min
                  </p>
                </div>
                {m.topic && <span className="text-xs bg-white px-2 py-1 rounded-full text-purple-700">{m.topic}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" /> Past Meetings
        </h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">No completed meetings yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {history.slice(0, 10).map((m, idx) => (
              <div key={idx} className="py-3 flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">1:1 on {new Date(m.scheduledDate).toLocaleDateString()}</p>
                  {m.decisions && <p className="text-xs text-gray-500 mt-0.5">Decisions: {m.decisions}</p>}
                </div>
                {m.wellbeingScore && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.wellbeingScore >= 7 ? 'bg-green-100 text-green-700' :
                    m.wellbeingScore >= 4 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Wellbeing: {m.wellbeingScore}/10
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== TIME OFF TAB ====================

function TimeOffTab({ timeOff, onMarkOOO }) {
  const [requestOpen, setRequestOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [type, setType] = useState('vacation')
  const [reason, setReason] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (startDate && endDate) {
      onMarkOOO(startDate, endDate, type, reason)
      setRequestOpen(false)
      setStartDate('')
      setEndDate('')
      setReason('')
    }
  }

  const approved = timeOff.filter(t => t.status === 'approved' || t.status === 'on-leave')
  const planned = timeOff.filter(t => t.status === 'planned')

  const totalDaysUsed = approved.reduce((sum, t) => sum + (t.days || 0), 0)
  const daysAllowed = 20

  return (
    <div className="max-w-2xl space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-black text-green-600">{daysAllowed - totalDaysUsed}</p>
          <p className="text-xs text-gray-500">Days Remaining</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-black text-blue-600">{totalDaysUsed}</p>
          <p className="text-xs text-gray-500">Days Used</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-black text-orange-600">{planned.length}</p>
          <p className="text-xs text-gray-500">Pending Requests</p>
        </div>
      </div>

      {/* Request Button */}
      <button
        onClick={() => setRequestOpen(true)}
        className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3 text-left"
      >
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <Coffee className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Request Time Off</p>
          <p className="text-sm text-gray-500">Submit a new time off request</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
      </button>

      {/* Planned */}
      {planned.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Pending Requests</h3>
          <div className="space-y-2">
            {planned.map((t, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <Clock className="w-4 h-4 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {t.days} day{t.days > 1 ? 's' : ''} — {t.type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t.startDate} to {t.endDate}
                  </p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {approved.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Approved Time Off</h3>
          <div className="divide-y divide-gray-50">
            {approved.map((t, idx) => (
              <div key={idx} className="py-3 flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{t.days} day{t.days > 1 ? 's' : ''} — {t.type}</p>
                  <p className="text-xs text-gray-500">{t.startDate} to {t.endDate}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Approved</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {requestOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Request Time Off</h3>
              <button onClick={() => setRequestOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal</option>
                  <option value="focus-week">Focus Week</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows="2" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Brief reason..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setRequestOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== SETTINGS TAB ====================

function SettingsTab({ person }) {
  const [notifications, setNotifications] = useState(true)
  const [emailDigest, setEmailDigest] = useState('weekly')

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" /> Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Browser Notifications</p>
              <p className="text-xs text-gray-500">Get reminded before meetings</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Digest</p>
              <p className="text-xs text-gray-500">How often to receive email summaries</p>
            </div>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={emailDigest}
              onChange={(e) => setEmailDigest(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Data
        </h3>
        <div className="space-y-2">
          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
            📥 Export My Data
          </button>
          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
            📋 View My Activity Log
          </button>
        </div>
      </div>
    </div>
  )
}
