import React, { useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { addToDB, updateInDB, STORES } from '../utils/indexedDB'
import { generateID } from '../utils/sampleData'

export default function InternshipForm({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    id: '',
    personName: '',
    email: '',
    phone: '',
    college: '',
    major: '',
    department: 'Engineering',
    position: 'Software Engineering Intern',
    
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    durationWeeks: 12,
    
    mentor: '',
    mentorName: '',
    reportingManager: '',
    
    learningObjectives: [],
    assignedProjects: [],
    skillsToAcquire: [],
    
    stage: 'onboarding',
    
    midtermEvalDate: '',
    midtermScore: '',
    midtermFeedback: '',
    
    finalEvalDate: '',
    finalScore: '',
    finalFeedback: '',
    
    technicalCompetency: '',
    communicationSkills: '',
    teamworkRating: '',
    problemSolving: '',
    
    projectsCompleted: 0,
    tasksCompleted: 0,
    codeQuality: 'good',
    attendancePercentage: 100,
    
    returnOfferExtended: false,
    fteRecommendation: '',
    fteRole: '',
    
    stipendAmount: 0,
    workHoursPerWeek: 40,
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [objectiveInput, setObjectiveInput] = useState('')
  const [projectInput, setProjectInput] = useState('')
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData((prev) => ({
        ...prev,
        id: generateID('intern'),
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        personName: '',
        email: '',
        phone: '',
        college: '',
        major: '',
        learningObjectives: [],
        assignedProjects: [],
        skillsToAcquire: [],
        midtermFeedback: '',
        finalFeedback: '',
        fteRole: '',
        notes: ''
      }))
    }
    setErrors({})
  }, [isOpen, initialData])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.personName.trim()) newErrors.personName = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.college.trim()) newErrors.college = 'College is required'
    if (!formData.major.trim()) newErrors.major = 'Major is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (formData.stage === 'final-review' && !formData.finalScore) {
      newErrors.finalScore = 'Final score required'
    }
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const addObjective = () => {
    if (objectiveInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, objectiveInput]
      }))
      setObjectiveInput('')
    }
  }

  const addProject = () => {
    if (projectInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        assignedProjects: [...prev.assignedProjects, projectInput]
      }))
      setProjectInput('')
    }
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        skillsToAcquire: [...prev.skillsToAcquire, skillInput]
      }))
      setSkillInput('')
    }
  }

  const removeItem = (array, index) => {
    return array.filter((_, i) => i !== index)
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
        await updateInDB(STORES.internships, formData)
      } else {
        await addToDB(STORES.internships, formData)
      }
      onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving internship:', error)
      setErrors({ submit: 'Failed to save internship' })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit Internship' : 'New Internship'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {errors.submit && (
            <div className="flex gap-2 bg-red-50 border border-red-200 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Personal Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="personName"
                  value={formData.personName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.personName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Alex Sharma"
                />
                {errors.personName && <p className="text-red-600 text-xs mt-1">{errors.personName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="alex@college.edu"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+919876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">College *</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.college ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="IIT Delhi"
                />
                {errors.college && <p className="text-red-600 text-xs mt-1">{errors.college}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Major *</label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.major ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Computer Science"
                />
                {errors.major && <p className="text-red-600 text-xs mt-1">{errors.major}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                <select
                  name="year"
                  value={formData.year || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Position & Department */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Position & Assignment
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Software Engineering Intern"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mentor Name</label>
                <input
                  type="text"
                  name="mentorName"
                  value={formData.mentorName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Raj Verma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Manager</label>
                <input
                  type="text"
                  name="reportingManager"
                  value={formData.reportingManager}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Manager name"
                />
              </div>
            </div>
          </div>

          {/* Duration & Dates */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Duration & Dates
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.startDate && <p className="text-red-600 text-xs mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.endDate && <p className="text-red-600 text-xs mt-1">{errors.endDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Weeks)</label>
                <input
                  type="number"
                  name="durationWeeks"
                  value={formData.durationWeeks}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="52"
                />
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              Learning Goals
            </h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={objectiveInput}
                  onChange={(e) => setObjectiveInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add learning objective..."
                />
                <button
                  type="button"
                  onClick={addObjective}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.learningObjectives.map((obj, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                  >
                    {obj}
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, learningObjectives: removeItem(prev.learningObjectives, idx) }))}
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skills to Acquire */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Skills to Acquire</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add skill (e.g., React, Node.js)..."
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skillsToAcquire.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, skillsToAcquire: removeItem(prev.skillsToAcquire, idx) }))}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">5</span>
              Performance & Evaluation
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="onboarding">Onboarding</option>
                  <option value="active">Active</option>
                  <option value="final-review">Final Review</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attendance %</label>
                <input
                  type="number"
                  name="attendancePercentage"
                  value={formData.attendancePercentage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tasks Completed</label>
                <input
                  type="number"
                  name="tasksCompleted"
                  value={formData.tasksCompleted}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Projects Completed</label>
                <input
                  type="number"
                  name="projectsCompleted"
                  value={formData.projectsCompleted}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Final Score (1-10)</label>
                <input
                  type="number"
                  name="finalScore"
                  value={formData.finalScore}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formData.stage === 'final-review' && errors.finalScore ? 'border-red-500' : 'border-gray-300'}`}
                  min="1"
                  max="10"
                  placeholder="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technical Score (1-10)</label>
                <input
                  type="number"
                  name="technicalCompetency"
                  value={formData.technicalCompetency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Evaluation Feedback */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Evaluation Feedback</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Final Feedback</label>
                <textarea
                  name="finalFeedback"
                  value={formData.finalFeedback}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Provide final feedback and recommendations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Any additional notes or comments..."
                />
              </div>
            </div>
          </div>

          {/* FTE Opportunity */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Future Opportunity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="returnOfferExtended"
                    checked={formData.returnOfferExtended}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Extend Return Offer</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FTE Recommendation</label>
                <select
                  name="fteRecommendation"
                  value={formData.fteRecommendation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Not recommended</option>
                  <option value="strong-yes">Strong Yes</option>
                  <option value="yes">Yes</option>
                  <option value="maybe">Maybe</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Internship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
