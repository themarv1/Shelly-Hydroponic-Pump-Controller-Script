# Shelly Plus 1PM Hydroponic Pump Controller Script v1.1

This script provides automated control for a pump connected to a Shelly Plus 1PM device, specifically tailored for hydroponic systems. It uses fixed time schedules to differentiate between day and night cycles and includes advanced notification features via Telegram and optional monitoring via Uptime Kuma.

---

## English

### Features

* **Fixed Day/Night Cycles:** Operates the pump based on user-defined start and end hours for the "day" period.
* **Configurable Durations:** Allows setting different pump ON and OFF durations (in minutes) for day and night cycles.
* **Advanced Telegram Notifications:**
    * Loud notification on script startup (e.g., after power restore).
    * Silent notification when switching between day and night modes.
    * Silent daily status message confirming the script is running and the current mode/pump state.
    * Optional silent debug notifications for every pump ON/OFF action.
    * Loud notification for critical script errors (e.g., timer failures).
* **Optional Uptime Kuma Push/Heartbeat Monitoring:** Periodically pings an Uptime Kuma Push URL to externally monitor script activity.
* **mJS Based:** Runs locally on the Shelly device using the mJS scripting engine.

### Requirements

* **Hardware:** Shelly Plus 1PM (should work on other Shelly Gen2/Gen3 devices supporting mJS and Switch output, but untested).
* **Software:**
    * Shelly firmware that supports mJS scripting (requires a modern version for reliable operation, tested partially on `1.5.1`).
    * Device connected to a Wi-Fi network with internet access (for Telegram, NTP & optional Uptime Kuma).
    * NTP time synchronization enabled and correctly configured on the Shelly device.
    * A Telegram Bot Token.
    * The Telegram Chat ID where notifications should be sent.
    * (Optional) An Uptime Kuma instance and a configured Push Monitor URL.

### Configuration

Open the script file (`.js`) and adjust the variables within the configuration sections at the top:

```javascript
// --- CONFIGURATION ---

// Switch ID of the relay (usually 0 for Shelly Plus 1PM)
let CONFIG_SWITCH_ID = 0;

// --- Fixed Day/Night Times ---
// Hour when the day starts (0-23)
let CONFIG_DAY_START_HOUR = 6;  // Example: 06:00 AM
// Hour when the day ends (night starts) (0-23)
let CONFIG_DAY_END_HOUR = 18;   // Example: 6:00 PM (18:00 is already night)

// --- Cycle Duration Configuration ---
// Duration in minutes for the DAY cycle (between START_HOUR and END_HOUR)
let CONFIG_DAY_ON_MIN = 15;     // Pump ON for 15 minutes
let CONFIG_DAY_OFF_MIN = 45;    // Pump OFF for 45 minutes

// Duration in minutes for the NIGHT cycle (before START_HOUR and from END_HOUR onwards)
let CONFIG_NIGHT_ON_MIN = 15;   // Pump ON for 15 minutes
let CONFIG_NIGHT_OFF_MIN = 180; // Pump OFF for 3 hours

// --- NOTIFICATION CONFIGURATION ---
// Enable notifications globally? (true or false)
let CONFIG_ENABLE_NOTIFICATIONS = true;
// Telegram Bot Token (obtain from BotFather) - !! REPLACE THIS !!
let CONFIG_TELEGRAM_BOT_TOKEN = "DEIN_BOT_TOKEN_HIER_EINFUEGEN";
// Telegram Chat ID (recipient of messages) - !! REPLACE THIS !!
let CONFIG_TELEGRAM_CHAT_ID = "DEINE_CHAT_ID_HIER_EINFUEGEN";
// Enable Debug mode for pump switching notifications? (true = ON, false = OFF)
let CONFIG_DEBUG_PUMP_NOTIFICATIONS = false;
// Hour for daily status message (0-23)
let CONFIG_DAILY_STATUS_HOUR = 8; // Example: 08:00 AM

// --- UPTIME KUMA CONFIGURATION ---
// Enable Uptime Kuma heartbeat pings? (true or false)
let CONFIG_UPTIME_KUMA_ENABLE = false;
// The full Push URL from your Uptime Kuma monitor - !! REPLACE THIS !!
let CONFIG_UPTIME_KUMA_PUSH_URL = "YOUR_UPTIME_KUMA_PUSH_URL_HERE";
// Interval in seconds to send the heartbeat (e.g., 300 for 5 minutes)
// Should be slightly less than or equal to the interval configured in Uptime Kuma
let CONFIG_UPTIME_KUMA_INTERVAL_SEC = 300;

// --- END CONFIGURATION ---
```

