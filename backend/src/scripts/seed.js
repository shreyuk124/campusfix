import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Team } from '../models/Team.js';
import { Category } from '../models/Category.js';
import { Building } from '../models/Building.js';

// Resolve directory and load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ---------------------------------------------------------------------------
// 1. TEAMS DEFINITIONS
// ---------------------------------------------------------------------------
// Mappings from Design Doc Section B (lines 40-49):
// - "Safety and Security -> Campus security"
// - "Electrical -> Electrical Team"
// - "Water and Plumbing -> Plumbing Team"
// - "Wi-Fi and Network -> IT Maintenance Team"
// - "Equipment -> IT / AV & HVAC Team"
// - "Sanitation -> Housekeeping Team"
// - "Furniture -> Carpentry & Civil Team"
// - "Other -> [Placeholder: Housekeeping Team assigned for general campus maintenance]"
const TEAMS_DATA = [
  { name: 'Campus Security Team' },          // Doc: handles Safety and Security
  { name: 'Electrical Team' },               // Doc: handles Electrical
  { name: 'Plumbing & Water Services Team' },// Doc: handles Water and Plumbing
  { name: 'IT Maintenance Team' },           // Doc: handles Wi-Fi and Network
  { name: 'IT / AV & HVAC Team' },           // Doc: handles Equipment
  { name: 'Housekeeping Team' },             // Doc: handles Sanitation (+ Placeholder: Other)
  { name: 'Carpentry & Civil Team' },        // Doc: handles Furniture
];

// ---------------------------------------------------------------------------
// 2. CATEGORIES DEFINITIONS & MAPPINGS
// ---------------------------------------------------------------------------
const CATEGORIES_DATA = [
  {
    name: 'Safety and Security',
    key: 'safety',
    defaultTeamName: 'Campus Security Team', // From doc (line 43)
  },
  {
    name: 'Electrical',
    key: 'electrical',
    defaultTeamName: 'Electrical Team', // From doc (line 44)
  },
  {
    name: 'Water and Plumbing',
    key: 'plumbing',
    defaultTeamName: 'Plumbing & Water Services Team', // From doc (line 45)
  },
  {
    name: 'Wi-Fi and Network',
    key: 'internet',
    defaultTeamName: 'IT Maintenance Team', // From doc (line 46)
  },
  {
    name: 'Equipment',
    key: 'equipment',
    defaultTeamName: 'IT / AV & HVAC Team', // From doc (line 47)
  },
  {
    name: 'Sanitation',
    key: 'cleanliness',
    defaultTeamName: 'Housekeeping Team', // From doc (line 48)
  },
  {
    name: 'Furniture',
    key: 'furniture',
    defaultTeamName: 'Carpentry & Civil Team', // From doc (line 49)
  },
  {
    name: 'Other',
    key: 'other',
    defaultTeamName: 'Housekeeping Team', // Placeholder: doc silent on 'Other'
  },
];

// ---------------------------------------------------------------------------
// 3. BUILDINGS DEFINITIONS
// ---------------------------------------------------------------------------
// Exactly 21 confirmed COEP buildings from frontend/src/lib/constants.js
// As per instructions: no invented buildings; campus and floors are optional (no default floors seeded).
const BUILDINGS_DATA = [
  { name: 'Main Heritage Building' },
  { name: 'Academic Complex' },
  { name: 'Computer Engineering & IT Building' },
  { name: 'Mechanical Engineering Building' },
  { name: 'Electrical Engineering Building' },
  { name: 'Civil Engineering Building' },
  { name: 'Electronics & Telecommunication (E&TC) Building' },
  { name: 'Metallurgy & Materials Science Building' },
  { name: 'Instrumentation & Control Building' },
  { name: 'Manufacturing & Production Engineering Building' },
  { name: 'Applied Mechanics Building' },
  { name: 'Bhau Institute of Innovation' },
  { name: 'Central Library' },
  { name: 'Main Auditorium' },
  { name: 'Boat Club' },
  { name: 'COEP Gymkhana & Ground' },
  { name: 'COEP Canteen / Meta Canteen' },
  { name: 'North Academic Block', campus: 'north' },
  { name: 'South Academic Block', campus: 'south' },
  { name: 'Student Activity Centre' },
  { name: 'Campus Dining Hall' },
];

/**
 * Idempotent Two-Pass Database Seeder
 */
export async function seedDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusfix';
  console.log(`[Seed] Connecting to MongoDB...`);
  await mongoose.connect(mongoUri);
  console.log(`[Seed] Connected successfully.`);

  try {
    // -----------------------------------------------------------------------
    // PASS 1: Upsert independent entities without circular cross-references
    // -----------------------------------------------------------------------
    console.log(`[Seed] Pass 1: Upserting Teams, Categories, and Buildings...`);

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
    console.log(`[Seed] Upserted ${teamMap.size} Teams.`);

    // 2. Upsert Categories (without defaultTeam for now)
    const categoryMap = new Map();
    for (const catItem of CATEGORIES_DATA) {
      const doc = await Category.findOneAndUpdate(
        { name: catItem.name },
        { $set: { name: catItem.name, key: catItem.key, isActive: true } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      categoryMap.set(doc.name, doc);
    }
    console.log(`[Seed] Upserted ${categoryMap.size} Categories.`);

    // 3. Upsert 21 Confirmed Buildings
    let buildingsCount = 0;
    for (const bldgItem of BUILDINGS_DATA) {
      const updateData = { name: bldgItem.name, isActive: true };
      if (bldgItem.campus) {
        updateData.campus = bldgItem.campus;
      }
      await Building.findOneAndUpdate(
        { name: bldgItem.name },
        { $set: updateData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      buildingsCount++;
    }
    console.log(`[Seed] Upserted ${buildingsCount} Buildings (21 confirmed from frontend constants).`);

    // -----------------------------------------------------------------------
    // PASS 2: Wire cross-references safely without circular dependency issues
    // -----------------------------------------------------------------------
    console.log(`[Seed] Pass 2: Wiring Category.defaultTeam and Team.categories cross-references...`);

    // 1. Link Category -> defaultTeam
    for (const catItem of CATEGORIES_DATA) {
      const team = teamMap.get(catItem.defaultTeamName);
      if (team) {
        await Category.findOneAndUpdate(
          { name: catItem.name },
          { $set: { defaultTeam: team._id } }
        );
      }
    }

    // 2. Link Team -> categories array
    for (const [teamName, teamDoc] of teamMap.entries()) {
      const matchingCategoryIds = CATEGORIES_DATA
        .filter((c) => c.defaultTeamName === teamName)
        .map((c) => categoryMap.get(c.name)?._id)
        .filter(Boolean);

      await Team.findByIdAndUpdate(teamDoc._id, {
        $set: { categories: matchingCategoryIds },
      });
    }

    console.log(`[Seed] Successfully linked Category.defaultTeam and Team.categories.`);
    console.log(`[Seed] Seeding completed successfully.`);
  } catch (err) {
    console.error(`[Seed Error] Seeding failed:`, err);
    throw err;
  } finally {
    await mongoose.disconnect();
    console.log(`[Seed] Database connection closed.`);
  }
}

// Execute standalone if invoked directly
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
