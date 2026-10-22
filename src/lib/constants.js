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
  Closed: {
    label: 'Closed',
    text: '#334155',
    bg: '#E2E8F0',
    border: '#CBD5E1',
    icon: 'Archive',
    description: 'Issue verified and closed.',
  },
  Reopened: {
    label: 'Reopened',
    text: '#B42318',
    bg: '#FDECEA',
    border: '#F7C1BB',
    icon: 'RotateCcw',
    description: 'Issue was reopened because problem persists.',
  },
  Rejected: {
    label: 'Rejected',
    text: '#6B7280',
    bg: '#F1F2F4',
    border: '#E5E7EB',
    icon: 'XCircle',
    description: 'Issue declined with explanation.',
  },
  Merged: {
    label: 'Merged',
    text: '#7C3AED',
    bg: '#F1EBFD',
    border: '#DDD6FE',
    icon: 'GitMerge',
    description: 'Duplicate merged into another primary report.',
  },
};

export const PRIORITY_BANDS = [
  { key: 'low', label: 'Low', min: 0, max: 29, slaHours: 168, fg: '#15803D', bg: '#E4F6EA', dot: '#22A559' },
  { key: 'medium', label: 'Medium', min: 30, max: 54, slaHours: 72, fg: '#8A6A00', bg: '#FFF5CC', dot: '#E0B000' },
  { key: 'high', label: 'High', min: 55, max: 74, slaHours: 24, fg: '#B8500A', bg: '#FFE9D6', dot: '#ED7D1E' },
  { key: 'critical', label: 'Critical', min: 75, max: Infinity, slaHours: 4, fg: '#FFFFFF', bg: '#D92D20', dot: '#D92D20' },
];

export const CATEGORIES = [
  { key: 'Plumbing', label: 'Plumbing', icon: 'Droplets' },
  { key: 'Electrical', label: 'Electrical', icon: 'Zap' },
  { key: 'Cleanliness', label: 'Cleanliness', icon: 'Sparkles' },
  { key: 'Internet', label: 'Internet / Wi-Fi', icon: 'Wifi' },
  { key: 'Furniture', label: 'Furniture', icon: 'Armchair' },
  { key: 'Safety', label: 'Safety Hazard', icon: 'ShieldAlert' },
  { key: 'Other', label: 'Other', icon: 'CircleHelp' },
];

export const CAMPUS_BUILDINGS = [
  'Main Academic Building',
  'North Academic Block',
  'South Academic Block',
  'Hostel Block A (Boys)',
  'Hostel Block B (Boys)',
  'Hostel Block C (Girls)',
  'Central Library',
  'Student Activity Centre',
  'Sports Complex & Gym',
  'Mechanical Workshop',
  'Campus Dining Hall',
];

export const MAX_REPORTS_PER_DAY = 10;
export const MAX_IMAGES = 3;
export const AUTO_CLOSE_HOURS = 72;
