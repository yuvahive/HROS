import React from 'react'
import { Edit2, Trash2, Award, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react'

export default function InternshipCard({ internship, onEdit, onDelete, onGenerateCertificate }) {
  const getStageColor = (stage) => {
    const colors = {
      onboarding: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-purple-100 text-purple-800 border-purple-200',
      'final-review': 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getDaysElapsed = () => {
    const start = new Date(internship.startDate)
    const now = new Date()
    return Math.floor((now - start) / (1000 * 60 * 60 * 24))
  }

  const getTotalDays = () => {
    const start = new Date(internship.startDate)
    const end = new Date(internship.endDate)
    const total = Math.floor((end - start) / (1000 * 60 * 60 * 24))
    return total > 0 ? total : 1
  }

  const progressPercent = (getDaysElapsed() / getTotalDays()) * 100

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-400'
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-blue-600'
    if (score >= 4) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow p-5">
      {/* Header with name and stage */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">{internship.personName}</h3>
          <p className="text-sm text-gray-600">{internship.position}</p>
          <div className="flex gap-2 mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStageColor(internship.stage)}`}>
              {internship.stage}
            </span>
            {internship.finalScore && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                ✓ Completed
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(internship)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(internship.id)}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* College & Duration Info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-sm">
          <p className="text-gray-500 text-xs font-semibold uppercase">College</p>
          <p className="text-gray-900 font-medium">{internship.college}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-500 text-xs font-semibold uppercase">Duration</p>
          <p className="text-gray-900 font-medium">{internship.durationWeeks} weeks</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-semibold text-gray-600">Progress</p>
          <span className="text-xs text-gray-500">
            Day {getDaysElapsed()} of {getTotalDays()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Mentor & Manager */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase">Mentor</p>
          <p className="text-gray-900 font-medium truncate">{internship.mentorName || 'Not assigned'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase">Department</p>
          <p className="text-gray-900 font-medium truncate">{internship.department}</p>
        </div>
      </div>

      {/* Scores */}
      {(internship.finalScore || internship.midtermScore) && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Performance Scores</p>
          <div className="grid grid-cols-4 gap-2">
            {internship.finalScore && (
              <div className="text-center">
                <div className={`text-lg font-bold ${getScoreColor(internship.finalScore)}`}>
                  {internship.finalScore}/10
                </div>
                <p className="text-xs text-gray-600 mt-1">Final</p>
              </div>
            )}
            {internship.technicalCompetency && (
              <div className="text-center">
                <div className={`text-lg font-bold ${getScoreColor(internship.technicalCompetency)}`}>
                  {internship.technicalCompetency}/10
                </div>
                <p className="text-xs text-gray-600 mt-1">Technical</p>
              </div>
            )}
            {internship.communicationSkills && (
              <div className="text-center">
                <div className={`text-lg font-bold ${getScoreColor(internship.communicationSkills)}`}>
                  {internship.communicationSkills}/10
                </div>
                <p className="text-xs text-gray-600 mt-1">Communication</p>
              </div>
            )}
            {internship.teamworkRating && (
              <div className="text-center">
                <div className={`text-lg font-bold ${getScoreColor(internship.teamworkRating)}`}>
                  {internship.teamworkRating}/10
                </div>
                <p className="text-xs text-gray-600 mt-1">Teamwork</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-xs text-gray-600">Tasks</p>
            <p className="font-bold text-gray-900">{internship.tasksCompleted}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-600">Projects</p>
            <p className="font-bold text-gray-900">{internship.projectsCompleted}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-xs text-gray-600">Attendance</p>
            <p className="font-bold text-gray-900">{internship.attendancePercentage}%</p>
          </div>
        </div>
      </div>

      {/* Certificate & Future */}
      <div className="space-y-2">
        {internship.stage === 'completed' && !internship.certificateGenerated && (
          <button
            onClick={() => onGenerateCertificate(internship)}
            className="w-full py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold text-sm hover:shadow-md transition-shadow flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            Generate Certificate
          </button>
        )}

        {internship.certificateGenerated && (
          <div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg border border-green-200">
            <Award className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Certificate Generated</span>
          </div>
        )}

        {internship.fteRecommendation && (
          <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-200">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">FTE Recommendation: {internship.fteRecommendation}</span>
          </div>
        )}

        {internship.finalFeedback && (
          <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 line-clamp-2 italic">"{internship.finalFeedback}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
