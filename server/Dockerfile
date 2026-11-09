FROM node:22-alpine
WORKDIR /app

# Prisma's Alpine engine requires OpenSSL. Railway builds from repository-root context.
RUN apk add --no-cache openssl
COPY server/package*.json ./
RUN npm install

COPY server/prisma ./prisma
# Generate the Prisma client at build time without requiring Railway secrets in the build environment.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public" npx prisma generate
COPY server/src ./src
RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 4000

# No committed migration history exists yet; bootstrap the first schema on startup.
CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
