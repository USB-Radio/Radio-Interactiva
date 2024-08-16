# Usar la imagen de Node.js como base
FROM node:18-alpine

# Establecer el directorio de trabajo en la imagen de Docker
WORKDIR /app

# Copiar los archivos package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar todo el código fuente de la aplicación
COPY . .

# Exponer el puerto que usará la aplicación (Vite usualmente usa el puerto 5173)
EXPOSE 5173

# Comando por defecto para iniciar la aplicación
CMD ["npm", "run", "dev"]
