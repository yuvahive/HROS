import React, { useState, useEffect, useContext } from 'react'
import { CheckCircle, AlertCircle, BarChart3 } from 'lucide-react'
import KanbanBoard from './KanbanBoard'
import { getAllFromDB, updateInDB, deleteFromDB, addToDB } from '../utils/indexedDB'
import { STORES } from '../utils/indexedDB'
import { AuthContext } from '../context/AuthContext'
import { generateID } from '../utils/sampleData'

export default function DailyWorkBoard() {
  const { currentUser } = useContext(AuthContext)
  const [workCards, setWorkCards] = useState({})
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState('today')

  const columns = [
    { id: 'today', title: 'Today', icon: '📋', color: 'blue' },
    { id: 'blockers', title: 'Blockers', icon: '🚫', color: 'red' },
    { id: 'completed', title: 'Completed', icon: '✅', color: 'green' },
    { id: 'notes', title: 'Notes', icon: '📝', color: 'gray' }
  ]

  // Load work logs from IndexedDB
  useEffect(() => {
    const loadWorkData = async () => {
      try {
        const workLogs = await getAllFromDB(STORES.workLogs)
        const today = new Date().toISOString().split('T')[0]

        const grouped = {
          today: { cards: [] },
          blockers: { cards: [] },
          completed: { cards: [] },
          notes: { cards: [] }
        }

        workLogs
          .filter((log) => log.date === today)
          .forEach((log) => {
            const card = {
              id: log.id,
              title: `${log.personName}`,
              subtitle: log.taskName,
              details: [
                `${log.hoursWorked}h done / ${log.hoursEstimated}h est`,
                `Status: ${log.status}`,
                log.mood ? `Mood: ${log.mood}` : ''
              ].filter(Boolean),
              status: log.status === 'blocked' ? 'red' : 'blue',
              data: log
            }

            if (log.status === 'blocked') {
              grouped.blockers.cards.push(card)
            } else if (log.status === 'done') {
              grouped.completed.cards.push(card)
            } else {
              grouped.today.cards.push(card)
            }
          })

        setWorkCards(grouped)
        setLoading(false)
      } catch (error) {
        console.error('Error loading work data:', error)
        setLoading(false)
      }
    }

    loadWorkData()
  }, [])

  const handleDragEnd = async ({ card, targetColumn }) => {
    try {
      const statusMap = {
        today: 'in-progress',
        blockers: 'blocked',
        completed: 'done',
        notes: 'in-progress'
      }

      const updatedRecord = {
        ...card.data,
        status: statusMap[targetColumn]
      }
      await updateInDB(STORES.workLogs, updatedRecord)

      const newCards = { ...workCards }
      Object.keys(newCards).forEach((col) => {
        newCards[col].cards = newCards[col].cards.filter((c) => c.id !== card.id)
      })

      newCards[targetColumn].cards.push({
        ...card,
        status: statusMap[targetColumn]
      })

      setWorkCards(newCards)
    } catch (error) {
      console.error('Error updating work log:', error)
    }
  }

  const handleCardDelete = async (cardId) => {
    if (currentUser?.role !== 'admin') {
      alert('Only administrators can delete work logs')
      return
    }

    if (!window.confirm('Are you sure you want to delete this work log?')) {
      return
    }

    try {
      await deleteFromDB(STORES.workLogs, cardId)
      const newCards = { ...workCards }
      Object.keys(newCards).forEach((col) => {
        newCards[col].cards = newCards[col].cards.filter((c) => c.id !== cardId)
      })
      setWorkCards(newCards)
    } catch (error) {
      console.error('Error deleting work log:', error)
    }
  }

  const handleAddCard = (columnId) => {
    setSelectedColumnId(columnId)
    setFormOpen(true)
  }

  const handleFormSave = (record, columnId) => {
    const card = {
      id: record.id,
      title: record.personName,
      subtitle: record.taskName,
      details: [
        `${record.hoursWorked}h done / ${record.hoursEstimated}h est`,
        `Status: ${record.status}`,
        record.mood ? `Mood: ${record.mood}` : ''
      ].filter(Boolean),
      status: record.status === 'blocked' ? 'red' : 'blue',
      data: record
    }

    setWorkCards((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        cards: [...(prev[columnId]?.cards || []), card]
      }
    }))
  }

  if (loading) {
    return <div className="p-8 text-center">Loading daily work...</div>
  }

  const totalCards = Object.values(workCards).reduce((sum, col) => sum + (col.cards?.length || 0), 0)
  const blockedCount = workCards.blockers?.cards?.length || 0
  const completedCount = workCards.completed?.cards?.length || 0

  const boardColumns = columns.map((col) => ({
    id: col.id,
    title: col.title,
    icon: col.icon,
    color: col.color,
    cards: workCards[col.id]?.cards || []
  }))

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              Daily Work
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalCards}</div>
              <p className="text-xs text-gray-600">Active</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
                <AlertCircle className="w-5 h-5" />
                {blockedCount}
              </div>
              <p className="text-xs text-gray-600">Blockers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                <CheckCircle className="w-5 h-5" />
                {completedCount}
              </div>
              <p className="text-xs text-gray-600">Done</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={boardColumns}
          onCardClick={(card) => console.log('Work log clicked:', card)}
          onCardDelete={handleCardDelete}
          onAddCard={handleAddCard}
          onDragEnd={handleDragEnd}
        />
      </div>

      <DailyWorkForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleFormSave}
        initialColumnId={selectedColumnId}
      />
    </div>
  )
}

