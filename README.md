# Shelly Plus 1PM Hydroponic Pump Controller Script v1.2

This script provides automated control for a pump connected to a Shelly Plus 1PM device, specifically tailored for hydroponic systems. It uses fixed time schedules to differentiate between day and night cycles and includes advanced, configurable notification features via Telegram and optional monitoring via Uptime Kuma.

---

## English

### Features

* **Fixed Day/Night Cycles:** Operates the pump based on user-defined start and end hours for the "day" period.
* **Configurable Durations:** Allows setting different pump ON and OFF durations (in minutes) for day and night cycles.
* **Advanced Telegram Notifications:**
    * Loud notification on script startup.
    * Silent notification when switching between day and night modes.
    * Silent daily status message confirming the script is running and the current mode/pump state.
    * Optional silent debug notifications for every pump ON/OFF action.
    * Loud notification for critical script errors.
* **Configurable Message Templates:** Allows easy customization of all Telegram notification messages via configuration variables.
* **Optional Uptime Kuma Push/Heartbeat Monitoring:** Periodically pings an Uptime Kuma Push URL to externally monitor script activity.
* **mJS Based:** Runs locally on the Shelly device using the mJS scripting engine.

### Requirements

* **Hardware:** Shelly Plus 1PM (should work on other Shelly Gen2/Gen3 devices supporting mJS and Switch output, but untested).
* **Software:**
    * Shelly firmware that supports mJS scripting (requires a modern version for reliable operation).
    * Device connected to a Wi-Fi network with internet access (for Telegram, NTP & optional Uptime Kuma).
    * NTP time synchronization enabled and correctly configured on the Shelly device.
    * A Telegram Bot Token.
    * The Telegram Chat ID where notifications should be sent.
    * (Optional) An Uptime Kuma instance and a configured Push Monitor URL.

### Configuration

Open the script file (`.js`) and adjust the variables within the configuration sections at the top:

```javascript
// --- GENERAL CONFIGURATION ---
let CONFIG_SWITCH_ID = 0;

// --- Fixed Day/Night Times ---
let CONFIG_DAY_START_HOUR = 6;
let CONFIG_DAY_END_HOUR = 18;

// --- Cycle Duration Configuration ---
let CONFIG_DAY_ON_MIN = 15;
let CONFIG_DAY_OFF_MIN = 45;
let CONFIG_NIGHT_ON_MIN = 15;
let CONFIG_NIGHT_OFF_MIN = 180;

// --- NOTIFICATION CONFIGURATION ---
let CONFIG_ENABLE_NOTIFICATIONS = true;
let CONFIG_TELEGRAM_BOT_TOKEN = "DEIN_BOT_TOKEN_HIER_EINFUEGEN"; // !! REPLACE !!
let CONFIG_TELEGRAM_CHAT_ID = "DEINE_CHAT_ID_HIER_EINFUEGEN";   // !! REPLACE !!
let CONFIG_DEBUG_PUMP_NOTIFICATIONS = false;
let CONFIG_DAILY_STATUS_HOUR = 8;

// --- UPTIME KUMA CONFIGURATION ---
let CONFIG_UPTIME_KUMA_ENABLE = false;
let CONFIG_UPTIME_KUMA_PUSH_URL = "YOUR_UPTIME_KUMA_PUSH_URL_HERE"; // !! REPLACE if enabled !!
let CONFIG_UPTIME_KUMA_INTERVAL_SEC = 300;

// --- NOTIFICATION MESSAGES (Editable Templates) ---
// You can edit the text here. Use <b>...</b> for bold.
// Placeholders like {MODE}, {PUMP_STATE}, {CYCLE_INFO}, {DELAY_SEC} will be replaced by the script.
let CONFIG_MSG_STARTUP = "✅ <b>Hydroponic Script Started</b>\nInitial Mode: {MODE}";
let CONFIG_MSG_MODE_SWITCH = "ℹ️ Switching to <b>{MODE} Mode</b> (Cycles: {CYCLE_INFO} Min).";
let CONFIG_MSG_DAILY_STATUS = "<b>ℹ️ Daily Status</b>\nMode: {MODE}\nPump: {PUMP_STATE}\nScript running OK.";
let CONFIG_MSG_DEBUG_ON = "⚙️ DEBUG: Pump turned ON (Cycle).";
let CONFIG_MSG_DEBUG_OFF = "⚙️ DEBUG: Pump turned OFF (Cycle).";
let CONFIG_MSG_TIMER_ERROR = "<b>🚨 CRITICAL ERROR: Timer Delay Zero!</b>\nCycle stopped. Pump might be stuck ON or OFF.\nDetails: Invalid Delay = {DELAY_SEC}s";

// --- END CONFIGURATION ---
```

