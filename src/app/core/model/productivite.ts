/** Outil 1J « Profil de productivité » (diagnostic rapide), tel que renvoyé par GET /api/productivite. Montants en FCFA. */

export type ProductionType = 'stock' | 'commande' | 'les_deux';
export type Propriete = 'propriete' | 'location';

/** Ligne « produit et variante / volume mensuel / valeur par mois » */
export interface ProduitLigne {
  produit: string | null;
  /** Texte libre avec l'unité (ex. « 500 kg », « 1 200 litres ») */
  volume_mensuel: string | null;
  valeur_fcfa: number | null;
}

export interface Productivite {
  id: number;
  updated_at: string;

  nb_gammes: number | null;
  nb_variantes: number | null;

  production_quotidienne: string | null;
  heures_par_jour: number | null;
  jours_par_semaine: number | null;
  mois_par_an: number | null;
  capacite_utilisee_pct: number | null;
  production_type: ProductionType | null;

  surface_m2: number | null;
  propriete: Propriete | null;
  nb_machines_cles: number | null;
  machine_principale: string | null;
  jours_perdus_mois: number | null;

  effectif_production: number | null;
  effectif_temps_plein: number | null;
  effectif_temps_partiel: number | null;
  formes_securite: number | null;
  nb_formes_securite: number | null;
  lacune_competences: string | null;

  saisonnalite: number | null;
  saisonnalite_detail: string | null;
  goulot: string | null;
  augmentation_possible_pct: number | null;
  commandes_refusees: number | null;
  commandes_refusees_fcfa: number | null;
  certifications: string | null;
}

export interface ProductiviteResponse {
  data: Productivite | null;
  produits: ProduitLigne[];
  company: { id: number; name: string } | null;
  consultant: { username: string } | null;
  fx: { year: number; xafPerUsd: number };
}
