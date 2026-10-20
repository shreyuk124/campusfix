import Card from '../../components/ui/Card';

export default function StaffPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold tracking-wider uppercase text-brand-600">
          Maintenance Staff
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          Staff Triage Portal
        </h1>
        <p className="mt-2 text-muted">
          Review incoming complaints, update work status, and assign tasks.
        </p>
      </div>

      <Card
        title="Assigned Tasks Queue"
        description="Active maintenance tasks assigned to your department."
      >
        <div className="rounded-lg border border-dashed border-line-strong p-8 text-center text-muted">
          Staff queue & status updater is ready for implementation by the staff feature team.
        </div>
      </Card>
    </div>
  );
}
