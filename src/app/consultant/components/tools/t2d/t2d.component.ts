import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { CommonModule } from '@angular/common';
import { BusinessModelCanvas } from '../../../../core/model/businessModelCanvas';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-t2d',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],                          
  templateUrl: './t2d.component.html',
  styleUrl: './t2d.component.scss'
})
export class T2dComponent implements OnInit, AfterViewInit, OnDestroy {
  businessModelForm!: FormGroup;

  // State management
  isFormVisible = true;
  isCanvasVisible = false;
  canvasData!: BusinessModelCanvas | null;
  canvasData$!: Observable<BusinessModelCanvas | null>

  // Component data
  consultantId!: number;
  userId!: number;
  companyId: number = 0;
  isLoading = false;
  errorMessage = '';

  // BMC section definitions
  sections = [
    {
      name: 'problemeIdentifie',
      label: 'Problem to solve',
      labelFr: 'Problème Identifié',
      icon: '❓',
      guide: 'Décrivez brièvement et clairement le problème auquel l\'entreprise est confrontée. Il est important de comprendre les problèmes que notre produit et/ou service vise à résoudre. Énumérez les trois principaux problèmes de vos clients.'
    },
    {
      name: 'customerSegments',
      label: 'Customer Segments',
      labelFr: 'Segments de clients',
      icon: '👥',
      guide: `À qui s'adresse le produit ou le service ? Quel est le public cible ? Quelles sont ses caractéristiques ?
              • Il est important de comprendre les segments de marché par sexe, origine ethnique et groupe d’âge.`
    },
    {
      name: 'but',
      label: 'Objectif',
      labelFr: 'Objectif',
      icon: '⚠️',
      guide: 'L\'objectif d\'existence de l\'entreprise. Celui-ci peut être élaboré en collaboration avec les employés, les partenaires et les segments de clientèle, puis communiqué ouvertement.'
    },
    {
      name: 'valuePropositions',
      label: 'Value Propositions',
      labelFr: 'Propositions de valeur',
      icon: '💡',
      guide: ` Définir les produits ou services à commercialiser.
                • Quelle valeur souhaitons-nous offrir aux clients/consommateurs ? Quels besoins souhaitons-nous satisfaire ? Quels sont les points faibles, les motivations et les facteurs d'achat des segments de marché identifiés, par
                sexe, origine ethnique et tranche d'âge ?
                • L'objectif de l'entreprise est de résoudre les problèmes de ses clients et de satisfaire leurs besoins à travers des propositions attractives.
                • Identifier si l’offre est innovante et présente des éléments de différenciation par rapport à la concurrence (des produits spécialisés ont-ils été développés pour les différents segments de marché identifiés ?)
                Établir comment le développement durable, la diversité, l’équité et l’inclusion impactent la proposition de valeur de l’entreprise.
                La proposition de valeur commerciale doit être définie pour chaque segment de marché identifié (en tenant compte au minimum du sexe et de la tranche d'âge)
                `
    },
    {
      name: 'mesureImpact',
      label: 'Mesure d\'Impact',
      labelFr: 'Mesure d\'Impact',
      icon: '📊',
      guide: `• Indicateurs environnementaux ou sociaux pour mesurer l’impact de l’entreprise.
              • Quels indicateurs/domaines avons-nous affectés en raison de l’impact généré par l’entreprise ?
              • Comment allons-nous obtenir les informations pour mesurer ces indicateurs ?`
    },

    {
      name: 'channels',
      label: 'Channels',
      labelFr: 'Cannaux d\'accès',
      icon: '📢',
      guide: `• Par quels médias abordons-nous la proposition de valeur ? Par quels canaux souhaitez-vous atteindre le public cible avec le produit/service ? Lesquels sont les plus efficaces ?
              • Comment différencions-nous les canaux que nous utilisons en fonction de notre segment de marché, de notre sexe, de notre origine ethnique et de notre tranche d'âge ? Existe-t-il des canaux spécialisés en fonction du sexe, de l'origine ethnique et de la tranche d'âge ?`
    },
    {
      name: 'customerRelationships',
      label: 'Customer Relationships',
      labelFr: 'Relations avec les clients',
      icon: '❤️',
      guide: `• Définir quel type de relation nous souhaitons avoir avec les segments identifiés avant, pendant et après la fourniture du service ou la vente du produit, en fonction des segments de marché, au moins par sexe et par tranche d’âge.
              • Comment allons-nous construire une relation de confiance avec eux ?
              • Comment allons-nous maintenir et assurer une communication respectueuse et inclusive avec les segments identifiés ?`
    },
    {
      name: 'revenueStreams',
      label: 'Revenue Streams',
      labelFr: 'Sources de revenus',
      icon: '💰',
      guide: `• Comment les revenus sont-ils générés ? Identifiez les sources de revenus différenciées selon le sexe, l’origine ethnique et la tranche d’âge (si possible).
              • Combien les clients sont-ils prêts à payer ? Déterminez si les produits ou services génèrent des revenus spécifiques par le biais de commissions, de promotions, de dons ou d’autres moyens, en fonction du sexe, de l’origine ethnique et de la tranche d’âge.
              • Vous pouvez définir le prix de chaque produit (au moins les plus importants).
              • Établir une politique de prix en cherchant à intégrer une perspective de genre.
              • Quelles sont les activités les plus rentables ?`
    },
    {
      name: 'keyResources',
      label: 'Key Resources',
      labelFr: 'Ressources clés',
      icon: '⚙️',
      guide: `• Quelles ressources sont essentielles pour atteindre l’objectif ? Quelles ressources sont nécessaires pour mettre en œuvre la proposition de valeur ?
              • Identifier si des ressources spécifiques sont requises en fonction du sexe, de l’origine ethnique et du groupe d’âge, telles que des ressources tangibles, des ressources intangibles (basées sur les connaissances, la
              formation, l’information, entre autres), la technologie, etc.`
    },
    {
      name: 'keyActivities',
      label: 'Key Activities',
      labelFr: 'Activités clés',
      icon: '🎯',
      guide: `• Mesures à prendre pour concrétiser la proposition de valeur. Quelles activités clés sont nécessaires à la réalisation de la proposition de valeur ?
              • Identifier comment gérer les activités d’égalité organisationnelle avec responsabilité partagée et prévention de la violence dans l’entreprise.
              • Déterminer si la sensibilisation à l’égalité des sexes est pertinente pour atteindre le modèle d’entreprise.
              • Établir si la formation des femmes dirigeantes est pertinente pour atteindre le modèle d’entreprise.
              • Identifier comment l’intégration travail-famille impacte la réalisation du modèle d’affaires.`
    },
    {
      name: 'keyPartnerships',
      label: 'Key Partnerships',
      labelFr: 'Partenariats clés',
      icon: '🤝',
      guide: `Au sein de la chaîne de valeur dans laquelle évolue l'entreprise, qui sont les principales parties prenantes ? Identifier les synergies et collaborations potentielles qui faciliteront la mise en œuvre des activités.
              • Déterminer si la gestion d’une chaîne de valeur (en particulier des fournisseurs) axée sur l’égalité des sexes et la durabilité sont des facteurs déterminants dans le modèle économique.
              • L’entreprise peut-elle établir des alliances ou des partenariats avec des entreprises détenues par des femmes ou d’autres entreprises durables ?
              • Identifier les alliés clés, qui comprennent des organisations ou des groupes d’intérêt différenciés par sexe, origine ethnique ou groupe d’âge, car ils peuvent améliorer le modèle commercial et l’approche de l’égalité et de l’inclusion.`
    },
    {
      name: 'costStructure',
      label: 'Cost Structure',
      labelFr: 'Structure de coûts',
      icon: '💸',
      guide: `• Quels sont les principaux coûts commerciaux ?
              • Combien coûtent les activités que nous devons faire ?
              • Quelles sont les ressources nécessaires ? Quantifier les coûts fixes et variables.
              • Identifier l’impact sur la structure des coûts de la gestion d’un modèle d’affaires durable et inclusif.
              • Identifier les coûts liés aux salaires, au bien-être, à la santé et à la sécurité sociale dans la gestion du modèle économique. Existe-t-il un plan visant à rémunérer équitablement les hommes et les femmes pour les mêmes tâches et responsabilités au sein de l'entreprise ?`
    }
  ];

