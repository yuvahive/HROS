import React, { useState, useEffect, useContext } from 'react'
import { GitBranch, Calendar, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react'
import KanbanBoard from './KanbanBoard'
import { getAllFromDB, updateInDB, deleteFromDB, addToDB, STORES } from '../utils/indexedDB'
import { generateID } from '../utils/sampleData'
import { AuthContext } from '../context/AuthContext'

export default function ProjectHealthBoard() {
  const { currentUser } = useContext(AuthContext)
  const [projectCards, setProjectCards] = useState({})
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  const statuses = [
    { id: 'planning', title: 'Planning', icon: '📋', color: 'blue' },
    { id: 'in-progress', title: 'In Progress', icon: '🚀', color: 'yellow' },
    { id: 'at-risk', title: 'At Risk', icon: '⚠️', color: 'orange' },
    { id: 'blocked', title: 'Blocked', icon: '🚧', color: 'red' },
    { id: 'completed', title: 'Completed', icon: '✅', color: 'green' },
    { id: 'on-hold', title: 'On Hold', icon: '⏸️', color: 'gray' }
  ]

  // Load project data
  useEffect(() => {
    loadProjectData()
  }, [])

  const loadProjectData = async () => {
    try {
      const projects = await getAllFromDB(STORES.projects)
      const grouped = {
        planning: { cards: [] },
        'in-progress': { cards: [] },
        'at-risk': { cards: [] },
        blocked: { cards: [] },
        completed: { cards: [] },
        'on-hold': { cards: [] }
      }

      projects.forEach((project) => {
        const daysRemaining = Math.ceil(
          (new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        )
        const isAtRisk = daysRemaining <= 7 && project.status === 'in-progress'
        const actualStatus = isAtRisk && project.status !== 'blocked' ? 'at-risk' : project.status

        const card = {
          id: project.id,
          title: project.name,
          subtitle: project.owner,
          details: [
            `Due: ${new Date(project.dueDate).toLocaleDateString()}`,
            `Progress: ${project.progressPercentage || 0}%`,
            daysRemaining <= 0 ? 'OVERDUE' : `${daysRemaining} days left`,
            project.blockers ? `Blockers: ${project.blockers.length}` : ''
          ].filter(Boolean),
          tags: project.priority ? [project.priority] : [],
          status: actualStatus,
          data: project
        }

        if (grouped[actualStatus]) {
          grouped[actualStatus].cards.push(card)
        }
      })

      setProjectCards(grouped)
      setLoading(false)
    } catch (error) {
      console.error('Error loading project data:', error)
      setLoading(false)
    }
  }

  const handleDragEnd = async ({ card, targetColumn }) => {
    try {
      const updatedRecord = {
        ...card.data,
        status: targetColumn
      }
      await updateInDB(STORES.projects, updatedRecord)
      await loadProjectData()
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleCardDelete = async (cardId, statusId) => {
    try {
      await deleteFromDB(STORES.projects, cardId)
      await loadProjectData()
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleAddCard = (statusId) => {
    setSelectedProject(null)
    setFormOpen(true)
  }

  const handleCardClick = (card) => {
    setSelectedProject(card.data)
    setFormOpen(true)
  }

  const handleFormSave = async () => {
    await loadProjectData()
  }

  if (loading) {
    return <div className="p-8 text-center">Loading projects...</div>
  }

  const boardColumns = statuses.map((status) => ({
    id: status.id,
    title: status.title,
    icon: status.icon,
    color: status.color,
    cards: projectCards[status.id]?.cards || []
  }))

  // Calculate stats
  const allProjects = Object.values(projectCards).reduce((sum, status) => sum + status.cards.length, 0)
  const atRiskCount = projectCards['at-risk']?.cards?.length || 0
  const blockedCount = projectCards.blocked?.cards?.length || 0
  const completedCount = projectCards.completed?.cards?.length || 0

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <GitBranch className="w-8 h-8 text-teal-600" />
              Project Health
            </h1>
            <p className="text-gray-600 mt-1">Track project status, progress, and blockers</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{allProjects}</div>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${atRiskCount > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                {atRiskCount}
              </div>
              <p className="text-xs text-gray-600">At Risk</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${blockedCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {blockedCount}
              </div>
              <p className="text-xs text-gray-600">Blocked</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={boardColumns}
          onCardClick={handleCardClick}
          onCardDelete={handleCardDelete}
          onAddCard={handleAddCard}
          onDragEnd={handleDragEnd}
          cardContentRenderer={(card) => (
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-gray-900">{card.title}</h4>
              <p className="text-xs text-gray-700">{card.subtitle}</p>
              {card.details &&
                card.details.map((detail, idx) => (
                  <p key={idx} className={`text-xs ${detail.includes('OVERDUE') ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                    {detail}
                  </p>
                ))}
            </div>
          )}
        />
      </div>

      {/* Form Modal */}
      {formOpen && (
        <ProjectForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleFormSave}
          initialData={selectedProject}
        />
      )}
    </div>
  )
}

// Project Form Component
function ProjectForm({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    owner: '',
    status: 'planning',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    progressPercentage: 0,
    description: '',
    team: [],
    blockers: [],
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [blockerInput, setBlockerInput] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData((prev) => ({
        ...prev,
        id: generateID('proj'),
        startDate: new Date().toISOString().split('T')[0]
      }))
    }
    setErrors({})
  }, [isOpen, initialData])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }))
  }

  const handleAddBlocker = () => {
    if (blockerInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        blockers: [...(prev.blockers || []), { id: generateID('blocker'), text: blockerInput }]
      }))
      setBlockerInput('')
    }
  }

  const handleRemoveBlocker = (id) => {
    setFormData((prev) => ({
      ...prev,
      blockers: (prev.blockers || []).filter((b) => b.id !== id)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name required'
    if (!formData.owner.trim()) newErrors.owner = 'Owner required'
    if (!formData.dueDate) newErrors.dueDate = 'Due date required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      if (initialData?.id) {
        await updateInDB(STORES.projects, formData)
      } else {
        await addToDB(STORES.projects, formData)
      }
      onSave(formData)
      onClose()
    } catch (error) {
      setErrors({ submit: error.message })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">{initialData ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-gray-900">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Project name"
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner *</label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 ${errors.owner ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Project lead"
              />
              {errors.owner && <p className="text-red-600 text-xs mt-1">{errors.owner}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="at-risk">At Risk</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.dueDate && <p className="text-red-600 text-xs mt-1">{errors.dueDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress: {formData.progressPercentage}%</label>
            <input
              type="range"
              name="progressPercentage"
              min="0"
              max="100"
              value={formData.progressPercentage}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400"
              placeholder="Project description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blockers</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={blockerInput}
                onChange={(e) => setBlockerInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBlocker())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400"
                placeholder="Add blocker..."
              />
              <button
                type="button"
                onClick={handleAddBlocker}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Add
              </button>
            </div>
            {formData.blockers && formData.blockers.length > 0 && (
              <div className="space-y-1">
                {formData.blockers.map((blocker) => (
                  <div key={blocker.id} className="flex items-center justify-between bg-red-50 p-2 rounded text-xs border border-red-200">
                    <span>🚧 {blocker.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlocker(blocker.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
