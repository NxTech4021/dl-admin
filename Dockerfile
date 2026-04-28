# Development stage - Vite with fast HMR
FROM node:24-alpine AS development

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (with extended timeout for slow networks)
RUN yarn config set network-timeout 600000 -g && yarn install

# Copy source code
COPY . .

EXPOSE 3032

# Vite dev server with host binding for Docker
CMD ["yarn", "dev"]

# Build stage
FROM node:24-alpine AS build

WORKDIR /app

# Build-time args for URLs (baked into bundle)
ARG VITE_API_BASE_URL=https://api.deuceleague.com
ARG VITE_AUTH_URL=https://api.deuceleague.com
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (with extended timeout for slow networks)
RUN yarn config set network-timeout 600000 -g && yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage - serve static files
FROM node:24-alpine AS production

WORKDIR /app

# Copy built assets from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

# Install only production dependencies (for serve)
RUN yarn add serve --production

EXPOSE 3032

# Serve the built static files
CMD ["npx", "serve", "-s", "dist", "-l", "3032"]