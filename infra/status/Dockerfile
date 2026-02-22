FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production
RUN npm install prom-client

COPY index.js ./

EXPOSE 3000

CMD ["node", "index.js"]
