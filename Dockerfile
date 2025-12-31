FROM node:18-alpine

WORKDIR /usr/src/app

# Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Scripti ve kodları kopyala
COPY startup.sh .
COPY . .

# Scripti çalıştırılabilir yap (Çok Önemli - Windows'ta oluşturulduysa bile Linux'ta yetki verir)
RUN chmod +x startup.sh

EXPOSE 9999

# Container başladığında direkt bu script çalışsın
CMD ["./startup.sh"]