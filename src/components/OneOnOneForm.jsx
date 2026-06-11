import React, { useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { addToDB, updateInDB, STORES } from '../utils/indexedDB'
import { generateID } from '../utils/sampleData'

function sanitizeDate(value) {
  if (!value) return ''
  if (typeof value === 'string' && value.includes('T')) {
    try {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0]
      }
    } catch {}
  }
  return value
}

function sanitizeTime(value) {
  if (!value) return ''
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

export default function OneOnOneForm({ isOpen, onClose, onSave, initialData = null, assignee = null, people = [], currentUser = null }) {
  const [formData, setFormData] = useState({
    id: '',
    personId: '',
    personName: '',
    managerId: '',
    managerName: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    meetingType: 'regular',
    status: 'scheduled',
    shippingUpdate: '',
    growthFeedback: '',
    wellbeingScore: 5,
    wellbeingNotes: '',
    blockers: '',
    blockerHelp: '',
    decisions: '',
    actionItems: '',
    nextMeetingDate: '',
    notes: '',
    completionDate: '',
    duration_actual: ''
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        scheduledDate: sanitizeDate(initialData.scheduledDate),
        scheduledTime: sanitizeTime(initialData.scheduledTime),
      })
    } else {
      // Reset form for new meeting
      setFormData((prev) => ({
        ...prev,
        id: generateID('1o1'),
        personId: assignee?.id || '',
        personName: assignee?.name || '',
        managerId: currentUser?.id || '',
        managerName: currentUser?.name || '',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '10:00',
        duration: 30,
        meetingType: 'regular',
        status: 'scheduled',
        wellbeingScore: 5
      }))
    }
    setErrors({})
  }, [isOpen, initialData, assignee, currentUser])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.personId && !formData.personName) {
      newErrors.person = 'Please select or enter a person'
    }
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Date is required'
    if (!formData.scheduledTime && formData.status === 'scheduled') {
      newErrors.scheduledTime = 'Time is required'
    }
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      // Sanitize date/time fields before saving
      const saveData = {
        ...formData,
        scheduledDate: sanitizeDate(formData.scheduledDate),
        scheduledTime: sanitizeTime(formData.scheduledTime),
      }
      if (initialData?.id) {
        await updateInDB(STORES.oneOnOnes, saveData)
      } else {
        await addToDB(STORES.oneOnOnes, saveData)
      }
      onSave(saveData)
      onClose()
    } catch (error) {
      setErrors({ submit: 'Error saving 1:1: ' + error.message })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit 1:1 Meeting' : 'Schedule 1:1 Meeting'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {errors.submit}
            </div>
          )}

          {/* Meeting Basics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Person *
                </label>
                <select
                  name="personId"
                  value={formData.personId}
                  onChange={(e) => {
                    const selected = people.find((p) => p.id === e.target.value)
                    setFormData((prev) => ({
                      ...prev,
                      personId: selected?.id || '',
                      personName: selected?.name || ''
                    }))
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 ${
                    errors.person ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select person</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
                {errors.person && <p className="text-red-600 text-xs mt-1">{errors.person}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting With (Manager/HR)
                </label>
                <select
                  name="managerId"
                  value={formData.managerId}
                  onChange={(e) => {
                    const selected = people.find((p) => p.id === e.target.value)
                    setFormData((prev) => ({
                      ...prev,
                      managerId: selected?.id || '',
                      managerName: selected?.name || ''
                    }))
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                >
                  <option value="">Select manager/HR</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 ${
                      errors.scheduledDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.scheduledDate && (
                    <p className="text-red-600 text-xs mt-1">{errors.scheduledDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time {formData.status === 'scheduled' && '*'}
                  </label>
                  <input
                    type="time"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    disabled={formData.status === 'completed'}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 ${
                      errors.scheduledTime ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } disabled:bg-gray-100`}
                  />
                  {errors.scheduledTime && (
                    <p className="text-red-600 text-xs mt-1">{errors.scheduledTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (min)
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="meetingType"
                    value={formData.meetingType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="regular">Regular 1:1</option>
                    <option value="checkin">Check-in</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Topics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Topics</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping / Project Updates
                </label>
                <textarea
                  name="shippingUpdate"
                  value={formData.shippingUpdate}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                  placeholder="What are you working on? Progress updates?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Growth Feedback & Learning
                </label>
                <textarea
                  name="growthFeedback"
                  value={formData.growthFeedback}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                  placeholder="Positive feedback, areas for growth, learning opportunities"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wellbeing Score: {formData.wellbeingScore}/10
                </label>
                <input
                  type="range"
                  name="wellbeingScore"
                  min="1"
                  max="10"
                  value={formData.wellbeingScore}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wellbeing Notes
                </label>
                <textarea
                  name="wellbeingNotes"
                  value={formData.wellbeingNotes}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                  placeholder="How are you feeling? Any concerns?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blockers
                </label>
                <textarea
                  name="blockers"
                  value={formData.blockers}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                  placeholder="Any blockers, obstacles, or challenges?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How can I help?
                </label>
                <textarea
                  name="blockerHelp"
                  value={formData.blockerHelp}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                  placeholder="Support needed?"
                />
              </div>
            </div>
          </div>

          {/* Outcomes (if completed) */}
          {formData.status === 'completed' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Outcomes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Decisions
                  </label>
                  <textarea
                    name="decisions"
                    value={formData.decisions}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Any decisions made?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Items
                  </label>
                  <textarea
                    name="actionItems"
                    value={formData.actionItems}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Follow-ups and action items from this meeting"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Meeting Date
                    </label>
                    <input
                      type="date"
                      name="nextMeetingDate"
                      value={formData.nextMeetingDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actual Duration
                    </label>
                    <input
                      type="text"
                      name="duration_actual"
                      value={formData.duration_actual}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                      placeholder="e.g., 35 min"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    General Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Additional notes from meeting..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


