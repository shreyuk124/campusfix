// backend/src/scripts/seed.js - CampusFix Database Seeder
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Building } from '../models/Building.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { Issue } from '../models/Issue.js';
import { Report } from '../models/Report.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campusfix';

const BUILDINGS = [
  { name: 'Academic Complex', code: 'AC', campus: 'north' },
  { name: 'Main Heritage Building', code: 'MHB', campus: 'north' },
  { name: 'Mechanical Dept', code: 'MECH', campus: 'north' },
  { name: 'Electrical Dept', code: 'ELEC', campus: 'north' },
  { name: 'Computer & IT Dept', code: 'COMP', campus: 'north' },
  { name: 'Civil Dept', code: 'CIVIL', campus: 'north' },
  { name: 'Central Library', code: 'LIB', campus: 'north' },
  { name: 'Auditorium', code: 'AUD', campus: 'north' },
  { name: 'Student Gymkhana', code: 'GYM', campus: 'north' },
  { name: 'Hostel Block A', code: 'HBA', campus: 'south' },
  { name: 'Hostel Block B', code: 'HBB', campus: 'south' },
  { name: 'Hostel Block C', code: 'HBC', campus: 'south' },
  { name: 'Boys Hostel', code: 'BH', campus: 'south' },
  { name: 'Girls Hostel', code: 'GH', campus: 'south' },
  { name: 'Campus Canteen', code: 'CAN', campus: 'south' },
];

const CATEGORIES = [
  {
    name: 'Safety & Security',
    key: 'safety',
    icon: 'Safety',
    description: 'Broken locks, hazards, security issues',
  },
  {
    name: 'Electrical',
    key: 'electrical',
    icon: 'Electrical',
    description: 'Lights, fans, switches, wiring faults',
  },
  {
    name: 'Water & Plumbing',
    key: 'plumbing',
    icon: 'Plumbing',
    description: 'Leaks, clogged washrooms, tap damage',
  },
  {
    name: 'Wi-Fi & Network',
    key: 'wifi',
    icon: 'Wifi',
    description: 'No signal, slow connection, router issues',
  },
  {
    name: 'Equipment & Labs',
    key: 'equipment',
    icon: 'Equipment',
    description: 'Projectors, lab tools, computers',
  },
  {
    name: 'Sanitation & Hygiene',
    key: 'sanitation',
    icon: 'Sanitation',
    description: 'Dustbins, cleanliness, pest issues',
  },
  {
    name: 'Furniture & Fixtures',
    key: 'furniture',
    icon: 'Furniture',
    description: 'Broken benches, desks, whiteboards',
  },
  {
    name: 'Other',
    key: 'other',
    icon: 'Other',
    description: 'Issues that do not fit above',
  },
];

async function seed() {
  console.log('----------------------------------------------------');
  console.log(' 🌱 CampusFix Database Seeder Starting...');
  console.log(` 📍 Target MongoDB: ${MONGO_URI}`);
  console.log('----------------------------------------------------');

  try {
    await mongoose.connect(MONGO_URI);
    console.log(' [1/5] Connected to MongoDB.');

    // 1. Clear existing collections
    await Promise.all([
      Building.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({}),
      Issue.deleteMany({}),
      Report.deleteMany({}),
    ]);
    console.log(' [2/5] Cleared old collections.');

    // 2. Insert Buildings
    const insertedBuildings = await Building.insertMany(BUILDINGS);
    console.log(` [3/5] Seeded ${insertedBuildings.length} Campus Buildings.`);

    // 3. Insert Categories
    const insertedCategories = await Category.insertMany(CATEGORIES);
    console.log(` [4/5] Seeded ${insertedCategories.length} Issue Categories.`);

    // 4. Insert Demo Users
    const studentUser = await User.create({
      name: 'Alex Student',
      email: 'alex.student@campus.edu',
      password: 'CampusPass2026!',
      role: 'student',
      studentId: 'ST-2026-9041',
    });

    const staffUser = await User.create({
      name: 'Rajesh Electrician',
      email: 'rajesh.electrician@campusfix.edu',
      password: 'StaffPass2026!',
      role: 'staff',
    });

    const adminUser = await User.create({
      name: 'Sarah Admin',
      email: 'sarah.admin@campusfix.edu',
      password: 'AdminSecret2026!',
      role: 'admin',
    });
    console.log(' [5/5] Seeded 3 Demo Users (Student, Staff, Admin).');

    // 5. Seed Initial Sample Issues
    const hostelA = insertedBuildings.find((b) => b.name === 'Hostel Block A');
    const library = insertedBuildings.find((b) => b.name === 'Central Library');
    const compDept = insertedBuildings.find((b) => b.name === 'Computer & IT Dept');
    const academicComplex = insertedBuildings.find((b) => b.name === 'Academic Complex');

    const plumbingCat = insertedCategories.find((c) => c.key === 'plumbing');
    const wifiCat = insertedCategories.find((c) => c.key === 'wifi');
    const elecCat = insertedCategories.find((c) => c.key === 'electrical');
    const furnCat = insertedCategories.find((c) => c.key === 'furniture');

    const sampleIssues = [
      {
        refId: 'CF-10291',
        title: 'Water leaking near Block A washroom',
        category: plumbingCat._id,
        building: hostelA._id,
        campus: 'south',
        locationText: 'Block A · 2nd Floor · Washroom 204',
        description: 'Overhead flush pipe is constantly leaking onto the corridor floor.',
        status: 'In Progress',
        priorityScore: 55,
        priorityBand: 'High',
        reportCount: 12,
        createdBy: studentUser._id,
      },
      {
        refId: 'CF-20412',
        title: 'Wi-Fi unavailable in the central library reading hall',
        category: wifiCat._id,
        building: library._id,
        campus: 'north',
        locationText: 'Central Library · Ground Floor · Reference Section',
        description: 'COEP-Secure Wi-Fi router AP-04 is blinking red with zero throughput.',
        status: 'Assigned',
        priorityScore: 35,
        priorityBand: 'Medium',
        reportCount: 8,
        createdBy: studentUser._id,
      },
      {
        refId: 'CF-30948',
        title: 'Sparks from switchboard in Lab 102',
        category: elecCat._id,
        building: compDept._id,
        campus: 'north',
        locationText: 'Computer & IT Dept · 1st Floor · Lab 102',
        description: 'Terminal block sparking when multiple PCs are powered on.',
        status: 'Reported',
        priorityScore: 80,
        priorityBand: 'Critical',
        reportCount: 15,
        createdBy: studentUser._id,
      },
      {
        refId: 'CF-40812',
        title: 'Broken lecture bench in Room 204',
        category: furnCat._id,
        building: academicComplex._id,
        campus: 'north',
        locationText: 'Academic Complex · 2nd Floor · Classroom 204',
        description: 'Third row wooden bench has loose leg joint and tilts dangerously.',
        status: 'Resolved',
        priorityScore: 10,
        priorityBand: 'Low',
        reportCount: 2,
        createdBy: studentUser._id,
        resolvedAt: new Date(),
        resolutionNote: 'Replaced wooden support strut and re-tightened bracket bolts.',
      },
    ];

    const insertedIssues = await Issue.insertMany(sampleIssues);
    console.log(` 🚀 Seeded ${insertedIssues.length} live issues.`);

    console.log('----------------------------------------------------');
    console.log(' ✅ SEED COMPLETED SUCCESSFULLY!');
    console.log(' Database is now ready for feed queries and live tests.');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error(' ❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
