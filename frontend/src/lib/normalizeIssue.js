/**
 * Shared Issue Normalizer
 * Bridges backend API models and mock datasets to the canonical shape expected by IssueCard,
 * Dashboard, and Feed.
 */
export function normalizeIssue(raw, index = 0) {
  if (!raw) return null;

  const rawBuilding = raw.building?.name || raw.building || 'Campus Facility';
  const inferredCampus = raw.campus || 'Campus';

  return {
    id: String(raw.id || raw._id || `cf-${index + 1}`),
    referenceId:
      raw.referenceId || `CF-2026-${String(index + 1).padStart(4, '0')}`,
    title: raw.title || raw.description?.substring(0, 50) || 'Untitled issue',
    description: raw.description || '',
    category: raw.category || 'General Maintenance',
    campus: inferredCampus,
    building: rawBuilding,
    location: raw.locationText || raw.location || 'Campus Location',
    status: raw.status || 'Reported',
    priority: raw.priorityBand || raw.priority || 'Medium',
    priorityScore: raw.priorityScore ?? 50,
    affectedCount: raw.affectedCount ?? raw.reportCount ?? 1,
    hasJoined: Boolean(raw.hasJoined),
    isReporter: Boolean(raw.isReporter),
    isHotspot: Boolean(raw.isHotspot),
    isSafetyRisk: Boolean(raw.isSafetyRisk),
    assignedTeam:
      raw.assignedTeam?.name ||
      raw.assignedTeam ||
      raw.team?.name ||
      raw.team ||
      'Unassigned',
    assignedStaff: raw.assignedStaff || null,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
    slaDeadline: raw.slaDeadline || null,
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
    resolutionNote: raw.resolutionNote || null,
    priorityBreakdown: raw.priorityBreakdown || null,
  };
}

export default normalizeIssue;
