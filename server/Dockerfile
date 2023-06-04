# Install dependencies only when needed
FROM node:16.16.0-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./

# Don’t generate a yarn.lock lockfile and fail if an update is needed.
RUN yarn install --frozen-lockfile --ignore-scripts

# https://github.com/vercel/next.js/issues/30713
# RUN rm -r node_modules/@next/swc-linux-x64-gnu

# Rebuild the source code only when needed
FROM deps AS builder

WORKDIR /app

ENV NODE_ENV="production"

COPY tsconfig.json tsconfig.build.json ./
COPY nest-cli.json ./
COPY ./src ./src

RUN yarn build

# Only install packages in dependencies
RUN rm -r node_modules/
RUN yarn install --production --frozen-lockfile --ignore-scripts

# Production image, copy all the files and run node
FROM node:16.16.0-alpine AS runner

WORKDIR /app

RUN apk -U upgrade

RUN apk add curl tzdata

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

RUN cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime

EXPOSE 8080
ENV NODE_ENV="production"

CMD ["node", "/app/dist/main"]