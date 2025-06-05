FROM node:20-alpine 

# Set the working directory
WORKDIR /usr/src/app

RUN apk add --no-cache openssl bash ansible

# Verify installation
RUN node -v && npm -v

# Copy the application files into the container
COPY . /usr/src/app

# Install dependencies 
RUN npm install
RUN chmod 400 /usr/src/app/ansible/deployer.pem

# Build the application
RUN npm run build

# to start the application
CMD ["npm", "run", "dev"]

