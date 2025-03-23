FROM node:lts-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json* npm-shrinkwrap.json* ./
RUN npm install --silent

# Copy the rest of the source code
COPY . .

# Adjust file ownership for all files in the working directory
RUN chown -R node:node /usr/src/app

# Expose the appropriate port
EXPOSE 5173

# Switch to non-root user
USER node

# Start the development server
CMD ["npm", "run", "dev"]
