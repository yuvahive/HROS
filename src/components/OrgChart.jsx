import React, { useState, useEffect, useContext } from 'react'
import {
  Users, ChevronDown, ChevronRight, Mail, Phone, MapPin,
  Briefcase, Calendar, Star, Clock, Activity, Search,
  Filter, Grid, List, Zap, Heart, AlertTriangle, Eye
} from 'lucide-react'
import { getAllFromDB, STORES } from '../utils/indexedDB'
import { AuthContext } from '../context/AuthContext'

export default function OrgChart() {
  const { currentUser } = useContext(AuthContext)
  const [people, setPeople] = useState([])
  const [teams, setTeams] = useState({})
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('orgchart') // 'orgchart' | 'teams' | 'directory'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState(new Set())

  useEffect(() => {
    loadOrgData()
  }, [])

  const loadOrgData = async () => {
    try {
      const peopleData = await getAllFromDB(STORES.people)
      setPeople(peopleData)

      // Group by team
      const grouped = {}
      peopleData.forEach(person => {
        const team = person.team || 'Unassigned'
        if (!grouped[team]) grouped[team] = []
        grouped[team].push(person)
      })
      setTeams(grouped)

      // Auto-expand all nodes
      const roots = peopleData.filter(p => !p.manager)
      setExpandedNodes(new Set(roots.map(r => r.id)))

      setLoading(false)
    } catch (error) {
      console.error('Error loading org data:', error)
      setLoading(false)
    }
  }

  const toggleNode = (id) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Build tree structure
  const buildTree = () => {
    const roots = people.filter(p => !p.manager)
    const childrenMap = {}
    people.forEach(p => {
      if (p.manager) {
        if (!childrenMap[p.manager]) childrenMap[p.manager] = []
        childrenMap[p.manager].push(p)
      }
    })
    return { roots, childrenMap }
  }

  const { roots, childrenMap } = buildTree()

  const filteredPeople = people.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.team?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-400'
      case 'on-leave': return 'bg-yellow-400'
      case 'on-notice': return 'bg-red-400'
      default: return 'bg-gray-400'
    }
  }

  const getSeniorityBadge = (seniority) => {
    const badges = {
      'lead': '⭐',
      'senior': '🔷',
      'mid': '🔹',
      'junior': '🌱'
    }
    return badges[seniority] || ''
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading organization data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Organization
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {people.length} people across {Object.keys(teams).length} teams
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'orgchart', label: 'Org Chart', icon: <Activity className="w-4 h-4" /> },
                { id: 'teams', label: 'Teams', icon: <Grid className="w-4 h-4" /> },
                { id: 'directory', label: 'Directory', icon: <List className="w-4 h-4" /> }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === mode.id
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search people..."
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'orgchart' && (
          <OrgChartView
            roots={roots}
            childrenMap={childrenMap}
            expandedNodes={expandedNodes}
            toggleNode={toggleNode}
            onSelectPerson={setSelectedPerson}
            getStatusColor={getStatusColor}
            getSeniorityBadge={getSeniorityBadge}
            searchTerm={searchTerm}
          />
        )}
        {viewMode === 'teams' && (
          <TeamsView
            teams={teams}
            onSelectPerson={setSelectedPerson}
            getStatusColor={getStatusColor}
            getSeniorityBadge={getSeniorityBadge}
            searchTerm={searchTerm}
          />
        )}
        {viewMode === 'directory' && (
          <DirectoryView
            people={filteredPeople}
            onSelectPerson={setSelectedPerson}
            getStatusColor={getStatusColor}
            getSeniorityBadge={getSeniorityBadge}
          />
        )}
      </div>

      {/* Person Detail Panel */}
      {selectedPerson && (
        <PersonDetailPanel
          person={selectedPerson}
          people={people}
          onClose={() => setSelectedPerson(null)}
          getStatusColor={getStatusColor}
          getSeniorityBadge={getSeniorityBadge}
        />
      )}
    </div>
  )
}

// ==================== ORG CHART VIEW ====================

