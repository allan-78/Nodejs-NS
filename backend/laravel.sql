-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 07, 2025 at 09:53 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `laravel`
--

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `product_id`, `quantity`, `created_at`, `updated_at`) VALUES
(35, 31, 6, 1, '2025-06-30 07:56:40', '2025-06-30 07:56:40'),
(36, 31, 1, 1, '2025-06-30 08:12:52', '2025-06-30 08:12:52');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Power Tools', 'power-tools', 'Electric and battery-powered tools for construction and woodworking', '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(2, 'Hand Tools', 'hand-tools', 'Traditional manual tools for various tasks', '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(3, 'Fasteners', 'fasteners', 'Nails, screws, bolts and other hardware fasteners', '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(4, 'Safety Equipment', 'safety-equipment', 'Protective gear for construction and industrial work', '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(5, 'Paint & Supplies', 'paint-supplies', 'Paints, brushes, rollers and related materials', '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(6, 'Ego', 'ego', NULL, '2025-04-21 16:30:49', '2025-04-21 16:30:49');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `stock`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Cordless Drill', 'cordless-drill', '18V Lithium-Ion Cordless Drill/Driver Kit', 129.99, 1, 31, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(2, 'Circular Saw', 'circular-saw', '7-1/4 Inch Circular Saw with Laser Guide', 89.99, 1, 23, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(3, 'Hammer', 'hammer', '16 oz Curved Claw Hammer with Fiberglass Handle', 14.99, 2, 74, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(4, 'Screwdriver Set', 'screwdriver-set', '8-Piece Precision Screwdriver Set', 12.99, 2, 51, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(5, 'Wood Screws', 'wood-screws', '#8 x 1-1/4 Inch Coarse Thread Drywall Screws (1 lb)', 5.99, 3, 120, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(6, 'Safety Glasses', 'safety-glasses', 'Clear Anti-Fog Safety Glasses with UV Protection', 8.99, 4, 64, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(7, 'Paint Roller', 'paint-roller', '9 Inch Paint Roller with 1/2 Inch Nap Cover', 6.99, 5, 42, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(8, 'Paint Brush', 'paint-brush', '2 Inch Angled Sash Paint Brush', 4.99, 5, 27, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(9, 'Level', 'level', '48 Inch Aluminum Level with Magnetic Edge', 24.99, 2, 27, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(10, 'Tape Measure', 'tape-measure', '25 ft. Tape Measure with Magnetic Hook', 12.99, 2, 53, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(11, 'Utility Knife', 'utility-knife', 'Retractable Utility Knife with 5 Blades', 7.99, 2, 67, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(12, 'Pliers Set', 'pliers-set', '3-Piece Slip Joint Pliers Set', 19.99, 2, 39, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(13, 'Wrench Setsss', 'wrench-set', '10-Piece Combination Wrench Set', 29.99, 2, 31, 1, '2025-04-21 06:52:32', '2025-04-21 16:23:24'),
(14, 'Socket Set', 'socket-set', '40-Piece Socket Set with Case', 49.99, 2, 22, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(15, 'Work Gloves', 'work-gloves', 'Leather Palm Work Gloves, Pair', 9.99, 4, 58, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(16, 'Hard Hat', 'hard-hat', 'ANSI-Compliant Hard Hat with 4-Point Suspension', 19.99, 4, 34, 1, '2025-04-21 06:52:33', '2025-04-21 07:32:49'),
(17, 'Ear Protection', 'ear-protection', 'Noise Reduction Rating 27 dB Ear Muffs', 14.99, 4, 41, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(18, 'Dust Mask', 'dust-mask', 'N95 Particulate Respirator Mask (10-Pack)', 12.99, 4, 86, 1, '2025-04-21 06:52:33', '2025-04-21 17:39:36'),
(19, 'Knee Pads', 'knee-pads', 'Gel-Foam Knee Pads with Adjustable Straps', 16.99, 4, 29, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(20, 'Paint Tray', 'paint-tray', '9 Inch Plastic Paint Tray with Liner', 3.99, 5, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(21, 'Painters Tape', 'painters-tape', '1.41 Inch x 60 Yards Blue Painters Tape', 5.99, 5, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(22, 'Drop Cloth', 'drop-cloth', '9 ft x 12 ft Canvas Drop Cloth', 14.99, 5, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(23, 'Paint Stirrer', 'p paint-stirrer', 'Pack of 50 Wooden Paint Stirrers', 2.99, 5, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(24, 'Paint Can Opener', 'paint-can-opener', 'Metal Paint Can Opener Tool', 1.99, 5, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(25, 'Impact Driver', 'impact-driver', '20V MAX Lithium-Ion Cordless Impact Driver', 149.99, 1, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(26, 'Reciprocating Saw', 'reciprocating-saw', '12 Amp Corded Reciprocating Saw', 99.99, 1, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(27, 'Orbital Sander', 'orbital-sander', '5 Inch Random Orbit Sander with Dust Bag', 59.99, 1, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(28, 'Jigsaw', 'jigsaw', '6.5 Amp Corded Variable Speed Jigsaw', 69.99, 1, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(29, 'Angle Grinder', 'angle-grinder', '4-1/2 Inch Angle Grinder with Paddle Switch', 79.99, 1, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(30, 'Router', 'router', '2-1/4 HP Fixed Base Router', 119.99, 1, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(31, 'Table Saw', 'table-saw', '10 Inch Portable Jobsite Table Saw', 399.99, 1, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(32, 'Miter Saw', 'miter-saw', '10 Inch Sliding Compound Miter Saw', 299.99, 1, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(33, 'Air Compressor', 'air-compressor', '6 Gallon Pancake Air Compressor', 129.99, 1, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(34, 'Brad Nails', 'brad-nails', '18 Gauge 1-1/4 Inch Brad Nails (1000-Pack)', 8.99, 3, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(35, 'Finish Nails', 'finish-nails', '16 Gauge 2 Inch Finish Nails (1000-Pack)', 9.99, 3, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(36, 'Drywall Screws', 'drywall-screws', '#6 x 1-1/4 Inch Drywall Screws (1 lb)', 4.99, 3, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(37, 'Deck Screws', 'deck-screws', '#8 x 2-1/2 Inch Deck Screws (5 lb)', 24.99, 3, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(38, 'Lag Screws', 'lag-screws', '1/4 x 3 Inch Hex Lag Screws (25-Pack)', 12.99, 3, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(39, 'Carriage Bolts', 'carriage-bolts', '1/4-20 x 2 Inch Carriage Bolts (10-Pack)', 5.99, 3, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(40, 'Hex Nuts', 'hex-nuts', '1/4-20 Hex Nuts (25-Pack)', 3.99, 3, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(41, 'Washers', 'washers', '1/4 Inch Flat Washers (100-Pack)', 4.99, 3, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(42, 'Anchors', 'anchors', '1/4 Inch Plastic Wall Anchors (50-Pack)', 3.99, 3, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(43, 'Picture Hangers', 'picture-hangers', 'Assorted Picture Hangers Kit (50-Pack)', 6.99, 3, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(44, 'Wire Nuts', 'wire-nuts', 'Assorted Wire Connectors (50-Pack)', 5.99, 3, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(45, 'Extension Cord', 'extension-cord', '50 ft. 16/3 Outdoor Extension Cord', 39.99, 1, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(46, 'Power Strip', 'power-strip', '6-Outlet Surge Protector with USB Ports', 19.99, 1, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(47, 'Work Light', 'work-light', 'LED Tripod Work Light with 3 Light Modes', 29.99, 1, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(48, 'Tool Bag', 'tool-bag', '20 Inch Heavy-Duty Tool Bag with Pockets', 24.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(49, 'Tool Box', 'tool-box', '22 Inch Plastic Tool Box with T tray', 19.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(50, 'Tool Belt', 'tool-belt', 'Adjustable Canvas Tool Belt with Pouches', 22.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(51, 'Caulk Gun', 'caulk-gun', 'Heavy Duty Smooth Rod Caulk Gun', 9.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(52, 'Putty Knife', 'putty-knife', '3 Inch Flexible Putty Knife', 4.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(53, 'Paint Scraper', 'paint-scraper', '2 Inch Razor Blade Paint Scraper', 6.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(54, 'Chisel Set', 'chisel-set', '4-Piece Wood Chisel Set', 24.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(55, 'Files Set', 'files-set', '6-Piece Needle File Set', 12.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(56, 'Allan Monforte', 'allan-monforte', 'a human', 213.00, 2, 2321, 1, '2025-04-21 07:41:28', '2025-04-21 16:49:25'),
(58, 'EgoEgo', 'egoego', 'egoegoego', 1.00, 6, 123097, 1, '2025-04-21 16:31:19', '2025-04-21 17:16:54'),
(59, 'Egogegogoegoe', 'egogegogoegoe', 'asfasafsa', 12312312.00, 6, 123212, 1, '2025-04-21 16:57:09', '2025-04-21 17:16:54'),
(60, 'levi', 'fasfasffasfsf', 'fasfas', 23.00, 6, 1231230, 1, '2025-04-21 17:30:49', '2025-04-21 17:37:16');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `comment` text NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `product_id`, `comment`, `rating`, `created_at`, `updated_at`) VALUES
(200, 29, 8, 'asfas', 4, '2025-06-26 07:58:07', '2025-06-26 07:58:07'),
(205, 29, 2, 'fasfas', 5, '2025-07-02 00:12:24', '2025-07-02 00:40:32'),
(206, 29, 1, 'adasfasf', 4, '2025-07-07 07:08:04', '2025-07-07 07:08:04');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','completed','failed','refunded') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `total_price`, `status`, `created_at`, `updated_at`) VALUES
(211, 29, 284.87, 'completed', '2025-06-26 06:44:00', '2025-06-26 06:44:00'),
(212, 29, 129.99, 'pending', '2025-06-26 06:47:27', '2025-06-26 06:47:27'),
(213, 29, 14.99, 'pending', '2025-06-26 06:50:37', '2025-06-26 06:50:37'),
(214, 29, 8.99, 'pending', '2025-06-26 06:51:43', '2025-06-26 06:51:43'),
(215, 29, 144.98, 'completed', '2025-06-26 07:06:04', '2025-06-26 07:06:04'),
(216, 29, 64.95, 'pending', '2025-06-26 07:08:34', '2025-06-26 07:08:34'),
(217, 29, 489.95, 'pending', '2025-06-30 05:31:21', '2025-06-30 05:31:21'),
(218, 31, 129.99, 'pending', '2025-06-30 07:45:11', '2025-06-30 07:45:11'),
(219, 29, 519.96, 'pending', '2025-07-02 02:24:24', '2025-07-02 02:24:24'),
(220, 29, 89.99, 'pending', '2025-07-02 02:26:20', '2025-07-02 02:26:20'),
(221, 29, 14.99, 'pending', '2025-07-02 02:27:53', '2025-07-02 02:27:53'),
(222, 29, 4.99, 'pending', '2025-07-02 02:29:28', '2025-07-02 02:29:28'),
(223, 29, 129.99, 'pending', '2025-07-02 02:29:59', '2025-07-02 02:29:59'),
(224, 29, 129.99, 'pending', '2025-07-02 02:32:34', '2025-07-02 02:32:34'),
(225, 29, 129.99, 'pending', '2025-07-02 02:38:56', '2025-07-02 02:38:56'),
(226, 29, 129.99, 'pending', '2025-07-02 02:52:20', '2025-07-02 02:52:20'),
(227, 29, 89.99, 'pending', '2025-07-02 02:55:48', '2025-07-02 02:55:48'),
(228, 29, 89.99, 'pending', '2025-07-02 02:58:58', '2025-07-02 02:58:58'),
(229, 29, 89.99, 'pending', '2025-07-02 03:01:41', '2025-07-02 03:01:41'),
(230, 29, 129.99, 'pending', '2025-07-07 07:08:31', '2025-07-07 07:08:31');

-- --------------------------------------------------------

--
-- Table structure for table `transaction_items`
--

CREATE TABLE `transaction_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `transaction_items`
--

INSERT INTO `transaction_items` (`id`, `transaction_id`, `product_id`, `quantity`, `price`, `created_at`, `updated_at`) VALUES
(1, 211, 1, 1, 129.99, NULL, NULL),
(2, 211, 8, 10, 4.99, NULL, NULL),
(3, 211, 2, 1, 89.99, NULL, NULL),
(4, 211, 3, 1, 14.99, NULL, NULL),
(5, 212, 1, 1, 129.99, NULL, NULL),
(6, 213, 3, 1, 14.99, '2025-06-25 22:50:37', '2025-06-25 22:50:37'),
(7, 214, 6, 1, 8.99, '2025-06-25 22:51:43', '2025-06-25 22:51:43'),
(8, 215, 3, 1, 14.99, '2025-06-25 23:06:04', '2025-06-25 23:06:04'),
(9, 215, 1, 1, 129.99, '2025-06-25 23:06:04', '2025-06-25 23:06:04'),
(10, 216, 4, 5, 12.99, '2025-06-25 23:08:34', '2025-06-25 23:08:34'),
(11, 217, 1, 1, 129.99, '2025-06-29 21:31:21', '2025-06-29 21:31:21'),
(12, 217, 2, 4, 89.99, '2025-06-29 21:31:21', '2025-06-29 21:31:21'),
(13, 218, 1, 1, 129.99, '2025-06-29 23:45:11', '2025-06-29 23:45:11'),
(14, 219, 1, 1, 129.99, '2025-07-01 18:24:24', '2025-07-01 18:24:24'),
(15, 219, 1, 1, 129.99, '2025-07-01 18:24:24', '2025-07-01 18:24:24'),
(16, 219, 1, 1, 129.99, '2025-07-01 18:24:24', '2025-07-01 18:24:24'),
(17, 219, 1, 1, 129.99, '2025-07-01 18:24:24', '2025-07-01 18:24:24'),
(18, 220, 2, 1, 89.99, '2025-07-01 18:26:20', '2025-07-01 18:26:20'),
(19, 221, 3, 1, 14.99, '2025-07-01 18:27:53', '2025-07-01 18:27:53'),
(20, 222, 8, 1, 4.99, '2025-07-01 18:29:28', '2025-07-01 18:29:28'),
(21, 223, 1, 1, 129.99, '2025-07-01 18:29:59', '2025-07-01 18:29:59'),
(22, 224, 1, 1, 129.99, '2025-07-01 18:32:34', '2025-07-01 18:32:34'),
(23, 225, 1, 1, 129.99, '2025-07-01 18:38:56', '2025-07-01 18:38:56'),
(24, 226, 1, 1, 129.99, '2025-07-01 18:52:20', '2025-07-01 18:52:20'),
(25, 227, 2, 1, 89.99, '2025-07-01 18:55:48', '2025-07-01 18:55:48'),
(26, 228, 2, 1, 89.99, '2025-07-01 18:58:58', '2025-07-01 18:58:58'),
(27, 229, 2, 1, 89.99, '2025-07-01 19:01:41', '2025-07-01 19:01:41'),
(28, 230, 1, 1, 129.99, '2025-07-06 23:08:31', '2025-07-06 23:08:31');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `profile_photo_path` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `role` varchar(255) NOT NULL DEFAULT 'customer',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `verification_token` varchar(255) DEFAULT NULL,
  `api_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `profile_photo_path`, `status`, `role`, `remember_token`, `created_at`, `updated_at`, `verification_token`, `api_token`) VALUES
(29, 'Allanxssss', 'allanmonforte1@gmail.com', '2025-06-25 02:22:52', '$2b$10$EFn6N5AeY0QtNiY6VR92KO32.bIV3o54e12lP9vw02RUoavdOoB2u', 'images/profiles/WIN_20250625_07_55_06_Pro-1751268962999-234718633.jpg', 'active', 'admin', NULL, '2025-06-25 02:22:25', '2025-06-30 08:19:46', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTg3MjgzNH0.9hsHB0Fr_AO6yPJA-hRyf399NQvCIkKbeCgOyyuYOUQ'),
(30, 'Jay Tabigue', 'jay@gmail.com', '2025-06-26 05:14:07', '$2b$10$fpErcKtgKZ9SWerbK6adM.u.UUbhS0MPGvBtrKkrxKLWuqobcireK', NULL, 'active', 'customer', NULL, '2025-06-26 05:13:52', '2025-06-26 05:13:52', NULL, NULL),
(31, 'levibadings', 'levi@bading.com', '2025-06-30 07:44:49', '$2b$10$2hpJehSuAY7IswDmZCuqB.YLVT/TyLEkpFfJso0ai8RHCThuT36Ge', 'images/profiles/WIN_20250206_19_03_39_Pro-1751271177778-28412881.jpg', 'active', 'admin', NULL, '2025-06-30 07:41:21', '2025-06-30 08:13:01', NULL, NULL),
(32, 'billioneds', 'billionedbading@bading.com', '2025-06-30 08:14:09', '$2b$10$v070TuzcQed4e8m0sWG1deqYQa0E8q5Nf.gYTveKym/S8sLnClBF2', 'images/profiles/WIN_20250215_09_52_56_Pro-1751271363405-157960437.jpg', 'inactive', 'customer', NULL, '2025-06-30 08:13:44', '2025-06-30 08:16:08', NULL, NULL),
(36, 'Allan123', 'admin@example.com', '2025-07-02 01:52:31', '$2b$10$osu4Vk3J.NciWCjuQlxsTOQNgyik9.7TsPk8Ruzy8LivnWm/rwIty', NULL, 'active', 'customer', NULL, '2025-07-02 01:52:00', '2025-07-02 01:52:00', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzYsImlhdCI6MTc1MTQyMjEzOX0.vi_yaNXFkouhlYZzeAZscmi5mXtZfd8hS-MxCFJlu2A'),
(37, 'Cordless DrillX', 'levi@badings.com', NULL, '$2b$10$MD5BhnH8H.vvH0XBDd7TyuF1mimubpfV9qjGDHFPCiAl5NbHMgyZy', NULL, 'active', 'customer', NULL, '2025-07-02 02:02:21', '2025-07-02 02:02:21', '426a7f128e08d0024478ee4b0952cf34539085c962ed1bc9834679cc0f79d954', '02355171d1be15c252fa574598539bac5517573de5a4c4099115053659cf500b');

-- --------------------------------------------------------

--
-- Table structure for table `user_tokens`
--

CREATE TABLE `user_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `used_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_tokens`
--

INSERT INTO `user_tokens` (`id`, `user_id`, `token`, `type`, `created_at`, `expires_at`, `used_at`) VALUES
(4, 36, '4894c62e5f690d487fc1dd4734bb2e0064d1d6afbb8ea3336993627cece7dcf0', 'verification', '2025-07-02 01:52:00', '2025-07-03 01:52:00', '2025-07-02 01:52:31'),
(5, 36, '66def8883b33ee3a5b79296b029915ef5c70b587fed4d8427c390ed697ff1853', 'auth', '2025-07-02 01:52:00', NULL, NULL),
(6, 36, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzYsImlhdCI6MTc1MTQyMTcwMn0.717KtwBtVeNOD3r_HcbvEcsGKwUuD1SjIR5kIaric3Y', 'auth', '2025-07-02 02:01:42', NULL, NULL),
(7, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImlhdCI6MTc1MTQyMTcxNH0.mKosYF3kCIJIsZaJI47v65LWk4rJRlKjMSYMCoww2-4', 'auth', '2025-07-02 02:01:54', NULL, NULL),
(8, 37, '426a7f128e08d0024478ee4b0952cf34539085c962ed1bc9834679cc0f79d954', 'verification', '2025-07-02 02:02:21', '2025-07-03 02:02:21', NULL),
(9, 37, '02355171d1be15c252fa574598539bac5517573de5a4c4099115053659cf500b', 'auth', '2025-07-02 02:02:21', NULL, NULL),
(10, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImlhdCI6MTc1MTQyMTc5Nn0.uSZQcMbTl4z7BHYkh_c87PCQmbJV_KMKrgBTcTPCFHc', 'auth', '2025-07-02 02:03:16', NULL, NULL),
(11, 36, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzYsImlhdCI6MTc1MTQyMjEzOX0.vi_yaNXFkouhlYZzeAZscmi5mXtZfd8hS-MxCFJlu2A', 'auth', '2025-07-02 02:08:59', NULL, NULL),
(12, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImlhdCI6MTc1MTQyMjE1Mn0.lzTBCMZYLNshB6ZqXS88rHAm-uqCbC7QB-iW0UehlPs', 'auth', '2025-07-02 02:09:12', NULL, NULL),
(13, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImlhdCI6MTc1MTQyMjM0NH0.cw0262wr0_hMiGTTszWYUAAODcihVh5_yNai7Y5pAqg', 'auth', '2025-07-02 02:12:24', NULL, NULL),
(14, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImlhdCI6MTc1MTQyMjU5NH0.qeSc1QyVyAQ_eWHtBozzFZnXWVsaaUkZEoB9attdNuY', 'auth', '2025-07-02 02:16:34', NULL, NULL),
(15, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImlhdCI6MTc1MTg3MjA2N30.FK_b4wZULaBH9nBIG1icPId842_49Jib7nXTWrR0NYw', 'auth', '2025-07-07 07:07:47', NULL, NULL),
(16, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTg3MjYzMH0.v6_JrcXiGuIOpkiiqyuBfEzQqG4xtbEIRdKujeUJM6k', 'auth', '2025-07-07 07:17:10', NULL, NULL),
(17, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTg3Mjc1MH0.GiFXOlXkH2xvKaXsPZ5eALIqIIGwVbRkiU0-Fx1zsYs', 'auth', '2025-07-07 07:19:10', NULL, NULL),
(18, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTg3MjgzNH0.9hsHB0Fr_AO6yPJA-hRyf399NQvCIkKbeCgOyyuYOUQ', 'auth', '2025-07-07 07:20:34', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `carts_user_id_foreign` (`user_id`),
  ADD KEY `carts_product_id_foreign` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`),
  ADD KEY `products_category_id_foreign` (`category_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_images_product_id_foreign` (`product_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviews_user_id_foreign` (`user_id`),
  ADD KEY `reviews_product_id_foreign` (`product_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transactions_user_id_foreign` (`user_id`);

--
-- Indexes for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_items_transaction_id_foreign` (`transaction_id`),
  ADD KEY `transaction_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_tokens_user_id_foreign` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=179;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=207;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=231;

--
-- AUTO_INCREMENT for table `transaction_items`
--
ALTER TABLE `transaction_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `carts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD CONSTRAINT `transaction_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_items_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD CONSTRAINT `user_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
