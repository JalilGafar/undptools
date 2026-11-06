/** Outil 5S « Mise en œuvre des 5S pour les PME » : contenu de la fiche et formes échangées avec GET /api/cinq-s. */

export type Statut5S = 'a_faire' | 'en_cours' | 'termine';
export type PhotoSlot = 'avant' | 'apres';
/** Deux évaluations par entreprise : initiale (étape 1) et finale (étape 4), sur la même fiche */
export type Phase5S = 'initial' | 'final';

export interface Note5S {
  s: number;
  critere: number;
  note: number | null;
  observations: string | null;
}

export interface Action5S {
  s: number | null;
  probleme: string | null;
  action: string | null;
  date_limite: string | null;
  statut: Statut5S | null;
  resultat: string | null;
}

/** Photo avant / après d'une évaluation 5S (plusieurs par emplacement, avec une légende) */
export interface Photo5S {
  id: number;
  slot: PhotoSlot;
  legend: string | null;
  created_at: string;
}

export interface Cinq5SResponse {
  data: { id: number; responsable: string | null; date_evaluation: string | null; updated_at: string } | null;
  notes: Note5S[];
  actions: Action5S[];
  company: { id: number; name: string } | null;
  consultant: { username: string } | null;
}

/** Échelle d'évaluation (1 à 5) */
export const NIVEAUX_5S: { note: number; label: string; description: string }[] = [
  { note: 1, label: 'Insuffisant', description: "Aucune pratique n'existe. Situation critique nécessitant une action immédiate." },
  { note: 2, label: 'À améliorer', description: 'La pratique existe, mais nécessite des améliorations significatives.' },
  { note: 3, label: 'Suffisant', description: 'La pratique est appliquée de façon régulière, mais peut encore être améliorée.' },
  { note: 4, label: 'Bon', description: "La pratique est bien établie, avec quelques possibilités d'amélioration mineures." },
  { note: 5, label: 'Excellent', description: 'Pratique exemplaire, pérenne et documentée.' },
];

export const STATUTS_5S: { value: Statut5S; label: string }[] = [
  { value: 'a_faire', label: 'À faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminé' },
];

export const MODE_EMPLOI_5S: string[] = [
  "Pour chaque critère, sélectionnez une note (1 = Insuffisant → 5 = Excellent).",
  "Le score est calculé automatiquement : le panneau des résultats affiche le résultat global par S.",
  "Utilisez la colonne « Observations » pour consigner des constatations spécifiques, des éléments probants ou les actions requises.",
  "Avant de procéder à l'évaluation, délimitez une zone spécifique, de préférence celle où se déroulent les opérations. Évaluez uniquement cet espace : si vous essayez d'évaluer l'ensemble de l'entreprise d'un seul coup, les résultats seront trop généraux pour pouvoir donner lieu à des actions concrètes.",
  "Si, en répondant à une question, la réponse honnête est « nous n'y avons jamais réfléchi », attribuez-lui la note 1 : il s'agit d'une information précieuse, et non d'un échec.",
];

export const RECOMMANDATION_5S =
  "Commencez toujours par SEIRI. Une entreprise qui fait le tri entre l'essentiel et le superflu se crée un espace physique et mental lui permettant de mettre en œuvre le reste des « S » avec plus de facilité et de pérennité.";

export interface Critere5S {
  text: string;
  /** Questions suggérées pour guider l'évaluation (une ou plusieurs phrases) */
  questions: string;
}

export interface Section5S {
  s: number;
  name: string;
  translation: string;
  objective: string;
  criteres: Critere5S[];
}