**Important Configuration Notes:**

* You **must** replace the placeholder values for `CONFIG_TELEGRAM_BOT_TOKEN` and `CONFIG_TELEGRAM_CHAT_ID`.
* If `CONFIG_UPTIME_KUMA_ENABLE` is set to `true`, you **must** replace the placeholder for `CONFIG_UPTIME_KUMA_PUSH_URL`.
* Adjust cycle durations, day/night hours, and other notification settings to your needs.
* **Message Templates:** You can customize the text in the `CONFIG_MSG_...` variables. Make sure to keep the placeholders (`{MODE}`, `{PUMP_STATE}`, etc.) intact, as the script uses them to insert dynamic values. You can use basic HTML like `<b>...</b>` for formatting.

### Installation

1.  **Access Shelly Web UI:** Find your Shelly device's IP address and open it in a web browser on the same network.
2.  **Navigate to Scripts:** Click on "Scripts" in the left-hand menu.
3.  **Add New Script:** Click "Add Script".
4.  **Paste Code:** Give the script a name (e.g., "Hydroponic Control v1.2") and paste the entire content of the script file into the code editor.
5.  **Save:** Click "Save".
6.  **Enable Script:** Find the saved script in the list and click the toggle switch to enable it (it should turn blue).

### Usage & Troubleshooting

* The script will start automatically after being enabled or after the Shelly device reboots.
* Monitor the **"Console"** section within the "Scripts" area of the Shelly Web UI for detailed log messages and potential errors.
* If Telegram notifications are not received, check Token/Chat ID, internet connectivity, and bot chat status.
* If Uptime Kuma shows the monitor as down, check the Shelly's network connection, the script console for errors, the Push URL, and the interval settings.

### Changelog

**v1.2** (2025-04-29)
* Added configurable message templates for all Telegram notifications. Centralized message texts in the configuration section.

**v1.1** (*YYYY-MM-DD* - Please fill in date)
* Added optional Uptime Kuma Push/Heartbeat monitoring.
* Added configuration variables for Uptime Kuma integration.

**v1.0** (*YYYY-MM-DD* - Please fill in date of your initial release)
* Initial release based on script version 8.1.
* Features: Fixed day/night cycles, configurable durations, advanced Telegram notifications (loud start/error, silent switch/daily/debug), English comments and logs.

### License

This project is licensed under the MIT License. (You should include the actual license text or a LICENSE file).

### Disclaimer

This script is provided "as is", without warranty of any kind. Use it at your own risk. The author is not responsible for any damage to equipment or loss of crops resulting from the use of this script. Test thoroughly before relying on it for critical systems.

---

## Deutsch

### Funktionen

* **Feste Tag-/Nachtzyklen:** Steuert die Pumpe basierend auf benutzerdefinierten Start- und Endzeiten für die "Tag"-Periode.
* **Konfigurierbare Dauer:** Ermöglicht das Einstellen unterschiedlicher Pumpen-AN- und AUS-Dauern (in Minuten) für Tag- und Nachtzyklen.
* **Erweiterte Telegram-Benachrichtigungen:**
    * Laute Benachrichtigung beim Skriptstart.
    * Stumme Benachrichtigung beim Wechsel zwischen Tag- und Nachtmodus.
    * Stumme tägliche Statusmeldung, die bestätigt, dass das Skript läuft und den aktuellen Modus/Pumpenstatus anzeigt.
    * Optional stumme Debug-Benachrichtigungen für jeden Schaltvorgang der Pumpe (AN/AUS).
    * Laute Benachrichtigung bei kritischen Skriptfehlern.
