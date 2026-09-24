import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Award, MessageSquare, Tag, User, Loader2, Building2 } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { useAuth } from '../../../context/AuthContext';
import { ReplyModel, EvaluationModel, UserModel } from '@quality-services/types';

interface EvaluationFormModalProps {
  isOpen: boolean;
  reply: ReplyModel | null;
  existingEvaluation?: EvaluationModel | null;
  onClose: () => void;
  onSuccess: (savedEvaluation: EvaluationModel) => void;
}

const PRESET_ERROR_TAGS = [
  'None / Compliant',
  'Grammar & Syntax',
  'Tone Unsuitable',
  'Impolite / Harsh',
  'Protocol Deviation',
  'Excessive Verbosity',
  'Condescending Tone',
];

export const EvaluationFormModal: React.FC<EvaluationFormModalProps> = ({
  isOpen,
  reply,
  existingEvaluation,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [teamLeads, setTeamLeads] = useState<UserModel[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // Form states
  const [score, setScore] = useState<number>(85);
  const [errorTag, setErrorTag] = useState<string>('None / Compliant');
  const [customTag, setCustomTag] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [teamLeadId, setTeamLeadId] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch users to populate Team Lead evaluators
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchTeamLeads = async () => {
      setLoadingUsers(true);
      try {
        const res = await apiClient.get<{ items: UserModel[]; total: number }>('/users', {
          params: { limit: 100 },
        });

        if (isMounted) {
          const allUsers = res.data?.items || [];
          setTeamLeads(allUsers);

          // Populate or reset form
          if (existingEvaluation) {
            setScore(existingEvaluation.score ?? 85);
            const tag = existingEvaluation.errorTags || 'None / Compliant';
            if (PRESET_ERROR_TAGS.includes(tag)) {
              setErrorTag(tag);
              setCustomTag('');
            } else {
              setErrorTag('Custom');
              setCustomTag(tag);
            }
            setFeedback(existingEvaluation.feedback || '');
            setTeamLeadId(existingEvaluation.teamLeadId || user?.id || allUsers[0]?.id || '');
          } else {
            // New evaluation defaults
            setScore(85);
            setErrorTag('None / Compliant');
            setCustomTag('');
            setFeedback('');

            // Default teamLeadId to active user if they are team_lead, or first team_lead
            const activeTeamLead = allUsers.find((u) => u.id === user?.id);
            const firstLead = allUsers.find((u) => u.role === 'team_lead') || allUsers[0];
            setTeamLeadId(activeTeamLead ? activeTeamLead.id : firstLead?.id || '');
          }
        }
      } catch (err) {
        console.error('Failed to fetch team leads:', err);
      } finally {
        if (isMounted) setLoadingUsers(false);
      }
    };

    fetchTeamLeads();
    return () => {
      isMounted = false;
    };
  }, [isOpen, existingEvaluation, user]);

  if (!isOpen || !reply) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!teamLeadId) {
      setErrorMessage('Please select a Team Lead evaluator.');
      return;
    }

    const finalTag = errorTag === 'Custom' ? customTag.trim() : errorTag === 'None / Compliant' ? null : errorTag;

    setIsSubmitting(true);
    try {
      const payload = {
        replyId: reply.id,
        teamLeadId,
        evaluationDate: new Date().toISOString(),
        score: Number(score),
        errorTags: finalTag,
        feedback: feedback.trim() || null,
        ...(existingEvaluation
          ? { updatedBy: user?.email || 'system' }
          : { createdBy: user?.email || 'system', status: 'active' }),
      };

      let result: { data: EvaluationModel };
      if (existingEvaluation) {
        // Real PATCH endpoint
        result = await apiClient.patch<EvaluationModel>(`/evaluations/${existingEvaluation.id}`, payload);
      } else {
        // Real POST endpoint
        result = await apiClient.post<EvaluationModel>('/evaluations', payload);
      }

      onSuccess(result.data);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to save evaluation:', err);
      const msg = err instanceof Error ? err.message : 'Failed to save evaluation.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Score conformity badge styling
  const scoreColorClass =
    score >= 90 ? 'text-emerald-600 bg-emerald-50' : score >= 70 ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>{existingEvaluation ? 'Update QA Evaluation' : 'Perform QA Evaluation'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reply #{reply.id.slice(0, 8)} • Brand: {reply.brand?.name || 'Brand'}
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

        {/* Audited Reply Preview Callout */}
        <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{reply.brand?.name}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Specialist: <strong>{reply.specialist?.name}</strong> ({reply.specialist?.account})
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans italic bg-white p-3 rounded-xl border border-slate-100">
            "{reply.content}"
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Evaluation Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {loadingUsers ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading team leads...</span>
            </div>
          ) : (
            <>
              {/* Row 1: Score & Team Lead Evaluator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Score */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="eval-score-input" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>Quality Score (0-100) *</span>
                    </label>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${scoreColorClass}`}>
                      {score} / 100
                    </span>
                  </div>
                  <input
                    type="number"
                    id="eval-score-input"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full mt-2 accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Team Lead Evaluator */}
                <div>
                  <label htmlFor="eval-teamlead-select" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Evaluator (Team Lead) *</span>
                  </label>
                  <select
                    id="eval-teamlead-select"
                    value={teamLeadId}
                    onChange={(e) => setTeamLeadId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition cursor-pointer"
                  >
                    <option value="">Select evaluator...</option>
                    {teamLeads.map((tl) => (
                      <option key={tl.id} value={tl.id}>
                        {tl.name} ({tl.account} • {tl.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Error Tag (tag_errors) */}
              <div>
                <label htmlFor="eval-tag-select" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>Error Tag (tevaluation.tag_error)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    id="eval-tag-select"
                    value={errorTag}
                    onChange={(e) => setErrorTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition cursor-pointer"
                  >
                    {PRESET_ERROR_TAGS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="Custom">Custom Error Tag...</option>
                  </select>

                  {errorTag === 'Custom' && (
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Specify custom error category..."
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                  )}
                </div>
              </div>

              {/* Row 3: Feedback & Moderation Comments */}
              <div>
                <label htmlFor="eval-feedback-textarea" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Auditor Feedback & Coaching Comments</span>
                </label>
                <textarea
                  id="eval-feedback-textarea"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback for the specialist regarding compliance, tone, or technical accuracy..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
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
                  id="btn-save-evaluation"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-xs shadow-blue-500/25 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Evaluation...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{existingEvaluation ? 'Update Evaluation' : 'Record Evaluation'}</span>
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
