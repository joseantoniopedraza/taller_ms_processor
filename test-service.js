#!/usr/bin/env node

const { newService } = require('./dist/src/app/get-users/service');

async function testService() {
  console.log("Testing TypeScript service...");
  
  try {
    const service = newService();
    const getUsers = service.getUsers;
    
    console.log("\n1. Calling getUsers service...");
    const users = await getUsers.call(service)();
    
    console.log(`✅ Service returned ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
      console.log(`    Interests: ${user.interests.join(', ')}`);
    });
    
    console.log("\n2. Testing cache functionality...");
    console.log("Calling getUsers again (should use cache)...");
    const cachedUsers = await getUsers.call(service)();
    console.log(`✅ Cached call returned ${cachedUsers.length} users`);
    
    console.log("\n🎉 Service test completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Error testing service:");
    console.error(error.message);
    console.error(error.stack);
  }
}

testService(); 