// lib/constants.js - Single source of truth for CampusFix

export const STATUSES = [
  'Reported',
  'Assigned',
  'In Progress',
  'Resolved',
];

export const STATUS_CONFIG = {
  Reported: {
    label: 'Reported',
    text: '#475569',
    bg: '#EEF2F7',
    border: '#CBD5E1',
    icon: 'CircleDot',
    description: 'Issue has been submitted and is awaiting review.',
  },
  Assigned: {
    label: 'Assigned',
    text: '#0369A1',
    bg: '#E0F2FE',
    border: '#BAE6FD',
    icon: 'UserCheck',
    description: 'Assigned to maintenance team.',
  },
  'In Progress': {
    label: 'In Progress',
    text: '#4338CA',
    bg: '#E8EAFD',
    border: '#C7D2FE',
    icon: 'Wrench',
    description: 'Technician is actively working on the fix.',
  },
  Resolved: {
    label: 'Resolved',
    text: '#0F766E',
    bg: '#DDF5F2',
    border: '#A7E3DC',
    icon: 'CheckCircle2',
    description: 'Work completed. Awaiting confirmation from reporter.',
  },
};

export const PRIORITY_BANDS = [
  { key: 'low', label: 'Low', min: 0, max: 29, slaHours: 168, fg: '#15803D', bg: '#E4F6EA', dot: '#22A559' },
  { key: 'medium', label: 'Medium', min: 30, max: 54, slaHours: 72, fg: '#8A6A00', bg: '#FFF5CC', dot: '#E0B000' },
  { key: 'high', label: 'High', min: 55, max: 74, slaHours: 24, fg: '#B8500A', bg: '#FFE9D6', dot: '#ED7D1E' },
  { key: 'critical', label: 'Critical', min: 75, max: Infinity, slaHours: 4, fg: '#FFFFFF', bg: '#D92D20', dot: '#D92D20' },
];

export const CATEGORIES = [
  { key: 'Safety', label: 'Safety & Security', id: 'safety', icon: 'Safety' },
  { key: 'Electrical', label: 'Electrical', id: 'electrical', icon: 'Electrical' },
  { key: 'Plumbing', label: 'Water & Plumbing', id: 'plumbing', icon: 'Plumbing' },
  { key: 'Internet', label: 'Wi-Fi & Network', id: 'wifi', icon: 'Wifi' },
  { key: 'Equipment', label: 'Equipment & Labs', id: 'equipment', icon: 'Equipment' },
  { key: 'Cleanliness', label: 'Sanitation & Hygiene', id: 'sanitation', icon: 'Sanitation' },
  { key: 'Furniture', label: 'Furniture & Fixtures', id: 'furniture', icon: 'Furniture' },
  { key: 'Other', label: 'Other', id: 'other', icon: 'Other' },
];

// COEP Technological University - Campus Buildings & Facilities
export const CAMPUS_BUILDINGS = [
  'Main Heritage Building',
  'Academic Complex',
  'Computer Engineering & IT Building',
  'Mechanical Engineering Building',
  'Electrical Engineering Building',
  'Civil Engineering Building',
  'Electronics & Telecommunication (E&TC) Building',
  'Metallurgy & Materials Science Building',
  'Instrumentation & Control Building',
  'Manufacturing & Production Engineering Building',
  'Applied Mechanics Building',
  'Bhau Institute of Innovation',
  'Central Library',
  'Main Auditorium',
  'Boat Club',
  'COEP Gymkhana & Ground',
  'COEP Canteen / Meta Canteen',
  'North Academic Block',
  'South Academic Block',
  'Student Activity Centre',
  'Campus Dining Hall',
];

export const MAX_REPORTS_PER_DAY = 10;
export const MAX_IMAGES = 3;
export const AUTO_CLOSE_HOURS = 72;
