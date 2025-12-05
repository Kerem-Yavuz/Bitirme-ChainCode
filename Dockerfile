# Base image olarak Node.js kullanıyoruz
FROM node:22.6.0-slim

# Çalışma dizinini ayarlıyoruz
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyalıyoruz
COPY package*.json ./

# Bağımlılıkları yüklüyoruz
RUN npm install

# Uygulama dosyalarını kopyalıyoruz
COPY . .

# Uygulamanın çalışacağı portu açıyoruz
EXPOSE 8001

# Uygulamayı başlatıyoruz
CMD ["npm", "start"]
