export type AdminRole = 'admin';

export interface AdminPermissions {
  canManageAnime: boolean;
  canManageEpisodes: boolean;
  canManageCommunity: boolean;
  canManageAnalytics: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageComments: boolean;
}

// Any admin has full access
export function hasPermission(role: string, permission: keyof AdminPermissions): boolean {
  return role === 'admin';
}
