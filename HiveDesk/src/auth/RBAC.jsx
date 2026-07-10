import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

const RBACContext = createContext(null);

const PERMISSIONS = {
  // Questions
  questions_create: ['admin', 'lead', 'curator'],
  questions_read: ['admin', 'lead', 'senior', 'curator', 'newcomer'],
  questions_read_own: ['admin', 'lead', 'senior', 'curator'],
  questions_update_own: ['admin', 'lead', 'senior', 'curator'],
  questions_update_any: ['admin', 'lead'],
  questions_delete: ['admin', 'lead'],
  questions_bulk_action: ['admin', 'lead'],
  questions_assign_reviewer: ['admin', 'lead'],
  questions_submit_for_review: ['admin', 'lead', 'senior', 'curator'],
  questions_approve: ['admin', 'lead', 'senior'],
  questions_reject: ['admin', 'lead', 'senior'],
  questions_publish: ['admin', 'lead'],
  questions_import: ['admin', 'lead', 'senior', 'curator'],
  questions_export: ['admin', 'lead'],

  // Reviews
  reviews_create: ['admin', 'lead', 'senior', 'curator'],
  reviews_read: ['admin', 'lead', 'senior', 'curator'],
  reviews_read_others: ['admin', 'lead', 'senior'],
  reviews_score: ['admin', 'lead', 'senior', 'curator'],
  reviews_approve: ['admin', 'lead', 'senior'],

  // Sprints
  sprints_create: ['admin', 'lead'],
  sprints_read: ['admin', 'lead', 'senior', 'curator'],
  sprints_update: ['admin', 'lead'],
  sprints_delete: ['admin'],
  sprints_assign_members: ['admin', 'lead'],
  sprints_start_end: ['admin', 'lead'],

  // Team
  team_read: ['admin', 'lead', 'senior', 'curator'],
  team_create: ['admin'],
  team_update: ['admin'],
  team_delete: ['admin'],
  team_view_workload: ['admin', 'lead'],
  team_manage_buddy_pairs: ['admin', 'lead'],

  // Missions
  missions_assign: ['admin', 'lead'],
  missions_read: ['admin', 'lead', 'senior', 'curator', 'newcomer'],
  missions_build: ['admin', 'lead'],
  missions_publish: ['admin', 'lead'],

  // Work Logs
  worklogs_create: ['admin', 'lead', 'senior', 'curator'],
  worklogs_read_own: ['admin', 'lead', 'senior', 'curator'],
  worklogs_read_all: ['admin', 'lead'],

  // Check-ins
  checkins_create: ['admin', 'lead', 'senior', 'curator'],
  checkins_read_own: ['admin', 'lead', 'senior', 'curator'],
  checkins_read_all: ['admin', 'lead'],

  // Settings
  settings_read: ['admin', 'lead'],
  settings_update: ['admin'],
  schema_edit: ['admin', 'lead'],

  // Audit
  audit_read: ['admin'],

  // Dashboard
  dashboard_admin_stats: ['admin'],
  dashboard_team_stats: ['admin', 'lead'],
  dashboard_my_stats: ['admin', 'lead', 'senior', 'curator'],

  // Analytics
  analytics_individual: ['admin', 'lead'],
  analytics_team: ['admin', 'lead'],
  analytics_all: ['admin'],

  // Notifications
  notifications_read: ['admin', 'lead', 'senior', 'curator', 'newcomer'],
  notifications_manage: ['admin'],
};

const ROLE_HIERARCHY = { admin: 4, lead: 3, senior: 2, curator: 1, newcomer: 0 };

export function RBACProvider({ children }) {
  const { currentUser, effectiveRole } = useAuth();

  const value = useMemo(() => {
    const role = effectiveRole?.toLowerCase() || null;
    const level = role ? ROLE_HIERARCHY[role] || 0 : 0;

    const hasPermission = (permission) => {
      if (!role) return false;
      const allowed = PERMISSIONS[permission];
      return allowed ? allowed.includes(role) : false;
    };

    const hasAnyPermission = (...perms) => perms.some(p => hasPermission(p));

    const canAccess = (resource, action) => {
      return hasPermission(`${resource}_${action}`);
    };

    const isAdmin = role === 'admin';
    const isLead = role === 'admin' || role === 'lead';
    const isSenior = role === 'admin' || role === 'lead' || role === 'senior';
    const isCurator = ['admin', 'lead', 'senior', 'curator'].includes(role);

    const hasRole = (minRole) => {
      const minLevel = ROLE_HIERARCHY[minRole] ?? -1;
      return level >= minLevel;
    };

    return {
      role,
      level,
      isAdmin,
      isLead,
      isSenior,
      isCurator,
      hasRole,
      hasPermission,
      hasAnyPermission,
      canAccess,
      permissions: Object.keys(PERMISSIONS).filter(p => hasPermission(p)),
    };
  }, [currentUser]);

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}

export function useRBAC() {
  const ctx = useContext(RBACContext);
  if (!ctx) throw new Error('useRBAC must be used within RBACProvider');
  return ctx;
}

export function PermissionGate({ permission, fallback = null, children }) {
  const { hasPermission } = useRBAC();
  return hasPermission(permission) ? children : fallback;
}

export function RoleGate({ roles, fallback = null, children }) {
  const { role } = useRBAC();
  return roles.includes(role) ? children : fallback;
}
