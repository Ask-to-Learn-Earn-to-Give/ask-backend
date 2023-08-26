FROM node:18
WORKDIR /opt/ask-backend

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY . .

EXPOSE ${NODE_SERVER_PORT}
CMD ["yarn", "start:debug"]
