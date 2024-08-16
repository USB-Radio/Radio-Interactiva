FROM node:18-alpine

WORKDIR /app

COPY . . 

RUN npm install

RUN npm run build

RUN npm install -g serve

EXPOSE 3000
EXPOSE 5173

CMD ["serve", "-s", "dist"]
