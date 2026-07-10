import { useState, useEffect } from 'react';
import { Bell, Pin, X, Check } from 'lucide-react';

const DISMISS_KEY = 'hros_onboarding_dismissed';

export default function OnboardingPrompt() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden relative">
        {step === 0 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Stay Updated</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Allow notifications to get alerts for reviews, missions, and team updates.
            </p>

            {notifStatus === 'denied' ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Notifications are blocked. Enable them in your browser settings.
                </p>
              </div>
            ) : notifStatus === 'granted' ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-400">Notifications enabled!</span>
              </div>
            ) : (
              <button onClick={requestNotifications}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-opacity shadow-lg mb-4">
                Enable Notifications
              </button>
            )}

            <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              {notifStatus === 'granted' ? 'Continue' : 'Skip for now'}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Pin className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pin This Tab</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Pin the HROS tab in your browser for quick access.
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                <span className="block"><strong className="text-gray-700 dark:text-gray-300">Chrome/Edge:</strong> Right-click the tab → "Pin"</span>
                <span className="block"><strong className="text-gray-700 dark:text-gray-300">Firefox:</strong> Right-click the tab → "Pin Tab"</span>
                <span className="block"><strong className="text-gray-700 dark:text-gray-300">Safari:</strong> Window → "Pin Tab"</span>
              </p>
            </div>

            <button onClick={dismiss}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-opacity shadow-lg">
              Got it, let's go!
            </button>
          </div>
        )}

        <button onClick={dismiss}
          className="absolute top-4 right-4 p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
