import { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { User, Shield, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [name, setName] = useState('Sarthak Sharma');
  const [email, setEmail] = useState('sarthak@university.edu');
  const [studentId, setStudentId] = useState('CF-2026-9042');
  const [defaultCampus, setDefaultCampus] = useState('College');
  const [notifyStatusChange, setNotifyStatusChange] = useState(true);
  const [notifySafetyAlerts, setNotifySafetyAlerts] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 500);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <div>
        <p className="text-sm font-semibold tracking-wider uppercase text-brand-600">
          User Preferences
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          Settings & Profile
        </h1>
        <p className="mt-2 text-muted">
          Manage your university identity, notification alerts, and campus preferences.
        </p>
      </div>

      {savedSuccess && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-teal-700/30 bg-teal-50 p-4 text-sm font-medium text-teal-700 shadow-sm"
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>Your preferences have been saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <Card
          title="Student Profile"
          description="Your verified university account information."
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-line pb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <User size={28} aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-ink text-base">{name}</p>
                <p className="text-sm text-muted">{email}</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  <Shield size={12} aria-hidden="true" />
                  Student Member
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Student / Roll ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled
                helperText="Assigned by university administration."
              />
            </div>

            <Input
              label="University Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              helperText="Status notifications will be sent to this email address."
            />
          </div>
        </Card>

        {/* Campus Location Defaults */}
        <Card
          title="Campus Preferences"
          description="Default location settings used when submitting reports."
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="defaultCampus">
                Primary Campus Location
              </label>
              <select
                id="defaultCampus"
                value={defaultCampus}
                onChange={(e) => setDefaultCampus(e.target.value)}
                className="w-full h-11 rounded-md border border-line-strong bg-white px-3 text-sm text-ink outline-none transition-colors duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="College">College (Academic Block)</option>
                <option value="Hostel">Hostel (Student Residence)</option>
              </select>
              <p className="mt-1 text-xs text-muted">
                Pre-selects your primary campus zone on the issue reporting form.
              </p>
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card
          title="Notification Alerts"
          description="Choose how and when CampusFix notifies you."
        >
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 hover:bg-canvas transition">
              <input
                type="checkbox"
                checked={notifyStatusChange}
                onChange={(e) => setNotifyStatusChange(e.target.checked)}
                className="mt-1 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="block text-sm font-semibold text-ink">
                  Issue Status Updates
                </span>
                <span className="text-xs text-muted">
                  Receive email alerts when issues you reported or subscribed to change status (e.g. Assigned, In Progress, Resolved).
                </span>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 hover:bg-canvas transition">
              <input
                type="checkbox"
                checked={notifySafetyAlerts}
                onChange={(e) => setNotifySafetyAlerts(e.target.checked)}
                className="mt-1 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="block text-sm font-semibold text-ink">
                  Urgent Safety Hazard Alerts
                </span>
                <span className="text-xs text-muted">
                  Immediate alerts for campus safety concerns (e.g. major water leaks, power outages, elevator failures).
                </span>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 hover:bg-canvas transition">
              <input
                type="checkbox"
                checked={notifyWeeklyDigest}
                onChange={(e) => setNotifyWeeklyDigest(e.target.checked)}
                className="mt-1 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="block text-sm font-semibold text-ink">
                  Weekly Resolution Digest
                </span>
                <span className="text-xs text-muted">
                  A weekly summary of resolved campus maintenance complaints across your department.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" loading={saving}>
            Save Preferences
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setName('Sarthak Sharma');
              setDefaultCampus('College');
              setNotifyStatusChange(true);
              setNotifySafetyAlerts(true);
              setNotifyWeeklyDigest(false);
            }}
          >
            Reset Defaults
          </Button>
        </div>
      </form>
    </div>
  );
}
