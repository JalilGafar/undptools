import { VagueStatut } from './vague';

export class Company {
    id!: number;
    name!: string;
    date_creation!: string;
    produits!: string;
    services!: string;
    description!: string;
    gerant!: string;
    descrt_gerant!: string;
    nbr_employer!: number;
    nbr_femme!: number;
    region!: string;
    departement!: string;
    ville!: string;
    commune!: string;
    quartier!: string;
    lieu!: string;
    x!: number;
    y!: number;
    idUser!: number;
    logo!: string;
    secteur!: string;
    /** Consultant à qui l'entreprise est attribuée (colonne id_consl ; idUser est son alias dans les détails) */
    id_consl?: number;
    /** Nom du consultant en charge (fiche détaillée du manager) */
    consultant?: string;
    /** Vague du programme (une entreprise appartient à une seule vague) */
    id_vague?: number;
    vague_nom?: string;
    vague_statut?: VagueStatut;
}