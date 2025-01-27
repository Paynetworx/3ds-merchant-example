# Build stage
#FROM 805012293679.dkr.ecr.us-east-2.amazonaws.com/alpine-nodejs_build:latest
FROM node:18-alpine
WORKDIR /usr/src/app

COPY . ./
WORKDIR /usr/src/app/frontend
RUN npm install  --verbose
RUN npm run build

WORKDIR /usr/src/app/backend
RUN npm install typescript 
RUN npm install
RUN npm run build
CMD ["node", "dist/index.js"]
