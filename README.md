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
let CONFIG_DEBUG_PUMP
