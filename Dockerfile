FROM node:20-alpine
WORKDIR /app
COPY . .
RUN echo "Hello Railway"