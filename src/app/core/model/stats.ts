/** Une ligne par entreprise, renvoyée par GET /api/manager/stats (agrégats calculés côté frontend). */
export interface StatRow {
  id: number;
  name: string;
  region: string | null;
  departement: string | null;
  ville: string | null;
  secteur: string | null;
  date_creation: number | null;
  nbr_employer: number | null;
  nbr_femme: number | null;
  cons_id: number | null;
  consultant: string | null;

  // Profil 1L le plus récent (null si non rempli)
  profil_id: number | null;
  profil_updated_at: string | null;
  effectif_total: number | null;
  effectif_femmes: number | null;
  type_entreprise: 'familiale' | 'independante' | 'cooperative' | null;
  enregistrement_fiscal: number | null;
  type_facturation: 'manuelle' | 'electronique' | 'aucune' | null;
  compte_bancaire: number | null;
  suivi_ca: number | null;
  clients_reguliers: number | null;
  canaux_vente: string | null;
  type_clientele: 'grand_public' | 'particuliers' | 'entreprises' | 'autre' | null;
  soutien_programme: number | null;
  subvention_recue: number | null;
  ca_total_fcfa: number;

  // Livrables
  nb_predia: number;
  nb_diag: number;
}

export interface StatsResponse {
  entreprises: StatRow[];
  fx: { year: number; xafPerUsd: number };
}
