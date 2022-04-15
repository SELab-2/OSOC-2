FROM node:17.9.0

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# THIS IS THE PORT THAT NEXT.JS USES
EXPOSE 3000

CMD ["sh" , "-c", "npm run build ; npm run start"]