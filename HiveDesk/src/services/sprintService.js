import { HiveDeskStorage } from './HiveDeskStorage';
import { generateId } from '../utils/helpers';

const SPRINT_SHEET = 'HiveDeskSprints';
const ASSIGN_SHEET = 'HiveDeskSprintAssignments';

export async function getSprints(filters = {}) {
  if (Object.keys(filters).length === 0) return HiveDeskStorage.getAll(SPRINT_SHEET);
  return HiveDeskStorage.filter(SPRINT_SHEET, filters);
}

export async function getSprint(id) {
  return HiveDeskStorage.getById(SPRINT_SHEET, id);
}

export async function getActiveSprint() {
  const res = await HiveDeskStorage.filter(SPRINT_SHEET, { status: 'active' });
  const sprints = res.data || res;
  return Array.isArray(sprints) ? sprints[0] || null : null;
}

export async function createSprint(data) {
  const id = generateId('SP');
  return HiveDeskStorage.insert(SPRINT_SHEET, {
    ...data,
    id,
    actualQuestions: 0,
    publishedCount: 0,
    avgQualityScore: 0,
    avgCompletionRate: 0,
    createdAt: new Date().toISOString(),
  });
}

export async function updateSprint(id, data) {
  return HiveDeskStorage.update(SPRINT_SHEET, id, data);
}

export async function deleteSprint(id) {
  return HiveDeskStorage.remove(SPRINT_SHEET, id);
}

export async function startSprint(id) {
  return HiveDeskStorage.update(SPRINT_SHEET, id, { status: 'active' });
}

export async function closeSprint(id) {
  return HiveDeskStorage.update(SPRINT_SHEET, id, { status: 'done' });
}

// Sprint Assignments
export async function getSprintAssignments(sprintId) {
  return HiveDeskStorage.filter(ASSIGN_SHEET, { sprintId });
}

export async function createAssignment(data) {
  const id = generateId('SA');
  return HiveDeskStorage.insert(ASSIGN_SHEET, { ...data, id });
}

export async function updateAssignment(id, data) {
  return HiveDeskStorage.update(ASSIGN_SHEET, id, data);
}

export async function deleteAssignment(id) {
  return HiveDeskStorage.remove(ASSIGN_SHEET, id);
}
