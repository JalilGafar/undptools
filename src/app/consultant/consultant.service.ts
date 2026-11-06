import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, from, map, Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../environment/environment';
import { Company } from '../core/model/company';
import { ToolAttrib } from '../core/model/toolAttrib';
import { PrediaLabel } from '../core/model/predia_mat_label';
import { PrediaLabelJSON } from '../core/model/prediaJSON';
import { IntegLabel } from '../core/model/mat_integ_label';
import { ToolMatDiagInteg } from '../core/model/tool1D';
import { GanttTask } from '../core/model/gantt-task.model';
import { UpdateGanttTaskDto } from '../core/model/updateGantt';
import { BusinessModelCanvas } from '../core/model/businessModelCanvas';
import { ProfilResponse } from '../core/model/entreprise-profil';
import { CartographieResponse } from '../core/model/cartographie-clients';
import { Minute, MinuteDetail, MinutePayload, MinutesList } from '../core/model/minutes';
import { ProductiviteResponse } from '../core/model/productivite';
import { FinanceResponse } from '../core/model/finance';
import { ImageCommercialeResponse } from '../core/model/image-commerciale';
import { Cinq5SResponse, Phase5S, Photo5S, PhotoSlot } from '../core/model/cinq-s';
import { BpfResponse } from '../core/model/bpf';
import { QuickWinsResponse } from '../core/model/quickwins';
import { SuiviPhase, SuiviQuestionnaire, SuiviResponse } from '../core/model/suivi';
import { compressImage } from '../shared/image-compress';
import { LOAD_DONE, LOAD_FAILED, LOAD_PENDING, LoadState } from '../core/load-state';

@Injectable({
  providedIn: 'root'
})
export class ConsultantService {

  constructor(private http: HttpClient) { };

  private _company$ = new BehaviorSubject<Company[]>([]);
  get company$(): Observable<Company[]> {
    return this._company$.asObservable()
  }

  // true au départ : la page lance sa requête dès l'ouverture
  private _companyState$ = new BehaviorSubject<LoadState>(LOAD_PENDING);
  get companyState$(): Observable<LoadState> {
    return this._companyState$.asObservable();
  }

  // Chargements en cours des données d'un outil (réponses, libellés, ...) : true tant qu'au moins une requête est en attente
  private pendingTool = 0;
  private toolFailed = false;
  private _toolState$ = new BehaviorSubject<LoadState>(LOAD_PENDING);
  get toolState$(): Observable<LoadState> {
    return this._toolState$.asObservable();
  }
  private trackTool<T>(request: Observable<T>, onData: (value: T) => void) {
    if (this.pendingTool === 0) this.toolFailed = false;
    this.pendingTool++;
    this._toolState$.next(LOAD_PENDING);
    const finish = () => {
      this.pendingTool--;
      if (this.pendingTool === 0) this._toolState$.next(this.toolFailed ? LOAD_FAILED : LOAD_DONE);
    };
    request.subscribe({
      next: value => { onData(value); finish(); },
      error: () => { this.toolFailed = true; finish(); }
    });
  }

  private _ToolAttribData$ = new BehaviorSubject<ToolAttrib[]>([]);
  get ToolAttribData$(): Observable<ToolAttrib[]> {
    return this._ToolAttribData$.asObservable()
  }
  clearAttrib() {
    this._ToolAttribData$.next([])
  }

  private _ToolActivities$ = new BehaviorSubject<GanttTask[]>([]);
  get ToolActivities$(): Observable<GanttTask[]> {
    return this._ToolActivities$.asObservable()
  }
  clearActivities() {
    this._ToolActivities$.next([]);
  }

  private _ToolMatDiagIntegData$ = new BehaviorSubject<ToolMatDiagInteg[]>([]);
  get ToolMatDiagIntegData$(): Observable<ToolMatDiagInteg[]> {
    return this._ToolMatDiagIntegData$.asObservable()
  }
  clearMatDiagInteg() {
    this._ToolMatDiagIntegData$.next([])
  }

  private _MatPrediaLabel$ = new BehaviorSubject<PrediaLabelJSON[]>([]);
  get MatPrediaLabel$(): Observable<PrediaLabelJSON[]> {
    return this._MatPrediaLabel$.asObservable()
  }

  private _MatIntegLabel$ = new BehaviorSubject<IntegLabel[]>([]);
  get MatIntegLabel$(): Observable<IntegLabel[]> {
    return this._MatIntegLabel$.asObservable()
  }

