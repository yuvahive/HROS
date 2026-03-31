import React, { useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { addToDB, updateInDB, STORES } from '../utils/indexedDB'
import { generateID } from '../utils/sampleData'

export default function HiringForm({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    source: 'LinkedIn', // Direct, LinkedIn, Referral, Job Board
    appliedDate: new Date().toISOString().split('T')[0],
    stage: 'applicant',
    screeningScore: 0,
    screeningDate: '',
    screeningNotes: '',
    interviewDate: '',
    interviewTime: '',
    interviewerName: '',
    interviewNotes: '',
    technicalScore: 0,
    cultureFitScore: 0,
    offerSalary: '',
    offerEquity: '',
    offerSentDate: '',
    offerStatus: 'pending',
    resumerLink: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      // Reset form for new candidate
      setFormData((prev) => ({
        ...prev,
        id: generateID('hire'),
        appliedDate: new Date().toISOString().split('T')[0],
        name: '',
        email: '',
        phone: '',
        role: '',
        screeningNotes: '',
        interviewNotes: '',
        offerSentDate: '',
        notes: ''
      }))
    }
    setErrors({})
  }, [isOpen, initialData])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.role.trim()) newErrors.role = 'Role is required'
    if (formData.stage === 'offered' && !formData.offerSalary) {
      newErrors.offerSalary = 'Offer salary required'
    }
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
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
      if (initialData?.id) {
        // Update existing
        await updateInDB(STORES.hiringPipeline, formData)
      } else {
        // Add new
        await addToDB(STORES.hiringPipeline, formData)
      }
      onSave(formData)
      onClose()
    } catch (error) {
      setErrors({ submit: 'Error saving candidate: ' + error.message })
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
            {initialData ? 'Edit Candidate' : 'Add New Candidate'}
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

          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 ${
                    errors.role ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Backend Engineer"
                />
                {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                >
                  <option>Direct</option>
                  <option>LinkedIn</option>
                  <option>Referral</option>
                  <option>Job Board</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Date
                </label>
                <input
                  type="date"
                  name="appliedDate"
                  value={formData.appliedDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Pipeline Stage */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stage</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="applicant">Applicant</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offered">Offered</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Screening Section */}
            {['screening', 'interview', 'offered', 'hired'].includes(formData.stage) && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Screening Score (1-10)
                    </label>
                    <input
                      type="number"
                      name="screeningScore"
                      min="1"
                      max="10"
                      value={formData.screeningScore}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Screening Date
                    </label>
                    <input
                      type="date"
                      name="screeningDate"
                      value={formData.screeningDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Screening Notes
                  </label>
                  <textarea
                    name="screeningNotes"
                    value={formData.screeningNotes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Feedback from screening..."
                  />
                </div>
              </div>
            )}

            {/* Interview Section */}
            {['interview', 'offered', 'hired'].includes(formData.stage) && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interview Date
                    </label>
                    <input
                      type="date"
                      name="interviewDate"
                      value={formData.interviewDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      name="interviewTime"
                      value={formData.interviewTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interviewer
                    </label>
                    <input
                      type="text"
                      name="interviewerName"
                      value={formData.interviewerName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                      placeholder="Raj Verma"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Technical Score (1-10)
                    </label>
                    <input
                      type="number"
                      name="technicalScore"
                      min="1"
                      max="10"
                      value={formData.technicalScore}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Culture Fit Score (1-10)
                    </label>
                    <input
                      type="number"
                      name="cultureFitScore"
                      min="1"
                      max="10"
                      value={formData.cultureFitScore}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interview Notes
                  </label>
                  <textarea
                    name="interviewNotes"
                    value={formData.interviewNotes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Interview feedback..."
                  />
                </div>
              </div>
            )}

            {/* Offer Section */}
            {['offered', 'hired'].includes(formData.stage) && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Offer Salary ($) *
                    </label>
                    <input
                      type="number"
                      name="offerSalary"
                      value={formData.offerSalary}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 ${
                        errors.offerSalary ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="100000"
                    />
                    {errors.offerSalary && (
                      <p className="text-red-600 text-xs mt-1">{errors.offerSalary}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Offer Equity (%)
                    </label>
                    <input
                      type="number"
                      name="offerEquity"
                      step="0.01"
                      value={formData.offerEquity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                      placeholder="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Offer Sent Date
                    </label>
                    <input
                      type="date"
                      name="offerSentDate"
                      value={formData.offerSentDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
              placeholder="Additional notes about this candidate..."
            />
          </div>

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
              {saving ? 'Saving...' : 'Save Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
