import React from 'react';
import { GESTURE_GUIDE } from '../data/karnatakaData';
import { IconCheck, IconHelpCircle, IconX } from './Icons';

export const GestureGuideModal = ({ isOpen, onClose, onSimulateGesture }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl p-6 border-amber-500/40 relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800"
        >
          <IconX size={18} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <IconHelpCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Sign Language & Gesture Accessibility Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Real-time MediaPipe vision mappings for hearing or speech impaired visitors
            </p>
          </div>
        </div>

        {/* Gesture Grid */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 my-4">
          {GESTURE_GUIDE.map((g) => (
            <div
              key={g.name}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl p-2 bg-slate-950 rounded-xl border border-slate-800">{g.symbol}</span>
                <div>
                  <h4 className="text-sm font-bold text-amber-300">{g.name}</h4>
                  <p className="text-xs text-slate-300 font-medium">{g.action}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{g.description}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onSimulateGesture(g);
                  onClose();
                }}
                className="btn-secondary text-xs py-1.5 px-3 whitespace-nowrap"
              >
                Simulate
              </button>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <IconCheck size={14} /> MediaPipe Vision WebCam Active
          </span>
          <button onClick={onClose} className="btn-primary text-xs py-1.5">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
