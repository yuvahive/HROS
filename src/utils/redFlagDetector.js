// Red Flag Detection System
// Monitors: Burnout, Blockers, Disengagement, Performance issues

import { getAllFromDB, addToDB, updateInDB, STORES } from './indexedDB'

// Flag types and severity levels
export const RED_FLAG_TYPES = {
  BURNOUT: 'burnout',
  BLOCKERS: 'blockers',
  DISENGAGEMENT: 'disengagement',
  PERFORMANCE: 'performance'
}

export const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

// Detect burnout indicators
export async function detectBurnout() {
  const people = await getAllFromDB(STORES.people)
  const workLogs = await getAllFromDB(STORES.workLogs)
  const checkIns = await getAllFromDB(STORES.checkIns)
  const timeOff = await getAllFromDB(STORES.timeOff)
  const tasks = await getAllFromDB(STORES.tasks)

  const flags = []

  people.forEach((person) => {
    // Check 1: Hours worked this month
    const thisMonth = new Date()
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    const personWorkLogs = workLogs.filter(
      (log) => log.personId === person.id && new Date(log.date) >= monthStart
    )

    const totalHoursThisMonth = personWorkLogs.reduce(
      (sum, log) => sum + (log.hoursWorked || 0),
      0
    )

    if (totalHoursThisMonth > 180) {
      // > 45 hours/week average
      flags.push({
        id: `flag_${person.id}_burnout_hours`,
        personId: person.id,
        personName: person.name,
        type: RED_FLAG_TYPES.BURNOUT,
        severity: totalHoursThisMonth > 200 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
        title: '⚠️ Excessive Work Hours',
        description: `${totalHoursThisMonth} hours logged this month (>${45}/week)`,
        detectedDate: new Date().toISOString(),
        metrics: {
          hoursWorked: totalHoursThisMonth,
          weeklyAverage: (totalHoursThisMonth / 4.33).toFixed(1)
        },
        recommended_action: 'Check in on workload, consider load balancing'
      })
    }

    // Check 2: Mood trend declining
    const recentCheckIns = checkIns
      .filter((c) => c.personId === person.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4)

    if (recentCheckIns.length >= 2) {
      const moods = recentCheckIns.map((c) => c.mood || 5)
      const moodTrend = moods[0] - moods[moods.length - 1]

      if (moodTrend < -2 && moods[0] <= 3) {
        // Mood declining sharply and now low
        flags.push({
          id: `flag_${person.id}_burnout_mood`,
          personId: person.id,
          personName: person.name,
          type: RED_FLAG_TYPES.BURNOUT,
          severity: SEVERITY.HIGH,
          title: '😟 Mood Declining',
          description: `Mood score dropping: ${moods[moods.length - 1]} → ${moods[0]}`,
          detectedDate: new Date().toISOString(),
          metrics: {
            currentMood: moods[0],
            moodTrend: moodTrend,
            recentCheckIns: recentCheckIns.length
          },
          recommended_action: 'Schedule 1:1 meeting to discuss wellbeing'
        })
      }
    }

    // Check 3: No time off in 3+ months
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const personTimeOff = timeOff.filter(
      (t) => t.personId === person.id && new Date(t.startDate) >= threeMonthsAgo
    )

    if (personTimeOff.length === 0) {
      flags.push({
        id: `flag_${person.id}_burnout_nobreak`,
        personId: person.id,
        personName: person.name,
        type: RED_FLAG_TYPES.BURNOUT,
        severity: SEVERITY.MEDIUM,
        title: '🏖️ No Time Off',
        description: 'No time off taken in 3+ months',
        detectedDate: new Date().toISOString(),
        metrics: {
          daysSinceLastBreak: '90+',
          timeOffTaken: 0
        },
        recommended_action: 'Encourage taking a break or PTO'
      })
    }

    // Check 4: Many overdue/blocked tasks
    const personTasks = tasks.filter((t) => t.assigneeId === person.id)
    const blockedTasks = personTasks.filter((t) => t.status === 'blocked')

    if (blockedTasks.length >= 3) {
      flags.push({
        id: `flag_${person.id}_blockers_tasks`,
        personId: person.id,
        personName: person.name,
        type: RED_FLAG_TYPES.BLOCKERS,
        severity: blockedTasks.length >= 5 ? SEVERITY.HIGH : SEVERITY.MEDIUM,
        title: '🚧 Many Blocked Tasks',
        description: `${blockedTasks.length} tasks stuck/blocked`,
        detectedDate: new Date().toISOString(),
        metrics: {
          blockedCount: blockedTasks.length,
          totalTasks: personTasks.length,
          blockageRate: ((blockedTasks.length / personTasks.length) * 100).toFixed(1)
        },
        recommended_action: 'Identify and unblock obstacles, provide support'
      })
    }
  })

  return flags
}

