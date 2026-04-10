import { Settings as SettingsIcon } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="card text-center py-16">
        <SettingsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Settings page - Coming soon</p>
        <p className="text-gray-400 text-sm mt-1">App configuration, branding, and preferences</p>
      </div>
    </div>
  );
}
