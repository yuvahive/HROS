import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react'
import { getAllFromDB, STORES } from '../utils/indexedDB'

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month') // week, month, quarter

  useEffect(() => {
    calculateMetrics()
  }, [timeRange])

  const calculateMetrics = async () => {
    try {
      setLoading(true)

      // Get all data
      const hiring = await getAllFromDB(STORES.hiringPipeline)
      const tasks = await getAllFromDB(STORES.tasks)
      const workLogs = await getAllFromDB(STORES.workLogs)
      const people = await getAllFromDB(STORES.people)
      const checkIns = await getAllFromDB(STORES.checkIns)
      const oneOnOnes = await getAllFromDB(STORES.oneOnOnes)

      // Date range calculations
      const now = new Date()
      let startDate = new Date()

      if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7)
      } else if (timeRange === 'month') {
        startDate.setMonth(now.getMonth() - 1)
      } else {
        startDate.setMonth(now.getMonth() - 3)
      }

      // 1. HIRING METRICS
      const hiringMetrics = {
        total: hiring.length,
        applied: hiring.filter((h) => h.stage === 'applicant').length,
        screening: hiring.filter((h) => h.stage === 'screening').length,
        interview: hiring.filter((h) => h.stage === 'interview').length,
        offered: hiring.filter((h) => h.stage === 'offered').length,
        hired: hiring.filter((h) => h.stage === 'hired').length,
        conversionRate: hiring.length > 0 ? ((hiring.filter((h) => h.stage === 'hired').length / hiring.length) * 100).toFixed(1) : 0,
        avgSourceScore: hiring.length > 0
          ? (hiring.reduce((sum, h) => sum + (h.screeningScore || 0), 0) / hiring.length).toFixed(1)
          : 0
      }

      // 2. SHIPPING METRICS
      const tasksPeriod = tasks.filter((t) => new Date(t.createdDate) >= startDate)
      const completedTasks = tasksPeriod.filter((t) => t.status === 'completed')

      let estimateAccuracy = 0
      if (completedTasks.length > 0) {
        const accuracyScores = completedTasks.map((t) => {
          const est = t.estimatedHours || 1
          const actual = t.actualHours || 1
          return Math.min(est, actual) / Math.max(est, actual)
        })
        estimateAccuracy = (
          (accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length) *
          100
        ).toFixed(1)
      }

      const shippingMetrics = {
        tasksCreated: tasksPeriod.length,
        tasksCompleted: completedTasks.length,
        completionRate:
          tasksPeriod.length > 0 ? ((completedTasks.length / tasksPeriod.length) * 100).toFixed(1) : 0,
        estimateAccuracy: estimateAccuracy,
        blockedTasks: tasks.filter((t) => t.status === 'blocked').length,
        avgCompletionTime: completedTasks.length > 0
          ? (completedTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0) / completedTasks.length).toFixed(1)
          : 0
      }

      // 3. TEAM SENTIMENT
      const checkInsPeriod = checkIns.filter((c) => new Date(c.date) >= startDate)
      const sentimentData = {
        green: 0,
        yellow: 0,
        red: 0
      }

      people.forEach((person) => {
        const personCheckIns = checkInsPeriod.filter((c) => c.personId === person.id)
        if (personCheckIns.length > 0) {
          const avgScore = (
            personCheckIns.reduce((sum, c) => sum + (c.mood || 5), 0) / personCheckIns.length
          ).toFixed(1)

          if (avgScore >= 7) {
            sentimentData.green++
          } else if (avgScore >= 5) {
            sentimentData.yellow++
          } else {
            sentimentData.red++
          }
        }
      })

      const teamMetrics = {
        total: people.length,
        green: sentimentData.green,
        yellow: sentimentData.yellow,
        red: sentimentData.red,
        greenPercent:
          people.length > 0 ? ((sentimentData.green / people.length) * 100).toFixed(0) : 0,
        activeCheckIns: checkInsPeriod.length,
        avgWellbeing:
          checkInsPeriod.length > 0
            ? (checkInsPeriod.reduce((sum, c) => sum + (c.mood || 5), 0) / checkInsPeriod.length).toFixed(1)
            : 0
      }

      // 4. ENGAGEMENT METRICS
      const oneOnOnesPeriod = oneOnOnes.filter(
        (m) => new Date(m.scheduledDate) >= startDate && m.status === 'completed'
      )

      const engagementMetrics = {
        oneOnOnesCompleted: oneOnOnesPeriod.length,
        teamCoverage:
          people.length > 0
            ? ((new Set(oneOnOnesPeriod.map((m) => m.personId)).size / people.length) * 100).toFixed(0)
            : 0,
        avgFrequency:
          people.length > 0
            ? ((oneOnOnesPeriod.length / people.length).toFixed(1))
            : 0,
        activeMembers: new Set(oneOnOnesPeriod.map((m) => m.personId)).size
      }

      // 5. HOURS & PRODUCTIVITY
      const logsPeriod = workLogs.filter((log) => new Date(log.date) >= startDate)
      const totalHours = logsPeriod.reduce((sum, log) => sum + (log.hoursWorked || 0), 0)
      const daysSinceStart = Math.max(1, Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24)))
      const avgHoursPerDay = logsPeriod.length > 0 ? (totalHours / daysSinceStart).toFixed(1) : 0

      const productivityMetrics = {
        totalHoursLogged: totalHours.toFixed(1),
        avgHoursPerDay: avgHoursPerDay,
        totalLogs: logsPeriod.length,
        activeContributors: new Set(logsPeriod.map((log) => log.personId)).size
      }

      setMetrics({
        hiring: hiringMetrics,
        shipping: shippingMetrics,
        team: teamMetrics,
        engagement: engagementMetrics,
        productivity: productivityMetrics,
        period: timeRange
      })
    } catch (error) {
      console.error('Error calculating metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !metrics) {
    return <div className="p-8 text-center">Loading metrics...</div>
  }

  const MetricCard = ({ title, value, unit = '', subtitle = '', highlight = false, color = 'blue' }) => (
    <div className={`rounded-lg p-4 border ${highlight ? `bg-${color}-50 border-${color}-200` : 'bg-white border-gray-200'}`}>
      <p className="text-xs uppercase tracking-wide text-gray-600 font-medium">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${highlight ? `text-${color}-600` : 'text-gray-900'}`}>
        {value}
        <span className="text-sm text-gray-600 ml-1">{unit}</span>
      </p>
      {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
    </div>
  )

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Metrics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Key performance indicators across HR operating system</p>
          </div>

          {/* Time range selector */}
          <div className="flex gap-2">
            {['week', 'month', 'quarter'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6 max-w-7xl">
          {/* 1. HIRING PIPELINE */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">👥 Hiring Pipeline</h2>
            <div className="grid grid-cols-4 gap-4">
              <MetricCard title="Total Candidates" value={metrics.hiring.total} />
              <MetricCard title="Conversion Rate" value={metrics.hiring.conversionRate} unit="%" highlight color="green" />
              <MetricCard
                title="Hired"
                value={metrics.hiring.hired}
                subtitle="from this pool"
                color="green"
              />
              <MetricCard title="Avg Score" value={metrics.hiring.avgSourceScore} unit="/" highlight />
            </div>

            {/* Funnel visualization */}
            <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                  <span>📝 Applications</span>
                  <span className="font-bold text-blue-600">{metrics.hiring.applied}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded border border-purple-200">
                  <span>🔍 Screening</span>
                  <span className="font-bold text-purple-600">{metrics.hiring.screening}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded border border-yellow-200">
                  <span>🎤 Interview</span>
                  <span className="font-bold text-yellow-600">{metrics.hiring.interview}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200">
                  <span>📋 Offered</span>
                  <span className="font-bold text-orange-600">{metrics.hiring.offered}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                  <span>✨ Hired</span>
                  <span className="font-bold text-green-600">{metrics.hiring.hired}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SHIPPING & EXECUTION */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📦 Shipping & Execution</h2>
            <div className="grid grid-cols-4 gap-4">
              <MetricCard title="Tasks Created" value={metrics.shipping.tasksCreated} />
              <MetricCard
                title="Completed"
                value={metrics.shipping.tasksCompleted}
                subtitle={`${metrics.shipping.completionRate}% completion rate`}
                highlight
                color="green"
              />
              <MetricCard
                title="Blocked Tasks"
                value={metrics.shipping.blockedTasks}
                highlight={metrics.shipping.blockedTasks > 0}
                color="red"
              />
              <MetricCard
                title="Estimate Accuracy"
                value={metrics.shipping.estimateAccuracy}
                unit="%"
                highlight
              />
            </div>
          </div>

          {/* 3. TEAM SENTIMENT */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">💚 Team Sentiment</h2>
            <div className="grid grid-cols-4 gap-4">
              <MetricCard title="Team Size" value={metrics.team.total} />
              <MetricCard
                title="Healthy 🟢"
                value={metrics.team.green}
                subtitle={`${metrics.team.greenPercent}% of team`}
                highlight
                color="green"
              />
              <MetricCard
                title="Needs Support 🟡"
                value={metrics.team.yellow}
                highlight={metrics.team.yellow > 0}
              />
              <MetricCard
                title="Critical 🔴"
                value={metrics.team.red}
                highlight={metrics.team.red > 0}
                color="red"
              />
            </div>

            {/* Wellbeing tracker */}
            <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Average Wellbeing Score</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.team.avgWellbeing}/10</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-sm">Recent Check-ins</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{metrics.team.activeCheckIns}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. ENGAGEMENT & 1:1s */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📞 Engagement & 1:1s</h2>
            <div className="grid grid-cols-4 gap-4">
              <MetricCard
                title="1:1s Completed"
                value={metrics.engagement.oneOnOnesCompleted}
                highlight
                color="purple"
              />
              <MetricCard
                title="Team Coverage"
                value={metrics.engagement.teamCoverage}
                unit="%"
                subtitle={`${metrics.engagement.activeMembers} members covered`}
                highlight
              />
              <MetricCard
                title="Avg Frequency"
                value={metrics.engagement.avgFrequency}
                unit="per person"
                subtitle={`in ${timeRange}`}
              />
              <MetricCard title="Active Members" value={metrics.engagement.activeMembers} />
            </div>
          </div>

          {/* 5. PRODUCTIVITY */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">⏱️ Productivity</h2>
            <div className="grid grid-cols-4 gap-4">
              <MetricCard
                title="Total Hours Logged"
                value={metrics.productivity.totalHoursLogged}
                unit="h"
                subtitle={`over ${timeRange}`}
              />
              <MetricCard
                title="Avg Per Day"
                value={metrics.productivity.avgHoursPerDay}
                unit="h"
                highlight
                color="blue"
              />
              <MetricCard
                title="Log Entries"
                value={metrics.productivity.totalLogs}
                subtitle="work logs"
              />
              <MetricCard
                title="Active Contributors"
                value={metrics.productivity.activeContributors}
                subtitle="team members"
              />
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3">📊 Quick Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Hiring Progress</p>
                <p className="text-gray-900 font-medium mt-1">
                  {metrics.hiring.conversionRate}% conversion rate with{' '}
                  {metrics.hiring.hired} hires
                </p>
              </div>
              <div>
                <p className="text-gray-600">Shipping Health</p>
                <p className="text-gray-900 font-medium mt-1">
                  {metrics.shipping.completionRate}% tasks completed with{' '}
                  {metrics.shipping.estimateAccuracy}% estimate accuracy
                </p>
              </div>
              <div>
                <p className="text-gray-600">Team Wellbeing</p>
                <p className="text-gray-900 font-medium mt-1">
                  {metrics.team.greenPercent}% healthy team with {metrics.team.avgWellbeing}/10
                  avg wellbeing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
