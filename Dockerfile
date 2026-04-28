# ⚠️ NOTA: Questo Dockerfile è opzionale
# Per Vercel, il deploy è automatico tramite vercel.json
# Questo file è utile solo per deploy su Docker (VPS/Cloud alternativi)
# 
# Build: docker build -t notehub .
# Run: docker run -p 3000:3000 -e JWT_SECRET=your-secret notehub

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./

RUN npm ci --only=production

COPY src ./src
COPY public ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]
