require('dotenv').config();
const UserModel = require('../models/User');
const { pool } = require('../config/database');

async function createAdminUser() {
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (!email || !password) {
    console.error('Usage: node createAdmin.js <email> <password>');
    process.exit(1);
  }
  
  try {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log('✅ User is already an admin');
        process.exit(0);
      }
      
      // Update existing user to admin
      const updated = await UserModel.updateRole(existingUser.id, 'admin');
      console.log('✅ Updated existing user to admin:', updated.email);
    } else {
      // Create new admin user
      const adminUser = await UserModel.create({
        email,
        password,
        nickname: 'Admin',
        age: 30,
        personalManifesto: 'SAYU Admin User',
        role: 'admin'
      });
      
      console.log('✅ Created admin user:', adminUser.email);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error.message);
    process.exit(1);
  }
}

createAdminUser();