This script provides automated control for a pump connected to a Shelly Plus 1PM device, specifically tailored for hydroponic systems. It uses fixed time schedules to differentiate between day and night cycles and includes advanced notification features via Telegram.

---

## English

### Features

* **Fixed Day/Night Cycles:** Operates the pump based on user-defined start and end hours for the "day" period.
* **Configurable Durations:** Allows setting different pump ON and OFF durations (in minutes) for day and night cycles.
* **Advanced Telegram Notifications:**
    * Loud notification on script startup (e.g., after power restore).
    * Silent notification when switching between day and night modes.
    * Silent daily status message confirming the script is running and the current mode.
    * Optional silent debug notifications for every pump ON/OFF action.
    * Loud notification for critical script errors (e.g., timer failures).
* **mJS Based:** Runs locally on the Shelly device using the mJS scripting engine.

### Requirements

* **Hardware:** Shelly Plus 1PM (should work on other Shelly Gen2/Gen3 devices supporting mJS and Switch output, but untested).
* **Software:**
    * Shelly firmware that supports mJS scripting (tested partially on `1.5.1`, requires modern version for reliable operation).
    * Device connected to a Wi-Fi network with internet access (for Telegram & NTP).
    * NTP time synchronization enabled and correctly configured on the Shelly device.
    * A Telegram Bot Token.
    * The Telegram Chat ID where notifications should be sent.

### Configuration

Open the script file (`.js`) and adjust the variables within the `// --- KONFIGURATION ---` and `// --- BENACHRICHTIGUNGS-KONFIGURATION ---` sections:

```javascript
// --- CONFIGURATION ---

// Switch ID of the relay (usually 0 for Shelly Plus 1PM)
let CONFIG_SWITCH_ID = 0;

// --- Fixed Day/Night Times ---
// Hour when the day starts (0-23)
let CONFIG_DAY_START_HOUR = 6;  // Example: 06:00 AM
// Hour when the day ends (night starts) (0-23)
let CONFIG_DAY_END_HOUR = 18;   // Example: 6:00 PM (18:00 is already night)

// Duration in minutes for the DAY cycle (between START_HOUR and END_HOUR)
let CONFIG_DAY_ON_MIN = 15;
let CONFIG_DAY_OFF_MIN = 45;

// Duration in minutes for the NIGHT cycle (before START_HOUR and from END_HOUR onwards)
let CONFIG_NIGHT_ON_MIN = 15;
let CONFIG_NIGHT_OFF_MIN = 180;  // 3 hours

// --- NOTIFICATION CONFIGURATION ---
// Enable notifications globally? (true or false)
let CONFIG_ENABLE_NOTIFICATIONS = true;
// Telegram Bot Token (obtain from BotFather) - !! REPLACE THIS !!
let CONFIG_TELEGRAM_BOT_TOKEN = "DEIN_BOT_TOKEN_HIER_EINFUEGEN";
// Telegram Chat ID (recipient of messages) - !! REPLACE THIS !!
let CONFIG_TELEGRAM_CHAT_ID = "DEINE_CHAT_ID_HIER_EINFUEGEN";
// NEW: Enable Debug mode for pump switching notifications? (true = ON, false = OFF)
let CONFIG_DEBUG_PUMP_NOTIFICATIONS = false;
// NEW: Hour for daily status message (0-23)
let CONFIG_DAILY_STATUS_HOUR = 8; // Example: 08:00 AM

// --- END CONFIGURATION ---
```

**Important:** You **must** replace the placeholder values for `CONFIG_TELEGRAM_BOT_TOKEN` and `CONFIG_TELEGRAM_CHAT_ID` with your actual bot token and chat ID.

### Installation

1.  **Access Shelly Web UI:** Find your Shelly device's IP address and open it in a web browser on the same network.
2.  **Navigate to Scripts:** Click on "Scripts" in the left-hand menu.
3.  **Add New Script:** Click "Add Script".
4.  **Paste Code:** Give the script a name (e.g., "Hydroponic Control") and paste the entire content of the script file into the code editor.
5.  **Save:** Click "Save".
6.  **Enable Script:** Find the saved script in the list and click the toggle switch to enable it (it should turn blue).

