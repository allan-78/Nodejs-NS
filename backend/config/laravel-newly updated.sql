-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 05, 2025 at 09:28 AM
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
(36, 31, 1, 1, '2025-06-30 08:12:52', '2025-06-30 08:12:52'),
(51, 38, 1, 1, '2025-07-14 07:35:44', '2025-07-14 07:35:44'),
(60, 41, 3, 1, '2025-08-04 03:21:49', '2025-08-04 03:21:49'),
(76, 29, 1, 1, '2025-08-05 02:47:42', '2025-08-05 02:47:42');

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
(1, 'Power Toolss', 'power-tools', 'Electric and battery-powered tools for construction and woodworking', '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(2, 'Hand Tools', 'hand-tools', 'Traditional manual tools for various tasks', '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(3, 'Fasteners', 'fasteners', 'Nails, screws, bolts and other hardware fasteners', '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(4, 'Safety Equipment', 'safety-equipment', 'Protective gear for construction and industrial work', '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(5, 'Paint & Supplies', 'paint-supplies', 'Paints, brushes, rollers and related materials', '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(6, 'Ego', 'ego', NULL, '2025-04-21 16:30:49', '2025-04-21 16:30:49'),
(7, 'levissssssssss', 'category-7-1754378784', NULL, NULL, NULL),
(8326, 'fsfsfs', '', NULL, NULL, NULL);

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
(1, 'Cordless Drills', 'cordless-drill', '18V Lithium-Ion Cordless Drill/Driver Kit', 129.99, 6, 24, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(2, 'Circular Saw', 'circular-saw', '7-1/4 Inch Circular Saw with Laser Guide', 89.99, 6, 22, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(3, 'Hammer', 'hammer', '16 oz Curved Claw Hammer with Fiberglass Handle', 14.99, 2, 72, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(4, 'Screwdriver Set', 'screwdriver-set', '8-Piece Precision Screwdriver Set', 12.99, 2, 50, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(5, 'Wood Screws', 'wood-screws', '#8 x 1-1/4 Inch Coarse Thread Drywall Screws (1 lb)', 5.99, 3, 119, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(6, 'Safety Glasses', 'safety-glasses', 'Clear Anti-Fog Safety Glasses with UV Protection', 8.99, 4, 64, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(8, 'Paint Brush', 'paint-brush', '2 Inch Angled Sash Paint Brush', 4.99, 5, 27, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(9, 'Level', 'level', '48 Inch Aluminum Level with Magnetic Edge', 24.99, 2, 27, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
(10, 'Tape Measure', 'tape-measure', '25 ft. Tape Measure with Magnetic Hook', 12.99, 2, 53, 1, '2025-04-21 06:52:32', '2025-04-21 06:52:32'),
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
(48, 'Tool Bag', 'tool-bag', '20 Inch Heavy-Duty Tool Bag with Pockets', 24.99, 2, 71, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(49, 'Tool Box', 'tool-box', '22 Inch Plastic Tool Box with T tray', 19.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(50, 'Tool Belt', 'tool-belt', 'Adjustable Canvas Tool Belt with Pouches', 22.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(51, 'Caulk Gun', 'caulk-gun', 'Heavy Duty Smooth Rod Caulk Gun', 9.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(52, 'Putty Knife', 'putty-knife', '3 Inch Flexible Putty Knife', 4.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(53, 'Paint Scraper', 'paint-scraper', '2 Inch Razor Blade Paint Scraper', 6.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(54, 'Chisel Set', 'chisel-set', '4-Piece Wood Chisel Set', 24.99, 2, 72, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(55, 'Files Set', 'files-set', '6-Piece Needle File Set', 12.99, 2, 71, 1, '2025-04-21 06:52:33', '2025-04-21 06:52:33'),
(56, 'Allan Monforte', 'allan-monforte', 'a human', 213.00, 2, 2321, 1, '2025-04-21 07:41:28', '2025-04-21 16:49:25'),
(58, 'EgoEgo', 'egoego', 'egoegoego', 1.00, 6, 123097, 1, '2025-04-21 16:31:19', '2025-04-21 17:16:54'),
(59, 'Egogegogoegoe', 'egogegogoegoe', 'asfasafsa', 12312312.00, 6, 123212, 1, '2025-04-21 16:57:09', '2025-04-21 17:16:54'),
(60, 'levi', 'fasfasffasfsf', 'fasfas', 23.00, 6, 1231230, 1, '2025-04-21 17:30:49', '2025-04-21 17:37:16'),
(62, 'egoego', NULL, 'asfasfasfsaf', 123.00, 6, 122, 1, NULL, NULL),
(63, 'levi123', NULL, 'dasd', 323.00, 6, 323, 1, NULL, NULL),
(64, 'lumpiang ampalaya', NULL, 'masarap', 21.00, 6, 123, 1, NULL, NULL),
(65, '12312', NULL, '3123123', 99999999.99, 2, 12312312, 1, NULL, NULL),
(66, 'ff', NULL, 'fasfasfas', 123.00, 6, 12312, 1, NULL, NULL),
(67, 'allan', NULL, 'pogi', 123123.00, 6, 123123, 1, NULL, NULL),
(68, 'socket', NULL, 'afasfas', 123.00, 6, 123, 1, NULL, NULL),
(69, 'asd', NULL, 'fasfas', 213.00, 3, 123123, 1, NULL, NULL),
(70, 'bag', NULL, 'afasf', 123.00, 6, 123114, 1, NULL, NULL),
(71, 'Allan Ego', NULL, 'fasfasfs', 123.00, 6, 232, 1, NULL, NULL),
(72, 'Allan Ego', NULL, 'fasfasfs', 123.00, 6, 232, 1, NULL, NULL),
(73, 'dfdf', NULL, 'fasfas', 34.00, 2, 34434, 1, NULL, NULL),
(74, 'dfdf', NULL, 'fasfas', 34.00, 2, 34434, 1, NULL, NULL),
(75, 'dfdf', NULL, 'fasfas', 34.00, 2, 34434, 1, NULL, NULL),
(76, 'dfdf', NULL, 'fasfas', 34.00, 2, 34434, 1, NULL, NULL),
(77, 'dfdf', NULL, 'fasfas', 34.00, 2, 34434, 1, NULL, NULL),
(78, 'dfdf', NULL, 'fasfas', 34.00, 2, 34434, 1, NULL, NULL),
(79, 'dfdf', NULL, 'fasfas', 34.00, 2, 34434, 1, NULL, NULL),
(80, 'fdsf', NULL, 'fsfsd', 33.00, 3, 3434, 1, NULL, NULL),
(81, 'fdsf', NULL, 'fsfsd', 33.00, 3, 3434, 1, NULL, NULL),
(82, 'fdsf', NULL, 'fsfsd', 33.00, 3, 3434, 1, NULL, NULL),
(83, 'fdsf', NULL, 'fsfsd', 33.00, 3, 3434, 1, NULL, NULL),
(84, 'fdsf', NULL, 'fsfsd', 33.00, 3, 3434, 1, NULL, NULL),
(85, 'fdsf', NULL, 'fsfsd', 33.00, 3, 3434, 1, NULL, NULL),
(87, 'fdsf', NULL, 'fsfsd', 33.00, 3, 3434, 1, NULL, NULL),
(88, 'fdsf', NULL, 'fsfsd', 33.00, 3, 3434, 1, NULL, NULL),
(89, 'fdsf', NULL, 'fsfsd', 33.00, 3, 3434, 1, NULL, NULL),
(90, 'fdsf', NULL, 'fsfsd', 33.00, 3, 3434, 1, NULL, NULL),
(91, 'fsdfsd', NULL, 'sdsdfs', 3434.00, 2, 3434, 1, NULL, NULL),
(92, 'bumatays', NULL, 'afsas', 123123.00, 6, 123, 1, NULL, NULL),
(93, 'pandecoco', NULL, 'haha', 12.00, 6, 23, 1, NULL, NULL);

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

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_path`, `created_at`, `updated_at`) VALUES
(199, 3, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754300574961-525692197.png', NULL, NULL),
(205, 1, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754300933289-539627287.png', NULL, NULL),
(207, 4, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754300952863-748280781.png', NULL, NULL),
(208, 4, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754300952886-89560833.png', NULL, NULL),
(209, 2, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754301045061-606660151.png', NULL, NULL),
(210, 2, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754301045082-406677353.png', NULL, NULL),
(211, 5, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754302247620-852878134.png', NULL, NULL),
(212, 5, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754302247649-786512670.png', NULL, NULL),
(213, 73, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754375796217-447220852.png', NULL, NULL),
(214, 74, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754375796454-990824733.png', NULL, NULL),
(215, 75, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754375796685-903625775.png', NULL, NULL),
(216, 76, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754375796881-686230267.png', NULL, NULL),
(217, 77, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754375821577-228250080.png', NULL, NULL),
(218, 78, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754375821759-102810927.png', NULL, NULL),
(219, 79, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754375821945-114049940.png', NULL, NULL),
(220, 80, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754376107232-933852781.png', NULL, NULL),
(221, 81, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754376123138-418581795.png', NULL, NULL),
(222, 82, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754376123452-952753838.png', NULL, NULL),
(223, 83, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754376195117-622042540.png', NULL, NULL),
(224, 84, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754376195602-444389476.png', NULL, NULL),
(225, 85, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754376195837-14441243.png', NULL, NULL),
(227, 87, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754376197336-209574766.png', NULL, NULL),
(228, 88, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754376197534-868366877.png', NULL, NULL),
(229, 89, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754376197680-382877533.png', NULL, NULL),
(230, 90, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754376197853-502412824.png', NULL, NULL),
(231, 91, 'products/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754376233855-252077893.png', NULL, NULL),
(233, 92, 'products/WIN_20250522_14_23_55_Pro-1754376301685-331839693.jpg', NULL, NULL),
(234, 92, 'products/WIN_20250625_07_55_06_Pro-1754376301687-268837704.jpg', NULL, NULL),
(235, 93, 'products/WIN_20250522_14_23_55_Pro-1754376780862-321221263.jpg', NULL, NULL);

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
(205, 30, 22, 'fasfas', 4, '2025-07-02 00:12:24', '2025-07-02 00:40:32'),
(207, 30, 1, 'asfasfsa', 5, NULL, NULL),
(208, 29, 6, 'fasfas', 5, '2025-07-17 07:34:32', '2025-07-17 07:34:32'),
(209, 29, 3, 'fasfasf\n', 5, '2025-08-05 01:18:42', '2025-08-05 01:18:42'),
(211, 30, 92, 'gagaghjjjhg', 2, NULL, NULL);

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
(214, 29, 8.99, 'completed', '2025-06-26 06:51:43', '2025-08-05 05:46:25'),
(215, 29, 144.98, 'completed', '2025-06-26 07:06:04', '2025-08-04 04:50:59'),
(216, 29, 64.95, 'completed', '2025-06-26 07:08:34', '2025-07-14 07:46:06'),
(217, 29, 489.95, 'completed', '2025-06-30 05:31:21', '2025-07-29 01:17:41'),
(218, 31, 129.99, 'completed', '2025-06-30 07:45:11', '2025-07-29 01:17:58'),
(219, 29, 519.96, '', '2025-07-02 02:24:24', '2025-07-17 07:28:49'),
(220, 29, 89.99, 'completed', '2025-07-02 02:26:20', '2025-07-09 01:26:06'),
(225, 29, 129.99, 'pending', '2025-07-02 02:38:56', '2025-07-02 02:38:56'),
(226, 29, 129.99, 'completed', '2025-07-02 02:52:20', '2025-07-07 08:35:59'),
(231, 38, 129.99, 'completed', '2025-07-14 06:33:16', '2025-07-28 03:15:15'),
(232, 29, 287.96, 'pending', '2025-07-29 00:34:51', '2025-07-29 00:34:51'),
(233, 29, 252.99, 'pending', '2025-07-29 01:27:22', '2025-07-29 01:27:22'),
(234, 29, 129.99, 'pending', '2025-07-29 01:34:20', '2025-07-29 01:34:20'),
(235, 29, 129.99, 'pending', '2025-07-29 01:40:34', '2025-07-29 01:40:34'),
(236, 29, 252.99, 'pending', '2025-08-04 04:38:51', '2025-08-04 04:38:51'),
(237, 29, 123.00, 'pending', '2025-08-04 04:41:34', '2025-08-04 04:41:34'),
(238, 29, 12.99, 'pending', '2025-08-04 04:47:10', '2025-08-04 04:47:10'),
(241, 29, 14.99, 'pending', '2025-08-04 23:43:18', '2025-08-04 23:43:18'),
(242, 29, 5.99, 'pending', '2025-08-05 00:02:01', '2025-08-05 00:02:01'),
(243, 29, 123.00, 'pending', '2025-08-05 00:04:22', '2025-08-05 00:04:22'),
(244, 29, 24.99, 'pending', '2025-08-05 00:46:39', '2025-08-05 00:46:39'),
(245, 29, 123.00, 'pending', '2025-08-05 00:56:35', '2025-08-05 00:56:35'),
(246, 29, 212.99, 'pending', '2025-08-05 01:01:26', '2025-08-05 01:01:26'),
(247, 29, 123.00, 'pending', '2025-08-05 01:02:35', '2025-08-05 01:02:35'),
(248, 29, 123.00, 'pending', '2025-08-05 01:05:56', '2025-08-05 01:05:56');

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
(23, 225, 1, 1, 129.99, '2025-07-01 18:38:56', '2025-07-01 18:38:56'),
(24, 226, 1, 1, 129.99, '2025-07-01 18:52:20', '2025-07-01 18:52:20'),
(29, 231, 1, 1, 129.99, '2025-07-13 22:33:16', '2025-07-13 22:33:16'),
(30, 232, 1, 1, 129.99, '2025-07-28 16:34:51', '2025-07-28 16:34:51'),
(31, 232, 1, 1, 129.99, '2025-07-28 16:34:51', '2025-07-28 16:34:51'),
(32, 232, 3, 1, 14.99, '2025-07-28 16:34:51', '2025-07-28 16:34:51'),
(33, 232, 4, 1, 12.99, '2025-07-28 16:34:51', '2025-07-28 16:34:51'),
(34, 233, 62, 1, 123.00, '2025-07-28 17:27:22', '2025-07-28 17:27:22'),
(35, 233, 1, 1, 129.99, '2025-07-28 17:27:22', '2025-07-28 17:27:22'),
(36, 234, 1, 1, 129.99, '2025-07-28 17:34:20', '2025-07-28 17:34:20'),
(37, 235, 1, 1, 129.99, '2025-07-28 17:40:34', '2025-07-28 17:40:34'),
(38, 236, 1, 1, 129.99, '2025-08-03 20:38:51', '2025-08-03 20:38:51'),
(39, 236, 70, 1, 123.00, '2025-08-03 20:38:51', '2025-08-03 20:38:51'),
(40, 237, 70, 1, 123.00, '2025-08-03 20:41:34', '2025-08-03 20:41:34'),
(41, 238, 55, 1, 12.99, '2025-08-03 20:47:10', '2025-08-03 20:47:10'),
(44, 241, 3, 1, 14.99, '2025-08-04 15:43:18', '2025-08-04 15:43:18'),
(45, 242, 5, 1, 5.99, '2025-08-04 16:02:01', '2025-08-04 16:02:01'),
(46, 243, 70, 1, 123.00, '2025-08-04 16:04:22', '2025-08-04 16:04:22'),
(47, 244, 48, 1, 24.99, '2025-08-04 16:46:39', '2025-08-04 16:46:39'),
(48, 245, 70, 1, 123.00, '2025-08-04 16:56:35', '2025-08-04 16:56:35'),
(49, 246, 70, 1, 123.00, '2025-08-04 17:01:26', '2025-08-04 17:01:26'),
(50, 246, 2, 1, 89.99, '2025-08-04 17:01:26', '2025-08-04 17:01:26'),
(51, 247, 70, 1, 123.00, '2025-08-04 17:02:35', '2025-08-04 17:02:35'),
(52, 248, 70, 1, 123.00, '2025-08-04 17:05:56', '2025-08-04 17:05:56');

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
  `api_token` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `profile_photo_path`, `status`, `role`, `remember_token`, `created_at`, `updated_at`, `verification_token`, `api_token`) VALUES
(29, 'Allanxsssssss', 'allanmonforte1@gmail.com', '2025-06-25 02:22:52', '$2b$10$EFn6N5AeY0QtNiY6VR92KO32.bIV3o54e12lP9vw02RUoavdOoB2u', 'images/profiles/WIN_20250625_07_55_06_Pro-1751268962999-234718633.jpg', 'active', 'user', NULL, '2025-06-25 02:22:25', '2025-07-29 03:01:54', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzY5NzcyfQ.stGFngEg9ChUBw1SAXhtxDyck1CrTcpMSrIzP8T_jyc'),
(30, 'Jay Tabigue', 'jay@gmail.com', '2025-06-26 05:14:07', '$2b$10$fpErcKtgKZ9SWerbK6adM.u.UUbhS0MPGvBtrKkrxKLWuqobcireK', NULL, 'inactive', 'customer', NULL, '2025-06-26 05:13:52', '2025-06-26 05:13:52', NULL, NULL),
(31, 'levibadings', 'levi@bading.com', '2025-06-30 07:44:49', '$2b$10$2hpJehSuAY7IswDmZCuqB.YLVT/TyLEkpFfJso0ai8RHCThuT36Ge', 'images/profiles/WIN_20250206_19_03_39_Pro-1751271177778-28412881.jpg', 'active', 'admin', NULL, '2025-06-30 07:41:21', '2025-06-30 08:13:01', NULL, NULL),
(38, 'Allan123', 'allanmonforte123@gmail.com', '2025-07-14 06:32:22', '$2b$10$WWMGmcCBD7ns0nv2uyPbSe.sgo/zdxdWUCmdhShLpwUq4UdTNKxMu', 'images/profiles/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1752474780638-97242937.png', 'active', 'admin', NULL, '2025-07-14 06:32:05', '2025-07-14 06:33:00', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3Nzk5N30.RKI-fQ_bAqePU6aKb3Ru5wfuiqJlbMvr6VP0pN1Co_Y'),
(39, 'leviasher', 'bading@gmail.com', '2025-07-14 08:40:02', '$2b$10$TppILObBY7xR99qzk68jje1EzwALIamrffoR6gBnxdwql4vFG3OU2', NULL, 'inactive', 'user', NULL, '2025-07-14 08:39:41', '2025-07-14 08:39:41', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc1MjQ4MjQxMn0.3CyioT8e-Q5wWGrFXlS26rS727HY4rqZKMV4aBX2gFo'),
(41, 'Cordless DrillX', 'helloworld@gmail.com', '2025-08-04 03:13:16', '$2b$10$jQyBSU54/NetYVRWgNkN2eXPce6TkZToWO68Ul2LJ52r0Azg4mpwm', 'images/profiles/ChatGPT Image Jul 1, 2025, 08_39_35 AM-1754277425967-681784859.png', 'active', 'customer', NULL, '2025-08-04 03:12:57', '2025-08-04 03:17:06', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDEsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc1NDI3NzIwOX0.fe06UGbwc133MDYK716nisv_VU0C-IxKVhNSTfdSXuk'),
(43, 'levi asher penaverde', 'levi@gmail.com', '2025-08-05 04:08:34', '$2b$10$BLHTpklJwZKsALoUD7g0WOkqypQker.OfeI8d4Lf0QgoQJCHE8kQ6', NULL, 'active', 'admin', NULL, '2025-08-05 04:08:15', '2025-08-05 04:08:15', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDMsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc1NDM2NjkzMn0.3a2O_q4hfpsALAjYvG6eeZfHeR6sAMDC3saDNGCA070');

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
(7, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImlhdCI6MTc1MTQyMTcxNH0.mKosYF3kCIJIsZaJI47v65LWk4rJRlKjMSYMCoww2-4', 'auth', '2025-07-02 02:01:54', NULL, NULL),
(10, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImlhdCI6MTc1MTQyMTc5Nn0.uSZQcMbTl4z7BHYkh_c87PCQmbJV_KMKrgBTcTPCFHc', 'auth', '2025-07-02 02:03:16', NULL, NULL),
(12, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImlhdCI6MTc1MTQyMjE1Mn0.lzTBCMZYLNshB6ZqXS88rHAm-uqCbC7QB-iW0UehlPs', 'auth', '2025-07-02 02:09:12', NULL, NULL),
(13, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImlhdCI6MTc1MTQyMjM0NH0.cw0262wr0_hMiGTTszWYUAAODcihVh5_yNai7Y5pAqg', 'auth', '2025-07-02 02:12:24', NULL, NULL),
(14, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImlhdCI6MTc1MTQyMjU5NH0.qeSc1QyVyAQ_eWHtBozzFZnXWVsaaUkZEoB9attdNuY', 'auth', '2025-07-02 02:16:34', NULL, NULL),
(15, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImlhdCI6MTc1MTg3MjA2N30.FK_b4wZULaBH9nBIG1icPId842_49Jib7nXTWrR0NYw', 'auth', '2025-07-07 07:07:47', NULL, NULL),
(16, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTg3MjYzMH0.v6_JrcXiGuIOpkiiqyuBfEzQqG4xtbEIRdKujeUJM6k', 'auth', '2025-07-07 07:17:10', NULL, NULL),
(17, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTg3Mjc1MH0.GiFXOlXkH2xvKaXsPZ5eALIqIIGwVbRkiU0-Fx1zsYs', 'auth', '2025-07-07 07:19:10', NULL, NULL),
(18, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTg3MjgzNH0.9hsHB0Fr_AO6yPJA-hRyf399NQvCIkKbeCgOyyuYOUQ', 'auth', '2025-07-07 07:20:34', NULL, NULL),
(19, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTg3NjU4Nn0.uZC9IOgdgZA5ciCyTH3NKIL_A65yCF1z86EQWYZhzzU', 'auth', '2025-07-07 08:23:06', NULL, NULL),
(20, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjAyMjMyOH0.lRCEI2SiBO2O_YuJa-nmG13uZYPGMNsKid62EQBeAuk', 'auth', '2025-07-09 00:52:08', NULL, NULL),
(21, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjAyODU1Nn0.16eX2-6oCWNhxNfXIPBMiAmrWm-o0lgjG1PE0UnuJ2Y', 'auth', '2025-07-09 02:35:56', NULL, NULL),
(22, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjAzMDI0NH0.f_MNtqwUmg2jMove4JS8qM1Mbe5kvnHx_LEZQD9X3WQ', 'auth', '2025-07-09 03:04:04', NULL, NULL),
(23, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ2OTcwN30.ARNObvALEYEZ4sCThDkbjtDThc85LlEYccJCCoWdoqo', 'auth', '2025-07-14 05:08:27', NULL, NULL),
(24, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ3MzMyMH0.NFU9p4PIdSDwCM2UqQrB_ILVv5-o5uVjkxyYON7RuxQ', 'auth', '2025-07-14 06:08:40', NULL, NULL),
(25, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ3NDU5NX0.CL9vvCsfjMTHGzAdxQIuQt8QVh-abNuwOkzWoVDNP-Q', 'auth', '2025-07-14 06:29:55', NULL, NULL),
(26, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ3NDYxM30.XkTbEJuQHvPPP_4w67z1Nb6A6Ra3uNN05b1Uw0zNyyo', 'auth', '2025-07-14 06:30:13', NULL, NULL),
(27, 38, '97a01eb91b026acb012c8ddd8ee1802b6e880d39e7fad77ad45fc64e4d09d613', 'verification', '2025-07-14 06:32:05', '2025-07-15 06:32:05', '2025-07-14 06:32:22'),
(28, 38, '2e2ed60ffe61ab3513ddc6a7275407d775f71d2dc7b348ff4d1519c4dd6e745c', 'auth', '2025-07-14 06:32:05', NULL, NULL),
(29, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc1MjQ3NDc2MH0.hkDpbtIBl22OPbGSqG0CSIVwhfc5NFpMsplU3i_-FMQ', 'auth', '2025-07-14 06:32:40', NULL, NULL),
(30, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ3NDg1MX0.c524S0KyMxYcLoii79XqLLi9DHfz5btmUX2pXtAjtGQ', 'auth', '2025-07-14 06:34:11', NULL, NULL),
(31, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ3NDkxMH0.BedXTokE9PV3upNQV5DMkNCtETYCm5zR7SFrpf1NNmc', 'auth', '2025-07-14 06:35:10', NULL, NULL),
(32, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ3NDkxMH0.BedXTokE9PV3upNQV5DMkNCtETYCm5zR7SFrpf1NNmc', 'auth', '2025-07-14 06:35:10', NULL, NULL),
(33, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ3NDkxN30.UQ1Tsx7UE_r0ayS4T6keIm-mt_fyWaguvWn9iJKvf-U', 'auth', '2025-07-14 06:35:17', NULL, NULL),
(34, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc1MjQ3NDk0N30.ZXNACkNkOVQzv0k4yMJPwgfgZeZaFFl1Hhm5cNtcTdA', 'auth', '2025-07-14 06:35:47', NULL, NULL),
(35, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ3NDk2M30.nHK5H8yoqTOl2A9MBRO1crhNRfyTgM0yM_KVrf5bjPk', 'auth', '2025-07-14 06:36:03', NULL, NULL),
(36, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc1MjQ3ODUyNH0.yvQifl2B5D0ErqXHRMSIY3eQf2AHr10kTiUX_EkVaBE', 'auth', '2025-07-14 07:35:24', NULL, NULL),
(37, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ3ODU4NH0.-bKkw4sXyOxnXUJoFOJgLVCRLbIl6DFtndITOebpoxs', 'auth', '2025-07-14 07:36:24', NULL, NULL),
(38, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ4MjA4OH0.zHz3a1TiT3cUkq52CYwtB1ESFJB0HS8vU3Qh7lQ2yCY', 'auth', '2025-07-14 08:34:48', NULL, NULL),
(39, 39, '2c2fe62985cced1f79c3b6a0c88c905a774993389bc3123b5b01c4c92031117d', 'verification', '2025-07-14 08:39:41', '2025-07-15 08:39:41', '2025-07-14 08:40:02'),
(40, 39, '3e04c93841c75a9fb60396b4582eb0bd9bd328ad9faa036b7e10f25637278d35', 'auth', '2025-07-14 08:39:41', NULL, NULL),
(41, 39, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc1MjQ4MjQxMn0.3CyioT8e-Q5wWGrFXlS26rS727HY4rqZKMV4aBX2gFo', 'auth', '2025-07-14 08:40:12', NULL, NULL),
(42, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ4MjQ0MH0.eMaB8zP4Q9fShqO1xiXbOLDegOLS7O-k0wIzWGPac8o', 'auth', '2025-07-14 08:40:40', NULL, NULL),
(45, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjQ4Mjc2NX0.ByHiJlpHkcwyaDUWsBzFZYPUhI15JmLc_TYk5q9fwac', 'auth', '2025-07-14 08:46:05', NULL, NULL),
(46, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjYzMzIwMH0.nAfGsPAP6JRLGtbLjhbXoXt-J70-h1LgDuppJMUeGwU', 'auth', '2025-07-16 02:33:20', NULL, NULL),
(47, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjcyOTA4Nn0.dXpfhbXR_VsRjWvS7htXAaCF3-Z7SgBUAPv89mT6Nlo', 'auth', '2025-07-17 05:11:26', NULL, NULL),
(48, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjczMzEzOX0.hjxDgcCEORYNwUbQ-uspLd8k8aUm275MkzoHTd3fHMA', 'auth', '2025-07-17 06:18:59', NULL, NULL),
(49, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjczNTIxMX0.JxN842RQSTedbZEhF9KIf99G1i0m-w-9U2zZWC-wIKE', 'auth', '2025-07-17 06:53:31', NULL, NULL),
(50, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjczNTM1OH0.u1B_pjA3tlr5DBKM4cR5R2V6dhdV0rX5I6OIWCu43KE', 'auth', '2025-07-17 06:55:58', NULL, NULL),
(51, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjczNTQxMH0.sLIjwjATdcgVLkGvHp-X_q7n9tIqyhBnJMEcUz-nuY8', 'auth', '2025-07-17 06:56:50', NULL, NULL),
(52, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjczNTY3OX0.lw5ha5LYabkjb1QRKBv-m31v0zThwHXjdT9EEERMxno', 'auth', '2025-07-17 07:01:19', NULL, NULL),
(53, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjczNjUzMX0.N0UmKDGCm0I4Q4x6P-SGRfIaskdr2T1gyerxhdRY1Mo', 'auth', '2025-07-17 07:15:31', NULL, NULL),
(54, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjczNzYxMn0.Bo-Rwn2Lewh546YSsr5BWQ1mBij49ztn0OdsPR_GcUM', 'auth', '2025-07-17 07:33:32', NULL, NULL),
(55, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUyNzM3NjI3fQ.377GOLm9fxwQe1xY8CFToNsfj48UhaVeUZnO-RSiVk8', 'auth', '2025-07-17 07:33:47', NULL, NULL),
(56, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUyNzM3Nzk1fQ.aQ9NCnB3uxvaW0nTlarSJW_JfNt4HIhJ4RgV_bRGb6E', 'auth', '2025-07-17 07:36:35', NULL, NULL),
(57, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUyNzM3OTQyfQ.WyUuVh7tREmZvcWRgV485fY3_vgW5pGiZTfCtWvsSuw', 'auth', '2025-07-17 07:39:02', NULL, NULL),
(58, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjczODAyOX0.wuDvwxkcmUfPjmo0Lo7uKB8oyINpaxZ46A_xOxzczkk', 'auth', '2025-07-17 07:40:29', NULL, NULL),
(59, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjczODA3OH0.7nO98oSvPY84aetl1SYauCm0_cXcAP8jzl1WyL9THYU', 'auth', '2025-07-17 07:41:18', NULL, NULL),
(60, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUyNzM4MDg4fQ.y1tpsUK_H3G8dlk_q6MTmd2juTZX6wFQUllp-HncZNE', 'auth', '2025-07-17 07:41:28', NULL, NULL),
(61, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUzNjcyNDYzfQ.Js80KzhrpWN6Iv3eE_5XjClv0kp7O3921xWMPFm7RTY', 'auth', '2025-07-28 03:14:23', NULL, NULL),
(62, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MzY3MjQ4MH0.-kVrUhLNay_PwEpqvu0f-fjHok7_3oHUr27lUKWFH-g', 'auth', '2025-07-28 03:14:40', NULL, NULL),
(63, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MzY4MjAxM30.uUgXu9QFNqrGuRNeI75ikqZfOVQQqOVyq9UmS3JFCCM', 'auth', '2025-07-28 05:53:33', NULL, NULL),
(64, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUzNjgyMTI0fQ.cOqwPHKWoicGTvzVAZ1t6fbBl95VsIjxTvok3Lb1UnM', 'auth', '2025-07-28 05:55:24', NULL, NULL),
(65, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUzNzQ3NjMzfQ.62fK_qhZ9Jl48VsPuZefwXGzDKlojdosHtqc4BJkzPQ', 'auth', '2025-07-29 00:07:13', NULL, NULL),
(66, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUzNzQ3NjMzfQ.62fK_qhZ9Jl48VsPuZefwXGzDKlojdosHtqc4BJkzPQ', 'auth', '2025-07-29 00:07:13', NULL, NULL),
(67, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1Mzc0OTMzOX0.8Q_GNy68OAKBLFmuqJ1N0_U7fuRqmhh72ME7riSY-mI', 'auth', '2025-07-29 00:35:39', NULL, NULL),
(68, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUzNzQ5NDI4fQ.XSVvVvNfix73yClQ6lYc8v2_P8Dv7_ChEukHqQSC-zk', 'auth', '2025-07-29 00:37:08', NULL, NULL),
(69, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1Mzc1MTIzM30.t870dEJtybruX0SnVlATyUetBFYnm896TByZvJ7LqXY', 'auth', '2025-07-29 01:07:13', NULL, NULL),
(70, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1Mzc1MTY2NH0.edmKOG3kI47rSaJiU26oneXFmV32av-tqoosX2nVRVA', 'auth', '2025-07-29 01:14:24', NULL, NULL),
(71, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUzNzUyMDgwfQ.ncRqMpAWpgLX8IzdEFqkteehni6HLDUAiSJLtkxL92Q', 'auth', '2025-07-29 01:21:20', NULL, NULL),
(72, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1Mzc1MjEzMX0.22GWT4AgQQKuSrXcxP9c57MEI_aM2ZB8Umstxo6CW5A', 'auth', '2025-07-29 01:22:11', NULL, NULL),
(73, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUzNzUyMTc0fQ.VPkphV52YX81JQ3xZ46zYqnprNKgdU9Zuku_Ui6aDt8', 'auth', '2025-07-29 01:22:54', NULL, NULL),
(74, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1Mzc1MjUyMn0.fG15dQ-ULoY9pqCqsZlgIk-mH8WGcF04ROfc2gPVl8U', 'auth', '2025-07-29 01:28:42', NULL, NULL),
(75, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUzNzUyODU0fQ._tVNBTRXYbsyE8o547OsOWXjCy22VJeJow5jH6vwPIY', 'auth', '2025-07-29 01:34:14', NULL, NULL),
(76, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1Mzc1MzM5N30.5UW4m20XLIfwp55oo9bpchCBuOOPRAirBCYqFkuA0BY', 'auth', '2025-07-29 01:43:17', NULL, NULL),
(77, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUzNzUzODg3fQ.LpaAplA2g0GkHR1AjiLNrckVS_RjjXJaU5tIamBpV9M', 'auth', '2025-07-29 01:51:27', NULL, NULL),
(78, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0Mjc2Njc3fQ.rGLkFOueu-lRsbeGZv9lQOxaZAXCPuLmye2bPj00xMU', 'auth', '2025-08-04 03:04:37', NULL, NULL),
(79, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDI3Njg0NH0.CN2jGRjZ3FP_cIHPqli_hkROepoe3ZqQ6vXMXnMa5NA', 'auth', '2025-08-04 03:07:24', NULL, NULL),
(80, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0Mjc2OTY1fQ.tZMIM3jG2sXc7d6VGeyr1qd9C33daop-GaqJz94Y9uQ', 'auth', '2025-08-04 03:09:25', NULL, NULL),
(81, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDI3Njk3Nn0.BO5D79rteOvr9CGhHiQ4f-krlUm4MVRliF6EtZwNTvI', 'auth', '2025-08-04 03:09:36', NULL, NULL),
(82, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDI3NzE1OX0.uNW0LLm1GL4pXI1106p-U3DmH9I9JBIDIFsvH7XAPLQ', 'auth', '2025-08-04 03:12:39', NULL, NULL),
(83, 41, '0c8c02801f3f319e7b52362a64468f9838643f735dffbffeffd34f92fcd2a3b4', 'verification', '2025-08-04 03:12:57', '2025-08-05 03:12:57', '2025-08-04 03:13:16'),
(84, 41, 'c2506a5f31a4bbc1c46489b5c6bbad37d8dd30a46c6a12d2cd398d7e5ccb90b1', 'auth', '2025-08-04 03:12:57', NULL, NULL),
(85, 41, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDEsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc1NDI3NzIwOX0.fe06UGbwc133MDYK716nisv_VU0C-IxKVhNSTfdSXuk', 'auth', '2025-08-04 03:13:29', NULL, NULL),
(86, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDI3OTAxM30.bqfotDAC56qUgn--XZUr4FPVQzaeUZbCa9LD5MNG3Os', 'auth', '2025-08-04 03:43:33', NULL, NULL),
(87, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDI3OTQyMH0.jiiHTE7YCpFV0pGSyNTLe9m90Ti0UNzvCmHBppJTCm4', 'auth', '2025-08-04 03:50:20', NULL, NULL),
(88, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0Mjc5NDMyfQ.zSo8FAQtEL5TUOVZ5AooePRMekc5QU5DAhLwvZ6m0Lw', 'auth', '2025-08-04 03:50:32', NULL, NULL),
(89, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDI4MTE2Mn0.2NwxIJuEVfnHpx9t0etH78pi3SbwNVCZvLYIzTvxMQo', 'auth', '2025-08-04 04:19:22', NULL, NULL),
(90, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MjgxMzk0fQ.hOPL8U8_8sIs8DoX5pqUSsh4Eqx_T3LHEntBq7UiPcQ', 'auth', '2025-08-04 04:23:14', NULL, NULL),
(91, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDI4Mjg1NH0.xe51De7Pt5Xcr7yAXwwBdguG4MAnmjbcYflzjD6Yq7w', 'auth', '2025-08-04 04:47:34', NULL, NULL),
(92, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0Mjg4Njc5fQ.TSf9SmoqXFZIuA1f_p3xPxDTDVOi_8WIgRNDeKrf4b8', 'auth', '2025-08-04 06:24:39', NULL, NULL),
(96, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDI4OTI3N30.5N94gUheusaqWXD_TNCKTwjlCOgSLNDBbGejfxeZMmY', 'auth', '2025-08-04 06:34:37', NULL, NULL),
(97, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0Mjg5Mzc3fQ.yGUk9jpW8fp2Sa1E2kEb9Enb0tKYW4zZSGRGE28FJLQ', 'auth', '2025-08-04 06:36:17', NULL, NULL),
(98, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDI5NTI0MX0.Z6pjXU-W6YTZN8P_eMrBk19hO-EarO5km_kw41kAoTI', 'auth', '2025-08-04 08:14:01', NULL, NULL),
(99, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDI5NjU3Nn0.QXx8k_poK-YMXdWR67aDm5e0NvIkAqardIKJ4LX6gDg', 'auth', '2025-08-04 08:36:16', NULL, NULL),
(100, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDI5ODMwNn0.bNMZtqvWCuuWS0GcOFUP3Gk03ABHL6h3KHQT3A04VcI', 'auth', '2025-08-04 09:05:06', NULL, NULL),
(101, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0Mjk5NzcxfQ.GPq7q4Zzu6YFUpkWXXYfXxk1fWNyFYA4NH68Ih7m0yo', 'auth', '2025-08-04 09:29:31', NULL, NULL),
(102, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDI5OTc3OH0.I4vjZXb_G67LusvrKZAkH0Dl7JeAXtiOBwuBlleLpYc', 'auth', '2025-08-04 09:29:38', NULL, NULL),
(103, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDMwMDE4OH0.bF5oBhh10QQJxl5jtA0OdAnZY_KZFWL2rSYCaCNBRHk', 'auth', '2025-08-04 09:36:28', NULL, NULL),
(104, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzAwODcyfQ.vavqMG4aLRU43hJvbQqx_JfoFO7IgHGtY571DXy2vmA', 'auth', '2025-08-04 09:47:52', NULL, NULL),
(105, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDMwMDkwM30.B_nWn5qZ9-rI0UrkUjvlBCzrRWlKJgBBsreqCOwbH1A', 'auth', '2025-08-04 09:48:23', NULL, NULL),
(106, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzAxMDYwfQ.ZgN5VqZJzPnlKWZRZTWzAElN1NxiIv3spDbYW_JJNmk', 'auth', '2025-08-04 09:51:00', NULL, NULL),
(107, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDMwMjIxOH0.QqOy3xGcTI9cr2D4E2YbE_MQA7ZVqfuFlN0JK4oNvuo', 'auth', '2025-08-04 10:10:18', NULL, NULL),
(108, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDMwMjI4OH0.PHfql_fFStBjAkjJjjwxWsXYFRDd3KZryyaRdM1zoTs', 'auth', '2025-08-04 10:11:28', NULL, NULL),
(109, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzUwOTgxfQ.0xKBOPhs4JQyB3uyttQ7CTZgvP92_5d9tF0KlWO3c4g', 'auth', '2025-08-04 23:43:01', NULL, NULL),
(110, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM1NTE0M30.yGLF8bTZFhrBeE0066TFwfylzG6y7hK-RgCYN-R91kE', 'auth', '2025-08-05 00:52:23', NULL, NULL),
(111, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzU1MTU2fQ.d1KkR203xvVbgEdkzR8lgNwyjA2ZXZ39mmt9T5RB4Tw', 'auth', '2025-08-05 00:52:36', NULL, NULL),
(112, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzU1NzEzfQ.neohKyDGnimbdZyIgyKsW0a3g-Hd72CF3C0-eg2sbxo', 'auth', '2025-08-05 01:01:53', NULL, NULL),
(113, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzU2MzkwfQ.YPtpD3qllMycejpXi4SnRAFeltNDaVMnaD69IVRyXnQ', 'auth', '2025-08-05 01:13:10', NULL, NULL),
(114, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM1Njc3OX0.uPJsobZrNZoCJfMTFvgQLdCEAytUR3Cqel45C47Ba88', 'auth', '2025-08-05 01:19:39', NULL, NULL),
(115, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzYwOTc3fQ.fZ--4cqQrh9D0j3R7Qn0DGq8vtQwzhJ06okd6hpSBFs', 'auth', '2025-08-05 02:29:37', NULL, NULL),
(116, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzYwOTg1fQ.imJtYpvIDaXIz4qbtrcNjrbtLdXVtdYu-wwMoAiHzO8', 'auth', '2025-08-05 02:29:45', NULL, NULL),
(117, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM2MDk5OX0.jPyco1O6SEkHjrABGSeyUlHuqW8gU5JRT9y0i72MI_0', 'auth', '2025-08-05 02:29:59', NULL, NULL),
(118, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzYxOTM1fQ.TEPogE5chNe7CSHzgdrrQyNx-HgMcv5NOSEV9GK0SDo', 'auth', '2025-08-05 02:45:35', NULL, NULL),
(119, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM2MjAxMH0.af_LG2qxuGHeV2umtyqZ3yxbHx9AZrbyDF2g0IEmGhU', 'auth', '2025-08-05 02:46:50', NULL, NULL),
(120, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzYyMDU2fQ.cZ3mveXpE48BpY0jZBoL8DLQgvqSUKxsPmnkhkcds20', 'auth', '2025-08-05 02:47:36', NULL, NULL),
(121, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM2MjE4Mn0.djj_CPR2A4fGIFIf48N_4IAkWm2Kae9D7oYwJrVxZEg', 'auth', '2025-08-05 02:49:42', NULL, NULL),
(122, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM2MzAyNX0.Eu74x4OF2mbgqEfQq0lR2931HnzdrOdH1Ha0z8br5po', 'auth', '2025-08-05 03:03:45', NULL, NULL),
(123, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM2NDAyNn0.JJ5wF8DRjeIUXXVDVdkZZ3K8PE0_KnLrXKUvm7jDirw', 'auth', '2025-08-05 03:20:26', NULL, NULL),
(124, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzY0MDQxfQ.gpnasbwa7Zpm-jnZcRneSLjbTwoT9SnBZY5WzLmQYak', 'auth', '2025-08-05 03:20:41', NULL, NULL),
(125, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzY1NDYwfQ.rDBBLp8dRNx_WS7EGFusUVGpcb4O7dGPCiHuqftZStw', 'auth', '2025-08-05 03:44:20', NULL, NULL),
(126, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM2NTU4NX0.imMartpN0ZhGbBi-4VHdvftOlSD-UOpvn9pOthuOM0g', 'auth', '2025-08-05 03:46:25', NULL, NULL),
(127, 43, 'd94d3fe9a99d3b38dc07722e316212377818d71379020e986f76ec0736e79e08', 'verification', '2025-08-05 04:08:15', '2025-08-06 04:08:15', '2025-08-05 04:08:34'),
(128, 43, '3c915baf4a355a5025be2a030247d46260d1871fc0d0d40d947d58f9c906186b', 'auth', '2025-08-05 04:08:15', NULL, NULL),
(129, 43, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDMsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc1NDM2NjkzMn0.3a2O_q4hfpsALAjYvG6eeZfHeR6sAMDC3saDNGCA070', 'auth', '2025-08-05 04:08:52', NULL, NULL),
(130, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU0MzY5NzcyfQ.stGFngEg9ChUBw1SAXhtxDyck1CrTcpMSrIzP8T_jyc', 'auth', '2025-08-05 04:56:12', NULL, NULL),
(131, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM2OTg0NX0.IkCXBD6ch2tNIuZZh0QcNE6LBUITLYjYs-ne_0ISz_s', 'auth', '2025-08-05 04:57:25', NULL, NULL),
(132, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3Mjk3MX0.8_KwsZ33yB_ILEf1_TMM7_qUO_Y6u93jYmBDRMhbVn0', 'auth', '2025-08-05 05:49:31', NULL, NULL),
(133, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3MzE0NH0.aIte_sbGHyckJkCjfyPFNnthoVQMXVZRZ7uB18q-9E8', 'auth', '2025-08-05 05:52:24', NULL, NULL),
(134, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3MzIzNX0.XINda7QnnJWqLN7kVh8Yh1RSvdDi6zCdw4ew7BiPHh4', 'auth', '2025-08-05 05:53:55', NULL, NULL),
(135, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3NDQ2NX0.fJ7Q_ceVIL9QXKQtq5pfq8RxXFxaJMrtW4o8nT8Oa20', 'auth', '2025-08-05 06:14:25', NULL, NULL),
(136, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3NDU1Mn0.E2G0_8AeXmcjXXk5jquBKelPrLbWbXmPQwK9RxfPhAE', 'auth', '2025-08-05 06:15:52', NULL, NULL),
(137, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3NDYwNn0.ziNhfuEPqziOSbsAKZcfGdmRlCYOk_GYjs5xV-vvOTk', 'auth', '2025-08-05 06:16:46', NULL, NULL),
(138, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3NDc3MH0.DyAQV4jUs_CscWvHgRPWX7G356ZTomSnybvNbMQR6zM', 'auth', '2025-08-05 06:19:30', NULL, NULL),
(139, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3NDg1N30.jVyE54-ljNMzFsoM-yT6gWy_seyAMkPYku0Do-VjgP4', 'auth', '2025-08-05 06:20:57', NULL, NULL),
(140, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3NDkwOH0.bPG4GyGg-jY0lJx_1oJ6fsq_PkZjqhMVhW2OrbU72KU', 'auth', '2025-08-05 06:21:48', NULL, NULL),
(141, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3NDk1OH0.wFdjJ_H_EHp7WK9vBSshQCAv4HKAreEOY0tic0wxxaU', 'auth', '2025-08-05 06:22:38', NULL, NULL),
(142, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3NTk2NH0.1_CqVVia2emNgbObHz953tKqxhezSExUw7IaGVH7Cf8', 'auth', '2025-08-05 06:39:24', NULL, NULL),
(143, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3NzEwMH0.rYZ-_nUp3MZNZ08Uy0SQLivGsZEJ6tdwXbsaZA1Adks', 'auth', '2025-08-05 06:58:20', NULL, NULL),
(144, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDM3Nzk5N30.RKI-fQ_bAqePU6aKb3Ru5wfuiqJlbMvr6VP0pN1Co_Y', 'auth', '2025-08-05 07:13:17', NULL, NULL);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8327;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=236;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=212;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=249;

--
-- AUTO_INCREMENT for table `transaction_items`
--
ALTER TABLE `transaction_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=145;

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
