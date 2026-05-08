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
-- Table structure for table `entreprises`
--

DROP TABLE IF EXISTS `entreprises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entreprises` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville` varchar(48) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_creation` int DEFAULT NULL,
  `nbr_employer` int DEFAULT NULL,
  `nbr_femme` int DEFAULT NULL,
  `produits` mediumtext COLLATE utf8mb4_unicode_ci,
  `services` mediumtext COLLATE utf8mb4_unicode_ci,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `quartier` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lieu` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gerant` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descrt_gerant` varchar(455) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_consl` int DEFAULT NULL,
  `x` decimal(10,0) DEFAULT NULL,
  `y` decimal(10,0) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `entre_user_idfk_idx` (`id_consl`),
  CONSTRAINT `entre_user_idfk` FOREIGN KEY (`id_consl`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entreprises`
--

LOCK TABLES `entreprises` WRITE;
/*!40000 ALTER TABLE `entreprises` DISABLE KEYS */;
INSERT INTO `entreprises` VALUES (1,'TRALORMAT','Centre','Yaoundé',2002,9,2,'Carreaux de terrazzo','Service de terrazzo coulé personnalisable','Tralormat est une belle entreprise',NULL,NULL,NULL,NULL,'logo.png',1,NULL,NULL),(3,'Dagomet','Centre','Bafia',2016,8,3,'Production de viande','Charcuterie','C\'est une entreprise familiale ','Waterlo','Centre coup','Ngansop Paul','Mr Ngansop est un grand entrepreneur ','logo2.png',1,NULL,NULL),(4,'CABI','Littoral','Douala',2006,18,6,'Champignons frai, champignon sec, vin de champignon','Formation, Conditionnement de salle de production, Achat et revente de champignon','CABI est une entreprise dirigée par un jeune Camerounais','Makepe','Rond point Petit Pays','Pablo Amougou','Pablo est un passionné de champignon. Ingénieur Agronome de formation, il s\'est lancé très tôt dans l\'entreprenariat agropastoral','logo3.jpg',3,NULL,NULL),(5,'Nouvelle Ecole','Ouest','Yaoundé',2007,10,9,'viande','service de la suite','une véritable pépite','newtown','Chefferir','Jalil Gafar Fonda Njiemessa','un homme','logo4.jpg',1,NULL,NULL);
/*!40000 ALTER TABLE `entreprises` ENABLE KEYS */;
UNLOCK TABLES;

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
  PRIMARY KEY (`attr_id`),
  UNIQUE KEY `unique_cons_comp` (`cons_id`,`comp_id`),
  KEY `cons_id_fk_idx` (`cons_id`),
  KEY `comp_id_fk_idx` (`comp_id`),
  CONSTRAINT `attr_id_fk` FOREIGN KEY (`attr_id`) REFERENCES `mat_predia_crev` (`id_att`),
  CONSTRAINT `comp_id_fk` FOREIGN KEY (`comp_id`) REFERENCES `entreprises` (`id`),
  CONSTRAINT `cons_id_fk` FOREIGN KEY (`cons_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mat_predia_crev_note`
--

LOCK TABLES `mat_predia_crev_note` WRITE;
/*!40000 ALTER TABLE `mat_predia_crev_note` DISABLE KEYS */;
INSERT INTO `mat_predia_crev_note` VALUES (5,3,4,'2025-10-05 11:28:50',7,NULL,8,NULL,4,NULL,10,NULL,3,NULL,9,'dddddddddddddd',9,'dddddddddddddddddqqqqqqqqqqqq',7,'rrrrrrrrrrrrrrrrrrrr',9,'yyyyyyyyyyyyyyyyyyy',8,'vvvvvvvvvvvvvvvvvvvvvvvvvvvvv',2,NULL,9,NULL,7,NULL),(6,1,1,'2025-10-06 10:53:03',9,NULL,9,NULL,0,NULL,0,NULL,0,NULL,0,NULL,0,NULL,0,NULL,5,NULL,5,NULL,6,NULL,6,NULL,6,NULL),(8,1,3,'2025-10-08 17:07:07',7,NULL,8,NULL,8,NULL,8,NULL,0,NULL,0,NULL,0,NULL,0,NULL,0,NULL,0,NULL,0,NULL,0,NULL,0,NULL);
/*!40000 ALTER TABLE `mat_predia_crev_note` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matrice_diag_integral`
--

DROP TABLE IF EXISTS `matrice_diag_integral`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matrice_diag_integral` (
  `id_diaginteg` int NOT NULL AUTO_INCREMENT,
  `domaine` tinytext,
  `reper` varchar(45) DEFAULT NULL,
  `libele` mediumtext,
  PRIMARY KEY (`id_diaginteg`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matrice_diag_integral`
--

LOCK TABLES `matrice_diag_integral` WRITE;
/*!40000 ALTER TABLE `matrice_diag_integral` DISABLE KEYS */;
INSERT INTO `matrice_diag_integral` VALUES (1,'Situation juridique et fiscale','A1','Le gestionnaire connaît-il les exigences légales pour que l\'entreprise fonctionne ?'),(2,'Situation juridique et fiscale','A2','Les exigences légales sont-elles remplies pour que l\'entreprise fonctionne ?'),(3,'Situation juridique et fiscale','A3','L\'entreprise respecte-t-elle ses engagements fiscaux et ses obligations de reporting ?'),(4,'Situation juridique et fiscale','A4','L\'entreprise respecte-t-elle la réglementation du travail ?'),(5,'Leadership et climat organisationnel','B1','Le travail est vraiment motivant, les employés l\'apprécient.'),(6,'Leadership et climat organisationnel','B2','Les gens semblent fiers de l\'organisation.'),(7,'Leadership et climat organisationnel','B3','Les employés fournissent beaucoup d\'efforts dans ce qu\'ils font.'),(8,'Leadership et climat organisationnel','B4','Le propriétaire/leader communique régulièrement avec les subordonnés sur les projets futurs.'),(9,'Leadership et climat organisationnel','B5','Le propriétaire/leader s\'intéresse à de nouvelles et meilleures options bénéfiques pour l\'entreprise et les employés.'),(10,'Leadership et climat organisationnel','B6','Le propriétaire/leader est ouvert et communique correctement avec le personnel.'),(11,'Leadership et climat organisationnel','B7','Le(s) propriétaire(s) sait/savent déléguer et convaincre les gens du pourquoi et du comment des actions.'),(12,'Leadership et climat organisationnel','B8','Le travail est axé sur l\'atteinte des objectifs et des buts.'),(13,'Organisation de l\'entreprise',NULL,'L\'entreprise a une structure organisationnelle claire (organigramme) (même si elle n\'est pas documentée)'),(14,'Organisation de l\'entreprise',NULL,'L\'entreprise dispose d\'une procédure pour élaborer la structure organisationnelle.'),(15,'Organisation de l\'entreprise',NULL,'L\'entreprise a des procédures pour la sélection, le recrutement et la formation des travailleurs.'),(16,'Organisation de l\'entreprise',NULL,'L\'entreprise a un système de rémunération qui garantit une rétribution équitable de l\'argent et autres avantages.'),(17,'Organisation de l\'entreprise',NULL,'\"Les travailleurs, employés et managers possèdent les compétences appropriées pour leur poste.\n\"'),(18,'Organisation de l\'entreprise',NULL,'L\'entreprise dispose d\'un système de communication permettant de présenter les instructions de travail.'),(19,'Organisation de l\'entreprise',NULL,'Le propriétaire de l\'entreprise ou un employé responsable des ressources humaines manifeste de l\'intérêt pour les besoins du personnel.'),(20,'Finance et Comptabilité',NULL,'Les opérations commerciales sont-elles enregistrées pour la comptabilité ?'),(21,'Finance et Comptabilité',NULL,'Quel pourcentage des produits/services de l\'entreprise a été analysé en fonction de leur coût exact ?'),(22,'Finance et Comptabilité',NULL,'Un budget ou des projections de base ont-ils été établis pour l\'année en cours ?'),(23,'Finance et Comptabilité',NULL,'L\'entreprise a-t-elle le potentiel d\'accéder au crédit ?'),(24,'Finance et Comptabilité',NULL,'L\'entreprise accorde-t-elle des crédits à ses principaux clients ?'),(25,'Finance et Comptabilité',NULL,'Les fournisseurs accordent-ils du crédit à l\'entreprise et tiennent-ils de bons registres ?'),(26,'Finance et Comptabilité',NULL,'Les informations comptables garantissent-elles que l\'entreprise génère des bénéfices ?'),(27,'Finance et Comptabilité',NULL,'Si un bénéfice est réalisé, des primes sont-elles distribuées aux employés ?'),(28,'Planification Stratégique',NULL,'L\'entreprise dispose d\'un plan qui aide à guider les activités commerciales (même s\'il n\'est pas écrit/documenté).'),(29,'Planification Stratégique',NULL,'Le plan fournit des informations pour prendre des décisions opérationnelles.'),(30,'Planification Stratégique',NULL,'Le plan définit des indicateurs et des objectifs clairs (même s\'il n\'est pas écrit/documenté).'),(31,'Planification Stratégique',NULL,'Lors de l\'élaboration du plan, les éléments suivants ont été pris en compte : forces, faiblesses, opportunités et menaces. Cela constitue la base pour développer des stratégies.'),(32,'Planification Stratégique',NULL,'Dans quelle mesure le secteur d\'activité dans lequel l\'entreprise opère est-il analysé ?'),(33,'Planification Stratégique',NULL,'Les activités développées permettent-elles d\'atteindre les objectifs du plan de travail ?'),(34,'Planification Stratégique',NULL,'Le budget est-il créé en tenant compte du plan de travail ?'),(35,'Production et Opérations',NULL,'L\'activité commerciale reste active et en croissance.'),(36,'Production et Opérations',NULL,'Les produits et services correspondent aux besoins et attentes identifiés des clients.'),(37,'Production et Opérations',NULL,'La quantité de machines et d’équipements disponibles pour l’entreprise est suffisante pour répondre à la demande de produits ou de services.'),(38,'Production et Opérations',NULL,'Les installations sont suffisantes et appropriées pour développer les activités de l\'entreprise.'),(39,'Production et Opérations',NULL,'L’entreprise sait où acheter les matières premières aux meilleurs prix.'),(40,'Production et Opérations',NULL,'Les achats sont effectués en fonction des prévisions de ventes.'),(41,'Production et Opérations',NULL,'L’entreprise développe des contrôles écrits et systématiques sur les processus de production.'),(42,'Production et Opérations',NULL,'La capacité installée de l\'entreprise est pleinement utilisée.'),(43,'Assurance Qualité',NULL,'L’entreprise applique des mesures d’assurance qualité (même si elle ne dispose pas d’un protocole écrit).'),(44,'Assurance Qualité',NULL,'L’entreprise a formalisé (via des POS écrits) la manière dont la qualité des produits/services est mesurée.'),(45,'Assurance Qualité',NULL,'Lors de la production ou de la prestation d’un service, l’entreprise effectue des contrôles systématiques pour garantir le respect des procédures de qualité écrites.'),(46,'Assurance Qualité',NULL,'Les résultats du processus sont analysés pour détecter des changements et apporter les corrections nécessaires.'),(47,'Assurance Qualité',NULL,'Toutes les opérations effectuées sont enregistrées.'),(48,'Assurance Qualité',NULL,'L’entreprise dispose d’un système d’enregistrement et de gestion des informations relatives aux opérations, aux documents ou à d’autres informations importantes.'),(49,'Assurance Qualité',NULL,'À quel point l’entreprise a-t-elle établi que la qualité est l’une de ses priorités ?'),(50,'Assurance Qualité',NULL,'Les produits/services de l’entreprise sont conformes aux normes techniques.'),(51,'Commercialisation',NULL,'Les ventes ont augmenté par rapport à l’année précédente.'),(52,'Commercialisation',NULL,'Dans quelle mesure les segments de marché servis par l’entreprise ont-ils été identifiés?'),(53,'Commercialisation',NULL,'Niveau de connaissance des clients de l’entreprise, leurs goûts, leurs besoins et les raisons derrière l’achat de produits/services.'),(54,'Commercialisation',NULL,'L’entreprise connaît les habitudes d’achat et de paiement de ses utilisateurs et consommateurs.'),(55,'Commercialisation',NULL,'L’entreprise sait si ses clients sont satisfaits de son produit/service.'),(56,'Commercialisation',NULL,'Les prix de vente sont fixés en fonction du marché.'),(57,'Commercialisation',NULL,'Les responsables des ventes sont correctement formés.'),(58,'Commercialisation',NULL,'L’entreprise dispose d’un profil actif sur les réseaux sociaux pour promouvoir son activité.'),(59,'Commercialisation',NULL,'Dans quelle mesure le système de distribution de l’entreprise est-il efficace?'),(60,'Commercialisation',NULL,'Dans quelle mesure la concurrence est-elle connue, notamment ses faiblesses et ses forces ?'),(61,'Commercialisation',NULL,'L’entreprise dispose d’un plan marketing, qui est formulé, mis en œuvre et évalué.'),(62,'',NULL,NULL);
/*!40000 ALTER TABLE `matrice_diag_integral` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matrice_diag_integral_note`
--

DROP TABLE IF EXISTS `matrice_diag_integral_note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matrice_diag_integral_note` (
  `id_diag_integ_note` int NOT NULL AUTO_INCREMENT,
  `cons_id` int DEFAULT NULL,
  `comp_id` int DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `note_1` decimal(10,0) DEFAULT NULL,
  `comt_1` mediumtext,
  `note_2` decimal(10,0) DEFAULT NULL,
  `comt_2` mediumtext,
  `note_3` decimal(10,0) DEFAULT NULL,
  `comt_3` mediumtext,
  `note_4` decimal(10,0) DEFAULT NULL,
  `comt_4` mediumtext,
  `note_5` decimal(10,0) DEFAULT NULL,
  `comt_5` mediumtext,
  `note_6` decimal(10,0) DEFAULT NULL,
  `comt_6` mediumtext,
  `note_7` decimal(10,0) DEFAULT NULL,
  `comt_7` mediumtext,
  `note_8` decimal(10,0) DEFAULT NULL,
  `comt_8` mediumtext,
  `note_9` decimal(10,0) DEFAULT NULL,
  `comt_9` mediumtext,
  `note_10` decimal(10,0) DEFAULT NULL,
  `comt_10` mediumtext,
  `note_11` decimal(10,0) DEFAULT NULL,
  `comt_11` mediumtext,
  `note_12` decimal(10,0) DEFAULT NULL,
  `comt_12` mediumtext,
  `note_13` decimal(10,0) DEFAULT NULL,
  `comt_13` mediumtext,
  `note_14` decimal(10,0) DEFAULT NULL,
  `comt_14` mediumtext,
  `note_15` decimal(10,0) DEFAULT NULL,
  `comt_15` mediumtext,
  `note_16` decimal(10,0) DEFAULT NULL,
  `comt_16` mediumtext,
  `note_17` decimal(10,0) DEFAULT NULL,
  `comt_17` mediumtext,
  `note_18` decimal(10,0) DEFAULT NULL,
  `comt_18` mediumtext,
  `note_19` decimal(10,0) DEFAULT NULL,
  `comt_19` mediumtext,
  `note_20` decimal(10,0) DEFAULT NULL,
  `comt_20` mediumtext,
  `note_21` decimal(10,0) DEFAULT NULL,
  `comt_21` mediumtext,
  `note_22` decimal(10,0) DEFAULT NULL,
  `comt_22` mediumtext,
  `note_23` decimal(10,0) DEFAULT NULL,
  `comt_23` mediumtext,
  `note_24` decimal(10,0) DEFAULT NULL,
  `comt_24` mediumtext,
  `note_25` decimal(10,0) DEFAULT NULL,
  `comt_25` mediumtext,
  `note_26` decimal(10,0) DEFAULT NULL,
  `comt_26` mediumtext,
  `note_27` decimal(10,0) DEFAULT NULL,
  `comt_27` mediumtext,
  `note_28` decimal(10,0) DEFAULT NULL,
  `comt_28` mediumtext,
  `note_29` decimal(10,0) DEFAULT NULL,
  `comt_29` mediumtext,
  `note_30` decimal(10,0) DEFAULT NULL,
  `comt_30` mediumtext,
  `note_31` decimal(10,0) DEFAULT NULL,
  `comt_31` mediumtext,
  `note_32` decimal(10,0) DEFAULT NULL,
  `comt_32` mediumtext,
  `note_33` decimal(10,0) DEFAULT NULL,
  `comt_33` mediumtext,
  `note_34` decimal(10,0) DEFAULT NULL,
  `comt_34` mediumtext,
  `note_35` decimal(10,0) DEFAULT NULL,
  `comt_35` mediumtext,
  `note_36` decimal(10,0) DEFAULT NULL,
  `comt_36` mediumtext,
  `note_37` decimal(10,0) DEFAULT NULL,
  `comt_37` mediumtext,
  `note_38` decimal(10,0) DEFAULT NULL,
  `comt_38` mediumtext,
  `note_39` decimal(10,0) DEFAULT NULL,
  `comt_39` mediumtext,
  `note_40` decimal(10,0) DEFAULT NULL,
  `comt_40` mediumtext,
  `note_41` decimal(10,0) DEFAULT NULL,
  `comt_41` mediumtext,
  `note_42` decimal(10,0) DEFAULT NULL,
  `comt_42` mediumtext,
  `note_43` decimal(10,0) DEFAULT NULL,
  `comt_43` mediumtext,
  `note_44` decimal(10,0) DEFAULT NULL,
  `comt_44` mediumtext,
  `note_45` decimal(10,0) DEFAULT NULL,
  `comt_45` mediumtext,
  `note_46` decimal(10,0) DEFAULT NULL,
  `comt_46` mediumtext,
  `note_47` decimal(10,0) DEFAULT NULL,
  `comt_47` mediumtext,
  `note_48` decimal(10,0) DEFAULT NULL,
  `comt_48` mediumtext,
  `note_49` decimal(10,0) DEFAULT NULL,
  `comt_49` mediumtext,
  `note_50` decimal(10,0) DEFAULT NULL,
  `comt_50` mediumtext,
  `note_51` decimal(10,0) DEFAULT NULL,
  `comt_51` mediumtext,
  `note_52` decimal(10,0) DEFAULT NULL,
  `comt_52` mediumtext,
  `note_53` decimal(10,0) DEFAULT NULL,
  `comt_53` mediumtext,
  `note_54` decimal(10,0) DEFAULT NULL,
  `comt_54` mediumtext,
  `note_55` decimal(10,0) DEFAULT NULL,
  `comt_55` mediumtext,
  `note_56` decimal(10,0) DEFAULT NULL,
  `comt_56` mediumtext,
  `note_57` decimal(10,0) DEFAULT NULL,
  `comt_57` mediumtext,
  `note_58` decimal(10,0) DEFAULT NULL,
  `comt_58` mediumtext,
  `note_59` decimal(10,0) DEFAULT NULL,
  `comt_59` mediumtext,
  `note_60` decimal(10,0) DEFAULT NULL,
  `comt_60` mediumtext,
  `note_61` decimal(10,0) DEFAULT NULL,
  `comt_61` mediumtext,
  `note_62` decimal(10,0) DEFAULT NULL,
  `comt_62` mediumtext,
  `difficulte_1` mediumtext,
  `difficulte_2` mediumtext,
  `difficulte_3` mediumtext,
  `force_1` mediumtext,
  `force_2` mediumtext,
  `force_3` mediumtext,
  `faiblesse_1` mediumtext,
  `faiblesse_2` mediumtext,
  `faiblesse_3` mediumtext,
  `besoin_1` mediumtext,
  `besoin_2` mediumtext,
  `besoin_3` mediumtext,
  PRIMARY KEY (`id_diag_integ_note`),
  UNIQUE KEY `unicc_cons_comp` (`cons_id`,`comp_id`) /*!80000 INVISIBLE */,
  KEY `compa_id_fk_idx` (`comp_id`),
  CONSTRAINT `compa_id_fk` FOREIGN KEY (`comp_id`) REFERENCES `entreprises` (`id`),
  CONSTRAINT `consu_id_fk` FOREIGN KEY (`cons_id`) REFERENCES `users` (`id`),
  CONSTRAINT `mat_integ_id_fk` FOREIGN KEY (`id_diag_integ_note`) REFERENCES `matrice_diag_integral` (`id_diaginteg`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matrice_diag_integral_note`
--

LOCK TABLES `matrice_diag_integral_note` WRITE;
/*!40000 ALTER TABLE `matrice_diag_integral_note` DISABLE KEYS */;
INSERT INTO `matrice_diag_integral_note` VALUES (7,1,1,'2025-12-18 06:11:07',2,'le bon',5,'le tru',9,'bien',8,'ffdf',5,'fdff',7,'fdfdf',9,'fddfdf',8,'dfdfdf',10,'rrrrrrrrrrrrrrr',10,'rrrrrrrrrr',10,'fffffffffd',9,'fffffffff',3,'fdf',4,'dfd',2,'dfdf',3,'fdfd',5,'dfdf',2,'dfdf',4,'fdf',6,NULL,7,NULL,7,NULL,10,NULL,1,NULL,10,NULL,7,NULL,9,NULL,6,NULL,6,NULL,7,NULL,7,NULL,7,NULL,5,NULL,8,NULL,8,NULL,9,NULL,7,NULL,6,NULL,2,NULL,2,NULL,3,NULL,3,NULL,7,NULL,10,NULL,10,NULL,9,NULL,9,NULL,8,NULL,0,NULL,8,NULL,8,NULL,8,NULL,6,NULL,7,NULL,8,NULL,6,NULL,6,NULL,7,NULL,7,NULL,4,NULL,4,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `matrice_diag_integral_note` ENABLE KEYS */;
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
  `attribut` mediumtext,
  `children` json DEFAULT NULL,
  PRIMARY KEY (`id_predia`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matrice_prediagnostic`
--

LOCK TABLES `matrice_prediagnostic` WRITE;
/*!40000 ALTER TABLE `matrice_prediagnostic` DISABLE KEYS */;
INSERT INTO `matrice_prediagnostic` VALUES (1,'Ressource opérationelles disponibles','Équipements et installations disponibles pour maintenir les opérations','[{\"label\": \"L\'entreprise n\'a pas d\'installations, ses processus sont réalisés de manière non professionnelle.\", \"plage\": \"0\"}, {\"label\": \"Bien que l\'entreprise ait des équipements de base pour ses processus, les installations sont insuffisantes et inappropriées pour ses opérations.\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise dispose d\'installations avec des équipements de base pour ses services de production/vente.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise dispose d\'une usine/bureau, d\'équipements professionnels et de technologies pour la production et la vente ; équipements de transport et de logistique.\", \"plage\": \"10\"}]'),(2,'Ressource opérationelles disponibles','Nombre d\'employés','[{\"label\": \"L\'entreprise a moins de 3 employés\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise a entre 5 et 3 employés\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise a entre 10 et 5 employés\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise a plus de 10 employés\", \"plage\": \"10\"}]'),(3,'Ressource opérationelles disponibles','Disponibilité des fond personnels pour l\'opération','[{\"label\": \"L\'entreprise a de graves problèmes de fonds de roulement.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise a des fonds, mais pas suffisamment pour couvrir les dépenses d\'exploitation.\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise a des fonds propres pour l\'investissement et/ou le réinvestissement.\", \"plage\": \"10\"}]'),(5,'Compétences techniques','Gestion d\'entreprise','[{\"label\": \"Le propriétaire de l\'entreprise n\'a pas de diplôme professionnel et n\'a pas suivi de formation technique spécialisée.\", \"plage\": \"0\"}, {\"label\": \"Le propriétaire de l\'entreprise a étudié dans des domaines différents de son entreprise ; il n\'a pas reçu de formation technique spécialisée.\", \"plage\": \"5\"}, {\"label\": \"Le propriétaire de l\'entreprise possède un baccalauréat dans des domaines liés aux affaires, mais n\'a pas suivi de formation technique spécialisée.\", \"plage\": \"7\"}, {\"label\": \"Le propriétaire de l\'entreprise possède un master dans des domaines liés aux affaires et a suivi une formation technique spécialisée.\", \"plage\": \"10\"}]'),(6,'Compétences techniques','Expérience technique','[{\"label\": \"Le propriétaire n\'a pas reçu de formation technique spécialisée et ne possède aucun diplôme technique.\", \"plage\": \"0\"}, {\"label\": \"Le propriétaire n\'a pas reçu de formation technique spécialisée, mais a travaillé dans d\'autres entreprises du même secteur sans avoir de diplôme technique.\", \"plage\": \"5\"}, {\"label\": \"Le propriétaire a suivi une formation technique spécialisée, mais ne possède pas de diplôme technique.\", \"plage\": \"7\"}, {\"label\": \"Le propriétaire a suivi une formation technique spécialisée et possède un diplôme technique.\", \"plage\": \"10\"}]'),(7,'Compétences techniques','Expérience dans le métier','[{\"label\": \"Moins de 1 an d\'expérience dans le métier\", \"plage\": \"0\"}, {\"label\": \"Expérience entre 1 et 5 ans\", \"plage\": \"5\"}, {\"label\": \"Expérience entre 5 et 10 ans\", \"plage\": \"7\"}, {\"label\": \"Expérience dans le métier, plus de 10 ans\", \"plage\": \"10\"}]'),(8,'Potentiel de l\'entreprise','L\'entreprise opère depuis les 2 dernières années, est active et prête à se développer','[{\"label\": \"Année de base 2022, l\'entreprise a connu une croissance de moins de 10 % en ventes totales.\", \"plage\": \"0\"}, {\"label\": \"Année de base 2022, l\'entreprise a connu une croissance entre 10 % et 25 % en ventes totales.\", \"plage\": \"5\"}, {\"label\": \"Année de base 2022, l\'entreprise a connu une croissance entre 25 % et 50 % en ventes totales.\", \"plage\": \"7\"}, {\"label\": \"Année de base 2022, l\'entreprise a connu une croissance de plus de 50 % en ventes totales.\", \"plage\": \"10\"}]'),(9,'Potentiel de l\'entreprise','L\'entreprise a une liste de clients (nombre de clients - clients finaux comptent pour 1)','[{\"label\": \"L\'entreprise n\'a pas de liste de clients. Moins de 5 clients.\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise n\'a pas de liste de clients. Au moins 5 clients.\", \"plage\": \"5\"}, {\"label\": \"La liste des clients est gérée dans le répertoire téléphonique du responsable. Au moins 10 clients.\", \"plage\": \"7\"}, {\"label\": \"Il existe une preuve écrite (enregistrement) que l\'entreprise a une liste de clients avec leurs informations de base (nom du contact, téléphone, adresse, e-mail). Au moins 20 clients.\", \"plage\": \"10\"}]'),(10,'Potentiel de l\'entreprise','Potentiel de valeur ajoutée','[{\"label\": \"Produits : production primaire (par exemple légumes, fruits) ; non emballé ; transport inapproprié. Services touristiques : offre touristique de base, gestion déficiente des opérations, installations insuffisantes.\", \"plage\": \"0\"}, {\"label\": \"Produits : production primaire (par exemple légumes, fruits) ; produit lavé et emballé ; transport inapproprié. Services touristiques : bien que l\'offre touristique soit de base, ils ont une bonne demande pour leurs services ; installations de base-services modérés.\", \"plage\": \"5\"}, {\"label\": \"Produits : production primaire (par exemple légumes, fruits) ; produit lavé et emballé ; équipement de traitement de base/obsolète ; transport inapproprié. Services touristiques : bonne offre de services touristiques, bonne demande ; installations appropriées.\", \"plage\": \"7\"}, {\"label\": \"Produits : emballage ; processus de fabrication industrielle ; logistique de production. Services : forfaits touristiques définis ; gestion professionnelle des clients ; numérisation des opérations, installations appropriées.\", \"plage\": \"10\"}]'),(11,'Marketing','Canaux de vente','[{\"label\": \"L\'entreprise a seulement 1 canal (parmi clients finaux, intermédiaires et entreprises principales)\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise a seulement 2 canaux\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise a les 3 canaux comme clients\", \"plage\": \"7\"}]'),(12,'Marketing','Stratégies commerciales','[{\"label\": \"L\'entreprise n\'a pas de réseaux sociaux pour promouvoir ses produits/services ; elle n\'a pas d\'emballage pour ses produits ; elle n\'a pas de ligne graphique pour promouvoir ses produits/services (logos, catalogues, etc.).\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise n\'a pas de réseaux sociaux pour promouvoir ses produits/services ; son emballage est de mauvaise qualité ; elle n\'a pas de ligne graphique pour promouvoir ses produits/services (logos, catalogues, etc.). \", \"plage\": \"5\"}, {\"label\": \"L\'entreprise a au moins un réseau social pour promouvoir ses produits/services ; son emballage est de haute qualité ; elle n\'a pas de ligne graphique pour promouvoir ses produits/services (logos, catalogues, etc.).\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise a au moins un réseau social pour promouvoir ses produits/services ; son emballage est de haute qualité ; elle a une ligne graphique pour promouvoir ses produits/services (logos, catalogues, etc.).\", \"plage\": \"10\"}]'),(13,'Stratégie du PNUD','Inclusion de genre','[{\"label\": \"L\'entreprise a moins de 30 % d\'employées femmes\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise a entre 50 % et 30 % d\'employées femmes\", \"plage\": \"5\"}, {\"label\": \"L\'entreprise a au moins 50 % d\'employées femmes\", \"plage\": \"7\"}, {\"label\": \"L\'entreprise est dirigée par des femmes\", \"plage\": \"10\"}]'),(14,'Stratégie du PNUD','Secteur stratégique','[{\"label\": \"L\'entreprise n\'appartient pas aux secteurs de la production, du traitement, de l\'agriculture, du tourisme\", \"plage\": \"0\"}, {\"label\": \"L\'entreprise appartient aux secteurs de la production textile, de l\'agro-business, du tourisme\", \"plage\": \"5\"}]');
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

-- Dump completed on 2025-12-18  7:37:07
