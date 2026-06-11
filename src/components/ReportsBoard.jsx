import React, { useState, useEffect } from 'react'
import { BarChart3, Download, TrendingUp, Calendar, Filter, Eye } from 'lucide-react'
import { getAllFromDB, STORES } from '../utils/indexedDB'

export default function ReportsBoard() {
  const [reportType, setReportType] = useState('overview')
  const [dateRange, setDateRange] = useState('thisMonth')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReportData()
  }, [reportType, dateRange])

  const loadReportData = async () => {
    setLoading(true)
    try {
      const data = {
        timestamp: new Date().toISOString(),
        dateRange,
        overview: {},
        hiring: {},
        performance: {},
        operations: {}
      }

      // Load all data
      const [
        people,
        hiring,
        onboarding,
        exits,
        projects,
        actionItems,
        oneOnOnes,
        redFlags,
        workLogs,
        timeOff
      ] = await Promise.all([
        getAllFromDB(STORES.people),
        getAllFromDB(STORES.hiringPipeline),
        getAllFromDB(STORES.onboarding),
        getAllFromDB(STORES.exits),
        getAllFromDB(STORES.projects),
        getAllFromDB(STORES.actionItems),
        getAllFromDB(STORES.oneOnOnes),
        getAllFromDB(STORES.redFlags),
        getAllFromDB(STORES.workLogs),
        getAllFromDB(STORES.timeOff)
      ])

      // Calculate metrics based on date range
      const dateFilter = getDateRange(dateRange)

      // OVERVIEW SECTION
      data.overview = {
        totalEmployees: people.length,
        activeHires: hiring.filter((h) => h.status === 'offer' || h.status === 'hire').length,
        departuresThisMonth: exits.filter((e) => {
          const lastDay = new Date(e.lastDay)
          return lastDay >= dateFilter.start && lastDay <= dateFilter.end
        }).length,
        activeProjects: projects.filter((p) => p.status === 'in-progress').length,
        overdueActions: actionItems.filter((a) => {
          const daysOverdue = Math.ceil((new Date() - new Date(a.dueDate)) / (1000 * 60 * 60 * 24))
          return daysOverdue > 0 && a.status !== 'completed'
        }).length
      }

      // HIRING METRICS
      const totalApplied = hiring.filter((h) =>
        new Date(h.appliedDate) >= dateFilter.start &&
        new Date(h.appliedDate) <= dateFilter.end
      )
      const hired = hiring.filter((h) => h.stage === 'hired')
      const rejections = hiring.filter((h) => h.stage === 'rejected')

      data.hiring = {
        totalApplications: totalApplied.length,
        totalHired: hired.length,
        totalRejected: rejections.length,
        conversionRate: totalApplied.length > 0 ? ((hired.length / totalApplied.length) * 100).toFixed(1) : 0,
        averageTimeToHire: calculateAverageTimeToHire(hiring),
        pipelineValue: hired.length * 2.5, // Assumed value per hire
        byStage: {
          applied: hiring.filter((h) => h.stage === 'applied').length,
          screening: hiring.filter((h) => h.stage === 'screening').length,
          interview: hiring.filter((h) => h.stage === 'interview').length,
          offer: hiring.filter((h) => h.stage === 'offer').length
        }
      }

      // PERFORMANCE METRICS
      const activeOnboardings = onboarding.filter((o) => o.milestoneStatus !== 'completed')
      const completedOnboardings = onboarding.filter((o) => o.milestoneStatus === 'completed')
      const recentRedFlags = redFlags.filter((r) =>
        new Date(r.detectedDate) >= dateFilter.start &&
        new Date(r.detectedDate) <= dateFilter.end
      )

      data.performance = {
        onboardingCompletion: onboarding.length > 0
          ? ((completedOnboardings.length / onboarding.length) * 100).toFixed(1)
          : 0,
        activeOnboardings: activeOnboardings.length,
        completedOnboardings: completedOnboardings.length,
        redFlagsDetected: recentRedFlags.length,
        burnoutCases: recentRedFlags.filter((f) => f.type === 'burnout').length,
        blockerCases: recentRedFlags.filter((f) => f.type === 'blockers').length,
        disengagementCases: recentRedFlags.filter((f) => f.type === 'disengagement').length,
        averageOneOnOnesPerEmployee: people.length > 0
          ? (oneOnOnes.filter((o) =>
              new Date(o.scheduledDate) >= dateFilter.start &&
              new Date(o.scheduledDate) <= dateFilter.end
            ).length / people.length).toFixed(2)
          : 0
      }

      // OPERATIONS METRICS
      const projectsAtRisk = projects.filter((p) => {
        const daysUntilDue = Math.ceil((new Date(p.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
        return daysUntilDue <= 7 && daysUntilDue > 0
      })
      const projectsBlocked = projects.filter((p) => p.status === 'blocked')
      const completedProjects = projects.filter((p) => p.status === 'completed')
      const completedActions = actionItems.filter((a) => a.status === 'completed')

      data.operations = {
        totalProjects: projects.length,
        projectsAtRisk: projectsAtRisk.length,
        projectsBlocked: projectsBlocked.length,
        completedProjects: completedProjects.length,
        projectCompletionRate: projects.length > 0
          ? ((completedProjects.length / projects.length) * 100).toFixed(1)
          : 0,
        actionItemsCompleted: completedActions.length,
        actionItemsOverdue: data.overview.overdueActions,
        averageProjectProgress: projects.length > 0
          ? (projects.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / projects.length).toFixed(1)
          : 0,
        totalWorkHoursLogged: workLogs.filter((w) =>
          new Date(w.date) >= dateFilter.start &&
          new Date(w.date) <= dateFilter.end
        ).reduce((sum, w) => sum + (w.hoursWorked || 0), 0)
      }

      setReportData(data)
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (!reportData) return

    const csv = generateCSV(reportData)
    downloadFile(csv, `hros-report-${reportData.dateRange}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
  }

  const handleExportPDF = () => {
    if (!reportData) return
    alert('PDF export feature coming in next update. CSV available now.')
  }

  if (loading) {
    return <div className="p-8 text-center">Loading report data...</div>
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1">Company-wide metrics and insights</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="thisYear">This Year</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {reportData && (
          <div className="space-y-8">
            {/* OVERVIEW SECTION */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <MetricCard
                  title="Total Employees"
                  value={reportData.overview.totalEmployees}
                  change="Headcount"
                  icon="👥"
                />
                <MetricCard
                  title="Active Hires"
                  value={reportData.overview.activeHires}
                  change="In Progress"
                  icon="📋"
                />
                <MetricCard
                  title="Departures"
                  value={reportData.overview.departuresThisMonth}
                  change={`This ${reportData.dateRange}`}
                  icon="👋"
                />
                <MetricCard
                  title="Active Projects"
                  value={reportData.overview.activeProjects}
                  change="In Progress"
                  icon="📊"
                />
                <MetricCard
                  title="Overdue Actions"
                  value={reportData.overview.overdueActions}
                  change="Need attention"
                  icon="⚠️"
                  color="red"
                />
              </div>
            </section>

            {/* HIRING METRICS */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hiring Metrics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Summary</h3>
                  <div className="space-y-3">
                    <MetricRow label="Total Applications" value={reportData.hiring.totalApplications} />
                    <MetricRow label="Total Hired" value={reportData.hiring.totalHired} color="green" />
                    <MetricRow label="Total Rejected" value={reportData.hiring.totalRejected} color="red" />
                    <MetricRow label="Conversion Rate" value={`${reportData.hiring.conversionRate}%`} />
                    <MetricRow label="Avg. Time to Hire" value={`${reportData.hiring.averageTimeToHire} days`} />
                    <MetricRow label="Pipeline Value" value={`$${reportData.hiring.pipelineValue.toFixed(0)}K`} />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Breakdown</h3>
                  <div className="space-y-3">
                    <ProgressBar
                      label="Applied"
                      value={reportData.hiring.byStage.applied}
                      total={reportData.hiring.totalApplications}
                      color="blue"
                    />
                    <ProgressBar
                      label="Screening"
                      value={reportData.hiring.byStage.screening}
                      total={reportData.hiring.totalApplications}
                      color="yellow"
                    />
                    <ProgressBar
                      label="Interview"
                      value={reportData.hiring.byStage.interview}
                      total={reportData.hiring.totalApplications}
                      color="purple"
                    />
                    <ProgressBar
                      label="Offer"
                      value={reportData.hiring.byStage.offer}
                      total={reportData.hiring.totalApplications}
                      color="green"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* PERFORMANCE METRICS */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance & Wellbeing</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                        <span className="text-sm font-bold text-gray-900">{reportData.performance.onboardingCompletion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${reportData.performance.onboardingCompletion}%` }}
                        />
                      </div>
                    </div>
                    <MetricRow label="Active Onboardings" value={reportData.performance.activeOnboardings} />
                    <MetricRow label="Completed Onboardings" value={reportData.performance.completedOnboardings} color="green" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Red Flags Detected</h3>
                  <div className="space-y-3">
                    <MetricRow label="Total Red Flags" value={reportData.performance.redFlagsDetected} color="red" />
                    <MetricRow label="Burnout Cases" value={reportData.performance.burnoutCases} color="orange" />
                    <MetricRow label="Blocker Cases" value={reportData.performance.blockerCases} color="yellow" />
                    <MetricRow label="Disengagement" value={reportData.performance.disengagementCases} color="red" />
                    <MetricRow label="Avg 1:1s per Employee" value={reportData.performance.averageOneOnOnesPerEmployee} />
                  </div>
                </div>
              </div>
            </section>

            {/* OPERATIONS METRICS */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Execution & Operations</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
                  <div className="space-y-3">
                    <MetricRow label="Total Projects" value={reportData.operations.totalProjects} />
                    <MetricRow label="Projects At Risk" value={reportData.operations.projectsAtRisk} color="red" />
                    <MetricRow label="Projects Blocked" value={reportData.operations.projectsBlocked} color="orange" />
                    <MetricRow label="Completed Projects" value={reportData.operations.completedProjects} color="green" />
                    <MetricRow label="Completion Rate" value={`${reportData.operations.projectCompletionRate}%`} />
                    <MetricRow label="Avg Progress" value={`${reportData.operations.averageProjectProgress}%`} />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Items & Hours</h3>
                  <div className="space-y-3">
                    <MetricRow label="Actions Completed" value={reportData.operations.actionItemsCompleted} color="green" />
                    <MetricRow label="Actions Overdue" value={reportData.operations.actionItemsOverdue} color="red" />
                    <MetricRow label="Total Work Hours Logged" value={reportData.operations.totalWorkHoursLogged.toFixed(0)} />
                  </div>
                </div>
              </div>
            </section>

            {/* INSIGHTS */}
            <section className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 Key Insights</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                {reportData.overview.overdueActions > 0 && (
                  <li>• ⚠️ {reportData.overview.overdueActions} action items are overdue - prioritize immediate follow-up</li>
                )}
                {reportData.operations.projectsAtRisk > 0 && (
                  <li>• 🚨 {reportData.operations.projectsAtRisk} projects are at risk (≤7 days to deadline)</li>
                )}
                {reportData.performance.redFlagsDetected > 0 && (
                  <li>• 🚩 {reportData.performance.redFlagsDetected} employee red flags detected - consider support interventions</li>
                )}
                {reportData.hiring.conversionRate > 20 && (
                  <li>• ✅ Hiring conversion rate is strong at {reportData.hiring.conversionRate}%</li>
                )}
                {reportData.performance.onboardingCompletion > 75 && (
                  <li>• 🎯 Onboarding completion at {reportData.performance.onboardingCompletion}% - good program effectiveness</li>
                )}
                {reportData.overview.activeProjects > 0 && (
                  <li>• 📈 {reportData.overview.activeProjects} active projects executing in parallel</li>
                )}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper Components
function MetricCard({ title, value, change, icon, color = 'blue' }) {
  const colorClass = color === 'red' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
  return (
    <div className={`rounded-lg p-4 border ${colorClass}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xs text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-2">{change}</p>
    </div>
  )
}

function MetricRow({ label, value, color = 'gray' }) {
  const colorClass = {
    green: 'text-green-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600'
  }[color]

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-sm font-bold ${colorClass}`}>{value}</span>
    </div>
  )
}

function ProgressBar({ label, value, total, color = 'blue' }) {
  const percentage = total > 0 ? (value / total) * 100 : 0
  const bgColorClass = {
    blue: 'bg-blue-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600'
  }[color]

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-xs font-medium text-gray-600">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${bgColorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

// Helper Functions
function getDateRange(range) {
  const now = new Date()
  let start
  let end = now

  switch (range) {
    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'lastMonth':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      start = lastMonth
      end = new Date(now.getFullYear(), now.getMonth(), 0)
      break
    case 'thisQuarter':
      const quarter = Math.floor(now.getMonth() / 3)
      start = new Date(now.getFullYear(), quarter * 3, 1)
      break
    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1)
      break
    case 'all':
      start = new Date(2000, 0, 1)
      break
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return { start, end }
}

function calculateAverageTimeToHire(hiring) {
  const hired = hiring.filter((h) => h.stage === 'hired')
  if (hired.length === 0) return 0

  const totalDays = hired.reduce((sum, h) => {
    const appDate = new Date(h.appliedDate)
    const hireDate = new Date(h.hireDate || new Date())
    return sum + Math.ceil((hireDate - appDate) / (1000 * 60 * 60 * 24))
  }, 0)

  return Math.round(totalDays / hired.length)
}

function generateCSV(reportData) {
  const lines = [
    ['YuvaHive HROS - Analytics Report'],
    [`Generated: ${new Date().toLocaleString()}`],
    [`Date Range: ${reportData.dateRange}`],
    [],
    ['EXECUTIVE OVERVIEW'],
    ['Metric', 'Value'],
    ['Total Employees', reportData.overview.totalEmployees],
    ['Active Hires', reportData.overview.activeHires],
    ['Departures', reportData.overview.departuresThisMonth],
    ['Active Projects', reportData.overview.activeProjects],
    ['Overdue Actions', reportData.overview.overdueActions],
    [],
    ['HIRING METRICS'],
    ['Metric', 'Value'],
    ['Total Applications', reportData.hiring.totalApplications],
    ['Total Hired', reportData.hiring.totalHired],
    ['Conversion Rate (%)', reportData.hiring.conversionRate],
    ['Average Time to Hire (days)', reportData.hiring.averageTimeToHire],
    ['Pipeline Value ($K)', reportData.hiring.pipelineValue.toFixed(0)],
    [],
    ['PERFORMANCE METRICS'],
    ['Metric', 'Value'],
    ['Onboarding Completion (%)', reportData.performance.onboardingCompletion],
    ['Red Flags Detected', reportData.performance.redFlagsDetected],
    ['Burnout Cases', reportData.performance.burnoutCases],
    [],
    ['OPERATIONS METRICS'],
    ['Metric', 'Value'],
    ['Total Projects', reportData.operations.totalProjects],
    ['At Risk', reportData.operations.projectsAtRisk],
    ['Completion Rate (%)', reportData.operations.projectCompletionRate],
    ['Average Progress (%)', reportData.operations.averageProjectProgress],
    ['Work Hours Logged', reportData.operations.totalWorkHoursLogged.toFixed(0)]
  ]

  return lines.map((line) => line.join(',')).join('\n')
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
