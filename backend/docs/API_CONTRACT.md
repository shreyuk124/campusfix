# CampusFix REST API Specification: Feed, Browsing & Authority Triage Engine

**Service**: Member 3 Backend Core (Feed & Query Engine)  
**Base URL**: `/api/v1`  
**Protocol**: HTTP/1.1 (JSON Envelope)  
**Status**: Active & Verified (54 automated tests passing)

---

## 1. Architectural Highlights & Privacy Guarantees

1. **Privacy Rule § 9 (Student Reporter Identity Protection)**:
   - Public issue responses (`GET /api/v1/issues` and `GET /api/v1/issues/:id`) **NEVER** expose personal identifiable information (PII) of reporting students (names, email addresses, phone numbers, student IDs).
   - The `createdBy` field is strictly sanitized to only reveal non-identifying operational context:
     ```json
     "createdBy": { "role": "student" }
     ```
2. **Defensive Schema Loading**:
   - Relationship population (`.populate('building')`, `.populate('category')`, `.populate('createdBy')`) inspects Mongoose model registry before execution. If teammate models are not yet registered, queries execute safely without throwing `MissingSchemaError`.
3. **Connection Safety**:
   - If the database is disconnected or connecting, endpoints respond immediately with HTTP `503 DEPENDENCY_UNAVAILABLE` rather than hanging or timing out.

---

## 2. API Endpoints

### 2.1. `GET /api/v1/issues` — Public Feed & Authority Triage Queue

Fetches a paginated collection of campus maintenance issues matching query filters and sort criteria.

#### Query Parameters

| Parameter | Type | Default | Allowed Values / Format | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | Integer | `1` | `>= 1` | Page number for pagination. |
| `limit` | Integer | `10` | `1` to `50` (DoS cap: 50) | Number of items per page. |
| `sort` | String | `newest` | `newest`, `oldest`, `priority`, `overdue` | Sorting order: `newest` (creation DESC), `oldest` (FIFO queue ASC), `priority` (score DESC), `overdue` (SLA deadline ASC). |
| `campus` | String | *none* | `north`, `south` (case-insensitive) | Filter issues by campus location. |
| `status` | String \| Array | *none* | `Reported`, `Assigned`, `In Progress`, `Resolved`, `Closed`, `Reopened` | Single status or comma-separated list (e.g. `status=Reported,In Progress`) for authority active queues. |
| `priorityBand` | String \| Array | *none* | `Low`, `Medium`, `High`, `Critical` | Single band or comma-separated list (e.g. `priorityBand=High,Critical`). |
| `building` | String | *none* | 24-character ObjectId string | Filter issues by specific building. |
| `category` | String | *none* | 24-character ObjectId string | Filter issues by category (e.g. Electrical, Plumbing). |
| `search` / `q` | String | *none* | String (max 100 characters) | Keyword search across issue `title`, `locationText`, and `refId` (regex-escaped). |
| `fromDate` | String | *none* | ISO 8601 Date string | Filter issues created on or after this timestamp. |
| `toDate` | String | *none* | ISO 8601 Date string | Filter issues created on or before this timestamp. |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "_id": "6715b9f9e20a841234567890",
      "refId": "CF-2026-0042",
      "title": "Water cooler leaking on 2nd floor",
      "category": {
        "_id": "6715b9f9e20a841234567891",
        "label": "Plumbing",
        "baseSeverity": 2,
        "icon": "droplet"
      },
      "building": {
        "_id": "6715b9f9e20a841234567892",
        "name": "Main Building",
        "campus": "north"
      },
      "campus": "north",
      "locationText": "Near room 204",
      "description": "Continuous water drip forming a puddle near classroom entrance",
      "photos": [
        "https://res.cloudinary.com/campusfix/image/upload/v1/leak1.jpg"
      ],
      "status": "In Progress",
      "priorityScore": 75,
      "priorityBand": "High",
      "reportCount": 3,
      "createdBy": {
        "role": "student"
      },
      "createdAt": "2026-10-24T08:15:00.000Z",
      "updatedAt": "2026-10-24T09:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasMore": false
  }
}
```

#### Error Responses
- **`400 BAD_REQUEST`** (Query Validation Failure):
  ```json
  {
    "success": false,
    "error": {
      "code": "BAD_REQUEST",
      "field": "priorityBand",
      "message": "Invalid priorityBand: \"Urgent\". Allowed values: Low, Medium, High, Critical"
    }
  }
  ```
- **`503 DEPENDENCY_UNAVAILABLE`** (Database not connected):
  ```json
  {
    "success": false,
    "error": {
      "code": "DEPENDENCY_UNAVAILABLE",
      "message": "Issue model is not connected. Pending Member 2 model integration or live database connection."
    }
  }
  ```

---

### 2.2. `GET /api/v1/issues/:id` — Single Issue Details

Fetches full details of a specific issue using either its 24-character hexadecimal MongoDB ObjectId or its human-readable reference code (`CF-YYYY-XXXX`).

#### Path Parameters
- `id` (required): 24-character hexadecimal string (`507f1f77bcf86cd799439011`) **OR** formatted reference ID (`CF-2026-0042`).

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "_id": "6715b9f9e20a841234567890",
    "refId": "CF-2026-0042",
    "title": "Water cooler leaking on 2nd floor",
    "campus": "north",
    "locationText": "Near room 204",
    "description": "Continuous water drip forming a puddle near classroom entrance",
    "photos": [
      "https://res.cloudinary.com/campusfix/image/upload/v1/leak1.jpg"
    ],
    "status": "In Progress",
    "priorityScore": 75,
    "priorityBand": "High",
    "reportCount": 3,
    "createdBy": {
      "role": "student"
    },
    "createdAt": "2026-10-24T08:15:00.000Z",
    "updatedAt": "2026-10-24T09:30:00.000Z"
  }
}
```

