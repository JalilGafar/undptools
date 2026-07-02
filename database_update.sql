-- ============================================================
-- CAMERDIPLOME - REMPLISSAGE BASE DE DONNÉES
-- Université de Yaoundé I (UY1) + Université de Yaoundé II (UY2)
-- Date : 2026-05-31
-- Scope : Tables campus, ecoles, campus_ecoles
-- Source : Guide des Etudes Supérieures au Cameroun 2021 (p.130/163)
-- ============================================================
--
-- UY1 (id=21) : 4 facultés + 3 grandes écoles = 7 composantes
--   Écoles Doctorales listées dans le Guide = entités de recherche,
--   non modélisées comme établissements indépendants -> IGNORÉES
--   Déjà en base : 0
--   Campus :
--     id=239 : Campus UY1 (Yaoundé, Ngoa Ekelle) -> 6 composantes
--     id=240 : Campus IUTB (Mbalmayo)             -> 1 composante
--
-- UY2 (id=22) : 2 facultés + 3 instituts = 5 composantes
--   Annexes FSJP de Bertoua et Ebolowa = sites d'une même faculté,
--   non des composantes distinctes -> NON modélisées
--   Déjà en base : 0
--   Campus (UY2 est multi-sites selon le Guide p.163) :
--     id=241 : Campus de Soa (Soa)          -> FSJP-UY2, FSEG-UY2
--     id=242 : Campus Ngoa Ekelle UY2 (Ydé) -> IFORD, ESSTIC
--     id=243 : Campus Obili UY2 (Yaoundé)   -> IRIC
--
-- Nouvelles écoles  : ids 358-369 (7 UY1 + 5 UY2 = 12)
-- Nouvelles liaisons: 12
-- ============================================================

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- PARTIE 1 : UNIVERSITÉ DE YAOUNDÉ I (UY1)
-- ============================================================

-- Étape UY1-1 : CAMPUS

INSERT INTO `ecolecamerdb`.`campus`
  (`nom_camp`, `ville_cam`, `quartier_camp`, `principal_camp`)
VALUES
  ('Campus de l\'UY1', 'Yaoundé',  'Ngoa Ekelle', 1),  -- id=239
  ('Campus IUTB',      'Mbalmayo', NULL,           1);  -- id=240

-- Étape UY1-2 : ÉCOLES
-- universites_id = 21 (Université de Yaoundé I)

INSERT INTO `ecolecamerdb`.`ecoles`
  (`nom_e`, `sigle_e`, `pub`, `niveau_e`, `langue_e`, `universites_id`)
VALUES
  -- FACULTÉS (4)
  ('Faculté des Arts, Lettres et Sciences Humaines de Yaoundé I',
   'FALSH-UY1', 'on', 'sup', 'Fr', 21),  -- id=358

  ('Faculté des Sciences de Yaoundé I',
   'FS-UY1',    'on', 'sup', 'Fr', 21),  -- id=359

  ('Faculté des Sciences de l\'Education de Yaoundé I',
   'FSE-UY1',   'on', 'sup', 'Fr', 21),  -- id=360

  ('Faculté de Médecine et des Sciences Biomédicales de Yaoundé I',
   'FMSB-UY1',  'on', 'sup', 'Fr', 21),  -- id=361

  -- GRANDES ÉCOLES (3)
  ('Ecole Nationale Supérieure Polytechnique de Yaoundé',
   'ENSPY',     'on', 'sup', 'Fr', 21),  -- id=362

  ('Institut Universitaire de Technologie du Bois de Mbalmayo',
   'IUTB',      'on', 'sup', 'Fr', 21),  -- id=363

  ('Ecole Normale Supérieure de l\'Enseignement Technique de Yaoundé',
   'ENSET-UY1', 'on', 'sup', 'Fr', 21);  -- id=364

-- Étape UY1-3 : LIAISONS

INSERT INTO `ecolecamerdb`.`campus_ecoles` (`campus_id`, `ecole_id`) VALUES
  -- 6 composantes sur campus principal (Ngoa Ekelle)
  (239, 358),  -- FALSH-UY1
  (239, 359),  -- FS-UY1
  (239, 360),  -- FSE-UY1
  (239, 361),  -- FMSB-UY1
  (239, 362),  -- ENSPY
  (239, 364),  -- ENSET-UY1
  -- 1 composante sur campus de Mbalmayo
  (240, 363);  -- IUTB

-- ============================================================
-- PARTIE 2 : UNIVERSITÉ DE YAOUNDÉ II (UY2)
-- ============================================================

-- Étape UY2-1 : CAMPUS
-- UY2 est répartie sur 3 campus distincts + 2 annexes non modélisées

INSERT INTO `ecolecamerdb`.`campus`
  (`nom_camp`, `ville_cam`, `quartier_camp`, `principal_camp`)
VALUES
  ('Campus de Soa UY2',          'Soa',     NULL,          1),  -- id=241
  ('Campus Ngoa Ekelle UY2',     'Yaoundé', 'Ngoa Ekelle', 0),  -- id=242
  ('Campus Obili UY2',           'Yaoundé', 'Obili',       0);  -- id=243

-- Étape UY2-2 : ÉCOLES
-- universites_id = 22 (Université de Yaoundé II)

INSERT INTO `ecolecamerdb`.`ecoles`
  (`nom_e`, `sigle_e`, `pub`, `niveau_e`, `langue_e`, `universites_id`)
VALUES
  -- FACULTÉS (2) — sur campus de Soa
  ('Faculté de Sciences Juridiques et Politiques de Yaoundé II',
   'FSJP-UY2', 'on', 'sup', 'Fr', 22),  -- id=365

  ('Faculté de Sciences Economiques et de Gestion de Yaoundé II',
   'FSEG-UY2', 'on', 'sup', 'Fr', 22),  -- id=366

  -- INSTITUTS (3)
  ('Institut de Formation et Recherche Démographiques',
   'IFORD',    'on', 'sup', 'Fr', 22),  -- id=367  campus Ngoa Ekelle

  ('Institut des Relations Internationales du Cameroun',
   'IRIC',     'on', 'sup', 'Fr', 22),  -- id=368  campus Obili

  ('Ecole Supérieure des Sciences et Techniques de l\'Information et de la Communication',
   'ESSTIC',   'on', 'sup', 'Fr', 22);  -- id=369  campus Ngoa Ekelle

-- Étape UY2-3 : LIAISONS

INSERT INTO `ecolecamerdb`.`campus_ecoles` (`campus_id`, `ecole_id`) VALUES
  -- Campus de Soa
  (241, 365),  -- FSJP-UY2
  (241, 366),  -- FSEG-UY2
  -- Campus Ngoa Ekelle UY2
  (242, 367),  -- IFORD
  (242, 369),  -- ESSTIC
  -- Campus Obili UY2
  (243, 368);  -- IRIC

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- RÉCAPITULATIF
-- ============================================================
-- UY1 (Yaoundé I, id=21) :
--   Campus créés   : 2 (ids 239-240)
--   Écoles créées  : 7 (ids 358-364)
--   Liaisons       : 7
--   Ignorées       : Ecoles Doctorales (entités de recherche)
--
-- UY2 (Yaoundé II, id=22) :
--   Campus créés   : 3 (ids 241-243 : Soa / Ngoa Ekelle / Obili)
--   Écoles créées  : 5 (ids 365-369)
--   Liaisons       : 5
--   Non modélisées : Annexes FSJP de Bertoua et Ebolowa
--
-- TOTAL CE FICHIER : 5 campus / 12 écoles / 12 liaisons
-- ============================================================