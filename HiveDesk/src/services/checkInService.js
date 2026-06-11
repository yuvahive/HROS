import { HiveDeskStorage } from './HiveDeskStorage';
import { generateId } from '../utils/helpers';

const SHEET = 'HiveDeskCheckIns';

export async function getCheckIns(filters = {}) {
  if (Object.keys(filters).length === 0) return HiveDeskStorage.getAll(SHEET);
  return HiveDeskStorage.filter(SHEET, filters);
}

export async function createCheckIn(data, personName, personId) {
  return HiveDeskStorage.insert(SHEET, {
    ...data,
    id: generateId('CI'),
    personName,
    personId: personId || '',
    createdAt: new Date().toISOString(),
  });
}

export async function updateCheckIn(id, data) {
  return HiveDeskStorage.update(SHEET, id, data);
}

export async function deleteCheckIn(id) {
  return HiveDeskStorage.remove(SHEET, id);
}
