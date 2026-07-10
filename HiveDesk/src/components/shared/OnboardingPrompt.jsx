import { useState, useEffect } from 'react';
import { Bell, Pin, X, Check } from 'lucide-react';

const DISMISS_KEY = 'hivedesk_onboarding_dismissed';

export default function OnboardingPrompt() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0); // 0 = notifications, 1 = pin tab
  const [notifStatus, setNotifStatus] = useState('default');

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    if ('Notification' in window) {
      setNotifStatus(Notification.permission);
      if (Notification.permission === 'default') {
        setShow(true);
        setStep(0);
      } else {
        setShow(true);
        setStep(1);
      }
    }
  }, []);

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      setStep(1);
      return;
    }
    const result = await Notification.requestPermission();
    setNotifStatus(result);
    setTimeout(() => setStep(1), 800);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-hd-surface border border-hd-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {step === 0 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-hd-text mb-2">Stay Updated</h2>
            <p className="text-sm text-hd-muted mb-6">
              Allow notifications to get alerts for reviews, missions, and team updates.
            </p>

            {notifStatus === 'denied' ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
                <p className="text-sm text-amber-400">
                  Notifications are blocked. Enable them in your browser settings.
                </p>
              </div>
            ) : notifStatus === 'granted' ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Notifications enabled!</span>
              </div>
            ) : (
              <button onClick={requestNotifications}
                className="w-full py-3 px-4 accent-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20 mb-4">
                Enable Notifications
              </button>
            )}

            <button onClick={() => setStep(1)} className="text-sm text-hd-muted hover:text-hd-text transition-colors">
              {notifStatus === 'granted' ? 'Continue' : 'Skip for now'}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Pin className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-hd-text mb-2">Pin This Tab</h2>
            <p className="text-sm text-hd-muted mb-4">
              Pin the HiveDesk tab in your browser for quick access.
            </p>

            <div className="bg-hd-bg rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-hd-muted space-y-2">
                <span className="block"><strong className="text-hd-text">Chrome/Edge:</strong> Right-click the tab → "Pin"</span>
                <span className="block"><strong className="text-hd-text">Firefox:</strong> Right-click the tab → "Pin Tab"</span>
                <span className="block"><strong className="text-hd-text">Safari:</strong> Window → "Pin Tab"</span>
              </p>
            </div>

            <button onClick={dismiss}
              className="w-full py-3 px-4 accent-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20">
              Got it, let's go!
            </button>
          </div>
        )}

        <button onClick={dismiss}
          className="absolute top-4 right-4 p-1.5 rounded-md text-hd-muted hover:text-hd-text hover:bg-hd-hover transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
