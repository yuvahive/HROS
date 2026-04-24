import React, { useState, useEffect, useContext } from 'react'
import { CheckSquare, Calendar, User, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react'
import KanbanBoard from './KanbanBoard'
import { getAllFromDB, updateInDB, deleteFromDB, addToDB, STORES } from '../utils/indexedDB'
import { generateID } from '../utils/sampleData'
import { AuthContext } from '../context/AuthContext'

export default function ActionItemsBoard() {
  const { currentUser } = useContext(AuthContext)
  const [actionCards, setActionCards] = useState({})
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)

  const statuses = [
    { id: 'new', title: 'New Decisions', icon: '💡', color: 'blue' },
    { id: 'assigned', title: 'Assigned', icon: '👤', color: 'purple' },
    { id: 'in-progress', title: 'In Progress', icon: '⏳', color: 'yellow' },
    { id: 'blocked', title: 'Blocked', icon: '🚧', color: 'red' },
    { id: 'completed', title: 'Completed', icon: '✅', color: 'green' }
  ]

  // Load action items
  useEffect(() => {
    loadActionData()
  }, [])

  const loadActionData = async () => {
    try {
      const allActions = (await getAllFromDB(STORES.actionItems)) || []
      const grouped = {
        new: { cards: [] },
        assigned: { cards: [] },
        'in-progress': { cards: [] },
        blocked: { cards: [] },
        completed: { cards: [] }
      }

      allActions.forEach((action) => {
        const daysOverdue = Math.ceil(
          (new Date() - new Date(action.dueDate)) / (1000 * 60 * 60 * 24)
        )
        const isOverdue = daysOverdue > 0 && action.status !== 'completed'

        const card = {
          id: action.id,
          title: action.title,
          subtitle: action.owner,
          details: [
            `Due: ${new Date(action.dueDate).toLocaleDateString()}`,
            isOverdue ? `OVERDUE by ${daysOverdue} days` : `${Math.abs(daysOverdue)} days left`,
            action.category ? `Category: ${action.category}` : '',
            action.priority ? `${action.priority.toUpperCase()}` : ''
          ].filter(Boolean),
          tags: [action.decisionContext ? `Decision: ${action.decisionContext}` : 'Action'],
          status: action.status,
          data: action
        }

        if (grouped[action.status]) {
          grouped[action.status].cards.push(card)
        }
      })

      setActionCards(grouped)
      setLoading(false)
    } catch (error) {
      console.error('Error loading action data:', error)
      setLoading(false)
    }
  }

  const handleDragEnd = async ({ card, targetColumn }) => {
    try {
      const updatedRecord = {
        ...card.data,
        status: targetColumn
      }
      await updateInDB(STORES.actionItems, updatedRecord)
      await loadActionData()
    } catch (error) {
      console.error('Error updating action:', error)
    }
  }

  const handleCardDelete = async (cardId, statusId) => {
    if (currentUser?.role !== 'admin') {
      alert('Only administrators can delete action items')
      return
    }

    if (!window.confirm('Are you sure you want to delete this action item?')) {
      return
    }

    try {
      await deleteFromDB(STORES.actionItems, cardId)
      await loadActionData()
    } catch (error) {
      console.error('Error deleting action:', error)
    }
  }

  const handleAddCard = (statusId) => {
    setSelectedAction(null)
    setFormOpen(true)
  }

  const handleCardClick = (card) => {
    setSelectedAction(card.data)
    setFormOpen(true)
  }

  const handleFormSave = async () => {
    await loadActionData()
  }

  if (loading) {
    return <div className="p-8 text-center">Loading action items...</div>
  }

  const boardColumns = statuses.map((status) => ({
    id: status.id,
    title: status.title,
    icon: status.icon,
    color: status.color,
    cards: actionCards[status.id]?.cards || []
  }))

  // Calculate stats
  const allActions = Object.values(actionCards).reduce((sum, status) => sum + status.cards.length, 0)
  const overdueCount = Object.values(actionCards)
    .flatMap((status) => status.cards)
    .filter((card) => {
      const daysOverdue = Math.ceil((new Date() - new Date(card.data.dueDate)) / (1000 * 60 * 60 * 24))
      return daysOverdue > 0 && card.data.status !== 'completed'
    }).length
  const completedCount = actionCards.completed?.cards?.length || 0

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-8 h-8 text-green-600" />
              Action Items
            </h1>
            <p className="text-gray-600 mt-1">Track decisions and follow-up actions</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{allActions}</div>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {overdueCount}
              </div>
              <p className="text-xs text-gray-600">Overdue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {actionCards['in-progress']?.cards?.length || 0}
              </div>
              <p className="text-xs text-gray-600">In Progress</p>
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
                  <p
                    key={idx}
                    className={`text-xs ${
                      detail.includes('OVERDUE') ? 'text-red-600 font-semibold' : 'text-gray-600'
                    }`}
                  >
                    {detail}
                  </p>
                ))}
            </div>
          )}
        />
      </div>

      {/* Form Modal */}
      {formOpen && (
        <ActionItemForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleFormSave}
          initialData={selectedAction}
        />
      )}
    </div>
  )
}

// Action Item Form Component
function ActionItemForm({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    owner: '',
    status: 'new',
    dueDate: '',
    category: 'follow-up', // follow-up, decision, task
    priority: 'medium', // low, medium, high
    decisionContext: '', // Which decision this came from
    relatedPeople: [],
    description: '',
    notes: '',
    createdDate: new Date().toISOString()
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData((prev) => ({
        ...prev,
        id: generateID('action'),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdDate: new Date().toISOString()
      }))
    }
    setErrors({})
  }, [isOpen, initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title required'
    if (!formData.owner.trim()) newErrors.owner = 'Owner required'
    if (!formData.dueDate) newErrors.dueDate = 'Due date required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      if (initialData?.id) {
        await updateInDB(STORES.actionItems, formData)
      } else {
        await addToDB(STORES.actionItems, formData)
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
          <h2 className="text-2xl font-bold">{initialData ? 'Edit Action Item' : 'New Action Item'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-gray-900">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {errors.submit}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Action title"
            />
            {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner *</label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 ${errors.owner ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Responsible person"
              />
              {errors.owner && <p className="text-red-600 text-xs mt-1">{errors.owner}</p>}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="new">New Decision</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="follow-up">Follow-up</option>
                <option value="decision">Decision</option>
                <option value="task">Task</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Decision Context</label>
              <input
                type="text"
                name="decisionContext"
                value={formData.decisionContext}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400"
                placeholder="e.g., Q1 Planning, Hiring Policy"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400"
              placeholder="What needs to be done?"
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
              placeholder="Additional context or notes..."
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
              Save Action Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
