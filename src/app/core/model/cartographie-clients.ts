/** Une ligne de la cartographie : un client professionnel (B2B). Montant saisi et stocké en FCFA. */
export interface ClientLigne {
  client: string | null;
  secteur: string | null;
  contact: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  produits: string | null;
  montant_fcfa: number | null;
  remarques: string | null;
}

/** Cartographie des clients (outil 1G), telle que renvoyée par GET /api/cartographie. */
export class CartographieResponse {
  carto!: {
    id: number; cons_id: number; comp_id: number; date: string; updated_at: string;
    date_cartographie: string | null;   // AAAA-MM-JJ
  } | null;
  lignes!: ClientLigne[];
  company!: { id: number; name: string } | null;
  consultant!: { username: string } | null;
  /** Taux fixe pour l'affichage en USD (vue managers) */
  fx!: { year: number; xafPerUsd: number };
}
