ARG BUILD_FROM=ghcr.io/home-assistant/base:latest
FROM ${BUILD_FROM}

ENV LANG=C.UTF-8

RUN apk update
RUN apk add --no-cache nodejs npm python3 py3-pip alpine-sdk libcap git bluez bluez-dev eudev-dev
RUN setcap cap_net_raw+eip $(eval readlink -f $(which node))
RUN python3 -m venv /opt/ttlock-proxy \
    && /opt/ttlock-proxy/bin/pip install --no-cache-dir aioesphomeapi==45.0.4

WORKDIR /

COPY start.sh /app/start.sh
COPY addon /app
RUN rm -rf /app/node_modules

# Install both Bluetooth transports without lifecycle hooks, then compile only
# the hardware-validated legacy raw-HCI binding. The maintained D-Bus package
# remains pure JavaScript at runtime and is selectable for further testing.
RUN cd /app \
    && npm i --ignore-scripts \
    && npm rebuild @abandonware/noble @abandonware/bluetooth-hci-socket \
    && git clone --quiet https://github.com/RK392/ttlock-sdk-js.git /tmp/ttlock-sdk-js \
    && git -C /tmp/ttlock-sdk-js checkout --quiet 42043c41f8f4c88234d2b70ab6a067a610679ffb \
    && ln -s /app/node_modules /tmp/ttlock-sdk-js/node_modules \
    && ./node_modules/.bin/tsc --project /tmp/ttlock-sdk-js/tsconfig.json \
    && rm -rf node_modules/ttlock-sdk-js \
    && mkdir -p node_modules/ttlock-sdk-js \
    && cp /tmp/ttlock-sdk-js/package.json node_modules/ttlock-sdk-js/package.json \
    && cp -R /tmp/ttlock-sdk-js/dist node_modules/ttlock-sdk-js/dist \
    && npm run postinstall \
    && npm prune --ignore-scripts --omit=dev \
    && rm -rf /tmp/ttlock-sdk-js /root/.npm

ENTRYPOINT ["/app/start.sh"]

LABEL \
    org.opencontainers.image.title="Home Assistant App: TT LockStar HA (Experimental)" \
    org.opencontainers.image.description="Very experimental local Bluetooth integration of the offline TTLock SDK into Home Assistant" \
    org.opencontainers.image.source="https://github.com/DaStormBringer/TT-LockStar-HA-integration" \
    org.opencontainers.image.licenses="GPL-3.0"
