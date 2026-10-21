export type ImageCategory = 'entreprise' | 'personnel' | 'produits' | 'locaux' | 'autre';
export type ImageStage = 'initiale' | 'finale';

export const IMAGE_CATEGORIES: { value: ImageCategory; label: string; icon: string }[] = [
  { value: 'entreprise', label: 'Entreprise',  icon: 'bi-building' },
  { value: 'personnel',  label: 'Personnel',   icon: 'bi-people' },
  { value: 'produits',   label: 'Produits',    icon: 'bi-box-seam' },
  { value: 'locaux',     label: 'Locaux',      icon: 'bi-shop' },
  { value: 'autre',      label: 'Autre',       icon: 'bi-image' },
];

export const IMAGE_STAGES: { value: ImageStage; label: string }[] = [
  { value: 'initiale', label: 'Situation initiale' },
  { value: 'finale',   label: 'Situation finale' },
];

export class CompanyImage {
  id!: number;
  comp_id!: number;
  category!: ImageCategory;
  stage!: ImageStage;
  legend!: string | null;
  uploaded_by!: number;
  created_at!: string;
}

export class CompanyGallery {
  images!: CompanyImage[];
  canWrite!: boolean;
  canDelete!: boolean;
}
