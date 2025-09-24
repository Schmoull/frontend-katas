FROM node:22-alpine
WORKDIR /app
EXPOSE 5173 24678
CMD ["npm","run","dev","--","--host"]