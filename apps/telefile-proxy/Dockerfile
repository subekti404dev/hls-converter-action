FROM oven/bun:latest as builder

WORKDIR /app
COPY server.ts package.json /app/
RUN bun install && bun build --minify --compile server.ts --outfile=server

FROM ubuntu:latest
COPY --from=builder /app/server /usr/local/bin/server
RUN chmod +x /usr/local/bin/server

EXPOSE 8088

CMD [ "server" ]
