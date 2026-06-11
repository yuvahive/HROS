import React, { useState, useEffect } from 'react'
import { Bell, X, Clock, CheckCircle, AlertTriangle, MessageSquare, Calendar, FileText } from 'lucide-react'
import { getAllFromDB, STORES } from '../utils/indexedDB'

export default function NotificationPanel({ onClose, currentUser }) {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    loadNotifications()
  }, [currentUser])

  const loadNotifications = async () => {
    const [meetings, tasks, actions, timeOff] = await Promise.all([
      getAllFromDB(STORES.oneOnOnes),
      getAllFromDB(STORES.tasks),
      getAllFromDB(STORES.actionItems),
      getAllFromDB(STORES.timeOff)
    ])

    const items = []

    // Upcoming 1:1s (next 7 days)
    const upcomingMeetings = meetings.filter(m => {
      if (m.status !== 'scheduled') return false
      if (m.personId !== currentUser?.id && m.managerId !== currentUser?.id) return false
      if (!m.scheduledDate) return false
      const d = new Date(m.scheduledDate + 'T00:00:00')
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return d >= now && d <= weekFromNow
    })
    upcomingMeetings.forEach(m => {
      // Use stored names from meeting record, fallback to looking up
      const meetingTitle = m.personId === currentUser?.id 
        ? (m.managerName || 'Manager') 
        : (m.personName || 'Employee')
      items.push({
        id: `meeting-${m.id}`,
        type: 'meeting',
        icon: Calendar,
        title: `1:1 with ${meetingTitle}`,
        detail: `${m.scheduledDate} at ${(m.scheduledTime && m.scheduledTime.includes('T') ? new Date(m.scheduledTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : m.scheduledTime) || 'TBD'}`,
        time: m.scheduledDate,
        color: 'blue'
      })
    })

    // Overdue tasks
    const overdueTasks = tasks.filter(t => {
      if (t.ownerId !== currentUser?.id) return false
      if (t.status === 'done' || t.status === 'cancelled') return false
      return new Date(t.deadline) < new Date()
    })
    overdueTasks.forEach(t => {
      items.push({
        id: `task-${t.id}`,
        type: 'task',
        icon: AlertTriangle,
        title: `Overdue: ${t.title}`,
        detail: `Due: ${t.deadline}`,
        time: t.deadline,
        color: 'red'
      })
    })

    // Pending action items
    const pendingActions = actions.filter(a => {
      if (a.owner !== currentUser?.id) return false
      return a.status !== 'completed' && a.status !== 'done'
    })
    pendingActions.forEach(a => {
      items.push({
        id: `action-${a.id}`,
        type: 'action',
        icon: CheckCircle,
        title: a.title,
        detail: `Status: ${a.status}`,
        time: a.dueDate,
        color: 'amber'
      })
    })

    // Pending time off requests (for managers)
    if (currentUser?.role === 'admin' || currentUser?.role === 'HR' || currentUser?.role === 'TeamLead') {
      const pendingTimeOff = timeOff.filter(t => t.status === 'planned' || t.status === 'pending')
      pendingTimeOff.forEach(t => {
        items.push({
          id: `timeoff-${t.id}`,
          type: 'timeoff',
          icon: FileText,
          title: `Time off: ${t.personName || 'Employee'}`,
          detail: `${t.startDate} to ${t.endDate} (${t.days} days)`,
          time: t.startDate,
          color: 'purple'
        })
      })
    }

    // Sort by time (soonest first)
    items.sort((a, b) => new Date(a.time) - new Date(b.time))
    setNotifications(items)
  }

  const colorMap = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl overflow-hidden animate-slide-in-right">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Bell className="w-4 h-4" />
            <h3 className="font-semibold text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{notifications.length}</span>
            )}
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-60px)]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No notifications right now</p>
              <p className="text-xs mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map(n => {
                const Icon = n.icon
                return (
                  <div key={n.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${colorMap[n.color] || colorMap.blue}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.detail}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
