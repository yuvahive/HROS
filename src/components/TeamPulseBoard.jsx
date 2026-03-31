import React, { useState, useEffect, useContext } from 'react'
import { AlertCircle, TrendingUp, Heart, Zap } from 'lucide-react'
import KanbanBoard from './KanbanBoard'
import { getAllFromDB, updateInDB, deleteFromDB } from '../utils/indexedDB'
import { STORES } from '../utils/indexedDB'
import { AuthContext } from '../context/AuthContext'

// Team Performance / Pulse Board - Health monitoring
export default function TeamPulseBoard() {
  const { currentUser } = useContext(AuthContext)
  const [pulseCards, setPulseCards] = useState({})
  const [loading, setLoading] = useState(true)

  const columns = [
    { id: 'green', title: 'Green ✅', icon: '😊', color: 'green', sentiment: 'green' },
    { id: 'yellow', title: 'Yellow ⚠️', icon: '😐', color: 'yellow', sentiment: 'yellow' },
    { id: 'red', title: 'Red 🔴', icon: '😤', color: 'red', sentiment: 'red' },
    { id: 'onleave', title: 'On Leave', icon: '🏖️', color: 'gray', sentiment: 'gray' }
  ]

  useEffect(() => {
    const loadPulseData = async () => {
      try {
        const people = await getAllFromDB(STORES.people)
        const grouped = {
          green: { cards: [] },
          yellow: { cards: [] },
          red: { cards: [] },
          onleave: { cards: [] }
        }

        people.forEach((person) => {
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
        // Sentiment is read-only based on data, but you could track override here
      }
      await updateInDB(STORES.people, updatedRecord)

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
      <div className="bg-white border-b p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-600" />
              Team Pulse
            </h1>
            <p className="text-gray-600 mt-1">Monthly team health check-ins and sentiment</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalTeam}</div>
              <p className="text-xs text-gray-600">Team Size</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{greenCount}</div>
              <p className="text-xs text-gray-600">Healthy</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
                <AlertCircle className="w-5 h-5" />
                {redCount}
              </div>
              <p className="text-xs text-gray-600">Needs Support</p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <strong>Red Flags Auto-Detected:</strong> Last check-in {'>'}30 days • Working {'>'}45 hrs/week •
          No days off {'>'}3 months • Mood decline
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={boardColumns}
          onCardClick={(card) => console.log('Person clicked:', card)}
          onCardDelete={handleCardDelete}
          onAddCard={() => console.log('Add not available')}
          onDragEnd={handleDragEnd}
        />
      </div>
    </div>
  )
}
