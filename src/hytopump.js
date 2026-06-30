// Shelly Hydroponic Pump Controller Script v8.6 (English Comments/Logs)
// ------------------------------------------------------------------------------------------
// This script controls a pump (connected to Shelly Switch 0) for a hydroponic system.
// Day mode (06:00-22:00): pump runs continuously.
// Night mode (22:00-06:00): timed ON/OFF cycles.
// Day/Night periods are determined by fixed hours configured below.
// Location settings in the Shelly are NOT relevant for this script.
//
// NOTIFICATION: Sends status and error messages via a Telegram Bot.
//                  - LOUD notification on script startup.
//                  - SILENT notification when switching between Day and Night mode.
//                  - SILENT daily status message ("All OK").
//                  - Optional SILENT debug messages for each pump switch action.
//                  - LOUD notification for critical timer errors.
//                  - LOUD notification when a pump failure is detected (power drop).
//
// MONITORING: Periodic heartbeat to Uptime Kuma (so an outage of the Shelly itself
//             is noticed) plus pump-health from the power meter. All pumps share ONE
//             switch/meter, so failures are detected from total power draw (how many
//             pumps run) — not which individual pump.
//
// AUTHOR: themarv1
// VERSION: 8.6
// DATE: 2025-04-24 (Adaptation date)
//
// PLEASE ADJUST CONFIGURATION AND TEST THOROUGHLY! USE AT YOUR OWN RISK.
// ------------------------------------------------------------------------------------------

// --- CONFIGURATION ---

// Switch ID of the relay (usually 0 for Shelly Plus 1PM)
let CONFIG_SWITCH_ID = 0;

// --- Fixed Day/Night Times ---
// Hour when the day starts (0-23)
let CONFIG_DAY_START_HOUR = 6;  // Example: 06:00 AM
// Hour when the day ends (night starts) (0-23)
let CONFIG_DAY_END_HOUR = 22;   // Example: 10:00 PM

// --- Cycle Duration Configuration ---
// Day mode: pump runs continuously (no ON/OFF cycle needed)

// Duration in minutes for the NIGHT cycle (before START_HOUR and from END_HOUR onwards)
let CONFIG_NIGHT_ON_MIN = 15;   // Pump ON for 15 minutes
let CONFIG_NIGHT_OFF_MIN = 45;  // Pump OFF for 45 minutes

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
// Local URL to Shelly web UI – shown as button in error notifications (leave empty to disable)
let CONFIG_SHELLY_URL = "";  // e.g. "http://192.168.178.42"

// --- UPTIME KUMA MONITORING ---
// Push a heartbeat to Uptime Kuma. If the Shelly loses power/Wi-Fi, the pushes stop
// and Kuma reports the monitor as down (set Kuma's heartbeat retry/timeout > the push
// interval below, e.g. push 60 s / Kuma timeout 180 s).
let CONFIG_ENABLE_KUMA = true;
// Kuma push URL WITHOUT query string (the script appends ?status=...&msg=...&ping=...)
let CONFIG_KUMA_PUSH_URL = "https://DEINE-KUMA-URL/api/push/XXXX";  // !! REPLACE THIS !!
// How often to push, in seconds
let CONFIG_KUMA_INTERVAL_SEC = 60;
// Also send a LOUD Telegram alert when a pump fault is detected/cleared?
let CONFIG_KUMA_ALERT_TELEGRAM = true;

// --- PUMP FAILURE DETECTION (shared power meter) ---
// All pumps hang on ONE switch, so the meter sees their COMBINED draw. We infer how
// many pumps run from total power; a drop of ~one pump's wattage flags a failure
// (we cannot tell WHICH pump — that would need per-pump metering).
let CONFIG_PUMP_COUNT = 3;          // number of pumps on this switch
let CONFIG_PUMP_WATT_EACH = 14.3;   // ~ measured 42.8 W / 3 pumps — TUNE after watching real data
let CONFIG_PUMP_OFF_MAX_W = 5;      // power above this while relay is OFF = anomaly (stuck relay / leakage)
let CONFIG_PUMP_GRACE_SEC = 12;     // ignore power right after a switch (motor inrush / settling)
let CONFIG_PUMP_FAULT_STREAK = 3;   // consecutive ON-phase readings before a fault is declared/cleared (debounce)
// Mains voltage sanity window (230 V nominal, ±10 %)
let CONFIG_VOLTAGE_MIN = 207;
let CONFIG_VOLTAGE_MAX = 253;

