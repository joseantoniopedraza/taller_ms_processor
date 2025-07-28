# Proyecto Python con Docker - Hola Mundo

Este es un proyecto simple de Python containerizado con Docker que imprime "Hola mundo".

## Estructura del proyecto

```
taller_ms_processor/
├── app.py          # Aplicación principal
├── Dockerfile      # Configuración de Docker
├── requirements.txt # Dependencias (vacío en este caso)
├── .dockerignore   # Archivos a ignorar en Docker
└── README.md       # Este archivo
```

## Cómo ejecutar

### Opción 1: Con Docker (recomendado)

1. Construir la imagen Docker:
```bash
docker build -t hola-mundo .
```

2. Ejecutar el contenedor:
```bash
docker run hola-mundo
```

### Opción 2: Localmente con Python

1. Asegúrate de tener Python 3.11+ instalado
2. Ejecuta la aplicación:
```bash
python app.py
```

## Resultado esperado

Al ejecutar cualquiera de los comandos anteriores, deberías ver:
```
Hola mundo
``` 