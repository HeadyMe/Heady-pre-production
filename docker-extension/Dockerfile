FROM alpine:latest

LABEL org.opencontainers.image.title="HeadyLimb" \
    org.opencontainers.image.description="Sacred Geometry AI Orchestration for Docker Desktop" \
    org.opencontainers.image.vendor="HeadySystems" \
    com.docker.desktop.extension.api.version="0.3.4" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/HeadySystems/Heady/main/public/sacred-geometry-logo.svg"

COPY metadata.json .
COPY docker-compose.yaml .
COPY ui/ ui/
