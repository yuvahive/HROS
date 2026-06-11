import { HiveDeskStorage } from './HiveDeskStorage';
import { generateId } from '../utils/helpers';

const SHEET = 'HiveDeskWorkLogs';

export async function getWorkLogs(filters = {}) {
  if (Object.keys(filters).length === 0) return HiveDeskStorage.getAll(SHEET);
  return HiveDeskStorage.filter(SHEET, filters);
}

export async function createWorkLog(data, personName, personId) {
  return HiveDeskStorage.insert(SHEET, {
    ...data,
    id: generateId('WL'),
    personName,
    personId: personId || '',
    date: data.date || new Date().toISOString().split('T')[0],
  });
}

export async function updateWorkLog(id, data) {
  return HiveDeskStorage.update(SHEET, id, data);
}

export async function deleteWorkLog(id) {
  return HiveDeskStorage.remove(SHEET, id);
}
