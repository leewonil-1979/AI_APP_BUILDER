# Dockerfile - Absolutely Minimal Secure Build
# Use the latest secure Node alpine with specific version
FROM node:lts-alpine AS builder

# Only essential packages
RUN apk add --no-cache ca-certificates && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --production --ignore-scripts && \
    npm cache clean --force

# Build static files
COPY . .
RUN npm run build

# Runtime - Pure static file serving with minimal runtime
FROM caddy:2-alpine

# Copy static files only
COPY --from=builder /app/dist /srv

# Caddy configuration for security
RUN echo $'{\n\
  auto_https off\n\
  admin off\n\
  servers {\n\
    protocols h1 h2c\n\
  }\n\
}\n\
\n\
:8080 {\n\
  root * /srv\n\
  file_server\n\
  try_files {path} /index.html\n\
  \n\
  header {\n\
    X-Content-Type-Options nosniff\n\
    X-Frame-Options DENY\n\
    X-XSS-Protection "1; mode=block"\n\
    Referrer-Policy "strict-origin-when-cross-origin"\n\
  }\n\
}' > /etc/caddy/Caddyfile

EXPOSE 8080

# Run as non-root
USER caddy

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
