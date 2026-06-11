import React, { useState, useEffect, useContext } from 'react'
import { Users, Plus, Filter, Download, Settings, Award, AlertCircle, TrendingUp } from 'lucide-react'
import { getAllFromDB, updateInDB, deleteFromDB, addToDB, STORES } from '../utils/indexedDB'
import { generateID } from '../utils/sampleData'
import { AuthContext, useCloudPulse } from '../context/AuthContext'
import InternshipForm from './InternshipForm'
import { generateInternshipCertificate } from '../utils/certificateGenerator'
import KanbanBoard from './KanbanBoard'

export default function InternshipBoard() {
  const { cloudStatus, filterByTeam } = useContext(AuthContext)
  const lastPulse = useCloudPulse()
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedInternship, setSelectedInternship] = useState(null)
  const [generating, setGenerating] = useState(false)

  const stages = [
    { id: 'onboarding', title: 'Onboarding', icon: '📋', color: 'blue' },
    { id: 'active', title: 'Active', icon: '⚡', color: 'yellow' },
    { id: 'final-review', title: 'Final Review', icon: '🔍', color: 'purple' },
    { id: 'completed', title: 'Completed', icon: '✅', color: 'green' },
    { id: 'rejected', title: 'Rejected', icon: '❌', color: 'red' }
  ]

  useEffect(() => {
    loadInternships()
  }, [lastPulse])

  const loadInternships = async () => {
    try {
      const records = await getAllFromDB(STORES.internships)
      const filtered = filterByTeam(records)
      setInternships(filtered || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading internships:', error)
      setLoading(false)
    }
  }

  const handleDeleteInternship = async (id) => {
    if (!window.confirm('Delete this internship record?')) return
    await deleteFromDB(STORES.internships, id)
    await loadInternships()
  }

  const handleSaveInternship = async (formData) => {
    if (selectedInternship?.id) {
      await updateInDB(STORES.internships, formData)
    } else {
      await addToDB(STORES.internships, formData)
    }
    await loadInternships()
    setFormOpen(false)
    setSelectedInternship(null)
  }

  const handleGenerateCertificate = async (internship) => {
    setGenerating(true)
    try {
      const updated = {
        ...internship,
        certificateGenerated: true,
        certificateGeneratedDate: new Date().toISOString().split('T')[0],
        certificateId: generateID('cert')
      }
      await updateInDB(STORES.internships, updated)
      const result = await generateInternshipCertificate(updated)
      if (result.success) {
        alert(`Certificate generated successfully: ${result.fileName}`)
        await loadInternships()
      } else {
        alert(`Error generating certificate: ${result.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate certificate')
    } finally {
      setGenerating(false)
    }
  }

  const getKanbanData = () => {
    const grouped = { onboarding: [], active: [], 'final-review': [], completed: [], rejected: [] }
    internships.forEach((intern) => {
      const stage = intern.stage || 'onboarding'
      const daysElapsed = Math.floor((Date.now() - new Date(intern.startDate)) / 86400000)
      const totalDays = Math.floor((new Date(intern.endDate) - new Date(intern.startDate)) / 86400000)
      grouped[stage]?.push({
        id: intern.id,
        title: intern.personName,
        subtitle: intern.position,
        details: [
          intern.college,
          `${intern.durationWeeks} weeks`,
          intern.finalScore ? `Score: ${intern.finalScore}/10` : ''
        ].filter(Boolean),
        tags: [stage, intern.department].filter(Boolean),
        status: stage,
        data: intern
      })
    })
    return grouped
  }

  const handleDragEnd = async ({ card, targetColumn }) => {
    const sourceStage = card.status
    if (sourceStage === targetColumn) return
    const updated = { ...card.data, stage: targetColumn }
    await updateInDB(STORES.internships, updated)
    await loadInternships()
  }

  const handleCardDelete = async (cardId) => {
    await handleDeleteInternship(cardId)
  }

  const handleAddCard = () => {
    setSelectedInternship(null)
    setFormOpen(true)
  }

  const handleCardClick = (card) => {
    setSelectedInternship(card.data)
    setFormOpen(true)
  }

  const getPerformanceStats = () => {
    const withScores = internships.filter((i) => i.finalScore)
    if (withScores.length === 0) return 0
    return (withScores.reduce((sum, i) => sum + i.finalScore, 0) / withScores.length).toFixed(1)
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Syncing internship database...</div>

  const kanbanData = getKanbanData()
  const boardColumns = stages.map((stage) => ({
    id: stage.id,
    title: stage.title,
    icon: stage.icon,
    color: stage.color,
    cards: kanbanData[stage.id]
  }))

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 overflow-hidden">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-2 rounded-xl text-white shadow-sm shadow-purple-200">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Internship Management</h1>
              <p className="text-sm text-gray-600">Onboarding → Evaluation → Certification</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-right">
              <div className="font-bold text-blue-600">{internships.length}</div>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600">{kanbanData.completed?.length || 0}</div>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-purple-600">{getPerformanceStats()}/10</div>
              <p className="text-xs text-gray-500">Avg Score</p>
            </div>
          </div>
          <button
            onClick={() => { setSelectedInternship(null); setFormOpen(true); }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            New Internship
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={boardColumns}
          onCardClick={handleCardClick}
          onCardDelete={handleCardDelete}
          onAddCard={handleAddCard}
          onDragEnd={handleDragEnd}
          cardContentRenderer={(card) => {
            const intern = card.data
            return (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-900">{card.title}</h4>
                <p className="text-xs text-gray-600">{card.subtitle}</p>
                <div className="flex flex-wrap gap-1">
                  {card.tags?.map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{tag}</span>
                  ))}
                </div>
                {intern.college && <p className="text-xs text-gray-500">{intern.college}</p>}
                {intern.finalScore && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-bold text-green-600">{intern.finalScore}/10</span>
                    <span className="text-gray-500">Final Score</span>
                  </div>
                )}
                {intern.stage === 'completed' && !intern.certificateGenerated && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleGenerateCertificate(intern); }}
                    className="w-full mt-1 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded text-[10px] font-semibold hover:shadow-md transition-shadow flex items-center justify-center gap-1"
                  >
                    <Award className="w-3 h-3" />
                    Generate Certificate
                  </button>
                )}
                {intern.certificateGenerated && (
                  <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                    <Award className="w-3 h-3" />
                    Certificate Generated
                  </div>
                )}
              </div>
            )
          }}
        />
      </div>

      <InternshipForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setSelectedInternship(null); }}
        onSave={handleSaveInternship}
        initialData={selectedInternship}
      />
    </div>
  )
}
