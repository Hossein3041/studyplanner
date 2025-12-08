-- ------------------------------------------------------------
-- Test-User
-- ------------------------------------------------------------
INSERT INTO users (email, password_hash, role)
VALUES ('admin@example.com', 'admin123', 'ADMIN');

INSERT INTO users (email, password_hash, role)
VALUES ('student@example.com', 'student123', 'STUDENT');


SET @userId = LAST_INSERT_ID();


-- ============================================================
-- Semester 1 – Module
-- ============================================================
INSERT INTO modules (name, semester, user_id) VALUES
('Programmieren 1', 1, @userId);
SET @m1_1 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Mathematik 1', 1, @userId);
SET @m1_2 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('SWE 1', 1, @userId);
SET @m1_3 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Einführung in die Informatik', 1, @userId);
SET @m1_4 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Graphen und endliche Automaten', 1, @userId);
SET @m1_5 = LAST_INSERT_ID();


-- Aufgaben Semester 1
INSERT INTO tasks (title, deadline, priority, module_id, user_id) VALUES
('Übungsblatt 1 bearbeiten', '2025-03-10', 'MEDIUM', @m1_1, @userId),
('Programmieren 1 – Projekt starten', '2025-03-15', 'HIGH', @m1_1, @userId),
('Mathe 1: Integrale wiederholen', '2025-03-12', 'MEDIUM', @m1_2, @userId),
('SWE 1: UML-Diagramme erstellen', '2025-03-18', 'LOW', @m1_3, @userId);

-- Sessions Semester 1
INSERT INTO sessions (module_id, user_id, date, duration_minutes, note) VALUES
(@m1_1, @userId, '2025-03-05', 90, 'Grundlagen Java wiederholt'),
(@m1_2, @userId, '2025-03-06', 60, 'Grenzwerte gelernt'),
(@m1_3, @userId, '2025-03-08', 120, 'Use Case Diagramme gezeichnet');


-- ============================================================
-- Semester 2 – Module
-- ============================================================
INSERT INTO modules (name, semester, user_id) VALUES
('Programmieren 2', 2, @userId);
SET @m2_1 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Mathematik 2', 2, @userId);
SET @m2_2 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('SWE 2', 2, @userId);
SET @m2_3 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Infrastruktur', 2, @userId);
SET @m2_4 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Rechnerarchitektur', 2, @userId);
SET @m2_5 = LAST_INSERT_ID();

-- Aufgaben Semester 2
INSERT INTO tasks (title, deadline, priority, module_id, user_id) VALUES
('Programmieren 2: Vererbung üben', '2025-04-05', 'MEDIUM', @m2_1, @userId),
('Mathe 2: Lineare Algebra wiederholen', '2025-04-10', 'HIGH', @m2_2, @userId),
('Rechnerarchitektur: Bit-Operationen', '2025-04-08', 'MEDIUM', @m2_5, @userId);

-- Sessions Semester 2
INSERT INTO sessions (module_id, user_id, date, duration_minutes, note) VALUES
(@m2_1, @userId, '2025-04-01', 110, 'OOP vertieft'),
(@m2_2, @userId, '2025-04-02', 90, 'Matrizenaufgaben gerechnet');


-- ============================================================
-- Semester 3 – Module
-- ============================================================
INSERT INTO modules (name, semester, user_id) VALUES
('Programmieren 3', 3, @userId);
SET @m3_1 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Algorithmen und Datenstrukturen', 3, @userId);
SET @m3_2 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Vernetzte Systeme', 3, @userId);
SET @m3_3 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('SWE 3', 3, @userId);
SET @m3_4 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Datenbanken 1', 3, @userId);
SET @m3_5 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Theoretische Informatik', 3, @userId);
SET @m3_6 = LAST_INSERT_ID();

-- Aufgaben Semester 3
INSERT INTO tasks (title, deadline, priority, module_id, user_id) VALUES
('ADS: Bäume implementieren', '2025-05-15', 'HIGH', @m3_2, @userId),
('Datenbanken: SQL-Join Übungen', '2025-05-18', 'MEDIUM', @m3_5, @userId),
('SWE 3: Projektgruppe treffen', '2025-05-12', 'LOW', @m3_4, @userId);

