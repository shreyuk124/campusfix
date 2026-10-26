// features/issues/issuesService.js - Live API & LocalStorage synchronization service
import { INITIAL_ISSUES } from './mockIssuesData';
import { issuesApi } from '../../api/issues';

const STORAGE_KEY = 'campusfix_coep_issues_v2';

/**
 * Normalizes an API issue document into a consistent frontend issue shape.
 */
function normalizeIssue(doc) {
  if (!doc) return null;
  const id = String(doc._id || doc.id || doc.refId);
  const refId = doc.refId || doc.referenceId || `CF-${id.slice(-5)}`;

  return {
    _id: id,
    id,
    referenceId: refId,
    title: doc.title || doc.description?.slice(0, 60) || 'Untitled Issue',
    description: doc.description || '',
    category:
      doc.category?.name ||
      doc.category?.label ||
      (typeof doc.category === 'string' ? doc.category : 'General'),
    campus: doc.campus || doc.building?.campus || 'north',
    building:
      doc.building?.name ||
      (typeof doc.building === 'string' ? doc.building : 'Campus Building'),
    location:
      doc.locationText ||
      doc.location ||
      doc.building?.name ||
      'Campus Location',
    status: doc.status || 'Reported',
    affectedCount: doc.reportCount ?? doc.affectedCount ?? 1,
    hasJoined: Boolean(doc.hasJoined),
    isReporter: Boolean(doc.isReporter),
    isHotspot: Boolean(doc.isHotspot),
    assignedTeam:
      doc.assignedTeam?.name ||
      (typeof doc.assignedTeam === 'string' && doc.assignedTeam !== ''
        ? doc.assignedTeam
        : 'Unassigned'),
    assignedStaff: doc.assignedStaff || '',
    resolutionNote: doc.resolutionNote || '',
    resolvedAt: doc.resolvedAt || null,
    closedAt: doc.closedAt || null,
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || doc.createdAt || new Date().toISOString(),
    photos: Array.isArray(doc.photos) ? doc.photos : [],
    timeline: Array.isArray(doc.timeline)
      ? doc.timeline
      : [
          {
            id: `tl-${id}`,
            type: 'status_change',
            fromStatus: null,
            toStatus: doc.status || 'Reported',
            actor: { name: 'Campus Reporter', role: 'student' },
            note: 'Reported on CampusFix.',
            timestamp: doc.createdAt || new Date().toISOString(),
          },
        ],
  };
}

class IssuesService {
  constructor() {
    this.init();
  }

