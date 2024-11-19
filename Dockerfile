#
# Optimized docker build
#
# https://www.specfy.io/blog/1-efficient-dockerfile-nodejs-in-7-steps
#


# ------------------
# package.json cache
# ------------------
FROM node:20.17.0-bookworm-slim AS deps

WORKDIR /tmp

COPY package.json ./


# ---------------------
# Builder
# ---------------------
FROM node:20.17.0-bookworm-slim AS builder

WORKDIR /app/tmp

COPY --from=deps /tmp ./
COPY package-lock.json  ./

RUN npm install --omit=dev

COPY . /app/tmp


# ---------------------
# Final image
# ---------------------
FROM node:20.17.0-bookworm-slim AS web

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

USER node

WORKDIR /app

COPY --from=builder --chown=node:node /app/tmp /app

EXPOSE 3000

CMD ["node", "server.js"]