  private _BusinessModelCanvas$ = new BehaviorSubject<BusinessModelCanvas | null>(null);
  get BusinessModelCanvas$(): Observable<BusinessModelCanvas | null> {
    return this._BusinessModelCanvas$.asObservable();
  }
  clearBusinessModelCanvas() {
    this._BusinessModelCanvas$.next(null);
  }




  getCompanyFromServer() {
    this.http.get<Company[]>(`${environment.apiUrl}/api/consultant/companies`).pipe(
      tap(campus => {
        this._company$.next(campus);
        //    this.setLoadingStatus(false);
      })
    ).subscribe();
  }
  getCompanyForConslFromServer(id: number) {
    const params = new HttpParams().append('idUser', id);
    this._companyState$.next(LOAD_PENDING);
    this._company$.next([]);
    this.http.get<Company[]>(`${environment.apiUrl}/api/consultant/companiesUser`, { params }).subscribe({
      next: companies => { this._company$.next(companies); this._companyState$.next(LOAD_DONE); },
      error: () => this._companyState$.next(LOAD_FAILED)
    });
  }

  /** Outils déjà remplis par entreprise : { companies: { [idEntreprise]: ['t1d', 't1l', ...] } } */
  fetchLivrablesSummary(): Observable<{ companies: Record<number, string[]> }> {
    return this.http.get<{ companies: Record<number, string[]> }>(`${environment.apiUrl}/api/consultant/livrables-summary`);
  }

  /** Entreprise lue directement (le tableau de bord ne dépend pas d'une liste déjà chargée) */
  fetchCompany(id: number): Observable<Company> {
    return this.http.get<Company>(`${environment.apiUrl}/api/consultant/company/${id}`);
  }

  /** Outils remplis (avec leur date de dernière modification) et minutes de réunion d'une entreprise */
  fetchDashboard(id: number): Observable<{
    tools: Record<string, { updated_at: string }>;
    minutes: { id: number; etape: number; date_reunion: string; updated_at: string }[];
  }> {
    return this.http.get<any>(`${environment.apiUrl}/api/consultant/company/${id}/dashboard`);
  }

  getCompanyById(id: number): Observable<Company> {
    return this.company$.pipe(
      map(company => company.filter(company => company.id === id)[0])
    );
  }

  getCompanyDetailById(id: number): Observable<Company> {
    return this.http.get<Company>(`${environment.apiUrl}/api/consultant/company/${id}`);
  }