**Important Configuration Notes:**

* You **must** replace the placeholder values for `CONFIG_TELEGRAM_BOT_TOKEN` and `CONFIG_TELEGRAM_CHAT_ID`.
* If `CONFIG_UPTIME_KUMA_ENABLE` is set to `true`, you **must** replace the placeholder for `CONFIG_UPTIME_KUMA_PUSH_URL` with the actual Push URL from your Uptime Kuma monitor.
* Adjust cycle durations, day/night hours, and notification settings to your needs.

### Installation

1.  **Access Shelly Web UI:** Find your Shelly device's IP address and open it in a web browser on the same network.
2.  **Navigate to Scripts:** Click on "Scripts" in the left-hand menu.
3.  **Add New Script:** Click "Add Script".
4.  **Paste Code:** Give the script a name (e.g., "Hydroponic Control v1.1") and paste the entire content of the script file into the code editor.
5.  **Save:** Click "Save".
6.  **Enable Script:** Find the saved script in the list and click the toggle switch to enable it (it should turn blue).

### Usage & Troubleshooting

* The script will start automatically after being enabled or after the Shelly device reboots.
* You should receive a Telegram notification confirming the script has started (Loud).
* Other notifications (Day/Night switch, Daily Status, Debug ON/OFF) will be sent silently if enabled. Critical errors are sent loudly.
* Monitor the **"Console"** section within the "Scripts" area of the Shelly Web UI for detailed log messages and potential errors. This is the primary tool for debugging.
* If Telegram notifications are not received, double-check Token/Chat ID, internet connectivity, and whether you've started a chat with the bot.
* If Uptime Kuma shows the monitor as down (and it's enabled in the script), check the Shelly's network connection and the script console for potential errors sending the heartbeat (`Error sending Uptime Kuma heartbeat...`). Ensure the Push URL is correct and the interval in the script matches Uptime Kuma's expectation.

### Changelog

**v1.1**
* Added optional Uptime Kuma Push/Heartbeat monitoring.
* Added configuration variables for Uptime Kuma integration (`CONFIG_UPTIME_KUMA_ENABLE`, `CONFIG_UPTIME_KUMA_PUSH_URL`, `CONFIG_UPTIME_KUMA_INTERVAL_SEC`).
* Added `sendUptimeKumaHeartbeat` function and scheduling timer.

**v1.0** (*2025-04-24*)
* Initial release based on script version 8.1.
* Features: Fixed day/night cycles, configurable durations, advanced Telegram notifications (loud start/error, silent switch/daily/debug), English comments and logs.

**v0.1** (*2025-04-16*)
* Initial release only for testing
* Features: day/night cycles, configurable durations, Telegram notifications

### License

This project is licensed under the MIT License.

### Disclaimer

This script is provided "as is", without warranty of any kind. Use it at your own risk. The author is not responsible for any damage to equipment or loss of crops resulting from the use of this script. Test thoroughly before relying on it for critical systems.

---

## Deutsch

### Funktionen

* **Feste Tag-/Nachtzyklen:** Steuert die Pumpe basierend auf benutzerdefinierten Start- und Endzeiten für die "Tag"-Periode.
* **Konfigurierbare Dauer:** Ermöglicht das Einstellen unterschiedlicher Pumpen-AN- und AUS-Dauern (in Minuten) für Tag- und Nachtzyklen.
* **Erweiterte Telegram-Benachrichtigungen:**
    * Laute Benachrichtigung beim Skriptstart (z.B. nach Stromausfall).
    * Stumme Benachrichtigung beim Wechsel zwischen Tag- und Nachtmodus.
    * Stumme tägliche Statusmeldung, die bestätigt, dass das Skript läuft und den aktuellen Modus/Pumpenstatus anzeigt.
    * Optional stumme Debug-Benachrichtigungen für jeden Schaltvorgang der Pumpe (AN/AUS).
    * Laute Benachrichtigung bei kritischen Skriptfehlern (z.B. Timer-Fehler).
* **Optionale Uptime Kuma Push/Heartbeat Überwachung:** Sendet periodisch einen Ping an eine Uptime Kuma Push-URL zur externen Überwachung der Skriptaktivität.
* **mJS-Basiert:** Läuft lokal auf dem Shelly-Gerät mittels der mJS-Skripting-Engine.

### Voraussetzungen

* **Hardware:** Shelly Plus 1PM (sollte auf anderen Shelly Gen2/Gen3 Geräten mit mJS und Schaltausgang funktionieren, aber ungetestet).
* **Software:**
    * Shelly-Firmware, die mJS-Scripting unterstützt (erfordert eine moderne Version für zuverlässigen Betrieb, teilweise getestet auf `1.5.1`).
    * Gerät verbunden mit einem WLAN-Netzwerk mit Internetzugang (für Telegram, NTP & optional Uptime Kuma).
    * NTP-Zeitsynchronisation auf dem Shelly-Gerät aktiviert und korrekt konfiguriert.
    * Ein Telegram Bot Token.
    * Die Telegram Chat ID, an die Benachrichtigungen gesendet werden sollen.
    * (Optional) Eine Uptime Kuma Instanz und eine konfigurierte Push-Monitor-URL.

### Konfiguration

Öffne die Skript-Datei (`.js`) und passe die Variablen in den Konfigurations-Abschnitten am Anfang an:

```javascript
// --- KONFIGURATION ---

// Schalt-ID des Relais (bei Shelly Plus 1PM normalerweise 0)
let CONFIG_SWITCH_ID = 0;

// --- Feste Zeiten für Tag/Nacht ---
// Stunde, an der der Tag beginnt (0-23)
let CONFIG_DAY_START_HOUR = 6;  // Beispiel: 06:00 Uhr
// Stunde, an der der Tag endet (die Nacht beginnt) (0-23)
let CONFIG_DAY_END_HOUR = 18;   // Beispiel: 18:00 Uhr (d.h. 18:00 ist schon Nacht)

// --- Zyklus-Dauer Konfiguration ---
// Dauer in Minuten für den TAG-Zyklus (zwischen START_HOUR und END_HOUR)
let CONFIG_DAY_ON_MIN = 15;     // Pumpe AN für 15 Minuten
let CONFIG_DAY_OFF_MIN = 45;    // Pumpe AUS für 45 Minuten

// Dauer in Minuten für den NACHT-Zyklus (vor START_HOUR und ab END_HOUR)
let CONFIG_NIGHT_ON_MIN = 15;   // Pumpe AN für 15 Minuten
let CONFIG_NIGHT_OFF_MIN = 180; // Pumpe AUS für 3 Stunden

// --- BENACHRICHTIGUNGS-KONFIGURATION ---
// Benachrichtigungen generell aktivieren? (true oder false)
let CONFIG_ENABLE_NOTIFICATIONS = true;
// Telegram Bot Token (von BotFather erhalten) - !! UNBEDINGT ERSETZEN !!
let CONFIG_TELEGRAM_BOT_TOKEN = "DEIN_BOT_TOKEN_HIER_EINFUEGEN";
// Telegram Chat ID (Empfänger der Nachricht) - !! UNBEDINGT ERSETZEN !!
let CONFIG_TELEGRAM_CHAT_ID = "DEINE_CHAT_ID_HIER_EINFUEGEN";
// Debug-Modus für Pumpen-Schaltungen aktivieren? (true = AN, false = AUS)
let CONFIG_DEBUG_PUMP_NOTIFICATIONS = false;
// Stunde für tägliche Statusmeldung (0-23)
let CONFIG_DAILY_STATUS_HOUR = 8; // Beispiel: 08:00 Uhr morgens

// --- UPTIME KUMA KONFIGURATION ---
// Uptime Kuma Heartbeat Pings aktivieren? (true oder false)
let CONFIG_UPTIME_KUMA_ENABLE = false;
// Die vollständige Push-URL von deinem Uptime Kuma Monitor - !! UNBEDINGT ERSETZEN !!
let CONFIG_UPTIME_KUMA_PUSH_URL = "YOUR_UPTIME_KUMA_PUSH_URL_HERE";
// Intervall in Sekunden für das Senden des Heartbeats (z.B. 300 für 5 Minuten)
// Sollte kleiner oder gleich dem in Uptime Kuma konfigurierten Intervall sein
let CONFIG_UPTIME_KUMA_INTERVAL_SEC = 300;

// --- ENDE KONFIGURATION ---
```

**Wichtige Konfigurations-Hinweise:**

* Du **musst** die Platzhalterwerte für `CONFIG_TELEGRAM_BOT_TOKEN` und `CONFIG_TELEGRAM_CHAT_ID` ersetzen.
* Wenn `CONFIG_UPTIME_KUMA_ENABLE` auf `true` gesetzt ist, **musst** du den Platzhalter für `CONFIG_UPTIME_KUMA_PUSH_URL` durch die echte Push-URL deines Uptime Kuma Monitors ersetzen.
* Passe Zyklusdauern, Tag-/Nachtzeiten und Benachrichtigungs-Einstellungen nach Bedarf an.

### Installation

1.  **Shelly Web UI aufrufen:** Finde die IP-Adresse deines Shelly-Geräts und öffne sie in einem Webbrowser im selben Netzwerk.
2.  **Zu Scripts navigieren:** Klicke im Menü links auf "Scripts".
3.  **Neues Skript hinzufügen:** Klicke auf "Add Script".
4.  **Code einfügen:** Gib dem Skript einen Namen (z.B. "Hydroponic Control v1.1") und füge den gesamten Inhalt der Skript-Datei in den Code-Editor ein.
5.  **Speichern:** Klicke auf "Save".
6.  **Skript aktivieren:** Finde das gespeicherte Skript in der Liste und klicke auf den Schalter zum Aktivieren (er sollte blau werden).

### Benutzung & Fehlerbehebung

* Das Skript startet automatisch nach der Aktivierung oder nachdem das Shelly-Gerät neu gestartet wird.
* Du solltest eine laute Telegram-Benachrichtigung erhalten, die den Start des Skripts bestätigt.
* Andere Benachrichtigungen (Tag-/Nacht-Wechsel, Täglicher Status, Debug AN/AUS) werden stumm gesendet, falls aktiviert. Kritische Fehler werden laut gesendet.
* Überwache den Bereich **"Console"** unter "Scripts" in der Shelly Web UI für detaillierte Log-Meldungen und mögliche Fehler. Dies ist das wichtigste Werkzeug zur Fehlersuche.
* Wenn keine Telegram-Benachrichtigungen ankommen, überprüfe Token/Chat ID, Internetverbindung und ob du einen Chat mit dem Bot gestartet hast.
* Wenn Uptime Kuma den Monitor als "Down" anzeigt (und er im Skript aktiviert ist), prüfe die Netzwerkverbindung des Shelly und die Skript-Konsole auf mögliche Fehler beim Senden des Heartbeats (`Error sending Uptime Kuma heartbeat...`). Stelle sicher, dass die Push-URL korrekt ist und das Intervall im Skript zu Uptime Kuma passt.

### Changelog (Änderungsprotokoll)

**v1.1 DEV**
* Optionale Uptime Kuma Push/Heartbeat Überwachung hinzugefügt.
* Konfigurationsvariablen für Uptime Kuma Integration hinzugefügt (`CONFIG_UPTIME_KUMA_ENABLE`, `CONFIG_UPTIME_KUMA_PUSH_URL`, `CONFIG_UPTIME_KUMA_INTERVAL_SEC`).
* `sendUptimeKumaHeartbeat`-Funktion und Timer-Planung hinzugefügt.

**v1.0** (*2025-04-24*)
* Erstes Release basierend auf Skript Version 8.1.
* Funktionen: Feste Tag-/Nachtzyklen, konfigurierbare Dauern, erweiterte Telegram-Benachrichtigungen (lauter Start/Fehler, stummer Wechsel/Tagesmeldung/Debug), englische Kommentare und Logs.

**v0.1** (*2025-04-16*)
* Test Release.
* Funktionen: Feste Tag-/Nachtzyklen, konfigurierbare Dauern, Telegram-Benachrichtigungen


### Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

### Haftungsausschluss

Dieses Skript wird ohne Mängelgewähr ("as is") bereitgestellt. Die Nutzung erfolgt auf eigenes Risiko. Der Autor haftet nicht für Schäden an Geräten oder Ernteverluste, die durch die Verwendung dieses Skripts entstehen. Teste das Skript gründlich, bevor du dich bei kritischen Systemen darauf verlässt.
