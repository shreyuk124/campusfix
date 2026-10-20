import api from '../lib/axios';

const USE_MOCK_API =
  import.meta.env.VITE_USE_MOCK_API === 'true' ||
  import.meta.env.VITE_USE_MOCK_API === undefined;

export const mockCategories = [
  { _id: 'cat-plumbing', name: 'Plumbing' },
  { _id: 'cat-electrical', name: 'Electrical' },
  { _id: 'cat-internet', name: 'Internet / Wi-Fi' },
  { _id: 'cat-furniture', name: 'Furniture' },
  { _id: 'cat-cleanliness', name: 'Cleanliness' },
  { _id: 'cat-other', name: 'Other' },
];

export const mockBuildings = [
  { _id: 'building-a', name: 'Block A (Academic)', campus: 'College', floors: [1, 2, 3, 4] },
  { _id: 'building-b', name: 'Block B (Academic)', campus: 'College', floors: [1, 2, 3] },
  { _id: 'library', name: 'Central Library', campus: 'College', floors: [0, 1, 2] },
  { _id: 'hostel-boys', name: 'Boys Hostel Block 1', campus: 'Hostel', floors: [1, 2, 3, 4] },
  { _id: 'hostel-girls', name: 'Girls Hostel Block 2', campus: 'Hostel', floors: [1, 2, 3, 4] },
  { _id: 'hostel-mess', name: 'Hostel Dining / Mess Hall', campus: 'Hostel', floors: [1, 2] },
];

export const mockSimilarIssues = [
  {
    _id: 'mock-issue-1',
    id: 'mock-issue-1',
    refId: 'CF-2026-0031',
    title: 'Water leakage near Block A washroom',
    locationText: '2nd Floor, Washroom',
    reportCount: 8,
    status: 'In Progress',
    createdAt: '2026-10-17T10:00:00.000Z',
    similarityScore: 0.72,
  },
  {
    _id: 'mock-issue-2',
    id: 'mock-issue-2',
    refId: 'CF-2026-0028',
    title: 'Water leakage near Block A corridor',
    locationText: '2nd Floor, Near washroom',
    reportCount: 4,
    status: 'Reported',
    createdAt: '2026-10-18T10:00:00.000Z',
    similarityScore: 0.36,
  },
];

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response;
}

export async function getCategories() {
  if (USE_MOCK_API) return mockCategories;

  try {
    const response = await api.get('/categories');
    return unwrap(response);
  } catch (error) {
    console.warn('Could not fetch categories from API, using fallback data:', error);
    return mockCategories;
  }
}

export async function getBuildings() {
  if (USE_MOCK_API) return mockBuildings;

  try {
    const response = await api.get('/buildings');
    return unwrap(response);
  } catch (error) {
    console.warn('Could not fetch buildings from API, using fallback data:', error);
    return mockBuildings;
  }
}

export async function findSimilarIssues(params) {
  if (USE_MOCK_API) {
    const hasSearchText =
      params.locationText?.trim() ||
      params.description?.trim();

    return hasSearchText ? mockSimilarIssues : [];
  }

  try {
    const response = await api.get('/issues/similar', { params });
    return unwrap(response);
  } catch (error) {
    console.warn('Could not check similar issues from API, using mock detection:', error);
    const hasSearchText =
      params.locationText?.trim() ||
      params.description?.trim();
    return hasSearchText ? mockSimilarIssues : [];
  }
}

export async function uploadImages(files) {
  if (USE_MOCK_API) {
    return files.map(
      (file) => `mock://uploaded/${encodeURIComponent(file.name)}`
    );
  }

  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = unwrap(response);

    return data.images ?? data.urls ?? [];
  } catch (error) {
    console.warn('Upload API failed, simulating upload:', error);
    return files.map(
      (file) => `mock://uploaded/${encodeURIComponent(file.name)}`
    );
  }
}

export async function createIssue(payload) {
  if (USE_MOCK_API) {
    return {
      _id: 'mock-new-issue',
      id: 'mock-new-issue',
      refId: `CF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      ...payload,
      status: 'Reported',
      reportCount: 1,
      createdAt: new Date().toISOString(),
      demo: true,
    };
  }

  try {
    const response = await api.post('/issues', payload);
    return unwrap(response);
  } catch (error) {
    // If backend is down, fall back to mock creation
    if (!error.response) {
      return {
        _id: 'mock-new-issue',
        id: 'mock-new-issue',
        refId: `CF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        ...payload,
        status: 'Reported',
        reportCount: 1,
        createdAt: new Date().toISOString(),
        demo: true,
      };
    }
    throw error;
  }
}

export async function addIssueReport(issueId, payload) {
  if (USE_MOCK_API) {
    const issue = mockSimilarIssues.find(
      (item) => item._id === issueId || item.id === issueId
    );

    return {
      ...(issue ?? {}),
      id: issueId,
      _id: issueId,
      refId: issue?.refId ?? 'CF-2026-0031',
      demo: true,
    };
  }

  try {
    const response = await api.post(`/issues/${issueId}/reports`, payload);
    return unwrap(response);
  } catch (error) {
    if (!error.response) {
      return {
        id: issueId,
        _id: issueId,
        refId: 'CF-2026-0031',
        demo: true,
      };
    }
    throw error;
  }
}
