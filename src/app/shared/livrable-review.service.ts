import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environment/environment';

export type ReviewStatus = 'valide' | 'a_ameliorer';

/**
 * Instance au nom de laquelle un avis est donné : l'administrateur évalue pour le Bureau Pays, l'évaluateur pour le RBLAC.
 * Le modérateur commente sans mention : pas d'instance. Elle est posée par le serveur d'après le rôle de l'auteur.
 */
export type ReviewInstance = 'bureau_pays' | 'rblac';

export const INSTANCE_LABEL: Record<ReviewInstance, string> = { bureau_pays: 'Bureau Pays', rblac: 'RBLAC' };
/** « le Bureau Pays », « le RBLAC » (dans une phrase : « Validé par le Bureau Pays ») */
export const INSTANCE_ARTICLE: Record<ReviewInstance, string> = { bureau_pays: 'le Bureau Pays', rblac: 'le RBLAC' };

export interface LivrableReview {
  id: number;
  /** Mention ; absente pour un simple commentaire (modérateur, ou administrateur / évaluateur qui commente seulement) */
  status: ReviewStatus | null;
  instance: ReviewInstance | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
  reviewer_id: number;
  reviewer: string | null;
  reviewer_role: string | null;
  /** true si l'évaluation a été écrite par l'utilisateur connecté */
  mine: boolean;
}

export interface ReviewsResponse {
  reviews: LivrableReview[];
  /** Peut commenter (administrateur, évaluateur, modérateur) */
  canReview: boolean;
  /** Peut poser une mention « Validé » / « À améliorer » (administrateur, évaluateur) */
  canEvaluate: boolean;
  /** Instance au nom de laquelle l'utilisateur connecté évalue */
  instance: ReviewInstance | null;
}

/** Mention la plus récente d'un livrable évalué (une entrée par livrable) */
export interface ReviewSummary {
  comp_id: number;
  cons_id: number;
  tool_code: string;
  /** Minute de réunion concernée (outil 1B, une évaluation par minute) ; 0 pour les autres outils */
  item_id: number;
  nb: number;
  /** Nombre d'évaluations « Validé » et « À améliorer » (plusieurs évaluateurs possibles) */
  nb_valide: number;
  nb_ameliorer: number;
  /** Avis écrits (avec ou sans mention) */
  nb_comments: number;
  status: ReviewStatus | null;
  /** Mention de chaque instance : la plus récente de ses membres ; null = pas encore évalué par cette instance */
  bp_status: ReviewStatus | null;
  bp_at: string | null;
  rblac_status: ReviewStatus | null;
  rblac_at: string | null;
  /** true : évaluation que le consultant n'a pas encore ouverte (toujours false pour un manager) */
  unseen: boolean;
}

/** Outil dont chaque élément (une minute de réunion) est un livrable évalué séparément */
export const ITEM_TOOL = 't1b';

/** Clé d'un livrable dans la table des résumés. itemId = id du livrable ; il ne compte que pour 1B (une minute = un livrable). */
export const reviewKey = (compId: number, consId: number, toolCode: string, itemId = 0): string =>
  `${compId}-${consId}-${toolCode}-${toolCode === ITEM_TOOL ? itemId : 0}`;

/**
 * État global d'un livrable, d'après la mention de chaque instance (règle à modifier ici seulement) :
 *  - « ameliorer » : au moins une instance demande des améliorations ;
 *  - « valide »    : les deux instances ont validé ;
 *  - « partiel »   : une seule instance a validé, l'autre n'a pas encore évalué ;
 *  - « none »      : aucune mention (un simple commentaire ne change pas l'état).
 */
export type OverallState = 'none' | 'ameliorer' | 'partiel' | 'valide';

export function overallState(r: { bp_status?: ReviewStatus | null; rblac_status?: ReviewStatus | null } | null | undefined): OverallState {
  const bp = r?.bp_status ?? null, rb = r?.rblac_status ?? null;
  if (bp === 'a_ameliorer' || rb === 'a_ameliorer') return 'ameliorer';
  if (bp === 'valide' && rb === 'valide') return 'valide';
  if (bp === 'valide' || rb === 'valide') return 'partiel';
  return 'none';
}

export const OVERALL_LABEL: Record<OverallState, string> = {
  none: 'Non évalué', ameliorer: 'À améliorer', partiel: 'En attente', valide: 'Validé'
};

/**
 * Mention d'un livrable dans la table des résumés. Le registre des Quick Wins (tqw1 à tqw4, un livrable par étape) est présenté
 * aux managers comme un seul registre : ses mentions sont alors celles de toutes ses étapes (pour chaque instance, la plus récente).
 */
export function lookupReview(reviews: Map<string, ReviewSummary>, compId: number, consId: number, toolCode: string, itemId = 0): ReviewSummary | undefined {
  if (!toolCode.startsWith('tqw')) return reviews.get(reviewKey(compId, consId, toolCode, itemId));
  const found = [1, 2, 3, 4].map(n => reviews.get(reviewKey(compId, consId, 'tqw' + n))).filter((r): r is ReviewSummary => !!r);
  if (!found.length) return undefined;
  // Pour chaque instance : la mention la plus récente parmi les étapes
  const latest = (status: 'bp_status' | 'rblac_status', at: 'bp_at' | 'rblac_at') => {
    const withMark = found.filter(r => r[status]).sort((a, b) => String(b[at]).localeCompare(String(a[at])));
    return { status: withMark[0]?.[status] ?? null, at: withMark[0]?.[at] ?? null };
  };
  const bp = latest('bp_status', 'bp_at'), rb = latest('rblac_status', 'rblac_at');
  return {
    ...found[0],
    nb: found.reduce((n, r) => n + r.nb, 0),
    nb_valide: found.reduce((n, r) => n + r.nb_valide, 0),
    nb_ameliorer: found.reduce((n, r) => n + r.nb_ameliorer, 0),
    nb_comments: found.reduce((n, r) => n + (r.nb_comments ?? 0), 0),
    bp_status: bp.status, bp_at: bp.at, rblac_status: rb.status, rblac_at: rb.at,
    unseen: found.some(r => r.unseen)
  };
}

/** Évaluation des livrables par les managers / modérateurs (mention « Validé » ou « À améliorer » + commentaire). */
@Injectable({ providedIn: 'root' })
export class LivrableReviewService {

  private url = `${environment.apiUrl}/api/reviews`;

  constructor(private http: HttpClient) { }

  /** Résumé des évaluations : tous les livrables pour un manager, les siens pour un consultant. Ne bloque jamais la page : en cas d'échec, table vide. */
  summary(): Observable<Map<string, ReviewSummary>> {
    return this.http.get<{ items: ReviewSummary[] }>(`${this.url}/summary`).pipe(
      map(res => new Map(res.items.map(i => [reviewKey(i.comp_id, i.cons_id, i.tool_code, i.item_id), i] as [string, ReviewSummary]))),
      catchError(() => of(new Map<string, ReviewSummary>()))
    );
  }

  list(compId: number, consId: number, toolCode: string, itemId = 0): Observable<ReviewsResponse> {
    const params = new HttpParams().append('comp_id', compId).append('cons_id', consId).append('tool_code', toolCode).append('item_id', itemId);
    return this.http.get<ReviewsResponse>(this.url, { params });
  }

  /** Crée ou remplace l'évaluation de l'utilisateur connecté pour ce livrable */
  save(compId: number, consId: number, toolCode: string, itemId: number, status: ReviewStatus | null, comment: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(this.url, { comp_id: compId, cons_id: consId, tool_code: toolCode, item_id: itemId, status, comment });
  }

  remove(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
