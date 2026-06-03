# Home Assistant Add-on TTLock

*Original Creator:* Emanuel Posescu (kind3r)

## Requirements
- Bluetooth adapter compatible with @abandonware/noble
- MQTT broker (optional but recommended if you want to report lock status in HA and use it for automations)

## Features
- Ingress Web UI for:
  - Pair new lock
  - Unpair lock
  - Lock / unlock
  - Manage auto-lock time
  - Manage sound on/off
  - Add / edit PIN codes
  - Add / remove IC Cards
  - Add / remove fingerprints
  - View operations log
  - Get updates about lock / unlock status
- HA reporting and controlling via `lock` domain device using MQTT discovery:
  - Signal level
  - Battery level
  - Lock/unlock status
