import { BpfCategory } from './bpf';

/**
 * Contenu de la liste de contrôle « Conformité aux BPF » (classeur BPF-Diagnostic_fr-FR.xlsx) : 9 catégories, 92 exigences, 666 points au total.
 * Un identifiant interne (id, de 1 à 92) est enregistré avec chaque réponse : il ne change jamais, même si le numéro affiché (num) est corrigé.
 * Le maximum de chaque exigence est aussi dans BackUndp/app/routes/bpf.routes.js (BPF_MAX) : toute modification doit être faite aux deux endroits.
 *
 * Corrections par rapport au classeur : numérotation (deux exigences 1.7.10 : la catégorie 7 va maintenant de 1.7.1 à 1.7.12), fautes (« Procéder », « ne présentent-ils pas »).
 * La consigne de 1.3.4 (température de la chambre froide) s'arrête, dans le classeur, sur « appliquez les critères suivants : » sans critères : elle est omise (guide à null) en attendant le texte du PNUD.
 */
export const BPF_CATEGORIES: BpfCategory[] = [
  {
    id: 1, name: "Sécurité alimentaire", icon: 'bi-shield-check',
    items: [
      { id: 1, num: '1.1.1', max: 10, text: "Du personnel est-il affecté à la supervision des activités de nettoyage et de désinfection ?", guide: "Question directe ; s'il n'y a pas de personne désignée, la note est de zéro." },
      { id: 2, num: '1.1.2', max: 15, text: "Toutes les substances chimiques (pesticides, détergents, lubrifiants, etc.) sont-elles stockées correctement ?", guide: "« Stockées correctement » signifie : il existe un entrepôt ou un lieu spécifique et séparé où les produits chimiques sont stockés." },
      { id: 3, num: '1.1.3', max: 10, text: "Présence de panneaux indiquant la conformité aux BPF ?", guide: "La signalisation doit inclure des panneaux dans les zones suivantes : stockage des produits finis, stockage des produits chimiques et des substances dangereuses, entrées du personnel, sorties du personnel, zones de transformation, bureaux, stations de lavage des mains, chambre froide, utilisation d’équipements de protection, interdiction de fumer ou de manger dans les zones de travail, trousse de premiers secours, signalisation des pièges, toilettes du personnel, poubelles, etc." },
    ]
  },
  {
    id: 2, name: "Lutte contre les nuisibles", icon: 'bi-bug',
    items: [
      { id: 4, num: '1.2.1', max: 15, text: "Les produits et les ingrédients sont-ils exempts d’insectes, de rongeurs, d’oiseaux ou de tout signe de leur présence ?", guide: "Observation directe lors de l’inspection de contrôle de l’usine de transformation. Prendre des photos à titre de preuve." },
      { id: 5, num: '1.2.2', max: 15, text: "Les matériaux d’emballage sont-ils exempts d’insectes, de rongeurs, d’oiseaux ou de toute trace de leur présence ?", guide: null },
      { id: 6, num: '1.2.3', max: 10, text: "L'usine, l'entrepôt, etc. sont-ils exempts d'insectes, de rongeurs, d'oiseaux ou de toute trace de leur présence ?", guide: null },
      { id: 7, num: '1.2.4', max: 10, text: "Les pièges de lutte contre les nuisibles sont-ils placés à distance des produits alimentaires ?", guide: "Les pièges doivent être situés à au moins 3 mètres des zones de transformation ; ils doivent être étiquetés afin d’éviter tout dommage causé par les équipements ou d’empêcher le placement d’objets dans cette zone ; ils doivent être lisibles afin que les personnes respectent l’avertissement de danger et ne touchent pas les pièges. Ils doivent également être placés à l’extérieur de l’usine de transformation." },
      { id: 8, num: '1.2.5', max: 5, text: "Les pièges de lutte contre les nuisibles sont-ils maintenus propres et en bon état ?", guide: "Conformément à la réglementation, les pièges de lutte contre les nuisibles doivent être munis d’une étiquette. Celle-ci a pour but d’indiquer leur emplacement et leur numéro d’identification dans le plan de répartition ; elle doit également comporter des informations sur le niveau de risque du dispositif installé ainsi que des données de suivi (dates de mise en place et nom de la personne ayant effectué la vérification). La fréquence de contrôle doit être comprise entre 15 et 30 jours." },
      { id: 9, num: '1.2.6', max: 5, text: "Le nombre et l’emplacement des pièges à rongeurs à l’intérieur et à l’extérieur sont-ils adéquats ?", guide: "Une distance de 10 mètres doit être respectée entre chaque piège à l’extérieur, et de 5 mètres à l’intérieur." },
      { id: 10, num: '1.2.7', max: 5, text: "Existe-t-il un plan indiquant l’emplacement des pièges extérieurs et intérieurs ?", guide: "Il doit exister un plan indiquant l’emplacement des pièges, à l’intérieur et à l’extérieur de l’usine de transformation." },
      { id: 11, num: '1.2.8', max: 5, text: "Les pièges appâtés sont-ils correctement placés sur le périmètre de l’usine et correctement numérotés ?", guide: "Les pièges situés sur le périmètre extérieur de l'usine doivent être numérotés et contenir un appât (du poison)." },
      { id: 12, num: '1.2.9', max: 5, text: "Les zones adjacentes sont-elles exemptes de rongeurs, d’oiseaux, etc. ?", guide: "Observation directe lors de l’inspection de contrôle de l’usine de transformation. Prendre des photos à titre de preuve." },
    ]
  },
  {
    id: 3, name: "Stockage et conditionnement", icon: 'bi-box-seam',
    items: [
      { id: 13, num: '1.3.1', max: 10, text: "Les produits et les matériaux d'emballage sont exempts de poussière, de condensation, etc.", guide: "Les entrepôts ou lieux de stockage des produits et des matériaux d'emballage doivent faire l'objet d'une vérification et d'une surveillance personnelles afin de s'assurer qu'ils ne contiennent ni poussière ni saleté." },
      { id: 14, num: '1.3.2', max: 10, text: "Les produits et les matériaux d’emballage sont-ils stockés de manière à éviter toute contamination croisée ?", guide: "Les produits et les matériaux d’emballage doivent être stockés. La contamination croisée se produit lorsque des agents pathogènes se transmettent d’une surface à une autre, ou d’une surface à un aliment, provoquant ainsi des maladies." },
      { id: 15, num: '1.3.3', max: 10, text: "Le stockage au sein des installations est-il exclusivement réservé aux produits alimentaires ?", guide: "Veillez à ce qu’il n’y ait pas, dans les zones de transformation, de produits autres que les denrées alimentaires en cours de fabrication." },
      { id: 16, num: '1.3.4', max: 10, text: "La température de la chambre froide est-elle appropriée ?", guide: null },
      { id: 17, num: '1.3.5', max: 10, text: "Les étagères sont-elles conçues pour permettre l'écoulement de l'eau et une bonne circulation de l'air ?", guide: null },
      { id: 18, num: '1.3.6', max: 10, text: "Tous les produits et ingrédients (y compris la glace, le cas échéant) sont-ils intacts et exempts de tout signe de décomposition ou de putréfaction ?", guide: null },
      { id: 19, num: '1.3.7', max: 10, text: "Les matériaux d'emballage sont-ils correctement stockés et recouverts ?", guide: "Les matériaux d'emballage doivent être entreposés dans un endroit séparé, de préférence recouverts d'un film plastique afin d'éviter toute contamination." },
      { id: 20, num: '1.3.8', max: 10, text: "Les produits rejetés ou mis en attente sont-ils séparés de la production normale et correctement identifiés ?", guide: "Si des produits ont été rejetés par les clients, ceux-ci doivent être identifiés dans une zone distincte. S'il n'y a pas de produits rejetés, ce point ne s'applique pas." },
      { id: 21, num: '1.3.9', max: 10, text: "La zone de stockage est-elle propre ?", guide: "Effectuez une évaluation visuelle en fonction du niveau de propreté de la zone. Attribuez une note estimative." },
      { id: 22, num: '1.3.10', max: 10, text: "Les véhicules de transport interne sont-ils propres et en bon état sanitaire ?", guide: "Effectuez une évaluation visuelle en fonction du niveau de propreté des véhicules. Attribuez une note estimative." },
      { id: 23, num: '1.3.11', max: 10, text: "La production quotidienne est-elle clairement identifiée par un code de production ?", guide: "Le code doit être clairement visible. Absence de code = non-conformité." },
      { id: 24, num: '1.3.12', max: 10, text: "Les matériaux d'emballage sont-ils correctement marqués avec la date de réception et les informations de traçabilité ?", guide: "Aucune preuve visuelle de conformité à ce point." },
      { id: 25, num: '1.3.13', max: 10, text: "Les produits, les matériaux d’emballage et les ingrédients (le cas échéant) sont-ils gérés selon le principe «premier entré, premier sorti» (FIFO) ?", guide: "Preuve documentaire attestant que les produits respectent la règle du « premier entré, premier sorti » (FIFO)." },
    ]
  },
  {
    id: 4, name: "Pratiques opérationnelles", icon: 'bi-gear',
    items: [
      { id: 26, num: '1.4.1', max: 15, text: "Le matériel de transformation est-il propre et en bon état sanitaire ?", guide: "Procéder à une évaluation visuelle en fonction du niveau de propreté des équipements. Attribuer une note estimative." },
      { id: 27, num: '1.4.2', max: 10, text: "Le matériel de conservation et de stockage est-il maintenu propre ?", guide: "Procéder à une évaluation visuelle en fonction du niveau de propreté des équipements de stockage. Attribuez une note estimative." },
      { id: 28, num: '1.4.3', max: 10, text: "Existe-t-il une protection contre les contaminants dans les zones où le produit est exposé ?", guide: "Vérifiez visuellement si le produit est protégé afin d’éviter toute contamination éventuelle." },
      { id: 29, num: '1.4.4', max: 3, text: "L'espace disponible est-il suffisant pour effectuer correctement les opérations d'emballage et de nettoyage ?", guide: "Les espaces opérationnels doivent permettre une circulation adéquate des travailleurs dans l'usine de transformation." },
      { id: 30, num: '1.4.5', max: 3, text: "La zone de conditionnement est-elle séparée de la zone de stockage et de l'extérieur ?", guide: "Vérifiez visuellement que les zones de conditionnement et de stockage sont séparées." },
      { id: 31, num: '1.4.6', max: 10, text: "Le produit destiné à être retraité est-il manipulé correctement ?", guide: "Les produits retraités sont manipulés sur les mêmes lignes de transformation que les produits normaux." },
      { id: 32, num: '1.4.7', max: 5, text: "Les ingrédients sont-ils contrôlés avant utilisation ?", guide: "Il doit exister des preuves documentaires (registres) portant la signature du responsable." },
      { id: 33, num: '1.4.8', max: 10, text: "Des lavabos sont-ils disponibles là où cela est nécessaire ?", guide: "Il doit y avoir au minimum des points de lavage des mains dans les zones suivantes : à la sortie des toilettes, dans les zones de manipulation des matières premières et des produits finis, à l'entrée de l'usine de transformation. Attribuez une note estimative." },
      { id: 34, num: '1.4.9', max: 5, text: "Des stations de désinfection des mains sont-elles prévues là où cela est nécessaire ?", guide: "La désinfection des mains s'effectue généralement aux mêmes postes de lavage. Attribuez une note estimative." },
      { id: 35, num: '1.4.10', max: 3, text: "Des stations de désinfection des chaussures sont-elles prévues là où cela est nécessaire ?", guide: "Ils doivent être présents au moins à l'entrée de l'usine de transformation." },
    ]
  },
  {
    id: 5, name: "Pratiques en matière de personnel", icon: 'bi-people',
    items: [
      { id: 36, num: '1.5.1', max: 10, text: "Les employés se lavent-ils les mains avant de commencer leur travail et chaque fois qu’ils quittent leur poste de travail ?", guide: "Présence de consignes affichées à un endroit visible." },
      { id: 37, num: '1.5.2', max: 10, text: "Les employés présentant des coupures ouvertes ou infectées sont-ils écartés de la chaîne de conditionnement ?", guide: "Présence de consignes affichées à un endroit visible." },
      { id: 38, num: '1.5.3', max: 5, text: "Les employés utilisent-ils les stations de lavage et de désinfection des mains ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 39, num: '1.5.4', max: 5, text: "Les employés portent-ils des filets à cheveux et des caches-barbe (le cas échéant) ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 40, num: '1.5.5', max: 3, text: "Les employés ne portent-ils pas de bijoux (à l'exception de l'alliance) ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 41, num: '1.5.6', max: 5, text: "Des équipements de protection individuelle sont-ils fournis au personnel, par exemple des gants, des tabliers ou des uniformes ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 42, num: '1.5.7', max: 5, text: "Pendant les pauses, les employés laissent-ils leurs uniformes (ou tabliers) dans la zone de conditionnement ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 43, num: '1.5.8', max: 5, text: "Existe-t-il une zone désignée pour déposer les uniformes, gants, etc. pendant les pauses ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 44, num: '1.5.9', max: 3, text: "La consommation de boissons, de nourriture et le tabagisme sont-ils limités à des zones désignées ?", guide: "Preuves visuelles lors de l’inspection de l’usine. Panneaux." },
      { id: 45, num: '1.5.10', max: 3, text: "Les employés ne gardent-ils ni ne transportent-ils d’objets dans les poches supérieures de leur uniforme ou de leur tablier ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
    ]
  },
  {
    id: 6, name: "Équipements", icon: 'bi-tools',
    items: [
      { id: 46, num: '1.6.1', max: 10, text: "La conception et l'état des équipements facilitent-ils le nettoyage et l'entretien, par exemple grâce à des surfaces lisses ?", guide: "Équipements conçus avec des surfaces lisses pour faciliter le nettoyage. Preuves visuelles. Attribuer une note." },
      { id: 47, num: '1.6.2', max: 10, text: "L'équipement est-il exempt de peinture et d'autres matériaux tels que du ruban adhésif, etc. ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 48, num: '1.6.3', max: 10, text: "L'équipement est-il exempt de rouille ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 49, num: '1.6.4', max: 5, text: "L'équipement est-il fabriqué avec des matériaux autorisés pour le contact direct avec les aliments ?", guide: "Équipements en acier inoxydable." },
      { id: 50, num: '1.6.5', max: 5, text: "L'établissement a-t-il éliminé l'utilisation du bois dans les équipements et sur les surfaces ?", guide: "Aucun équipement en bois n’a été observé lors de l’inspection." },
      { id: 51, num: '1.6.6', max: 5, text: "Les surfaces en contact direct avec le produit sont-elles exemptes de corrosion ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 52, num: '1.6.7', max: 5, text: "Les lubrifiants utilisés sont-ils homologués pour une utilisation dans les usines agroalimentaires ; sont-ils de qualité alimentaire ?", guide: "Inspection des fiches techniques des produits." },
      { id: 53, num: '1.6.8', max: 5, text: "Des thermomètres sont-ils installés dans les chambres froides et les congélateurs ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 54, num: '1.6.9', max: 10, text: "Les thermomètres ne sont-ils pas en verre et ne contiennent-ils pas de mercure ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 55, num: '1.6.10', max: 5, text: "L'utilisation de cordes, de fils métalliques et de carton est-elle évitée lors des réparations provisoires ?", guide: "Constat visuel lors de l'inspection de l'usine." },
    ]
  },
  {
    id: 7, name: "Entretien et nettoyage des équipements", icon: 'bi-droplet-half',
    items: [
      { id: 56, num: '1.7.1', max: 15, text: "Lors du nettoyage, les produits et les matériaux d'emballage sont-ils correctement protégés ?", guide: "Preuve visuelle lors de l'inspection ; de préférence recouverts de plastique pour éviter toute contamination." },
      { id: 57, num: '1.7.2', max: 10, text: "Les filtres (à air et à eau), les treillis métalliques, etc. sont-ils maintenus propres ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 58, num: '1.7.3', max: 10, text: "Les rideaux à lanières des chambres froides et des congélateurs sont-ils propres ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 59, num: '1.7.4', max: 10, text: "Les groupes frigorifiques sont-ils démontés au moins une fois par an pour le nettoyage et l'entretien ?", guide: "Des preuves documentaires (registres) doivent être fournies." },
      { id: 60, num: '1.7.5', max: 5, text: "Les grilles de protection des ventilateurs sont-elles propres et exemptes de poussière ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 61, num: '1.7.6', max: 5, text: "Le matériel qui n’est pas utilisé quotidiennement est-il maintenu propre et entreposé de manière à protéger les surfaces en contact avec les produits ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 62, num: '1.7.7', max: 10, text: "Les outils, ustensiles et équipements non utilisés sont-ils correctement rangés afin d’éviter toute contamination ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 63, num: '1.7.8', max: 5, text: "Les produits chimiques de nettoyage et les désinfectants sont-ils correctement étiquetés ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 64, num: '1.7.9', max: 3, text: "Seuls les produits chimiques nécessaires sont-ils stockés dans l'usine ?", guide: "Preuves visuelles lors de l'inspection de l'usine. Attribuer une note estimative. Vérifier lors de l'inspection qu'il n'y a pas d'excès de produits chimiques." },
      { id: 65, num: '1.7.10', max: 5, text: "Dispose-t-on des moyens nécessaires pour mesurer la concentration de l'agent désinfectant, c'est-à-dire des bandelettes réactives, des kits ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 66, num: '1.7.11', max: 10, text: "Les surfaces qui ne sont pas en contact direct avec les produits sont-elles propres ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 67, num: '1.7.12', max: 5, text: "L'excès de graisse et de lubrifiants est-il éliminé des équipements ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
    ]
  },
  {
    id: 8, name: "Nettoyage général", icon: 'bi-trash3',
    items: [
      { id: 68, num: '1.8.1', max: 10, text: "Les déversements sont-ils nettoyés immédiatement ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 69, num: '1.8.2', max: 5, text: "Les déchets et les ordures sont-ils évacués fréquemment des zones de stockage et de conditionnement ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 70, num: '1.8.3', max: 5, text: "L'espace sous les rayonnages de stockage est-il maintenu propre ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 71, num: '1.8.4', max: 5, text: "Les siphons de sol sont-ils propres ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 72, num: '1.8.5', max: 5, text: "Les rideaux à lanières en plastique sont-ils propres et en bon état ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 73, num: '1.8.6', max: 5, text: "Dispose-t-on d'un équipement de nettoyage adéquat pour effectuer le nettoyage général ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 74, num: '1.8.7', max: 5, text: "Le matériel de nettoyage est-il rangé à l'écart de la zone d'emballage ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 75, num: '1.8.8', max: 10, text: "Les toilettes et les lavabos sont-ils propres et équipés de serviettes en papier, de papier toilette, etc. ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 76, num: '1.8.9', max: 5, text: "Les vestiaires et les espaces de restauration sont-ils propres ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 77, num: '1.8.10', max: 3, text: "La zone d'entretien est-elle propre et bien organisée ?", guide: "Constat visuel lors de l'inspection de l'usine." },
    ]
  },
  {
    id: 9, name: "Bâtiments et installations", icon: 'bi-building',
    items: [
      { id: 78, num: '1.9.1', max: 15, text: "Les lampes suspendues dans la zone de conditionnement et là où les produits sont exposés sont-elles dotées d’une protection adéquate ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 79, num: '1.9.2', max: 5, text: "Les zones de conditionnement et de stockage sont-elles correctement éclairées ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 80, num: '1.9.3', max: 3, text: "La ventilation est-elle suffisante pour évacuer la poussière, la vapeur d’eau et les odeurs ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 81, num: '1.9.4', max: 5, text: "Les portes donnant sur l'extérieur empêchent-elles l'accès des insectes et des rongeurs ?", guide: "Vérifiez la disposition et les matériaux des portes lors de l'inspection. Contrôle visuel." },
      { id: 82, num: '1.9.5', max: 5, text: "Les sols sont-ils en bon état ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 83, num: '1.9.6', max: 5, text: "Les murs extérieurs sont-ils exempts de trous ou de fentes susceptibles d'abriter des oiseaux, des rongeurs ou des insectes ?", guide: "Preuve visuelle lors de l’inspection de l’usine. Attribuez une note estimative." },
      { id: 84, num: '1.9.7', max: 5, text: "Les murs et les plafonds ne présentent-ils pas de fissures ou de fentes susceptibles de favoriser la présence d’insectes ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 85, num: '1.9.8', max: 5, text: "Un périmètre de 45 cm est-il respecté dans la zone de stockage et un espace de 35 cm est-il maintenu entre les palettes ou les rayonnages ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 86, num: '1.9.9', max: 5, text: "Les espaces extérieurs sont-ils bien rangés et ne présentent-ils pas de déchets ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 87, num: '1.9.10', max: 3, text: "N'y a-t-il aucune trace de mauvaises herbes ou de buissons dans les zones extérieures ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 88, num: '1.9.11', max: 3, text: "N'y a-t-il pas d'eau stagnante à l'extérieur ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 89, num: '1.9.12', max: 5, text: "Existe-t-il des procédures pour le stockage correct des palettes, du matériel, des pneus, etc. (emplacement de stockage, empilage, etc.) ?", guide: "Fiche d'instructions." },
      { id: 90, num: '1.9.13', max: 3, text: "Les zones autour des conteneurs à déchets sont-elles maintenues propres ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 91, num: '1.9.14', max: 5, text: "Les conteneurs et bacs à ordures sont-ils couverts ?", guide: "Constat visuel lors de l'inspection de l'usine." },
      { id: 92, num: '1.9.15', max: 5, text: "Y a-t-il des caniveaux dans toutes les zones qui nécessitent un nettoyage adéquat ?", guide: "Constat visuel lors de l'inspection de l'usine." },
    ]
  },
];
