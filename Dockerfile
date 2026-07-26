# Builds the frontend as a static site served by nginx.
# Only needed if deploying to a container platform (Railway/Render/Fly);
# Vercel/Netlify/Cloudflare Pages build straight from the repo and don't need this.
#
# VITE_API_URL must point at your deployed backend and is baked in at build
# time (Vite inlines env vars into the JS bundle) -- pass it as a build arg:
#   docker build --build-arg VITE_API_URL=https://api.yourdomain.com -t cab-frontend .

FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
