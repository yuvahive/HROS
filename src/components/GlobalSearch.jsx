import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Users, CheckSquare, Calendar, FileText, ArrowRight } from 'lucide-react'
import { getAllFromDB, STORES } from '../utils/indexedDB'

export default function GlobalSearch({ onClose, onNavigate, currentUser }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    search(query)
  }, [query])

  const search = async (q) => {
    setLoading(true)
    const lower = q.toLowerCase()

    const [people, tasks, meetings, actions, projects] = await Promise.all([
      getAllFromDB(STORES.people),
      getAllFromDB(STORES.tasks),
      getAllFromDB(STORES.oneOnOnes),
      getAllFromDB(STORES.actionItems),
      getAllFromDB(STORES.projects)
    ])

    const hits = []

    // Search people
    people.filter(p =>
      p.name?.toLowerCase().includes(lower) ||
      p.email?.toLowerCase().includes(lower) ||
      p.role?.toLowerCase().includes(lower) ||
      p.team?.toLowerCase().includes(lower)
    ).slice(0, 5).forEach(p => {
      hits.push({ type: 'person', icon: Users, title: p.name, subtitle: `${p.role} · ${p.team}`, id: p.id, board: 'org-chart' })
    })

    // Search tasks
    tasks.filter(t =>
      t.title?.toLowerCase().includes(lower) ||
      t.taskId?.toLowerCase().includes(lower) ||
      t.description?.toLowerCase().includes(lower)
    ).slice(0, 5).forEach(t => {
      hits.push({ type: 'task', icon: CheckSquare, title: t.title, subtitle: `${t.taskId || ''} · ${t.status}`, id: t.id, board: 'daily-work' })
    })

    // Search meetings
    meetings.filter(m =>
      m.personName?.toLowerCase().includes(lower) ||
      m.topic?.toLowerCase().includes(lower)
    ).slice(0, 3).forEach(m => {
      hits.push({ type: 'meeting', icon: Calendar, title: m.topic || `1:1 with ${m.personName}`, subtitle: `${m.scheduledDate} · ${m.status}`, id: m.id, board: 'one-on-ones' })
    })

    // Search actions
    actions.filter(a =>
      a.title?.toLowerCase().includes(lower)
    ).slice(0, 3).forEach(a => {
      hits.push({ type: 'action', icon: FileText, title: a.title, subtitle: a.status, id: a.id, board: 'action-items' })
    })

    setResults(hits)
    setLoading(false)
  }

  const typeColors = {
    person: 'text-blue-500',
    task: 'text-green-500',
    meeting: 'text-purple-500',
    action: 'text-amber-500',
    project: 'text-red-500'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, tasks, meetings..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <kbd className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm">No results for "{query}"</div>
          )}
          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((r, i) => {
                const Icon = r.icon
                return (
                  <button
                    key={`${r.type}-${r.id}-${i}`}
                    onClick={() => { onNavigate(r.board); onClose() }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${typeColors[r.type]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{r.subtitle}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase">{r.type}</span>
                    <ArrowRight className="w-3 h-3 text-gray-300" />
                  </button>
                )
              })}
            </div>
          )}
          {query.length < 2 && (
            <div className="p-6 text-center text-gray-400 text-sm">
              <p>Type to search across people, tasks, meetings, and actions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
