/** Vague du programme GYB (6 à 7 mois). Une entreprise appartient à une seule vague. */
export type VagueStatut = 'planifiee' | 'en_cours' | 'cloturee';

export interface Vague {
  id: number;
  nom: string;
  date_debut: string | null;      // AAAA-MM-JJ
  date_fin: string | null;
  statut: VagueStatut;
  /** Entreprises visibles par l'utilisateur dans cette vague (un consultant ne compte que les siennes) */
  nb_entreprises: number;
}

export interface VagueOuverte {
  id: number;
  nom: string;
  statut: VagueStatut;
}

/** Réponse de GET /api/vagues */
export interface VaguesResponse {
  vagues: Vague[];
  /** Vagues auxquelles on peut ajouter une entreprise (non clôturées) */
  ouvertes: VagueOuverte[];
  /** Sélection proposée par défaut : les vagues en cours (vide = toutes) */
  defaut: number[];
}

/** Champs à envoyer pour créer ou modifier une vague */
export interface VagueForm {
  nom: string;
  date_debut: string | null;
  date_fin: string | null;
  statut: VagueStatut;
}

export const STATUT_LABEL: Record<VagueStatut, string> = {
  planifiee: 'Planifiée',
  en_cours: 'En cours',
  cloturee: 'Clôturée'
};

/** « janv. 2027 » à partir de AAAA-MM-JJ */
export function monthYear(iso: string | null): string {
  if (!iso) return '';
  const [y, m] = iso.split('-');
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return `${months[Number(m) - 1] ?? ''} ${y}`.trim();
}

/** « janv. 2027 → août 2027 », ou vide si aucune date */
export function period(v: { date_debut: string | null; date_fin: string | null }): string {
  const a = monthYear(v.date_debut), b = monthYear(v.date_fin);
  return a && b ? `${a} → ${b}` : a ? `depuis ${a}` : b ? `jusqu'à ${b}` : '';
}
