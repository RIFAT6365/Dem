/**
 * Supabase Key Configuration Modal
 * Lets users paste their Supabase anon/publishable key directly in the UI
 * so accounts and database sync connect immediately without manual container restarts.
 */

import React, { useState } from 'react';
import {
  setRuntimeSupabaseKey,
  getActiveSupabaseKey,
  testSupabaseConnection,
} from '../../lib/supabase';
import { KeyRound, CheckCircle2, AlertCircle, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface SupabaseKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
  onContinueDemo?: () => void;
}

export const SupabaseKeyModal: React.FC<SupabaseKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
  onContinueDemo,
}) => {
  const [keyInput, setKeyInput] = useState(getActiveSupabaseKey());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    setIsTesting(true);
    setTestResult(null);

    setRuntimeSupabaseKey(keyInput.trim());
    const res = await testSupabaseConnection();
    setIsTesting(false);
    setTestResult({ ok: res.ok, message: res.message });

    if (res.ok || res.statusCode === 200 || res.statusCode === 401 === false) {
      setTimeout(() => {
        if (onKeySaved) onKeySaved();
        onClose();
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07131A]/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scaleIn border border-[#E9E9E5]">
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF8E7] text-[#E9A817] flex items-center justify-center border border-[#F5B51B]/40 shrink-0">
              <KeyRound className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight">
                Connect Supabase Key
              </h3>
              <span className="text-[11px] text-gray-400 block font-mono mt-0.5">
                iqnhcovwjwjelinlhkmj.supabase.co
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Where to find it guide */}
        <div className="bg-[#FFF8E7] p-3.5 rounded-2xl border border-[#F5B51B]/40 text-xs text-gray-700 space-y-1.5">
          <div className="font-bold text-[#07131A] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#E9A817]" />
            <span>কীভাবে কী (Key) পাবেন:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600 pl-1">
            <li>Supabase Dashboard-এর বামপাশের গিয়ার <strong>Project Settings</strong> ➔ <strong>API</strong>-তে যান।</li>
            <li>সেখান থেকে <strong>anon / public</strong> কী-টি কপি করে নিচের বক্সে পেস্ট করুন।</li>
          </ol>
          <a
            href="https://supabase.com/dashboard/project/iqnhcovwjwjelinlhkmj/settings/api"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#07131A] underline mt-1"
          >
            Open Supabase API Settings <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
              testResult.ok
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{testResult.message}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Supabase Publishable / Anon Key
            </label>
            <input
              type="text"
              required
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full text-xs p-3 rounded-xl border border-gray-300 font-mono focus:outline-none focus:border-[#F5B51B] focus:ring-1 focus:ring-[#F5B51B]"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isTesting || !keyInput.trim()}
              className="w-full py-3 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20 flex items-center justify-center gap-2"
            >
              {isTesting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#07131A] border-t-transparent rounded-full animate-spin" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <span>Save Key & Connect</span>
              )}
            </button>

            {onContinueDemo && (
              <button
                type="button"
                onClick={onContinueDemo}
                className="w-full py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold transition-colors"
              >
                Continue in Demo Mode
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
