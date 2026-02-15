FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
COPY .sequelizerc ./

# Make migration script executable
RUN chmod +x scripts/run-migrations.sh

RUN npm run build

EXPOSE 4000

# Run migrations before starting the app
CMD ["sh", "-c", "npm run migrate && npm run start"]

