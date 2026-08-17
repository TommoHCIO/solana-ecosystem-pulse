FROM node:22-alpine
WORKDIR /app
COPY xaas-server.mjs openapi.json llms.txt ./
ENV HOST=0.0.0.0
EXPOSE 10000
CMD ["node", "xaas-server.mjs"]