  updateCompany(id: number, data: Partial<Company>): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/consultant/company/${id}`, data);
  }

  uploadCompanyLogo(id: number, file: File): Observable<{ logo: string }> {
    // Image réduite dans le navigateur puis envoyée en JSON (la couche d'entrée de l'hébergeur refuse le multipart)
    return from(compressImage(file, { maxSide: 800, maxBytes: 700_000, keepTransparency: true })).pipe(
      switchMap(image => this.http.post<{ logo: string }>(`${environment.apiUrl}/api/consultant/company/${id}/logo-json`, { image })),
      catchError(err => throwError(() => err?.error ? err : { error: { message: err?.message ?? 'Une erreur est survenue. Veuillez réessayer.' } }))
    );
  }

  //Add new company
  addCompany(newCompany: {
    name: string, date_creation: number, produits: string, services: string, description: string, gerant: string,
    descrt_gerant: string, nbr_employer: string, nbr_femme: string, region: string, departement: string, ville: string,
    commune: string, quartier: string, lieu: string, x: number, y: number, idUser: number, id_vague?: number | null
  }): Observable<Company> {
    console.log(newCompany)
    return this.http.post<Company>(`${environment.apiUrl}/api/consultant/newCompany`, newCompany);
  }


  //$$$$$$$$$$$$ TOOLS $$$$$$$$$$$$$$$$$$$

  // ************* SAVE TOOL ATRIB
  saveToolAttrib(attribForm: Partial<ToolAttrib> & { cons_id: number; comp_id: number }): Observable<ToolAttrib> {
    return this.http.post<ToolAttrib>(`${environment.apiUrl}/api/tools/attribut`, attribForm);
  }

  // ************* SAVE TOOL MATRICE INTEGRALE
  saveToolMatDiagInteg(attribForm: {
    note_1: number, comt__1: string, note_2: number, comt__2: string,
    note_3: number, comt__3: string, note_4: number, comt__4: string,
    note_5: number, comt__5: string, note_6: number, comt__6: string,
    note_7: number, comt__7: string, note_8: number, comt__8: string,
    note_9: number, comt__9: string,
    note_10: number, comt__10: string, note_11: number, comt__11: string,
    note_12: number, comt__12: string, note_13: number, comt__13: string,
    note_14: number, comt__14: string, note_15: number, comt__15: string,
    note_16: number, comt__16: string, note_17: number, comt__17: string,
    note_18: number, comt__18: string, note_19: number, comt__19: string,
    note_20: number, comt__20: string, note_21: number, comt__21: string,
    note_22: number, comt__22: string, note_23: number, comt__23: string,
    note_24: number, comt__24: string, note_25: number, comt__25: string,
    note_26: number, comt__26: string, note_27: number, comt__27: string,
    note_28: number, comt__28: string, note_29: number, comt__29: string,
    note_30: number, comt__30: string, note_31: number, comt__31: string,
    note_32: number, comt__32: string, note_33: number, comt__33: string,
    note_34: number, comt__34: string, note_35: number, comt__35: string,
    note_36: number, comt__36: string, note_37: number, comt__37: string,
    note_38: number, comt__38: string, note_39: number, comt__39: string,
    note_40: number, comt__40: string, note_41: number, comt__41: string,
    note_42: number, comt__42: string, note_43: number, comt__43: string,
    note_44: number, comt__44: string, note_45: number, comt__45: string,
    note_46: number, comt__46: string, note_47: number, comt__47: string,
    note_48: number, comt__48: string, note_49: number, comt__49: string,
    note_50: number, comt__50: string, note_51: number, comt__51: string,
    note_52: number, comt__52: string, note_53: number, comt__53: string,
    note_54: number, comt__54: string, note_55: number, comt__55: string,
    note_56: number, comt__56: string, note_57: number, comt__57: string,
    note_58: number, comt__58: string, note_59: number, comt__59: string,
    note_60: number, comt__60: string, note_61: number, comt__61: string,
    note_62: number, comt__62: string,
    difficult_1: string, difficult_2: string, difficult_3: string,
    force_1: string, force_2: string, force_3: string,
    faiblesse_1: string, faiblesse_2: string, faiblesse_3: string,
    besoin_1: string, besoin_2: string, besoin_3: string,
    cons_id: number, comp_id: number
  }): Observable<ToolAttrib> {
    console.log(attribForm)
    return this.http.post<ToolAttrib>(`${environment.apiUrl}/api/tools/integral`, attribForm);
  }

  // ************* SAVE RECOMMANDATIONS DU DIAGNOSTIC GÉNÉRAL (onglet Résumé : sans toucher aux réponses du questionnaire)
  saveDiagRecommandations(payload: { cons_id: number; comp_id: number; recommandations: unknown }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/api/tools/integral/recommandations`, payload);
  }

  // ************* GET TOOL ATRIB
  getAttribDataById(idUser: number, idComp: number) {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp);
    this.trackTool(this.http.get<ToolAttrib[]>(`${environment.apiUrl}/api/tools/attribut`, { params }), data => this._ToolAttribData$.next(data));
  }

  getMatIntegDataById(idUser: number, idComp: number) {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp);
    this.trackTool(this.http.get<ToolMatDiagInteg[]>(`${environment.apiUrl}/api/tools/integral`, { params }), data => this._ToolMatDiagIntegData$.next(data));
  }

  transformToMysqlJsonString(input: string): string {
    try {
      // Étape 1 : Essayer de parser la chaîne brute (sans guillemets sur les clés)
      // On ajoute des guillemets aux clés non citées pour la rendre JSON-valide
      const fixedJson = input
        // Ajoute des guillemets autour des clés (clé: "valeur") → "clé": "valeur"
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

      // Étape 2 : Parser en objet JSON valide
      const parsed = JSON.parse(fixedJson);

      // Étape 3 : Convertir en string JSON normalisé
      let jsonString = JSON.stringify(parsed);

      // Étape 4 : Échapper les apostrophes pour compatibilité SQL
      jsonString = jsonString.replace(/'/g, "\\'");

      // Étape 5 : Entourer de guillemets simples
      return `'${jsonString}'`;
    } catch (error) {
      console.error('Erreur de conversion JSON -> MySQL :', error);
      throw new Error('Format JSON invalide. Vérifie la syntaxe.');
    }
  }

  ////////////////// MATRICE PREDIA LABEL

  getMatPrediaLabel() {
    this.trackTool(this.http.get<PrediaLabelJSON[]>(`${environment.apiUrl}/api/tools/matPrediaLabel`), data => this._MatPrediaLabel$.next(data));
  }


  ////////////////// MATRICE INETG LABEL
  getMatIntegLabel() {
    this.trackTool(this.http.get<IntegLabel[]>(`${environment.apiUrl}/api/tools/matIntegLabel`), data => this._MatIntegLabel$.next(data));
  }

  ///////////SUIVI DES ACTIVITES
  saveActivities(activitiesForm: {
    id: number, name: string, details: string, start: string, end: string,     // YYYY-MM-DD
    progress: number, status: string, dependencies: string,
    close: string, responsable: string, comments: string,
    cons_id: number, comp_id: number
  }): Observable<GanttTask> {
    // console.log (activitiesForm);
    return this.http.post<GanttTask>(`${environment.apiUrl}/api/tools/activities`, activitiesForm);
  }

  // ************* GET TOOL ACTIVITIES
  getActivitiesById(idUser: number, idComp: number) {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp);
    this.trackTool(this.http.get<GanttTask[]>(`${environment.apiUrl}/api/tools/activities`, { params }), data => this._ToolActivities$.next(data));
  }

  // **********UPDATE TOOL ACTIVITIES
  updateActivities(id: string|undefined, payload: UpdateGanttTaskDto): Observable<GanttTask> {
    // console.log (activitiesForm);
    return this.http.put<GanttTask>(`${environment.apiUrl}/api/tools/activities/${id}`, payload).pipe(
      tap(updated => {
        const current = this._ToolActivities$.value;

        const updatedList = current.map(t =>
          t.id === updated.id ? updated : t
        );

        this._ToolActivities$.next(updatedList);
      })
    );;
  }

  ///////////PROFIL DU PARTICIPANT (1L)
  fetchProfil(idUser: number, idComp: number): Observable<ProfilResponse> {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp);
    return this.http.get<ProfilResponse>(`${environment.apiUrl}/api/profil`, { params });
  }

  saveProfil(payload: Record<string, unknown>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${environment.apiUrl}/api/profil`, payload);
  }

  ///////////CARTOGRAPHIE DES CLIENTS B2B (1G)
  fetchCartographie(idUser: number, idComp: number): Observable<CartographieResponse> {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp);
    return this.http.get<CartographieResponse>(`${environment.apiUrl}/api/cartographie`, { params });
  }

  saveCartographie(payload: Record<string, unknown>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${environment.apiUrl}/api/cartographie`, payload);
  }

  ///////////BUSINESS MODEL CANVAS
  saveBusinessModelCanvas(data: BusinessModelCanvas): Observable<BusinessModelCanvas> {
    return this.http.post<BusinessModelCanvas>(
      `${environment.apiUrl}/api/tools/bmc`,
      data
    ).pipe(
      tap(savedData => {
        this._BusinessModelCanvas$.next(savedData);
      })
    );
  }

  getBusinessModelCanvasById(idUser: number, idComp: number) {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp);
    this.trackTool(this.http.get<BusinessModelCanvas>(`${environment.apiUrl}/api/tools/bmc`, { params }), data => this._BusinessModelCanvas$.next(data));
  }

  ///////////ANALYSE FINANCIÈRE (3H)
  fetchFinance(idUser: number, idComp: number): Observable<FinanceResponse> {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp);
    return this.http.get<FinanceResponse>(`${environment.apiUrl}/api/finance`, { params });
  }

  saveFinance(payload: Record<string, unknown>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${environment.apiUrl}/api/finance`, payload);
  }

  ///////////SUIVI ET ÉVALUATION (questionnaire servi par le serveur, mis en mémoire pour la session)
  private suiviQuestionnaire$?: Observable<SuiviQuestionnaire>;

  fetchSuiviQuestionnaire(): Observable<SuiviQuestionnaire> {
    return this.suiviQuestionnaire$ ??= this.http.get<SuiviQuestionnaire>(`${environment.apiUrl}/api/suivi/questionnaire`).pipe(shareReplay(1));
  }

  fetchSuivi(idUser: number, idComp: number, phase: SuiviPhase): Observable<SuiviResponse> {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp).append('phase', phase);
    return this.http.get<SuiviResponse>(`${environment.apiUrl}/api/suivi`, { params });
  }

  saveSuivi(payload: Record<string, unknown>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${environment.apiUrl}/api/suivi`, payload);
  }

  ///////////REGISTRE DES QUICK WINS (transversal : un registre par étape)
  fetchQuickWins(idUser: number, idComp: number, etape: number): Observable<QuickWinsResponse> {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp).append('etape', etape);
    return this.http.get<QuickWinsResponse>(`${environment.apiUrl}/api/quickwins`, { params });
  }

  saveQuickWins(payload: Record<string, unknown>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${environment.apiUrl}/api/quickwins`, payload);
  }

  ///////////OUTIL 5S
  fetchCinqS(idUser: number, idComp: number, phase: Phase5S): Observable<Cinq5SResponse> {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp).append('phase', phase);
    return this.http.get<Cinq5SResponse>(`${environment.apiUrl}/api/cinq-s`, { params });
  }

  saveCinqS(payload: Record<string, unknown>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${environment.apiUrl}/api/cinq-s`, payload);
  }

  /** Photos d'un emplacement (avant / après) d'une évaluation */
  listCinqSPhotos(idUser: number, idComp: number, phase: Phase5S, slot: PhotoSlot): Observable<{ photos: Photo5S[] }> {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp).append('phase', phase).append('slot', slot);
    return this.http.get<{ photos: Photo5S[] }>(`${environment.apiUrl}/api/cinq-s/photos`, { params });
  }

  /** Ajoute une photo : réduite dans le navigateur puis envoyée en JSON (la couche d'entrée de l'hébergeur refuse le multipart) */
  uploadCinqSPhoto(compId: number, phase: Phase5S, slot: PhotoSlot, file: File, legend: string): Observable<{ id: number }> {
    return from(compressImage(file, { maxSide: 1600, maxBytes: 900_000 })).pipe(
      switchMap(image => this.http.post<{ id: number }>(`${environment.apiUrl}/api/cinq-s/photo`, { comp_id: compId, phase, slot, legend, image })),
      catchError(err => throwError(() => err?.error ? err : { error: { message: err?.message ?? 'Une erreur est survenue. Veuillez réessayer.' } }))
    );
  }

  deleteCinqSPhoto(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/api/cinq-s/photo/${id}`);
  }

  /** Photo protégée : lue en blob avec le jeton (miniature ou taille réelle) */
  cinqSPhotoBlob(id: number, size: 'thumb' | 'full'): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/cinq-s/photo/${id}`, { params: { size }, responseType: 'blob' });
  }

  ///////////DIAGNOSTIC D'IMAGE COMMERCIALE (1K)
  fetchImageCommerciale(idUser: number, idComp: number): Observable<ImageCommercialeResponse> {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp);
    return this.http.get<ImageCommercialeResponse>(`${environment.apiUrl}/api/image-commerciale`, { params });
  }

  saveImageCommerciale(payload: Record<string, unknown>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${environment.apiUrl}/api/image-commerciale`, payload);
  }

  // Outil 1E_a : Diagnostic BPF (bonnes pratiques de fabrication)
  fetchBpf(idUser: number, idComp: number): Observable<BpfResponse> {
    const params = new HttpParams().set('idUser', idUser).set('idComp', idComp);
    return this.http.get<BpfResponse>(`${environment.apiUrl}/api/bpf`, { params });
  }

  saveBpf(payload: Record<string, unknown>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${environment.apiUrl}/api/bpf`, payload);
  }

  ///////////PROFIL DE PRODUCTIVITÉ (1J)
  fetchProductivite(idUser: number, idComp: number): Observable<ProductiviteResponse> {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp);
    return this.http.get<ProductiviteResponse>(`${environment.apiUrl}/api/productivite`, { params });
  }

  saveProductivite(payload: Record<string, unknown>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${environment.apiUrl}/api/productivite`, payload);
  }

  ///////////MINUTES DE RÉUNION (1B)
  fetchMinutes(idUser: number, idComp: number): Observable<MinutesList> {
    const params = new HttpParams().append('idUser', idUser).append('idComp', idComp);
    return this.http.get<MinutesList>(`${environment.apiUrl}/api/minutes`, { params });
  }

  fetchMinute(id: number): Observable<MinuteDetail> {
    return this.http.get<MinuteDetail>(`${environment.apiUrl}/api/minutes/${id}`);
  }

  /** Crée la minute (sans id) ou la modifie (avec id) */
  saveMinute(payload: MinutePayload, id?: number): Observable<{ id: number }> {
    return id
      ? this.http.put<{ id: number }>(`${environment.apiUrl}/api/minutes/${id}`, payload)
      : this.http.post<{ id: number }>(`${environment.apiUrl}/api/minutes`, payload);
  }

  deleteMinute(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/api/minutes/${id}`);
  }

}