// --- END CONFIGURATION ---

// Global Variables (do not change)
let timerHandle = null; // Timer for the main ON/OFF cycle
let isCurrentlyOn = false; // Current state of the pump according to the script
let notificationSent = false; // Primarily prevents spamming repeated timer errors
let wasPreviouslyDayTime = null; // State of the previous period for switch detection
let dailyStatusTimerHandle = null; // Timer for daily status
let kumaTimerHandle = null;        // Timer for the periodic Uptime Kuma push
let lastSwitchMs = 0;              // Timestamp of the last pump (re)switch — for the inrush grace window
let pumpFaultActive = false;       // Carried/debounced pump-count fault state (survives OFF phases)
let faultStreak = 0;               // Consecutive ON-phase readings indicating too few pumps
let okStreak = 0;                  // Consecutive ON-phase readings indicating all pumps OK
let alertedDown = false;           // True while a down-episode has been alerted (Telegram de-spam)

// Function to escape HTML characters for Telegram messages (manual version)
function escapeHtml(text) {
  if (typeof text !== 'string') { return text; }
  let result = "";
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (char === '&') { result += '&amp;'; }
    else if (char === '<') { result += '&lt;'; }
    else if (char === '>') { result += '&gt;'; }
    else { result += char; }
  }
  return result;
}

// Function to send a notification via Telegram Bot API (with silent option)
// includeShellyButton: if true and CONFIG_SHELLY_URL is set, adds an inline button to open the Shelly UI
function sendNotification(message, isSilent, includeShellyButton) {
  // Default is LOUD (isSilent = false)
  isSilent = (typeof isSilent === 'boolean' && isSilent);
  includeShellyButton = (typeof includeShellyButton === 'boolean' && includeShellyButton);

  if (!CONFIG_ENABLE_NOTIFICATIONS || CONFIG_TELEGRAM_BOT_TOKEN === "DEIN_BOT_TOKEN_HIER_EINFUEGEN" || CONFIG_TELEGRAM_CHAT_ID === "DEINE_CHAT_ID_HIER_EINFUEGEN") {
    print("Notifications disabled or Bot Token/Chat ID not configured.");
    return;
  }
  // Prevent spam only for repeated LOUD error messages
  if (notificationSent && !isSilent && message.indexOf("FEHLER") !== -1) {
      print("Notification already sent for current error state. Skipping duplicate LOUD error message.");
      return;
  }

  print((isSilent ? "(Silent) " : "(LOUD) ") + "Sending Telegram notification: " + message);

  let telegramUrl = "https://api.telegram.org/bot" + CONFIG_TELEGRAM_BOT_TOKEN + "/sendMessage";
  let messageText = escapeHtml(message);
  let payload = { chat_id: CONFIG_TELEGRAM_CHAT_ID, text: messageText, parse_mode: "HTML" };

  // Add disable_notification if message should be silent
  if (isSilent) {
    payload.disable_notification = true;
  }

  // Add inline keyboard button linking to Shelly web UI (only for error notifications)
  if (includeShellyButton && CONFIG_SHELLY_URL !== "") {
    payload.reply_markup = {
      inline_keyboard: [[
        { text: "🔧 Shelly öffnen", url: CONFIG_SHELLY_URL }
      ]]
    };
  }

  // Reset flag BEFORE sending a LOUD message to ensure it always tries (unless repeated error)
  if (!isSilent) {
    notificationSent = false;
  }

  Shelly.call("HTTP.POST", { url: telegramUrl, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), timeout: 15, ssl_ca: "*" },
    function(res, error_code, error_msg) {
      let success = false;
      if (error_code === 0 && res && res.code === 200) {
        let responseBody = null;
        try { responseBody = JSON.parse(res.body); if (responseBody.ok === true) { success = true; } }
        catch (e) { print("Could not parse Telegram response as JSON."); }
      }

      if (success) {
        print("Telegram notification sent successfully.");
      } else {
        print("Error sending Telegram notification: Code=" + error_code + ", Msg=" + error_msg + ", HTTP-Code=" + (res ? res.code : "N/A") + ", Body: " + (res ? res.body : "N/A"));
        // Set flag only on FAILURE of sending a LOUD message to prevent spam
        if (!isSilent) {
             notificationSent = true;
             print("Set notificationSent flag due to LOUD message failure.");
        }
      }
    }
  );
}

