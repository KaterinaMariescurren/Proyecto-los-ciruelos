-- data.sql

-- Crear la tabla cancha primero
CREATE TABLE IF NOT EXISTS cancha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL,
    descripcion VARCHAR(300),
    tipo ENUM('Interior', 'Exterior') NOT NULL
);

-- Crear la tabla usuario primero
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(25) NOT NULL,
    apellido VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL
);

-- Crear la tabla telefono
CREATE TABLE IF NOT EXISTS telefono (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo INT NOT NULL,
    numero INT NOT NULL,
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Crear la tabla jugador
CREATE TABLE IF NOT EXISTS jugador (
    usuario_id INT PRIMARY KEY,
    socio BOOLEAN NOT NULL DEFAULT FALSE,
    profesor BOOLEAN NOT NULL DEFAULT FALSE,
    categoria ENUM('Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta', 'Sexta', 'Septima', 'Principiante') NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS empleado (
    usuario_id INT PRIMARY KEY,
    duenio BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Insertar usuarios
INSERT INTO usuario (nombre, apellido, email) VALUES
('Juan', 'Pérez', 'juan.perez@email.com'),
('María', 'López', 'maria.lopez@email.com'),
('Carlos', 'Gómez', 'carlos.gomez@email.com'),
('Bruno', 'Santillan', 'brunosaantillan@gmail.com');

-- Insertar teléfonos
INSERT INTO telefono (codigo, numero, usuario_id) VALUES
(54, 1112345678, 1),
(54, 1123456789, 2),
(54, 1134567890, 3);

-- Insertar jugadores
INSERT INTO jugador (usuario_id, socio, profesor, categoria) VALUES
(1, TRUE, FALSE, 'Primera'),
(2, FALSE, TRUE, 'Segunda'),
(3, TRUE, TRUE, 'Tercera');

SELECT 'Jugadores insertados correctamente' AS Result;

-- Insertar duenio
INSERT INTO empleado (usuario_id, duenio) VALUES
(4, TRUE);

SELECT 'Duenio insertado correctamente' AS Result;

-- Luego insertar los datos
INSERT INTO cancha (numero, descripcion, tipo) VALUES
(1, 'Cancha de fútbol sintético', 'Interior'),
(2, 'Cancha de tenis de polvo de ladrillo', 'Interior'),
(3, 'Cancha de paddle techada', 'Interior'),
(4, 'Cancha de vóley profesional', 'Exterior');

SELECT 'Schema executed successfully' AS Result;
