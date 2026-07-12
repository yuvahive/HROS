import { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

const PAGE_HELP = {
  dashboard: {
    title: 'War Room Dashboard',
    tips: [
      'Overview of team activity, sprint progress, and key metrics at a glance.',
      'Click any metric card to drill into detailed views.',
      'Use the refresh button to pull latest data from the cloud.',
      'Dashboard auto-refreshes based on your configured interval in Settings.',
    ],
  },
  questions: {
    title: 'Question Bank',
    tips: [
      'Create, edit, and publish coding questions for the team.',
      'Use filters to find questions by difficulty, tag, or status.',
      'Click a question to view details, add comments, or attach files.',
      'Drag questions to change their status (Draft → Review → Published).',
    ],
  },
  pipeline: {
    title: 'Question Pipeline',
    tips: [
      'Visual kanban board showing questions across workflow stages.',
      'Drag cards between columns to move questions through the pipeline.',
      'Click a card to see full details and history.',
      'Use this to track which questions need review or are ready to publish.',
    ],
  },
  sprints: {
    title: 'Sprint Board',
    tips: [
      'Plan sprints by assigning questions and setting deadlines.',
      'Track progress with the burndown chart and timeline view.',
      'Mark items complete as the sprint progresses.',
      ' retrospective data helps improve future sprints.',
    ],
  },
  reviews: {
    title: 'Review System',
    tips: [
      'Peer review queue — review questions submitted by teammates.',
      'Score questions on clarity, difficulty, and test coverage.',
      'Leave constructive feedback in the review comments.',
      'Track your review history and impact score.',
    ],
  },
  team: {
    title: 'Team Management',
    tips: [
      'View the full team roster with roles and status.',
      'Click a member to see their individual dashboard.',
      'Manage buddy pairs for mentorship and pairing.',
      'Add new members using the "Add Member" button.',
    ],
  },
  workload: {
    title: 'Workload View',
    tips: [
      'See team capacity and allocation at a glance.',
      'Identify who is over or under-allocated.',
      'Use this to balance work across the team.',
      'Red indicators mean someone is overloaded.',
    ],
  },
  analytics: {
    title: 'Team Analytics',
    tips: [
      'Performance metrics, trends, and leaderboards.',
      'Filter by date range to see specific periods.',
      'Compare individual and team performance.',
      'Use insights to identify growth areas.',
    ],
  },
  worklogs: {
    title: 'Work Logs',
    tips: [
      'Track time spent on tasks and activities.',
      'Log your daily work with descriptions and duration.',
      'View team work logs to understand time allocation.',
      'Export logs for reporting and analysis.',
    ],
  },
  queue: {
    title: 'My Queue',
    tips: [
      'Your personal queue of assigned questions and tasks.',
      'Prioritize items by dragging to reorder.',
      'Mark items complete when done.',
      'New assignments appear here automatically.',
    ],
  },
  bounties: {
    title: 'Question Bounties',
    tips: [
      'High-value questions with bonus points attached.',
      'Claim bounties to earn extra recognition.',
      'Bounties expire — check deadlines carefully.',
      'Great way to boost your leaderboard position.',
    ],
  },
  standup: {
    title: 'Async Standup',
    tips: [
      'Post your daily updates: what you did, what\'s next, any blockers.',
      'View team standups without scheduling meetings.',
      'Comment on updates to unblock teammates.',
      'History is saved for future reference.',
    ],
  },
  skills: {
    title: 'Skill Tracker',
    tips: [
      'Track technical and soft skills across the team.',
      'Add skills and rate proficiency levels.',
      'Identify skill gaps and training opportunities.',
      'Skills are used for matching and assignments.',
    ],
  },
  kudos: {
    title: 'Kudos Board',
    tips: [
      'Recognize and appreciate your teammates publicly.',
      'Give kudos for great work, helpfulness, or achievements.',
      'View kudos received and given over time.',
      'Builds team morale and culture.',
    ],
  },
  goals: {
    title: 'Goals & OKRs',
    tips: [
      'Set weekly goals and track progress.',
      'Align个人 goals with team objectives.',
      'Mark goals as complete or carry them forward.',
      'Review goal completion rates over time.',
    ],
  },
  achievements: {
    title: 'Achievements',
    tips: [
      'View streaks, badges, and milestones earned.',
      'Badges are awarded for consistency and impact.',
      'Maintain streaks by contributing daily.',
      'Share achievements with your team.',
    ],
  },
  wrapped: {
    title: 'Weekly Wrapped',
    tips: [
      'Your week in review — activity, achievements, and stats.',
      'See what you accomplished and where time went.',
      'Compare with previous weeks.',
      'Share your wrapped with the team.',
    ],
  },
  moods: {
    title: 'Mood Trends',
    tips: [
      'Track team wellness and sentiment over time.',
      'Log your mood during check-ins.',
      'Leaders can spot morale dips early.',
      'All mood data is confidential.',
    ],
  },
  checkins: {
    title: 'Weekly Check-In',
    tips: [
      'Share updates, wins, and blockers with your team.',
      'Fill out the form with your weekly progress.',
      'Check-ins help leaders understand team health.',
      'Regular check-ins improve team alignment.',
    ],
  },
  retro: {
    title: 'Sprint Retrospective',
    tips: [
      'Analyze completed sprints — what went well, what didn\'t.',
      'Add action items for improvement.',
      'Track retro action item completion.',
      'Builds continuous improvement culture.',
    ],
  },
  users: {
    title: 'User Management',
    tips: [
      'Manage team members, roles, and permissions.',
      'Invite new users or deactivate accounts.',
      'Assign roles: admin, lead, curator, member.',
      'Changes take effect immediately.',
    ],
  },
  import: {
    title: 'Batch Import',
    tips: [
      'Import questions from CSV files in bulk.',
      'Download the CSV template first for correct format.',
      'Preview imported data before confirming.',
      'Errors are highlighted for easy fixing.',
    ],
  },
  audit: {
    title: 'Audit Log',
    tips: [
      'View complete system activity history.',
      'Track who did what and when.',
      'Filter by user, action type, or date.',
      'Useful for compliance and debugging.',
    ],
  },
  settings: {
    title: 'System Settings',
    tips: [
      'Configure system-wide targets, weights, and preferences.',
      'Set dashboard refresh intervals.',
      'Manage notification preferences.',
      'Changes apply to all team members.',
    ],
  },
  schema: {
    title: 'Question Schema',
    tips: [
      'Define the structure for uploaded questions.',
      'Set required fields, types, and constraints.',
      'Schema changes affect new imports.',
      'Existing questions are not retroactively changed.',
    ],
  },
  missions: {
    title: 'Mission Tree',
    tips: [
      'Visual curriculum showing learning paths and progress.',
      'Complete missions to unlock new ones.',
      'Track overall curriculum completion.',
      'Click nodes to see details and resources.',
    ],
  },
  profile: {
    title: 'Your Profile',
    tips: [
      'View your stats, level, and impact metrics.',
      'Track your growth over time.',
      'See your contributions and recognition.',
      'Update your profile information.',
    ],
  },
  leaderboard: {
    title: 'Leaderboard',
    tips: [
      'Quality-ranked team performance rankings.',
      'Rankings update in real-time.',
      'Filter by time period or category.',
      'Top performers are highlighted.',
    ],
  },
  streak: {
    title: 'Streak Tracker',
    tips: [
      'Track your daily contribution streaks.',
      'Maintain streaks by contributing every day.',
      'Streaks unlock special badges.',
      'View streak history and best records.',
    ],
  },
  activity: {
    title: 'Team Activity',
    tips: [
      'Real-time feed of all team actions.',
      'See who\'s doing what right now.',
      'Filter by activity type or person.',
      'Stay informed without asking around.',
    ],
  },
  admin: {
    title: 'Admin Dashboard',
    tips: [
      'Full system visibility for administrators.',
      'Monitor system health and usage.',
      'Manage configurations and integrations.',
      'View detailed analytics and reports.',
    ],
  },
};

const DEFAULT_HELP = {
  title: 'Help',
  tips: ['No help available for this page yet.'],
};

export default function PageInfoButton({ activePage }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const info = PAGE_HELP[activePage] || DEFAULT_HELP;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg border border-hd-border text-hd-muted hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all"
        title="Page info"
      >
        <Info className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-hd-surface border border-hd-border rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hd-border bg-indigo-500/5">
            <h3 className="text-sm font-bold text-hd-text">{info.title}</h3>
            <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-hd-hover text-hd-muted">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="px-4 py-3 space-y-2.5 max-h-80 overflow-y-auto">
            {info.tips.map((tip, i) => (
              <div key={i} className="flex gap-2 text-xs text-hd-muted leading-relaxed">
                <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-hd-border bg-hd-bg/50">
            <p className="text-[10px] text-hd-muted/60">Press Esc or click outside to close</p>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
