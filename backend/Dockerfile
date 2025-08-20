# Use Node.js 20 Alpine base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Start the development server with hot-reloading
CMD ["npm", "run", "start:dev"]
