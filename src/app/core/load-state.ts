/** État d'un chargement de données : permet d'afficher un spinner ou un message d'erreur au lieu d'une page vide. */
export interface LoadState {
  loading: boolean;
  error: boolean;
}

export const LOAD_PENDING: LoadState = { loading: true, error: false };
export const LOAD_DONE: LoadState = { loading: false, error: false };
export const LOAD_FAILED: LoadState = { loading: false, error: true };
