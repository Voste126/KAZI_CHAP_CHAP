FROM node:lts-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json* npm-shrinkwrap.json* ./
RUN npm install --silent

# Copy the rest of the source code
COPY . .

# Set file ownership and adjust permissions to ensure write access
RUN chown -R node:node /usr/src/app && chmod -R 777 /usr/src/app

EXPOSE 8080

USER node

CMD ["npm", "run", "dev"]