#### Error Responses
- **`400 BAD_REQUEST`** (Malformed identifier):
  ```json
  {
    "success": false,
    "error": {
      "code": "BAD_REQUEST",
      "field": "id",
      "message": "Invalid issue identifier: \"bad-id\". Must be a valid 24-char ObjectId or reference code (e.g. CF-2026-0001)"
    }
  }
  ```
- **`404 NOT_FOUND`**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Issue not found"
    }
  }
  ```

---

### 2.3. `GET /api/v1/issues/mine` — Authenticated Student's Submitted Issues

Retrieves all issues submitted by the currently authenticated student.

#### Headers
- `Authorization`: `Bearer <JWT_TOKEN>` (validated by authentication middleware).

#### Query Parameters
- `page` (optional, default `1`)
- `limit` (optional, default `10`, max `50`)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "_id": "6715b9f9e20a841234567890",
      "refId": "CF-2026-0042",
      "title": "Broken chair in Library Reading Hall",
      "status": "Reported",
      "createdAt": "2026-10-24T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasMore": false
  }
}
```

#### Error Response
- **`401 UNAUTHORIZED`**:
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication required to view your submitted issues."
    }
  }
  ```

---

### 2.4. `GET /api/v1/health` — Service Healthcheck

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-10-24T14:40:00.000Z"
}
```

---

## 3. Frontend Integration Recipes

### Authority Triage: Active High/Critical Priority Queue
Used by Member 1's Authority Dashboard & Staff Triage Portal to review pending urgent items:
```http
GET /api/v1/issues?status=Reported,Assigned,In%20Progress&priorityBand=High,Critical&sort=priority
```

### FIFO Queue (Longest-waiting issues first)
Used by maintenance teams to address oldest unresolved complaints:
```http
GET /api/v1/issues?status=Reported&sort=oldest
```

### Student Feed: North Campus Active Issues
Used by students browsing public issues in their campus area:
```http
GET /api/v1/issues?campus=north&status=Reported,In%20Progress&page=1&limit=10
```

### Keyword Search
Search by room, issue title, or ticket reference code:
```http
GET /api/v1/issues?search=washroom
GET /api/v1/issues?q=CF-2026-0042
```
