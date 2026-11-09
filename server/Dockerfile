FROM node:22-alpine
WORKDIR /app

# Railway builds from the repository root; API sources live under /server.
COPY server/package*.json ./
RUN npm install

COPY server/prisma ./prisma
RUN npx prisma generate
COPY server/src ./src
RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 4000

# There is no committed migration history yet. Bootstrap the initial schema.
CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