function DailyWorkForm({ isOpen, onClose, onSave, initialColumnId }) {
  const [formData, setFormData] = useState({
    personName: '',
    taskName: '',
    hoursWorked: 0,
    hoursEstimated: 8,
    mood: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setFormData({
        personName: '',
        taskName: '',
        hoursWorked: 0,
        hoursEstimated: 8,
        mood: ''
      })
      setErrors({})
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hoursWorked' || name === 'hoursEstimated' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!formData.personName.trim()) newErrors.personName = 'Person name is required'
    if (!formData.taskName.trim()) newErrors.taskName = 'Task name is required'
    if (Number.isNaN(formData.hoursWorked)) newErrors.hoursWorked = 'Hours worked must be a number'
    if (Number.isNaN(formData.hoursEstimated)) newErrors.hoursEstimated = 'Hours estimated must be a number'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const statusMap = {
      today: 'in-progress',
      blockers: 'blocked',
      completed: 'done',
      notes: 'in-progress'
    }
    const status = statusMap[initialColumnId] || 'in-progress'

    const record = {
      id: generateID('worklog'),
      date: new Date().toISOString().split('T')[0],
      personId: '',
      personName: formData.personName.trim(),
      projectId: '',
      taskId: '',
      taskName: formData.taskName.trim(),
      hoursWorked: Number(formData.hoursWorked),
      hoursEstimated: Number(formData.hoursEstimated),
      status,
      output: '',
      blockers: [],
      mood: formData.mood,
      learnings: '',
      nextDayPlan: ''
    }

    try {
      await addToDB(STORES.workLogs, record)
      onSave(record, initialColumnId)
      onClose()
    } catch (error) {
      setErrors({ submit: 'Failed to save work log' })
      console.error('Error saving work log:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl border">
        <div className="px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add Daily Work Card</h3>
          <p className="text-sm text-gray-600">Fill details to create a new work log card.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-gray-900">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Person Name</label>
            <input
              name="personName"
              value={formData.personName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400"
              placeholder="Enter person name"
            />
            {errors.personName && <p className="text-xs text-red-600 mt-1">{errors.personName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
            <input
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400"
              placeholder="Enter task"
            />
            {errors.taskName && <p className="text-xs text-red-600 mt-1">{errors.taskName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
              <input
                type="number"
                step="0.5"
                min="0"
                name="hoursWorked"
                value={formData.hoursWorked}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400"
              />
              {errors.hoursWorked && <p className="text-xs text-red-600 mt-1">{errors.hoursWorked}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours Estimated</label>
              <input
                type="number"
                step="0.5"
                min="0"
                name="hoursEstimated"
                value={formData.hoursEstimated}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400"
              />
              {errors.hoursEstimated && (
                <p className="text-xs text-red-600 mt-1">{errors.hoursEstimated}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
            <select
              name="mood"
              value={formData.mood}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">Select mood</option>
              <option value="😊">😊 Positive</option>
              <option value="😐">😐 Neutral</option>
              <option value="😤">😤 Stressed</option>
            </select>
          </div>

          {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">
              Save Card
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
