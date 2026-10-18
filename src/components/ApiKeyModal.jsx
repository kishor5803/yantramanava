import React, { useState } from 'react';
import { IconCheck, IconSettings, IconX } from './Icons';

export const ApiKeyModal = ({ isOpen, onClose, apiKey, onSaveApiKey }) => {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md p-6 border-amber-500/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800"
        >
          <IconX size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <IconSettings size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">LLM Brain Settings</h3>
            <p className="text-xs text-slate-400">Configure Custom OpenAI API Key (Optional)</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          ℹ️ Yantramanava works out-of-the-box using the built-in Karnataka Verified RAG knowledge base. Adding your OpenAI key unlocks live generative responses for unlisted questions.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              OpenAI API Key (sk-...)
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-proj-..."
              className="input-field text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              {savedSuccess ? (
                <>
                  <IconCheck size={16} /> Saved!
                </>
              ) : (
                'Save Key'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
