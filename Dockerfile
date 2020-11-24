FROM node:12.18.4
EXPOSE 8081

WORKDIR /code

COPY package.json .
RUN yarn install

COPY . .
CMD yarn watch
