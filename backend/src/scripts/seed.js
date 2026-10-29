// backend/src/scripts/seed.js - Unified CampusFix Database Seeder
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Team } from '../models/Team.js';
import { Category } from '../models/Category.js';
import { Building } from '../models/Building.js';
import { User } from '../models/User.js';
import { Issue } from '../models/Issue.js';

// Resolve directory and load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 1. Teams Definitions
const TEAMS_DATA = [
  { name: 'Campus Security Team' },
  { name: 'Electrical Team' },
  { name: 'Plumbing & Water Services Team' },
  { name: 'IT Maintenance Team' },
  { name: 'IT / AV & HVAC Team' },
  { name: 'Housekeeping Team' },
  { name: 'Carpentry & Civil Team' },
];

// 2. Categories Definitions & Mappings
const CATEGORIES_DATA = [
  {
    name: 'Safety & Security',
    key: 'safety',
    icon: 'Safety',
    description: 'Broken locks, hazards, security issues',
    defaultTeamName: 'Campus Security Team',
  },
  {
    name: 'Electrical',
    key: 'electrical',
    icon: 'Electrical',
    description: 'Lights, fans, switches, wiring faults',
    defaultTeamName: 'Electrical Team',
  },
  {
    name: 'Water & Plumbing',
    key: 'plumbing',
    icon: 'Plumbing',
    description: 'Leaks, clogged washrooms, tap damage',
    defaultTeamName: 'Plumbing & Water Services Team',
  },
  {
    name: 'Wi-Fi & Network',
    key: 'wifi',
    icon: 'Wifi',
    description: 'No signal, slow connection, router issues',
    defaultTeamName: 'IT Maintenance Team',
  },
  {
    name: 'Equipment & Labs',
    key: 'equipment',
    icon: 'Equipment',
    description: 'Projectors, lab tools, computers',
    defaultTeamName: 'IT / AV & HVAC Team',
  },
  {
    name: 'Sanitation & Hygiene',
    key: 'sanitation',
    icon: 'Sanitation',
    description: 'Dustbins, cleanliness, pest issues',
    defaultTeamName: 'Housekeeping Team',
  },
  {
    name: 'Furniture & Fixtures',
    key: 'furniture',
    icon: 'Furniture',
    description: 'Broken benches, desks, whiteboards',
    defaultTeamName: 'Carpentry & Civil Team',
  },
  {
    name: 'Other',
    key: 'other',
    icon: 'Other',
    description: 'Issues that do not fit above',
    defaultTeamName: 'Housekeeping Team',
  },
];

// 3. Buildings Definitions
const BUILDINGS_DATA = [
  { name: 'Main Heritage Building', code: 'MHB', campus: 'north' },
  { name: 'Academic Complex', code: 'AC', campus: 'north' },
  { name: 'Computer Engineering & IT Building', code: 'COMP', campus: 'north' },
  { name: 'Mechanical Engineering Building', code: 'MECH', campus: 'north' },
  { name: 'Electrical Engineering Building', code: 'ELEC', campus: 'north' },
  { name: 'Civil Engineering Building', code: 'CIVIL', campus: 'north' },
  { name: 'Electronics & Telecommunication (E&TC) Building', code: 'ENTC', campus: 'north' },
  { name: 'Metallurgy & Materials Science Building', code: 'META', campus: 'north' },
  { name: 'Instrumentation & Control Building', code: 'INST', campus: 'north' },
  { name: 'Manufacturing & Production Engineering Building', code: 'PROD', campus: 'north' },
  { name: 'Applied Mechanics Building', code: 'APPM', campus: 'north' },
  { name: 'Bhau Institute of Innovation', code: 'BHAU', campus: 'north' },
  { name: 'Central Library', code: 'LIB', campus: 'north' },
  { name: 'Main Auditorium', code: 'AUD', campus: 'north' },
  { name: 'Boat Club', code: 'BOAT', campus: 'north' },
  { name: 'COEP Gymkhana & Ground', code: 'GYM', campus: 'north' },
  { name: 'COEP Canteen / Meta Canteen', code: 'CAN', campus: 'south' },
  { name: 'North Academic Block', code: 'NAB', campus: 'north' },
  { name: 'South Academic Block', code: 'SAB', campus: 'south' },
];

/**
 * Idempotent Database Seeder
 */
export async function seedDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/campusfix';
  console.log('----------------------------------------------------');
  console.log(' 🌱 CampusFix Unified Database Seeder Starting...');
  console.log(` 📍 Target MongoDB: ${mongoUri}`);
  console.log('----------------------------------------------------');

  const conn = await mongoose.connect(mongoUri);

  try {
    // 1. Upsert Teams
    const teamMap = new Map();
    for (const teamItem of TEAMS_DATA) {
      const doc = await Team.findOneAndUpdate(
        { name: teamItem.name },
        { $set: { name: teamItem.name, isActive: true } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      teamMap.set(doc.name, doc);
    }
    console.log(` [1/5] Upserted ${teamMap.size} Teams.`);

    // 2. Upsert Categories
    const categoryMap = new Map();
    for (const catItem of CATEGORIES_DATA) {
      const defaultTeamDoc = teamMap.get(catItem.defaultTeamName);
      const doc = await Category.findOneAndUpdate(
        { key: catItem.key },
        {
          $set: {
            name: catItem.name,
            key: catItem.key,
            icon: catItem.icon,
            description: catItem.description,
            defaultTeam: defaultTeamDoc ? defaultTeamDoc._id : null,
            isActive: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      categoryMap.set(doc.key, doc);
    }
    console.log(` [2/5] Upserted ${categoryMap.size} Issue Categories.`);

    // 3. Upsert Buildings
    const buildingMap = new Map();
    for (const bldg of BUILDINGS_DATA) {
      const doc = await Building.findOneAndUpdate(
        { name: bldg.name },
        {
          $set: {
            name: bldg.name,
            code: bldg.code || '',
            campus: bldg.campus || 'north',
            isActive: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      buildingMap.set(doc.name, doc);
    }
    console.log(` [3/5] Upserted ${buildingMap.size} Campus Buildings.`);

    // 4. Ensure Master Production Admin Account
    let adminUser = await User.findOne({
      email: { $in: ['admin@coeptech.ac.in', 'admin@coeptech.ac'] },
    }).select('+password');

    if (!adminUser) {
      adminUser = await User.create({
        name: 'COEP Admin',
        email: 'admin@coeptech.ac.in',
        password: 'admin123',
        role: 'admin',
      });
      console.log(' [4/4] Created master admin account (admin@coeptech.ac.in).');
    } else {
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
      }
      console.log(' [4/4] Master admin account verified.');
    }

    // Purge any legacy demo accounts and sample issues from database
    await User.deleteMany({
      email: { $in: ['alex.student@campus.edu', 'rajesh.electrician@campusfix.edu'] },
    });
    const purgedDemoIssues = await Issue.deleteMany({
      refId: { $in: ['CF-10291', 'CF-20412', 'CF-30948', 'CF-40812'] },
    });
    if (purgedDemoIssues.deletedCount > 0) {
      console.log(` 🧹 Purged ${purgedDemoIssues.deletedCount} legacy demo mock issues.`);
    }

    console.log('----------------------------------------------------');
    console.log(' ✅ LIVE SEEDING COMPLETE: Catalog and admin ready (0 mock issues).');
    console.log('----------------------------------------------------');

    console.log('----------------------------------------------------');
    console.log(' ✅ SEEDING COMPLETE: Database is fully initialized!');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error(' ❌ Seeding error:', err);
    throw err;
  }
}

// Run directly if invoked via CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
