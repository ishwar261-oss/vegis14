FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 4014

CMD ["npm", "start"]
