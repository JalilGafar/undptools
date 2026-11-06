/** Outil transversal « Registre des Quick Wins » : un registre par étape (1 à 4), tel que renvoyé par GET /api/quickwins. */

export type StatutQw = 'a_faire' | 'en_cours' | 'termine';

export interface QwAction {
  action: string | null;
  domaine: string | null;
  responsable: string | null;
  /** AAAA-MM-JJ */
  echeance: string | null;
  statut: StatutQw;
  indicateur: string | null;
  valeur_avant: string | null;
  valeur_apres: string | null;
  commentaires: string | null;
}

export interface QuickWinsResponse {
  etape: number;
  data: { id: number; date_debut: string | null; docs_crees: string | null; docs_partages: string | null; updated_at: string } | null;
  actions: QwAction[];
  company: { id: number; name: string } | null;
  consultant: { username: string } | null;
}

export const STATUTS_QW: { value: StatutQw; label: string; short: string; icon: string }[] = [
  { value: 'a_faire', label: 'En attente', short: 'En attente', icon: 'bi-hourglass-split' },
  { value: 'en_cours', label: 'En cours', short: 'En cours', icon: 'bi-play-circle' },
  { value: 'termine', label: 'Terminé', short: 'Terminé', icon: 'bi-check-circle-fill' },
];

/** Suggestions de domaine (le champ reste libre) */
export const DOMAINES_QW = [
  'Production', 'Qualité / Hygiène', 'Commercial et marketing', 'Finance et comptabilité',
  'Gestion et organisation', 'Ressources humaines', 'Approvisionnement', 'Équipements et locaux', 'Sécurité'
];

export const RESPONSABLES_QW = ['Consultant', 'Chef d\'entreprise', 'Employé(e)'];
