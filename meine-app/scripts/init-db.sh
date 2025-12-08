#!/bin/bash
set -e  # stoppe Script sofort bei Fehlern

DB_USER="studyplanner"
DB_PASS="KrJVAae44."
DB_NAME="studyplanner"

SQL_DIR="src/main/resources/db"

echo "Erstelle Tabellen..."
mariadb -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_DIR/create-tables.sql"

echo "Lade Testdaten..."
mariadb -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_DIR/insert-testdata.sql"

echo "Datenbank erfolgreich initialisiert!"

# mariadb -u studyplanner -p studyplanner