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
-- Table structure for table `bmc_data`
--

DROP TABLE IF EXISTS `bmc_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bmc_data` (
  `bmc_id` int NOT NULL AUTO_INCREMENT,
  `cons_id` int DEFAULT NULL,
  `comp_id` int DEFAULT NULL,
  `customerSegments1` tinytext,
  `customerSegments2` tinytext,
  `customerSegments3` tinytext,
  `valuePropositions1` tinytext,
  `valuePropositions2` tinytext,
  `valuePropositions3` tinytext,
  `channels1` tinytext,
  `channels2` tinytext,
  `channels3` tinytext,
  `problemeIdentifie1` tinytext,
  `problemeIdentifie2` tinytext,
  `problemeIdentifie3` tinytext,
  `but1` tinytext,
  `but2` tinytext,
  `but3` tinytext,
  `mesureImpact1` tinytext,
  `mesureImpact2` tinytext,
  `mesureImpact3` tinytext,
  `customerRelationships1` tinytext,
  `customerRelationships2` tinytext,
  `customerRelationships3` tinytext,
  `revenueStreams1` tinytext,
  `revenueStreams2` tinytext,
  `revenueStreams3` tinytext,
  `keyResources1` tinytext,
  `keyResources2` tinytext,
  `keyResources3` tinytext,
  `keyActivities1` tinytext,
  `keyActivities2` tinytext, 
  `keyActivities3` tinytext,
  `keyPartnerships1` tinytext,
  `keyPartnerships2` tinytext,
  `keyPartnerships3` tinytext,
  `costStructure1` tinytext,
  `costStructure2` tinytext,
  `costStructure3` tinytext,
  `date` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`bmc_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bmc_data`
--

LOCK TABLES `bmc_data` WRITE;
/*!40000 ALTER TABLE `bmc_data` DISABLE KEYS */;
INSERT INTO `bmc_data` VALUES (1,1,1,'canvas','','','zetsu','','','potea','','','lost','','','dior','','','bingolo','','','waren','','','tiof','','','blui','','','octav','','','terre','','','lune','soleil','mars',NULL,'2026-02-24 13:35:17',NULL),(2,1,1,'Minimum 3 canaux structurés (Facebook optimisé, prospection B2B, partenariats entreprises BTP)','','','Minimum 3 canaux structurés (Facebook optimisé, prospection B2B, partenariats entreprises BTP)','','','Minimum 3 canaux structurés (Facebook optimisé, prospection B2B, partenariats entreprises BTP)','','','Minimum 3 canaux structurés (Facebook optimisé, prospection B2B, partenariats entreprises BTP)','','','hhhhhhhhhhhhh','','','Minimum 3 canaux structurés (Facebook optimisé, prospection B2B, partenariats entreprises BTP)','','','Minimum 3 canaux structurés (Facebook optimisé, prospection B2B, partenariats entreprises BTP)','Minimum 3 canaux structurés (Facebook optimisé, prospection B2B, partenariats entreprises BTP)','','Minimum 3 canaux structurés (Facebook optimisé, prospection B2B, partenariats entreprises BTP)','','','Minimum 3 canaux structurés (Facebook optimisé, prospection B2B, partenariats entreprises BTP)','','','Minimum 3 canaux structurés (Facebook optimisé, prospection B2B, partenariats entreprises BTP)','','','Minimum 3 canaux structurés (Facebook optimisé, prospection B2B, partenariats entreprises BTP)','','','Minimum 3 canaux structurés (Facebook optimisé, prospection B2B, partenariats entreprises BTP)','','',NULL,'2026-02-26 13:06:26',NULL);
/*!40000 ALTER TABLE `bmc_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bmc_label`
--

DROP TABLE IF EXISTS `bmc_label`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bmc_label` (
  `idbmc_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `label` varchar(45) DEFAULT NULL,
  `label_fr` varchar(45) DEFAULT NULL,
  `icon` varchar(45) DEFAULT NULL,
  `guide` mediumtext,
  PRIMARY KEY (`idbmc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bmc_label`
--

LOCK TABLES `bmc_label` WRITE;
/*!40000 ALTER TABLE `bmc_label` DISABLE KEYS */;
/*!40000 ALTER TABLE `bmc_label` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-26 13:37:03
