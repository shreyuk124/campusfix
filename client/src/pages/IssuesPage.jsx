
import { useState } from "react";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import PriorityBadge from "../components/ui/PriorityBadge";

const issuesData = [
  {
    id: 1,
    title: "Water leaking near Block A washroom",
    location: "Block A · 2nd Floor",
    status: "In Progress",
    priority: "High",
    team: "Maintenance",
  },
  {
    id: 2,
    title: "Wi-Fi unavailable in the library",
    location: "Central Library · Ground Floor",
    status: "Assigned",
    priority: "Medium",
    team: "IT Support",
  },
  {
    id: 3,
    title: "Broken lights in the corridor",
    location: "Block B · 1st Floor",
    status: "Reported",
    priority: "Low",
    team: "Electrical",
  },
  {
    id: 4,
    title: "Damaged classroom bench",
    location: "Room 204 · Block C",
    status: "Resolved",
    priority: "Medium",
    team: "Facilities",
  },
];

export default function IssuesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");

  const filteredIssues = issuesData.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = status === "All" || issue.status === status;
    const matchesPriority =
      priority === "All" || issue.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-600">
          ISSUE MANAGEMENT
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          Campus Issues
        </h1>
        <p className="mt-2 text-muted">
          Search, filter and review reported campus problems.
        </p>
      </div>

      <Card title="Find Issues">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or location..."
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            <option value="All">All statuses</option>
            <option value="Reported">Reported</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            <option value="All">All priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </Card>

      <Card
        title={`Issues (${filteredIssues.length})`}
        description="Currently displayed sample reports."
      >
        <div className="space-y-3">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold text-ink">
                  {issue.title}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {issue.location}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Team: {issue.team}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge status={issue.status} />
                <PriorityBadge priority={issue.priority} />
              </div>
            </div>
          ))}

          {filteredIssues.length === 0 && (
            <p className="py-8 text-center text-muted">
              No matching issues found. Try changing your filters.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
