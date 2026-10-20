import Card from '../../components/ui/Card';

export default function FeedPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold tracking-wider uppercase text-brand-600">
          Campus Updates
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          Activity Feed
        </h1>
        <p className="mt-2 text-muted">
          Recent maintenance updates, announcements, and resolution logs across campus.
        </p>
      </div>

      <Card
        title="Live Feed"
        description="Activity and status updates from facilities and students."
      >
        <div className="rounded-lg border border-dashed border-line-strong p-8 text-center text-muted">
          Feed content is ready for implementation by the feed feature team.
        </div>
      </Card>
    </div>
  );
}
