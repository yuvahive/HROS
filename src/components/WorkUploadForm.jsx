import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Image, Code, Presentation, File, Link, Tag, AlertCircle, Cloud } from 'lucide-react'
import { generateID } from '../utils/sampleData'
import { uploadToWorkDrive, WORK_UPLOADS_FOLDER_URL } from '../utils/googleDriveSync'

const CATEGORIES = [
  { value: 'document', label: 'Document', icon: FileText, accept: '.pdf,.doc,.docx,.txt,.rtf,.odt' },
  { value: 'code', label: 'Code', icon: Code, accept: '.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.go,.rs,.html,.css,.json,.xml,.sql,.sh' },
  { value: 'design', label: 'Design', icon: Image, accept: '.png,.jpg,.jpeg,.gif,.svg,.fig,.sketch,.psd,.ai' },
  { value: 'presentation', label: 'Presentation', icon: Presentation, accept: '.ppt,.pptx,.key,.odp' },
  { value: 'other', label: 'Other', icon: File, accept: '*' }
]

const MAX_BASE64_SIZE = 500 * 1024

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function WorkUploadForm({ onSubmit, onClose, currentUser }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('document')
  const [externalLink, setExternalLink] = useState('')
  const [tags, setTags] = useState('')
  const [file, setFile] = useState(null)
  const [fileData, setFileData] = useState(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [fileType, setFileType] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const currentCategory = CATEGORIES.find(c => c.value === category)

  const handleFile = useCallback((selectedFile) => {
    setError('')
    if (!selectedFile) return

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB')
      return
    }

    setFile(selectedFile)
    setFileName(selectedFile.name)
    setFileSize(selectedFile.size)
    setFileType(selectedFile.type)

    if (selectedFile.size <= MAX_BASE64_SIZE) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFileData(e.target.result)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setFileData(null)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFile(droppedFile)
  }, [handleFile])

  const handleFileInput = (e) => {
    handleFile(e.target.files[0])
  }

  const removeFile = () => {
    setFile(null)
    setFileData(null)
    setFileName('')
    setFileSize(0)
    setFileType('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!file && !externalLink.trim()) {
      setError('Please upload a file or add an external link')
      return
    }

    setUploading(true)
    try {
      let driveFileId = ''
      let driveFileUrl = ''
      let storedFileData = fileData || ''
      let storedFileName = fileName || externalLink.split('/').pop() || 'link'
      let storedFileSize = fileSize
      let storedFileType = fileType

      // If file is larger than 500KB, upload to Google Drive
      if (file && file.size > 500 * 1024) {
        const driveResult = await uploadToWorkDrive(file, currentUser.name, title.trim())
        if (driveResult.success) {
          driveFileId = driveResult.fileId
          driveFileUrl = driveResult.fileUrl
          storedFileData = '' // Don't store base64 for large files
        } else {
          setError('Drive upload failed: ' + (driveResult.error || 'Unknown error'))
          setUploading(false)
          return
        }
      }

      const upload = {
        id: generateID('upload'),
        uploaderId: currentUser.id,
        uploaderName: currentUser.name,
        uploaderRole: currentUser.role,
        teamId: currentUser.teamId || '',
        title: title.trim(),
        description: description.trim(),
        category,
        projectId: '',
        taskId: '',
        fileName: storedFileName,
        fileSize: storedFileSize,
        fileType: storedFileType,
        fileData: storedFileData,
        driveFileId,
        driveFileUrl,
        externalLink: externalLink.trim(),
        status: 'uploaded',
        reviewerId: null,
        reviewerName: null,
        reviewDate: null,
        reviewComments: '',
        reviewRating: null,
        uploadDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
        version: 1,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        isArchived: false
      }
      await onSubmit(upload)
    } catch (err) {
      setError('Failed to upload. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload Work</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q1 Marketing Report"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this work..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const CatIcon = cat.icon
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      category === cat.value
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* File Drop Zone */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">File *</label>
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {isDragging ? 'Drop file here' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Max 10MB &middot; Files &gt;500KB auto-upload to Google Drive
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInput}
                  accept={currentCategory?.accept}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(fileSize)}</p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>

          {/* File Preview */}
          {file && fileData && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Preview</label>
              <div className="h-48 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
                {fileType?.startsWith('image/') ? (
                  <img src={fileData} alt={fileName} className="w-full h-full object-contain" />
                ) : fileType === 'application/pdf' ? (
                  <iframe src={fileData} className="w-full h-full border-0" title={fileName} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">{fileName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* External Link */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              <span className="flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5" />
                External Link (optional)
              </span>
            </label>
            <input
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://docs.google.com/..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Google Docs, Notion, Figma, etc.</p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Tags (comma separated)
              </span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="report, marketing, Q1"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  )
}
