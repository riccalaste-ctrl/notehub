FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY public ./public
COPY server.js ./
COPY storage ./storage

ENV NODE_ENV=production
ENV PORT=3000
ENV STORAGE_DIR=/data

RUN mkdir -p /data/uploads

EXPOSE 3000

CMD ["node", "server.js"]