-- Sessions Semester 3
INSERT INTO sessions (module_id, user_id, date, duration_minutes, note) VALUES
(@m3_2, @userId, '2025-05-05', 100, 'AVL-Bäume programmiert'),
(@m3_5, @userId, '2025-05-06', 75, 'SQL Queries geübt');


-- ============================================================
-- Semester 4 – Praxissemester
-- ============================================================
INSERT INTO modules (name, semester, user_id)
VALUES ('Praxissemester', 4, @userId);
SET @m4_1 = LAST_INSERT_ID();

INSERT INTO tasks (title, deadline, priority, module_id, user_id) VALUES
('Bericht schreiben – Woche 1', '2025-06-10', 'MEDIUM', @m4_1, @userId),
('Projektmeeting vorbereiten', '2025-06-05', 'LOW', @m4_1, @userId);

INSERT INTO sessions (module_id, user_id, date, duration_minutes, note) VALUES
(@m4_1, @userId, '2025-06-02', 120, 'Projektarbeit dokumentiert');


-- ============================================================
-- Semester 5 – Module
-- ============================================================
INSERT INTO modules (name, semester, user_id) VALUES
('Eingebettete Systeme', 5, @userId);
SET @m5_1 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('IT-Sicherheit', 5, @userId);
SET @m5_2 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Parallelprogrammierung', 5, @userId);
SET @m5_3 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Datenbanken 2', 5, @userId);
SET @m5_4 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Big Data', 5, @userId);
SET @m5_5 = LAST_INSERT_ID();

-- Aufgaben Semester 5
INSERT INTO tasks (title, deadline, priority, module_id, user_id) VALUES
('IT-Sicherheit: Hashing analysieren', '2025-07-01', 'HIGH', @m5_2, @userId),
('Parallelprog.: Threads implementieren', '2025-07-05', 'MEDIUM', @m5_3, @userId),
('Big Data: Hadoop installieren', '2025-07-07', 'HIGH', @m5_5, @userId);

-- Sessions Semester 5
INSERT INTO sessions (module_id, user_id, date, duration_minutes, note) VALUES
(@m5_2, @userId, '2025-06-28', 90, 'Cybersecurity Grundlagen wiederholt'),
(@m5_3, @userId, '2025-06-29', 120, 'Multithreading in Java');


-- ============================================================
-- Semester 6 – Module
-- ============================================================
INSERT INTO modules (name, semester, user_id) VALUES
('Bachelorprojekt 1', 6, @userId);
SET @m6_1 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Mathematik 3', 6, @userId);
SET @m6_2 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Technikfolgenabschätzung', 6, @userId);
SET @m6_3 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Roboterprogrammierung', 6, @userId);
SET @m6_4 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Parallele Algorithmen', 6, @userId);
SET @m6_5 = LAST_INSERT_ID();

-- Aufgaben Semester 6
INSERT INTO tasks (title, deadline, priority, module_id, user_id) VALUES
('Bachelorprojekt: Konzept entwerfen', '2025-08-15', 'HIGH', @m6_1, @userId),
('Roboterprog.: Bewegung testen', '2025-08-20', 'MEDIUM', @m6_4, @userId);

-- Sessions Semester 6
INSERT INTO sessions (module_id, user_id, date, duration_minutes, note) VALUES
(@m6_4, @userId, '2025-08-01', 80, 'Motorsteuerung getestet');


-- ============================================================
-- Semester 7 – Module
-- ============================================================
INSERT INTO modules (name, semester, user_id) VALUES
('Bachelorprojekt 2', 7, @userId);
SET @m7_1 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Studium Generale', 7, @userId);
SET @m7_2 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Bachelorarbeit', 7, @userId);
SET @m7_3 = LAST_INSERT_ID();

INSERT INTO modules (name, semester, user_id) VALUES
('Künstliche Intelligenz und Maschinelles Lernen', 7, @userId);
SET @m7_4 = LAST_INSERT_ID();

-- Aufgaben Semester 7
INSERT INTO tasks (title, deadline, priority, module_id, user_id) VALUES
('Bachelorarbeit: Literaturrecherche', '2025-09-10', 'HIGH', @m7_3, @userId),
('KI/ML: Neuronale Netze üben', '2025-09-05', 'MEDIUM', @m7_4, @userId);

-- Sessions Semester 7
INSERT INTO sessions (module_id, user_id, date, duration_minutes, note) VALUES
(@m7_4, @userId, '2025-09-01', 120, 'Grundlagen Machine Learning');
