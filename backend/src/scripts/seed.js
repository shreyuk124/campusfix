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
  { name: 'Hostel Block A', code: 'HBA', campus: 'south' },
  { name: 'Hostel Block B', code: 'HBB', campus: 'south' },
  { name: 'Hostel Block C', code: 'HBC', campus: 'south' },
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

    // 4. Upsert Demo Users
    let studentUser = await User.findOne({ email: 'alex.student@campus.edu' });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Alex Student',
        email: 'alex.student@campus.edu',
        password: 'CampusPass2026!',
        role: 'student',
        studentId: 'ST-2026-9041',
      });
    }

    let staffUser = await User.findOne({ email: 'rajesh.electrician@campusfix.edu' });
    if (!staffUser) {
      staffUser = await User.create({
        name: 'Rajesh Electrician',
        email: 'rajesh.electrician@campusfix.edu',
        password: 'StaffPass2026!',
        role: 'staff',
      });
    }

    let adminUser = await User.findOne({ email: 'sarah.admin@campusfix.edu' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Sarah Admin',
        email: 'sarah.admin@campusfix.edu',
        password: 'AdminSecret2026!',
        role: 'admin',
      });
    }
    console.log(' [4/5] Seeded Demo Users (Student, Staff, Admin).');

    // 5. Seed Initial Sample Issues
    const sampleCount = await Issue.countDocuments();
    if (sampleCount === 0) {
      const hostelA = buildingMap.get('Hostel Block A') || Array.from(buildingMap.values())[0];
      const library = buildingMap.get('Central Library') || Array.from(buildingMap.values())[1];
      const compDept = buildingMap.get('Computer Engineering & IT Building') || Array.from(buildingMap.values())[2];
      const academicComplex = buildingMap.get('Academic Complex') || Array.from(buildingMap.values())[3];

      const plumbingCat = categoryMap.get('plumbing');
      const wifiCat = categoryMap.get('wifi');
      const elecCat = categoryMap.get('electrical');
      const furnCat = categoryMap.get('furniture');

      const sampleIssues = [
        {
          refId: 'CF-10291',
          title: 'Water leaking near Block A washroom',
          category: plumbingCat ? plumbingCat._id : null,
          building: hostelA._id,
          campus: 'south',
          locationText: 'Block A · 2nd Floor · Washroom 204',
          description: 'Overhead flush pipe is constantly leaking onto the corridor floor.',
          status: 'In Progress',
          priorityScore: 55,
          priorityBand: 'High',
          reportCount: 12,
          createdBy: studentUser._id,
          assignedTeam: teamMap.get('Plumbing & Water Services Team')?._id || null,
        },
        {
          refId: 'CF-20412',
          title: 'Wi-Fi unavailable in the central library reading hall',
          category: wifiCat ? wifiCat._id : null,
          building: library._id,
          campus: 'north',
          locationText: 'Central Library · Ground Floor · Reference Section',
          description: 'COEP-Secure Wi-Fi router AP-04 is blinking red with zero throughput.',
          status: 'Assigned',
          priorityScore: 35,
          priorityBand: 'Medium',
          reportCount: 8,
          createdBy: studentUser._id,
          assignedTeam: teamMap.get('IT Maintenance Team')?._id || null,
        },
        {
          refId: 'CF-30948',
          title: 'Sparks from switchboard in Lab 102',
          category: elecCat ? elecCat._id : null,
          building: compDept._id,
          campus: 'north',
          locationText: 'Computer & IT Dept · 1st Floor · Lab 102',
          description: 'Terminal block sparking when multiple PCs are powered on.',
          status: 'Reported',
          priorityScore: 80,
          priorityBand: 'Critical',
          reportCount: 15,
          createdBy: studentUser._id,
          assignedTeam: teamMap.get('Electrical Team')?._id || null,
        },
        {
          refId: 'CF-40812',
          title: 'Broken lecture bench in Room 204',
          category: furnCat ? furnCat._id : null,
          building: academicComplex._id,
          campus: 'north',
          locationText: 'Academic Complex · 2nd Floor · Classroom 204',
          description: 'Third row wooden bench has loose leg joint and tilts dangerously.',
          status: 'Resolved',
          priorityScore: 10,
          priorityBand: 'Low',
          reportCount: 2,
          createdBy: studentUser._id,
          assignedTeam: teamMap.get('Carpentry & Civil Team')?._id || null,
          resolvedAt: new Date(),
          resolutionNote: 'Replaced wooden support strut and re-tightened bracket bolts.',
        },
      ];

      await Issue.insertMany(sampleIssues.filter((i) => i.category && i.building));
      console.log(' [5/5] Seeded live sample issues.');
    } else {
      console.log(` [5/5] Issues collection already populated (${sampleCount} existing).`);
    }

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
