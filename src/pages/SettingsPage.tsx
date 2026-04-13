import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';

function SyncStatus({ lastSynced }: { lastSynced: number | null }) {
  const isOnline = navigator.onLine;

  if (!isOnline) {
    return (
      <span className="text-sm text-yellow-400">
        Offline — changes will sync on reconnect
      </span>
    );
  }

  if (!lastSynced) {
    return <span className="text-sm text-gray-400">Not synced yet</span>;
  }

  const date = new Date(lastSynced);
  const formatted = date.toLocaleString();
  return (
    <span className="text-sm text-green-400">
      Synced &mdash; {formatted}
    </span>
  );
}

export default function SettingsPage() {
  const { user, loading, lastSynced, signOut } = useAuth();

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <section className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-[#c9a84c] mb-1">Account &amp; Sync</h2>

        {!user ? (
          <>
            <p className="text-gray-400 text-sm mb-6">
              Sign in to sync your profiles across devices. Your data is always available
              offline — the cloud keeps everything in step when you connect.
            </p>
            <LoginForm />
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Signed in as</span>
              <span className="text-gray-100 font-medium">{user.email}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Sync status</span>
              <SyncStatus lastSynced={lastSynced} />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => void signOut()}
                className="px-4 py-2 rounded bg-[#8b0000] text-white font-medium hover:bg-red-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
