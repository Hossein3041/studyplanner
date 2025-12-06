#!/bin/bash

TOMCAT_DIR="$HOME/tomcat"

PID=$(ps aux | grep "[o]rg.apache.catalina.startup.Bootstrap" | awk '{print $2}')

if [ -z "$PID" ]; then
  echo "Tomcat ist bereits gestoppt."
  exit 0
fi

echo "Stoppe Tomcat (PID: $PID)..."
"$TOMCAT_DIR/bin/shutdown.sh"

for i in {1..5}; do
  sleep 1
  if ps -p "$PID" > /dev/null; then
    echo "Warte auf Shutdown ($i)..."
  else
    echo "Tomcat wurde erfolgreich gestoppt."
    exit 0
  fi
done

echo "⚠️ Tomcat reagiert nicht – erzwungenes Beenden..."
kill -9 "$PID"
echo "☠️ Tomcat wurde zwangsweise beendet."
