import { HiveDeskStorage } from './HiveDeskStorage';

const SESSION_KEY = 'hivedesk_user';
const USERS_CACHE_KEY = 'hivedesk_cached_users';

const DEFAULT_ADMIN = {
  id: 'admin-001',
  name: 'Himanshu Yadav',
  email: 'himanshuyadav4596@gmail.com',
  password: 'hivedesk-admin-2026',
  role: 'admin',
  domain: 'all',
  isActive: true,
};

let inMemoryUsers = [];

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function storeUser(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(SESSION_KEY);
}

export async function loadUsers() {
  try {
    const data = await HiveDeskStorage.fetchAll();
    if (data && data.HiveDeskUsers && data.HiveDeskUsers.length > 0) {
      inMemoryUsers = data.HiveDeskUsers;
      localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(inMemoryUsers));
      return inMemoryUsers;
    }
  } catch (e) {
    console.error('[Auth] Failed to load users from cloud:', e);
  }
  const cached = localStorage.getItem(USERS_CACHE_KEY);
  if (cached) {
    try { inMemoryUsers = JSON.parse(cached); } catch { inMemoryUsers = []; }
  }
  if (inMemoryUsers.length === 0) {
    inMemoryUsers = [DEFAULT_ADMIN];
    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(inMemoryUsers));
  }
  return inMemoryUsers;
}

export function getInMemoryUsers() {
  return inMemoryUsers;
}

export function loginUser(email, password) {
  const users = inMemoryUsers.length > 0 ? inMemoryUsers : (() => {
    const cached = localStorage.getItem(USERS_CACHE_KEY);
    if (cached) { try { return JSON.parse(cached); } catch {} }
    return [DEFAULT_ADMIN];
  })();

  const user = users.find(u =>
    u.email &&
    u.email.toLowerCase() === email.trim().toLowerCase() &&
    u.password === password.trim() &&
    (u.isActive === true || u.isActive === 'true')
  );

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    domain: user.domain || '',
    loginTime: new Date().toISOString(),
  };
  storeUser(userData);
  return { success: true, user: userData };
}

export function logoutUser() {
  clearUser();
}

export function hasPermission(user, permission, config) {
  if (!user || !config) return false;
  if (user.role === 'admin') return true;
  const allowed = (config[permission] || '').split(',').map(s => s.trim());
  return allowed.includes(user.role);
}
