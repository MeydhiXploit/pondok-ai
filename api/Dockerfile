FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

FROM node:22-alpine

WORKDIR /app

RUN addgroup -g 1001 -S appuser && adduser -S appuser -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

USER appuser

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

CMD ["node", "dist/index.js"]
