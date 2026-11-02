# syntax=docker/dockerfile:1.7

# Etapa 1: Compilacion del bundle de Angular
FROM docker.io/library/node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit

COPY . .
RUN npm run build

# Etapa 2: Servidor web Nginx ultraligero y sin privilegios root
FROM docker.io/nginxinc/nginx-unprivileged:alpine AS runtime

COPY --from=build /app/dist/prueba-tecnica-front/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
