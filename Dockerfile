FROM node:22-alpine
WORKDIR /app
COPY xaas-server.mjs openapi.json llms.txt ./
EXPOSE 4021
ENV PORT=4021
CMD ["node", "xaas-server.mjs"]
