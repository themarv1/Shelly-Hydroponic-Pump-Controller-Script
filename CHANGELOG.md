# Changelog

Notable changes to the Hydroponic Pump Controller script. Loosely follows
[Keep a Changelog](https://keepachangelog.com/); the version number tracks the
script's internal `VERSION` constant.

## [8.6] – Unreleased
### Added
- **Uptime Kuma monitoring:** periodic heartbeat push (default every 60 s). Carries
  active power as the `ping` value so Kuma graphs the pump load over time. If the
  Shelly loses power/Wi-Fi, the missing heartbeats make Kuma report it down.
- **Pump failure detection via the power meter:** all pumps share one switch, so the
  script infers how many pumps run from total power draw. A drop of ~one pump's
  wattage marks the monitor down and (optionally) sends a loud Telegram alert.
  It detects *that* a pump failed, not *which* one (shared meter).
- Mains-voltage sanity check and a "current while OFF" anomaly check.
- New config: `CONFIG_ENABLE_KUMA`, `CONFIG_KUMA_PUSH_URL`, `CONFIG_KUMA_INTERVAL_SEC`,
  `CONFIG_KUMA_ALERT_TELEGRAM`, `CONFIG_PUMP_COUNT`, `CONFIG_PUMP_WATT_EACH`,
  `CONFIG_PUMP_OFF_MAX_W`, `CONFIG_PUMP_GRACE_SEC`, `CONFIG_VOLTAGE_MIN/MAX`.

## [8.5] – Unreleased
### Added
- Inline keyboard with a Shelly button on error notifications.

## [8.4] – 2025-04-24
### Changed
- German Telegram notifications with emojis: loud startup alert, silent
  mode-switch, silent daily status report, loud critical-error alert.

## [8.3]
### Changed
- Day mode runs the pump continuously; night mode uses timed 15 min ON /
  45 min OFF cycles.

## [8.2]
### Fixed
- Race condition in `Switch.Set` callbacks — pump state is only updated inside
  the success callback.
- Daily status timer self-reschedules every 24 h instead of relying on the
  Shelly `repeat` interval.
