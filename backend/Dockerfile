FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install instead of npm ci for flexibility)
RUN npm install --production

# Copy application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
