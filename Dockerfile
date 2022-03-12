FROM node:17.7.1-alpine3.15

WORKDIR /app

RUN chown -R node:node /app

COPY --chown=node:node . .

RUN npm install

USER node

ENTRYPOINT [ "npm", "run", "job" ]