  private destroy$ = new Subject<void>();

  private popovers: any[] = [];

  constructor(
    private fb: FormBuilder,
    private consultantService: ConsultantService,
    private toolService: ConsultantService,
    private storageService: StorageService
  ) {}

  
  ngOnInit(): void {
    this.consultantId = this.storageService.ConsultantId;
    this.userId = this.storageService.getUser().id

    // this.toolService.clearBusinessModelCanvas();
    if (this.consultantId == 0) {
      this.toolService.getBusinessModelCanvasById(this.storageService.getUser().id, this.storageService.CompanyId);
    } else {
      this.toolService.getBusinessModelCanvasById(this.consultantId, this.storageService.CompanyId);
    }

    this.canvasData$ = this.toolService.BusinessModelCanvas$

    // this.toolService.BusinessModelCanvas$.pipe(
    //   tap(data => {
    //     console.log(data)
    //   this.canvasData = data;})
    // ).subscribe();

    this.initializeIds();
    this.buildForm();
  }

  ngAfterViewInit(): void {
    const bootstrap = (window as any).bootstrap;
    if (typeof bootstrap === 'undefined') {
      return;
    }

    const popoverTargets = document.querySelectorAll('[data-bs-toggle="popover"]');
    this.popovers = Array.from(popoverTargets).map((target) => {
      const trigger = target.getAttribute('data-bs-trigger') || 'click';
      return new bootstrap.Popover(target, { trigger });
    });
  }

