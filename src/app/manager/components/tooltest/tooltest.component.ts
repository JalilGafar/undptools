import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../../_services/storage.service';
import { ShareServiceService } from '../../../shared/share-service.service';
import { TOOL_GROUPS, ToolStatus } from '../../../shared/tools.catalog';

interface ToolCard {
  code: string;      // « 1D » (vide pour le pré-diagnostic)
  name: string;      // « Diagnostic intégral »
  label: string;     // libellé complet du catalogue
  route: string;
  status: ToolStatus;
  etape: number | null;
}

interface GroupView {
  label: string;
  icon: string;
  tools: ToolCard[];
  open: boolean;
  /** Nombre d'outils utilisables dans l'étape */
  activeCount: number;
}

/**
 * Bibliothèque des outils pour les managers et modérateurs : les outils sont présentés par étape, comme sur le tableau de bord
 * d'un consultant, et s'ouvrent directement (sans passer par le menu de navigation) en aperçu : l'outil est vierge, utilisable,
 * mais rien n'est enregistré.
 */
@Component({
  selector: 'app-tooltest',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltest.component.html',
  styleUrl: './tooltest.component.scss',
})
export class TooltestComponent implements OnDestroy {

  groups: GroupView[] = TOOL_GROUPS.map((g, index) => {
    const etape = index === 0 ? null : index;      // 0 = pré-diagnostic, puis étapes 1 à 4
    const tools = g.children.map(t => {
      const [code, ...rest] = t.label.split(' ');
      const plain = index === 0 || t.route === 't1b' || t.route.startsWith('tqw');   // pré-diagnostic et outils transversaux : pas de code
      return {
        code: plain ? '' : code,
        name: plain ? t.label : rest.join(' '),
        label: t.label, route: t.route, status: t.status, etape
      };
    });
    const activeCount = tools.filter(t => t.status === 'active').length;
    return { label: g.label, icon: g.icon, tools, open: activeCount > 0, activeCount };
  });

  constructor(
    private storageService: StorageService,
    private shareService: ShareServiceService,
    private router: Router,
  ) { }

  toggle(g: GroupView): void {
    g.open = !g.open;
  }

  /** Ouvre l'outil en aperçu : aucune entreprise n'est retenue, l'outil s'affiche vierge. */
  open(t: ToolCard): void {
    this.storageService.clearContext();
    const queryParams: Record<string, string | number> = { toolName: t.label };
    if (t.route === 't1b' && t.etape) queryParams['etape'] = t.etape;
    this.router.navigate(['/consultant/tool', t.route], { queryParams });
  }

  goBack(): void {
    history.back();
  }

  ngOnDestroy(): void {
    this.shareService.closeSidebar();
  }
}