// Returns milliseconds until the next occurrence of the given hour (0-23)
function calcMsToHour(hour) {
  let now = new Date();
  let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0, 0);
  let ms = target.getTime() - now.getTime();
  if (ms <= 0) ms += 24 * 60 * 60 * 1000;
  return ms;
}

// Main function for the pump cycle
function runPumpCycle() {
  // Mark a (potential) switch moment so the power monitor skips inrush/settling.
  lastSwitchMs = (new Date()).getTime();
  // Clear existing timer
  if (timerHandle !== null) {
    Timer.clear(timerHandle);
    timerHandle = null;
  }

  let timeNow = new Date();
  let currentHour = timeNow.getHours();
  // Determine Day/Night based on fixed hours
  let isDayTime = (currentHour >= CONFIG_DAY_START_HOUR && currentHour < CONFIG_DAY_END_HOUR);

  // Check for Day/Night switch and send silent notification
  // Only executes if wasPreviouslyDayTime has been set (not on the very first run)
  if (wasPreviouslyDayTime !== null && isDayTime !== wasPreviouslyDayTime) {
    let switchMessage = isDayTime ? "☀️ Wechsel auf Tag-Modus" : "🌙 Wechsel auf Nacht-Modus";
    sendNotification(switchMessage, true); // true = Send silently
  }
  // Remember current state for the next check
  wasPreviouslyDayTime = isDayTime;

  if (isDayTime) {
    // Day mode: pump runs continuously, timer wakes up at night start
    print("Hydroponic Cycle: Mode: Day (Continuous). Pump ON until " + CONFIG_DAY_END_HOUR + ":00.");
    if (!isCurrentlyOn) {
      Shelly.call("Switch.Set", {'id': CONFIG_SWITCH_ID, 'on': true}, function(res, err_code, err_msg){
        if (err_code === 0) {
          isCurrentlyOn = true;
          print("Hydroponic Cycle: Pump switched ON (continuous day mode).");
          if (CONFIG_DEBUG_PUMP_NOTIFICATIONS) { sendNotification("💧 Pumpe EIN (Tagdauerbetrieb)", true); }
        } else {
          print("ERROR switching pump ON: Code "+err_code+", Msg: "+err_msg);
          sendNotification("⚠️ FEHLER: Pumpe AN schalten fehlgeschlagen\nCode: " + err_code + " – Shelly prüfen!", false, true);
        }
      });
    } else {
      print("Hydroponic Cycle: Pump already ON.");
    }
    let msToNight = calcMsToHour(CONFIG_DAY_END_HOUR);
    print("Hydroponic Cycle: Night mode starts in approx. " + Math.round(msToNight/60000) + " min.");
    timerHandle = Timer.set(msToNight, false, runPumpCycle);
  } else {
    // Night mode: timed ON/OFF cycles
    print("Hydroponic Cycle: Mode: Night (Cycles). " + CONFIG_NIGHT_ON_MIN + "min ON / " + CONFIG_NIGHT_OFF_MIN + "min OFF.");
    let nextTimerDelaySec = 0;
    let nextActionIsOn = !isCurrentlyOn;

    if (nextActionIsOn) {
      print("Switching pump ON.");
      Shelly.call("Switch.Set", {'id': CONFIG_SWITCH_ID, 'on': true}, function(res, err_code, err_msg){
        if (err_code === 0) {
          isCurrentlyOn = true;
          print("Hydroponic Cycle: Pump switched ON.");
          if (CONFIG_DEBUG_PUMP_NOTIFICATIONS) { sendNotification("💧 Pumpe EIN (Zyklus)", true); }
        } else {
          print("ERROR switching pump ON: Code "+err_code+", Msg: "+err_msg);
          sendNotification("⚠️ FEHLER: Pumpe AN schalten fehlgeschlagen\nCode: " + err_code + " – Shelly prüfen!", false, true);
        }
      });
      nextTimerDelaySec = CONFIG_NIGHT_ON_MIN * 60;
      print("Hydroponic Cycle: Next action (OFF) in " + CONFIG_NIGHT_ON_MIN + " minutes.");
    } else {
      print("Switching pump OFF.");
      Shelly.call("Switch.Set", {'id': CONFIG_SWITCH_ID, 'on': false}, function(res, err_code, err_msg){
        if (err_code === 0) {
          isCurrentlyOn = false;
          print("Hydroponic Cycle: Pump switched OFF.");
          if (CONFIG_DEBUG_PUMP_NOTIFICATIONS) { sendNotification("💧 Pumpe AUS (Zyklus)", true); }
        } else {
          print("ERROR switching pump OFF: Code "+err_code+", Msg: "+err_msg);
          sendNotification("⚠️ FEHLER: Pumpe AUS schalten fehlgeschlagen\nCode: " + err_code + " – Shelly prüfen!", false, true);
        }
      });
      nextTimerDelaySec = CONFIG_NIGHT_OFF_MIN * 60;
      print("Hydroponic Cycle: Next action (ON) in " + CONFIG_NIGHT_OFF_MIN + " minutes.");
    }

    if (nextTimerDelaySec > 0) {
      timerHandle = Timer.set(nextTimerDelaySec * 1000, false, runPumpCycle);
    } else {
      print("Hydroponic Cycle: Error - Timer delay is zero or negative. Stopping cycle.");
      notificationSent = false;
      sendNotification("⚠️ FEHLER: Timer-Delay ungültig (" + nextTimerDelaySec + "s)\nZyklus gestoppt – Shelly neu starten!", false, true);
    }
  }
}