* **Konfigurierbare Nachrichten-Vorlagen:** Ermöglicht die einfache Anpassung aller Telegram-Nachrichtentexte über Konfigurationsvariablen.
* **Optionale Uptime Kuma Push/Heartbeat Überwachung:** Sendet periodisch einen Ping an eine Uptime Kuma Push-URL zur externen Überwachung der Skriptaktivität.
* **mJS-Basiert:** Läuft lokal auf dem Shelly-Gerät mittels der mJS-Skripting-Engine.

### Voraussetzungen

* **Hardware:** Shelly Plus 1PM (sollte auf anderen Shelly Gen2/Gen3 Geräten mit mJS und Schaltausgang funktionieren, aber ungetestet).
* **Software:**
    * Shelly-Firmware, die mJS-Scripting unterstützt (erfordert eine moderne Version für zuverlässigen Betrieb).
    * Gerät verbunden mit einem WLAN-Netzwerk mit Internetzugang (für Telegram, NTP & optional Uptime Kuma).
    * NTP-Zeitsynchronisation auf dem Shelly-Gerät aktiviert und korrekt konfiguriert.
    * Ein Telegram Bot Token.
    * Die Telegram Chat ID, an die Benachrichtigungen gesendet werden sollen.
    * (Optional) Eine Uptime Kuma Instanz und eine konfigurierte Push-Monitor-URL.

### Konfiguration

Öffne die Skript-Datei (`.js`) und passe die Variablen in den Konfigurations-Abschnitten am Anfang an:

```javascript
// --- GENERAL CONFIGURATION ---
let CONFIG_SWITCH_ID = 0;

// --- Fixed Day/Night Times ---
let CONFIG_DAY_START_HOUR = 6;
let CONFIG_DAY_END_HOUR = 18;

// --- Cycle Duration Configuration ---
let CONFIG_DAY_ON_MIN = 15;
let CONFIG_DAY_OFF_MIN = 45;
let CONFIG_NIGHT_ON_MIN = 15;
let CONFIG_NIGHT_OFF_MIN = 180;

// --- NOTIFICATION CONFIGURATION ---
let CONFIG_ENABLE_NOTIFICATIONS = true;
let CONFIG_TELEGRAM_BOT_TOKEN = "DEIN_BOT_TOKEN_HIER_EINFUEGEN"; // !! REPLACE !!
let CONFIG_TELEGRAM_CHAT_ID = "DEINE_CHAT_ID_HIER_EINFUEGEN";   // !! REPLACE !!
let CONFIG_DEBUG_PUMP_NOTIFICATIONS = false;
let CONFIG_DAILY_STATUS_HOUR = 8;

// --- UPTIME KUMA CONFIGURATION ---
let CONFIG_UPTIME_KUMA_ENABLE = false;
let CONFIG_UPTIME_KUMA_PUSH_URL = "YOUR_UPTIME_KUMA_PUSH_URL_HERE"; // !! REPLACE if enabled !!
let CONFIG_UPTIME_KUMA_INTERVAL_SEC = 300;

// --- NOTIFICATION MESSAGES (Editable Templates) ---
// Hier können die Texte angepasst werden. Nutze <b>...</b> für Fettdruck.
// Platzhalter wie {MODE}, {PUMP_STATE}, {CYCLE_INFO}, {DELAY_SEC} werden vom Skript ersetzt.
let CONFIG_MSG_STARTUP = "✅ <b>Hydroponic Script Started</b>\nInitial Mode: {MODE}";
let CONFIG_MSG_MODE_SWITCH = "ℹ️ Switching to <b>{MODE} Mode</b> (Cycles: {CYCLE_INFO} Min).";
let CONFIG_MSG_DAILY_STATUS = "<b>ℹ️ Daily Status</b>\nMode: {MODE}\nPump: {PUMP_STATE}\nScript running OK.";
let CONFIG_MSG_DEBUG_ON = "⚙️ DEBUG: Pump turned ON (Cycle).";
let CONFIG_MSG_DEBUG_OFF = "⚙️ DEBUG: Pump turned OFF (Cycle).";
let CONFIG_MSG_TIMER_ERROR = "<b>🚨 CRITICAL ERROR: Timer Delay Zero!</b>\nCycle stopped. Pump might be stuck ON or OFF.\nDetails: Invalid Delay = {DELAY_SEC}s";

// --- END CONFIGURATION ---
```

