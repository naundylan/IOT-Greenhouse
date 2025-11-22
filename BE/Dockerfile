# --------- requirements ---------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .
RUN npm run build

# --------- final image build ---------
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production 

COPY --from=builder /app/build ./build

EXPOSE 8100

CMD ["npm", "run", "start"]