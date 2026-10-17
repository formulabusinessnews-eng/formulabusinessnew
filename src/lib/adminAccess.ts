import { UserProfile } from '../types';

/** Única conta autorizada a ver e abrir o PAINEL ADMIN. */
export const PORTAL_ADMIN_UID = '8ef86021-6775-4211-bdf4-034fa74432d5';
export const PORTAL_ADMIN_EMAIL = 'formulabusinessnews@gmail.com';

export function isPortalAdminIdentity(id?: string | null, email?: string | null): boolean {
  if (!id || !email) return false;
  return id === PORTAL_ADMIN_UID && email.trim().toLowerCase() === PORTAL_ADMIN_EMAIL;
}

export function guestProfile(): UserProfile {
  return {
    id: 'guest',
    email: '',
    name: 'Visitante',
    role: 'USER',
    createdAt: '2026-01-01'
  };
}
