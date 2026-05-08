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
  PRIMARY KEY (`id`),
  KEY `entre_user_idfk_idx` (`id_consl`),
  CONSTRAINT `entre_user_idfk` FOREIGN KEY (`id_consl`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entreprises`
--

LOCK TABLES `entreprises` WRITE;
/*!40000 ALTER TABLE `entreprises` DISABLE KEYS */;
INSERT INTO `entreprises` VALUES (1,'TRALORMAT','Centre','Yaoundé',2002,9,2,'Carreaux de terrazzo','Service de terrazzo coulé personnalisable','Tralormat est une belle entreprise',NULL,NULL,NULL,NULL,'logo.png',1),(3,'Dagomet','Centre','Bafia',2016,8,3,'Production de viande','Charcuterie','C\'est une entreprise familiale ','Waterlo','Centre coup','Ngansop Paul','Mr Ngansop est un grand entrepreneur ',NULL,1),(4,'CABI','Littoral','Douala',2006,18,6,'Champignons frai, champignon sec, vin de champignon','Formation, Conditionnement de salle de production, Achat et revente de champignon','CABI est une entreprise dirigée par un jeune Camerounais','Makepe','Rond point Petit Pays','Pablo Amougou','Pablo est un passionné de champignon. Ingénieur Agronome de formation, il s\'est lancé très tôt dans l\'entreprenariat agropastoral',NULL,3);
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
  `attr_id` int NOT NULL,
  `cons_id` int DEFAULT NULL,
  `comp_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
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
  KEY `cons_id_fk_idx` (`cons_id`),
  KEY `comp_id_fk_idx` (`comp_id`),
  CONSTRAINT `attr_id_fk` FOREIGN KEY (`attr_id`) REFERENCES `mat_predia_crev` (`id_att`),
  CONSTRAINT `comp_id_fk` FOREIGN KEY (`comp_id`) REFERENCES `entreprises` (`id`),
  CONSTRAINT `cons_id_fk` FOREIGN KEY (`cons_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mat_predia_crev_note`
--

LOCK TABLES `mat_predia_crev_note` WRITE;
/*!40000 ALTER TABLE `mat_predia_crev_note` DISABLE KEYS */;
/*!40000 ALTER TABLE `mat_predia_crev_note` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'user','2025-03-19 14:23:43','2025-03-19 14:23:43'),(2,'moderator','2025-03-19 14:23:43','2025-03-19 14:23:43'),(3,'admin','2025-03-19 14:23:43','2025-03-19 14:23:43');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `roleId` int NOT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`roleId`,`userId`),
  KEY `userId` (`userId`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('2025-09-25 13:34:08','2025-09-25 13:34:08',1,1),('2025-09-26 04:57:46','2025-09-26 04:57:46',1,3),('2025-09-26 05:04:01','2025-09-26 05:04:01',1,4),('2025-09-29 18:35:06','2025-09-29 18:35:06',1,10),('2025-09-25 14:03:45','2025-09-25 14:03:45',3,2),('2025-09-26 05:56:45','2025-09-26 05:56:45',3,8);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `tel` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Jalil','fondajalil@gmail.com','$2a$08$6nPClG4xbTURex8jB2ZOPeCNF/vGgGleagRjPKhZPCgOmLw44GNji','2025-09-25 13:34:07','2025-09-25 13:34:07',NULL),(2,'Mounir','ndammounir@gmail.fr','$2a$08$3pxOUv5v3cW./ELY2/7gSOQuU5fcsAM8OMejfLuSwhgNQag1g/gdy','2025-09-25 14:03:45','2025-09-25 14:03:45',NULL),(3,'Nawfal','nawfal@gmail.com','$2a$08$SzXeOeOXKDig60H1Q.Jg7OfKReyjLEf22EbOhj4wo1cEaw7SKVjK6','2025-09-26 04:57:46','2025-09-26 04:57:46',NULL),(4,'Fadil','fadil@gmail.com','$2a$08$lPGEY666gl0J/khWLGQrgeiz2lTmff6FJrOTWGpls9.L2URGCoF9i','2025-09-26 05:04:01','2025-09-26 05:04:01',NULL),(8,'Leila','leila@gmail.com','$2a$08$PI4dUFCGf7Nhc.0DQ9ObFOOGpdz0QijTyTri1lApyE1cKB4k8Dt.K','2025-09-26 05:56:45','2025-09-26 05:56:45',NULL),(10,'ramatou','ramatou@gmail.com','$2a$08$975sVbkY1oHcZCf644LPXOqgDR9sxRRaR.BX9tfrzytsO76WYGtdC','2025-09-29 18:35:06','2025-09-29 18:35:06',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-02 21:14:57
