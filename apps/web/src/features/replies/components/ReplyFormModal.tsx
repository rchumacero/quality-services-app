import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Building2, User, Calendar, FileText, Tag, Loader2 } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { useAuth } from '../../../context/AuthContext';
import { BrandModel, UserModel, ReplyModel } from '@quality-services/types';

interface ReplyFormModalProps {
  isOpen: boolean;
  replyToEdit?: ReplyModel | null;
  onClose: () => void;
  onSuccess: (savedReply: ReplyModel) => void;
}

export const ReplyFormModal: React.FC<ReplyFormModalProps> = ({
  isOpen,
  replyToEdit,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [brands, setBrands] = useState<BrandModel[]>([]);
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);

  // Form fields
  const [brandId, setBrandId] = useState<string>('');
  const [specialistId, setSpecialistId] = useState<string>('');
  const [replyDate, setReplyDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  });
  const [createdBy, setCreatedBy] = useState<string>('');
  const [status, setStatus] = useState<string>('active');
  const [content, setContent] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load brands and users from real endpoints
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [brandsRes, usersRes] = await Promise.all([
          apiClient.get<{ items: BrandModel[]; total: number }>('/brands', { params: { limit: 100 } }),
          apiClient.get<{ items: UserModel[]; total: number }>('/users', { params: { limit: 100 } }),
        ]);

        if (isMounted) {
          const fetchedBrands = brandsRes.data?.items || [];
          const fetchedUsers = usersRes.data?.items || [];
          setBrands(fetchedBrands);
          setUsers(fetchedUsers);

          // Populate or reset form fields
          if (replyToEdit) {
            setBrandId(replyToEdit.brandId);
            setSpecialistId(replyToEdit.specialistId);
            try {
              const d = new Date(replyToEdit.replyDate);
              setReplyDate(d.toISOString().slice(0, 16));
            } catch {
              setReplyDate(new Date().toISOString().slice(0, 16));
            }
            setCreatedBy(replyToEdit.createdBy || user?.email || 'system');
            setStatus(replyToEdit.status || 'active');
            setContent(replyToEdit.content || '');
          } else {
            // New reply defaults
            const defaultBrand = fetchedBrands[0]?.id || '';
            const currentSpecialist = fetchedUsers.find((u) => u.id === user?.id) || fetchedUsers[0];
            setBrandId(defaultBrand);
            setSpecialistId(currentSpecialist?.id || '');
            setReplyDate(new Date().toISOString().slice(0, 16));
            setCreatedBy(user?.email || 'juan@qualityservice.com');
            setStatus('active');
            setContent('');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch options for reply form:', err);
        }
      } finally {
        if (isMounted) setLoadingOptions(false);
      }
    };

    fetchOptions();

    return () => {
      isMounted = false;
    };
  }, [isOpen, replyToEdit, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!brandId) {
      setErrorMessage('Please select a Brand.');
      return;
    }
    if (!specialistId) {
      setErrorMessage('Please select an Author/Specialist.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Please enter the reply content.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        brandId,
        specialistId,
        replyDate: new Date(replyDate).toISOString(),
        content: content.trim(),
        status,
        ...(replyToEdit ? { updatedBy: user?.email || 'system' } : { createdBy: createdBy.trim() || user?.email || 'system' }),
      };

      let result: { data: ReplyModel };
      if (replyToEdit) {
        // Real PATCH endpoint
        result = await apiClient.patch<ReplyModel>(`/replies/${replyToEdit.id}`, payload);
      } else {
        // Real POST endpoint
        result = await apiClient.post<ReplyModel>('/replies', payload);
      }

      onSuccess(result.data);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to save reply:', err);
      const msg = err instanceof Error ? err.message : 'An error occurred while saving the reply.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {replyToEdit ? 'Edit Customer Complaint Reply' : 'Create New Complaint Reply'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {replyToEdit ? `Updating Reply ID: ${replyToEdit.id}` : 'Record official customer response with quality parameters'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {loadingOptions ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading brands and users from server...</span>
            </div>
          ) : (
            <>
              {/* Row 1: Brand & Specialist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand select */}
                <div>
                  <label htmlFor="reply-brand-select" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Brand (tbrand) *</span>
                  </label>
                  <select
                    id="reply-brand-select"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition cursor-pointer"
                  >
                    <option value="">Select a brand...</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialist select */}
                <div>
                  <label htmlFor="reply-specialist-select" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Specialist / Author *</span>
                  </label>
                  <select
                    id="reply-specialist-select"
                    value={specialistId}
                    onChange={(e) => setSpecialistId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition cursor-pointer"
                  >
                    <option value="">Select a specialist...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.account} • {u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Reply Date & Created By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Reply Date */}
                <div>
                  <label htmlFor="reply-date-input" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reply Date *</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="reply-date-input"
                    value={replyDate}
                    onChange={(e) => setReplyDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Created By */}
                <div>
                  <label htmlFor="reply-created-by-input" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Created By (treply.created_by)</span>
                  </label>
                  <input
                    type="text"
                    id="reply-created-by-input"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    placeholder="e.g. user email or system tag"
                    disabled={!!replyToEdit}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Row 3: Status */}
              <div>
                <label htmlFor="reply-status-select" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  id="reply-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="in_review">In Review</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Row 4: Content */}
              <div>
                <label htmlFor="reply-content-textarea" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reply Content (Audited Body) *</span>
                </label>
                <textarea
                  id="reply-content-textarea"
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="Enter the full response message provided to the customer..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition leading-relaxed"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="btn-save-reply"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-sm shadow-blue-500/25 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{replyToEdit ? 'Update Reply' : 'Create Reply'}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
