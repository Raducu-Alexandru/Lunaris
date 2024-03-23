### STAGE 1: Build ###
FROM node:18-alpine AS build

# Set the working dir
WORKDIR /usr/src/app

# Add the contents of the current folder
ADD . .

# Update the npm config
RUN npm config set ca ""
RUN npm config set strict-ssl false

# Install packages
RUN npm i --omit=dev

# Run tests
RUN rm -rf ./build
RUN npm run build-tsc

# Remove junk
RUN rm -rf ./src
RUN rm ./.dockerignore
RUN rm ./Dockerfile
RUN rm ./tsconfig.json

# Run the app
CMD ["npm", "run", "prod:run"]
