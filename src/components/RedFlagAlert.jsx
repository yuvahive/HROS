import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  Flame,
  TrendingDown,
  Users,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { getAllFromDB, deleteFromDB, STORES } from '../utils/indexedDB'
import { detectAllRedFlags, resolveFlag, SEVERITY } from '../utils/redFlagDetector'

export default function RedFlagAlert() {
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, active, resolved
  const [lastRunTime, setLastRunTime] = useState(null)

  // Load flags on mount
  useEffect(() => {
    loadFlags()
  }, [])

  const loadFlags = async () => {
    try {
      const allFlags = await getAllFromDB(STORES.redFlags)
      setFlags(allFlags)
      setLastRunTime(new Date())
    } catch (error) {
      console.error('Error loading flags:', error)
    }
  }

  const handleDetectNow = async () => {
    setLoading(true)
    try {
      const result = await detectAllRedFlags()
      await loadFlags()
    } catch (error) {
      console.error('Error detecting flags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolveFlag = async (flagId) => {
    try {
      await resolveFlag(flagId)
      await loadFlags()
    } catch (error) {
      console.error('Error resolving flag:', error)
    }
  }

  const handleDeleteFlag = async (flagId) => {
    try {
      await deleteFromDB(STORES.redFlags, flagId)
      await loadFlags()
    } catch (error) {
      console.error('Error deleting flag:', error)
    }
  }

  // Filter flags based on selection
  const filteredFlags =
    filter === 'active'
      ? flags.filter((f) => !f.resolved)
      : filter === 'resolved'
        ? flags.filter((f) => f.resolved)
        : flags

  // Count by severity
  const severityCounts = {
    critical: flags.filter((f) => f.severity === SEVERITY.CRITICAL && !f.resolved).length,
    high: flags.filter((f) => f.severity === SEVERITY.HIGH && !f.resolved).length,
    medium: flags.filter((f) => f.severity === SEVERITY.MEDIUM && !f.resolved).length,
    low: flags.filter((f) => f.severity === SEVERITY.LOW && !f.resolved).length
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case SEVERITY.CRITICAL:
        return <Flame className="w-5 h-5 text-red-600" />
      case SEVERITY.HIGH:
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case SEVERITY.MEDIUM:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case SEVERITY.CRITICAL:
        return 'bg-red-50 border-red-200'
      case SEVERITY.HIGH:
        return 'bg-orange-50 border-orange-200'
      case SEVERITY.MEDIUM:
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'burnout':
        return '🔥'
      case 'blockers':
        return '🚧'
      case 'disengagement':
        return '🤷'
      case 'performance':
        return '📊'
      default:
        return '⚠️'
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              Red Flag Detection
            </h1>
            <p className="text-gray-600 mt-1">Auto-detect burnout, blockers, disengagement & performance issues</p>
          </div>
          <button
            onClick={handleDetectNow}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Detecting...' : 'Detect Now'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{severityCounts.critical}</div>
            <p className="text-xs text-gray-600">Critical</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{severityCounts.high}</div>
            <p className="text-xs text-gray-600">High</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{severityCounts.medium}</div>
            <p className="text-xs text-gray-600">Medium</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{severityCounts.low}</div>
            <p className="text-xs text-gray-600">Low</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
            <div className="text-2xl font-bold text-gray-600">{filteredFlags.length}</div>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>

        {/* Last run time */}
        {lastRunTime && (
          <p className="text-xs text-gray-500 mt-4">
            Last detection: {lastRunTime.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Filter buttons */}
      <div className="bg-white border-b px-6 py-3 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1 rounded-full text-sm font-medium ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({flags.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-1 rounded-full text-sm font-medium ${
            filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Active ({flags.filter((f) => !f.resolved).length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-1 rounded-full text-sm font-medium ${
            filter === 'resolved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Resolved ({flags.filter((f) => f.resolved).length})
        </button>
      </div>

      {/* Flags list */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredFlags.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              {filter === 'resolved' ? 'No resolved flags' : 'No flags detected - Team is healthy! ✨'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFlags.map((flag) => (
              <div
                key={flag.id}
                className={`border rounded-lg p-4 ${getSeverityColor(flag.severity)} ${
                  flag.resolved ? 'opacity-60' : ''
                }`}
              >
                {/* Flag Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div>{getSeverityIcon(flag.severity)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {getTypeIcon(flag.type)} {flag.title}
                        </h3>
                        {flag.status === 'resolved' && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{flag.description}</p>

                      {/* Person and timestamp */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <span>👤 {flag.personName}</span>
                        <span>📅 {new Date(flag.detectedDate).toLocaleDateString()}</span>
                      </div>

                      {/* Metrics */}
                      {flag.metrics && (
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(flag.metrics).map(([key, value]) => (
                            <div key={key} className="bg-white bg-opacity-50 p-2 rounded">
                              <span className="text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1')}: <strong>{value}</strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recommended action */}
                      <div className="mt-3 p-3 bg-white bg-opacity-60 rounded text-sm text-gray-700">
                        <span className="font-medium">💡 Recommended:</span> {flag.recommended_action}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {!flag.resolved && (
                      <button
                        onClick={() => handleResolveFlag(flag.id)}
                        className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap"
                      >
                        ✓ Resolve
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteFlag(flag.id)}
                      className="text-xs px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-600 whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="bg-white border-t p-4 text-xs text-gray-600">
        <p>
          💡 <strong>Tip:</strong> Red flags are detected automatically based on work patterns, but human
          judgment is always needed. Use these alerts to start conversations and support your team.
        </p>
      </div>
    </div>
  )
}
