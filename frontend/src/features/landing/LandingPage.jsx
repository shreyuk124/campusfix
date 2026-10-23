import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Droplets,
  ShieldCheck,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';

const samplePreviewIssues = [
  {
    icon: Droplets,
    title: 'Water leaking near Block A washroom',
    location: 'Block A · 2nd Floor',
    status: 'In Progress',
    priority: 'High',
    affected: 12,
  },
  {
    icon: Wifi,
    title: 'Wi-Fi unavailable in the library',
    location: 'Central Library · Ground Floor',
    status: 'Assigned',
    priority: 'Medium',
    affected: 8,
  },
];

function Header() {
  return (
    <header className="border-b border-line bg-white sticky top-0 z-20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
            <ShieldCheck size={23} strokeWidth={1.8} />
          </span>
          <span className="text-xl font-bold tracking-tight text-ink">
            CampusFix
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6">
          <a
            href="#how-it-works"
            className="hidden text-sm font-medium text-muted hover:text-brand-600 sm:block"
          >
            How it works
          </a>
          <a
            href="#issues"
            className="hidden text-sm font-medium text-muted hover:text-brand-600 sm:block"
          >
            Campus issues
          </a>
          <Link
            to="/dashboard"
            className="rounded-lg border border-line-strong px-4 py-2 text-sm font-semibold text-ink transition hover:bg-brand-50"
          >
            Open Dashboard
          </Link>
          <Link
            to="/login"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}

function IssueCard({ issue }) {
  const IssueIcon = issue.icon;

  return (
    <article className="rounded-lg border border-line bg-white p-4 shadow-card transition hover:shadow-hover sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <IssueIcon size={21} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-6 text-ink">
            {issue.title}
          </h3>

          <p className="mt-1 text-sm text-muted">{issue.location}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-sm text-muted">
            <Users size={16} />
            <span>
              {issue.affected} {issue.affected === 1 ? 'student' : 'students'}{' '}
              affected
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Step({ number, icon: Icon, title, description }) {
  return (
    <article className="rounded-xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon size={22} />
        </span>
        <span className="font-mono text-sm font-medium text-muted">
          {number}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-body">
      <Header />

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">
              <span className="h-2 w-2 rounded-full bg-teal" />
              A better way to care for your campus
            </span>

            <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl sm:leading-tight">
              Report it. Track it.{' '}
              <span className="text-brand-500">See it fixed.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">
              Broken equipment, leaking pipes, Wi-Fi problems. Report campus
              issues in one place and follow their progress until they are
              resolved.
            </p>

            <div id="get-started" className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/issues"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600 shadow-sm"
              >
                Explore campus issues
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/report"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-line-strong bg-white px-5 py-3 font-semibold text-ink transition hover:bg-brand-50"
              >
                Report an issue
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={17} className="text-teal" />
                Transparent progress
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 size={17} className="text-teal" />
                Clear deadlines
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted">
                  Campus issue overview
                </p>
                <h2 className="mt-1 text-xl font-bold text-ink">
                  Progress you can see
                </h2>
              </div>
              <span className="rounded-xl bg-teal-50 p-3 text-teal-700">
                <CheckCircle2 size={23} />
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-brand-50 p-4">
                <p className="text-sm text-muted">Track every issue</p>
                <p className="mt-1 text-lg font-bold text-ink">
                  One place
                </p>
              </div>
              <div className="rounded-lg bg-teal-50 p-4">
                <p className="text-sm text-muted">Clear ownership</p>
                <p className="mt-1 text-lg font-bold text-ink">
                  Named teams
                </p>
              </div>
            </div>

            <div id="issues" className="mt-7">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-ink">
                  Example campus issues
                </h2>
                <span className="text-xs text-muted">Preview data</span>
              </div>

              <div className="space-y-3">
                {samplePreviewIssues.map((issue) => (
                  <IssueCard key={issue.title} issue={issue} />
                ))}
              </div>

              <p className="mt-4 text-xs leading-5 text-muted">
                These are illustrative examples. Live issue data will appear
                when the frontend is connected to the backend API.
              </p>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-line bg-white py-12 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
                Simple by design
              </p>
              <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
                From reporting to resolution
              </h2>
              <p className="mt-3 leading-7 text-muted">
                Every report should have a clear next step, a responsible team
                and visible progress.
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              <Step
                number="01"
                icon={Zap}
                title="Report the problem"
                description="Describe the issue and tell us exactly where it happened."
              />
              <Step
                number="02"
                icon={Users}
                title="Track the progress"
                description="See the status, affected count and responsible team."
              />
              <Step
                number="03"
                icon={CheckCircle2}
                title="Confirm the fix"
                description="Follow the resolution and confirm when the problem is fixed."
              />
            </div>
          </div>
        </section>

        <section
          id="ui-showcase"
          className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Development Preview
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink">
              UI Component Showcase
            </h2>
            <p className="mt-2 text-sm text-muted">
              Reusable components for the CampusFix application.
            </p>
          </div>

          <Card title="Buttons" description="Available button variants and states.">
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Card>

          <Card title="Input Fields" description="Labels, hints and validation errors.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Full Name"
                placeholder="Enter your name"
                hint="Enter your first and last name."
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
              />

              <Input
                label="Issue Location"
                placeholder="e.g. Library, First Floor"
                error="Please enter a valid location."
              />
            </div>
          </Card>

          <Card
            title="Issue Statuses"
            description="Status indicators used throughout CampusFix."
          >
            <div className="flex flex-wrap gap-3">
              {[
                'Reported',
                'Assigned',
                'In Progress',
                'Resolved',
                'Closed',
                'Reopened',
                'Rejected',
                'Merged',
              ].map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
          </Card>

          <Card
            title="Issue Priorities"
            description="Priority indicators for reported issues."
          >
            <div className="flex flex-wrap gap-3">
              {['Low', 'Medium', 'High', 'Critical'].map((priority) => (
                <PriorityBadge key={priority} priority={priority} />
              ))}
            </div>
          </Card>

          <Card title="Loading State">
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>

          <Card title="Empty State">
            <EmptyState
              title="No reports yet"
              description="When you report a campus issue, it will appear here."
            />
          </Card>

          <Card title="Error State">
            <ErrorState
              title="Unable to load issues"
              description="Please check your connection and try again."
              onRetry={() => window.location.reload()}
            />
          </Card>
        </section>
      </main>

      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="font-semibold text-ink">CampusFix</span>
          <span>Campus issues, tracked with accountability.</span>
        </div>
      </footer>
    </div>
  );
}
