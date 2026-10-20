import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Welcome Back</h1>
        <p className="mt-2 text-sm text-muted">Log in to CampusFix using your university credentials.</p>
      </div>

      <Card title="Account Sign In">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="student@university.edu"
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <Button fullWidth className="mt-2" type="submit">
            Sign In
          </Button>

          <p className="text-xs text-center text-muted pt-2">
            Authentication backend integration in progress. (Teammate: features/auth)
          </p>

          <div className="text-center pt-2 border-t border-line">
            <Link to="/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
              Continue to Dashboard as Guest →
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
