FROM node:12.18.4
EXPOSE 3000

WORKDIR /code

COPY package.json .
RUN yarn install

COPY . .
CMD yarn watch
