import React, { useState, useEffect, useContext } from 'react'
import { Zap, CheckCircle2, AlertCircle, Plus, Edit2, Trash2, Settings, Save, X, Bell } from 'lucide-react'
import { getAllFromDB, updateInDB, deleteFromDB, addToDB, STORES } from '../utils/indexedDB'
import { generateID } from '../utils/sampleData'
import { AuthContext, useCloudPulse } from '../context/AuthContext'
import { CloudStorage } from '../services/GoogleSheetsService'
import KanbanBoard from './KanbanBoard'

export default function OnboardingBoard() {
  const { cloudStatus, idpConfig, hasPermission, filterByTeam } = useContext(AuthContext)
  const lastPulse = useCloudPulse()
  const canCreate = hasPermission('onboarding', 'create')
  const canUpdate = hasPermission('onboarding', 'update')
  const canDelete = hasPermission('onboarding', 'delete')
  const [onboardingRecords, setOnboardingRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const [milestones, setMilestones] = useState([
    { day: 1, title: 'Day 1: Onboarding', tasks: 'Office tour\nIT setup\nTeam intro\nSend welcome email' },
    { day: 7, title: 'Week 1: Getting Started', tasks: 'First week feedback\nSystem access\nRole clarity\nMentor assigned' },
    { day: 14, title: 'Week 2: Ramping Up', tasks: 'First project assigned\nCode/process review\nTeam sync\nInitial feedback' },
    { day: 30, title: 'Day 30: 30-Day Review', tasks: 'Performance review\nFeedback session\nCulture fit assess\nConfirm hire' }
  ])

  const stages = [
    { id: 'new', title: 'New Hires', icon: '🚀', color: 'blue' },
    { id: 'started', title: 'Getting Started', icon: '📋', color: 'yellow' },
    { id: 'ramping', title: 'Ramping Up', icon: '⚡', color: 'purple' },
    { id: 'review', title: '30-Day Review', icon: '🔍', color: 'red' },
    { id: 'completed', title: 'Confirmed', icon: '✅', color: 'green' }
  ]

  useEffect(() => {
    loadOnboardingData()
  }, [lastPulse])

  useEffect(() => {
    if (idpConfig?.onboardingMilestones) {
      setMilestones(idpConfig.onboardingMilestones)
    }
  }, [idpConfig])

  const loadOnboardingData = async () => {
    try {
      const records = await getAllFromDB(STORES.onboarding)
      const filtered = filterByTeam(records)
      setOnboardingRecords(filtered)
      setLoading(false)
    } catch (error) {
      console.error('Error loading onboarding data:', error)
      setLoading(false)
    }
  }

  const handleDeleteRecord = async (id) => {
    if (!canDelete) { alert('You don\'t have permission to delete onboarding records'); return }
    if (!window.confirm('Delete this record?')) return
    await deleteFromDB(STORES.onboarding, id)
    await loadOnboardingData()
  }

  const handleSaveRecord = async (formData) => {
    if (selectedRecord?.id) {
      if (!canUpdate) { alert('You don\'t have permission to update onboarding records'); return }
      await updateInDB(STORES.onboarding, formData)
    } else {
      if (!canCreate) { alert('You don\'t have permission to create onboarding records'); return }
      await addToDB(STORES.onboarding, formData)
    }
    await loadOnboardingData()
    setFormOpen(false)
  }

  const getProgressPercentage = (record) => {
    if (!record.milestoneStatus) return 0
    const completed = Object.values(record.milestoneStatus).filter((s) => s === true).length
    return Math.round((completed / milestones.length) * 100)
  }

  const getDaysElapsed = (startDate) => {
    const start = new Date(startDate)
    const now = new Date()
    return Math.floor((now - start) / (1000 * 60 * 60 * 24))
  }

  const getStatus = (record) => {
    const daysElapsed = getDaysElapsed(record.startDate)
    if (daysElapsed >= 30) return record.completionStatus === 'confirmed' ? 'completed' : 'review'
    if (daysElapsed >= 14) return 'ramping'
    if (daysElapsed >= 7) return 'started'
    return 'new'
  }

  const getKanbanData = () => {
    const grouped = { new: [], started: [], ramping: [], review: [], completed: [] }
    onboardingRecords.forEach((record) => {
      const status = getStatus(record)
      const days = getDaysElapsed(record.startDate)
      const progress = getProgressPercentage(record)
      grouped[status].push({
        id: record.id,
        title: record.name,
        subtitle: `${record.role} • ${record.department}`,
        details: [`Day ${days}`, `${progress}% complete`],
        tags: [record.completionStatus || 'pending'],
        status,
        data: record
      })
    })
    return grouped
  }

  const handleDragEnd = async ({ card, targetColumn }) => {
    if (!canUpdate) { alert('You don\'t have permission to move hires'); return }
    const sourceStatus = card.status
    if (sourceStatus === targetColumn) return

    let updatedRecord = { ...card.data }
    if (targetColumn === 'completed') {
      updatedRecord.completionStatus = 'confirmed'
    } else if (targetColumn === 'review') {
      updatedRecord.completionStatus = 'at-risk'
    } else {
      updatedRecord.completionStatus = 'pending'
    }
    await updateInDB(STORES.onboarding, updatedRecord)
    await loadOnboardingData()
  }

  const handleCardDelete = async (cardId) => {
    await handleDeleteRecord(cardId)
  }

  const handleAddCard = () => {
    if (!canCreate) { alert('You don\'t have permission to add hires'); return }
    setSelectedRecord(null)
    setFormOpen(true)
  }

  const handleCardClick = (card) => {
    setSelectedRecord(card.data)
    setFormOpen(true)
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Syncing database...</div>

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
            <div className="bg-yellow-500 p-2 rounded-xl text-white shadow-sm shadow-yellow-200">
               <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Onboarding Flow</h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Success Markers Dashboard</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            {stages.map((stage) => (
              <div key={stage.id} className="text-right">
                <div className="font-bold text-slate-900">{kanbanData[stage.id].length}</div>
                <p className="text-xs text-gray-500">{stage.title}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              title="Edit Global Milestones"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setSelectedRecord(null); setFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <Plus className="w-4 h-4" /> Add Hire
            </button>
          </div>
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
            const days = getDaysElapsed(card.data.startDate)
            const progress = getProgressPercentage(card.data)
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 uppercase tracking-tighter">
                    Day {days}
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 uppercase tracking-tighter">
                    {progress}%
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-gray-900">{card.title}</h4>
                <p className="text-xs text-gray-600">{card.subtitle}</p>
                {milestones.map((m, idx) => {
                  const done = card.data.milestoneStatus?.[`milestone_${idx}`]
                  const active = days >= m.day
                  return (
                    <div key={idx} className={`text-[10px] flex items-center gap-1 ${done ? 'text-green-600' : active ? 'text-blue-600' : 'text-gray-400'}`}>
                      <span>{done ? '✓' : active ? '●' : '○'}</span>
                      <span className="truncate">{m.title}</span>
                    </div>
                  )
                })}
              </div>
            )
          }}
        />
      </div>

      {settingsOpen && (
        <MilestoneSettings
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          milestones={milestones}
          hrAlertEmail={idpConfig?.hrAlertEmail || ''}
          onSave={async (newM, hrEmail) => {
            setMilestones(newM);
            const newConfig = { ...idpConfig, onboardingMilestones: newM, hrAlertEmail: hrEmail };
            await CloudStorage.update('Config', [newConfig]);
            setSettingsOpen(false);
          }}
        />
      )}

      {formOpen && (
        <OnboardingForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={handleSaveRecord} initialData={selectedRecord} />
      )}
    </div>
  )
}

function MilestoneSettings({ isOpen, onClose, milestones, hrAlertEmail, onSave }) {
  const [localM, setLocalM] = useState([...milestones]);
  const [localHR, setLocalHR] = useState(hrAlertEmail);
  
  const update = (idx, field, val) => {
    const next = [...localM];
    next[idx][field] = val;
    setLocalM(next);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-slate-900">
      <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Milestone Engine</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Global orientation configuration</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        <div className="p-8 overflow-y-auto space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <label className="text-[10px] font-black uppercase text-blue-600 mb-2 block">Central HR Alert Email (For Critical Updates)</label>
            <input 
              type="email" 
              value={localHR} 
              onChange={(e) => setLocalHR(e.target.value)} 
              placeholder="hr@company.com"
              style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl font-bold placeholder:text-slate-400" 
            />
          </div>
          {localM.map((m, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Trigger Day</label>
                  <input 
                    type="number" value={m.day} 
                    onChange={(e) => update(i, 'day', parseInt(e.target.value))} 
                    style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold" 
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Title</label>
                  <input 
                    type="text" value={m.title} 
                    onChange={(e) => update(i, 'title', e.target.value)} 
                    style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold" 
                    placeholder="E.g. Day 1"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Task List (One per line)</label>
                <textarea 
                  rows="3" value={m.tasks} 
                  onChange={(e) => update(i, 'tasks', e.target.value)} 
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold" 
                  placeholder="Task 1\nTask 2..."
                />
              </div>
            </div>
          ))}
        </div>
        <div className="p-8 border-t flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl">Cancel</button>
          <button onClick={() => onSave(localM, localHR)} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> Deploy Global Change
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingForm({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    id: '', name: '', role: '', department: '', startDate: new Date().toISOString().split('T')[0],
    email: '', managerEmail: '', sendWelcomeEmail: true, completionStatus: 'pending', milestoneStatus: {}
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData(prev => ({ ...prev, id: generateID('onboard'), startDate: new Date().toISOString().split('T')[0] }));
  }, [isOpen, initialData]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-slate-900">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-8 border-b bg-slate-50">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Onboard Hire</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-6">
          <div className="space-y-4">
            <input 
               type="text" value={formData.name} 
               onChange={(e) => setFormData({...formData, name: e.target.value})} 
               placeholder="Hire Name" 
               style={{ color: '#0f172a', backgroundColor: '#e2e8f0' }}
               className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold placeholder:text-slate-500" 
            />
            <div className="grid grid-cols-2 gap-4">
              <input 
                 type="text" value={formData.role} 
                 onChange={(e) => setFormData({...formData, role: e.target.value})} 
                 placeholder="Role" 
                 style={{ color: '#0f172a', backgroundColor: '#e2e8f0' }}
                 className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold placeholder:text-slate-500" 
              />
              <input 
                 type="text" value={formData.department} 
                 onChange={(e) => setFormData({...formData, department: e.target.value})} 
                 placeholder="Dept" 
                 style={{ color: '#0f172a', backgroundColor: '#e2e8f0' }}
                 className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold placeholder:text-slate-500" 
              />
            </div>
            <input 
               type="email" value={formData.email} 
               onChange={(e) => setFormData({...formData, email: e.target.value})} 
               placeholder="Work Email" 
               style={{ color: '#0f172a', backgroundColor: '#e2e8f0' }}
               className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold placeholder:text-slate-500" 
            />
            <input 
               type="email" value={formData.managerEmail} 
               onChange={(e) => setFormData({...formData, managerEmail: e.target.value})} 
               placeholder="Reporting Manager Email" 
               style={{ color: '#0f172a', backgroundColor: '#e2e8f0' }}
               className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold placeholder:text-slate-500" 
            />
            <div className="flex items-center gap-2 px-4">
              <input 
                type="checkbox" 
                checked={formData.sendWelcomeEmail}
                onChange={(e) => setFormData({...formData, sendWelcomeEmail: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="text-xs font-bold text-slate-600">Send "First Day" Welcome Email automatically</span>
            </div>
            <input 
               type="date" value={formData.startDate} 
               onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
               style={{ color: '#0f172a', backgroundColor: '#e2e8f0' }}
               className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold" 
            />
          </div>
          <div className="pt-6 border-t flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200">Start Orientation</button>
          </div>
        </form>
      </div>
    </div>
  );
}
