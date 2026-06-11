import React, { useState, useEffect } from 'react'
import { X, Users, Crown, Search, UserPlus } from 'lucide-react'

export default function TeamForm({ team, people, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    teamLeadId: '',
    memberIds: []
  })
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (team) {
      setForm({
        name: team.name || '',
        description: team.description || '',
        teamLeadId: team.teamLeadId || '',
        memberIds: team.memberIds || []
      })
    }
  }, [team])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const memberSet = new Set(form.memberIds)
    if (form.teamLeadId && !memberSet.has(form.teamLeadId)) {
      memberSet.add(form.teamLeadId)
    }
    onSave({ ...form, memberIds: Array.from(memberSet) })
  }

  const toggleMember = (id) => {
    setForm(prev => {
      const next = new Set(prev.memberIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...prev, memberIds: Array.from(next) }
    })
  }

  const filteredPeople = people.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.role?.toLowerCase().includes(search.toLowerCase())
  )

  const selectedLead = people.find(p => p.id === form.teamLeadId)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {team ? 'Edit Team' : 'Create New Team'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              placeholder="e.g., Engineering, Design, Marketing"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 resize-none"
              rows={2}
              placeholder="What does this team do?"
            />
          </div>

          {/* Team Lead */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Crown className="w-3.5 h-3.5 inline mr-1 text-yellow-500" />
              Team Lead
            </label>
            <select
              value={form.teamLeadId}
              onChange={(e) => setForm({ ...form, teamLeadId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            >
              <option value="">Select a lead...</option>
              {people.filter(p => p.status !== 'inactive').map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.role || p.email}</option>
              ))}
            </select>
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-3.5 h-3.5 inline mr-1" />
              Members ({form.memberIds.length})
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search people..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto">
              {filteredPeople.filter(p => p.status !== 'inactive').map(person => {
                const isSelected = form.memberIds.includes(person.id)
                const isLead = form.teamLeadId === person.id
                return (
                  <label
                    key={person.id}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMember(person.id)}
                      className="w-4 h-4 rounded"
                    />
                    <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                      {person.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{person.role || person.email}</p>
                    </div>
                    {isLead && (
                      <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded font-medium">
                        Lead
                      </span>
                    )}
                  </label>
                )
              })}
              {filteredPeople.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">No people found</p>
              )}
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {team ? 'Save Changes' : 'Create Team'}
          </button>
        </div>
      </div>
    </div>
  )
}
