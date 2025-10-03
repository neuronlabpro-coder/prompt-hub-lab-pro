FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Build frontend
RUN npm run build

# ============================================
# Imagen de producción
# ============================================
FROM node:20-alpine

WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar dependencias desde builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar código de producción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package*.json ./

# Crear directorios necesarios
RUN mkdir -p attached_assets backups logs

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Exponer puerto
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000 || exit 1

# Comando de inicio
CMD ["node", "server/index.js"]
