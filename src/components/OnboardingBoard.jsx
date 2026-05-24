import React, { useState, useEffect, useContext } from 'react'
import { Zap, CheckCircle2, AlertCircle, Plus, Edit2, Trash2, Settings, Save, X, Bell } from 'lucide-react'
import { getAllFromDB, updateInDB, deleteFromDB, addToDB, STORES } from '../utils/indexedDB'
import { generateID } from '../utils/sampleData'
import { AuthContext } from '../context/AuthContext'
import { CloudStorage } from '../services/GoogleSheetsService'

export default function OnboardingBoard() {
  const { cloudStatus, lastPulse, idpConfig } = useContext(AuthContext)
  const [onboardingRecords, setOnboardingRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Load milestones from cloud config or use defaults
  const [milestones, setMilestones] = useState([
    { day: 1, title: 'Day 1: Onboarding', tasks: 'Office tour\nIT setup\nTeam intro\nSend welcome email' },
    { day: 7, title: 'Week 1: Getting Started', tasks: 'First week feedback\nSystem access\nRole clarity\nMentor assigned' },
    { day: 14, title: 'Week 2: Ramping Up', tasks: 'First project assigned\nCode/process review\nTeam sync\nInitial feedback' },
    { day: 30, title: 'Day 30: 30-Day Review', tasks: 'Performance review\nFeedback session\nCulture fit assess\nConfirm hire' }
  ])

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
      setOnboardingRecords(records)
      setLoading(false)
    } catch (error) {
      console.error('Error loading onboarding data:', error)
      setLoading(false)
    }
  }

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete this record?')) return
    await deleteFromDB(STORES.onboarding, id)
    await loadOnboardingData()
  }

  const handleSaveRecord = async (formData) => {
    if (selectedRecord?.id) {
      await updateInDB(STORES.onboarding, formData)
    } else {
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

  const statusColors = {
    new: 'bg-blue-50 border-blue-100',
    started: 'bg-yellow-50 border-yellow-100',
    ramping: 'bg-purple-50 border-purple-100',
    review: 'bg-orange-50 border-orange-100',
    completed: 'bg-green-50 border-green-100'
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Syncing database...</div>

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 overflow-hidden">
      {/* 🚀 COMPACT HEADER */}
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

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#f8fbfe]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-[1600px] mx-auto">
          {onboardingRecords.map((record) => {
            const days = getDaysElapsed(record.startDate);
            const status = getStatus(record);
            const progress = getProgressPercentage(record);
            
            return (
              <div key={record.id} className={`bg-white border-2 rounded-2xl p-4 flex flex-col hover:border-blue-400 transition-all duration-300 group ${statusColors[status]}`}>
                {/* 🏷️ TIGHT CARD HEADER */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[9px] font-black px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 uppercase tracking-tighter">
                         Day {days}
                       </span>
                    </div>
                    <h3 className="font-bold text-slate-900 truncate leading-tight">{record.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{record.role} • {record.department}</p>
                  </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={async () => {
                          if (!record.email) return alert('No email found for this hire!');
                          const confirm = window.confirm(`Send a status nudge email to ${record.name}?`);
                          if (confirm) {
                            await CloudStorage.update('Notification', [{
                              type: 'nudge',
                              to: record.email,
                              name: record.name,
                              progress: progress,
                              days: days
                            }], 'notify');
                            alert('Nudge sent to manager queue!');
                          }
                        }}
                        className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-yellow-600"
                        title="Send Email Nudge"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setSelectedRecord(record); setFormOpen(true); }} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteRecord(record.id)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                </div>

                {/* 📊 MINI STATS */}
                <div className="flex gap-2 mb-4">
                  <div className="bg-white bg-opacity-70 flex-1 px-2.5 py-1.5 rounded-xl border border-slate-100">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-center">Stability</p>
                     <p className="text-xs font-black text-slate-900 text-center">{progress}%</p>
                  </div>
                  <div className="bg-white bg-opacity-70 flex-1 px-2.5 py-1.5 rounded-xl border border-slate-100">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-center">Velocity</p>
                     <p className="text-xs font-black text-slate-900 text-center">{Math.min(days, 30)}/30</p>
                  </div>
                </div>

                {/* 📑 COMPACT MILESTONE LIST */}
                <div className="flex-1 space-y-2">
                  {milestones.map((m, idx) => {
                    const done = record.milestoneStatus?.[`milestone_${idx}`];
                    const active = days >= m.day;
                    return (
                      <div key={idx} className={`p-2 rounded-xl border flex flex-col gap-1 transition-all ${done ? 'bg-green-50 border-green-200' : active ? 'bg-white border-blue-100 shadow-sm' : 'opacity-40 grayscale border-transparent'}`}>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={done} 
                            disabled={!active}
                            onChange={async (e) => {
                              const updated = { ...record, milestoneStatus: { ...record.milestoneStatus, [`milestone_${idx}`]: e.target.checked } };
                              await updateInDB(STORES.onboarding, updated);
                              await loadOnboardingData();
                            }}
                            className="w-4 h-4 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" 
                          />
                          <span className={`text-[11px] font-bold ${done ? 'text-green-700' : 'text-slate-700'}`}>{m.title}</span>
                          {active && !done && <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse ml-auto" />}
                        </div>
                        {active && !done && (
                          <div className="pl-6 text-[10px] text-slate-500 font-medium">
                            {m.tasks.split('\n')[0]}...
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* 🔘 STATUS CAPSULE */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <select
                    value={record.completionStatus || 'pending'}
                    onChange={async (e) => {
                      const updated = { ...record, completionStatus: e.target.value };
                      await updateInDB(STORES.onboarding, updated);
                      await loadOnboardingData();
                    }}
                    className="w-full text-[10px] font-black uppercase tracking-widest py-2 rounded-xl border-none bg-slate-900 text-white text-center cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    <option value="pending">⏳ Pending Review</option>
                    <option value="confirmed">✅ Deploy Confirmed</option>
                    <option value="at-risk">⚠️ Risk Detected</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ⚙️ GLOBAL MILESTONE SETTINGS MODAL */}
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

      {/* 📝 NEW HIRE MODAL */}
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
