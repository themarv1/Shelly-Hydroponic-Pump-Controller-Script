# Changelog

Notable changes to the Hydroponic Pump Controller script. Loosely follows
[Keep a Changelog](https://keepachangelog.com/); the version number tracks the
script's internal `VERSION` constant.

## [8.5] – Unreleased
### Added
- Inline keyboard with a Shelly button on error notifications.

> Base for upcoming work: Uptime Kuma push + pump power-failure detection.

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
