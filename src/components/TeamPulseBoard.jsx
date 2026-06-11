import React, { useState, useEffect, useContext } from 'react'
import { AlertCircle, TrendingUp, Heart, Zap } from 'lucide-react'
import KanbanBoard from './KanbanBoard'
import { getAllFromDB, updateInDB, deleteFromDB, addToDB } from '../utils/indexedDB'
import { STORES } from '../utils/indexedDB'
import { AuthContext } from '../context/AuthContext'
import { generateID } from '../utils/sampleData'

// Team Performance / Pulse Board - Health monitoring
export default function TeamPulseBoard() {
  const { currentUser, filterByTeam } = useContext(AuthContext)
  const [pulseCards, setPulseCards] = useState({})
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState('green')

  const columns = [
    { id: 'green', title: 'Healthy', icon: '🟢', color: 'green', sentiment: 'green' },
    { id: 'yellow', title: 'At Risk', icon: '🟡', color: 'yellow', sentiment: 'yellow' },
    { id: 'red', title: 'Crucial', icon: '🔴', color: 'red', sentiment: 'red' },
    { id: 'onleave', title: 'On Leave', icon: '🌴', color: 'gray', sentiment: 'gray' }
  ]

  useEffect(() => {
    const loadPulseData = async () => {
      try {
        const people = await getAllFromDB(STORES.people)
        const filtered = filterByTeam(people)
        const grouped = {
          green: { cards: [] },
          yellow: { cards: [] },
          red: { cards: [] },
          onleave: { cards: [] }
        }

        filtered.forEach((person) => {
          // Sample sentiment logic based on data
          let sentiment = 'green'
          const daysSinceCheckIn = person.lastCheckInDate
            ? Math.floor(
                (new Date() - new Date(person.lastCheckInDate)) / (1000 * 60 * 60 * 24)
              )
            : 100

          if (person.status === 'on-leave') {
            sentiment = 'onleave'
          } else if (daysSinceCheckIn > 30) {
            sentiment = 'red'
          } else if (daysSinceCheckIn > 20) {
            sentiment = 'yellow'
          }

          const card = {
            id: person.id,
            title: person.name,
            subtitle: person.role,
            details: [
              `Team: ${person.team}`,
              `Last check-in: ${daysSinceCheckIn} days ago`,
              `Status: ${person.status || 'active'}`
            ],
            sentiment: sentiment,
            status: sentiment,
            data: person,
            tags: person.skills ? person.skills.slice(0, 2) : []
          }

          if (grouped[sentiment]) {
            grouped[sentiment].cards.push(card)
          }
        })

        setPulseCards(grouped)
        setLoading(false)
      } catch (error) {
        console.error('Error loading pulse data:', error)
        setLoading(false)
      }
    }

    loadPulseData()
  }, [])

  const handleCardDelete = async (cardId) => {
    if (currentUser?.role !== 'admin') {
      alert('Only administrators can delete people records')
      return
    }

    if (!window.confirm('Are you sure you want to remove this person from the team?')) {
      return
    }

    try {
      await deleteFromDB(STORES.people, cardId)
      const newCards = { ...pulseCards }
      Object.keys(newCards).forEach((col) => {
        newCards[col].cards = newCards[col].cards.filter((c) => c.id !== cardId)
      })
      setPulseCards(newCards)
    } catch (error) {
      console.error('Error deleting person:', error)
    }
  }

  const handleDragEnd = async ({ card, targetColumn }) => {
    try {
      const updatedRecord = {
        ...card.data,
        sentiment: targetColumn,
        status: targetColumn
      }
      await updateInDB(STORES.people, updatedRecord)

      // Track team dynamics change
      if (card.sentiment !== targetColumn) {
        await addToDB(STORES.teamDynamics, {
          id: generateID('tdynamics'),
          personId: card.data.id,
          personName: card.data.name,
          fromSentiment: card.sentiment,
          toSentiment: targetColumn,
          changedBy: currentUser?.id,
          changedByName: currentUser?.name,
          timestamp: new Date().toISOString()
        })
      }

      const newCards = { ...pulseCards }
      Object.keys(newCards).forEach((col) => {
        newCards[col].cards = newCards[col].cards.filter((c) => c.id !== card.id)
      })

      if (newCards[targetColumn]) {
        newCards[targetColumn].cards.push({
          ...card,
          sentiment: targetColumn,
          status: targetColumn
        })
      }

      setPulseCards(newCards)
    } catch (error) {
      console.error('Error updating sentiment:', error)
    }
  }

  const handleAddCard = (columnId) => {
    setSelectedColumnId(columnId)
    setFormOpen(true)
  }

  const handleFormSave = (record, columnId) => {
    const sentiment = columnId
    const card = {
      id: record.id,
      title: record.name,
      subtitle: record.role,
      details: [
        `Team: ${record.team}`,
        'Last check-in: 0 days ago',
        `Status: ${record.status}`
      ],
      sentiment,
      status: sentiment,
      data: record,
      tags: record.skills ? record.skills.slice(0, 2) : []
    }

    setPulseCards((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        cards: [...(prev[columnId]?.cards || []), card]
      }
    }))
  }

  if (loading) {
    return <div className="p-8 text-center">Loading team pulse...</div>
  }

  const totalTeam = Object.values(pulseCards).reduce((sum, col) => sum + (col.cards?.length || 0), 0)
  const greenCount = pulseCards.green?.cards?.length || 0
  const redCount = pulseCards.red?.cards?.length || 0

  const boardColumns = columns.map((col) => ({
    id: col.id,
    title: col.title,
    icon: col.icon,
    color: col.color,
    cards: pulseCards[col.id]?.cards || []
  }))

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-3 mb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-600" />
            Team Pulse
          </h1>
          <div className="flex gap-6 text-sm">
            <div className="text-right">
              <div className="font-bold text-gray-900">{totalTeam}</div>
              <p className="text-xs text-gray-500">Team Size</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600">{greenCount}</div>
              <p className="text-xs text-gray-500">Healthy</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-600 flex items-center justify-end gap-1">
                <AlertCircle className="w-4 h-4" />
                {redCount}
              </div>
              <p className="text-xs text-gray-500">Needs Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={boardColumns}
          onCardClick={(card) => console.log('Person clicked:', card)}
          onCardDelete={handleCardDelete}
          onAddCard={handleAddCard}
          onDragEnd={handleDragEnd}
          cardContentRenderer={(card) => (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg" title={card.sentiment}>
                  {card.sentiment === 'green' ? '😊' : 
                   card.sentiment === 'yellow' ? '😐' : 
                   card.sentiment === 'red' ? '😟' : '🌴'}
                </span>
                <h4 className="font-semibold text-sm text-gray-900">{card.title}</h4>
              </div>
              <p className="text-xs text-gray-700">{card.subtitle}</p>
              {card.details &&
                card.details.map((detail, idx) => (
                  <p key={idx} className="text-xs text-gray-600">
                    {detail}
                  </p>
                ))}
              {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {card.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        />
      </div>

      <TeamPulseForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleFormSave}
        initialColumnId={selectedColumnId}
      />
    </div>
  )
}

function TeamPulseForm({ isOpen, onClose, onSave, initialColumnId }) {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Team Member',
    team: 'General',
    email: '',
    skills: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        role: 'Team Member',
        team: 'General',
        email: '',
        skills: ''
      })
      setErrors({})
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.role.trim()) newErrors.role = 'Role is required'
    if (!formData.team.trim()) newErrors.team = 'Team is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const status = initialColumnId === 'onleave' ? 'on-leave' : 'active'
    const parsedSkills = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const record = {
      id: generateID('employee'),
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role.trim(),
      team: formData.team.trim(),
      status,
      seniority: '',
      manager: '',
      startDate: new Date().toISOString().split('T')[0],
      salary: 0,
      equity: 0,
      vestingStart: '',
      vestingSchedule: 0,
      skills: parsedSkills,
      currentProjects: [],
      lastCheckInDate: new Date().toISOString().split('T')[0],
      nextCheckInDue: '',
      notes: '',
      redFlags: []
    }

    try {
      await addToDB(STORES.people, record)
      onSave(record, initialColumnId)
      onClose()
    } catch (error) {
      setErrors({ submit: 'Failed to save team member' })
      console.error('Error saving team member:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl border">
        <div className="px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add Team Pulse Card</h3>
          <p className="text-sm text-gray-600">Create a team member card for this column.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-gray-900">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-400"
              placeholder="Enter team member name"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-400"
              placeholder="Enter role"
            />
            {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <input
              name="team"
              value={formData.team}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-400"
              placeholder="Enter team"
            />
            {errors.team && <p className="text-xs text-red-600 mt-1">{errors.team}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-400"
              placeholder="Optional email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-400"
              placeholder="React, Communication, SQL"
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated values</p>
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

