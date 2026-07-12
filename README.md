# TTLock Home Assistant Add-on

> [!CAUTION]
> **VERY EXPERIMENTAL.** This software can operate a physical door lock. It has not been validated on production lock hardware, has no automated test suite, and must not be treated as the only means of entering or securing a property. Test only while physically present with a working mechanical key, keypad, or other manual fallback.

This repository merges the newer Home Assistant packaging and interface work from `PiexlPuck/hass-addons` with compatible reliability changes from `RK392/hass-addons` and the RK392 TTLock SDK v0.3.34.

Read [MERGE_NOTES.md](MERGE_NOTES.md) before building, installing, pairing, or operating a lock.

## Current status

- Add-on version: `0.7.0`
- Development branch: `codex/merge-rk392`
- Target: Home Assistant on Linux
- Verified image: Home Assistant Alpine Linux, `amd64`
- Frontend production build: successful
- Backend JavaScript syntax checks: successful
- SDK v0.3.34 compile and method inspection: successful
- Real Bluetooth adapter and lock test: **not yet performed**
- Production readiness: **not ready**

The source repository may be stored or edited on Windows, but the deployable add-on image is Linux-native and was built with Docker Desktop's Linux engine.

## Connection architecture

This add-on communicates directly with a TTLock-compatible lock using a Bluetooth HCI adapter available to the Home Assistant host.

- A direct USB or onboard Bluetooth adapter is required.
- The adapter is selected with `bluetooth_adapter`, normally `hci0` or `hci1`.
- Home Assistant Bluetooth proxies are not a transport for this Noble-based add-on.
- A TTLock G2 gateway is not a transport for this add-on and remains a separate TTLock app/cloud path.
- Simultaneous access from the G2, TTLock app, and this add-on may cause Bluetooth contention or failed operations.

Do not reset, unpair, or initialize an existing production lock until its current ownership/pairing data and recovery path are understood. A reset could disrupt the existing TTLock app or gateway relationship.

## Features

- Local lock and unlock commands
- Multiple-lock discovery and management
- PIN, IC card, and fingerprint management
- Lock sound and auto-lock settings up to 300 seconds
- Cached credentials and operation logs with manual refresh
- Optional automatic operation-log fetching
- Lock clock read and synchronization controls
- Home Assistant MQTT discovery for lock state, battery, signal level, and lock time
- BLE connection serialization and retry handling
- Home Assistant Ingress interface

## Requirements

- Home Assistant OS or a supervised Linux installation capable of running local add-ons
- Direct Bluetooth adapter visible to the Home Assistant host
- D-Bus, host networking, and Bluetooth permissions supplied by the add-on configuration
- MQTT broker for Home Assistant discovery, state reporting, and control
- A manual means of entry during every test

Only the `amd64` image has been built and inspected during this merge. The manifest also declares `aarch64`, but that architecture still needs a native image build and hardware test.

## Conservative first-test procedure

1. Keep the existing TTLock app/G2 path and a manual entry method available.
2. Install the add-on without resetting or pairing the production lock.
3. Confirm the intended local Bluetooth adapter is visible to Home Assistant.
4. Import known-good existing lock data if a safe source is available.
5. Leave automatic operation-log fetching disabled initially.
6. Test status reads while physically at the door.
7. Test one lock and one unlock command with the door open.
8. Verify the TTLock app, G2 gateway, keypad, and mechanical entry method still work.
9. Observe reliability before enabling automations.

Do not connect this experimental add-on to unattended auto-unlock, facial-recognition, presence, or geofence automations.

## Build

The validated local `amd64` build command is:

```sh
docker build \
  --build-arg BUILD_FROM=ghcr.io/home-assistant/amd64-base:latest \
  --tag ttlock-local-merged:0.7.0 \
  ./ttlock-hass-integration
```

Building an image does not validate Bluetooth behavior. Final testing must occur on the Home Assistant Linux host with its real adapter and lock.

## Known risks and limitations

- The project is unofficial and is not affiliated with TTLock or Home Assistant.
- There is no upstream automated test suite.
- Lock pairing material, administrative data, credentials, and operation logs are stored in add-on data and may be included in backups. Protect both.
- Do not expose the add-on API or Ingress service directly to the internet.
- Native Bluetooth behavior depends on adapter hardware, driver support, signal quality, D-Bus, and host networking.
- `npm audit --omit=dev` reports seven high-severity `tar` advisories through Noble's native installation chain. No non-breaking automatic fix is currently offered. Do not use `npm audit fix --force` without a replacement build strategy and complete regression testing.
- Generated frontend assets are committed because the Home Assistant add-on image copies the prebuilt interface.

## Project lineage

- Original add-on and SDK: Emanuel Posescu (`kind3r`)
- Home Assistant packaging and interface base: `PiexlPuck/hass-addons`
- Reliability changes and SDK v0.3.34: `RK392/hass-addons` and `RK392/ttlock-sdk-js`
- Local merge and Docker validation: Chad Shipman

The upstream histories are preserved in the merge commit. See [MERGE_NOTES.md](MERGE_NOTES.md) for the selected changes and validation record.

## License

This project remains licensed under the GNU General Public License v3.0. The original license and author attribution are retained in [LICENSE.md](ttlock-hass-integration/LICENSE.md). Modified versions and redistributed builds must continue to comply with the GPL.
