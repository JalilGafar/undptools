-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: localhost    Database: undptools
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `mat_predia_crev`
--

DROP TABLE IF EXISTS `mat_predia_crev`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mat_predia_crev` (
  `id_att` int NOT NULL AUTO_INCREMENT,
  `critere` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poids_critere` int DEFAULT NULL,
  `attribut` varchar(450) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poids_attribut` int DEFAULT NULL,
  PRIMARY KEY (`id_att`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mat_predia_crev`
--

LOCK TABLES `mat_predia_crev` WRITE;
/*!40000 ALTER TABLE `mat_predia_crev` DISABLE KEYS */;
INSERT INTO `mat_predia_crev` VALUES (1,'Ressources oppérationelles disponible ',25,'Équipements et installations disponibles pour maintenir les opérations.',30),(2,'Ressources oppérationelles disponible ',25,'Nombre d\'employés',40),(3,'Ressources oppérationelles disponible ',25,'Disponibilité des fonds personnels pour l\'opération',30),(4,'Compétences techniques',20,'Gestion d\'entreprise',30),(5,'Compétences techniques',20,'Expérience technique	',35),(6,'Compétences techniques',20,'Expérience dans les affaires',35),(7,'Potentiel de l\'entreprise',20,'L\'entreprise opère depuis les 2 dernières années, est active et est prête à se développer',30),(8,'Potentiel de l\'entreprise',20,'L\'entreprise a une liste de clients',30),(9,'Potentiel de l\'entreprise',20,'Potentiel de valeur ajoutée	',40),(10,'Marketing',25,'Canaux de vente',50),(11,'Marketing',25,'Stratégies commerciales	',50),(12,'Stratégie du PNUD',10,'Inclusion de genre',50),(13,'Stratégie du PNUD',10,'Secteur stratégique	',50);
/*!40000 ALTER TABLE `mat_predia_crev` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mat_predia_crev_note`
--

DROP TABLE IF EXISTS `mat_predia_crev_note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mat_predia_crev_note` (
  `attr_id` int NOT NULL AUTO_INCREMENT,
  `cons_id` int DEFAULT NULL,
  `comp_id` int DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `note_1` decimal(10,0) DEFAULT NULL,
  `comment_1` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_2` decimal(10,0) DEFAULT NULL,
  `comment_2` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_3` decimal(10,0) DEFAULT NULL,
  `comment_3` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_4` decimal(10,0) DEFAULT NULL,
  `comment_4` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_5` decimal(10,0) DEFAULT NULL,
  `comment_5` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_6` decimal(10,0) DEFAULT NULL,
  `comment_6` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_7` decimal(10,0) DEFAULT NULL,
  `comment_7` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_8` decimal(10,0) DEFAULT NULL,
  `comment_8` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_9` decimal(10,0) DEFAULT NULL,
  `comment_9` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_10` decimal(10,0) DEFAULT NULL,
  `comment_10` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_11` decimal(10,0) DEFAULT NULL,
  `comment_11` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_12` decimal(10,0) DEFAULT NULL,
  `comment_12` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_13` decimal(10,0) DEFAULT NULL,
  `comment_13` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note_14` decimal(10,0) DEFAULT NULL,
  `comment_14` mediumtext COLLATE utf8mb4_unicode_ci,
  `note_15` decimal(10,0) DEFAULT NULL,
  `comment_15` mediumtext COLLATE utf8mb4_unicode_ci,
  `note_16` decimal(10,0) DEFAULT NULL,
  `comment_16` mediumtext COLLATE utf8mb4_unicode_ci,
  `note_17` decimal(10,0) DEFAULT NULL,
  `comment_17` mediumtext COLLATE utf8mb4_unicode_ci,
  `note_18` decimal(10,0) DEFAULT NULL,
  `comment_18` mediumtext COLLATE utf8mb4_unicode_ci,
  `note_19` decimal(10,0) DEFAULT NULL,
  `comment_19` mediumtext COLLATE utf8mb4_unicode_ci,
  `tab_name` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tab_label` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`attr_id`),
  UNIQUE KEY `unique_cons_comp` (`cons_id`,`comp_id`),
  KEY `cons_id_fk_idx` (`cons_id`),
  KEY `comp_id_fk_idx` (`comp_id`),
  CONSTRAINT `comp_id_fk` FOREIGN KEY (`comp_id`) REFERENCES `entreprises` (`id`),
  CONSTRAINT `cons_id_fk` FOREIGN KEY (`cons_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mat_predia_crev_note`
--

LOCK TABLES `mat_predia_crev_note` WRITE;
/*!40000 ALTER TABLE `mat_predia_crev_note` DISABLE KEYS */;
/*!40000 ALTER TABLE `mat_predia_crev_note` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matrice_prediagnostic`
--

DROP TABLE IF EXISTS `matrice_prediagnostic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matrice_prediagnostic` (
  `id_predia` int NOT NULL AUTO_INCREMENT,
  `critere` mediumtext,
  `reper` int DEFAULT NULL,
  `attribut` mediumtext,
  `question` tinytext,
  `children` json DEFAULT NULL,
  PRIMARY KEY (`id_predia`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matrice_prediagnostic`
--

LOCK TABLES `matrice_prediagnostic` WRITE;
/*!40000 ALTER TABLE `matrice_prediagnostic` DISABLE KEYS */;
INSERT INTO `matrice_prediagnostic` VALUES (1,'Ressource opérationelles disponibles',2,'Équipements et installations disponibles pour maintenir les opérations','Pourriez-vous me montrer les installations où votre entreprise fonctionne et expliquer quel type d\'équipement vous utilisez pour produire, vendre ou délivrer vos services ?','[{\"label\": \"L\'entreprise n\'a pas d\'installations, ses processus sont réalisés de manière non professionnelle.\", \"plage\": \"0\"}, {\"label\": \"Bien que l\'entreprise ait des équipements de base pour ses processus, les installations sont insuffisantes et inappropriées pour ses opérations.\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise dispose d\'installations avec des équipements de base pour ses services de production/vente.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise dispose d\'une usine/bureau, d\'équipements professionnels et de technologies pour la production et la vente ; équipements de transport et de logistique.\", \"plage\": \"10\"}]'),(2,'Ressource opérationelles disponibles',1,'Nombre d\'employés','Combien de personnes travaillent actuellement régulièrement dans votre entreprise ?','[{\"label\": \"L\'entreprise compte entre 1-5 employés\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise compte entre 6-20 employés\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise compte entre 21-100 employés\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise compte plus de 100 employés\", \"plage\": \"10\"}]'),(3,'Ressource opérationelles disponibles',3,'Disponibilité des fond personnels pour l\'opération','Au cours des 12 derniers mois, l\'entreprise a-t-elle pu couvrir ses dépenses avec ses propres revenus ou avez-vous (ou d\'autres) dû injecter de l\'argent supplémentaire pour la maintenir en activité ?','[{\"label\": \"L\'entreprise a de graves problèmes de fonds de roulement.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise a des fonds, mais pas suffisamment pour couvrir les dépenses d\'exploitation.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise a des fonds propres pour l\'investissement et/ou le réinvestissement.\", \"plage\": \"10\"}]'),(5,'Compétences techniques',5,'Gestion d\'entreprise','Parlez-moi de votre expérience dans la gestion d\'entreprises. Depuis combien de temps prenez-vous ce genre de responsabilité ? Avez-vous suivi une formation ou une éducation liée à l\'entreprise ou à la gestion ?','[{\"label\": \"Le propriétaire (ou le directeur général) a moins de 2 ans d\'expérience, aucun diplôme professionnel et n\'a pas reçu de formation en gestion d\'entreprise.\", \"plage\": \"0\"}, {\"label\": \"Le propriétaire (ou le directeur général) a de 2 à 5 ans d\'expérience dans la gestion d\'une entreprise, mais sans diplôme pertinent ni formation formelle en gestion d\'entreprise. Les compétences sont principalement acquises par la pratique.\", \"plage\": \"5\"}, {\"label\": \"Le propriétaire (ou le directeur général) a de 5 à 10 ans d\'expérience en gestion d\'entreprise ou un diplôme de baccalauréat ou de master dans un domaine lié à l\'entreprise. Une certaine formation informelle ou en cours d\'emploi peut être présente.\", \"plage\": \"7\"}, {\"label\": \"Le propriétaire (ou le directeur général) a plus de 10 ans d\'expérience dans la gestion d\'une entreprise dans le même secteur ou un secteur connexe et a reçu une formation spécialisée en gestion d\'entreprise (quel que soit le diplôme académique).\", \"plage\": \"10\"}]'),(6,'Compétences techniques',6,'Expérience technique (Capacité collective)','Qui dans votre équipe possède les connaissances techniques sur le fonctionnement de l\'entreprise ? Comment les a-t-il apprises - par des études, des formations ou principalement par l\'expérience ?','[{\"label\": \"L\'entreprise manque de personnel ayant une formation formelle, des diplômes techniques ou une expérience spécifique au secteur. Les connaissances techniques sont limitées et principalement informelles.\", \"plage\": \"0\"}, {\"label\": \"Le personnel ne dispose d\'aucune formation technique formelle ou informelle, mais compte sur un personnel ayant de l\'expérience pratique acquise dans des emplois précédents dans le même secteur.\", \"plage\": \"5\"}, {\"label\": \"Le personnel de l\'entreprise est techniquement compétent, avec de l\'expérience pertinente et une formation spécialisée — souvent informelle — bien que l\'entreprise n\'ait pas de diplômes formels.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise dispose d\'un personnel technique diplômé ayant suivi une formation spécialisée directement liée à ses activités principales.\", \"plage\": \"10\"}]'),(8,'Potentiel de l\'entreprise',7,'Croissance de l\'entreprise (basée sur 2022 comme année de référence)','Depuis 2022, comment vos ventes ont-elles évolué ? Diriez-vous qu\'elles ont augmenté, sont restées à peu près égales ou ont diminué ? Envisagez-vous une expansion ?','[{\"label\": \"L\'entreprise a connu une croissance de moins de 5% de ses ventes totales depuis 2022 ou a montré des signes de stagnation.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise a connu une croissance de 5 à 25% de ses ventes totales depuis 2022. Le potentiel de croissance existe, mais l\'entreprise est encore en phase de consolidation.\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise a connu une croissance de 25 à 50% de ses ventes totales depuis 2022. Les opérations sont stables et l\'expansion est envisagée.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise a connu une croissance de plus de 50% de ses ventes totales depuis 2022. Elle est active et a l\'intention claire de se développer.\", \"plage\": \"10\"}]'),(9,'Potentiel de l\'entreprise',8,'Dossiers d\'entreprise (Registres d\'affaires)','Tenez-vous des registres de vos activités commerciales, comme les ventes, les dépenses ou les clients ? Comment les gérez-vous ? Pourriez-vous me montrer un exemple ?','[{\"label\": \"L\'entreprise ne tient aucun registre structuré de ses opérations. Toutes les informations opérationnelles sont non documentées ou basées sur la mémoire.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise tient des registres de base ou incohérents, couvrant un seul domaine ou conservant des notes sporadiques (par exemple, reçus, suivis verbaux).\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise tient des registres informels ou partiels, tels que des carnets manuscrits ou des notes sur téléphone mobile, couvrant au moins deux domaines opérationnels (par exemple, ventes et coûts).\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise tient des registres formels, complets et à jour des ventes, des coûts et des données clients à l\'aide de tableurs, de logiciels de comptabilité ou de registres physiques.\", \"plage\": \"10\"}]'),(10,'Potentiel de l\'entreprise',9,'Potentiel de valeur ajoutée','Qu\'est-ce qui rend votre produit ou service différent des autres ? Avez-vous ajouté des améliorations, telles que l\'emballage, la transformation, des services supplémentaires ou une présence numérique ?','[{\"label\": \"Le produit ou service est brut, de base ou non différencié, sans transformation visible, emballage ou valeur structurée. Aucune certification ou amélioration intentionnelle n\'est évidente.\", \"plage\": \"0\"}, {\"label\": \"Le produit ou service comprend des améliorations de base, telles que le nettoyage, une présentation de base ou des améliorations informelles. L\'offre reste largement générique.\", \"plage\": \"5\"}, {\"label\": \"Le produit ou service comprend des caractéristiques à valeur ajoutée modérée, telles que l\'emballage, une transformation de base, une présence numérique ou des éléments de service structurés (par exemple, des itinéraires planifiés dans le tourisme). Différenciation par rapport à la concurrence.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise offre un produit ou service avec des éléments de valeur ajoutée clairs et importants, tels que des transformations, des regroupements, des marques ou des certifications reconnues (par exemple, biologique, durabilité, labels de qualité tourisme). Forte différenciation évidente.\", \"plage\": \"10\"}]'),(11,'Marketing',10,'Compréhension du marché et focalisation sur le client','Que recherchent principalement vos clients lorsqu\'ils achètent votre produit ou service ? Avez-vous apporté des changements à ce que vous proposez pour répondre à ces besoins ?','[{\"label\": \"L\'entreprise ne montre aucune connaissance de ses clients ou de la manière de les atteindre. Aucune adaptation aux besoins des clients.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise offre des produits/services sans clairement cibler ou adapter aux segments de clients. Les décisions sont principalement basées sur des hypothèses internes.\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise a une idée générale de ses clients et ajuste certains aspects de son offre, mais manque de connaissance formelle ou cohérente des besoins des clients.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise identifie clairement ses clients cibles et adapte son offre (conception, expérience, prix, emballage, etc.) en fonction de leurs préférences. Il y a des preuves de retours clients ou de connaissance du marché.\", \"plage\": \"10\"}]'),(12,'Marketing',11,'Promotion et visibilité','Que faites-vous pour vous assurer que les gens savent que votre entreprise existe et apprennent ce que vous proposez ?','[{\"label\": \"L\'entreprise ne promeut activement ses produits ou services de quelque manière que ce soit.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise se base principalement sur le bouche-à-oreille, avec des promotions occasionnelles ou incohérentes.\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise utilise régulièrement une ou deux méthodes de promotion (par exemple, Facebook, WhatsApp, dépliants, foires locales), mais sans stratégie claire.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise utilise plusieurs méthodes de promotion efficaces (par exemple, les réseaux sociaux, la signalétique, les partenariats, les événements locaux) adaptées à ses clients et à son secteur.\", \"plage\": \"10\"}]'),(13,'Stratégie du PNUD',13,'Inclusion de genre','Combien de femmes travaillent actuellement dans l\'entreprise ? Quels rôles occupent-elles principalement ?','[{\"label\": \"L\'entreprise a moins de 30% de femmes parmi ses employés et les femmes ne sont pas impliquées dans la prise de décision ou les rôles de leadership.\", \"plage\": \"0\"}, {\"label\": \"Les femmes sont présentes dans la main-d\'œuvre, mais principalement dans des rôles de soutien ou informels. L\'entreprise a entre 49% et 30% de femmes parmi ses employés.\", \"plage\": \"5\"}, {\"label\": \"Les femmes sont impliquées dans la prise de décision ou occupent des rôles stratégiques au sein de l\'entreprise. Alternativement, au moins 50% des employés sont des femmes.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise est dirigée ou co-dirigée par une femme et soutient activement les femmes.\", \"plage\": \"10\"}]'),(14,'Stratégie du PNUD',17,'Secteur stratégique','Dans quelle mesure l’entreprise est-elle alignée avec les priorités et initiatives gouvernementales ?','[{\"label\": \"L\'entreprise n\'opère pas dans les secteurs ou en ligne avec les initiatives prioritaires gouvernementales.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise est en ligne avec au moins une initiative prioritaire gouvernementale.\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise est en ligne avec plusieurs initiatives prioritaires gouvernementales.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise est parfaitement alignée avec les priorités gouvernementales.\", \"plage\": \"10\"}]'),(15,'Ressource opérationelles disponibles',4,'Disponibilité de fonds externes pour l\'opération','Avez-vous utilisé ou essayé d\'accéder à des fonds externes, comme des prêts, une aide familiale ou un financement formel ?','[{\"label\": \"L\'entreprise a de graves problèmes de fonds de roulement et n\'a jamais eu accès à un financement externe.\", \"plage\": \"0\"}, {\"label\": \"Les fonds propres ne suffisent pas à couvrir toutes les dépenses opérationnelles. L\'entreprise a peu ou une seule expérience de financement externe,\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise peut couvrir ses opérations avec des fonds internes, mais n\'a aucune réserve ni flexibilité. La trésorerie est tendue et le réinvestissement impossible. Elle a déjà accédé à des financements externes (p. ex. prêts ou programmes de soutien), mais pas régulièrement.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise dispose de fonds propres suffisants pour ses opérations courantes et ses investissements ou réinvestissements futurs\", \"plage\": \"10\"}]'),(16,'Marketing',12,'Pratiques de vente et gestion des relations','Après qu\'un client ait acheté chez vous, faites-vous quelque chose pour rester en contact ou l\'encourager à revenir ? Comment gérez-vous votre relation avec vos clients ?','[{\"label\": \"Pas de pratiques de vente ou de gestion des relations clients actives. L\'entreprise attend simplement que les clients reviennent.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise gère les ventes de manière réactive; peu d\'efforts pour établir ou fidéliser les clients.\", \"plage\": \"5\"}, {\"label\": \"Il y a un engagement occasionnel, comme répondre à des messages ou un suivi informel, mais aucune stratégie claire.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise a des pratiques de vente et de gestion des relations définies, telles que le suivi, les listes de clients, les incitations à la fidélité ou la gestion active des retours.\", \"plage\": \"10\"}]'),(17,'Stratégie du PNUD',14,'Inclusion des jeunes','Avez-vous des personnes de moins de 35 ans travaillant dans l\'entreprise ? Combien et quels types de rôles occupent-elles ?','[{\"label\": \"L\'entreprise a moins de 30% de participation des jeunes, et les jeunes ne sont pas impliqués dans la prise de décision ou les rôles de leadership.\", \"plage\": \"0\"}, {\"label\": \"Les jeunes sont présents dans la main-d\'œuvre, mais principalement dans des rôles de soutien ou informels. Ils représentent 30% à 49% de l\'équipe.\", \"plage\": \"5\"}, {\"label\": \"Les jeunes sont activement impliqués dans les opérations de l\'entreprise, occupent des rôles formels et contribuent aux activités clés. Au moins 50% de l\'équipe a moins de 35 ans.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise est dirigée ou co-dirigée par une personne jeune (moins de 35 ans).\", \"plage\": \"10\"}]'),(18,'Stratégie du PNUD',15,'Inclusion des personnes handicapées','Y a-t-il des personnes en situation de handicap travaillant dans l\'entreprise ou impliquées dans les opérations ? Combien et quels types de tâches accomplissent-elles ?','[{\"label\": \"L\'entreprise n\'a aucune inclusion des personnes en situation de handicap sous quelque forme que ce soit et ne montre aucune prise de conscience ou intention d\'intégrer des pratiques liées au handicap.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise n\'inclut actuellement pas de personnes en situation de handicap, mais montre une ouverture ou une volonté de le faire.\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise emploie ou travaille avec des personnes en situation de handicap dans ses opérations, ou adapte ses produits/services pour inclure des clients handicapés. L\'inclusion est présente mais non formalisée.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise emploie ou est dirigée/co-dirigée par une personne en situation de handicap et a pris des mesures concrètes pour garantir l\'inclusion, telles que l\'adaptation des tâches, des infrastructures, etc.\", \"plage\": \"10\"}]'),(19,'Stratégie du PNUD',16,'Pratiques durables/écologiques.','Faites-vous quelque chose pour réduire l\'utilisation de produits chimiques, protéger le sol ou vous adapter au climat ?','[{\"label\": \"L\'entreprise n\'a aucune prise de conscience ou intérêt pour les pratiques durables dans la production ou l\'approvisionnement de son activité.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise ne pratique pas actuellement des méthodes durables, mais est ouverte et déterminée à passer à des matériaux plus durables et à la réduction des déchets si elle reçoit du soutien.\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise incorpore certains intrants durables ou réduit les déchets de manière informelle et exprime un intérêt pour les certifications ou méthodes durables.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise utilise activement des matériaux durables, pratique la réduction des déchets et montre un intérêt pour les modèles circulaires (par exemple, recyclage, services de réparation).\", \"plage\": \"10\"}]'),(20,'Stratégie du PNUD',18,'Localisation ','Quelle est l\'étendue géographique de la présence de l\'entreprise au Cameroun ?','[{\"label\": \"L\'entreprise n\'est pas présente à Yaounde, Douala, Dschang, Belabo/Bertoua/Batouri.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise est partiellement présente à Yaounde, Douala, Dschang, Belabo/Bertoua/Batouri.\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise est largement présente à Yaounde, Douala, Dschang, Belabo/Bertoua/Batouri.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise est présente partout dans le pays.\", \"plage\": \"10\"}]'),(21,'Stratégie du PNUD',19,'Structure productive','Quel est le niveau d’intégration verticale des activités de production et de transformation au sein de l’entreprise ? ','[{\"label\": \"L\'entreprise se focalise sur la production de matière première uniquement.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise produit de la matière première et la transforme dans une certaine mesure.\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise produit de la matière première et developpe son activité de transformation.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise produit sa matière première et la transforme en interne pour la commercialiser.\", \"plage\": \"10\"}]');
/*!40000 ALTER TABLE `matrice_prediagnostic` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-27 15:13:48
