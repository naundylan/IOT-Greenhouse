# 🚀 NCKH Backend API

Backend API phục vụ cho đề tài Nghiên cứu Khoa học (NCKH), được xây dựng bằng Node.js - express

![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)
![NodeJS](https://img.shields.io/badge/Node.js-18-green?logo=node.js)
![Status](https://img.shields.io/badge/Status-Development-orange)

## 📋 Yêu cầu (Prerequisites)
Install:
- [Docker Desktop](https://www.docker.com/products/docker-desktop) or clone code https://github.com/naundylan/IOT-Greenhouse

## ⚙️ Cấu hình môi trường (Enviroment)

   ```bash
   # Linux/Mac
   cp .env.example .env
   
   # Windows (CMD)
   copy .env.example .env
   ```

## 🐳 With docker image:
   ```bash
   Docker pull mnghia/nckh-backend:latest
   Docker run  --env-file .env -p 8100:8100 mnghia/nckh-backend:latest
   ```
## 🛠️ With source code:
   ```bash
   Docker compose up --build -d 
