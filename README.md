# Shelly Hydroponic Pump Controller Script

Automatisierte Pumpensteuerung für Hydroponic-Systeme auf Shelly-Geräten (Gen2/Gen3) mit Telegram-Benachrichtigungen.

> Script: [`src/hytopump.js`](src/hytopump.js) · Version history: [`CHANGELOG.md`](CHANGELOG.md)

---

## English

### How it works

| Period | Hours | Pump behavior |
|---|---|---|
| Day | 06:00 – 22:00 | Runs **continuously** |
| Night | 22:00 – 06:00 | **15 min ON / 45 min OFF** cycles |

At the transition between day and night (and back), the script switches mode automatically and sends a silent Telegram notification.

### Features

- **Day mode – continuous operation:** Pump stays ON the entire day period. No cycling.
- **Night mode – timed cycles:** Alternates between ON and OFF at configurable intervals.
- **Telegram notifications (German, emoji-led):**
  - 🌱 Loud startup alert (e.g. after power restore)
  - ☀️ / 🌙 Silent mode-switch notification
  - 🌱 Silent daily status report at a configurable hour
  - 💧 Optional silent debug message on every pump action
  - ⚠️ Loud alert for critical errors
- **Race-condition-safe:** Pump state (`isCurrentlyOn`) is only updated inside the `Switch.Set` success callback.
- **Accurate daily status timer:** Self-reschedules every 24 h instead of relying on the Shelly `repeat` interval.
- **mJS based:** Runs entirely on-device, no external server needed.

### Monitoring (Uptime Kuma & pump-failure detection)

