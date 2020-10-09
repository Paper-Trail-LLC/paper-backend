-- INSERT DB CREATE TABLES HERE
-- BOOK-----------------------------------------------------------------
DROP TABLE IF EXISTS `book`;
CREATE TABLE `book` (
  `id` varbinary(16) NOT NULL,
  `title` tinytext NOT NULL,
  `isbn` varchar(10) DEFAULT NULL,
  `isbn13` varchar(13) NOT NULL,
  `release_date` date DEFAULT NULL,
  `edition` tinytext,
  `image_url` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `isbn13_UNIQUE` (`isbn13`),
  UNIQUE KEY `isbn_UNIQUE` (`isbn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- USER --------------------------------------------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` varbinary(16) NOT NULL,
  `firstname` varchar(30) DEFAULT NULL,
  `lastname` varchar(60) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `hash` varchar(45) NOT NULL,
  `salt` varchar(45) NOT NULL,
  `geolocation` point NOT NULL,
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Author -----------------------------------------------------------
DROP TABLE IF EXISTS `author`;
CREATE TABLE `author` (
  `id` varbinary(16) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Role ------------------------------------------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` varbinary(16) NOT NULL,
  `name` varchar(45) NOT NULL,
  `permissions` json NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci KEY_BLOCK_SIZE=1;

-- User Role --------------------------------------------------------
DROP TABLE IF EXISTS `user_role`;
CREATE TABLE `user_role` (
  `user_id` varbinary(16) NOT NULL,
  `role_id` varbinary(16) NOT NULL,
  `assigned_by` varbinary(16) NOT NULL,
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `_idx` (`assigned_by`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `assignee` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `assigner` FOREIGN KEY (`assigned_by`) REFERENCES `user` (`id`),
  CONSTRAINT `role_id` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- User book ---------------------------------------------------------
DROP TABLE IF EXISTS `user_book`;
CREATE TABLE `user_book` (
  `id` varbinary(16) NOT NULL,
  `user_id` varbinary(16) NOT NULL,
  `book_id` varbinary(16) NOT NULL,
  `status` varchar(45) DEFAULT NULL,
  `lending` tinyint NOT NULL DEFAULT '0',
  `selling` tinyint NOT NULL DEFAULT '0',
  `geolocation` point DEFAULT NULL,
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_idx` (`user_id`),
  KEY `book_idx` (`book_id`),
  CONSTRAINT `book` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`),
  CONSTRAINT `owner` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- User book picture ------------------------------------------------
DROP TABLE IF EXISTS `user_book_picture`;
CREATE TABLE `user_book_picture` (
  `id` varbinary(16) NOT NULL,
  `user_book_id` varbinary(16) NOT NULL,
  `url` text NOT NULL,
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_book_idx` (`user_book_id`),
  CONSTRAINT `user_book` FOREIGN KEY (`user_book_id`) REFERENCES `user_book` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Phone -------------------------------------------------------------
DROP TABLE IF EXISTS `phone`;
CREATE TABLE `phone` (
  `country_code` varchar(5) NOT NULL,
  `number` varchar(7) NOT NULL,
  `user_id` varbinary(16) NOT NULL,
  `type` varchar(15) NOT NULL,
  `updated_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`country_code`,`number`,`user_id`),
  KEY `id_idx` (`user_id`),
  CONSTRAINT `id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Custom book ------------------------------------------------------
DROP TABLE IF EXISTS `custom_book`;
CREATE TABLE `custom_book` (
  `book_id` varbinary(16) NOT NULL,
  `user_id` varbinary(16) NOT NULL,
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`book_id`),
  KEY `owner_idx` (`user_id`),
  CONSTRAINT `book_info` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`),
  CONSTRAINT `book_owner` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Book author ----------------------------------------------------
DROP TABLE IF EXISTS `book_author`;
CREATE TABLE `book_author` (
  `book_id` varbinary(16) NOT NULL,
  `author_id` varbinary(16) NOT NULL,
  PRIMARY KEY (`book_id`,`author_id`),
  KEY `book_author_idx` (`author_id`),
  CONSTRAINT `book_author` FOREIGN KEY (`author_id`) REFERENCES `author` (`id`),
  CONSTRAINT `book_work` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Book petition -------------------------------------------------------
DROP TABLE IF EXISTS `book_petition`;
CREATE TABLE `book_petition` (
  `id` varbinary(16) NOT NULL,
  `book_id` varbinary(16) NOT NULL,
  `user_id` varbinary(16) NOT NULL,
  `description` text NOT NULL,
  `lending` tinyint DEFAULT NULL,
  `selling` tinyint DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `geolocation` point DEFAULT NULL,
  `location_radius` int DEFAULT NULL,
  `expiration_date` datetime NOT NULL,
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `book_id_petition_idx` (`book_id`),
  KEY `user_id_petition_idx` (`user_id`),
  CONSTRAINT `book_id_petition` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`),
  CONSTRAINT `user_id_petition` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Book offer --------------------------------------------------------
DROP TABLE IF EXISTS `offer`;
CREATE TABLE `offer` (
  `id` varbinary(16) NOT NULL,
  `book_petition_id` varbinary(16) NOT NULL,
  `user_book_id` varbinary(16) NOT NULL,
  `description` text,
  `accepted` tinyint NOT NULL DEFAULT '0',
  `geolocation` point NOT NULL,
  `lending` tinyint NOT NULL,
  `selling` tinyint NOT NULL,
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `petition_idx` (`book_petition_id`),
  KEY `user_book_idx` (`user_book_id`),
  CONSTRAINT `petition` FOREIGN KEY (`book_petition_id`) REFERENCES `book_petition` (`id`),
  CONSTRAINT `user_book_offered` FOREIGN KEY (`user_book_id`) REFERENCES `user_book` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `borrowing_agreement`-----------------------
DROP TABLE IF EXISTS `borrowing_agreement`;
CREATE TABLE `borrowing_agreement` (
  `id` varbinary(16) NOT NULL,
  `user_book_id` varbinary(16) NOT NULL,
  `user_id` varbinary(16) NOT NULL,
  `status` varchar(45) DEFAULT NULL,
  `return_date` datetime NOT NULL,
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id_borrowing_idx` (`user_id`),
  KEY `book_id_borrowing_idx` (`user_book_id`),
  CONSTRAINT `user_book_id_borrowing` FOREIGN KEY (`user_book_id`) REFERENCES `user_book` (`id`),
  CONSTRAINT `user_id_borrowing` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;