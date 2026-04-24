import React, { useState, useEffect, useContext } from 'react'
import { Users, Calendar, UserCheck } from 'lucide-react'
import KanbanBoard from './KanbanBoard'
import OneOnOneForm from './OneOnOneForm'
import { getAllFromDB, updateInDB, deleteFromDB } from '../utils/indexedDB'
import { STORES } from '../utils/indexedDB'
import { AuthContext } from '../context/AuthContext'

export default function OneOnOneBoard() {
  const { currentUser } = useContext(AuthContext)
  const [meetingCards, setMeetingCards] = useState({})
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [people, setPeople] = useState([])

  const statuses = [
    { id: 'scheduled', title: 'Scheduled', icon: '📅', color: 'blue' },
    { id: 'completed', title: 'Completed', icon: '✅', color: 'green' },
    { id: 'cancelled', title: 'Cancelled', icon: '❌', color: 'gray' }
  ]

  // Load 1:1 data from IndexedDB
  useEffect(() => {
    const loadOneOnOneData = async () => {
      try {
        // Load people
        const peopleData = await getAllFromDB(STORES.people)
        setPeople(peopleData)

        // Load 1:1 meetings
        const oneOnOnes = await getAllFromDB(STORES.oneOnOnes)
        const grouped = {
          scheduled: { cards: [] },
          completed: { cards: [] },
          cancelled: { cards: [] }
        }

        oneOnOnes.forEach((meeting) => {
          const wellbeingColor =
            meeting.wellbeingScore <= 3 ? '🔴' : meeting.wellbeingScore <= 6 ? '🟡' : '🟢'

          const card = {
            id: meeting.id,
            title: meeting.personName,
            subtitle: meeting.meetingType === 'regular' ? '1:1 Check-in' : `${meeting.meetingType}`,
            details: [
              `${new Date(meeting.scheduledDate).toLocaleDateString()} at ${meeting.scheduledTime}`,
              `${meeting.duration} min`,
              meeting.wellbeingScore ? `Wellbeing: ${wellbeingColor} ${meeting.wellbeingScore}/10` : ''
            ].filter(Boolean),
            tags: [meeting.status === 'completed' ? '✓ Done' : 'Pending'],
            status: meeting.status,
            data: meeting
          }

          if (grouped[meeting.status]) {
            grouped[meeting.status].cards.push(card)
          }
        })

        setMeetingCards(grouped)
        setLoading(false)
      } catch (error) {
        console.error('Error loading 1:1 data:', error)
        setLoading(false)
      }
    }

    loadOneOnOneData()
  }, [])

  // Handle card drag/drop to change status
  const handleDragEnd = async ({ card, targetColumn }) => {
    // Determine the actual current status (fallback to data if moving for first time)
    const sourceStatus = card.status || card.data.status

    if (!sourceStatus || sourceStatus === targetColumn) {
      return
    }

    try {
      const updatedRecord = {
        ...card.data,
        status: targetColumn
      }
      await updateInDB(STORES.oneOnOnes, updatedRecord)

      // Update local state
      const newCards = { ...meetingCards }
      
      // Remove from source column
      newCards[sourceStatus].cards = newCards[sourceStatus].cards.filter(
        (c) => c.id !== card.id
      )
      
      // Add to target column with updated metadata
      newCards[targetColumn].cards.push({
        ...card,
        status: targetColumn,
        tags: [targetColumn === 'completed' ? '✓ Done' : 'Pending'],
        data: updatedRecord
      })
      
      setMeetingCards(newCards)

      console.log(`Moved ${card.title}'s 1:1 to ${targetColumn}`)
    } catch (error) {
      console.error('Error updating 1:1 status:', error)
    }
  }

  // Handle card deletion
  const handleCardDelete = async (cardId, statusId) => {    if (currentUser?.role !== 'admin') {
      alert('Only administrators can delete 1:1 records')
      return
    }

    if (!window.confirm('Are you sure you want to delete this 1:1 record?')) {
      return
    }
    try {
      await deleteFromDB(STORES.oneOnOnes, cardId)
      const newCards = { ...meetingCards }
      newCards[statusId].cards = newCards[statusId].cards.filter((c) => c.id !== cardId)
      setMeetingCards(newCards)
    } catch (error) {
      console.error('Error deleting 1:1:', error)
    }
  }

  // Handle add new meeting
  const handleAddCard = (statusId) => {
    setSelectedMeeting(null)
    setFormOpen(true)
  }

  // Handle card click for editing
  const handleCardClick = (card) => {
    setSelectedMeeting(card.data)
    setFormOpen(true)
  }

  // Reload meetings data after form save
  const handleFormSave = async () => {
    const oneOnOnes = await getAllFromDB(STORES.oneOnOnes)
    const grouped = {
      scheduled: { cards: [] },
      completed: { cards: [] },
      cancelled: { cards: [] }
    }

    oneOnOnes.forEach((meeting) => {
      const wellbeingColor =
        meeting.wellbeingScore <= 3 ? '🔴' : meeting.wellbeingScore <= 6 ? '🟡' : '🟢'

      const card = {
        id: meeting.id,
        title: meeting.personName,
        subtitle: meeting.meetingType === 'regular' ? '1:1 Check-in' : `${meeting.meetingType}`,
        details: [
          `${new Date(meeting.scheduledDate).toLocaleDateString()} at ${meeting.scheduledTime}`,
          `${meeting.duration} min`,
          meeting.wellbeingScore ? `Wellbeing: ${wellbeingColor} ${meeting.wellbeingScore}/10` : ''
        ].filter(Boolean),
        tags: [meeting.status === 'completed' ? '✓ Done' : 'Pending'],
        status: meeting.status,
        data: meeting
      }

      if (grouped[meeting.status]) {
        grouped[meeting.status].cards.push(card)
      }
    })

    setMeetingCards(grouped)
  }

  if (loading) {
    return <div className="p-8 text-center">Loading 1:1 meetings...</div>
  }

  const boardColumns = statuses.map((status) => ({
    id: status.id,
    title: status.title,
    icon: status.icon,
    color: status.color,
    cards: meetingCards[status.id]?.cards || []
  }))

  // Calculate stats
  const upcomingMeetings = meetingCards.scheduled?.cards?.filter((c) => {
    const meetingDate = new Date(c.data.scheduledDate)
    const today = new Date()
    return meetingDate >= today
  }).length || 0

  const completedThisWeek = meetingCards.completed?.cards?.filter((c) => {
    const completedDate = new Date(c.data.scheduledDate)
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return completedDate >= weekAgo && completedDate <= today
  }).length || 0

  const avgWellbeing =
    meetingCards.completed?.cards?.reduce((sum, c) => sum + (c.data.wellbeingScore || 0), 0) /
      (meetingCards.completed?.cards?.length || 1) || 0

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-purple-600" />
              1:1 Meetings
            </h1>
            <p className="text-gray-600 mt-1">Schedule and track individual conversations</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{upcomingMeetings}</div>
              <p className="text-xs text-gray-600">Upcoming</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedThisWeek}</div>
              <p className="text-xs text-gray-600">This Week</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {avgWellbeing.toFixed(1)}/10
              </div>
              <p className="text-xs text-gray-600">Avg Wellbeing</p>
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
                  <p key={idx} className="text-xs text-gray-600">
                    {detail}
                  </p>
                ))}
            </div>
          )}
        />
      </div>

      {/* 1:1 Form Modal */}
      <OneOnOneForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleFormSave}
        initialData={selectedMeeting}
      />
    </div>
  )
}
