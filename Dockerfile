# Use a lightweight nginx image
FROM nginx:alpine

# Copy the static content into the nginx html directory
COPY index.html /usr/share/nginx/html
COPY style.css /usr/share/nginx/html
COPY src/ /usr/share/nginx/html/src

# Expose port 80
EXPOSE 80

# Start nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
