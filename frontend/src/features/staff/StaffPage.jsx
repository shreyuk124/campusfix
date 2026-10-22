export default function StaffPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Staff Triage Portal</h1>
        <p className="text-sm text-muted">Review incoming complaints, update work status, and assign tasks.</p>
      </div>
      <div className="rounded-lg border border-dashed border-line-strong p-8 text-center text-muted">
        Staff queue & status updater goes here. (Teammate: features/staff)
      </div>
    </div>
  );
}