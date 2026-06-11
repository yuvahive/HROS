import React from 'react'
import { FileText, Image, Code, Presentation, File, ExternalLink, Star, Clock, CheckCircle, AlertCircle, XCircle, Eye } from 'lucide-react'

const categoryIcons = {
  document: FileText,
  code: Code,
  design: Image,
  presentation: Presentation,
  other: File
}

const statusConfig = {
  uploaded: { label: 'Uploaded', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: Clock },
  'under-review': { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Eye },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
  'needs-revision': { label: 'Needs Revision', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', icon: AlertCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: XCircle }
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return diffMins + 'm ago'
  if (diffHrs < 24) return diffHrs + 'h ago'
  if (diffDays < 7) return diffDays + 'd ago'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function WorkUploadCard({ upload, canReview, onClick, onPreview }) {
  const Icon = categoryIcons[upload.category] || File
  const status = statusConfig[upload.status] || statusConfig.uploaded
  const StatusIcon = status.icon

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={() => onClick?.(upload)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            upload.category === 'code' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
            upload.category === 'design' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' :
            upload.category === 'presentation' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
            'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{upload.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{upload.fileName}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${status.color}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      {upload.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{upload.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{upload.uploaderName}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
          <span>{formatDate(upload.uploadDate)}</span>
          {upload.fileSize > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
              <span>{formatFileSize(upload.fileSize)}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {upload.externalLink && (
            <a
              href={upload.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Open external link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {(upload.fileData || upload.driveFileUrl) && (
            <button
              onClick={(e) => { e.stopPropagation(); onPreview?.(upload) }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Preview file"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {upload.reviewRating && (
        <div className="flex items-center gap-0.5 mt-2">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={`w-3 h-3 ${star <= upload.reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
            />
          ))}
          {upload.reviewerName && (
            <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">by {upload.reviewerName}</span>
          )}
        </div>
      )}

      {upload.reviewComments && canReview && (
        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2">{upload.reviewComments}</p>
        </div>
      )}
    </div>
  )
}
