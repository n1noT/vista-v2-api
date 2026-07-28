FROM node:22-alpine

WORKDIR /app

ARG DIRECT_URL
ENV DIRECT_URL=$DIRECT_URL

COPY . .

RUN npm ci

RUN npx prisma generate

RUN npm run build

RUN npm prune --omit=dev

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/src/main"]