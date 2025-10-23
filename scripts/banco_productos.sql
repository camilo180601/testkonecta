-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 23, 2025 at 10:26 PM
-- Server version: 8.0.30
-- PHP Version: 8.3.17

CREATE DATABASE IF NOT EXISTS `banco_productos` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `banco_productos`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `banco_productos`
--

-- --------------------------------------------------------

--
-- Table structure for table `estados_venta`
--

CREATE TABLE `estados_venta` (
  `id` bigint UNSIGNED NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orden` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `estados_venta`
--

INSERT INTO `estados_venta` (`id`, `nombre`, `orden`, `created_at`) VALUES
(1, 'Abierto', 1, '2025-10-23 07:26:49'),
(2, 'En Proceso', 2, '2025-10-23 07:26:49'),
(3, 'Finalizado', 3, '2025-10-23 07:26:49');

-- --------------------------------------------------------

--
-- Table structure for table `franquicias`
--

CREATE TABLE `franquicias` (
  `id` bigint UNSIGNED NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `franquicias`
--

INSERT INTO `franquicias` (`id`, `nombre`, `created_at`) VALUES
(1, 'AMEX', '2025-10-23 07:26:49'),
(2, 'VISA', '2025-10-23 07:26:49'),
(3, 'MASTERCARD', '2025-10-23 07:26:49');

-- --------------------------------------------------------

--
-- Table structure for table `historial_estados`
--

CREATE TABLE `historial_estados` (
  `id` bigint UNSIGNED NOT NULL,
  `venta_id` bigint UNSIGNED NOT NULL,
  `estado_anterior_id` bigint UNSIGNED DEFAULT NULL,
  `estado_nuevo_id` bigint UNSIGNED NOT NULL,
  `usuario_id` bigint UNSIGNED NOT NULL,
  `comentario` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `historial_estados`
--

INSERT INTO `historial_estados` (`id`, `venta_id`, `estado_anterior_id`, `estado_nuevo_id`, `usuario_id`, `comentario`, `created_at`) VALUES
(1, 1, NULL, 1, 1, 'Venta creada', '2025-10-23 22:08:12'),
(3, 3, NULL, 1, 1, 'Venta creada', '2025-10-23 22:25:30');

-- --------------------------------------------------------

--
-- Table structure for table `productos`
--

CREATE TABLE `productos` (
  `id` bigint UNSIGNED NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `requiere_tasa` tinyint(1) NOT NULL DEFAULT '0',
  `requiere_franquicia` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `requiere_tasa`, `requiere_franquicia`, `created_at`) VALUES
(1, 'Credito de Consumo', 'Crédito para consumo personal', 1, 0, '2025-10-23 07:26:49'),
(2, 'Libranza Libre Inversión', 'Crédito de libranza para libre inversión', 1, 0, '2025-10-23 07:26:49'),
(3, 'Tarjeta de Credito', 'Tarjeta de crédito bancaria', 0, 1, '2025-10-23 07:26:49');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `created_at`) VALUES
(1, 'Administrador', 'Acceso completo al sistema', '2025-10-23 07:26:49'),
(2, 'Asesor', 'Puede gestionar sus propias ventas', '2025-10-23 07:26:49');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint UNSIGNED NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_id` bigint UNSIGNED NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol_id`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Administrador Sistema', 'admin@banco.com', '$2a$10$v4J0ukHy2.Q3VXBOWpbm4O/vcL4BUUO8uGR.O9qvBvqqYFi/wGWty', 1, 1, '2025-10-23 07:26:49', '2025-10-23 20:10:13'),
(2, 'Juan Pérez', 'asesor@banco.com', '$2a$10$v4J0ukHy2.Q3VXBOWpbm4O/vcL4BUUO8uGR.O9qvBvqqYFi/wGWty', 2, 1, '2025-10-23 07:26:49', '2025-10-23 20:10:19'),
(3, 'camilo', 'camilo@camilo.com', '$2b$10$L93OOJof5ibrVMTpoPxib.cLcr/A39ey4hS..P/sYPD4fEy9sIo56', 1, 1, '2025-10-23 22:01:43', '2025-10-23 22:01:43');

-- --------------------------------------------------------

--
-- Table structure for table `ventas`
--

CREATE TABLE `ventas` (
  `id` bigint UNSIGNED NOT NULL,
  `producto_id` bigint UNSIGNED NOT NULL,
  `cupo_solicitado` decimal(15,2) NOT NULL,
  `franquicia_id` bigint UNSIGNED DEFAULT NULL,
  `tasa` decimal(4,2) DEFAULT NULL,
  `estado_id` bigint UNSIGNED NOT NULL DEFAULT '1',
  `usuario_creador_id` bigint UNSIGNED NOT NULL,
  `usuario_actualizador_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ventas`
--

INSERT INTO `ventas` (`id`, `producto_id`, `cupo_solicitado`, `franquicia_id`, `tasa`, `estado_id`, `usuario_creador_id`, `usuario_actualizador_id`, `created_at`, `updated_at`) VALUES
(1, 3, '4000000.00', 3, NULL, 1, 1, 1, '2025-10-23 22:08:12', '2025-10-23 22:08:12'),
(3, 2, '4004000.00', NULL, '12.00', 1, 1, 1, '2025-10-23 22:25:30', '2025-10-23 22:25:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `estados_venta`
--
ALTER TABLE `estados_venta`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_estados_venta_nombre` (`nombre`),
  ADD KEY `idx_estados_venta_orden` (`orden`);

--
-- Indexes for table `franquicias`
--
ALTER TABLE `franquicias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_franquicias_nombre` (`nombre`);

--
-- Indexes for table `historial_estados`
--
ALTER TABLE `historial_estados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_historial_venta` (`venta_id`),
  ADD KEY `fk_historial_estado_anterior` (`estado_anterior_id`),
  ADD KEY `fk_historial_estado_nuevo` (`estado_nuevo_id`),
  ADD KEY `fk_historial_usuario` (`usuario_id`);

--
-- Indexes for table `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_productos_nombre` (`nombre`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_roles_nombre` (`nombre`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuarios_email` (`email`),
  ADD KEY `idx_usuarios_rol` (`rol_id`);

--
-- Indexes for table `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ventas_producto` (`producto_id`),
  ADD KEY `idx_ventas_estado` (`estado_id`),
  ADD KEY `idx_ventas_usuario_creador` (`usuario_creador_id`),
  ADD KEY `idx_ventas_created_at` (`created_at`),
  ADD KEY `fk_ventas_franquicia` (`franquicia_id`),
  ADD KEY `fk_ventas_usuario_actualizador` (`usuario_actualizador_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `estados_venta`
--
ALTER TABLE `estados_venta`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `franquicias`
--
ALTER TABLE `franquicias`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `historial_estados`
--
ALTER TABLE `historial_estados`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `productos`
--
ALTER TABLE `productos`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `historial_estados`
--
ALTER TABLE `historial_estados`
  ADD CONSTRAINT `fk_historial_estado_anterior` FOREIGN KEY (`estado_anterior_id`) REFERENCES `estados_venta` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_estado_nuevo` FOREIGN KEY (`estado_nuevo_id`) REFERENCES `estados_venta` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `fk_ventas_estado` FOREIGN KEY (`estado_id`) REFERENCES `estados_venta` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ventas_franquicia` FOREIGN KEY (`franquicia_id`) REFERENCES `franquicias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ventas_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ventas_usuario_actualizador` FOREIGN KEY (`usuario_actualizador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ventas_usuario_creador` FOREIGN KEY (`usuario_creador_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
