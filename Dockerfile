FROM node:12.16-alpine 

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]

COPY . .
