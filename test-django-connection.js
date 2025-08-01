#!/usr/bin/env node

const axios = require('axios');

async function testDjangoConnection() {
  // Detectar automáticamente el entorno
  const isDocker = process.env.REDIS_HOST === 'redis'; // Si REDIS_HOST es 'redis', estamos en Docker
  const DJANGO_API_URL = process.env.DJANGO_API_URL || (isDocker ? "http://taller_ms_persistence:8000" : "http://localhost:8000");
  
  console.log(`Testing connection to Django API at: ${DJANGO_API_URL}`);
  console.log(`Environment: ${isDocker ? 'Docker' : 'Local'}`);
  
  try {
    // Test 1: Verificar que Django esté corriendo
    console.log("\n1. Testing basic connection...");
    const response = await axios.get(`${DJANGO_API_URL}/clients/`);
    console.log("✅ Django API is responding!");
    console.log(`Status: ${response.status}`);
    
    // Test 2: Verificar estructura de datos
    console.log("\n2. Testing data structure...");
    const clients = response.data;
    console.log(`Found ${clients.length} clients`);
    
    if (clients.length > 0) {
      const firstClient = clients[0];
      console.log("Sample client data:");
      console.log(`  ID: ${firstClient.id}`);
      console.log(`  Name: ${firstClient.name}`);
      console.log(`  Email: ${firstClient.email}`);
      console.log(`  Interests: ${firstClient.interests.join(', ')}`);
    }
    
    // Test 3: Verificar que los datos tengan el formato correcto
    console.log("\n3. Validating data format...");
    const isValid = clients.every(client => 
      client.id && 
      client.name && 
      client.email && 
      Array.isArray(client.interests)
    );
    
    if (isValid) {
      console.log("✅ All clients have the correct data structure!");
    } else {
      console.log("❌ Some clients are missing required fields");
    }
    
    console.log("\n🎉 Django connection test completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Error connecting to Django API:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error("No response received. Is Django running?");
      console.error(`Tried to connect to: ${DJANGO_API_URL}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    
    console.log("\nTroubleshooting tips:");
    if (isDocker) {
      console.log("1. Make sure all services are running: docker-compose up");
      console.log("2. Check if taller_ms_persistence service is healthy");
      console.log("3. Verify network connectivity between containers");
    } else {
      console.log("1. Make sure Django is running: docker-compose up taller_ms_persistence");
      console.log("2. Check if the port 8000 is accessible");
    }
    console.log("4. Verify the DJANGO_API_URL environment variable");
  }
}

testDjangoConnection(); 