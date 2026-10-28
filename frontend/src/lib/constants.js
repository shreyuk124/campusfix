// lib/constants.js - Single source of truth for CampusFix

export const STATUSES = [
  'Reported',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
  'Reopened',
  'Rejected',
  'Merged',
];

export const STATUS_CONFIG = {
  Reported: {
    label: 'Reported',
    text: '#475569',
    bg: '#F1F5F9',
    border: '#CBD5E1',
    icon: 'CircleDot',
    description: 'Issue has been submitted and is awaiting review.',
  },
  Assigned: {
    label: 'Assigned',
    text: '#FFFFFF',
    bg: '#1D64EC',
    border: '#1D64EC',
    icon: 'UserCheck',
    description: 'Assigned to maintenance team.',
  },
  'In Progress': {
    label: 'In Progress',
    text: '#FFFFFF',
    bg: '#1D64EC',
    border: '#1D64EC',
    icon: 'Wrench',
    description: 'Technician is actively working on the fix.',
  },
  Resolved: {
    label: 'Resolved',
    text: '#FFFFFF',
    bg: '#10B981',
    border: '#10B981',
    icon: 'CheckCircle2',
    description: 'Work completed. Awaiting confirmation from reporter.',
  },
  Closed: {
    label: 'Closed',
    text: '#64748B',
    bg: '#F1F5F9',
    border: '#CBD5E1',
    icon: 'Archive',
    description: 'Issue verified and closed.',
  },
  Reopened: {
    label: 'Reopened',
    text: '#FFFFFF',
    bg: '#EF4444',
    border: '#EF4444',
    icon: 'RotateCcw',
    description: 'Issue was reopened because problem persists.',
  },
  Rejected: {
    label: 'Rejected',
    text: '#64748B',
    bg: '#F1F5F9',
    border: '#E2E8F0',
    icon: 'XCircle',
    description: 'Issue declined with explanation.',
  },
  Merged: {
    label: 'Merged',
    text: '#FFFFFF',
    bg: '#7C3AED',
    border: '#7C3AED',
    icon: 'GitMerge',
    description: 'Duplicate merged into another primary report.',
  },
};

export const PRIORITY_BANDS = [
  { key: 'low', label: 'Low Priority', min: 0, max: 29, slaHours: 168, fg: '#475569', bg: '#F1F5F9', dot: '#94A3B8' },
  { key: 'medium', label: 'Medium Priority', min: 30, max: 54, slaHours: 72, fg: '#334155', bg: '#F1F5F9', dot: '#64748B' },
  { key: 'high', label: 'High Priority', min: 55, max: 74, slaHours: 24, fg: '#FFFFFF', bg: '#EA580C', dot: '#FFFFFF' },
  { key: 'critical', label: 'Critical Priority', min: 75, max: Infinity, slaHours: 4, fg: '#FFFFFF', bg: '#EF4444', dot: '#FFFFFF' },
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
