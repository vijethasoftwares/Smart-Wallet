# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies using npm 8
RUN npm install -g npm@8
RUN npm install

# Copy all application files to the working directory
COPY . .

# Expose the port your application will run on
EXPOSE 8003

# Define the command to run your Node.js application
CMD [ "node", "index.js" ]
