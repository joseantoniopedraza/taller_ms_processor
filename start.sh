#!/bin/bash

echo "Starting processor service..."

# Función para obtener la IP de Django
get_django_ip() {
    echo "Detecting Django container IP..."
    
    # Esperar a que el contenedor de Django esté listo
    while ! docker ps | grep -q "taller-taller_ms_persistence-1"; do
        echo "Waiting for Django container to be ready..."
        sleep 2
    done
    
    # Obtener la IP del contenedor de Django
    DJANGO_IP=$(docker inspect taller-taller_ms_persistence-1 | grep -A 1 '"taller_red_ms"' | grep '"IPAddress"' | cut -d'"' -f4)
    
    if [ -z "$DJANGO_IP" ]; then
        echo "Could not detect Django IP, using fallback..."
        DJANGO_IP="172.18.0.6"
    fi
    
    echo "Django IP detected: $DJANGO_IP"
    export DJANGO_API_URL="http://$DJANGO_IP:8000"
    echo "DJANGO_API_URL set to: $DJANGO_API_URL"
}

# Detectar IP de Django
get_django_ip

# Iniciar el servicio
echo "Starting Node.js application..."
node dist/src/index.js 