export const ROLES = { ADMIN: 'admin', LEAD: 'lead', CURATOR: 'curator' };

export const QUESTION_STATUSES = {
  DRAFT: 'draft',
  IN_REVIEW: 'in-review',
  NEEDS_REVISION: 'needs-revision',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  REJECTED: 'rejected'
};

export const SPRINT_STATUSES = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  REVIEW: 'review',
  PUBLISH: 'publish',
  DONE: 'done'
};

export const REVIEW_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  NEEDS_REVISION: 'needs-revision',
  REJECTED: 'rejected'
};

export const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];

export const STATUS_COLORS = {
  draft: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' },
  'in-review': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  'needs-revision': { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  approved: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  published: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  planning: { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  review: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  publish: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  done: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' },
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
};

export const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'War Room', icon: 'LayoutDashboard' },
  { id: 'questions', label: 'Question Bank', icon: 'FileCode2' },
  { id: 'sprints', label: 'Sprints', icon: 'Rocket' },
  { id: 'reviews', label: 'Reviews', icon: 'ClipboardCheck' },
  { id: 'team', label: 'Team', icon: 'Users' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

export const CATEGORY_LABELS = {
  targets: 'Targets & Goals',
  quality: 'Quality Scoring',
  sprint: 'Sprint Settings',
  domains: 'Domain Config',
  ui: 'Interface',
  permissions: 'Permissions',
};
