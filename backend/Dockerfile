FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema before installing dependencies
# This allows Prisma to generate the client during npm install
COPY prisma ./prisma/

# Install dependencies (using npm install instead of npm ci for flexibility)
RUN npm install --production

# Generate Prisma Client explicitly (in case postinstall didn't run)
RUN npx prisma generate

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