function OrgChartView({ roots, childrenMap, expandedNodes, toggleNode, onSelectPerson, getStatusColor, getSeniorityBadge, searchTerm }) {
  const renderNode = (person, level = 0) => {
    const hasChildren = childrenMap[person.id]?.length > 0
    const isExpanded = expandedNodes.has(person.id)
    const matchesSearch = !searchTerm ||
      person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.role?.toLowerCase().includes(searchTerm.toLowerCase())

    return (
      <div key={person.id} className={`${level > 0 ? 'ml-8 mt-1' : ''}`}>
        <div
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-white/80 transition-colors cursor-pointer group ${
            matchesSearch && searchTerm ? 'bg-yellow-50 ring-1 ring-yellow-200' : ''
          }`}
          onClick={() => onSelectPerson(person)}
        >
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleNode(person.id) }}
              className="text-gray-400 hover:text-gray-600 w-5 h-5 flex items-center justify-center"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {person.name?.charAt(0) || '?'}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(person.status)}`}></div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900 truncate">{person.name}</span>
              <span className="text-xs">{getSeniorityBadge(person.seniority)}</span>
            </div>
            <p className="text-xs text-gray-500 truncate">{person.role}</p>
          </div>

          {hasChildren && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {childrenMap[person.id].length} reports
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l-2 border-gray-200 ml-4">
            {childrenMap[person.id].map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {roots.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold mb-2">No Org Data Yet</h3>
          <p className="text-sm max-w-md mx-auto">
            Add people through the Admin Settings or Hiring Pipeline to see your organization chart here.
          </p>
        </div>
      ) : (
        roots.map(root => renderNode(root))
      )}
    </div>
  )
}

// ==================== TEAMS VIEW ====================

function TeamsView({ teams, onSelectPerson, getStatusColor, getSeniorityBadge, searchTerm }) {
  const [expandedTeams, setExpandedTeams] = useState(new Set(Object.keys(teams)))

  const toggleTeam = (team) => {
    setExpandedTeams(prev => {
      const next = new Set(prev)
      if (next.has(team)) next.delete(team)
      else next.add(team)
      return next
    })
  }

  const teamColors = {
    'Engineering': 'from-blue-500 to-indigo-600',
    'Product': 'from-purple-500 to-pink-600',
    'Design': 'from-pink-500 to-rose-600',
    'Marketing': 'from-orange-500 to-red-600',
    'HR': 'from-green-500 to-emerald-600',
    'Finance': 'from-yellow-500 to-orange-600',
    'Operations': 'from-teal-500 to-cyan-600',
    'Sales': 'from-red-500 to-pink-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(teams).map(([teamName, members]) => {
        const filtered = members.filter(p =>
          !searchTerm ||
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.role?.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (filtered.length === 0) return null

        const isExpanded = expandedTeams.has(teamName)
        const gradient = teamColors[teamName] || 'from-gray-500 to-gray-600'

        return (
          <div key={teamName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className={`bg-gradient-to-r ${gradient} px-5 py-4 cursor-pointer`}
              onClick={() => toggleTeam(teamName)}
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{teamName}</h3>
                    <p className="text-white/80 text-xs">{members.length} members</p>
                  </div>
                </div>
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </div>

            {isExpanded && (
              <div className="divide-y divide-gray-50">
                {filtered.map(person => (
                  <div
                    key={person.id}
                    className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    onClick={() => onSelectPerson(person)}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                        {person.name?.charAt(0) || '?'}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(person.status)}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-900 truncate">{person.name}</p>
                        <span className="text-xs">{getSeniorityBadge(person.seniority)}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{person.role}</p>
                    </div>
                    <span className="text-xs text-gray-400 capitalize">{person.status || 'active'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {Object.keys(teams).length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-400">
          <Grid className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
          <p className="text-sm">Teams will appear here once people are added with team assignments.</p>
        </div>
      )}
    </div>
  )
}

// ==================== DIRECTORY VIEW ====================

function DirectoryView({ people, onSelectPerson, getStatusColor, getSeniorityBadge }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Person</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Team</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {people.map(person => (
            <tr
              key={person.id}
              className="hover:bg-gray-50/50 cursor-pointer transition-colors"
              onClick={() => onSelectPerson(person)}
            >
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                      {person.name?.charAt(0) || '?'}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(person.status)}`}></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-gray-900">{person.name}</p>
                      <span className="text-xs">{getSeniorityBadge(person.seniority)}</span>
                    </div>
                    <p className="text-xs text-gray-500">{person.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-sm text-gray-700">{person.role}</td>
              <td className="px-5 py-3">
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">
                  {person.team || 'Unassigned'}
                </span>
              </td>
              <td className="px-5 py-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  person.status === 'active' ? 'bg-green-50 text-green-700' :
                  person.status === 'on-leave' ? 'bg-yellow-50 text-yellow-700' :
                  person.status === 'on-notice' ? 'bg-red-50 text-red-700' :
                  'bg-gray-50 text-gray-700'
                }`}>
                  {person.status || 'active'}
                </span>
              </td>
              <td className="px-5 py-3 text-sm text-gray-500">
                {person.startDate || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {people.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <List className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold mb-2">No People Found</h3>
          <p className="text-sm">Directory will populate as people are added to the system.</p>
        </div>
      )}
    </div>
  )
}

// ==================== PERSON DETAIL PANEL ====================

function PersonDetailPanel({ person, people, onClose, getStatusColor, getSeniorityBadge }) {
  const reports = people.filter(p => p.manager === person.id)
  const manager = people.find(p => p.id === person.manager)

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Profile</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Avatar & Name */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg">
            {person.name?.charAt(0) || '?'}
          </div>
          <h2 className="text-xl font-black text-gray-900 mt-3">{person.name}</h2>
          <p className="text-sm text-gray-500">{person.role}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(person.status)}`}></span>
            <span className="text-xs text-gray-500 capitalize">{person.status || 'active'}</span>
            {person.seniority && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {getSeniorityBadge(person.seniority)} {person.seniority}
              </span>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={person.email} />
          <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Team" value={person.team || 'Unassigned'} />
          <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joined" value={person.startDate || 'Unknown'} />
          {manager && (
            <InfoRow icon={<Star className="w-4 h-4" />} label="Reports to" value={manager.name} />
          )}
        </div>

        {/* Skills */}
        {person.skills && person.skills.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {person.skills.map((skill, idx) => (
                <span key={idx} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reports */}
        {reports.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Direct Reports ({reports.length})
            </h4>
            <div className="space-y-2">
              {reports.map(report => (
                <div key={report.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {report.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{report.name}</p>
                    <p className="text-xs text-gray-500 truncate">{report.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-400">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
      </div>
    </div>
  )
}
