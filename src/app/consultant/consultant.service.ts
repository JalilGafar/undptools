import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from '../../environment/environment';
import { Company } from '../core/model/company';
import { ToolAttrib } from '../core/model/toolAttrib';
import { PrediaLabel } from '../core/model/predia_mat_label';
import { PrediaLabelJSON } from '../core/model/prediaJSON';
import { IntegLabel } from '../core/model/mat_integ_label';
import { ToolMatDiagInteg } from '../core/model/tool1D';

@Injectable({
  providedIn: 'root'
})
export class ConsultantService {

  constructor(private http: HttpClient) { };

  private _company$ = new BehaviorSubject<Company[]>([]);
  get company$(): Observable<Company[]> {
    return this._company$.asObservable()
  }

  private _ToolAttribData$ = new BehaviorSubject<ToolAttrib[]>([]);
  get ToolAttribData$(): Observable<ToolAttrib[]> {
    return this._ToolAttribData$.asObservable()
  }
  
  private _ToolMatDiagIntegData$ = new BehaviorSubject<ToolMatDiagInteg[]>([]);
  get ToolMatDiagIntegData$(): Observable<ToolMatDiagInteg[]> {
    return this._ToolMatDiagIntegData$.asObservable()
  }

  private _MatPrediaLabel$ = new BehaviorSubject<PrediaLabelJSON[]>([]);
  get MatPrediaLabel$(): Observable<PrediaLabelJSON[]> {
    return this._MatPrediaLabel$.asObservable()
  }
  
  private _MatIntegLabel$ = new BehaviorSubject<IntegLabel[]>([]);
  get MatIntegLabel$(): Observable<IntegLabel[]> {
    return this._MatIntegLabel$.asObservable()
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
    let Id = new HttpParams();
    Id = Id.append('idUser', id);
    this.http.get<Company[]>(`${environment.apiUrl}/api/consultant/companiesUser`, { params: Id }).pipe(
      tap(campus => {
        this._company$.next(campus);
        //    this.setLoadingStatus(false);
      })
    ).subscribe();
  }

  getCompanyById(id: number): Observable<Company> {
    // if (!this.lastCandidatesLoad) {
    //   this.getFormationsFromServer()
    // }
    return this.company$.pipe(
      map(company => company.filter(company => company.id === id)[0])
    );
  }

  //Add new company
  addCompany(newCompany: {
    name: string, date_creation: number, produits: string, services: string, description: string, gerant: string,
    descrt_gerant: string, nbr_employer: string, nbr_femme: string, region: string, departement: string, ville: string,
    commune: string, quartier: string, lieu: string, x: number, y: number, idUser: number
  }): Observable<Company> {
    console.log(newCompany)
    return this.http.post<Company>(`${environment.apiUrl}/api/consultant/newCompany`, newCompany);
  }


  //$$$$$$$$$$$$ TOOLS $$$$$$$$$$$$$$$$$$$

  // ************* SAVE TOOL ATRIB
  saveToolAttrib(attribForm: {
    note_1: number, comment_1: string, note_2: number, comment_2: string,
    note_3: number, comment_3: string, note_4: number, comment_4: string,
    note_5: number, comment_5: string, note_6: number, comment_6: string,
    note_7: number, comment_7: string, note_8: number, comment_8: string,
    note_9: number, comment_9: string, note_10: number, comment_10: string,
    note_11: number, comment_11: string, note_12: number, comment_12: string,
    note_13: number, comment_13: string, note_14: number, comment_14: string,
    note_15: number, comment_15: string, note_16: number, comment_16: string,
    note_17: number, comment_17: string, note_18: number, comment_18: string,
    note_19: number, comment_19: string, 
    cons_id: number, comp_id: number
  }): Observable<ToolAttrib> {
    console.log(attribForm)
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

  // ************* GET TOOL ATRIB
  getAttribDataById(idUser: number, idComp: number) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('idUser', idUser);
    queryParams = queryParams.append('idComp', idComp);
    console.log(queryParams)
    this.http.get<ToolAttrib[]>(`${environment.apiUrl}/api/tools/attribut`, { params: queryParams }).pipe(
      tap(ToolAttribData => {
        this._ToolAttribData$.next(ToolAttribData);
        //    this.setLoadingStatus(false);
      })
    ).subscribe();
  }
  
  getMatIntegDataById(idUser: number, idComp: number) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('idUser', idUser);
    queryParams = queryParams.append('idComp', idComp);
    console.log(queryParams)
    this.http.get<ToolMatDiagInteg[]>(`${environment.apiUrl}/api/tools/integral`, { params: queryParams }).pipe(
      tap(ToolAttribData => {
        this._ToolMatDiagIntegData$.next(ToolAttribData);
        //    this.setLoadingStatus(false);
      })
    ).subscribe();
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
    this.http.get<PrediaLabelJSON[]>(`${environment.apiUrl}/api/tools/matPrediaLabel`).pipe(
      tap(MatPrediaLabelData => {
        this._MatPrediaLabel$.next(MatPrediaLabelData);
        //    this.setLoadingStatus(false);
      })
    ).subscribe();
  }


  ////////////////// MATRICE INETG LABEL
  getMatIntegLabel() {    
    this.http.get<IntegLabel[]>(`${environment.apiUrl}/api/tools/matIntegLabel`).pipe(
      tap(MatPrediaLabelData => {
        this._MatIntegLabel$.next(MatPrediaLabelData);
        //    this.setLoadingStatus(false);
      })
    ).subscribe();
  }



}
