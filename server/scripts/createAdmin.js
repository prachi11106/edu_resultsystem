import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import userService from '../services/userService.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const parseArgs = () => {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      params[key] = val;
    }
  }
  return params;
};

async function main() {
  console.log('====================================================');
  console.log('🔐 AnkSetu Administrator Provisioning Tool');
  console.log('====================================================');

  const args = parseArgs();

  const name = args.name || 'Master Administrator';
  const email = (args.email || 'admin@anksetu.edu').toLowerCase().trim();
  const password = args.password || 'password123';
  const organization = args.org || 'Delhi Public International Academy';
  const phone = args.phone || '+91 98111 22334';

  if (!email || !password || password.length < 6) {
    console.error('❌ Error: Email and password (min 6 characters) are required.');
    console.log('Usage: node scripts/createAdmin.js --name "Admin Name" --email "admin@school.edu" --password "securePass123" --org "School Name"');
    process.exit(1);
  }

  // Attempt DB connection
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/anksetu';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to MongoDB database successfully.');
  } catch (err) {
    console.warn(`⚠️  MongoDB direct connection unavailable (${err.message}). Saving to persistent storage store.`);
  }

  try {
    // Check if user already exists
    const existing = await userService.findUserByEmail(email);

    if (existing) {
      console.log(`ℹ️  User with email '${email}' already exists. Updating to Administrator role...`);
      const hashedPassword = await userService.hashPassword(password);
      await userService.updateUser(existing._id, {
        name,
        password: hashedPassword,
        role: 'admin',
        organization,
        phone,
        status: 'active',
      });
      console.log(`✅ Administrator account '${email}' updated successfully!`);
    } else {
      await userService.createUser({
        name,
        email,
        password,
        role: 'admin',
        organization,
        phone,
        status: 'active',
        schoolId: 'SCH-1001',
      });
      console.log(`✅ Administrator account '${email}' created successfully!`);
    }

    console.log('\n--- Account Details ---');
    console.log(`Name:         ${name}`);
    console.log(`Email:        ${email}`);
    console.log(`Role:         admin (Administrator Access)`);
    console.log(`Organization: ${organization}`);
    console.log(`Status:       active`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Provisioning Error:', err.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(0);
  }
}

main();
