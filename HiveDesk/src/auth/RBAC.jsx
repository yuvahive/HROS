import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

const RBACContext = createContext(null);

const PERMISSIONS = {
  // Questions
  questions_create: ['admin', 'lead', 'curator'],
  questions_read: ['admin', 'lead', 'curator'],
  questions_update_own: ['admin', 'lead', 'curator'],
  questions_update_any: ['admin', 'lead'],
  questions_delete: ['admin', 'lead'],
  questions_bulk_action: ['admin', 'lead'],
  questions_assign_reviewer: ['admin', 'lead'],
  questions_submit_for_review: ['admin', 'lead', 'curator'],
  questions_approve: ['admin', 'lead'],
  questions_reject: ['admin', 'lead'],
  questions_publish: ['admin', 'lead'],
  questions_import: ['admin', 'lead'],
  questions_export: ['admin', 'lead'],

  // Reviews
  reviews_create: ['admin', 'lead', 'curator'],
  reviews_read: ['admin', 'lead', 'curator'],
  reviews_read_others: ['admin', 'lead'],
  reviews_score: ['admin', 'lead', 'curator'],
  reviews_approve: ['admin', 'lead'],

  // Sprints
  sprints_create: ['admin', 'lead'],
  sprints_read: ['admin', 'lead', 'curator'],
  sprints_update: ['admin', 'lead'],
  sprints_delete: ['admin'],
  sprints_assign_members: ['admin', 'lead'],
  sprints_start_end: ['admin', 'lead'],

  // Team
  team_read: ['admin', 'lead', 'curator'],
  team_create: ['admin'],
  team_update: ['admin'],
  team_delete: ['admin'],
  team_view_workload: ['admin', 'lead'],
  team_manage_buddy_pairs: ['admin', 'lead'],

  // Work Logs
  worklogs_create: ['admin', 'lead', 'curator'],
  worklogs_read_own: ['admin', 'lead', 'curator'],
  worklogs_read_all: ['admin', 'lead'],

  // Check-ins
  checkins_create: ['admin', 'lead', 'curator'],
  checkins_read_own: ['admin', 'lead', 'curator'],
  checkins_read_all: ['admin', 'lead'],

  // Settings
  settings_read: ['admin', 'lead'],
  settings_update: ['admin'],

  // Audit
  audit_read: ['admin'],

  // Dashboard
  dashboard_admin_stats: ['admin'],
  dashboard_team_stats: ['admin', 'lead'],
  dashboard_my_stats: ['admin', 'lead', 'curator'],
};

const ROLE_HIERARCHY = { admin: 3, lead: 2, curator: 1 };

export function RBACProvider({ children }) {
  const { currentUser } = useAuth();

  const value = useMemo(() => {
    const role = currentUser?.role?.toLowerCase() || null;
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
    const isCurator = role === 'curator';

    return {
      role,
      level,
      isAdmin,
      isLead,
      isCurator,
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
