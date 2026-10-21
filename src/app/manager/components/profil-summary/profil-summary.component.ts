import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ManagerService } from '../../manager.service';
import { StorageService } from '../../../_services/storage.service';
import { CANAUX_VENTE, EntrepriseProfil, ProfilVente } from '../../../core/model/entreprise-profil';

type Niveau = 'secondaire' | 'universite' | 'autre';

const TYPE_ENTREPRISE: Record<string, string> = {
  familiale: 'Entreprise familiale', independante: 'Indépendante (propriétaire unique)', cooperative: 'Collective / coopérative'
};
const FACTURATION: Record<string, string> = { manuelle: 'Manuelle', electronique: 'Électronique', aucune: 'Aucune' };
const CLIENTELE: Record<string, string> = {
  grand_public: 'Grand public', particuliers: 'Particuliers (B2C)', entreprises: 'Entreprises (B2B)', autre: 'Autre'
};

/** Profil du participant (outil 1L) en lecture seule, pour les managers (onglet « Profil » de la fiche entreprise). */
@Component({
  selector: 'app-profil-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profil-summary.component.html',
  styleUrl: './profil-summary.component.scss'
})
export class ProfilSummaryComponent implements OnChanges {

  @Input({ required: true }) companyId!: number;

  readonly niveaux: { key: Niveau; label: string }[] = [
    { key: 'secondaire', label: 'Secondaire / Lycée' },
    { key: 'universite', label: 'Université' },
    { key: 'autre', label: 'Autre' },
  ];

  profil: (EntrepriseProfil & { consultant: string | null }) | null = null;
  ventes: ProfilVente[] = [];
  fx = { year: 2025, xafPerUsd: 580 };
  showUsd = false;
  isLoading = true;
  loadError = false;

  constructor(
    private managerService: ManagerService,
    private storageService: StorageService,
    private router: Router,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companyId']) this.load();
  }

  private load(): void {
    this.isLoading = true;
    this.loadError = false;
    this.managerService.fetchCompanyProfil(this.companyId).subscribe({
      next: data => {
        this.profil = data.profil;
        this.ventes = data.ventes;
        this.fx = data.fx ?? this.fx;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = true;
        this.isLoading = false;
      }
    });
  }

  // ── Libellés et calculs ─────────────────────────────────────────────────────

  yesNo(v: number | null | undefined): string {
    return v === null || v === undefined ? '—' : v ? 'Oui' : 'Non';
  }

  text(v: string | number | null | undefined): string | number {
    return v === null || v === undefined || v === '' ? '—' : v;
  }

  typeEntreprise(v: string | null): string { return v ? TYPE_ENTREPRISE[v] ?? v : '—'; }
  facturation(v: string | null): string { return v ? FACTURATION[v] ?? v : '—'; }
  clientele(v: string | null): string { return v ? CLIENTELE[v] ?? v : '—'; }

  canaux(v: string | null): string {
    const selected = (v ?? '').split(',').filter(Boolean);
    return selected.length
      ? selected.map(c => CANAUX_VENTE.find(x => x.value === c)?.label ?? c).join(', ')
      : '—';
  }

  get effectifHommes(): number | null {
    const p = this.profil;
    return p && p.effectif_total !== null ? Math.max(0, p.effectif_total - (p.effectif_femmes ?? 0)) : null;
  }

  etude(niveau: Niveau, part: 'chef' | 'femmes' | 'hommes'): number | null {
    return (this.profil as any)?.[`etude_${niveau}_${part}`] ?? null;
  }

  tousSalaries(niveau: Niveau): number | null {
    const f = this.etude(niveau, 'femmes');
    const h = this.etude(niveau, 'hommes');
    return f === null && h === null ? null : (f ?? 0) + (h ?? 0);
  }

  get totalVentesFcfa(): number {
    return this.ventes.reduce((sum, l) => sum + (Number(l.volume_fcfa) || 0), 0);
  }

  /** Montant affiché en FCFA, ou en USD au taux fixe quand l'option est activée. */
  money(fcfa: number | null | undefined): string {
    const n = Number(fcfa) || 0;
    return this.showUsd
      ? '$ ' + Math.round(n / this.fx.xafPerUsd).toLocaleString('fr-FR')
      : n.toLocaleString('fr-FR') + ' FCFA';
  }

  /** Ouvre l'outil 1L (consultation et impression) dans le contexte du consultant concerné. */
  openTool(): void {
    if (!this.profil) return;
    this.storageService.setIdComp(this.profil.comp_id);
    this.storageService.setIdConsultant(this.profil.cons_id);
    this.router.navigateByUrl('consultant/tool/t1l');
  }
}
