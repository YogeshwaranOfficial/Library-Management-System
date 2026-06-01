// src/tests/runTests.ts
import sequelize from '../database/connection/database.js';
import User from '../database/models/User.js';
import request from 'supertest';
import app from '../app.js';
import { execSync } from 'child_process';
import { Op } from 'sequelize';

async function bootstrapSuite() {
  console.log('\n🚀 [Test Runner]: Initializing testing database connection pool...');
  
  try {
    // 1. Authenticate & Sync database
    await sequelize.authenticate();

    // 2. Pre-seed our global master test librarian user
    const globalUser = {
      name: "Global Master Librarian",
      gmail: "test_master_librarian@gmail.com",
      password: "Password@123"
    };

    await request(app).post("/api/v1/auth/register").send(globalUser);
    console.log('✅ [Test Runner]: Master test user account verified and ready.');

    // 3. Spawns Jest to run all tests inside your codebase natively
    console.log('🏁 [Test Runner]: Executing integration test suites...\n');
    execSync('node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --detectOpenHandles', { stdio: 'inherit' });


  } catch (error) {
    console.error('❌ [Test Runner]: Critical error during test execution block:', error);
    process.exitCode = 1;
  } finally {
    console.log('\n🧹 [Test Runner]: Beginning post-suite database cleanup...');
    try {
      // 4. Clean up any dynamic test accounts
      // In src/tests/runTests.ts - Make this surgical instead of a global wildcard match
      await User.destroy({
        where: { gmail: 'test_master_librarian@gmail.com' },
        force: true
      });
      console.log('🗑️ [Test Runner]: Test records safely purged.');
      
      // 5. Securely sever connection pool strings
      await sequelize.close();
      console.log('🛑 [Test Runner]: Database pool drained successfully. Goodbye!\n');
    } catch (cleanUpError) {
      console.error('❌ [Test Runner]: Failed to clean database pool down securely:', cleanUpError);
    }
  }
}

bootstrapSuite();