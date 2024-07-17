FROM node:16

RUN mkdir -p /SimpleDBJS-Middleware/src

WORKDIR /SimpleDBJS-Middleware

COPY src/index.js ./src

COPY package.json package-lock.json ./

RUN npm install

EXPOSE 9000

ENV SIMPLEDB_PORT=
ENV SIMPLEDB_HOST=
ENV WEBSOCKET_PORT=

CMD ["node", "src/index.js"]