// Function to send the daily status report
function sendDailyStatus() {
  let timeNow = new Date();
  let currentHour = timeNow.getHours();
  let isDayTime = (currentHour >= CONFIG_DAY_START_HOUR && currentHour < CONFIG_DAY_END_HOUR);
  let currentMode = isDayTime ? "Tag (Dauerbetrieb)" : "Nacht (Zyklen)";
  // Get current pump status directly from device (asynchronous!)
  Shelly.call("Switch.GetStatus", {'id': CONFIG_SWITCH_ID}, function(result){
      let pumpState = "Unbekannt";
      if(result && typeof result.output !== 'undefined'){
          pumpState = result.output ? "AN 💧" : "AUS";
      } else if (result && typeof result.ison !== 'undefined'){
          pumpState = result.ison ? "AN 💧" : "AUS";
      }
      let message = "🌱 Hydroponic Tower – Tagesstatus\n" +
                    "Modus: " + currentMode + "\n" +
                    "Pumpe: " + pumpState + "\n" +
                    "Alles läuft normal ✓";

      print("Sending daily status report...");
      sendNotification(message, true); // true = Send silently
  });
  // Reschedule for exactly 24 hours from now (repeat=true on Shelly repeats at initial interval, not 24h)
  dailyStatusTimerHandle = Timer.set(24 * 60 * 60 * 1000, false, sendDailyStatus);
}

// Minimal URL encoder for the Kuma msg (Shelly mJS has no encodeURIComponent).
function urlMsg(text) {
  if (typeof text !== 'string') { text = "" + text; }
  let out = "";
  for (let i = 0; i < text.length; i++) {
    let c = text[i];
    if (c === ' ') { out += "%20"; }
    else if (c === '|') { out += "%7C"; }
    else if (c === '&') { out += "%26"; }
    else if (c === '#') { out += "%23"; }
    else if (c === '+') { out += "%2B"; }
    else { out += c; }
  }
  return out;
}

// Send a heartbeat to Uptime Kuma. ping carries the active power (W) so Kuma
// graphs the pump load over time (a step down = a pump dropped out).
function pushKuma(status, msg, ping) {
  if (!CONFIG_ENABLE_KUMA || CONFIG_KUMA_PUSH_URL === "" || CONFIG_KUMA_PUSH_URL.indexOf("DEINE-KUMA-URL") !== -1) {
    print("Kuma push disabled or URL not configured.");
    return;
  }
  let url = CONFIG_KUMA_PUSH_URL + "?status=" + status + "&msg=" + urlMsg(msg) + "&ping=" + ping;
  Shelly.call("HTTP.GET", { url: url, timeout: 10, ssl_ca: "*" }, function(res, ec, em) {
    if (ec !== 0) { print("Kuma push failed: code=" + ec + " msg=" + em); }
    else { print("Kuma push ok (" + status + "): " + msg); }
  });
}

