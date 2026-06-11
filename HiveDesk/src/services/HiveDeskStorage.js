import { generateId } from '../utils/helpers';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwvKiKdrGBgqGuDnVc9kjJTSzmU3DRXkeBB0eayd2mnD7GmZXlT8tKxUHpiUH9-JKdMaA/exec';
const GAS_API_KEY = 'hivedesk-secure-key-2026';
const FETCH_TIMEOUT = 30000;
const UPDATE_TIMEOUT = 15000;
const CACHE_TTL = 30000;
const STALE_TTL = 120000;

let _cache = null;
let _cacheTime = 0;
let _inflight = null;

async function _fetchAll() {
  const url = `${GAS_URL}?key=${GAS_API_KEY}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.json();
    if (raw.error) throw new Error(raw.error);
    _cache = raw;
    _cacheTime = Date.now();
    return raw;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function gasPost(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPDATE_TIMEOUT);
  try {
    const res = await fetch(`${GAS_URL}?key=${GAS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ key: GAS_API_KEY, ...payload }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    _cache = null; _cacheTime = 0;
    return res.ok || res.status === 200;
  } catch (e) { clearTimeout(timeoutId); console.error('[HiveDesk] post failed:', e); return false; }
}

export function bustCache() {
  _cache = null;
  _cacheTime = 0;
  _inflight = null;
}

export const HiveDeskStorage = {
  bustCache,

  async fetchAll(force = false) {
    const now = Date.now();

    if (force) { _cache = null; _cacheTime = 0; }

    if (_cache && (now - _cacheTime) < CACHE_TTL) return _cache;

    if (_cache && (now - _cacheTime) < STALE_TTL) {
      if (!_inflight) _inflight = _fetchAll().finally(() => { _inflight = null; });
      return _cache;
    }

    if (_inflight) return _inflight;

    _inflight = _fetchAll().finally(() => { _inflight = null; });
    return _inflight;
  },

  async getAll(sheetName, force = false) {
    const data = await this.fetchAll(force);
    if (!data) return [];
    return Array.isArray(data[sheetName]) ? data[sheetName] : [];
  },

  async getConfig() {
    const data = await this.fetchAll();
    if (!data) return [];
    return Array.isArray(data.HiveDeskConfig) ? data.HiveDeskConfig : [];
  },

  async getMetrics(force = false) {
    const raw = await this.fetchAll(force);
    if (!raw) return {};
    const users = Array.isArray(raw.HiveDeskUsers) ? raw.HiveDeskUsers : [];
    const questions = Array.isArray(raw.HiveDeskQuestions) ? raw.HiveDeskQuestions : [];
    const reviews = Array.isArray(raw.HiveDeskReviews) ? raw.HiveDeskReviews : [];
    const sprints = Array.isArray(raw.HiveDeskSprints) ? raw.HiveDeskSprints : [];
    const activeUsers = users.filter(u => u.isActive === true || u.isActive === 'true' || u.isActive === 'TRUE');
    const published = questions.filter(q => q.status === 'published');
    const inReview = questions.filter(q => q.status === 'in-review');
    const draft = questions.filter(q => q.status === 'draft' || !q.status);
    const needsRevision = questions.filter(q => q.status === 'needs-revision');
    const pendingReviews = reviews.filter(r => r.status === 'pending' || !r.status);
    const activeSprint = sprints.find(s => s.status === 'active') || null;
    const qualityScores = published.filter(q => q.qualityScore && !isNaN(parseFloat(q.qualityScore)));
    const avgQuality = qualityScores.length > 0
      ? (qualityScores.reduce((sum, q) => sum + parseFloat(q.qualityScore), 0) / qualityScores.length).toFixed(1) : '—';
    return {
      activeTeamMembers: activeUsers.length, totalQuestions: questions.length,
      publishedQuestions: published.length, draftQuestions: draft.length,
      inReviewQuestions: inReview.length, needsRevisionQuestions: needsRevision.length,
      pendingReviews: pendingReviews.length, avgQuality, activeSprint,
    };
  },

  async filter(sheetName, filters = {}, force = false) {
    const rows = await this.getAll(sheetName, force);
    let filtered = rows;
    if (filters.status) filtered = filtered.filter(r => r.status === filters.status);
    if (filters.domain) filtered = filtered.filter(r => r.domain === filters.domain);
    if (filters.difficulty) filtered = filtered.filter(r => r.difficulty === filters.difficulty);
    if (filters.creatorId) filtered = filtered.filter(r => r.creatorId === filters.creatorId);
    if (filters.reviewerId) filtered = filtered.filter(r => r.reviewerId === filters.reviewerId);
    if (filters.assigneeId) filtered = filtered.filter(r => r.assigneeId === filters.assigneeId);
    if (filters.sprintId) filtered = filtered.filter(r => r.sprintId === filters.sprintId);
    if (filters.personId) filtered = filtered.filter(r => r.personId === filters.personId);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(r => Object.values(r).some(v => v && v.toString().toLowerCase().includes(q)));
    }
    const total = filtered.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 1000;
    return { data: filtered.slice(offset, offset + limit), total, offset, limit };
  },

  async getById(sheetName, id) {
    const rows = await this.getAll();
    return rows.find(r => r.id && r.id.toString() === id.toString()) || null;
  },

  async insert(sheetName, data) {
    return this._write(sheetName, 'upsert', Array.isArray(data) ? data : [data]);
  },

  async update(sheetName, id, data) {
    return this._write(sheetName, 'upsert', [{ ...data, id }]);
  },

  async remove(sheetName, id) {
    return this._write(sheetName, 'delete', null, id);
  },

  async upsert(sheetName, records) {
    return this._write(sheetName, 'upsert', Array.isArray(records) ? records : [records]);
  },

  async updateConfig(configKey, configValue, userName) {
    return this._write(null, 'updateConfig', null, null, { configKey, configValue, userName });
  },

  async getNextQuestionId() {
    try {
      const result = await gasGet('nextQuestionId');
      return result?.data?.id || `HDQ-${Date.now().toString(36).slice(-3).toUpperCase()}`;
    } catch { return `HDQ-${Date.now().toString(36).slice(-3).toUpperCase()}`; }
  },

  async createNotification(data) {
    return gasPost({ action: 'createNotification', data });
  },

  async markNotificationsRead(userId, ids = []) {
    return gasPost({ action: 'markNotificationsRead', userId, ids });
  },

  async _write(type, action, data, id, extra) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), UPDATE_TIMEOUT);
      const payload = { key: GAS_API_KEY, action };
      if (action === 'delete') { payload.type = type; payload.id = id; }
      else if (action === 'updateConfig') { Object.assign(payload, extra); }
      else { payload.type = type; payload.data = data; }
      const response = await fetch(`${GAS_URL}?key=${GAS_API_KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload), signal: controller.signal
      });
      clearTimeout(timeoutId);
      _cache = null; _cacheTime = 0;
      return response.ok || response.status === 200;
    } catch (error) { console.error('[HiveDesk] write failed:', error); return false; }
  },
};

export function setGasUrl() {}
export function setApiKey() {}
export function getGasUrl() { return GAS_URL; }
