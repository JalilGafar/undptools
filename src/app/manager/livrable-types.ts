export interface LivrableTypeMeta {
    tool_code: string;
    label: string;
    icon: string;
}

export const LIVRABLE_TYPES: LivrableTypeMeta[] = [
    { tool_code: 'attribut', label: 'Prédiagnostic', icon: 'bi-list-check' },
    { tool_code: 't1d', label: 'Diagnostic intégral', icon: 'bi-clipboard2-data' },
];
