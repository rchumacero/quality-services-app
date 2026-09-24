import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MessageSquareReply,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Building2,
  User,
  X,
} from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { ReplyModel, BrandModel } from '@quality-services/types';
import { MultiSelectDropdown, MultiSelectOption } from './components/MultiSelectDropdown';
import { ReplyFormModal } from './components/ReplyFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

export const RepliesPage: React.FC = () => {
  const { user } = useAuth();

  // Data states
  const [replies, setReplies] = useState<ReplyModel[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter options loaded from real endpoints
  const [brandOptions, setBrandOptions] = useState<BrandModel[]>([]);
  const [createdByOptions, setCreatedByOptions] = useState<string[]>([]);

  // Active filter states (Multiselect)
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [selectedCreatedBys, setSelectedCreatedBys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [replyToEdit, setReplyToEdit] = useState<ReplyModel | null>(null);
  const [replyToDelete, setReplyToDelete] = useState<ReplyModel | null>(null);
  const [viewingReply, setViewingReply] = useState<ReplyModel | null>(null);

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load filter options from real endpoints
  useEffect(() => {
    let isMounted = true;
    const loadFilterMetadata = async () => {
      try {
        const [brandsRes, createdByRes] = await Promise.all([
          apiClient.get<{ items: BrandModel[]; total: number }>('/brands', { params: { limit: 100 } }),
          apiClient.get<string[]>('/replies/created-by-options').catch(() => ({ data: [] })),
        ]);

        if (isMounted) {
          setBrandOptions(brandsRes.data?.items || []);
          setCreatedByOptions(createdByRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };

    loadFilterMetadata();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Fetch replies from real API endpoint using multiselect filters with AND in database
  const fetchReplies = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params: Record<string, string | number | boolean | string[] | undefined> = {
        limit: 100,
      };

      if (selectedBrandIds.length > 0) {
        params.brandIds = selectedBrandIds;
      }

      if (selectedCreatedBys.length > 0) {
        params.createdBys = selectedCreatedBys;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await apiClient.get<{
        items: ReplyModel[];
        total: number;
        page: number;
        limit: number;
      }>('/replies', { params });

      setReplies(response.data?.items || []);
      setTotal(response.data?.total || 0);
    } catch (err: unknown) {
      console.error('Failed to fetch replies:', err);
      const msg = err instanceof Error ? err.message : 'Error fetching replies from server.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBrandIds, selectedCreatedBys, searchQuery]);

  // Trigger fetch when filters or active user changes
  useEffect(() => {
    fetchReplies();
  }, [fetchReplies, user]);

  // Map brands to multiselect dropdown options
  const brandDropdownOptions: MultiSelectOption[] = useMemo(() => {
    return brandOptions.map((b) => ({
      value: b.id,
      label: b.name,
      sublabel: b.code,
      badge: b.code,
    }));
  }, [brandOptions]);

  // Map createdBy to multiselect dropdown options
  const createdByDropdownOptions: MultiSelectOption[] = useMemo(() => {
    return createdByOptions.map((cb) => ({
      value: cb,
      label: cb,
      badge: 'author',
    }));
  }, [createdByOptions]);

  const handleOpenCreate = () => {
    setReplyToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (reply: ReplyModel) => {
    setReplyToEdit(reply);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (reply: ReplyModel) => {
    setReplyToDelete(reply);
  };

  const handleFormSuccess = (saved: ReplyModel) => {
    showToast(
      replyToEdit
        ? `Reply ${saved.id.slice(0, 8)}... updated successfully!`
        : `New Reply created successfully for ${saved.brand?.name || 'brand'}!`
    );
    fetchReplies();
    // Also re-fetch distinct createdBy options if new creator added
    apiClient.get<string[]>('/replies/created-by-options').then((res) => {
      if (res.data) setCreatedByOptions(res.data);
    }).catch(() => {});
  };

  const handleDeleteSuccess = (deletedId: string) => {
    showToast(`Reply ${deletedId.slice(0, 8)}... was successfully deleted.`);
    fetchReplies();
  };

  const clearAllFilters = () => {
    setSelectedBrandIds([]);
    setSelectedCreatedBys([]);
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedBrandIds.length > 0 || selectedCreatedBys.length > 0 || searchQuery.trim().length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MessageSquareReply className="w-6 h-6 text-blue-600" />
            <span>Customer Complaint Replies</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => fetchReplies()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
            title="Reload replies from API"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            id="btn-new-reply"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-xs shadow-xs shadow-blue-500/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Reply</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Multiselect Brand & Created_by with AND) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="w-full lg:w-80 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reply content or keywords..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Multiselect Filters with AND Connection Indicator */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Filter 1: Brand (tbrand) */}
            <MultiSelectDropdown
              id="filter-brand-dropdown"
              label="Brand (tbrand)"
              options={brandDropdownOptions}
              selectedValues={selectedBrandIds}
              onChange={setSelectedBrandIds}
              icon={<Building2 className="w-3.5 h-3.5 text-blue-600" />}
            />

            {/* Visual AND connection badge in UI showing database combined filter */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider uppercase border border-slate-200">
              <span>AND</span>
            </div>

            {/* Filter 2: Created By (treplies.created_by) */}
            <MultiSelectDropdown
              id="filter-created-by-dropdown"
              label="Created By"
              options={createdByDropdownOptions}
              selectedValues={selectedCreatedBys}
              onChange={setSelectedCreatedBys}
              icon={<User className="w-3.5 h-3.5 text-purple-600" />}
            />

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Applied Filters:</span>

            {selectedBrandIds.map((bid) => {
              const b = brandOptions.find((x) => x.id === bid);
              return (
                <span
                  key={bid}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-medium border border-blue-200"
                >
                  <Building2 className="w-3 h-3 text-blue-500" />
                  <span>Brand: {b?.name || bid.slice(0, 8)}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedBrandIds(selectedBrandIds.filter((id) => id !== bid))}
                    className="hover:text-blue-900 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            {selectedBrandIds.length > 0 && selectedCreatedBys.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400 uppercase">AND</span>
            )}

            {selectedCreatedBys.map((cb) => (
              <span
                key={cb}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-800 text-[11px] font-medium border border-purple-200"
              >
                <User className="w-3 h-3 text-purple-500" />
                <span>Created By: {cb}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCreatedBys(selectedCreatedBys.filter((v) => v !== cb))}
                  className="hover:text-purple-900 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                <span>Text: "{searchQuery.trim()}"</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-slate-900 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Failed to load replies</div>
            <div className="mt-0.5">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Replies Stream</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
              {total} Total
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Current User: <strong className="text-slate-700">{user?.name}</strong> ({user?.role})
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">ID / Code</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Specialist / Author</th>
                <th className="py-3 px-4">Content Preview</th>
                <th className="py-3 px-4">Reply Date</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Loading authorized replies from database...</span>
                    </div>
                  </td>
                </tr>
              ) : replies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <MessageSquareReply className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">No replies found</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {hasActiveFilters
                          ? 'No records match the selected brand and created_by filter combination. Try clearing some filters.'
                          : 'No complaint replies recorded yet for your current RLS authorized scope.'}
                      </p>
                      {hasActiveFilters ? (
                        <button
                          type="button"
                          onClick={clearAllFilters}
                          className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenCreate}
                          className="mt-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
                        >
                          Create First Reply
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                replies.map((reply) => {
                  const brandCode = reply.brand?.code || reply.brand?.name || 'BRAND';
                  const formattedDate = new Date(reply.replyDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={reply.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-slate-800 whitespace-nowrap">
                        <span title={reply.id}>
                          #{reply.id.slice(0, 8)}
                        </span>
                      </td>

                      {/* Brand */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            brandCode === 'IBM' || brandCode === 'BRD-IBM'
                              ? 'bg-blue-100 text-blue-700'
                              : brandCode === 'NVIDIA'
                              ? 'bg-emerald-100 text-emerald-700'
                              : brandCode === 'APPLE'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {reply.brand?.name || brandCode}
                        </span>
                      </td>

                      {/* Specialist */}
                      <td className="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                        <div>{reply.specialist?.name || 'Specialist'}</div>
                        <div className="text-[10px] text-slate-400">{reply.specialist?.account}</div>
                      </td>

                      {/* Content snippet */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={reply.content}>
                        {reply.content}
                      </td>

                      {/* Reply Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {formattedDate}
                      </td>

                      {/* Created By */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
                          {reply.createdBy}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            reply.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              reply.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          ></span>
                          <span className="capitalize">{reply.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingReply(reply)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Inspect details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            id={`btn-edit-reply-${reply.id}`}
                            onClick={() => handleOpenEdit(reply)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Edit reply"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            id={`btn-delete-reply-${reply.id}`}
                            onClick={() => handleOpenDelete(reply)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Delete reply"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
          <span>
            Showing <strong>{replies.length}</strong> of <strong>{total}</strong> replies
          </span>
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
            <span>RLS Active</span>
            <span>•</span>
            <span>AND Filters Combined</span>
          </div>
        </div>
      </div>

      {/* Reply Create / Update Form Modal */}
      <ReplyFormModal
        isOpen={isFormOpen}
        replyToEdit={replyToEdit}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Reply Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!replyToDelete}
        reply={replyToDelete}
        onClose={() => setReplyToDelete(null)}
        onSuccess={handleDeleteSuccess}
      />

      {/* Inspect Detail Modal */}
      {viewingReply && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 font-mono">
                  #{viewingReply.id}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px]">
                  {viewingReply.brand?.name || 'Brand'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingReply(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Reply Content
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed text-xs">
                  "{viewingReply.content}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Brand</div>
                  <div className="font-bold text-slate-800 mt-0.5">{viewingReply.brand?.name} ({viewingReply.brand?.code})</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Specialist Author</div>
                  <div className="font-bold text-slate-800 mt-0.5">{viewingReply.specialist?.name} ({viewingReply.specialist?.account})</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Reply Timestamp</div>
                  <div className="font-bold text-slate-800 mt-0.5">{new Date(viewingReply.replyDate).toLocaleString()}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Created By (Audit)</div>
                  <div className="font-bold text-slate-800 mt-0.5 font-mono">{viewingReply.createdBy}</div>
                </div>
              </div>

              {viewingReply.brand?.proceduresSummary && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Brand Quality Standard Protocol:</span>
                  </div>
                  <p className="leading-snug text-slate-600">{viewingReply.brand.proceduresSummary}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const rep = viewingReply;
                  setViewingReply(null);
                  handleOpenEdit(rep);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit this Reply</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingReply(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
