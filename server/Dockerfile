FROM node:alpine

WORKDIR "/app/server"

COPY ./package*.json ./

RUN npm install

COPY ./src ./src

EXPOSE 8055

CMD ["node",  "src"]