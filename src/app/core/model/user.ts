export class User { 
    id!: number;
    username!:string;
    name!: string
    email!:string;
    tel!:string;
    photo?: string | null;
}

/** Utilisateur tel que la page « Utilisateurs et rôles » (administrateur) le reçoit : un seul rôle, et ses entreprises */
export interface ManagedUser {
    id: number;
    username: string;
    email: string;
    tel: string | null;
    photo: string | null;
    /** admin, evaluateur, moderator, consultant ou entreprise */
    role: string | null;
    nb_entreprises: number;
}