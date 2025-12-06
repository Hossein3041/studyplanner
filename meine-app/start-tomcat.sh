TOMCAT_DIR="$HOME/tomcat"

echo "Starte Tomcat..."
"$TOMCAT_DIR/bin/startup.sh"

sleep 1
PID=$(ps aux | grep "[o]rg.apache.catalina.startup.Bootstrap" | awk '{print $2}')
if [ -n "$PID" ]; then
  echo "Tomcat läuft (PID: $PID)"
  echo "Öffne im Browser: http://localhost:8080"
else
  echo "Fehler: Tomcat konnte nicht gestartet werden."
fi
