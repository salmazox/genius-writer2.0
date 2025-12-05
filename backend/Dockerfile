FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema before installing dependencies
# This allows Prisma to generate the client during npm install
COPY prisma ./prisma/

# Set dummy DATABASE_URL for build (Prisma needs this to generate client)
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"

# Install dependencies (install all deps including devDeps for Prisma to work)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