The script pushes a heartbeat to an [Uptime Kuma](https://github.com/louislam/uptime-kuma) **Push** monitor (default every 60 s):

- If the Shelly loses power or Wi-Fi, the heartbeats stop and Kuma marks the monitor **down**.
- The active power (W) is sent as the Kuma `ping` value, so you get a **graph of the pump load** over time.
- **Pump-failure detection:** all pumps share one switch/meter, so the script infers **how many pumps run** from the total power draw. If the draw drops by roughly one pump's wattage while the pumps should run, the monitor goes **down** and (optionally) a loud Telegram alert is sent. It detects *that* a pump failed, **not which one** — a shared meter can't tell them apart.

Setup:
1. In Uptime Kuma create a **Push** monitor and put its URL into `CONFIG_KUMA_PUSH_URL` (without the query string).
2. Set Kuma's heartbeat/retry timeout **higher** than `CONFIG_KUMA_INTERVAL_SEC` (e.g. push 60 s, Kuma timeout 180 s).
3. Read your pumps' normal draw (Shelly web UI) and tune `CONFIG_PUMP_COUNT` and `CONFIG_PUMP_WATT_EACH`.

### Requirements

- **Hardware:** Shelly Plus 1PM (should work on other Gen2/Gen3 devices with mJS and switch output, untested)
- **Firmware:** mJS scripting support required (tested on `1.5.1`+)
- Wi-Fi with internet access (for Telegram & NTP)
- NTP time sync enabled on the Shelly device
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Your Telegram Chat ID

### Configuration

Edit the variables in the `// --- CONFIGURATION ---` section at the top of the script:

```javascript
// Switch ID of the relay (usually 0 for Shelly Plus 1PM)
let CONFIG_SWITCH_ID = 0;

// Day starts at 06:00, night starts at 22:00
let CONFIG_DAY_START_HOUR = 6;
let CONFIG_DAY_END_HOUR   = 22;

// Night cycle durations (day runs continuously, no cycle needed)
let CONFIG_NIGHT_ON_MIN  = 15;   // Pump ON for 15 minutes
let CONFIG_NIGHT_OFF_MIN = 45;   // Pump OFF for 45 minutes

// Telegram
let CONFIG_ENABLE_NOTIFICATIONS    = true;
let CONFIG_TELEGRAM_BOT_TOKEN      = "DEIN_BOT_TOKEN_HIER_EINFUEGEN";  // !! REPLACE !!
let CONFIG_TELEGRAM_CHAT_ID        = "DEINE_CHAT_ID_HIER_EINFUEGEN";   // !! REPLACE !!
let CONFIG_DEBUG_PUMP_NOTIFICATIONS = false;  // true = notify on every pump action
let CONFIG_DAILY_STATUS_HOUR       = 8;       // Hour for daily status message (0-23)
let CONFIG_SHELLY_URL              = "";      // local Shelly URL for the error-notification button

// Uptime Kuma + pump-failure monitoring (see "Monitoring" below)
let CONFIG_ENABLE_KUMA        = true;
let CONFIG_KUMA_PUSH_URL      = "https://status.example/api/push/XXXX"; // your Kuma push URL
let CONFIG_KUMA_INTERVAL_SEC  = 60;     // push heartbeat every 60 s
let CONFIG_PUMP_COUNT         = 3;      // pumps on this switch
let CONFIG_PUMP_WATT_EACH     = 14.3;   // ~ measured watts per pump (tune to your pumps!)
```

**Important:** Replace `CONFIG_TELEGRAM_BOT_TOKEN` and `CONFIG_TELEGRAM_CHAT_ID` with your actual values before running.

### Installation

1. Open your Shelly device's web UI (enter its IP in a browser).
2. Go to **Scripts** → **Add Script**.
3. Give it a name (e.g. `Hydroponic Control`) and paste the full content of [`src/hytopump.js`](src/hytopump.js).
4. Click **Save**, then enable the script (toggle turns blue).

### Troubleshooting

- Check the **Console** tab in the Scripts section for log output.
- No Telegram messages?
  - Verify `CONFIG_ENABLE_NOTIFICATIONS = true`
  - Double-check Bot Token and Chat ID
  - Confirm the Shelly has internet access
  - Make sure you've started a chat with your bot at least once

### License

MIT License

### Disclaimer

Provided "as is", without warranty. Use at your own risk. The author is not responsible for equipment damage or crop loss. Test thoroughly before relying on this for critical systems.

---

## Deutsch

### Funktionsweise

| Zeitraum | Uhrzeit | Pumpenverhalten |
|---|---|---|
| Tag | 06:00 – 22:00 | Läuft **dauerhaft** |
| Nacht | 22:00 – 06:00 | **15 min AN / 45 min AUS** Zyklen |

Beim Wechsel zwischen Tag und Nacht (und zurück) schaltet das Skript den Modus automatisch um und sendet eine stumme Telegram-Benachrichtigung.

### Funktionen

- **Tagmodus – Dauerbetrieb:** Die Pumpe bleibt den gesamten Tagzeitraum AN. Kein Takt.
- **Nachtmodus – getakteter Betrieb:** Wechselt in konfigurierbaren Intervallen zwischen AN und AUS.
- **Telegram-Benachrichtigungen (Deutsch, mit Emojis):**
  - 🌱 Laute Startnachricht (z.B. nach Stromausfall)
  - ☀️ / 🌙 Stumme Modus-Wechsel-Nachricht
  - 🌱 Stumme tägliche Statusmeldung zur konfigurierbaren Uhrzeit
  - 💧 Optionale stumme Debug-Nachricht bei jedem Pumpenschaltvorgang
  - ⚠️ Lauter Alarm bei kritischen Fehlern
- **Race-Condition-sicher:** Pumpenstatus (`isCurrentlyOn`) wird erst im Erfolgs-Callback von `Switch.Set` aktualisiert.
- **Genauer Tagesstatus-Timer:** Plant sich alle 24 h selbst neu ein, statt auf das fehlerhafte Shelly `repeat`-Intervall zu vertrauen.
- **mJS-basiert:** Läuft vollständig auf dem Gerät, kein externer Server nötig.

### Monitoring (Uptime Kuma & Pumpen-Ausfallerkennung)

Das Skript schickt einen Heartbeat an einen [Uptime Kuma](https://github.com/louislam/uptime-kuma) **Push**-Monitor (Standard: alle 60 s):

- Verliert der Shelly Strom oder WLAN, bleiben die Heartbeats aus und Kuma meldet den Monitor als **down**.
- Die Wirkleistung (W) wird als Kuma-`ping`-Wert gesendet → du bekommst einen **Verlaufsgraphen der Pumpenlast**.
- **Pumpen-Ausfallerkennung:** Alle Pumpen hängen an einem Switch/Messpunkt, daher leitet das Skript aus der **Gesamtleistung** ab, **wie viele Pumpen laufen**. Fällt die Leistung um etwa eine Pumpenleistung, obwohl die Pumpen laufen sollten, geht der Monitor **down** und (optional) kommt ein lauter Telegram-Alarm. Erkannt wird *dass* eine Pumpe ausfällt, **nicht welche** — ein gemeinsamer Messpunkt kann sie nicht unterscheiden.

Einrichtung:
1. In Uptime Kuma einen **Push**-Monitor anlegen und dessen URL in `CONFIG_KUMA_PUSH_URL` eintragen (ohne Query-String).
2. Kumas Heartbeat-/Retry-Timeout **größer** als `CONFIG_KUMA_INTERVAL_SEC` setzen (z. B. Push 60 s, Kuma-Timeout 180 s).
3. Normale Leistungsaufnahme der Pumpen (Shelly-Web-UI) ablesen und `CONFIG_PUMP_COUNT` + `CONFIG_PUMP_WATT_EACH` anpassen.

### Voraussetzungen

- **Hardware:** Shelly Plus 1PM (sollte auf anderen Gen2/Gen3-Geräten mit mJS und Schaltausgang funktionieren, ungetestet)
- **Firmware:** mJS-Scripting-Unterstützung erforderlich (getestet ab `1.5.1`)
- WLAN mit Internetzugang (für Telegram & NTP)
- NTP-Zeitsynchronisation auf dem Shelly aktiviert
- Telegram Bot Token (von [@BotFather](https://t.me/BotFather))
- Deine Telegram Chat ID

### Konfiguration

Passe die Variablen im Abschnitt `// --- CONFIGURATION ---` am Anfang des Skripts an:

```javascript
// Schalt-ID des Relais (bei Shelly Plus 1PM normalerweise 0)
let CONFIG_SWITCH_ID = 0;

// Tag beginnt um 06:00, Nacht beginnt um 22:00
let CONFIG_DAY_START_HOUR = 6;
let CONFIG_DAY_END_HOUR   = 22;

// Nacht-Zyklus-Dauer (Tag läuft dauerhaft, kein Zyklus nötig)
let CONFIG_NIGHT_ON_MIN  = 15;   // Pumpe AN für 15 Minuten
let CONFIG_NIGHT_OFF_MIN = 45;   // Pumpe AUS für 45 Minuten

// Telegram
let CONFIG_ENABLE_NOTIFICATIONS    = true;
let CONFIG_TELEGRAM_BOT_TOKEN      = "DEIN_BOT_TOKEN_HIER_EINFUEGEN";  // !! ERSETZEN !!
let CONFIG_TELEGRAM_CHAT_ID        = "DEINE_CHAT_ID_HIER_EINFUEGEN";   // !! ERSETZEN !!
let CONFIG_DEBUG_PUMP_NOTIFICATIONS = false;  // true = Nachricht bei jedem Schaltvorgang
let CONFIG_DAILY_STATUS_HOUR       = 8;       // Stunde für tägliche Statusmeldung (0-23)
let CONFIG_SHELLY_URL              = "";      // lokale Shelly-URL für den Fehler-Benachrichtigungs-Button

// Uptime Kuma + Pumpen-Ausfall-Überwachung (siehe "Monitoring" unten)
let CONFIG_ENABLE_KUMA        = true;
let CONFIG_KUMA_PUSH_URL      = "https://status.example/api/push/XXXX"; // deine Kuma-Push-URL
let CONFIG_KUMA_INTERVAL_SEC  = 60;     // Heartbeat alle 60 s
let CONFIG_PUMP_COUNT         = 3;      // Pumpen an diesem Switch
let CONFIG_PUMP_WATT_EACH     = 14.3;   // ~ gemessene Watt pro Pumpe (an deine Pumpen anpassen!)
```

**Wichtig:** Ersetze `CONFIG_TELEGRAM_BOT_TOKEN` und `CONFIG_TELEGRAM_CHAT_ID` mit deinen echten Werten, bevor du das Skript startest.

### Installation

1. Shelly Web UI aufrufen (IP-Adresse des Geräts im Browser öffnen).
2. **Scripts** → **Add Script** klicken.
3. Name vergeben (z.B. `Hydroponic Control`) und den kompletten Inhalt von [`src/hytopump.js`](src/hytopump.js) einfügen.
4. **Save** klicken, dann das Skript aktivieren (Schalter wird blau).

### Fehlerbehebung

- Den **Console**-Tab im Scripts-Bereich auf Log-Ausgaben prüfen.
- Keine Telegram-Nachrichten?
  - `CONFIG_ENABLE_NOTIFICATIONS = true` prüfen
  - Bot Token und Chat ID kontrollieren
  - Sicherstellen, dass der Shelly Internetzugang hat
  - Sicherstellen, dass du den Bot mindestens einmal angeschrieben hast

### Lizenz

MIT-Lizenz

### Haftungsausschluss

Dieses Skript wird ohne Mängelgewähr bereitgestellt. Die Nutzung erfolgt auf eigenes Risiko. Der Autor haftet nicht für Geräteschäden oder Ernteverluste. Gründlich testen, bevor du dich bei kritischen Systemen darauf verlässt.
