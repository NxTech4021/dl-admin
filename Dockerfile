# Development stage
FROM node:18-alpine as development

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 3030

CMD [ "npm", "run", "dev" ]

# Build stage
FROM node:21-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install ALL dependencies, including dev dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:21-bookworm-slim as production

WORKDIR /app

# Copy built assets from build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json

# Install only production dependencies
RUN npm ci --only=production

# Expose the port your app runs on
EXPOSE 3030

# Start the app
CMD ["npm", "start"]