### Usage & Troubleshooting

* The script will start automatically after being enabled or after the Shelly device reboots.
* You should receive a Telegram notification confirming the script has started.
* Monitor the **"Console"** section within the "Scripts" area of the Shelly Web UI for detailed log messages and potential errors. This is the primary tool for debugging.
* If Telegram notifications are not received, double-check:
    * `CONFIG_ENABLE_NOTIFICATIONS` is `true`.
    * Bot Token and Chat ID are correct and replaced in the configuration.
    * The Shelly device has internet connectivity.
    * You have started a chat with your Telegram Bot at least once.
* The script uses fixed times; ensure `CONFIG_DAY_START_HOUR` and `CONFIG_DAY_END_HOUR` are set according to your needs.

### License

This project is licensed under the MIT License - see the LICENSE file for details (or add MIT License text here).

### Disclaimer

This script is provided "as is", without warranty of any kind. Use it at your own risk. The author is not responsible for any damage to equipment or loss of crops resulting from the use of this script. Test thoroughly before relying on it for critical systems.

---

## Deutsch

### Funktionen

* **Feste Tag-/Nachtzyklen:** Steuert die Pumpe basierend auf benutzerdefinierten Start- und Endzeiten für die "Tag"-Periode.
* **Konfigurierbare Dauer:** Ermöglicht das Einstellen unterschiedlicher AN- und AUS-Dauern (in Minuten) für Tag- und Nachtzyklen.
* **Erweiterte Telegram-Benachrichtigungen:**
    * Laute Benachrichtigung beim Skriptstart (z.B. nach Stromausfall).
    * Stumme Benachrichtigung beim Wechsel zwischen Tag- und Nachtmodus.
    * Stumme tägliche Statusmeldung, die bestätigt, dass das Skript läuft und den aktuellen Modus anzeigt.
    * Optional stumme Debug-Benachrichtigungen für jeden Schaltvorgang der Pumpe (AN/AUS).
    * Laute Benachrichtigung bei kritischen Skriptfehlern (z.B. Timer-Fehler).
* **mJS-Basiert:** Läuft lokal auf dem Shelly-Gerät mittels der mJS-Skripting-Engine.

### Voraussetzungen

* **Hardware:** Shelly Plus 1PM (sollte auf anderen Shelly Gen2/Gen3 Geräten mit mJS und Schaltausgang funktionieren, aber ungetestet).
* **Software:**
    * Shelly-Firmware, die mJS-Scripting unterstützt (teilweise getestet auf `1.5.1`, erfordert moderne Version für zuverlässigen Betrieb).
    * Gerät verbunden mit einem WLAN-Netzwerk mit Internetzugang (für Telegram & NTP).
    * NTP-Zeitsynchronisation auf dem Shelly-Gerät aktiviert und korrekt konfiguriert.
    * Ein Telegram Bot Token.
    * Die Telegram Chat ID, an die Benachrichtigungen gesendet werden sollen.

### Konfiguration

Öffne die Skript-Datei (`.js`) und passe die Variablen in den Abschnitten `// --- KONFIGURATION ---` und `// --- BENACHRICHTIGUNGS-KONFIGURATION ---` an:

