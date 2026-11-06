/** Outil 1B : minutes de réunion (une entreprise peut en avoir plusieurs). */

export interface MinuteSummary {
  id: number;
  etape: number;
  numero: number | null;
  date_reunion: string;
  lieu: string | null;
  objectif: string | null;
  updated_at: string;
  /** true quand le consultant et tous les participants ont signé */
  signed_complete: boolean;
  nb_presents: number;
}

export interface MinutesList {
  minutes: MinuteSummary[];
  company: { id: number; name: string } | null;
  consultant: { username: string } | null;
}

export interface MinutePresent {
  nom: string;
  poste: string | null;
  /** Signature tracée sur l'écran (image PNG en data URL), null si pas encore signé */
  signature: string | null;
}

/** Ligne du tableau « Engagements et prochaines étapes » */
export interface MinuteEngagement {
  tache: string | null;
  responsable: string | null;
  /** AAAA-MM-JJ */
  echeance: string | null;
}

export interface Minute {
  id: number;
  cons_id: number;
  comp_id: number;
  etape: number;
  numero: number | null;
  date_reunion: string;
  heure_debut: string | null;
  heure_fin: string | null;
  lieu: string | null;
  /** « Sujet principal » */
  objectif: string | null;
  ordre_jour: string | null;
  discussion: string | null;
  /** « Accords et décisions » */
  resultats: string | null;
  /** « Observations et commentaires » */
  remarques: string | null;
  consultant_signature: string | null;
  updated_at: string;
}

export interface MinuteDetail {
  minute: Minute;
  presents: MinutePresent[];
  engagements: MinuteEngagement[];
  canWrite: boolean;
}

/** Corps envoyé pour créer (avec cons_id et comp_id) ou modifier une minute */
export interface MinutePayload {
  cons_id?: number;
  comp_id?: number;
  etape: number;
  numero: number | null;
  date_reunion: string;
  heure_debut: string | null;
  heure_fin: string | null;
  lieu: string | null;
  objectif: string | null;
  ordre_jour: string | null;
  discussion: string | null;
  resultats: string | null;
  remarques: string | null;
  consultant_signature: string | null;
  presents: Pick<MinutePresent, 'nom' | 'poste' | 'signature'>[];
  engagements: MinuteEngagement[];
}
