/**
 * Realistic Mock Dataset of Active Campus Issues at COEP
 * 
 * Used for client-side early duplicate interception testing.
 * When a student selects a matching Building + Category, these issues appear.
 */
export const MOCK_EXISTING_ISSUES = [
  {
    id: 'CF-1042',
    title: 'Water cooler leaking and pooling water on floor',
    category: 'plumbing',
    campus: 'north',
    building: 'Academic Complex',
    specificLocation: '3rd Floor, near Lab 304',
    status: 'progress', // In Progress
    statusLabel: 'In Progress',
    affectedCount: 6,
    reportedAt: '45 mins ago',
  },
  {
    id: 'CF-1039',
    title: 'Ceiling projector not powering on / damaged HDMI port',
    category: 'electrical',
    campus: 'north',
    building: 'Computer Engineering & IT Building',
    specificLocation: 'Ground Floor, Class Lab 102',
    status: 'assigned', // Assigned to technician
    statusLabel: 'Assigned to Tech',
    affectedCount: 14,
    reportedAt: '2 hours ago',
  },
  {
    id: 'CF-1025',
    title: 'Tube light flickering violently near blackboard',
    category: 'electrical',
    campus: 'south',
    building: 'Main Heritage Building',
    specificLocation: '1st Floor, Room 12',
    status: 'reported',
    statusLabel: 'Reported',
    affectedCount: 3,
    reportedAt: 'Yesterday',
  },
  {
    id: 'CF-1018',
    title: 'Broken desk bench with exposed sharp metal edge',
    category: 'furniture',
    campus: 'south',
    building: 'Electrical Engineering Building',
    specificLocation: '2nd Floor, Room 208',
    status: 'reported',
    statusLabel: 'Reported',
    affectedCount: 2,
    reportedAt: '2 days ago',
  },
];