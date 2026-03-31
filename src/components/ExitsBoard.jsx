import React, { useState, useEffect } from 'react'
import { LogOut, Calendar, Target, MessageCircle, Plus, Edit2, Trash2 } from 'lucide-react'
import { getAllFromDB, updateInDB, deleteFromDB, addToDB, STORES } from '../utils/indexedDB'
import { generateID } from '../utils/sampleData'

export default function ExitsBoard() {
  const [exits, setExits] = useState([])
  const [selectedExit, setSelectedExit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all') // all, active, completed, alumni

  // Load exits data
  useEffect(() => {
    loadExitsData()
  }, [])

  const loadExitsData = async () => {
    try {
      const records = await getAllFromDB(STORES.exits)
      setExits(records)
      setLoading(false)
    } catch (error) {
      console.error('Error loading exits data:', error)
      setLoading(false)
    }
  }

  const handleAddExit = () => {
    setSelectedExit(null)
    setFormOpen(true)
  }

  const handleEditExit = (exit) => {
    setSelectedExit(exit)
    setFormOpen(true)
  }

  const handleDeleteExit = async (id) => {
    try {
      await deleteFromDB(STORES.exits, id)
      await loadExitsData()
    } catch (error) {
      console.error('Error deleting exit:', error)
    }
  }

  const handleSaveExit = async (formData) => {
    try {
      if (selectedExit?.id) {
        await updateInDB(STORES.exits, formData)
      } else {
        await addToDB(STORES.exits, formData)
      }
      await loadExitsData()
      setFormOpen(false)
    } catch (error) {
      console.error('Error saving exit:', error)
    }
  }

  const getExitStatus = (exit) => {
    const now = new Date()
    const exitDate = new Date(exit.lastDay)

    if (now < exitDate) {
      return 'pending'
    } else if (exit.exitInterviewStatus === 'completed') {
      return 'completed'
    } else {
      return 'pending'
    }
  }

  const filteredExits =
    filterStatus === 'all'
      ? exits
      : filterStatus === 'alumni'
        ? exits.filter((e) => getExitStatus(e) === 'completed' && e.alumniStatus === 'active')
        : exits.filter((e) => getExitStatus(e) === filterStatus)

  if (loading) {
    return <div className="p-8 text-center">Loading exit records...</div>
  }

  const stats = {
    pending: exits.filter((e) => getExitStatus(e) === 'pending').length,
    completed: exits.filter((e) => getExitStatus(e) === 'completed').length,
    alumni: exits.filter((e) => e.alumniStatus === 'active').length
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <LogOut className="w-8 h-8 text-red-600" />
              Exits & Alumni
            </h1>
            <p className="text-gray-600 mt-1">Track departures, exit interviews, and alumni network</p>
          </div>
          <button
            onClick={handleAddExit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Departure
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{exits.length}</div>
            <p className="text-xs text-gray-600">Total Departures</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-gray-600">In Progress</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{stats.alumni}</div>
            <p className="text-xs text-gray-600">Active Alumni</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border-b px-6 py-3 flex gap-2">
        {['all', 'pending', 'completed', 'alumni'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-1 rounded-full text-sm font-medium capitalize ${
              filterStatus === status
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Records */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredExits.length === 0 ? (
          <div className="text-center py-12">
            <LogOut className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {filterStatus === 'all' ? 'No exit records' : `No ${filterStatus} records`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl">
            {filteredExits.map((exit) => {
              const status = getExitStatus(exit)
              const now = new Date()
              const lastDay = new Date(exit.lastDay)
              const daysUntilExit = Math.ceil((lastDay - now) / (1000 * 60 * 60 * 24))

              return (
                <div
                  key={exit.id}
                  className={`border rounded-lg p-4 ${
                    status === 'pending'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{exit.name}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {exit.role} • {exit.department}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditExit(exit)}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteExit(exit.id)}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    <div className="bg-white bg-opacity-60 p-2 rounded">
                      <p className="text-gray-600">Last Day</p>
                      <p className="font-semibold text-gray-900">{new Date(exit.lastDay).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-white bg-opacity-60 p-2 rounded">
                      <p className="text-gray-600">Reason</p>
                      <p className="font-semibold text-gray-900 capitalize">{exit.reason}</p>
                    </div>
                    <div className={`p-2 rounded ${daysUntilExit > 0 ? 'bg-white bg-opacity-60' : 'bg-gray-200'}`}>
                      <p className="text-gray-600">Days Until</p>
                      <p
                        className={`font-semibold ${daysUntilExit > 0 ? 'text-gray-900' : 'text-red-600'}`}
                      >
                        {daysUntilExit > 0 ? daysUntilExit : 'Exited'}
                      </p>
                    </div>
                  </div>

                  {/* Status Checklist */}
                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Exit Checklist:</div>

                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exit.knowledgeTransfer || false}
                        onChange={async (e) => {
                          const updated = { ...exit, knowledgeTransfer: e.target.checked }
                          await updateInDB(STORES.exits, updated)
                          await loadExitsData()
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span>Knowledge Transfer</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exit.equipmentReturn || false}
                        onChange={async (e) => {
                          const updated = { ...exit, equipmentReturn: e.target.checked }
                          await updateInDB(STORES.exits, updated)
                          await loadExitsData()
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span>Equipment Return</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exit.accessRemoval || false}
                        onChange={async (e) => {
                          const updated = { ...exit, accessRemoval: e.target.checked }
                          await updateInDB(STORES.exits, updated)
                          await loadExitsData()
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span>Access Removal</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exit.exitInterviewStatus === 'completed'}
                        onChange={async (e) => {
                          const updated = {
                            ...exit,
                            exitInterviewStatus: e.target.checked ? 'completed' : 'pending'
                          }
                          await updateInDB(STORES.exits, updated)
                          await loadExitsData()
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span>Exit Interview</span>
                    </label>
                  </div>

                  {/* Rating & Feedback */}
                  <div className="bg-white bg-opacity-60 p-3 rounded text-xs space-y-2 mb-3">
                    {exit.exitInterviewStatus === 'completed' && (
                      <>
                        <div>
                          <p className="text-gray-600">Overall Experience</p>
                          <select
                            value={exit.employeeRating || 'neutral'}
                            onChange={async (e) => {
                              const updated = { ...exit, employeeRating: e.target.value }
                              await updateInDB(STORES.exits, updated)
                              await loadExitsData()
                            }}
                            className="w-full px-2 py-1 rounded border border-gray-300 text-xs"
                          >
                            <option value="negative">👎 Negative</option>
                            <option value="neutral">😐 Neutral</option>
                            <option value="positive">👍 Positive</option>
                          </select>
                        </div>
                        <p className="text-gray-600">Exit Feedback</p>
                        <p className="text-gray-700 italic">{exit.exitFeedback || 'No feedback'}</p>
                      </>
                    )}
                  </div>

                  {/* Alumni Status */}
                  {status === 'completed' && (
                    <div className="flex items-center gap-2 text-xs">
                      <MessageCircle className="w-4 h-4 text-purple-600" />
                      <select
                        value={exit.alumniStatus || 'inactive'}
                        onChange={async (e) => {
                          const updated = { ...exit, alumniStatus: e.target.value }
                          await updateInDB(STORES.exits, updated)
                          await loadExitsData()
                        }}
                        className="px-2 py-1 rounded border border-gray-300 text-xs"
                      >
                        <option value="inactive">Alumni Status: Inactive</option>
                        <option value="active">Alumni Status: Active</option>
                      </select>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {formOpen && (
        <ExitForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSaveExit}
          initialData={selectedExit}
        />
      )}
    </div>
  )
}

// Exit Form Component
function ExitForm({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    role: '',
    department: '',
    lastDay: new Date().toISOString().split('T')[0],
    reason: 'voluntary',
    manager: '',
    notes: '',
    knowledgeTransfer: false,
    equipmentReturn: false,
    accessRemoval: false,
    exitInterviewStatus: 'pending'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData((prev) => ({
        ...prev,
        id: generateID('exit'),
        lastDay: new Date().toISOString().split('T')[0]
      }))
    }
    setErrors({})
  }, [isOpen, initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name required'
    if (!formData.role.trim()) newErrors.role = 'Role required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Record Departure</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Name"
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Role"
              />
              {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Department"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Day</label>
              <input
                type="date"
                name="lastDay"
                value={formData.lastDay}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="voluntary">Voluntary</option>
                <option value="involuntary">Involuntary</option>
                <option value="retirement">Retirement</option>
                <option value="health">Health</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <input
              type="text"
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Manager name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Additional notes..."
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