```javascript
// --- KONFIGURATION ---

// Schalt-ID des Relais (bei Shelly Plus 1PM normalerweise 0)
let CONFIG_SWITCH_ID = 0;

// --- Feste Zeiten für Tag/Nacht ---
// Stunde, an der der Tag beginnt (0-23)
let CONFIG_DAY_START_HOUR = 6;  // Beispiel: 06:00 Uhr
// Stunde, an der der Tag endet (die Nacht beginnt) (0-23)
let CONFIG_DAY_END_HOUR = 18;   // Beispiel: 18:00 Uhr (d.h. 18:00 ist schon Nacht)

// Dauer in Minuten für den TAG-Zyklus (zwischen START_HOUR und END_HOUR)
let CONFIG_DAY_ON_MIN = 15;
let CONFIG_DAY_OFF_MIN = 45;

// Dauer in Minuten für den NACHT-Zyklus (vor START_HOUR und ab END_HOUR onwards)
let CONFIG_NIGHT_ON_MIN = 15;
let CONFIG_NIGHT_OFF_MIN = 180;  // 3 Stunden

// --- BENACHRICHTIGUNGS-KONFIGURATION ---
// Benachrichtigungen generell aktivieren? (true oder false)
let CONFIG_ENABLE_NOTIFICATIONS = true;
// Telegram Bot Token (von BotFather erhalten) - !! UNBEDINGT ERSETZEN !!
let CONFIG_TELEGRAM_BOT_TOKEN = "DEIN_BOT_TOKEN_HIER_EINFUEGEN";
// Telegram Chat ID (Empfänger der Nachricht) - !! UNBEDINGT ERSETZEN !!
let CONFIG_TELEGRAM_CHAT_ID = "DEINE_CHAT_ID_HIER_EINFUEGEN";
// NEU: Debug-Modus für Pumpen-Schaltungen aktivieren? (true = AN, false = AUS)
let CONFIG_DEBUG_PUMP_NOTIFICATIONS = false;
// NEU: Stunde für tägliche Statusmeldung (0-23)
let CONFIG_DAILY_STATUS_HOUR = 8; // Beispiel: 08:00 Uhr morgens

// --- ENDE KONFIGURATION ---
```

**Wichtig:** Du **musst** die Platzhalterwerte für `CONFIG_TELEGRAM_BOT_TOKEN` und `CONFIG_TELEGRAM_CHAT_ID` durch deine echten Daten ersetzen.

### Installation

1.  **Shelly Web UI aufrufen:** Finde die IP-Adresse deines Shelly-Geräts und öffne sie in einem Webbrowser im selben Netzwerk.
2.  **Zu Scripts navigieren:** Klicke im Menü links auf "Scripts".
3.  **Neues Skript hinzufügen:** Klicke auf "Add Script".
4.  **Code einfügen:** Gib dem Skript einen Namen (z.B. "Hydroponic Control") und füge den gesamten Inhalt der Skript-Datei in den Code-Editor ein.
5.  **Speichern:** Klicke auf "Save".
6.  **Skript aktivieren:** Finde das gespeicherte Skript in der Liste und klicke auf den Schalter zum Aktivieren (er sollte blau werden).

### Benutzung & Fehlerbehebung

* Das Skript startet automatisch nach der Aktivierung oder nachdem das Shelly-Gerät neu gestartet wird.
* Du solltest eine Telegram-Benachrichtigung erhalten, die den Start des Skripts bestätigt.
* Überwache den Bereich **"Console"** unter "Scripts" in der Shelly Web UI für detaillierte Log-Meldungen und mögliche Fehler. Dies ist das wichtigste Werkzeug zur Fehlersuche.
* Wenn keine Telegram-Benachrichtigungen ankommen, überprüfe:
    * Ist `CONFIG_ENABLE_NOTIFICATIONS` auf `true` gesetzt?
    * Sind Bot Token und Chat ID korrekt und wurden die Platzhalter in der Konfiguration ersetzt?
    * Hat das Shelly-Gerät Internetzugang?
    * Hast du mindestens einmal einen Chat mit deinem Telegram Bot gestartet?
* Das Skript verwendet feste Zeiten; stelle sicher, dass `CONFIG_DAY_START_HOUR` und `CONFIG_DAY_END_HOUR` deinen Bedürfnissen entsprechen.

### Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die LICENSE-Datei für Details (oder füge hier den MIT-Lizenztext ein).

### Haftungsausschluss

Dieses Skript wird ohne Mängelgewähr ("as is") bereitgestellt. Die Nutzung erfolgt auf eigenes Risiko. Der Autor haftet nicht für Schäden an Geräten oder Ernteverluste, die durch die Verwendung dieses Skripts entstehen. Teste das Skript gründlich, bevor du dich bei kritischen Systemen darauf verlässt.
