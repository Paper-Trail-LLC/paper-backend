# FROM node:12.18.4
# EXPOSE 8081

# WORKDIR /code

# COPY package.json .
# RUN yarn install

# COPY . .
# CMD yarn watch
# 
# Builder stage
# This state builds our TypeScript and produces an intermediate Docker image containing the compiled JavaScript code.
#
FROM node:12.18.4-alpine as builder
WORKDIR /code
COPY . .
RUN yarn install && yarn build-ts

#
# Prod stage 
# This stage pulls the compiled JavaScript code from the builder stage intermediate image.
# This stage builds the final Docker image that we'll use in production.
#
FROM node:12.18.4-alpine as prod

# Define project dir
WORKDIR /usr/src/app
COPY package*.json ./
# Set environment for correct variables
ENV NODE_ENV=heroku
# Install only production dependencies
RUN yarn install --production

# Copy only dist/
COPY --from=builder /code/dist ./

# Chown all the files to the built-in non-root user
RUN chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# EXPOSE 8081
CMD yarn start