import Card from '../../components/ui/Card';

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold tracking-wider uppercase text-brand-600">
          Campus Administration
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          Admin Management
        </h1>
        <p className="text-muted">
          Campus analytics, category management, and user permissions.
        </p>
      </div>

      <Card
        title="Administrative Controls"
        description="Configuration and platform-level administration."
      >
        <div className="rounded-lg border border-dashed border-line-strong p-8 text-center text-muted">
          Admin dashboard & settings are ready for implementation by the admin feature team.
        </div>
      </Card>
    </div>
  );
}