// Detect disengagement indicators
export async function detectDisengagement() {
  const people = await getAllFromDB(STORES.people)
  const oneOnOnes = await getAllFromDB(STORES.oneOnOnes)
  const workLogs = await getAllFromDB(STORES.workLogs)

  const flags = []

  people.forEach((person) => {
    // Check 1: No 1:1 for 2+ weeks
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const personOneOnOnes = oneOnOnes
      .filter((m) => m.personId === person.id && m.status === 'completed')
      .sort((a, b) => new Date(b.completionDate || b.scheduledDate) - new Date(a.completionDate || a.scheduledDate))

    if (personOneOnOnes.length === 0 || new Date(personOneOnOnes[0].completionDate || personOneOnOnes[0].scheduledDate) < twoWeeksAgo) {
      flags.push({
        id: `flag_${person.id}_disengagement_no1o1`,
        personId: person.id,
        personName: person.name,
        type: RED_FLAG_TYPES.DISENGAGEMENT,
        severity: SEVERITY.MEDIUM,
        title: '📞 No 1:1 in 2+ Weeks',
        description: 'Last 1:1 was more than 2 weeks ago',
        detectedDate: new Date().toISOString(),
        metrics: {
          lastOneOnOne: personOneOnOnes[0]?.scheduledDate || 'Never',
          daysSinceLastMeeting: personOneOnOnes[0]
            ? Math.floor((new Date() - new Date(personOneOnOnes[0].scheduledDate)) / (1000 * 60 * 60 * 24))
            : '∞'
        },
        recommended_action: 'Schedule a 1:1 meeting immediately'
      })
    }

    // Check 2: No new work logs in 5+ days
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

    const personWorkLogs = workLogs
      .filter((log) => log.personId === person.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    if (personWorkLogs.length === 0 || new Date(personWorkLogs[0].date) < fiveDaysAgo) {
      flags.push({
        id: `flag_${person.id}_disengagement_nologs`,
        personId: person.id,
        personName: person.name,
        type: RED_FLAG_TYPES.DISENGAGEMENT,
        severity: SEVERITY.HIGH,
        title: '🤷 No Activity',
        description: 'No work logs or updates in 5+ days',
        detectedDate: new Date().toISOString(),
        metrics: {
          lastActivity: personWorkLogs[0]?.date || 'Never',
          daysSinceLastUpdate: personWorkLogs[0]
            ? Math.floor((new Date() - new Date(personWorkLogs[0].date)) / (1000 * 60 * 60 * 24))
            : '∞'
        },
        recommended_action: 'Check in to understand blockers or issues'
      })
    }
  })

  return flags
}

// Detect performance indicators
export async function detectPerformanceIssues() {
  const tasks = await getAllFromDB(STORES.tasks)
  const people = await getAllFromDB(STORES.people)

  const flags = []

  people.forEach((person) => {
    const personTasks = tasks.filter((t) => t.assigneeId === person.id)

    if (personTasks.length > 0) {
      // Check 1: Estimate accuracy
      const completedTasks = personTasks.filter((t) => t.status === 'completed')

      if (completedTasks.length >= 5) {
        const accuracyRates = completedTasks.map((t) => {
          const estimated = t.estimatedHours || 1
          const actual = t.actualHours || 1
          return Math.min(estimated, actual) / Math.max(estimated, actual)
        })

        const avgAccuracy = (
          (accuracyRates.reduce((a, b) => a + b, 0) / accuracyRates.length) *
          100
        ).toFixed(0)

        if (avgAccuracy < 50) {
          flags.push({
            id: `flag_${person.id}_performance_estimation`,
            personId: person.id,
            personName: person.name,
            type: RED_FLAG_TYPES.PERFORMANCE,
            severity: SEVERITY.MEDIUM,
            title: '📊 Poor Estimate Accuracy',
            description: `Only ${avgAccuracy}% accuracy in time estimates`,
            detectedDate: new Date().toISOString(),
            metrics: {
              estimateAccuracy: `${avgAccuracy}%`,
              tasksAnalyzed: completedTasks.length
            },
            recommended_action: 'Discuss estimation approach, provide guidance'
          })
        }
      }

      // Check 2: High rework rate
      const reworkTasks = personTasks.filter((t) => t.reworkCount >= 2)

      if (reworkTasks.length >= 3) {
        flags.push({
          id: `flag_${person.id}_performance_rework`,
          personId: person.id,
          personName: person.name,
          type: RED_FLAG_TYPES.PERFORMANCE,
          severity: SEVERITY.MEDIUM,
          title: '🔄 High Rework Rate',
          description: `${reworkTasks.length} tasks required 2+ rework cycles`,
          detectedDate: new Date().toISOString(),
          metrics: {
            reworkTasks: reworkTasks.length,
            totalTasks: personTasks.length,
            reworkRate: ((reworkTasks.length / personTasks.length) * 100).toFixed(1)
          },
          recommended_action: 'Review quality standards and provide coaching'
        })
      }
    }
  })

  return flags
}

// Run all detectors and store flags
export async function detectAllRedFlags() {
  try {
    const burnoutFlags = await detectBurnout()
    const disengagementFlags = await detectDisengagement()
    const performanceFlags = await detectPerformanceIssues()

    const allFlags = [...burnoutFlags, ...disengagementFlags, ...performanceFlags]

    // Store flags in IndexedDB
    for (const flag of allFlags) {
      await updateInDB(STORES.redFlags, flag)
    }

    return {
      success: true,
      total: allFlags.length,
      burnout: burnoutFlags.length,
      disengagement: disengagementFlags.length,
      performance: performanceFlags.length,
      flags: allFlags
    }
  } catch (error) {
    console.error('Error detecting red flags:', error)
    return {
      success: false,
      error: error.message,
      flags: []
    }
  }
}

// Get flags by severity
export async function getFlagsBySeverity(severity) {
  const allFlags = await getAllFromDB(STORES.redFlags)
  return allFlags.filter((f) => f.severity === severity)
}

// Get flags by type
export async function getFlagsByType(type) {
  const allFlags = await getAllFromDB(STORES.redFlags)
  return allFlags.filter((f) => f.type === type)
}

// Get flags for a specific person
export async function getFlagsForPerson(personId) {
  const allFlags = await getAllFromDB(STORES.redFlags)
  return allFlags.filter((f) => f.personId === personId)
}

// Resolve a flag (mark as reviewed)
export async function resolveFlag(flagId) {
  const flag = await getAllFromDB(STORES.redFlags)
  const foundFlag = flag.find((f) => f.id === flagId)

  if (foundFlag) {
    foundFlag.resolved = true
    foundFlag.resolvedDate = new Date().toISOString()
    await updateInDB(STORES.redFlags, foundFlag)
    return foundFlag
  }

  return null
}

export default {
  detectAllRedFlags,
  detectBurnout,
  detectDisengagement,
  detectPerformanceIssues,
  getFlagsBySeverity,
  getFlagsByType,
  getFlagsForPerson,
  resolveFlag,
  RED_FLAG_TYPES,
  SEVERITY
}
