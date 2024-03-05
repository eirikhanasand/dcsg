FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache python3 make g++ build-base

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Remove the existing node_modules and lock file
RUN rm -rf node_modules package-lock.json

# Install npm packages
RUN npm install

# Copy the rest of the application files
COPY . .

# Specify the default command to run when the container starts
CMD npm start