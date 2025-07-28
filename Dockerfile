# Usar la imagen oficial de Python
FROM python:3.11-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo de la aplicación
COPY app.py .

# Ejecutar la aplicación
CMD ["python", "app.py"] 