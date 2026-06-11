export function calculateQualityScore(review, config) {
  if (!review) return 0;
  const weights = {
    accuracy: Number(config?.quality_weight_accuracy) || 30,
    completeness: Number(config?.quality_weight_completeness) || 25,
    clarity: Number(config?.quality_weight_clarity) || 15,
    difficultyCalibration: Number(config?.quality_weight_difficulty_calibration) || 20,
    originality: Number(config?.quality_weight_originality) || 10,
  };
  const totalWeight = weights.accuracy + weights.completeness + weights.clarity + weights.difficultyCalibration + weights.originality;
  const raw =
    (Number(review.accuracyScore) || 0) * weights.accuracy +
    (Number(review.completenessScore) || 0) * weights.completeness +
    (Number(review.clarityScore) || 0) * weights.clarity +
    (Number(review.difficultyCalibration) || 0) * weights.difficultyCalibration +
    (Number(review.originalityScore) || 0) * weights.originality;
  return Math.round((raw / totalWeight) * 10) / 10;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export function getStatusColor(status) {
  const colors = {
    draft: 'gray', 'in-review': 'amber', 'needs-revision': 'red',
    approved: 'blue', published: 'emerald', rejected: 'red',
    planning: 'purple', active: 'emerald', review: 'amber',
    publish: 'blue', done: 'gray', pending: 'amber',
  };
  return colors[status] || 'gray';
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function generateId(prefix) {
  const rand = Math.random().toString(36).substring(2, 8);
  const time = Date.now().toString(36);
  return `${prefix}-${time}${rand}`;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
