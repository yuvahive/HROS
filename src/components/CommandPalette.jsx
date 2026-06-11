import React, { useState, useEffect, useRef } from 'react'
import { Command, Home, User, Globe, Activity, CheckSquare, Heart, GitBranch, Zap, Users, Settings, Sun, Moon, Search, X } from 'lucide-react'

const BOARD_ICONS = {
  'my-dashboard': Home,
  'my-profile': User,
  'org-chart': Globe,
  'team-sync': Activity,
  'daily-work': CheckSquare,
  'one-on-ones': Heart,
  'project-health': GitBranch,
  'action-items': Zap,
  'hiring': Users,
  'settings': Settings,
}

const BOARD_NAMES = {
  'my-dashboard': 'My Dashboard',
  'my-profile': 'My Profile',
  'org-chart': 'Organization',
  'team-sync': 'Team Sync',
  'daily-work': 'Team Work',
  'one-on-ones': '1:1 Meetings',
  'project-health': 'Projects',
  'action-items': 'Action Items',
  'hiring': 'Hiring Pipeline',
  'onboarding': 'Onboarding',
  'internships': 'Internships',
  'performance': 'Team Pulse',
  'exits': 'Exits & Alumni',
  'wellness': 'Team Wellness',
  'metrics': 'Metrics',
  'reports': 'Reports',
  'commands': 'Commands',
  'logs': 'System Logs',
  'settings': 'Admin Settings',
}

export default function CommandPalette({ onClose, onNavigate, currentUser, isDark, onToggleDarkMode }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const allCommands = [
    // Navigation
    ...Object.entries(BOARD_NAMES).map(([id, name]) => ({
      id: `nav-${id}`,
      category: 'Navigate',
      label: name,
      icon: BOARD_ICONS[id] || Search,
      action: () => onNavigate(id)
    })),
    // Actions
    { id: 'toggle-dark', category: 'Actions', label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode', icon: isDark ? Sun : Moon, action: onToggleDarkMode },
    { id: 'go-home', category: 'Actions', label: 'Go to My Dashboard', icon: Home, action: () => onNavigate('my-dashboard') },
  ]

  const filtered = query
    ? allCommands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : allCommands

  const categories = [...new Set(filtered.map(c => c.category))]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Command className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or navigate..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <kbd className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {categories.map(cat => (
            <div key={cat}>
              <p className="px-4 py-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider">{cat}</p>
              {filtered.filter(c => c.category === cat).map(cmd => {
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); onClose() }}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">{cmd.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm">No commands found</div>
          )}
        </div>
      </div>
    </div>
  )
}