  init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ISSUES));
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }

  getAllLocalIssues() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading localStorage issues:', e);
    }
    return [...INITIAL_ISSUES];
  }

  saveIssues(issues) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    } catch (e) {
      console.error('Error saving issues to localStorage:', e);
    }
  }

  /**
   * Synchronizes latest issues from MongoDB Atlas backend into localStorage.
   */
  async syncWithBackend() {
    try {
      const res = await issuesApi.getAll({ limit: 100 });
      const apiIssues = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      if (apiIssues && apiIssues.length > 0) {
        const local = this.getAllLocalIssues();
        const localMap = new Map();
        local.forEach((item) => {
          if (item.id) localMap.set(String(item.id).toLowerCase(), item);
          if (item._id) localMap.set(String(item._id).toLowerCase(), item);
          if (item.referenceId)
            localMap.set(String(item.referenceId).toLowerCase(), item);
          if (item.title)
            localMap.set(String(item.title).toLowerCase().trim(), item);
        });

        const normalized = apiIssues.map((doc) => {
          const norm = normalizeIssue(doc);
          const existing =
            localMap.get(norm.id.toLowerCase()) ||
            localMap.get(norm.referenceId.toLowerCase()) ||
            localMap.get(norm.title.toLowerCase().trim());
          if (existing) {
            norm.hasJoined = existing.hasJoined || false;
            norm.isReporter = existing.isReporter || false;
            if (existing.assignedStaff)
              norm.assignedStaff = existing.assignedStaff;
            if (existing.timeline && existing.timeline.length > 1) {
              norm.timeline = existing.timeline;
            }
          }
          return norm;
        });

        // When MongoDB Atlas is connected, use real live issues as source of truth
        this.saveIssues(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('[issuesService] Backend sync notice:', err.message);
    }
    return this.getAllLocalIssues();
  }

  /**
   * Filter, search, sort and paginate issues
   */
  async getIssues({
    page = 1,
    limit = 10,
    search = '',
    building = 'all',
    category = 'all',
    status = 'all',
    sort = 'newest',
    tab = 'all', // 'all', 'my-active', 'my-resolved', 'my-closed'
    simulateDelay = 100,
    forceError = false,
  } = {}) {
    if (simulateDelay) {
      await new Promise((res) => setTimeout(res, simulateDelay));
    }

    if (forceError) {
      throw new Error('Simulated network error while fetching issues');
    }

    // Sync from live MongoDB Atlas backend
    let items = await this.syncWithBackend();

    // Tab filter for My Issues
    if (tab === 'my-active') {
      items = items.filter(
        (item) =>
          (item.isReporter || item.hasJoined) &&
          ['Reported', 'Assigned', 'In Progress', 'Reopened'].includes(
            item.status
          )
      );
    } else if (
      tab === 'my-resolved' ||
      tab === 'my-closed' ||
      tab === 'my-awaiting'
    ) {
      items = items.filter(
        (item) =>
          (item.isReporter || item.hasJoined) &&
          ['Resolved', 'Closed', 'Rejected', 'Merged'].includes(item.status)
      );
    }

    // Search query filter
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.referenceId?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q) ||
          item.building?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    }

    // Building filter
    if (building && building !== 'all') {
      items = items.filter((item) => item.building === building);
    }

    // Category filter
    if (category && category !== 'all') {
      items = items.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Status filter
    if (status && status !== 'all') {
      items = items.filter(
        (item) => item.status?.toLowerCase() === status.toLowerCase()
      );
    }

    // Sorting
    items.sort((a, b) => {
      if (sort === 'most-affected') {
        return (b.affectedCount || 0) - (a.affectedCount || 0);
      }
      if (sort === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      // Default: 'newest'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      issues: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Fetch single issue by ID or reference ID
   */
  async getById(id, { simulateDelay = 100 } = {}) {
    if (simulateDelay) {
      await new Promise((res) => setTimeout(res, simulateDelay));
    }

    // Try fetching fresh data from backend API first
    try {
      const res = await issuesApi.getById(id);
      const apiDoc = res?.data || res;
      if (apiDoc && (apiDoc._id || apiDoc.refId)) {
        const normalized = normalizeIssue(apiDoc);
        const issues = this.getAllLocalIssues();
        const cleanId = String(id).toLowerCase().replace('#', '');
        const existing = issues.find(
          (i) =>
            i.id.toLowerCase() === cleanId ||
            i.referenceId?.toLowerCase() === cleanId
        );
        if (existing) {
          normalized.hasJoined = existing.hasJoined || false;
          normalized.isReporter = existing.isReporter || false;
          if (existing.assignedStaff)
            normalized.assignedStaff = existing.assignedStaff;
        }
        return normalized;
      }
    } catch {
      // Fallback to local storage
    }

    const issues = this.getAllLocalIssues();
    const cleanId = String(id).toLowerCase().replace('#', '');
    const found = issues.find(
      (item) =>
        item.id.toLowerCase() === cleanId ||
        item.referenceId?.toLowerCase() === cleanId
    );
    if (!found) {
      throw new Error(`Issue not found with ID ${id}`);
    }
    return found;
  }

  /**
   * Toggle "+1 I am affected too"
   */
  async toggleJoinIssue(id) {
    const issues = this.getAllLocalIssues();
    const cleanId = String(id).toLowerCase();
    const target = issues.find(
      (item) =>
        item.id.toLowerCase() === cleanId ||
        item.referenceId?.toLowerCase() === cleanId
    );

    const apiTargetId = target?._id || target?.id || target?.referenceId || id;

    // 1. Call real backend API to increment report count in MongoDB Atlas
    try {
      await issuesApi.upvote(apiTargetId);
    } catch (e) {
      console.warn('[issuesService] Backend upvote notice:', e.message);
    }

    // 2. Update local state
    const index = issues.findIndex(
      (item) =>
        item.id.toLowerCase() === cleanId ||
        item.referenceId?.toLowerCase() === cleanId
    );
    if (index === -1) throw new Error('Issue not found');

    const issue = { ...issues[index] };
    const nowJoined = !issue.hasJoined;
    issue.hasJoined = nowJoined;
    issue.affectedCount = Math.max(
      1,
      (issue.affectedCount || 1) + (nowJoined ? 1 : -1)
    );

    issues[index] = issue;
    this.saveIssues(issues);
    return issue;
  }

  /**
   * Create a new issue report and persist to local storage
   */
  async createIssue({
    _id,
    id,
    referenceId,
    title,
    description,
    category,
    campus = 'south',
    building,
    location,
    photos = [],
    isAnonymous = false,
  }) {
    const issues = this.getAllLocalIssues();
    const count = issues.length + 1;
    const realId = String(_id || id || `cf-${Date.now()}`);
    const realRefId = referenceId || `CF-${realId.slice(-5)}`;

    // Extract photo URLs
    const photoUrls = (photos || [])
      .map((p) => {
        if (typeof p === 'string') return p;
        return p.previewUrl || '';
      })
      .filter(Boolean);

    const newIssue = {
      _id: realId,
      id: realId,
      referenceId: realRefId,
      title: title || description.slice(0, 60).trim(),
      description: description.trim(),
      category: category || 'Other',
      campus: campus || 'south',
      building: building || 'Campus Center',
      location: location || building || 'Main Campus',
      status: 'Reported',
      isSafetyRisk: false,
      isHotspot: false,
      affectedCount: 1,
      hasJoined: false,
      isReporter: true,
      assignedTeam: 'Unassigned',
      assignedStaff: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photos: photoUrls,
      timeline: [
        {
          id: `tl-${realId}`,
          type: 'status_change',
          fromStatus: null,
          toStatus: 'Reported',
          actor: {
            name: isAnonymous ? 'Anonymous Student' : 'You (Reporter)',
            role: 'student',
          },
          note: `Issue reported${
            photoUrls.length ? ` with ${photoUrls.length} photo attachment(s)` : ''
          }.`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    issues.unshift(newIssue);
    this.saveIssues(issues);
    return newIssue;
  }

  /**
   * Confirm issue is fixed (Resolved -> Closed)
   */
  async confirmFixed(id, note = 'Student confirmed repair is satisfactory.') {
    const issues = this.getAllLocalIssues();
    const cleanId = String(id).toLowerCase();
    const target = issues.find(
      (item) =>
        item.id.toLowerCase() === cleanId ||
        item.referenceId?.toLowerCase() === cleanId
    );

    const apiTargetId = target?._id || target?.id || target?.referenceId || id;

    try {
      await issuesApi.updateStatus(apiTargetId, 'Closed', note);
    } catch (e) {
      console.warn('[issuesService] Backend close notice:', e.message);
    }

    const index = issues.findIndex(
      (item) =>
        item.id.toLowerCase() === cleanId ||
        item.referenceId?.toLowerCase() === cleanId
    );
    if (index === -1) throw new Error('Issue not found');

    const issue = { ...issues[index] };
    issue.status = 'Closed';
    issue.updatedAt = new Date().toISOString();

    const timelineEntry = {
      id: `tl-${Date.now()}`,
      type: 'status_change',
      fromStatus: 'Resolved',
      toStatus: 'Closed',
      actor: { name: 'A student', role: 'student' },
      note: note || 'Student verified the resolution.',
      timestamp: new Date().toISOString(),
    };

    issue.timeline = [...(issue.timeline || []), timelineEntry];
    issues[index] = issue;
    this.saveIssues(issues);
    return issue;
  }

  /**
   * Reopen issue (Resolved -> Reopened)
   */
  async reopenIssue(id, reason) {
    if (!reason || !reason.trim()) {
      throw new Error('A reason is required to reopen an issue.');
    }

    const issues = this.getAllLocalIssues();
    const cleanId = String(id).toLowerCase();
    const target = issues.find(
      (item) =>
        item.id.toLowerCase() === cleanId ||
        item.referenceId?.toLowerCase() === cleanId
    );

    const apiTargetId = target?._id || target?.id || target?.referenceId || id;

    try {
      await issuesApi.updateStatus(apiTargetId, 'Reopened', reason);
    } catch (e) {
      console.warn('[issuesService] Backend reopen notice:', e.message);
    }

    const index = issues.findIndex(
      (item) =>
        item.id.toLowerCase() === cleanId ||
        item.referenceId?.toLowerCase() === cleanId
    );
    if (index === -1) throw new Error('Issue not found');

    const issue = { ...issues[index] };
    issue.status = 'Reopened';
    issue.updatedAt = new Date().toISOString();

    const timelineEntry = {
      id: `tl-${Date.now()}`,
      type: 'status_change',
      fromStatus: 'Resolved',
      toStatus: 'Reopened',
      actor: { name: 'A student', role: 'student' },
      note: `Reopened by student: ${reason.trim()}`,
      timestamp: new Date().toISOString(),
    };

    issue.timeline = [...(issue.timeline || []), timelineEntry];
    issues[index] = issue;
    this.saveIssues(issues);
    return issue;
  }

  /**
   * Admin / Staff: Update status and persist to MongoDB Atlas
   */
  async updateStatus(id, newStatus, note = '', staffName = 'Staff Member') {
    const issues = this.getAllLocalIssues();
    const cleanId = String(id).toLowerCase();
    const target = issues.find(
      (item) =>
        item.id.toLowerCase() === cleanId ||
        item.referenceId?.toLowerCase() === cleanId
    );

    // Identify real MongoDB ID to send to backend
    const apiTargetId = target?._id || target?.id || target?.referenceId || id;

    // Step 1: Update in real MongoDB Atlas backend
    try {
      await issuesApi.updateStatus(apiTargetId, newStatus, note);
    } catch (apiErr) {
      console.warn('[issuesService] Backend status update notice:', apiErr.message);
    }

    // Step 2: Update local cache so UI reacts immediately
    const index = issues.findIndex(
      (item) =>
        item.id.toLowerCase() === cleanId ||
        item.referenceId?.toLowerCase() === cleanId
    );
    if (index === -1) {
      return { id, status: newStatus, resolutionNote: note };
    }

    const issue = { ...issues[index] };
    const oldStatus = issue.status;
    issue.status = newStatus;
    issue.updatedAt = new Date().toISOString();

    if (newStatus === 'Resolved') {
      issue.resolutionNote = note || 'Issue resolved by maintenance staff.';
      issue.resolvedAt = new Date().toISOString();
    }

    const timelineEntry = {
      id: `tl-${Date.now()}`,
      type: 'status_change',
      fromStatus: oldStatus,
      toStatus: newStatus,
      actor: { name: staffName, role: 'staff' },
      note: note || `Status updated from ${oldStatus} to ${newStatus}.`,
      timestamp: new Date().toISOString(),
    };

    issue.timeline = [...(issue.timeline || []), timelineEntry];
    issues[index] = issue;
    this.saveIssues(issues);
    return issue;
  }

  /**
   * Admin: Assign to team and persist to MongoDB Atlas
   */
  async assignIssue(id, team, staffName = '') {
    const issues = this.getAllLocalIssues();
    const cleanId = String(id).toLowerCase();
    const target = issues.find(
      (item) =>
        item.id.toLowerCase() === cleanId ||
        item.referenceId?.toLowerCase() === cleanId
    );

    const apiTargetId = target?._id || target?.id || target?.referenceId || id;

    // Step 1: Update in real MongoDB Atlas backend
    try {
      await issuesApi.assignTeam(apiTargetId, team, staffName);
    } catch (apiErr) {
      console.warn('[issuesService] Backend assign notice:', apiErr.message);
    }

    // Step 2: Update local cache so UI reacts immediately
    const index = issues.findIndex(
      (item) =>
        item.id.toLowerCase() === cleanId ||
        item.referenceId?.toLowerCase() === cleanId
    );
    if (index === -1) {
      return { id, assignedTeam: team, status: 'Assigned' };
    }

    const issue = { ...issues[index] };
    issue.assignedTeam = team;
    if (staffName) issue.assignedStaff = staffName;
    if (issue.status === 'Reported') issue.status = 'Assigned';
    issue.updatedAt = new Date().toISOString();

    const timelineEntry = {
      id: `tl-${Date.now()}`,
      type: 'status_change',
      fromStatus: 'Reported',
      toStatus: 'Assigned',
      actor: { name: 'Campus Admin', role: 'admin' },
      note: `Assigned to ${team}${staffName ? ` (${staffName})` : ''}.`,
      timestamp: new Date().toISOString(),
    };

    issue.timeline = [...(issue.timeline || []), timelineEntry];
    issues[index] = issue;
    this.saveIssues(issues);
    return issue;
  }

  /**
   * Reset data to initial seed
   */
  resetData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ISSUES));
    return [...INITIAL_ISSUES];
  }
}

export const issuesService = new IssuesService();
export default issuesService;
