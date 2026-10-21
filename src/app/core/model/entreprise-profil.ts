export type TypeEntreprise = 'familiale' | 'independante' | 'cooperative';
export type TypeFacturation = 'manuelle' | 'electronique' | 'aucune';
export type TypeClientele = 'grand_public' | 'particuliers' | 'entreprises' | 'autre';

export const CANAUX_VENTE: { value: string; label: string }[] = [
  { value: 'marches',     label: 'Marchés' },
  { value: 'en_ligne',    label: 'En ligne' },
  { value: 'entreprises', label: 'Entreprises' },
  { value: 'domicile',    label: 'À domicile' },
  { value: 'autre',       label: 'Autre' },
];

/** Ligne « type de produit / volume des ventes » — montant saisi et stocké en FCFA. */
export interface ProfilVente {
  produit: string | null;
  volume_fcfa: number | null;
}

/** Profil du participant (outil 1L), tel que renvoyé par GET /api/profil. */
export class EntrepriseProfil {
  id!: number;
  cons_id!: number;
  comp_id!: number;
  date!: string;
  updated_at!: string;

  representant!: string | null;
  telephone!: string | null;
  adresse!: string | null;
  email!: string | null;
  activite!: string | null;
  annees_activite!: string | null;
  date_reunion!: string | null;       // AAAA-MM-JJ
  organisation!: string | null;

  effectif_total!: number | null;
  effectif_femmes!: number | null;

  etude_secondaire_chef!: number | null;
  etude_secondaire_femmes!: number | null;
  etude_secondaire_hommes!: number | null;
  etude_universite_chef!: number | null;
  etude_universite_femmes!: number | null;
  etude_universite_hommes!: number | null;
  etude_autre_chef!: number | null;
  etude_autre_femmes!: number | null;
  etude_autre_hommes!: number | null;
  etude_autre_precision!: string | null;

  type_entreprise!: TypeEntreprise | null;

  enregistrement_fiscal!: number | null;
  type_facturation!: TypeFacturation | null;
  compte_bancaire!: number | null;
  suivi_ca!: number | null;

  clients_reguliers!: number | null;
  canaux_vente!: string | null;       // liste séparée par des virgules
  type_clientele!: TypeClientele | null;
  commentaires_marche!: string | null;

  soutien_programme!: number | null;
  soutien_nom!: string | null;
  subvention_recue!: number | null;
}

export class ProfilResponse {
  profil!: EntrepriseProfil | null;
  ventes!: ProfilVente[];
  company!: {
    id: number; name: string; gerant: string | null; quartier: string | null; lieu: string | null;
    ville: string | null; secteur: string | null; nbr_employer: number | null; nbr_femme: number | null;
  } | null;
  consultant!: { username: string } | null;
  /** Taux fixe pour l'affichage en USD (vue managers) */
  fx!: { year: number; xafPerUsd: number };
}