// Read the switch power meter, derive pump health and push it to Uptime Kuma.
// Optionally raises a LOUD Telegram alert on fault onset / recovery.
function checkPumpsAndPush() {
  Shelly.call("Switch.GetStatus", {'id': CONFIG_SWITCH_ID}, function(st, ec, em) {
    if (ec !== 0 || !st) {
      print("Pump monitor: Switch.GetStatus failed: " + ec + " " + em);
      pushKuma("down", "shelly_getstatus_error", "");
      return;
    }

    let relayOn = (typeof st.output !== 'undefined') ? st.output : (st.ison === true);
    let watt = (typeof st.apower  === 'number') ? st.apower  : -1;
    let volt = (typeof st.voltage === 'number') ? st.voltage : -1;
    let amp  = (typeof st.current === 'number') ? st.current : -1;
    let wattR = (watt >= 0) ? Math.round(watt * 10) / 10 : -1;
    let voltR = (volt >= 0) ? Math.round(volt * 10) / 10 : -1;
    let ampR  = (amp  >= 0) ? Math.round(amp * 1000) / 1000 : -1;

    let inGrace = ((new Date()).getTime() - lastSwitchMs) < (CONFIG_PUMP_GRACE_SEC * 1000);
    let phase = "off_cycle";
    let runningNow = CONFIG_PUMP_COUNT;

    // --- Pump-count fault ---------------------------------------------------
    // Only evaluable WHILE the pumps run. Debounced (needs several consecutive
    // bad/good readings) so normal power fluctuation (debris, voltage, water
    // level) doesn't false-trigger. The verdict is CARRIED across OFF phases,
    // so the night cycle (15/45) doesn't reset it. OFF phases are neutral here.
    if (relayOn && inGrace) {
      phase = "starting";
    } else if (relayOn) {
      runningNow = (watt >= 0) ? Math.round(watt / CONFIG_PUMP_WATT_EACH) : CONFIG_PUMP_COUNT;
      if (runningNow > CONFIG_PUMP_COUNT) { runningNow = CONFIG_PUMP_COUNT; }
      if (runningNow < 0) { runningNow = 0; }

      if (runningNow < CONFIG_PUMP_COUNT) { faultStreak += 1; okStreak = 0; }
      else { okStreak += 1; faultStreak = 0; }

      if (!pumpFaultActive && faultStreak >= CONFIG_PUMP_FAULT_STREAK) { pumpFaultActive = true; }
      else if (pumpFaultActive && okStreak >= CONFIG_PUMP_FAULT_STREAK) { pumpFaultActive = false; }

      phase = pumpFaultActive ? "running_FAULT" : "running_ok";
    } else {
      phase = "off_cycle"; // pumps off by schedule -> neutral; carried fault state stays as-is
    }

    // --- Immediate secondary checks (rare & meaningful, not debounced) ------
    let voltBad = (volt >= 0 && (volt < CONFIG_VOLTAGE_MIN || volt > CONFIG_VOLTAGE_MAX));
    let offAnomaly = (!relayOn && !inGrace && watt >= 0 && watt > CONFIG_PUMP_OFF_MAX_W);

    // --- Overall verdict ----------------------------------------------------
    let down = pumpFaultActive || voltBad || offAnomaly;
    let status = down ? "down" : "up";

    let human = "";
    if (pumpFaultActive) { human = "Pumpen-Ausfall: nur ~" + runningNow + " von " + CONFIG_PUMP_COUNT + " laufen (" + wattR + " W)."; }
    if (offAnomaly)      { human = (human === "" ? "" : human + " ") + "Leistung trotz AUS: " + wattR + " W (Relais klemmt?)."; }
    if (voltBad)         { human = (human === "" ? "" : human + " ") + "Netzspannung auffaellig: " + voltR + " V."; }

    // --- URL-safe Kuma message ----------------------------------------------
    let detail = phase;
    if (phase === "running_ok" || phase === "running_FAULT") { detail = detail + "_" + runningNow + "of" + CONFIG_PUMP_COUNT; }
    if (offAnomaly) { detail = detail + "_OFFPWR"; }
    if (voltBad)    { detail = detail + "_VOLT"; }
    let msg = detail + "__" + wattR + "W_" + voltR + "V_" + ampR + "A";

    let pingVal = (watt >= 0) ? wattR : "";
    pushKuma(status, msg, pingVal);

    // --- Telegram only at the EDGES of a down-episode (any reason) -----------
    // -> no spam, and no flapping across the night ON/OFF cycle.
    if (down && !alertedDown) {
      alertedDown = true;
      if (CONFIG_KUMA_ALERT_TELEGRAM) {
        sendNotification("⚠️ Hydroponic-Problem\n" + (human === "" ? msg : human), false, true);
      }
    } else if (!down && alertedDown) {
      alertedDown = false;
      if (CONFIG_KUMA_ALERT_TELEGRAM) {
        sendNotification("✅ Hydroponic wieder normal (" + wattR + " W)", true);
      }
    }
  });
}

