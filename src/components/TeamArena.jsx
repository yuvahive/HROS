import React, { useState, useEffect, useContext } from 'react'
import {
  Users, Plus, Settings, Search, ChevronRight, Edit2, Trash2,
  UserPlus, UserMinus, Crown, Briefcase, CheckSquare, Activity,
  Star, Clock, Mail, X, Save, AlertCircle, Filter, Grid, List
} from 'lucide-react'
import { getAllFromDB, addToDB, updateInDB, deleteFromDB, STORES } from '../utils/indexedDB'
import { AuthContext, useCloudPulse } from '../context/AuthContext'
import TeamForm from './TeamForm'

export default function TeamArena() {
  const { currentUser, hasPermission, filterByTeam } = useContext(AuthContext)
  const lastPulse = useCloudPulse()
  const [teams, setTeams] = useState([])
  const [people, setPeople] = useState([])
  const [workLogs, setWorkLogs] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [activeTab, setActiveTab] = useState('org')
  const [showForm, setShowForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMemberPicker, setShowMemberPicker] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const canCreate = hasPermission('teams', 'create')
  const canUpdate = hasPermission('teams', 'update')
  const canDelete = hasPermission('teams', 'delete')

  useEffect(() => {
    loadData()
  }, [lastPulse])

  const loadData = async () => {
    try {
      const [teamsData, peopleData, workData, projectData] = await Promise.all([
        getAllFromDB(STORES.teams),
        getAllFromDB(STORES.people),
        getAllFromDB(STORES.workLogs),
        getAllFromDB(STORES.projects)
      ])
      const filtered = filterByTeam(teamsData || [])
      setTeams(filtered)
      setPeople(peopleData || [])
      setWorkLogs(workData || [])
      setProjects(projectData || [])

      if (filtered.length > 0 && !selectedTeam) {
        setSelectedTeam(filtered[0])
      } else if (selectedTeam) {
        const updated = filtered.find(t => t.id === selectedTeam.id)
        if (updated) setSelectedTeam(updated)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading team data:', error)
      setLoading(false)
    }
  }

  const getTeamLead = (team) => {
    if (!team.teamLeadId) return null
    return people.find(p => p.id === team.teamLeadId)
  }

  const getTeamMembers = (team) => {
    if (!team.memberIds || team.memberIds.length === 0) return []
    return team.memberIds.map(id => people.find(p => p.id === id)).filter(Boolean)
  }

  const getMemberTaskCount = (personId) => {
    return workLogs.filter(w =>
      w.personId === personId || w.personName === people.find(p => p.id === personId)?.name
    ).length
  }

  const getTeamTaskCount = (team) => {
    const members = getTeamMembers(team)
    const memberIds = new Set(members.map(m => m.id))
    const memberNames = new Set(members.map(m => m.name))
    return workLogs.filter(w =>
      memberIds.has(w.personId) || memberNames.has(w.personName)
    ).length
  }

  const handleCreateTeam = () => {
    setEditingTeam(null)
    setShowForm(true)
  }

  const handleEditTeam = (team) => {
    setEditingTeam(team)
    setShowForm(true)
  }

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team? Members will be unassigned.')) return
    try {
      await deleteFromDB(STORES.teams, teamId)
      const team = teams.find(t => t.id === teamId)
      if (team?.memberIds) {
        for (const memberId of team.memberIds) {
          const person = people.find(p => p.id === memberId)
          if (person) {
            await updateInDB(STORES.people, { ...person, teamId: '' })
          }
        }
      }
      setSelectedTeam(null)
      await loadData()
    } catch (error) {
      console.error('Error deleting team:', error)
    }
  }

  const handleSaveTeam = async (teamData) => {
    try {
      if (editingTeam?.id) {
        const oldMembers = new Set(editingTeam.memberIds || [])
        const newMembers = new Set(teamData.memberIds || [])
        for (const memberId of oldMembers) {
          if (!newMembers.has(memberId)) {
            const person = people.find(p => p.id === memberId)
            if (person) await updateInDB(STORES.people, { ...person, teamId: '' })
          }
        }
        for (const memberId of newMembers) {
          const person = people.find(p => p.id === memberId)
          if (person) await updateInDB(STORES.people, { ...person, teamId: editingTeam.id })
        }
        await updateInDB(STORES.teams, { ...editingTeam, ...teamData })
      } else {
        const newTeam = {
          id: `team-${Date.now()}`,
          ...teamData,
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.id
        }
        await addToDB(STORES.teams, newTeam)
        if (newTeam.memberIds) {
          for (const memberId of newTeam.memberIds) {
            const person = people.find(p => p.id === memberId)
            if (person) await updateInDB(STORES.people, { ...person, teamId: newTeam.id })
          }
        }
      }
      setShowForm(false)
      setEditingTeam(null)
      await loadData()
    } catch (error) {
      console.error('Error saving team:', error)
    }
  }

  const handleRemoveMember = async (personId) => {
    if (!selectedTeam) return
    const updatedIds = (selectedTeam.memberIds || []).filter(id => id !== personId)
    const updatedTeam = { ...selectedTeam, memberIds: updatedIds }
    await updateInDB(STORES.teams, updatedTeam)
    const person = people.find(p => p.id === personId)
    if (person) await updateInDB(STORES.people, { ...person, teamId: '' })
    await loadData()
    setSelectedTeam(updatedTeam)
  }

  const handleAddMembers = async (personIds) => {
    if (!selectedTeam) return
    const existing = new Set(selectedTeam.memberIds || [])
    const newIds = personIds.filter(id => !existing.has(id))
    const updatedIds = [...(selectedTeam.memberIds || []), ...newIds]
    const updatedTeam = { ...selectedTeam, memberIds: updatedIds }
    await updateInDB(STORES.teams, updatedTeam)
    for (const personId of newIds) {
      const person = people.find(p => p.id === personId)
      if (person) await updateInDB(STORES.people, { ...person, teamId: selectedTeam.id })
    }
    setShowMemberPicker(false)
    await loadData()
    setSelectedTeam(updatedTeam)
  }

  const handleChangeLead = async (personId) => {
    if (!selectedTeam) return
    const updatedTeam = { ...selectedTeam, teamLeadId: personId }
    await updateInDB(STORES.teams, updatedTeam)
    await loadData()
    setSelectedTeam(updatedTeam)
  }

  const getAvailableMembers = () => {
    if (!selectedTeam) return []
    const memberSet = new Set(selectedTeam.memberIds || [])
    return people.filter(p => !memberSet.has(p.id) && p.status !== 'inactive')
  }

  const getTeamProjectCount = (team) => {
    const members = getTeamMembers(team)
    const memberNames = new Set(members.map(m => m.name))
    return projects.filter(p => memberNames.has(p.owner) || memberNames.has(p.lead)).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const currentMembers = selectedTeam ? getTeamMembers(selectedTeam) : []
  const currentLead = selectedTeam ? getTeamLead(selectedTeam) : null

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              Teams
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Manage teams, members, and assignments
            </p>
          </div>
          {canCreate && (
            <button
              onClick={handleCreateTeam}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Team
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Team List Sidebar */}
        <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {teams.filter(t =>
              t.name?.toLowerCase().includes(searchTerm.toLowerCase())
            ).map(team => {
              const lead = getTeamLead(team)
              const memberCount = (team.memberIds || []).length
              const taskCount = getTeamTaskCount(team)
              return (
                <button
                  key={team.id}
                  onClick={() => { setSelectedTeam(team); setActiveTab('org') }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedTeam?.id === team.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                      selectedTeam?.id === team.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {team.name?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${
                        selectedTeam?.id === team.id
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {team.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {lead ? lead.name : 'No lead'} · {memberCount} members
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{taskCount}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">tasks</p>
                    </div>
                  </div>
                </button>
              )
            })}
            {teams.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No teams yet</p>
                {canCreate && (
                  <button
                    onClick={handleCreateTeam}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create your first team
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {selectedTeam ? (
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Team Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {selectedTeam.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTeam.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedTeam.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        {currentLead ? currentLead.name : 'No lead'}
                      </span>
                      <span>{currentMembers.length} members</span>
                      <span>{getTeamTaskCount(selectedTeam)} tasks</span>
                      <span>{getTeamProjectCount(selectedTeam)} projects</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canUpdate && (
                    <button
                      onClick={() => setShowMemberPicker(true)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1.5 text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Member
                    </button>
                  )}
                  {canUpdate && (
                    <button
                      onClick={() => handleEditTeam(selectedTeam)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteTeam(selectedTeam.id)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1.5 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4">
                {[
                  { id: 'org', label: 'Org Chart', icon: Users },
                  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                  { id: 'members', label: 'Members', icon: Grid }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'org' && (
                <OrgChartView
                  team={selectedTeam}
                  lead={currentLead}
                  members={currentMembers}
                  getMemberTaskCount={getMemberTaskCount}
                  onRemoveMember={canUpdate ? handleRemoveMember : null}
                  onChangeLead={canUpdate ? handleChangeLead : null}
                  allPeople={people}
                />
              )}
              {activeTab === 'tasks' && (
                <TasksView
                  team={selectedTeam}
                  members={currentMembers}
                  workLogs={workLogs}
                  projects={projects}
                />
              )}
              {activeTab === 'members' && (
                <MembersView
                  team={selectedTeam}
                  members={currentMembers}
                  getMemberTaskCount={getMemberTaskCount}
                  onRemoveMember={canUpdate ? handleRemoveMember : null}
                  onChangeLead={canUpdate ? handleChangeLead : null}
                  allPeople={people}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a team</p>
              <p className="text-sm mt-1">Choose a team from the sidebar or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <TeamForm
          team={editingTeam}
          people={people}
          onSave={handleSaveTeam}
          onClose={() => { setShowForm(false); setEditingTeam(null) }}
        />
      )}
      {showMemberPicker && (
        <MemberPickerModal
          available={getAvailableMembers()}
          onAdd={handleAddMembers}
          onClose={() => setShowMemberPicker(false)}
        />
      )}
    </div>
  )
}

// ─── Org Chart View ────────────────────────────────────────────────
function OrgChartView({ team, lead, members, getMemberTaskCount, onRemoveMember, onChangeLead, allPeople }) {
  return (
    <div className="space-y-6">
      {/* Lead */}
      {lead && (
        <div className="text-center">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Team Lead</h3>
          <div className="inline-flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-sm">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2">
              {lead.name?.charAt(0)?.toUpperCase()}
            </div>
            <p className="font-bold text-gray-900 dark:text-white">{lead.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{lead.role || 'Team Lead'}</p>
            <div className="flex items-center gap-1 mt-1">
              <Crown className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Lead</span>
            </div>
          </div>
          {/* Connector line */}
          <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mx-auto"></div>
        </div>
      )}

      {/* Members */}
      {members.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 text-center">Members</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {members.filter(m => m.id !== team.teamLeadId).map(member => (
              <div key={member.id} className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm w-36 relative group">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 text-lg font-bold mb-2">
                  {member.name?.charAt(0)?.toUpperCase()}
                </div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white text-center truncate w-full">{member.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{member.role || member.seniority || 'Member'}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckSquare className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{getMemberTaskCount(member.id)} tasks</span>
                </div>
                {onRemoveMember && (
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from team"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && !lead && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No members in this team yet</p>
        </div>
      )}
    </div>
  )
}

// ─── Tasks View ────────────────────────────────────────────────────
function TasksView({ team, members, workLogs, projects }) {
  const memberNames = new Set(members.map(m => m.name))
  const teamTasks = workLogs.filter(w => memberNames.has(w.personName))

  const grouped = {
    'in-progress': teamTasks.filter(t => t.status === 'in-progress' || t.status === 'active'),
    'blocked': teamTasks.filter(t => t.status === 'blocked'),
    'done': teamTasks.filter(t => t.status === 'done' || t.status === 'completed'),
    'planned': teamTasks.filter(t => !t.status || t.status === 'planned' || t.status === 'todo')
  }

  const columns = [
    { id: 'planned', title: 'To Do', color: 'gray' },
    { id: 'in-progress', title: 'In Progress', color: 'blue' },
    { id: 'blocked', title: 'Blocked', color: 'red' },
    { id: 'done', title: 'Done', color: 'green' }
  ]

  const colorMap = {
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Team Tasks ({teamTasks.length})
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => (
          <div key={col.id} className="space-y-2">
            <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${colorMap[col.color]}`}>
              {col.title} ({grouped[col.id]?.length || 0})
            </div>
            <div className="space-y-2 min-h-[100px]">
              {grouped[col.id]?.map(task => (
                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{task.taskName || task.title || 'Untitled'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.personName}</p>
                  {task.hoursWorked && (
                    <p className="text-xs text-gray-400 mt-1">{task.hoursWorked}h worked</p>
                  )}
                </div>
              ))}
              {(!grouped[col.id] || grouped[col.id].length === 0) && (
                <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Members View ──────────────────────────────────────────────────
function MembersView({ team, members, getMemberTaskCount, onRemoveMember, onChangeLead, allPeople, viewMode, onViewModeChange }) {
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = members.filter(m => {
    if (filterStatus === 'all') return true
    return m.status === filterStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Team Members ({filtered.length})
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
          </select>
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-gray-500'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-gray-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(member => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {member.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.role || member.seniority || 'Member'}</p>
                  </div>
                </div>
                {member.id === team.teamLeadId && (
                  <span className="flex items-center gap-1 text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded font-medium">
                    <Crown className="w-2.5 h-2.5" /> Lead
                  </span>
                )}
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" /> Tasks</span>
                  <span className="font-medium">{getMemberTaskCount(member.id)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
                  <span className="font-medium truncate max-w-[120px]">{member.email}</span>
                </div>
                {member.startDate && (
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Joined</span>
                    <span className="font-medium">{new Date(member.startDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {onRemoveMember && member.id !== team.teamLeadId && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                  {onChangeLead && (
                    <button
                      onClick={() => onChangeLead(member.id)}
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1"
                    >
                      <Crown className="w-3 h-3" /> Make Lead
                    </button>
                  )}
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="px-2 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-1"
                  >
                    <UserMinus className="w-3 h-3" /> Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Tasks</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                {onRemoveMember && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(member => (
                <tr key={member.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {member.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                        {member.id === team.teamLeadId && (
                          <Crown className="w-3 h-3 text-yellow-500 inline ml-1" />
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{member.role || member.seniority || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{member.email}</td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">{getMemberTaskCount(member.id)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {member.status || 'active'}
                    </span>
                  </td>
                  {onRemoveMember && (
                    <td className="px-4 py-3">
                      {member.id !== team.teamLeadId && (
                        <button
                          onClick={() => onRemoveMember(member.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove from team"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Member Picker Modal ──────────────────────────────────────────
function MemberPickerModal({ available, onAdd, onClose }) {
  const [selected, setSelected] = useState(new Set())
  const [search, setSearch] = useState('')

  const filtered = available.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.role?.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Members</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.map(person => (
            <label
              key={person.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selected.has(person.id)
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(person.id)}
                onChange={() => toggle(person.id)}
                className="w-4 h-4 rounded"
              />
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200">
                {person.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{person.role || person.email}</p>
              </div>
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No available people</p>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">{selected.size} selected</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button
              onClick={() => onAdd(Array.from(selected))}
              disabled={selected.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Add {selected.size} Members
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
