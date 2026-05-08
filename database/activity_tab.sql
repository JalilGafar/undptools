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
-- Table structure for table `activity_tab`
--

DROP TABLE IF EXISTS `activity_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_tab` (
  `id_activity` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `details` mediumtext,
  `start` varchar(45) DEFAULT NULL,
  `end` varchar(45) DEFAULT NULL,
  `close` varchar(45) DEFAULT NULL,
  `progress` varchar(45) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `dependencies` int DEFAULT NULL,
  `responsable` varchar(45) DEFAULT NULL,
  `comments` mediumtext,
  `cons_id` int DEFAULT NULL,
  `comp_id` int DEFAULT NULL,
  PRIMARY KEY (`id_activity`),
  KEY `cons_id_fk_idx` (`cons_id`),
  KEY `comp_id_fk_idx` (`comp_id`),
  CONSTRAINT `activity_comp_id_fk` FOREIGN KEY (`comp_id`) REFERENCES `entreprises` (`id`),
  CONSTRAINT `activity_cons_id_fk` FOREIGN KEY (`cons_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_tab`
--

LOCK TABLES `activity_tab` WRITE;
/*!40000 ALTER TABLE `activity_tab` DISABLE KEYS */;
-- INSERT INTO `activity_tab` VALUES (1,'loeur','foriu',NULL,NULL,NULL,'92','En cours',NULL,'Abega','Le commentaire est important',NULL,NULL),(2,'collo','bega','2026-02-09','2026-02-11','2026-02-15','33','En cours',NULL,'Abega','be',NULL,NULL),(3,'Consoloo','les petits','2026-02-09','2026-02-11','2026-02-15','55','En cours',NULL,'Abega','gg',NULL,NULL),(4,'le pont','la vie','2026-02-10','2026-02-14','2026-02-15','55','En cours',NULL,'Abega','piont',NULL,NULL),(5,'Jalil Gafar Fonda Njiemessa','gee','2026-02-09','2026-02-13','2026-02-15','88','En cours',NULL,'Roosvelt','no comment',NULL,NULL),(6,'index.html','parfois c\'est mieux','2026-02-11','2026-02-15','2026-02-16','22','En cours',NULL,'Nawfal','un deux trois',NULL,NULL),(7,'nodeapi','Le but est de savoir','2026-02-11','2026-02-15','2026-02-20','44','En cours',NULL,'Nawfal','dddddddddddddddd',NULL,NULL),(8,'C\'est mieux','Tester','2026-02-08','2026-02-11','2026-02-13','55','En cours',NULL,'Roosvelt','eeeeeeeeeeeeeeeee',1,1),(9,'rama','couper','2026-02-10','2026-02-20','2026-02-22','14','En cours',NULL,'Abega','Comme un charme',1,3),(10,'rama','couper','2026-02-10','2026-02-20','2026-02-22','14','En cours',NULL,'Abega','Comme un charme',1,3),(11,'C\'est mieux','Tester','2026-02-06','2026-02-11','2026-02-13','55','En cours',NULL,'Roosvelt','hhhhhhhhhhhhhhh',1,1);
/*!40000 ALTER TABLE `activity_tab` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-10  9:31:38
