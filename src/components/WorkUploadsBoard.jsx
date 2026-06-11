import React, { useState, useEffect, useContext } from 'react'
import { Upload, Search, Filter, Grid, List, Clock, CheckCircle, AlertCircle, Eye, XCircle, Plus, Archive, BarChart3 } from 'lucide-react'
import { getAllFromDB, addToDB, updateInDB, deleteFromDB, STORES } from '../utils/indexedDB'
import { AuthContext, useCloudPulse } from '../context/AuthContext'
import { generateID } from '../utils/sampleData'
import WorkUploadCard from './WorkUploadCard'
import WorkUploadForm from './WorkUploadForm'
import ReviewPanel from './ReviewPanel'
import LoggingService from '../services/LoggingService'

const STATUS_FILTERS = [
  { value: 'all', label: 'All', icon: null },
  { value: 'uploaded', label: 'Uploaded', icon: Clock, color: 'text-blue-500' },
  { value: 'under-review', label: 'Under Review', icon: Eye, color: 'text-yellow-500' },
  { value: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-green-500' },
  { value: 'needs-revision', label: 'Needs Revision', icon: AlertCircle, color: 'text-orange-500' },
  { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-500' }
]

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All Categories' },
  { value: 'document', label: 'Documents' },
  { value: 'code', label: 'Code' },
  { value: 'design', label: 'Design' },
  { value: 'presentation', label: 'Presentations' },
  { value: 'other', label: 'Other' }
]

export default function WorkUploadsBoard() {
  const { currentUser, hasPermission, filterByTeam } = useContext(AuthContext)
  const lastPulse = useCloudPulse()
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedUpload, setSelectedUpload] = useState(null)
  const [showReview, setShowReview] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  const canCreate = hasPermission('workUploads', 'create')
  const canReview = hasPermission('workUploads', 'review')
  const canDelete = hasPermission('workUploads', 'delete')

  const effectiveRole = currentUser?.role

  useEffect(() => {
    loadUploads()
  }, [lastPulse])

  const loadUploads = async () => {
    try {
      const raw = await getAllFromDB(STORES.workUploads)
      let filtered = raw

      // Role-based filtering
      if (['admin', 'HR'].includes(effectiveRole)) {
        filtered = raw
      } else if (effectiveRole === 'TeamLead') {
        filtered = raw.filter(u => u.teamId === currentUser.teamId || u.uploaderId === currentUser.id)
      } else {
        filtered = raw.filter(u => u.uploaderId === currentUser.id)
      }

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        filtered = filtered.filter(u =>
          u.title?.toLowerCase().includes(q) ||
          u.description?.toLowerCase().includes(q) ||
          u.uploaderName?.toLowerCase().includes(q) ||
          u.fileName?.toLowerCase().includes(q) ||
          u.tags?.some(t => t.toLowerCase().includes(q))
        )
      }

      // Status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(u => u.status === statusFilter)
      }

      // Category filter
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(u => u.category === categoryFilter)
      }

      // Sort by upload date (newest first)
      filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))

      setUploads(filtered)
      setLoading(false)
    } catch (error) {
      console.error('Error loading uploads:', error)
      setLoading(false)
    }
  }

  const handleUpload = async (upload) => {
    await addToDB(STORES.workUploads, upload)
    LoggingService.log(currentUser, 'CREATE', 'WORK_UPLOAD', `Uploaded: ${upload.title}`)
    setShowForm(false)
    loadUploads()
  }

  const handleReviewSave = async (updated) => {
    await updateInDB(STORES.workUploads, updated)
    LoggingService.log(currentUser, 'UPDATE', 'WORK_UPLOAD', `Reviewed: ${updated.title} -> ${updated.status}`)
    setShowReview(false)
    setSelectedUpload(null)
    loadUploads()
  }

  const handleDelete = async (upload) => {
    if (!canDelete) {
      alert('You do not have permission to delete uploads.')
      return
    }
    if (!window.confirm(`Delete "${upload.title}"?`)) return
    await deleteFromDB(STORES.workUploads, upload.id)
    LoggingService.log(currentUser, 'DELETE', 'WORK_UPLOAD', `Deleted: ${upload.title}`)
    setShowReview(false)
    setSelectedUpload(null)
    loadUploads()
  }

  const handleCardClick = (upload) => {
    setSelectedUpload(upload)
    setShowReview(true)
  }

  const handlePreview = (upload) => {
    setSelectedUpload(upload)
    setShowReview(true)
  }

  // Stats
  const stats = {
    total: uploads.length,
    uploaded: uploads.filter(u => u.status === 'uploaded').length,
    underReview: uploads.filter(u => u.status === 'under-review').length,
    approved: uploads.filter(u => u.status === 'approved').length,
    needsRevision: uploads.filter(u => u.status === 'needs-revision').length,
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Work Uploads</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Upload and review work deliverables
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Upload Work
            </button>
          )}
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="font-semibold text-gray-900 dark:text-white">{stats.total}</span> total
          </div>
          {stats.uploaded > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">{stats.uploaded} new</span>
            </div>
          )}
          {stats.underReview > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Eye className="w-3 h-3 text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400">{stats.underReview} reviewing</span>
            </div>
          )}
          {stats.approved > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">{stats.approved} approved</span>
            </div>
          )}
          {stats.needsRevision > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <AlertCircle className="w-3 h-3 text-orange-500" />
              <span className="text-gray-600 dark:text-gray-400">{stats.needsRevision} revision</span>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search uploads..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {STATUS_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {CATEGORY_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              title="Grid view"
            >
              <Grid className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              title="List view"
            >
              <List className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading uploads...</p>
            </div>
          </div>
        ) : uploads.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No uploads yet</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {canCreate ? 'Upload your first work deliverable to get started' : 'No uploads available for you yet'}
              </p>
              {canCreate && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Upload Work
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {uploads.map(upload => (
              <WorkUploadCard
                key={upload.id}
                upload={upload}
                canReview={canReview}
                onClick={handleCardClick}
                onPreview={handlePreview}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {uploads.map(upload => (
              <WorkUploadCard
                key={upload.id}
                upload={upload}
                canReview={canReview}
                onClick={handleCardClick}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Form Modal */}
      {showForm && (
        <WorkUploadForm
          onSubmit={handleUpload}
          onClose={() => setShowForm(false)}
          currentUser={currentUser}
        />
      )}

      {/* Review Panel */}
      {showReview && selectedUpload && (
        <ReviewPanel
          upload={selectedUpload}
          canReview={canReview}
          onClose={() => { setShowReview(false); setSelectedUpload(null) }}
          onSave={handleReviewSave}
        />
      )}
    </div>
  )
}
