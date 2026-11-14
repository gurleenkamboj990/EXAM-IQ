import React from 'react';
import { AlertTriangle, Maximize2, ShieldAlert } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export const ProctoringWarningModal = ({
  isOpen,
  onClose,
  latestViolation,
  violationCount,
  maxViolations = 5,
  onReenterFullscreen,
}) => {
  if (!isOpen || !latestViolation) return null;

  const isFullscreenViolation = latestViolation.type === 'FULLSCREEN_EXIT';
  const remaining = maxViolations - violationCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Security Integrity Alert"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Proctoring Anomaly Logged</h4>
            <p className="text-xs text-rose-700/90 dark:text-rose-300 leading-relaxed">
              {latestViolation.message}
            </p>
          </div>
        </div>

        {/* Counter breakdown */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">Total Violations Incurred:</span>
          <span className="font-extrabold text-rose-600 dark:text-rose-400">
            {violationCount} / {maxViolations} Max Allowed
          </span>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
          {remaining > 0 ? (
            <span>
              Warning: Incurring <span className="font-bold text-rose-600">{remaining} more violation(s)</span> will result in automatic exam disqualification and immediate paper submission.
            </span>
          ) : (
            <span className="font-bold text-rose-600">
              Maximum security violations exceeded. The assessment will now be auto-submitted.
            </span>
          )}
        </p>

        {/* Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isFullscreenViolation && onReenterFullscreen && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Maximize2}
              onClick={() => {
                onReenterFullscreen();
                onClose();
              }}
            >
              Re-enter Fullscreen
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            I Acknowledge & Resume
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProctoringWarningModal;

