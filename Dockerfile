# Stage 1: Build the Vue.js application
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_LIBRETRANSLATE_API_URL
RUN VITE_LIBRETRANSLATE_API_URL=${VITE_LIBRETRANSLATE_API_URL} npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
