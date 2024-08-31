FROM node:latest

RUN npm install -g pnpm

WORKDIR /app

COPY . .

RUN rm -rf node_modules

RUN pnpm i

EXPOSE 80

CMD ["pnpm", "run", "start:prod"]