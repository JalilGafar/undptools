export interface LivrableTypeMeta {
    tool_code: string;
    label: string;
    icon: string;
}

export const LIVRABLE_TYPES: LivrableTypeMeta[] = [
    { tool_code: 'attribut', label: 'Prédiagnostic', icon: 'bi-list-check' },
    { tool_code: 't1b', label: 'Minutes de réunion', icon: 'bi-journal-text' },
    { tool_code: 't1d', label: 'Diagnostic Général', icon: 'bi-clipboard2-data' },
    { tool_code: 't1ea', label: 'Diagnostic BPF', icon: 'bi-clipboard2-check' },
    { tool_code: 't1l', label: "Profil des participants", icon: 'bi-person-vcard' },
    { tool_code: 't1g', label: 'Cartographie des clients', icon: 'bi-diagram-3' },
    { tool_code: 't1j', label: "Profil de productivité de l'entreprise", icon: 'bi-speedometer2' },
    { tool_code: 't1k', label: "Diagnostic d'image commerciale", icon: 'bi-brush' },
    { tool_code: 't3h', label: 'Analyse financière', icon: 'bi-calculator' },
    { tool_code: 't5s', label: 'Outil 5S – initial', icon: 'bi-stars' },
    { tool_code: 't5sf', label: 'Outil 5S – final', icon: 'bi-stars' },
    { tool_code: 'tse', label: 'Suivi et évaluation – initial', icon: 'bi-graph-up-arrow' },
    { tool_code: 'tsef', label: 'Suivi et évaluation – final', icon: 'bi-graph-up-arrow' },
    { tool_code: 'tqw', label: 'Registre des Quick Wins', icon: 'bi-lightning-charge' },
];

/** Adresse de la page d'un livrable. Pour 1B, chaque livrable est une minute : on l'ouvre directement. */
export const livrableUrl = (toolCode: string, itemId: number): string =>
    'consultant/tool/' + toolCode + (toolCode === 't1b' ? '?minute=' + itemId : '');

/** Livrable de la liste des managers, éventuellement regroupé (registre des Quick Wins : un seul pour toutes les étapes) */
export interface QwGroupInfo {
    /** Type de livrable affiché : « tqw » pour le registre des Quick Wins regroupé */
    group?: string;
    /** Étapes (1 à 4) dont le registre existe */
    etapes?: number[];
}

/** Type de livrable (carte) auquel appartient un livrable : le registre des Quick Wins de toute étape est de type « tqw ». */
export const groupOf = (l: { tool_code: string; group?: string }): string =>
    l.group ?? (l.tool_code.startsWith('tqw') ? 'tqw' : l.tool_code);

/**
 * Le registre des Quick Wins est un outil transversal : un registre par étape en base, mais un seul registre à l'écran
 * pour les managers et modérateurs, par entreprise et par consultant. Les registres des étapes (tqw1 à tqw4) sont regroupés
 * en une ligne qui s'ouvre sur la première étape renseignée ; les autres étapes s'atteignent depuis la page du registre.
 */
export function mergeQuickWins<T extends { tool_code: string; comp_id: number; cons_id?: number; id_livrable: number; livrable: string; date: string; updated_at?: string }>(
    items: T[]
): (T & QwGroupInfo)[] {
    const groups = new Map<string, (T & QwGroupInfo)[]>();
    const out: (T & QwGroupInfo)[] = [];
    for (const item of items) {
        if (!/^tqw[1-4]$/.test(item.tool_code)) { out.push(item); continue; }
        const key = item.comp_id + '-' + (item.cons_id ?? 0);
        let list = groups.get(key);
        if (!list) {
            list = [];
            groups.set(key, list);
            out.push({ ...item, group: 'tqw' });   // remplacé ci-dessous, à la place de la première occurrence
        }
        list.push(item);
    }
    return out.map(item => {
        if (item.group !== 'tqw') return item;
        const list = [...groups.get(item.comp_id + '-' + (item.cons_id ?? 0))!].sort((a, b) => a.tool_code.localeCompare(b.tool_code));
        const etapes = list.map(l => Number(l.tool_code.slice(3)));
        const first = list[0];
        return {
            ...first,
            group: 'tqw',
            etapes,
            livrable: 'Registre des Quick Wins (étape' + (etapes.length > 1 ? 's ' : ' ') + etapes.join(', ') + ')',
            date: list.map(l => l.date).sort()[0],
            updated_at: list.map(l => l.updated_at ?? '').sort().slice(-1)[0] || first.updated_at
        };
    });
}
