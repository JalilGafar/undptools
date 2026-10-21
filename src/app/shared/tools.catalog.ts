/**
 * Catalogue des outils du programme : source unique du menu « Tools » (en-tête) et de l'état de chaque outil.
 *
 * Statut :
 *  - 'active' : l'outil est utilisable et enregistre ses données (pastille verte dans le menu) ;
 *  - 'soon'   : pas encore disponible ou incomplet ; la ligne est grisée mais reste cliquable et mène à la page
 *               « en construction » (ou à l'écran provisoire de l'outil).
 *
 * Pour activer un outil : passer son `status` à 'active' ici, et vérifier que sa route
 * (consultant-routing.module.ts) pointe vers le vrai composant.
 */
export type ToolStatus = 'active' | 'soon';

export interface ToolItem {
  label: string;
  route: string;
  status: ToolStatus;
}

export interface ToolGroup {
  label: string;
  icon: string;
  children: ToolItem[];
}

export const TOOL_GROUPS: ToolGroup[] = [
  {
    label: 'Pré-diagnostic',
    icon: 'bi-0-circle-fill',
    children: [
      { label: "matrice de critères et d'attributs", route: 'attribut', status: 'active' },
    ]
  },
  {
    label: "L'offre et la demande",
    icon: 'bi-1-circle-fill',
    children: [
      { label: '1A Rapport Final - Étape 1', route: 't1a', status: 'soon' },
      { label: '1B Minutes de réunion', route: 't1b', status: 'soon' },            // écran présent, enregistrement à brancher
      { label: '1C Suivi des activités', route: 't1c', status: 'soon' },           // modification des tâches (PUT) à implémenter
      { label: '1D Diagnostic intégral', route: 't1d', status: 'active' },
      { label: '1E_a Diagnostic BPF', route: 't1ea', status: 'soon' },
      { label: '1E_b Diagnostic BPA', route: 't1eb', status: 'soon' },
      { label: '1F Rapport sur la capacité de production', route: 't1f', status: 'soon' },
      { label: '1G Cartographie des clients', route: 't1g', status: 'active' },
      { label: "1H Photos de l'entreprise", route: 't1h', status: 'active' },
      { label: '1i Ligne de base - Capture initiale', route: 't1i', status: 'soon' },
      { label: "1L Profil d'informations", route: 't1l', status: 'active' },
    ]
  },
  {
    label: "Modèle d'Affaires",
    icon: 'bi-2-circle-fill',
    children: [
      { label: '2A Rapport Final', route: 't2a', status: 'soon' },
      { label: '2B Minutes de réunion', route: 't1b', status: 'soon' },            // réutilise l'écran 1B
      { label: '2C Suivi des activités', route: 't2c', status: 'soon' },
      { label: '2D Business modèle CANVAS impact', route: 't2d', status: 'active' },
      { label: "2E Matrice du Plan d'Amélioration", route: 't2e', status: 'soon' },
      { label: '2F Désignation du Responsable GYB', route: 't2f', status: 'soon' },
      { label: '2G Demande de Matériel', route: 't2g', status: 'soon' },
    ]
  },
  {
    label: 'Renforcement des capacités',
    icon: 'bi-3-circle-fill',
    children: [
      { label: '3A Rapport Final', route: 'onbuild', status: 'soon' },
      { label: '3B Minutes de réunion', route: 'onbuild', status: 'soon' },
      { label: '3C Suivi des activités', route: 'onbuild', status: 'soon' },
      { label: '3D Rapport de Formation', route: 'onbuild', status: 'soon' },
      { label: '3E Cartographie des institutions de soutien', route: 'onbuild', status: 'soon' },
      { label: '3G SyECFo_Evaluation des fournisseurs', route: 'onbuild', status: 'soon' },
      { label: '3H Analyse financière basique', route: 'onbuild', status: 'soon' },
    ]
  },
  {
    label: "Renforcement de l'Entreprise",
    icon: 'bi-4-circle-fill',
    children: [
      { label: '4A Rapport Final', route: 'onbuild', status: 'soon' },
      { label: '4B Minutes de réunion', route: 'onbuild', status: 'soon' },
      { label: '4C Suivi des activités', route: 'onbuild', status: 'soon' },
      { label: '4D Rapport de Formation', route: 'onbuild', status: 'soon' },
      { label: "4E Intérêt d'achat-vente des participants-clients", route: 'onbuild', status: 'soon' },
      { label: '4F Plan de travail détaillé (GANTT)', route: 'onbuild', status: 'soon' },
      { label: '4G Fiche projet', route: 'onbuild', status: 'soon' },
    ]
  },
  {
    label: 'Promotion des relations commerciales',
    icon: 'bi-5-circle-fill',
    children: [
      { label: '5A Rapport Final', route: 'onbuild', status: 'soon' },
      { label: '5B Minutes de réunion', route: 'onbuild', status: 'soon' },
      { label: '5C Suivi des activités', route: 'onbuild', status: 'soon' },
      { label: "5D Intérêt d'achat-vente des participants-clients", route: 'onbuild', status: 'soon' },
      { label: '5E Ligne de base - Capture finale', route: 'onbuild', status: 'soon' },
      { label: '5F Formulaire de livraison de matériel', route: 'onbuild', status: 'soon' },
      { label: "5G Photos de l'entreprise", route: 'onbuild', status: 'soon' },
      { label: '5H Évaluation du programme', route: 'onbuild', status: 'soon' },
    ]
  },
];
