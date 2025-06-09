FROM node:20-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true
ENV NEXT_DISABLE_ESLINT_PLUGIN=true
ENV NEXT_PUBLIC_API_URL=https://api.placeholder.com
ENV NEXTAUTH_URL=https://app.placeholder.com
ENV NEXTAUTH_SECRET=placeholder-secret-for-build
RUN npm run build
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["npm", "start"]