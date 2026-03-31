import React, { useState, useEffect, useContext } from 'react'
import { CheckCircle, AlertCircle, BarChart3 } from 'lucide-react'
import KanbanBoard from './KanbanBoard'
import { getAllFromDB, updateInDB, deleteFromDB } from '../utils/indexedDB'
import { STORES } from '../utils/indexedDB'
import { AuthContext } from '../context/AuthContext'

export default function DailyWorkBoard() {
  const { currentUser } = useContext(AuthContext)
  const [workCards, setWorkCards] = useState({})
  const [loading, setLoading] = useState(true)

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
          onAddCard={() => console.log('Add work log')}
          onDragEnd={handleDragEnd}
        />
      </div>
    </div>
  )
}
