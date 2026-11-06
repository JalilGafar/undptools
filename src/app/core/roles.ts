/**
 * Rôles de la plateforme (noms renvoyés par le serveur à la connexion).
 *  - ROLE_ADMIN       : Bureau Pays. Gère les rôles et les vagues, commente et évalue les livrables.
 *  - ROLE_EVALUATEUR  : RBLAC. Commente et évalue les livrables.
 *  - ROLE_MODERATOR   : commente les livrables, ne les évalue pas.
 *  - ROLE_CONSULTANT  : remplit les outils de ses entreprises.
 * Les trois premiers forment l'équipe de supervision : ils consultent toutes les données, sans jamais écrire dans les outils.
 */
export const MANAGER_ROLES = ['ROLE_ADMIN', 'ROLE_MODERATOR', 'ROLE_EVALUATEUR'];

export const hasManagerRole = (roles: readonly string[] | null | undefined): boolean =>
  !!roles?.some(r => MANAGER_ROLES.includes(r));

export const hasAdminRole = (roles: readonly string[] | null | undefined): boolean =>
  !!roles?.includes('ROLE_ADMIN');

/** Peut poser une mention « Validé » / « À améliorer » : l'administrateur (Bureau Pays) et l'évaluateur (RBLAC) */
export const canEvaluateRole = (roles: readonly string[] | null | undefined): boolean =>
  !!roles?.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_EVALUATEUR');

export function roleLabel(roles: readonly string[] | null | undefined): string {
  if (roles?.includes('ROLE_ADMIN')) return 'Administrateur';
  if (roles?.includes('ROLE_EVALUATEUR')) return 'Évaluateur';
  if (roles?.includes('ROLE_MODERATOR')) return 'Modérateur';
  if (roles?.includes('ROLE_ENTREPRISE')) return 'Entreprise';
  return 'Consultant';
}
