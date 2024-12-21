FROM node:18-alpine as builder

WORKDIR /app/

COPY public/ /app/public
COPY src/ /app/src
COPY package.json ./

ENV NODE_OPTIONS="--openssl-legacy-provider"

RUN npm install --verbose

COPY . ./

EXPOSE 3000

CMD ["npm", "start"]