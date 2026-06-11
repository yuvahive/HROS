import React, { useState } from 'react'
import { X, Star, CheckCircle, AlertCircle, XCircle, Send, FileText, Image, Code, Presentation, File, ExternalLink, Download } from 'lucide-react'

const statusOptions = [
  { value: 'under-review', label: 'Under Review', icon: AlertCircle, color: 'text-yellow-600' },
  { value: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-green-600' },
  { value: 'needs-revision', label: 'Needs Revision', icon: AlertCircle, color: 'text-orange-600' },
  { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-600' }
]

function formatFileSize(bytes) {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function ReviewPanel({ upload, onClose, onSave, canReview }) {
  const [status, setStatus] = useState(upload.status || 'uploaded')
  const [reviewComments, setReviewComments] = useState(upload.reviewComments || '')
  const [reviewRating, setReviewRating] = useState(upload.reviewRating || 0)
  const [hoveredStar, setHoveredStar] = useState(0)

  if (!upload) return null

  const isImage = upload.fileType?.startsWith('image/')
  const isPDF = upload.fileType === 'application/pdf'
  const isVideo = upload.fileType?.startsWith('video/')
  const isCode = upload.category === 'code'
  const hasFileData = upload.fileData && upload.fileData.length > 0
  const hasDriveFile = upload.driveFileUrl
  const hasExternalLink = upload.externalLink

  const handleSave = () => {
    onSave?.({
      ...upload,
      status,
      reviewComments,
      reviewRating: reviewRating || null,
      reviewerId: upload.reviewerId,
      reviewerName: upload.reviewerName,
      reviewDate: new Date().toISOString()
    })
  }

  const renderPreview = () => {
    if (hasExternalLink) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
          <ExternalLink className="w-12 h-12 text-blue-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{upload.fileName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">External Link</p>
          <a
            href={upload.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Open Link
          </a>
        </div>
      )
    }

    if (isImage && hasFileData) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
          <img
            src={upload.fileData}
            alt={upload.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )
    }

    if (isPDF && hasFileData) {
      return (
        <div className="w-full h-full rounded-xl overflow-hidden bg-white dark:bg-gray-900">
          <iframe
            src={upload.fileData}
            className="w-full h-full border-0"
            title={upload.title}
          />
        </div>
      )
    }

    if (isVideo && hasFileData) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl">
          <video
            src={upload.fileData}
            controls
            className="max-w-full max-h-full"
          >
            Your browser does not support video playback.
          </video>
        </div>
      )
    }

    if (isCode) {
      let codeContent = ''
      try {
        if (hasFileData && upload.fileData.startsWith('data:')) {
          codeContent = atob(upload.fileData.split(',')[1] || '')
        } else if (hasFileData) {
          codeContent = atob(upload.fileData)
        }
      } catch {
        codeContent = '[Binary content - cannot display inline]'
      }
      return (
        <div className="w-full h-full rounded-xl overflow-hidden bg-gray-900 p-4">
          <pre className="text-xs text-green-400 font-mono overflow-auto h-full whitespace-pre-wrap">
            {codeContent || '[No preview available]'}
          </pre>
        </div>
      )
    }

    if (hasDriveFile) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
          <FileText className="w-12 h-12 text-blue-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{upload.fileName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Stored on Google Drive</p>
          <a
            href={upload.driveFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Open in Drive
          </a>
        </div>
      )
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <File className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{upload.fileName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{formatFileSize(upload.fileSize)}</p>
        <p className="text-xs text-gray-400">Preview not available for this file type</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{upload.title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Uploaded by {upload.uploaderName} &middot; {new Date(upload.uploadDate).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preview Window */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Preview</h3>
            <div className="h-80 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              {renderPreview()}
            </div>
          </div>

          {/* File Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">File</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{upload.fileName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(upload.fileSize)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Category</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{upload.category}</p>
              {upload.version > 1 && <p className="text-xs text-gray-500 dark:text-gray-400">Version {upload.version}</p>}
            </div>
          </div>

          {/* Description */}
          {upload.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{upload.description}</p>
            </div>
          )}

          {/* Tags */}
          {upload.tags?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {upload.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Download / Open buttons */}
          <div className="flex gap-2">
            {hasFileData && (
              <a
                href={upload.fileData}
                download={upload.fileName}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
            {hasDriveFile && (
              <a
                href={upload.driveFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Drive
              </a>
            )}
            {hasExternalLink && (
              <a
                href={upload.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Link
              </a>
            )}
          </div>

          {/* Review Section */}
          {canReview && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Review</h3>

              {/* Status */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(opt => {
                    const OptIcon = opt.icon
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setStatus(opt.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          status === opt.value
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <OptIcon className={`w-3.5 h-3.5 ${opt.color}`} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setReviewRating(star === reviewRating ? 0 : star)}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoveredStar || reviewRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  {reviewRating > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{reviewRating}/5</span>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Comments</label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add review comments..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit Review
              </button>
            </div>
          )}

          {/* Read-only review display for non-reviewers */}
          {!canReview && upload.reviewComments && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Review</h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {upload.reviewRating && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= upload.reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    by {upload.reviewerName} on {upload.reviewDate ? new Date(upload.reviewDate).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{upload.reviewComments}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