export const SECTIONS_5S: Section5S[] = [
  {
    s: 1, name: 'Seiri', translation: 'Trier',
    objective: "Séparer ce qui est strictement nécessaire de ce qui ne l'est pas. Retirer de la zone de travail tout objet, matériel ou équipement non utilisé dans les opérations en cours.",
    criteres: [
      { text: "Les matériaux, outils et équipements présents dans la zone sont identifiés et classés en deux catégories : les éléments nécessaires et les éléments superflus.",
        questions: "L'opérateur sait-il exactement ce dont il a besoin pour son travail quotidien ? Demandez à l'opérateur de citer 3 articles qu'il utilise tous les jours et 3 dont il ne se souvient pas avoir utilisé au cours du dernier mois. S'il ne parvient pas à les distinguer facilement, il y a du travail à faire à ce niveau." },
      { text: "Aucun article obsolète, endommagé ou superflu ne s'est accumulé dans la zone de travail ou l'entrepôt.",
        questions: "Vérifiez les coins, les étagères et les allées. Y a-t-il des cartons, des équipements ou des matériaux dont l'utilité n'est pas identifiable ?" },
      { text: "La technique de l'« étiquette rouge » ou un autre système est utilisé pour marquer et éliminer les articles inutiles.",
        questions: "Y a-t-il une décision consciente quant à ce qui doit être conservé et ce qui doit être éliminé, ou tout s'accumule-t-il simplement « au cas où » ?" },
      { text: "Les articles superflus identifiés font l'objet d'une décision claire quant à leur sort : vente, don, recyclage ou mise au rebut.",
        questions: "Existe-t-il un registre de l'élimination ou du retrait des matériaux inutiles ?" },
      { text: "La zone de production/service permet une circulation fluide des personnes, sans obstacle ni risque.",
        questions: "Peut-on traverser cette zone sans devoir esquiver des objets qui n'ont rien à y faire ?" },
      { text: "La direction encourage activement l'élimination des objets inutiles au sein de l'équipe.",
        questions: "La dernière fois qu'un objet inutile a été jeté ou vendu, s'agissait-il d'une décision planifiée ou était-ce simplement parce qu'il n'y avait plus de place ? Des séances de tri sont-elles organisées régulièrement ? La direction y participe-t-elle ?" },
    ]
  },
  {
    s: 2, name: 'Seiton', translation: "Mettre de l'ordre",
    objective: "Attribuer un emplacement spécifique à chaque objet nécessaire. « Une place pour chaque chose et chaque chose à sa place ». Cela facilite la recherche, l'utilisation et le rangement des objets sans perte de temps.",
    criteres: [
      { text: "Chaque outil, chaque consommable et chaque équipement dispose d'un emplacement fixe et clairement défini (marqué, étiqueté ou délimité).",
        questions: "Un nouvel employé peut-il trouver un objet sans avoir à demander ?" },
      { text: "Les objets sont placés en fonction de leur fréquence d'utilisation : les plus utilisés sont les plus proches de l'opérateur.",
        questions: "Vérifiez si le travailleur effectue des mouvements inutiles ou de longs trajets." },
      { text: "Les zones de travail, les allées, les zones de stockage et les issues de secours sont délimitées visuellement.",
        questions: "Existe-t-il des lignes au sol, des panneaux ou des signaux permettant d'organiser l'espace ?" },
      { text: "Les stocks de matières premières et de fournitures sont soumis à des quantités minimales et maximales définies (contrôle visuel).",
        questions: "Existe-t-il un système (étiquette, tableau) indiquant quand réapprovisionner les stocks ? Comment savez-vous quand commander davantage de matières premières ou de fournitures ? Si la réponse est « quand il n'y en a plus » ou « quand quelqu'un s'en rend compte », il n'y a pas de contrôle visuel." },
      { text: "Le système d'organisation est maintenu même en cas de rotation du personnel ou pendant les périodes de forte demande.",
        questions: "L'organisation se maintient-elle sans dépendre d'une seule personne ?" },
      { text: "Les documents, registres et dossiers numériques/physiques ont une structure organisationnelle définie et connue de tous.",
        questions: "Tout employé peut-il trouver un document ou un dossier sans aide ?" },
    ]
  },
  {
    s: 3, name: 'Seiso', translation: 'Nettoyer',
    objective: "Nettoyer et inspecter le lieu de travail. Le nettoyage permet de mettre au jour des problèmes cachés (fuites, usure, défaillances). Une PME propre fonctionne avec plus de sécurité et de qualité.",
    criteres: [
      { text: "Des routines de nettoyage bien définies existent (qui, quoi, quand et avec quoi) pour chaque zone et chaque équipement.",
        questions: "Qui nettoie, quand et avec quoi ? Existe-t-il un planning de nettoyage écrit ou visible, aussi simple soit-il ?" },
      { text: "Les opérateurs effectuent le nettoyage et l'inspection de base de leurs propres machines et outils.",
        questions: "Les opérateurs nettoient-ils leurs propres machines ? Considèrent-ils cela comme faisant partie de leur rôle ? Le nettoyage est-il la tâche de tous ou uniquement celle du personnel d'entretien ?" },
      { text: "Le nettoyage sert d'outil d'inspection : les fuites, l'usure ou les défaillances sont détectées lors du nettoyage.",
        questions: "Les constatations (lubrification, pièces desserrées, taches) sont-elles consignées pendant le nettoyage ?" },
      { text: "Les locaux (sols, murs, fenêtres, éclairage) sont maintenus dans un état acceptable.",
        questions: "L'aspect des locaux inspire-t-il confiance aux clients et aux fournisseurs ?" },
      { text: "Les équipements et les installations font l'objet d'un programme de maintenance préventive de base documenté et respecté.",
        questions: "Existe-t-il un calendrier d'entretien ? Est-il respecté régulièrement ?" },
      { text: "Les produits de nettoyage et d'hygiène nécessaires sont disponibles en quantité suffisante et facilement accessibles.",
        questions: "Les employés disposent-ils de tout ce dont ils ont besoin pour maintenir leur espace de travail propre ?" },
    ]
  },
  {
    s: 4, name: 'Seiketsu', translation: 'Standardiser',
    objective: "Ancrer les trois premiers S dans les habitudes grâce à des normes visuelles et des procédures simples. Sans standardisation, les acquis de Seiri, Seiton et Seiso se perdent avec le temps.",
    criteres: [
      { text: "Il existe des procédures ou des instructions visuelles simples (photos, schémas) qui standardisent les trois premiers S.",
        questions: "Y a-t-il des affiches, des fiches ou des listes de contrôle visibles indiquant la norme attendue ? Si un nouvel employé commençait demain, comment saurait-il à quoi doit ressembler son espace de travail en fin de journée ?" },
      { text: "Le personnel connaît et est capable de décrire la norme d'ordre et de propreté attendue dans son espace de travail.",
        questions: "Si vous demandez à un opérateur « à quoi doit ressembler votre zone à la fin de votre service ? », est-il capable de répondre ?" },
      { text: "Des audits ou des contrôles périodiques (même informels) sont menés pour vérifier le respect des normes.",
        questions: "Existe-t-il un contrôle visuel hebdomadaire ou mensuel, ou un registre de l'état de la zone ?" },
      { text: "Les normes sont mises à jour lorsque les processus, les équipements ou les produits changent.",
        questions: "Les procédures sont-elles obsolètes ou reflètent-elles la réalité actuelle ?" },
      { text: "Les conditions de sécurité, l'hygiène personnelle et les EPI sont intégrés aux normes de travail.",
        questions: "Les employés utilisent-ils les équipements de protection de manière systématique et correcte ?" },
      { text: "La direction vérifie régulièrement le respect des normes et intervient lorsque des écarts sont détectés.",
        questions: "Existe-t-il un mécanisme de retour d'information entre la direction et l'équipe ?" },
    ]
  },
  {
    s: 5, name: 'Shitsuke', translation: 'Pérenniser',
    objective: "Maintenir et améliorer en permanence les normes établies. La discipline fait des 5S une culture d'entreprise, et non un projet ponctuel. Cela implique de la formation, des audits et l'engagement de la direction.",
    criteres: [
      { text: "La direction montre l'exemple en matière de respect des 5S (elle respecte l'ordre, nettoie, trie).",
        questions: "Le propriétaire/responsable donne-t-il l'exemple des comportements qu'il exige de son équipe ?" },
      { text: "Le personnel a suivi une formation sur ce qu'est la méthode 5S et sur son importance pour l'entreprise.",
        questions: "Un employé est-il capable d'expliquer brièvement ce que signifie chaque « S » ?" },
      { text: "Il existe un système de reconnaissance ou de retours positifs lorsque les 5S sont respectées.",
        questions: "Les réussites sont-elles célébrées ? Existe-t-il une forme d'incitation, même symbolique ?" },
      { text: "Les nouveaux employés suivent une formation d'initiation aux 5S dans le cadre de leur intégration dans l'entreprise.",
        questions: "Le protocole d'intégration comprend-il une formation sur l'ordre, la propreté et l'organisation ?" },
      { text: "Les résultats des audits 5S sont partagés avec l'équipe et utilisés pour améliorer les pratiques.",
        questions: "L'équipe comprend-elle le fonctionnement du système et sait-elle ce qu'il faut améliorer ?" },
      { text: "La méthode 5S est perçue par le personnel comme faisant partie intégrante de la culture d'entreprise, et non comme une charge supplémentaire.",
        questions: "Demandez de manière informelle à l'équipe : considère-t-elle la méthode 5S comme une contrainte ou comme sa façon de travailler ?" },
    ]
  },
];
