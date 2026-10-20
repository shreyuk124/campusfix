// features/issues/issuesService.js - In-memory and localStorage issue management service
import { INITIAL_ISSUES } from './mockIssuesData';

const STORAGE_KEY = 'campusfix_mock_issues_v1';

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
   * Filter, search, sort and paginate issues
   */
  async getIssues({
    page = 1,
    limit = 10,
    search = '',
    building = 'all',
    category = 'all',
    status = 'all',
    priority = 'all',
    sort = 'newest',
    tab = 'all', // 'all', 'my-active', 'my-awaiting', 'my-closed'
    simulateDelay = 250,
    forceError = false,
  } = {}) {
    if (simulateDelay) {
      await new Promise((res) => setTimeout(res, simulateDelay));
    }

    if (forceError) {
      throw new Error('Simulated network error while fetching issues');
    }

    let items = this.getAllLocalIssues();

    // Tab filter for My Issues
    if (tab === 'my-active') {
      items = items.filter(
        (item) => (item.isReporter || item.hasJoined) && ['Reported', 'Assigned', 'In Progress', 'Reopened'].includes(item.status)
      );
    } else if (tab === 'my-awaiting') {
      items = items.filter(
        (item) => item.status === 'Resolved' && (item.isReporter || item.hasJoined)
      );
    } else if (tab === 'my-closed') {
      items = items.filter(
        (item) => (item.isReporter || item.hasJoined) && ['Closed', 'Rejected', 'Merged'].includes(item.status)
      );
    }

    // Search query filter
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.referenceId.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.building.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    // Building filter
    if (building && building !== 'all') {
      items = items.filter((item) => item.building === building);
    }

    // Category filter
    if (category && category !== 'all') {
      items = items.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Status filter
    if (status && status !== 'all') {
      items = items.filter((item) => item.status.toLowerCase() === status.toLowerCase());
    }

    // Priority filter
    if (priority && priority !== 'all') {
      items = items.filter((item) => item.priority.toLowerCase() === priority.toLowerCase());
    }

    // Sorting
    items.sort((a, b) => {
      if (sort === 'most-affected') {
        return (b.affectedCount || 0) - (a.affectedCount || 0);
      }
      if (sort === 'highest-priority') {
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      }
      if (sort === 'due-soon') {
        const timeA = a.slaDeadline ? new Date(a.slaDeadline).getTime() : Infinity;
        const timeB = b.slaDeadline ? new Date(b.slaDeadline).getTime() : Infinity;
        return timeA - timeB;
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
  async getById(id, { simulateDelay = 200 } = {}) {
    if (simulateDelay) {
      await new Promise((res) => setTimeout(res, simulateDelay));
    }
    const issues = this.getAllLocalIssues();
    const cleanId = String(id).toLowerCase().replace('#', '');
    const found = issues.find(
      (item) =>
        item.id.toLowerCase() === cleanId ||
        item.referenceId.toLowerCase() === cleanId
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
    const index = issues.findIndex(
      (item) => item.id.toLowerCase() === cleanId || item.referenceId.toLowerCase() === cleanId
    );
    if (index === -1) throw new Error('Issue not found');

    const issue = { ...issues[index] };
    const nowJoined = !issue.hasJoined;
    issue.hasJoined = nowJoined;
    issue.affectedCount = Math.max(1, (issue.affectedCount || 1) + (nowJoined ? 1 : -1));

    // Update score recalculation factor slightly
    if (issue.priorityScore) {
      issue.priorityScore = Math.min(99, Math.max(10, issue.priorityScore + (nowJoined ? 2 : -2)));
    }

    issues[index] = issue;
    this.saveIssues(issues);
    return issue;
  }

  /**
   * Confirm issue is fixed (Resolved -> Closed)
   */
  async confirmFixed(id, note = 'Student confirmed repair is satisfactory.') {
    const issues = this.getAllLocalIssues();
    const cleanId = String(id).toLowerCase();
    const index = issues.findIndex(
      (item) => item.id.toLowerCase() === cleanId || item.referenceId.toLowerCase() === cleanId
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
      actor: { name: 'A student', role: 'student' }, // Reporter identity masked per privacy rules
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
    const index = issues.findIndex(
      (item) => item.id.toLowerCase() === cleanId || item.referenceId.toLowerCase() === cleanId
    );
    if (index === -1) throw new Error('Issue not found');

    const issue = { ...issues[index] };
    issue.status = 'Reopened';
    issue.updatedAt = new Date().toISOString();
    // Prioritize reopened issues (+10 points per PRD rules)
    issue.priorityScore = Math.min(99, (issue.priorityScore || 50) + 10);

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
   * Admin / Staff: Update status
   */
  async updateStatus(id, newStatus, note = '', staffName = 'Staff Member') {
    const issues = this.getAllLocalIssues();
    const cleanId = String(id).toLowerCase();
    const index = issues.findIndex(
      (item) => item.id.toLowerCase() === cleanId || item.referenceId.toLowerCase() === cleanId
    );
    if (index === -1) throw new Error('Issue not found');

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
   * Admin: Assign to team & set priority
   */
  async assignIssue(id, team, staffName = '', priorityOverride = null) {
    const issues = this.getAllLocalIssues();
    const cleanId = String(id).toLowerCase();
    const index = issues.findIndex(
      (item) => item.id.toLowerCase() === cleanId || item.referenceId.toLowerCase() === cleanId
    );
    if (index === -1) throw new Error('Issue not found');

    const issue = { ...issues[index] };
    issue.assignedTeam = team;
    if (staffName) issue.assignedStaff = staffName;
    if (issue.status === 'Reported') issue.status = 'Assigned';
    if (priorityOverride) issue.priority = priorityOverride;
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
