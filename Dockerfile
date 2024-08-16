# Usar la imagen de Node.js como base
FROM node:18-alpine

# Establecer el directorio de trabajo en la imagen de Docker
WORKDIR /app

# Copiar los archivos package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Construir la aplicación
RUN npm run build

# Instalar un servidor estático para servir la aplicación (opcional)
RUN npm install -g serve

# Exponer el puerto que usará la aplicación (puerto 3000 en este caso)
EXPOSE 3000
EXPOSE 5173
# Comando por defecto para iniciar la aplicación
CMD ["serve", "-s", "dist"]
