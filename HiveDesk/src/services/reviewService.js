import { HiveDeskStorage } from './HiveDeskStorage';
import { generateId } from '../utils/helpers';
import { calculateQualityScore } from '../utils/helpers';

const SHEET = 'HiveDeskReviews';

export async function getReviews(filters = {}) {
  if (Object.keys(filters).length === 0) return HiveDeskStorage.getAll(SHEET);
  return HiveDeskStorage.filter(SHEET, filters);
}

export async function getReview(id) {
  return HiveDeskStorage.getById(SHEET, id);
}

export async function createReview(data, config) {
  const id = generateId('RV');
  const overallScore = calculateQualityScore(data, config);
  return HiveDeskStorage.insert(SHEET, {
    ...data,
    id,
    overallScore,
    status: 'pending',
    revisionCount: 0,
    reviewedAt: new Date().toISOString(),
  });
}

export async function approveReview(id) {
  return HiveDeskStorage.update(SHEET, id, { status: 'approved' });
}

export async function rejectReview(id, feedback) {
  return HiveDeskStorage.update(SHEET, id, {
    status: 'needs-revision',
    feedback: feedback || '',
  });
}

export async function updateReview(id, data) {
  return HiveDeskStorage.update(SHEET, id, data);
}

export async function deleteReview(id) {
  return HiveDeskStorage.remove(SHEET, id);
}
