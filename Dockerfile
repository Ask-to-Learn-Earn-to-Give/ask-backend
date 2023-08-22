FROM node:18
WORKDIR /opt/ask-backend

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

EXPOSE ${NODE_SERVER_PORT}
CMD ["npm", "run", "start:debug"]