  ngOnDestroy(): void {
    // this.popovers.forEach(popover => popover.dispose());
    // this.popovers = [];
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeIds(): void {
    try {
      const user = this.storageService.getUser();
      this.consultantId = user?.id || 0;

      const company = this.storageService.CompanyId;
      this.companyId = company;
    } catch (error) {
      console.error('Error initializing IDs:', error);
      this.errorMessage = 'Failed to load user or company information';
    }
  }

private buildForm(): void {
  const formControls: any = {};

  // Build form controls for each section (3 inputs per section)
  // Only first input (input 1) is required, inputs 2 and 3 are optional
  this.sections.forEach(section => {
    for (let i = 1; i <= 3; i++) {
      const controlName = `${section.name}${i}`;
      // First input required, others optional
      formControls[controlName] = i === 1 ? ['', Validators.required] : [''];
    }
  });

  this.businessModelForm = this.fb.group(formControls);
}

onSubmit(): void {
    if (this.businessModelForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.businessModelForm.value;

    // Create BusinessModelCanvas object from form
    const bmcData: BusinessModelCanvas = {
      id: 0,
      cons_id: this.userId,
      comp_id: this.companyId,
      customerSegments1: formValue.customerSegments1,
      customerSegments2: formValue.customerSegments2,
      customerSegments3: formValue.customerSegments3,
      valuePropositions1: formValue.valuePropositions1,
      valuePropositions2: formValue.valuePropositions2,
      valuePropositions3: formValue.valuePropositions3,
      channels1: formValue.channels1,
      channels2: formValue.channels2,
      channels3: formValue.channels3,
      but1: formValue.but1,
      but2: formValue.but2,
      but3: formValue.but3,
      mesureImpact1: formValue.mesureImpact1,
      mesureImpact2: formValue.mesureImpact2,
      mesureImpact3: formValue.mesureImpact3,
      problemeIdentifie1: formValue.problemeIdentifie1,
      problemeIdentifie2: formValue.problemeIdentifie2,
      problemeIdentifie3: formValue.problemeIdentifie3,
      customerRelationships1: formValue.customerRelationships1,
      customerRelationships2: formValue.customerRelationships2,
      customerRelationships3: formValue.customerRelationships3,
      revenueStreams1: formValue.revenueStreams1,
      revenueStreams2: formValue.revenueStreams2,
      revenueStreams3: formValue.revenueStreams3,
      keyResources1: formValue.keyResources1,
      keyResources2: formValue.keyResources2,
      keyResources3: formValue.keyResources3,
      keyActivities1: formValue.keyActivities1,
      keyActivities2: formValue.keyActivities2,
      keyActivities3: formValue.keyActivities3,
      keyPartnerships1: formValue.keyPartnerships1,
      keyPartnerships2: formValue.keyPartnerships2,
      keyPartnerships3: formValue.keyPartnerships3,
      costStructure1: formValue.costStructure1,
      costStructure2: formValue.costStructure2,
      costStructure3: formValue.costStructure3,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to backend
    this.consultantService.saveBusinessModelCanvas(bmcData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.canvasData = bmcData;
          this.isFormVisible = false;
          this.isCanvasVisible = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error saving Business Model Canvas:', error);
          this.errorMessage = 'Failed to save Business Model Canvas. Please try again.';
          this.isLoading = false;
        }
      });
  }

  onNewCanvas(): void {
    // Reset form and show form view again
    this.businessModelForm.reset();
    this.isFormVisible = true;
    this.isCanvasVisible = false;
    this.canvasData = null;
    this.errorMessage = '';
  }

  onPrint(): void {
    window.print();
  }

  // Helper method to get items for a section
getSectionItems(sectionName: string, source: BusinessModelCanvas | null ): string[] {
    // if (!source) return [];

    const item1 = (source as any)[`${sectionName}1`];
    const item2 = (source as any)[`${sectionName}2`];
    const item3 = (source as any)[`${sectionName}3`];
    return [item1, item2, item3].filter(item => item && item.trim() !== '');
  }

  // Get section data for display
  getSection(sectionName: string) {
    return this.sections.find(s => s.name === sectionName);
  }
}
