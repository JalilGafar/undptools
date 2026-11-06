/** Outil 1K « Diagnostic d'image commerciale », tel que renvoyé par GET /api/image-commerciale. */

export type Existe = 'oui' | 'non' | 'partiellement';
/** Valeurs enregistrées (« moyenne » s'affiche « Passable ») */
export type Situation = 'bonne' | 'moyenne' | 'mediocre' | 'non_applicable';

/** Un des 11 éléments d'image commerciale évalués */
export interface ImageElement {
  element: number;
  existe: Existe | null;
  situation: Situation | null;
  besoin: boolean | null;
  observations: string | null;
}

export interface ImageCommercialeResponse {
  data: { id: number; remarques_generales: string | null; updated_at: string } | null;
  elements: ImageElement[];
  company: { id: number; name: string } | null;
  consultant: { username: string } | null;
}

/** Les éléments évalués, par section (numérotation de la fiche papier) */
export const IMAGE_SECTIONS: { title: string; icon: string; elements: { id: number; label: string }[] }[] = [
  {
    title: 'Identité de marque et supports visuels', icon: 'bi-palette',
    elements: [
      { id: 1, label: 'Logo et charte graphique' },
      { id: 2, label: 'Cartes de visite' },
      { id: 3, label: 'Catalogue de produits / services' },
      { id: 4, label: 'Étiquettes de produits' },
      { id: 5, label: 'Emballage ou conditionnement' },
      { id: 6, label: 'Enseigne ou signalétique de magasin' },
      { id: 7, label: 'Signalétique opérationnelle et de sécurité' },
    ]
  },
  {
    title: 'Présence numérique', icon: 'bi-globe2',
    elements: [
      { id: 8, label: 'Profil sur les réseaux sociaux' },
      { id: 9, label: 'Photos professionnelles des produits' },
      { id: 10, label: 'Modèles de publications sur les réseaux sociaux' },
      { id: 11, label: "E-mail d'entreprise" },
    ]
  }
];
