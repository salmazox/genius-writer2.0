FROM node:20-alpine

# Install OpenSSL and other dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy everything first (simpler approach)
COPY . .

# Set dummy DATABASE_URL for build
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"

# Install all dependencies
RUN npm install

# Generate Prisma Client after install
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the application with migrations
# This runs: npx prisma migrate deploy && node server.js
CMD ["npm", "run", "deploy"]
