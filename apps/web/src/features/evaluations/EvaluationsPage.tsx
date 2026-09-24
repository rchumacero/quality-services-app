import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  RefreshCw,
  Edit2,
  Eye,
  CheckCircle,
  AlertCircle,
  Building2,
  User,
  X,
  Award,
  Clock,
  Tag,
  PlusCircle,
} from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { ReplyModel, BrandModel, EvaluationModel } from '@quality-services/types';
import { MultiSelectDropdown, MultiSelectOption } from '../replies/components/MultiSelectDropdown';
import { EvaluationFormModal } from './components/EvaluationFormModal';

export const EvaluationsPage: React.FC = () => {
  const { user } = useAuth();

  // Data states
  const [replies, setReplies] = useState<ReplyModel[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter options loaded from real endpoints
  const [brandOptions, setBrandOptions] = useState<BrandModel[]>([]);
  const [createdByOptions, setCreatedByOptions] = useState<string[]>([]);
  const [tagErrorOptions, setTagErrorOptions] = useState<string[]>([]);

  // Active filter states (Three Multiselect Filters)
  const [selectedTagErrors, setSelectedTagErrors] = useState<string[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [selectedCreatedBys, setSelectedCreatedBys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [replyToEvaluate, setReplyToEvaluate] = useState<ReplyModel | null>(null);
  const [evaluationToEdit, setEvaluationToEdit] = useState<EvaluationModel | null>(null);
  const [viewingEvaluationItem, setViewingEvaluationItem] = useState<{
    reply: ReplyModel;
    evaluation: EvaluationModel;
  } | null>(null);

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load filter metadata from real endpoints
  useEffect(() => {
    let isMounted = true;
    const loadMetadata = async () => {
      try {
        const [brandsRes, createdByRes, tagErrorsRes] = await Promise.all([
          apiClient.get<{ items: BrandModel[]; total: number }>('/brands', { params: { limit: 100 } }),
          apiClient.get<string[]>('/replies/created-by-options').catch(() => ({ data: [] })),
          apiClient.get<string[]>('/evaluations/tag-error-options').catch(() => ({ data: [] })),
        ]);

        if (isMounted) {
          setBrandOptions(brandsRes.data?.items || []);
          setCreatedByOptions(createdByRes.data || []);
          setTagErrorOptions(tagErrorsRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load evaluation filter metadata:', err);
      }
    };

    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Fetch replies left-joined with tevaluation from real API endpoint using 3 multiselect filters with AND in database
  const fetchRepliesWithEvaluations = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params: Record<string, string | number | boolean | string[] | undefined> = {
        limit: 100,
      };

      // Filter 1: tag_errors (tevaluation.error_tags + 'Pending')
      if (selectedTagErrors.length > 0) {
        params.tagErrors = selectedTagErrors;
      }

      // Filter 2: brand (tbrand)
      if (selectedBrandIds.length > 0) {
        params.brandIds = selectedBrandIds;
      }

      // Filter 3: created_by (treplies.created_by)
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
      console.error('Failed to fetch replies with evaluations:', err);
      const msg = err instanceof Error ? err.message : 'Error fetching evaluation data from server.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTagErrors, selectedBrandIds, selectedCreatedBys, searchQuery]);

  // Trigger fetch when any of the 3 filters or session user changes
  useEffect(() => {
    fetchRepliesWithEvaluations();
  }, [fetchRepliesWithEvaluations, user]);

  // Map Filter 1: tag_errors options (Pending + distinct error tags)
  const tagErrorDropdownOptions: MultiSelectOption[] = useMemo(() => {
    const options: MultiSelectOption[] = [
      {
        value: 'Pending',
        label: 'Pending (No Evaluation)',
        sublabel: 'Replies waiting for QA review',
        badge: 'status',
      },
    ];

    tagErrorOptions.forEach((tag) => {
      options.push({
        value: tag,
        label: tag,
        badge: 'tag',
      });
    });

    return options;
  }, [tagErrorOptions]);

  // Map Filter 2: brand options
  const brandDropdownOptions: MultiSelectOption[] = useMemo(() => {
    return brandOptions.map((b) => ({
      value: b.id,
      label: b.name,
      sublabel: b.code,
      badge: b.code,
    }));
  }, [brandOptions]);

  // Map Filter 3: createdBy options
  const createdByDropdownOptions: MultiSelectOption[] = useMemo(() => {
    return createdByOptions.map((cb) => ({
      value: cb,
      label: cb,
      badge: 'author',
    }));
  }, [createdByOptions]);

  // Derived KPI metrics
  const evaluatedCount = useMemo(() => {
    return replies.filter((r) => r.evaluations && r.evaluations.length > 0).length;
  }, [replies]);

  const pendingCount = replies.length - evaluatedCount;

  const averageScore = useMemo(() => {
    const scores = replies
      .flatMap((r) => r.evaluations || [])
      .map((e) => e.score)
      .filter((s): s is number => typeof s === 'number');

    if (scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 10) / 10;
  }, [replies]);

  const handleOpenEvaluate = (reply: ReplyModel) => {
    setReplyToEvaluate(reply);
    setEvaluationToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditEvaluation = (reply: ReplyModel, evalItem: EvaluationModel) => {
    setReplyToEvaluate(reply);
    setEvaluationToEdit(evalItem);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (saved: EvaluationModel) => {
    showToast(
      evaluationToEdit
        ? `Evaluation updated successfully! Score: ${saved.score}/100`
        : `QA Evaluation saved! Score: ${saved.score}/100`
    );
    fetchRepliesWithEvaluations();
  };

  const clearAllFilters = () => {
    setSelectedTagErrors([]);
    setSelectedBrandIds([]);
    setSelectedCreatedBys([]);
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedTagErrors.length > 0 ||
    selectedBrandIds.length > 0 ||
    selectedCreatedBys.length > 0 ||
    searchQuery.trim().length > 0;

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
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            <span>QA Reply Evaluations</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => fetchRepliesWithEvaluations()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
            title="Reload evaluations from API"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Stream Records */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Total Replies Stream
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{total}</div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="text-slate-400 font-medium text-[11px]">Left-joined with tevaluation</span>
            </div>
          </div>
        </div>

        {/* Card 2: Evaluated */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Evaluated Replies
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{evaluatedCount}</div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                {total > 0 ? Math.round((evaluatedCount / total) * 100) : 0}% Completed
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Evaluation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Pending Evaluation
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{pendingCount}</div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[11px]">
                Awaiting Review
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Average Quality Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Avg Quality Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              {evaluatedCount > 0 ? `${averageScore}%` : 'N/A'}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="text-slate-400 font-medium text-[11px]">
                Across {evaluatedCount} audited interactions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar (Three Multiselect Filters with AND) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="w-full lg:w-72 relative">
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

          {/* 3 Multiselect Filters with AND Connection Badges */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Filter 1: tag_errors (tevaluation.tag_error + 'Pending') */}
            <MultiSelectDropdown
              id="filter-tag-errors-dropdown"
              label="Tag Errors / Pending"
              options={tagErrorDropdownOptions}
              selectedValues={selectedTagErrors}
              onChange={setSelectedTagErrors}
              icon={<Tag className="w-3.5 h-3.5 text-amber-600" />}
            />

            {/* Visual AND connection badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider uppercase border border-slate-200">
              <span>AND</span>
            </div>

            {/* Filter 2: brand (tbrand) */}
            <MultiSelectDropdown
              id="filter-eval-brand-dropdown"
              label="Brand (tbrand)"
              options={brandDropdownOptions}
              selectedValues={selectedBrandIds}
              onChange={setSelectedBrandIds}
              icon={<Building2 className="w-3.5 h-3.5 text-blue-600" />}
            />

            {/* Visual AND connection badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider uppercase border border-slate-200">
              <span>AND</span>
            </div>

            {/* Filter 3: created_by (treplies.created_by) */}
            <MultiSelectDropdown
              id="filter-eval-created-by-dropdown"
              label="Created By"
              options={createdByDropdownOptions}
              selectedValues={selectedCreatedBys}
              onChange={setSelectedCreatedBys}
              icon={<User className="w-3.5 h-3.5 text-purple-600" />}
            />

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer ml-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Applied Filter Chips */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Database Combined Filters:</span>

            {/* Tag Errors Chips */}
            {selectedTagErrors.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium border ${
                  tag === 'Pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                <Tag className="w-3 h-3 text-amber-500" />
                <span>Tag: {tag}</span>
                <button
                  type="button"
                  onClick={() => setSelectedTagErrors(selectedTagErrors.filter((t) => t !== tag))}
                  className="hover:opacity-75 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedTagErrors.length > 0 && (selectedBrandIds.length > 0 || selectedCreatedBys.length > 0) && (
              <span className="text-[10px] font-bold text-slate-400 uppercase">AND</span>
            )}

            {/* Brand Chips */}
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

            {/* Created By Chips */}
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
            <div className="font-bold">Error loading evaluation data</div>
            <div className="mt-0.5">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Main Table Card (Replies LEFT JOIN tevaluation) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Replies & QA Evaluation Stream</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
              {total} Total Records
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            SQL: <code className="font-mono text-slate-600">treply LEFT JOIN tevaluation</code>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Reply ID</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Specialist</th>
                <th className="py-3 px-4">Content Preview</th>
                <th className="py-3 px-4">Evaluation Status</th>
                <th className="py-3 px-4">QA Score</th>
                <th className="py-3 px-4">Error Tag</th>
                <th className="py-3 px-4">Evaluator</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Loading left-joined evaluation stream from server...</span>
                    </div>
                  </td>
                </tr>
              ) : replies.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <ClipboardCheck className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">No evaluation records found</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {hasActiveFilters
                          ? 'No records match the current 3-filter combination (Tag Errors AND Brand AND Created By).'
                          : 'No replies or evaluations found for your current session scope.'}
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearAllFilters}
                          className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                replies.map((reply) => {
                  const brandCode = reply.brand?.code || reply.brand?.name || 'BRAND';
                  // Left joined evaluation (if any)
                  const evaluation = reply.evaluations && reply.evaluations.length > 0 ? reply.evaluations[0] : null;

                  return (
                    <tr
                      key={reply.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Reply ID */}
                      <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-slate-800 whitespace-nowrap">
                        <span title={reply.id}>#{reply.id.slice(0, 8)}</span>
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

                      {/* Specialist Author */}
                      <td className="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                        <div>{reply.specialist?.name || 'Specialist'}</div>
                        <div className="text-[10px] text-slate-400">{reply.specialist?.account}</div>
                      </td>

                      {/* Content Preview */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={reply.content}>
                        {reply.content}
                      </td>

                      {/* Evaluation Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {evaluation ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Evaluated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Pending Evaluation
                          </span>
                        )}
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {evaluation ? (
                          <span
                            className={`font-bold text-xs ${
                              evaluation.score >= 90
                                ? 'text-emerald-600'
                                : evaluation.score >= 70
                                ? 'text-blue-600'
                                : 'text-red-600'
                            }`}
                          >
                            {evaluation.score} / 100
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      {/* Error Tag */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {evaluation?.errorTags ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium text-[11px]">
                            {evaluation.errorTags}
                          </span>
                        ) : evaluation ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium text-[11px]">
                            Compliant (No Error)
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      {/* Evaluator (Team Lead) */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        {evaluation?.teamLead ? (
                          <div>
                            <div className="font-medium text-slate-800">{evaluation.teamLead.name}</div>
                            <div className="text-[10px] text-slate-400">{evaluation.teamLead.account}</div>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {evaluation ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setViewingEvaluationItem({ reply, evaluation })}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                title="Inspect evaluation details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                id={`btn-edit-eval-${evaluation.id}`}
                                onClick={() => handleOpenEditEvaluation(reply, evaluation)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                                title="Edit evaluation"
                              >
                                <Edit2 className="w-3 h-3 text-slate-500" />
                                <span>Edit</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              id={`btn-evaluate-reply-${reply.id}`}
                              onClick={() => handleOpenEvaluate(reply)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/25 transition cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Evaluate</span>
                            </button>
                          )}
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
            Showing <strong>{replies.length}</strong> records (<strong>{evaluatedCount}</strong> evaluated, <strong>{pendingCount}</strong> pending)
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <span>AND Filters: Tag Errors & Brand & CreatedBy</span>
          </div>
        </div>
      </div>

      {/* Evaluation Form Modal (Create / Edit) */}
      <EvaluationFormModal
        isOpen={isFormOpen}
        reply={replyToEvaluate}
        existingEvaluation={evaluationToEdit}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Inspect Detail Modal */}
      {viewingEvaluationItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Evaluation for #{viewingEvaluationItem.reply.id.slice(0, 8)}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px]">
                  {viewingEvaluationItem.reply.brand?.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingEvaluationItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Reply Body */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Customer Reply Content
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed font-sans text-xs italic">
                  "{viewingEvaluationItem.reply.content}"
                </div>
              </div>

              {/* Evaluation Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Quality Score</div>
                  <div className="font-bold text-base text-blue-600 mt-0.5">
                    {viewingEvaluationItem.evaluation.score} / 100
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Error Tag</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {viewingEvaluationItem.evaluation.errorTags || 'None / Compliant'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Evaluator (Team Lead)</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {viewingEvaluationItem.evaluation.teamLead?.name || 'Team Lead'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Evaluation Date</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {new Date(viewingEvaluationItem.evaluation.evaluationDate).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {viewingEvaluationItem.evaluation.feedback && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Auditor Feedback & Coaching
                  </div>
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-slate-800 leading-relaxed text-xs">
                    {viewingEvaluationItem.evaluation.feedback}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const item = viewingEvaluationItem;
                  setViewingEvaluationItem(null);
                  handleOpenEditEvaluation(item.reply, item.evaluation);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit this Evaluation</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingEvaluationItem(null)}
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
