
import { useState } from "react";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import PriorityBadge from "../components/ui/PriorityBadge";

const sampleIssues = [
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

export default function DashboardPage() {
  const [filter, setFilter] = useState("All");

  const filteredIssues =
    filter === "All"
      ? sampleIssues
      : sampleIssues.filter((issue) => issue.status === filter);

  const stats = [
    { label: "Total Issues", value: 24 },
    { label: "Pending", value: 8 },
    { label: "In Progress", value: 10 },
    { label: "Resolved", value: 6 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-600">
          AUTHORITY OVERVIEW
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          Dashboard
        </h1>
        <p className="mt-2 text-muted">
          Monitor campus issues and track their resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold text-ink">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <Card
        title="Recent Campus Issues"
        description="Review reported problems and their current status."
      >
        <div className="mb-5 flex flex-wrap gap-2">
          {["All", "Reported", "Assigned", "In Progress", "Resolved"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full border px-3 py-2 text-sm ${
                  filter === status
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-border bg-white text-muted hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        <div className="space-y-3">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-ink">
                  {issue.title}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {issue.location}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Assigned team: {issue.team}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <StatusBadge status={issue.status} />
                <PriorityBadge priority={issue.priority} />
              </div>
            </div>
          ))}

          {filteredIssues.length === 0 && (
            <p className="py-8 text-center text-muted">
              No issues found for this status.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
