import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      security: true,
    },
    privacy: {
      analytics: true,
      thirdParty: false,
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
    },
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (section, key) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key],
      },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiService.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full bg-background-light dark:bg-background-dark min-h-screen">
      <div className="mb-6">
        <h2 className="text-[28px] font-bold text-text-primary mb-1">Settings</h2>
        <p className="text-text-secondary text-sm">Manage your application preferences and configurations.</p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-surface-light dark:bg-slate-900 p-6 rounded-card border border-border-light dark:border-slate-800">
          <h3 className="font-semibold text-[18px] text-text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-text-primary">Email Notifications</div>
                <div className="text-xs text-text-secondary">Receive updates via email</div>
              </div>
              <button
                onClick={() => handleToggle('notifications', 'email')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.email ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-text-primary">Push Notifications</div>
                <div className="text-xs text-text-secondary">Receive browser push notifications</div>
              </div>
              <button
                onClick={() => handleToggle('notifications', 'push')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.push ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-text-primary">Security Alerts</div>
                <div className="text-xs text-text-secondary">Get notified about security events</div>
              </div>
              <button
                onClick={() => handleToggle('notifications', 'security')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.security ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.security ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-surface-light dark:bg-slate-900 p-6 rounded-card border border-border-light dark:border-slate-800">
          <h3 className="font-semibold text-[18px] text-text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">privacy_tip</span>
            Privacy
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-text-primary">Usage Analytics</div>
                <div className="text-xs text-text-secondary">Help us improve by sharing anonymous usage data</div>
              </div>
              <button
                onClick={() => handleToggle('privacy', 'analytics')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.privacy.analytics ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.privacy.analytics ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-text-primary">Third-Party Integrations</div>
                <div className="text-xs text-text-secondary">Allow third-party services</div>
              </div>
              <button
                onClick={() => handleToggle('privacy', 'thirdParty')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.privacy.thirdParty ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.privacy.thirdParty ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* System */}
        <div className="bg-surface-light dark:bg-slate-900 p-6 rounded-card border border-border-light dark:border-slate-800">
          <h3 className="font-semibold text-[18px] text-text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">settings</span>
            System
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-text-primary">Automatic Backups</div>
                <div className="text-xs text-text-secondary">Enable automatic data backups</div>
              </div>
              <button
                onClick={() => handleToggle('system', 'autoBackup')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.system.autoBackup ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.system.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <div className="font-medium text-sm text-text-primary mb-2">Backup Frequency</div>
              <select
                value={settings.system.backupFrequency}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    system: { ...prev.system, backupFrequency: e.target.value },
                  }))
                }
                className="bg-surface-light dark:bg-slate-800 border border-border-light dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-text-primary focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary w-full transition-all"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-success">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="text-sm font-medium">Settings saved successfully</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
