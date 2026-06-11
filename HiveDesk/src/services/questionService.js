import { HiveDeskStorage } from './HiveDeskStorage';
import { generateId } from '../utils/helpers';

const SHEET = 'HiveDeskQuestions';

export async function getQuestions(filters = {}) {
  if (Object.keys(filters).length === 0) return HiveDeskStorage.getAll(SHEET);
  return HiveDeskStorage.filter(SHEET, filters);
}

export async function getQuestion(id) {
  return HiveDeskStorage.getById(SHEET, id);
}

export async function createQuestion(data, creatorName) {
  const id = generateId('Q');
  return HiveDeskStorage.insert(SHEET, {
    ...data,
    id,
    creatorName,
    status: 'draft',
    qualityScore: 0,
    completionRate: 0,
    rating: 0,
    submissions: 0,
    createdAt: new Date().toISOString(),
  });
}

export async function updateQuestion(id, data) {
  return HiveDeskStorage.update(SHEET, id, data);
}

export async function deleteQuestion(id) {
  return HiveDeskStorage.remove(SHEET, id);
}

export async function submitForReview(id) {
  return HiveDeskStorage.update(SHEET, id, { status: 'in-review' });
}

export async function approveQuestion(id) {
  return HiveDeskStorage.update(SHEET, id, {
    status: 'approved',
    reviewedAt: new Date().toISOString(),
  });
}

export async function publishQuestion(id) {
  return HiveDeskStorage.update(SHEET, id, {
    status: 'published',
    publishedAt: new Date().toISOString(),
  });
}

export async function requestRevision(id) {
  return HiveDeskStorage.update(SHEET, id, { status: 'needs-revision' });
}

export async function rejectQuestion(id) {
  return HiveDeskStorage.update(SHEET, id, { status: 'rejected' });
}