**Wichtige Konfigurations-Hinweise:**

* Du **musst** die Platzhalterwerte für `CONFIG_TELEGRAM_BOT_TOKEN` und `CONFIG_TELEGRAM_CHAT_ID` ersetzen.
* Wenn `CONFIG_UPTIME_KUMA_ENABLE` auf `true` gesetzt ist, **musst** du den Platzhalter für `CONFIG_UPTIME_KUMA_PUSH_URL` ersetzen.
* Passe Zyklusdauern, Tag-/Nachtzeiten und andere Benachrichtigungs-Einstellungen nach Bedarf an.
* **Nachrichten-Vorlagen:** Du kannst die Texte in den `CONFIG_MSG_...`-Variablen anpassen. Achte darauf, die Platzhalter (`{MODE}`, `{PUMP_STATE}`, etc.) intakt zu lassen, da das Skript sie zum Einfügen dynamischer Werte verwendet. Du kannst einfaches HTML wie `<b>...</b>` zur Formatierung nutzen.

### Installation

1.  **Shelly Web UI aufrufen:** Finde die IP-Adresse deines Shelly-Geräts und öffne sie in einem Webbrowser im selben Netzwerk.
2.  **Zu Scripts navigieren:** Klicke im Menü links auf "Scripts".
3.  **Neues Skript hinzufügen:** Klicke auf "Add Script".
4.  **Code einfügen:** Gib dem Skript einen Namen (z.B. "Hydroponic Control v1.2") und füge den gesamten Inhalt der Skript-Datei in den Code-Editor ein.
5.  **Speichern:** Klicke auf "Save".
6.  **Skript aktivieren:** Finde das gespeicherte Skript in der Liste und klicke auf den Schalter zum Aktivieren (er sollte blau werden).

### Benutzung & Fehlerbehebung

* Das Skript startet automatisch nach der Aktivierung oder nachdem das Shelly-Gerät neu gestartet wird.
* Überwache den Bereich **"Console"** unter "Scripts" in der Shelly Web UI für detaillierte Log-Meldungen und mögliche Fehler.
* Wenn keine Telegram-Benachrichtigungen ankommen, überprüfe Token/Chat ID, Internetverbindung und Bot-Chat-Status.
* Wenn Uptime Kuma den Monitor als "Down" anzeigt, prüfe die Netzwerkverbindung des Shelly, die Skript-Konsole auf Fehler, die Push-URL und die Intervall-Einstellungen.

### Changelog (Änderungsprotokoll)

**v1.2** (2025-04-29)
* Konfigurierbare Nachrichten-Vorlagen für alle Telegram-Benachrichtigungen hinzugefügt. Zentralisierung der Nachrichtentexte im Konfigurationsbereich.

**v1.1** (*JJJJ-MM-TT* - Bitte Datum eintragen)
* Optionale Uptime Kuma Push/Heartbeat Überwachung hinzugefügt.
* Konfigurationsvariablen für Uptime Kuma Integration hinzugefügt.

**v1.0** (*JJJJ-MM-TT* - Bitte Datum deines Releases eintragen)
* Erstes Release basierend auf Skript Version 8.1.
* Funktionen: Feste Tag-/Nachtzyklen, konfigurierbare Dauern, erweiterte Telegram-Benachrichtigungen, englische Kommentare und Logs.

### Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. (Du solltest den eigentlichen Lizenztext oder eine LICENSE-Datei beifügen).

### Haftungsausschluss

Dieses Skript wird ohne Mängelgewähr ("as is") bereitgestellt. Die Nutzung erfolgt auf eigenes Risiko. Der Autor haftet nicht für Schäden an Geräten oder Ernteverluste, die durch die Verwendung dieses Skripts entstehen. Teste das Skript gründlich, bevor du dich bei kritischen Systemen darauf verlässt.
