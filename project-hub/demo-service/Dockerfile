FROM alpine:3.22 AS unimonitor-source
ARG UNIMONITOR_COMMIT=1c3f0121ca33cf851512e997cb227b7b1b9218f2
RUN apk add --no-cache curl tar \
    && mkdir -p /opt/unimonitor \
    && curl -fsSL "https://github.com/godnix7/Unimonitor/archive/${UNIMONITOR_COMMIT}.tar.gz" \
      | tar -xz --strip-components=1 -C /opt/unimonitor

FROM python:3.12-slim-bookworm
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      bash ca-certificates coreutils dnsutils gawk grep iproute2 iputils-ping procps sed util-linux \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 10001 --no-create-home --home-dir /tmp --shell /usr/sbin/nologin demo

WORKDIR /app
COPY --chown=10001:10001 server.py /app/server.py
COPY --chown=10001:10001 static /app/static
COPY --from=unimonitor-source --chown=10001:10001 /opt/unimonitor /opt/unimonitor

USER 10001:10001
EXPOSE 10000
CMD ["python", "server.py"]
