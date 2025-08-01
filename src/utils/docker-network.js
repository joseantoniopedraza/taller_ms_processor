const { execSync } = require('child_process');

function getDjangoContainerIP() {
  try {
    // Obtener la IP del contenedor de Django usando docker inspect
    const containerName = 'taller-taller_ms_persistence-1';
    const inspectOutput = execSync(`docker inspect ${containerName}`, { encoding: 'utf8' });
    const containerInfo = JSON.parse(inspectOutput);
    
    // Buscar la IP en la red taller_red_ms
    const networks = containerInfo[0]?.NetworkSettings?.Networks;
    if (networks && networks['taller_red_ms']) {
      return networks['taller_red_ms'].IPAddress;
    }
    
    // Fallback: buscar cualquier IP IPv4
    for (const networkName in networks) {
      const network = networks[networkName];
      if (network.IPAddress && network.IPAddress.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return network.IPAddress;
      }
    }
    
    throw new Error('No se pudo encontrar la IP del contenedor de Django');
  } catch (error) {
    console.error('Error obteniendo IP de Django:', error.message);
    return null;
  }
}

function getDjangoURL() {
  const ip = getDjangoContainerIP();
  if (ip) {
    return `http://${ip}:8000`;
  }
  
  // Fallback a localhost si no se puede obtener la IP
  console.log('Usando fallback a localhost para Django API');
  return 'http://localhost:8000';
}

module.exports = {
  getDjangoContainerIP,
  getDjangoURL
}; 