// Function to initialize timers and start the first cycle
function initializeCycle() {
    print("Hydroponic Cycle Script (Cycles, Adv. Notify): Initializing...");
    notificationSent = false; // Reset notification flag on script start

    // Set initial Day/Night state for switch detection
    let initTime = new Date();
    let initHour = initTime.getHours();
    wasPreviouslyDayTime = (initHour >= CONFIG_DAY_START_HOUR && initHour < CONFIG_DAY_END_HOUR);
    print("Initial mode determined: " + (wasPreviouslyDayTime ? "Day" : "Night"));

    // Schedule the daily status timer
    if (dailyStatusTimerHandle !== null) Timer.clear(dailyStatusTimerHandle);
    let now = new Date();
    let targetTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), CONFIG_DAILY_STATUS_HOUR, 0, 0, 0); // Target time today
    let msToTarget = targetTimeToday.getTime() - now.getTime();
    // If target time today has already passed, schedule for tomorrow
    if (msToTarget < 0) {
        msToTarget += 24 * 60 * 60 * 1000; // Add 24 hours in milliseconds
    }
    // First run after msToTarget; sendDailyStatus reschedules itself every 24h
    dailyStatusTimerHandle = Timer.set(msToTarget, false, sendDailyStatus);
    print("Daily status report scheduled for " + CONFIG_DAILY_STATUS_HOUR + ":00 (next run in approx. " + Math.round(msToTarget/60000) + " min).");

    // Schedule the periodic Uptime Kuma push (pump-health heartbeat)
    if (CONFIG_ENABLE_KUMA && CONFIG_KUMA_PUSH_URL !== "") {
        if (kumaTimerHandle !== null) Timer.clear(kumaTimerHandle);
        kumaTimerHandle = Timer.set(CONFIG_KUMA_INTERVAL_SEC * 1000, true, checkPumpsAndPush);
        Timer.set(5000, false, checkPumpsAndPush); // first push shortly after startup
        print("Uptime Kuma push scheduled every " + CONFIG_KUMA_INTERVAL_SEC + "s.");
    }


    // Short delay, then start first cycle AND send LOUD startup notification
    print("Hydroponic Cycle: Waiting briefly (3 sec)...");
    Timer.set(3000, false, function() {
        print("Hydroponic Cycle Script: Starting first cycle run.");
        // Ensure pump starts in OFF state
        Shelly.call("Switch.Set", {'id': CONFIG_SWITCH_ID, 'on': false}, function() {
            isCurrentlyOn = false;
            // Start the first cycle run
            runPumpCycle();

            // Send LOUD startup notification
            if (CONFIG_ENABLE_NOTIFICATIONS && CONFIG_TELEGRAM_BOT_TOKEN !== "DEIN_BOT_TOKEN_HIER_EINFUEGEN" && CONFIG_TELEGRAM_CHAT_ID !== "DEINE_CHAT_ID_HIER_EINFUEGEN") {
                notificationSent = false; // Reset for LOUD startup message
                let startMode = wasPreviouslyDayTime ? "Tag (Dauerbetrieb)" : "Nacht (Zyklen)";
                let startPump = wasPreviouslyDayTime ? "AN 💧" : "Zyklus aktiv 💧";
                sendNotification("🌱 Hydroponic Controller gestartet\nModus: " + startMode + "\nPumpe: " + startPump, false); // false = LOUD
            }
        });
    });
}

// --- Script Start ---
// Calls the initialization function to start everything.
initializeCycle();
