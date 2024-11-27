FROM node:18.16.1-alpine

WORKDIR /app

COPY package.json .

RUN npm install -g npm@9.8.1
RUN npm install
RUN npm i superagent

COPY . .

RUN npx prisma generate

EXPOSE 3008

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

CMD ["npm", "run", "start"]
