export class LivrableGlobal {
    livrable!: string;
    tableur!: string;
    tool_code!: string;
    id_livrable!: number;
    comp_id!: number;
    company!: string;
    cons_id!: number;
    consultant!: string;
    ville!: string;
    secteur!: string;
    date!: string;
    updated_at!: string;
    region?: string;
    /** Vague de l'entreprise (nom) et son identifiant */
    vague?: string | null;
    id_vague?: number;
    /** Étape de la minute de réunion (1B) ; vide pour les autres outils, dont l'étape se déduit du type */
    etape?: number | null;
    /** Registre des Quick Wins regroupé : toutes les étapes renseignées (voir mergeQuickWins) */
    group?: string;
    etapes?: number[];
}
