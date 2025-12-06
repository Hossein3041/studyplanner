#!/bin/bash

WAR_NAME="meine-webapp"
TOMCAT_DIR="$HOME/tomcat"

echo "Baue das Projekt mit Maven..."
mvn clean package

if [ $? -ne 0 ]; then
    echo "Build fehlgeschlagen. Abbruch."
    exit 1
fi

echo "Entferne alte WAR-Dateien aus Tomcat..."
rm -rf "$TOMCAT_DIR/webapps/$WAR_NAME"
rm -f "$TOMCAT_DIR/webapps/$WAR_NAME.war"

echo "Kopiere neue WAR-Datei nach Tomcat..."
cp "target/$WAR_NAME.war" "$TOMCAT_DIR/webapps/"

echo "Starte Tomcat neu..."
"$TOMCAT_DIR/bin/shutdown.sh" > /dev/null 2>&1
sleep 2
"$TOMCAT_DIR/bin/startup.sh"

echo "Deployment abgeschlossen!"
echo "Jetzt öffnen: http://localhost:8080/$WAR_NAME/index.html"
