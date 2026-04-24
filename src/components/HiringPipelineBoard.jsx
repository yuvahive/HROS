import React, { useState, useEffect, useContext } from 'react'
import { Users, Calendar, TrendingUp } from 'lucide-react'
import KanbanBoard from './KanbanBoard'
import HiringForm from './HiringForm'
import { getAllFromDB, updateInDB, deleteFromDB } from '../utils/indexedDB'
import { STORES } from '../utils/indexedDB'
import { AuthContext } from '../context/AuthContext'

export default function HiringPipelineBoard() {
  const { currentUser } = useContext(AuthContext)
  const [hiringCards, setHiringCards] = useState({})
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  const stages = [
    { id: 'applicant', title: 'Applications', icon: '📝', color: 'blue' },
    { id: 'screening', title: 'Screening', icon: '🔍', color: 'purple' },
    { id: 'interview', title: 'Interview', icon: '🎤', color: 'yellow' },
    { id: 'offered', title: 'Offered', icon: '📋', color: 'green' },
    { id: 'hired', title: 'Hired', icon: '✨', color: 'green' }
  ]

  // Load hiring data from IndexedDB
  useEffect(() => {
    const loadHiringData = async () => {
      try {
        const hiringPipeline = await getAllFromDB(STORES.hiringPipeline)
        const grouped = {
          applicant: { cards: [] },
          screening: { cards: [] },
          interview: { cards: [] },
          offered: { cards: [] },
          hired: { cards: [] }
        }

        hiringPipeline.forEach((hire) => {
          const card = {
            id: hire.id,
            title: hire.name,
            subtitle: hire.role,
            details: [
              `Applied: ${new Date(hire.appliedDate).toLocaleDateString()}`,
              hire.screeningScore ? `Score: ${hire.screeningScore}/10` : '',
              hire.offerSalary ? `Offer: $${hire.offerSalary}` : ''
            ].filter(Boolean),
            tags: [hire.source],
            status: hire.stage,
            stage: hire.stage,
            data: hire
          }

          if (grouped[hire.stage]) {
            grouped[hire.stage].cards.push(card)
          }
        })

        setHiringCards(grouped)
        setLoading(false)
      } catch (error) {
        console.error('Error loading hiring data:', error)
        setLoading(false)
      }
    }

    loadHiringData()
  }, [])

  // Handle card drag/drop to change stage
  const handleDragEnd = async ({ card, targetColumn }) => {
    if (currentUser?.role !== 'admin') {
      alert('Only administrators can move candidates')
      return
    }

    const sourceStage = card.stage || card.data?.stage
    if (!sourceStage || sourceStage === targetColumn) {
      return
    }

    try {
      const updatedRecord = {
        ...card.data,
        stage: targetColumn
      }
      await updateInDB(STORES.hiringPipeline, updatedRecord)

      // Update local state
      const newCards = { ...hiringCards }
      newCards[sourceStage].cards = newCards[sourceStage].cards.filter(
        (c) => c.id !== card.id
      )
      newCards[targetColumn].cards.push({
        ...card,
        stage: targetColumn,
        data: {
          ...card.data,
          stage: targetColumn
        }
      })
      setHiringCards(newCards)

      // Show success message
      console.log(`Moved ${card.title} to ${targetColumn}`)
    } catch (error) {
      console.error('Error updating hiring stage:', error)
    }
  }

  // Handle card deletion
  const handleCardDelete = async (cardId, stageId) => {
    if (currentUser?.role !== 'admin') {
      alert('Only administrators can delete candidate records')
      return
    }

    if (!window.confirm('Are you sure you want to delete this candidate?')) {
      return
    }

    try {
      await deleteFromDB(STORES.hiringPipeline, cardId)
      const newCards = { ...hiringCards }
      newCards[stageId].cards = newCards[stageId].cards.filter((c) => c.id !== cardId)
      setHiringCards(newCards)
    } catch (error) {
      console.error('Error deleting hire:', error)
    }
  }

  // Handle add new candidate
  const handleAddCard = (stageId) => {
    if (currentUser?.role !== 'admin') {
      alert('Only administrators can add candidates')
      return
    }
    setSelectedCandidate(null)
    setFormOpen(true)
  }

  // Handle card click for editing
  const handleCardClick = (card) => {
    if (currentUser?.role !== 'admin') {
      alert('Only administrators can edit candidates')
      return
    }
    setSelectedCandidate(card.data)
    setFormOpen(true)
  }

  // Reload hiring data after form save
  const handleFormSave = async () => {
    const hiringPipeline = await getAllFromDB(STORES.hiringPipeline)
    const grouped = {
      applicant: { cards: [] },
      screening: { cards: [] },
      interview: { cards: [] },
      offered: { cards: [] },
      hired: { cards: [] }
    }

    hiringPipeline.forEach((hire) => {
      const card = {
        id: hire.id,
        title: hire.name,
        subtitle: hire.role,
        details: [
          `Applied: ${new Date(hire.appliedDate).toLocaleDateString()}`,
          hire.screeningScore ? `Score: ${hire.screeningScore}/10` : '',
          hire.offerSalary ? `Offer: $${hire.offerSalary}` : ''
        ].filter(Boolean),
        tags: [hire.source],
        status: hire.stage,
        stage: hire.stage,
        data: hire
      }

      if (grouped[hire.stage]) {
        grouped[hire.stage].cards.push(card)
      }
    })

    setHiringCards(grouped)
  }

  if (loading) {
    return <div className="p-8 text-center">Loading hiring pipeline...</div>
  }

  const boardColumns = stages.map((stage) => ({
    id: stage.id,
    title: stage.title,
    icon: stage.icon,
    color: stage.color,
    cards: hiringCards[stage.id]?.cards || []
  }))

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              Hiring Pipeline
            </h1>
            <p className="text-gray-600 mt-1">Track candidates from application to hire</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(hiringCards).reduce((sum, stage) => sum + (stage.cards?.length || 0), 0)}
              </div>
              <p className="text-xs text-gray-600">Total Candidates</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {hiringCards.hired?.cards?.length || 0}
              </div>
              <p className="text-xs text-gray-600">Hired</p>
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

      {/* Hiring Form Modal */}
      <HiringForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleFormSave}
        initialData={selectedCandidate}
      />
    </div>
  )
}
