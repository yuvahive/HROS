import React, { useState, useEffect } from 'react'
import { Zap, CheckCircle2, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react'
import { getAllFromDB, updateInDB, deleteFromDB, addToDB, STORES } from '../utils/indexedDB'
import { generateID } from '../utils/sampleData'

export default function OnboardingBoard() {
  const [onboardingRecords, setOnboardingRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

  const milestones = [
    { day: 1, title: 'Day 1: Onboarding', tasks: ['Office tour', 'IT setup', 'Team intro', 'Send welcome email'] },
    { day: 7, title: 'Week 1: Getting Started', tasks: ['First week feedback', 'System access', 'Role clarity', 'Mentor assigned'] },
    { day: 14, title: 'Week 2: Ramping Up', tasks: ['First project assigned', 'Code/process review', 'Team sync', 'Initial feedback'] },
    { day: 30, title: 'Day 30: 30-Day Review', tasks: ['Performance review', 'Feedback session', 'Culture fit assess', 'Confirm hire'] }
  ]

  // Load onboarding records
  useEffect(() => {
    loadOnboardingData()
  }, [])

  const loadOnboardingData = async () => {
    try {
      const records = await getAllFromDB(STORES.onboarding)
      setOnboardingRecords(records)
      setLoading(false)
    } catch (error) {
      console.error('Error loading onboarding data:', error)
      setLoading(false)
    }
  }

  const handleAddNewHire = () => {
    setSelectedRecord(null)
    setFormOpen(true)
  }

  const handleEditRecord = (record) => {
    setSelectedRecord(record)
    setFormOpen(true)
  }

  const handleDeleteRecord = async (id) => {
    try {
      await deleteFromDB(STORES.onboarding, id)
      await loadOnboardingData()
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  const handleSaveRecord = async (formData) => {
    try {
      if (selectedRecord?.id) {
        await updateInDB(STORES.onboarding, formData)
      } else {
        await addToDB(STORES.onboarding, formData)
      }
      await loadOnboardingData()
      setFormOpen(false)
    } catch (error) {
      console.error('Error saving record:', error)
    }
  }

  const getProgressPercentage = (record) => {
    if (!record.milestoneStatus) return 0
    const completed = Object.values(record.milestoneStatus).filter((s) => s === true).length
    return Math.round((completed / Object.keys(record.milestoneStatus).length) * 100)
  }

  const getDaysElapsed = (startDate) => {
    const start = new Date(startDate)
    const now = new Date()
    return Math.floor((now - start) / (1000 * 60 * 60 * 24))
  }

  const getStatus = (record) => {
    const daysElapsed = getDaysElapsed(record.startDate)
    if (daysElapsed >= 30) {
      return record.completionStatus === 'confirmed' ? 'completed' : 'review'
    } else if (daysElapsed >= 14) {
      return 'ramping'
    } else if (daysElapsed >= 7) {
      return 'started'
    }
    return 'new'
  }

  if (loading) {
    return <div className="p-8 text-center">Loading onboarding records...</div>
  }

  const statusColors = {
    new: 'bg-blue-50 border-blue-200',
    started: 'bg-yellow-50 border-yellow-200',
    ramping: 'bg-purple-50 border-purple-200',
    review: 'bg-orange-50 border-orange-200',
    completed: 'bg-green-50 border-green-200'
  }

  const statusIcons = {
    new: '🆕',
    started: '🚀',
    ramping: '📈',
    review: '👀',
    completed: '✨'
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-8 h-8 text-yellow-600" />
              Onboarding Progress
            </h1>
            <p className="text-gray-600 mt-1">Track new hire 30-day progress and milestones</p>
          </div>
          <button
            onClick={handleAddNewHire}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Hire
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {onboardingRecords.filter((r) => getStatus(r) === 'new').length}
            </div>
            <p className="text-xs text-gray-600">New Hires</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {onboardingRecords.filter((r) => getStatus(r) === 'started').length}
            </div>
            <p className="text-xs text-gray-600">Getting Started</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {onboardingRecords.filter((r) => getStatus(r) === 'ramping').length}
            </div>
            <p className="text-xs text-gray-600">Ramping Up</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {onboardingRecords.filter((r) => getStatus(r) === 'completed').length}
            </div>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
        </div>
      </div>

      {/* Records Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {onboardingRecords.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No onboarding records yet</p>
            <button
              onClick={handleAddNewHire}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add First Hire
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl">
            {onboardingRecords.map((record) => {
              const daysElapsed = getDaysElapsed(record.startDate)
              const status = getStatus(record)
              const progress = getProgressPercentage(record)
              const isOverdue = daysElapsed > 30 && record.completionStatus !== 'confirmed'

              return (
                <div
                  key={record.id}
                  className={`border rounded-lg p-4 ${statusColors[status]} ${isOverdue ? 'ring-2 ring-red-500' : ''}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                        {statusIcons[status]} {record.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">{record.role}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Timeline Info */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div>
                      <p className="text-gray-600">Start Date</p>
                      <p className="font-semibold text-gray-900">{new Date(record.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Days Elapsed</p>
                      <p className={`font-semibold ${daysElapsed > 30 ? 'text-red-600' : 'text-gray-900'}`}>
                        {daysElapsed}/30
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Progress</p>
                      <p className="font-semibold text-gray-900">{progress}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white bg-opacity-40 rounded-full h-2 mb-4 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  {/* Milestone Checklist */}
                  <div className="space-y-2">
                    {milestones.map((milestone, idx) => {
                      const isCompleted = record.milestoneStatus?.[`milestone_${idx}`] || false
                      const isActive = daysElapsed >= milestone.day

                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded border text-xs ${
                            isCompleted
                              ? 'bg-green-100 border-green-300'
                              : isActive
                                ? 'bg-white border-gray-300'
                                : 'bg-gray-100 border-gray-300 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={async (e) => {
                                const updated = {
                                  ...record,
                                  milestoneStatus: {
                                    ...record.milestoneStatus,
                                    [`milestone_${idx}`]: e.target.checked
                                  }
                                }
                                await updateInDB(STORES.onboarding, updated)
                                await loadOnboardingData()
                              }}
                              disabled={!isActive}
                              className="w-4 h-4 rounded cursor-pointer"
                            />
                            <span className="font-medium">{milestone.title}</span>
                          </div>
                          {isActive && (
                            <div className="mt-1 ml-6 text-gray-600 text-xs">
                              {milestone.tasks.slice(0, 2).map((task, tidx) => (
                                <p key={tidx}>• {task}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4 pt-3 border-t border-white border-opacity-50 flex items-center justify-between">
                    <p className="text-xs text-gray-600">
                      {isOverdue && daysElapsed > 35 ? (
                        <span className="text-red-600 font-medium">⚠️ Overdue - Action needed</span>
                      ) : isOverdue ? (
                        <span className="text-orange-600 font-medium">📅 Review pending (30 days passed)</span>
                      ) : (
                        <span className="text-gray-600">On track for day {Math.ceil(daysElapsed)}</span>
                      )}
                    </p>
                    <select
                      value={record.completionStatus || 'pending'}
                      onChange={async (e) => {
                        const updated = { ...record, completionStatus: e.target.value }
                        await updateInDB(STORES.onboarding, updated)
                        await loadOnboardingData()
                      }}
                      className="text-xs px-2 py-1 rounded border border-gray-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="on-track">On Track</option>
                      <option value="at-risk">At Risk</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {formOpen && (
        <OnboardingForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSaveRecord}
          initialData={selectedRecord}
        />
      )}
    </div>
  )
}

// Onboarding Form Component
function OnboardingForm({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    role: '',
    department: '',
    startDate: new Date().toISOString().split('T')[0],
    manager: '',
    mentor: '',
    email: '',
    phone: '',
    notes: '',
    completionStatus: 'pending',
    milestoneStatus: {
      milestone_0: false,
      milestone_1: false,
      milestone_2: false,
      milestone_3: false
    }
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData((prev) => ({
        ...prev,
        id: generateID('onboard'),
        startDate: new Date().toISOString().split('T')[0]
      }))
    }
    setErrors({})
  }, [isOpen, initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name required'
    if (!formData.role.trim()) newErrors.role = 'Role required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Add New Hire</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-gray-900">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Engineer"
              />
              {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400"
                placeholder="Engineering"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <input
                type="text"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400"
                placeholder="Manager name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400"
                placeholder="employee@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400"
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mentor</label>
            <input
              type="text"
              name="mentor"
              value={formData.mentor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400"
              placeholder="Mentor name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
