# Step 1: Use an official Node.js runtime as a parent image
FROM node:22

# Step 2: Set the working directory
WORKDIR /usr/src/app

# Step 3: Copy package.json and yarn.lock
COPY package*.json yarn.lock ./

# Step 4: Install dependencies using Yarn
RUN yarn install

# Step 5: Copy the rest of the application
COPY . .

# Step 6: Build the application using Yarn with increased memory
RUN NODE_OPTIONS="--max-old-space-size=4096" yarn build

# Step 7: Expose the port your app will run on
EXPOSE 3000

# Step 8: Start the application using Yarn
CMD ["yarn", "start:prod"]
