FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json ./
COPY bun.lock ./

RUN bun install --frozen-lockfile --production

COPY . .

RUN bun run build

FROM ubuntu:24.04 as runner

WORKDIR /app

COPY --link --from=builder /app/zako-box-be ./

ENTRYPOINT [ "/app/zako-box-be" ]
