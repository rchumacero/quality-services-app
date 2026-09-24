import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { ReplyModel } from '@quality-services/types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  reply: ReplyModel | null;
  onClose: () => void;
  onSuccess: (deletedId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  reply,
  onClose,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !reply) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await apiClient.delete(`/replies/${reply.id}`);
      onSuccess(reply.id);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to delete reply:', err);
      const msg = err instanceof Error ? err.message : 'Failed to delete reply.';
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 text-red-600 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Delete Complaint Reply</h3>
            <div className="text-xs text-slate-400">ID: {reply.id}</div>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Are you sure you want to permanently delete this reply for brand{' '}
          <strong className="text-slate-800">{reply.brand?.name || 'Assigned Brand'}</strong>? This action cannot be undone and will delete all associated audit evaluations.
        </p>

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-delete-reply"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-xs transition cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
