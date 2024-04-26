FROM oven/bun:latest as builder

WORKDIR /app
COPY server.ts package.json /app/
RUN bun install && bun build --minify --compile server.ts --outfile=server 

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server server

CMD [ "/app/server" ]
