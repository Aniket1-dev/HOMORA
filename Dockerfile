FROM node:22-alpine
WORKDIR /app

# Prisma's Alpine engine requires OpenSSL.
RUN apk add --no-cache openssl

# Build context is the repository root; the API package is under /server.
COPY server/package*.json ./
RUN npm install

COPY server/prisma ./prisma
# Prisma client generation does not need a live database during image build.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public" npx prisma generate

COPY server/src ./src
RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 4000

# Bootstrap the initial database schema, then start the API.
# Switch to committed migrations before production data is considered critical.
CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
