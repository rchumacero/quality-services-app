import React, { useState, useMemo } from 'react';
import {
  Download,
  Plus,
  CheckSquare,
  MessageSquareReply,
  Building2,
  AlertCircle,
  CheckCircle,
  Eye,
  ShieldCheck,
  Info,
  X,
  Lock,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ALL_SEED_REPLIES, SeedReply, getRepliesForUser } from './data/seedReplies';

export const DashboardPage: React.FC = () => {
  const { user, switchUser, testUsers } = useAuth();
  const [selectedReply, setSelectedReply] = useState<SeedReply | null>(null);

  // Compute replies visible strictly according to Row Level Security rules
  const visibleReplies = useMemo(() => {
    if (!user) return ALL_SEED_REPLIES;
    return getRepliesForUser(user.id, user.role, user.assignedBrands || []);
  }, [user]);

  // Derived KPI metrics for the current active user view
  const totalCount = visibleReplies.length;
  const criticalCount = visibleReplies.filter((r) => r.status === 'Critical').length;
  const inReviewCount = visibleReplies.filter((r) => r.status === 'In Review').length;
  const resolvedCount = visibleReplies.filter((r) => r.status === 'Resolved').length;

  const averageScore = useMemo(() => {
    if (visibleReplies.length === 0) return 0;
    const sum = visibleReplies.reduce((acc, r) => acc + r.score, 0);
    return Math.round((sum / visibleReplies.length) * 10) / 10;
  }, [visibleReplies]);

  // Deviation categories breakdown for current visible dataset
  const deviationsSummary = useMemo(() => {
    const condescending = visibleReplies.filter((r) => r.style === 'Condescending').length;
    const verbose = visibleReplies.filter((r) => r.style === 'Overly Verbose').length;
    const disrespectful = visibleReplies.filter((r) => r.style === 'Disrespectful').length;
    const professional = visibleReplies.filter((r) => r.style === 'Direct & Professional').length;

    return {
      condescending,
      verbose,
      disrespectful,
      professional,
      totalDeviations: condescending + verbose + disrespectful,
    };
  }, [visibleReplies]);

  // Brand summary for user's assigned brands
  const brandDescriptions: Record<string, { summary: string; color: string; bg: string }> = {
    IBM: {
      summary: 'Enterprise SLAs, mainframe telemetry, and cloud storage compliance.',
      color: 'text-blue-700',
      bg: 'bg-blue-100',
    },
    NVIDIA: {
      summary: 'GeForce & enterprise compute, 12VHPWR seating, and driver telemetry.',
      color: 'text-emerald-700',
      bg: 'bg-emerald-100',
    },
    APPLE: {
      summary: 'AppleCare diagnostics, warranty boundaries, and liquid abuse protocols.',
      color: 'text-purple-700',
      bg: 'bg-purple-100',
    },
  };

  const assignedBrandsList = user?.assignedBrands || ['IBM', 'NVIDIA'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & RLS Context Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                RLS Active •{' '}
                {user?.role === 'specialist'
                  ? 'Specialist Policy'
                  : user?.role === 'team_lead'
                  ? 'Team Lead Policy'
                  : 'Administrator Policy'}
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                user?.role === 'specialist'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : user?.role === 'team_lead'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {user?.role === 'specialist'
                ? 'Specialist (Self Only)'
                : user?.role === 'team_lead'
                ? 'Team Lead (Brand Portfolio)'
                : 'Administrator (Global Scope)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Logged in as <strong className="text-slate-700">{user?.email}</strong> • Assigned Brands:{' '}
            <span className="font-semibold text-blue-600">{assignedBrandsList.join(', ')}</span> • Data isolated by PostgreSQL Row Level Security.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export RLS Audit</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/25 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reply QA</span>
          </button>
        </div>
      </div>

      {/* RLS Scope Callout Card */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          user?.role === 'specialist'
            ? 'bg-blue-50/60 border-blue-200/80 text-blue-950'
            : user?.role === 'team_lead'
            ? 'bg-purple-50/60 border-purple-200/80 text-purple-950'
            : 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl mt-0.5 shrink-0 ${
              user?.role === 'specialist'
                ? 'bg-blue-600 text-white'
                : user?.role === 'team_lead'
                ? 'bg-purple-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-2">
              <span>PostgreSQL Row Level Security (RLS) Policy Active:</span>
              <code className="text-[11px] px-1.5 py-0.2 rounded bg-white/80 border font-mono">
                treply_select_policy
              </code>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {user?.role === 'specialist' ? (
                <>
                  As a <strong>Specialist</strong>, you can <strong>only view records created by yourself</strong> (<code>specialist_id = auth.uid()</code>). You currently see exactly <strong>{totalCount}</strong> replies you drafted for <strong>{assignedBrandsList.join(' & ')}</strong>.
                </>
              ) : user?.role === 'team_lead' ? (
                <>
                  As a <strong>Team Lead</strong>, you can view records created by yourself <em>plus</em> all replies authored by specialists assigned to your brands (<strong>{assignedBrandsList.join(', ')}</strong>). You currently see <strong>{totalCount}</strong> team replies.
                </>
              ) : (
                <>
                  As an <strong>Administrator</strong>, you have full global access across all managed brands, operations, replies, and evaluations.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-500">Quick Test Switch:</span>
          <div className="flex -space-x-1">
            {testUsers.map((tu) => (
              <button
                key={tu.id}
                type="button"
                onClick={() => switchUser(tu.email)}
                title={`Switch to ${tu.name} (${tu.role})`}
                className={`w-7 h-7 rounded-full text-[11px] font-bold border-2 transition transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                  user?.email === tu.email
                    ? 'border-blue-600 bg-blue-600 text-white z-10 shadow-sm'
                    : 'border-white bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {tu.name.charAt(0)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards (Dynamic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Visible Replies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Visible Replies (RLS)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{totalCount}</div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                <ShieldCheck className="w-3 h-3" />
                Filtered by RLS
              </span>
              <span className="text-slate-400 font-medium text-[11px]">
                {user?.role === 'specialist' ? 'Author only' : 'Team scope'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Attention Required */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Attention Required
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <MessageSquareReply className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              {criticalCount + inReviewCount}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-semibold text-[11px]">
                <AlertCircle className="w-3 h-3" />
                {criticalCount} Critical
              </span>
              <span className="text-slate-400 font-medium text-[11px]">{inReviewCount} In Review</span>
            </div>
          </div>
        </div>

        {/* Card 3: QA Conformity Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Average QA Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{averageScore}%</div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                {resolvedCount} Compliant ({resolvedCount}/{totalCount})
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Brands for User */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Assigned Brands
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              {assignedBrandsList.length}
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-xs flex-wrap">
              {assignedBrandsList.map((brand) => (
                <span
                  key={brand}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px]"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Table & Stream */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Audit Stream Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Authorized Customer Complaint Replies</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {totalCount} Visible Rows
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Showing records matching RLS criteria for{' '}
                  <span className="text-slate-600 font-semibold">{user?.email}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-blue-600">
                <span className="text-[11px] text-slate-400 font-normal">
                  Click any row to inspect reply content & audit score
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">ID</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Specialist / Author</th>
                    <th className="py-3 px-4">Tone & Civility Style</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleReplies.map((reply) => {
                    const scoreColorClass =
                      reply.score >= 90
                        ? 'text-emerald-600'
                        : reply.score >= 70
                        ? 'text-slate-800'
                        : 'text-red-600';

                    return (
                      <tr
                        key={reply.id}
                        className="hover:bg-slate-50/80 transition cursor-pointer group"
                        onClick={() => setSelectedReply(reply)}
                      >
                        <td className="py-3.5 px-5 font-semibold text-slate-800 whitespace-nowrap">
                          {reply.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              reply.brand === 'IBM'
                                ? 'bg-blue-100 text-blue-700'
                                : reply.brand === 'NVIDIA'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {reply.brand}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {reply.specialistName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                              reply.style === 'Direct & Professional'
                                ? 'bg-emerald-50 text-emerald-700'
                                : reply.style === 'Overly Verbose'
                                ? 'bg-sky-50 text-sky-700'
                                : reply.style === 'Condescending'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700 font-semibold'
                            }`}
                          >
                            {reply.style}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          <span className={scoreColorClass}>{reply.score}/100</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {reply.status === 'Resolved' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Compliant
                            </span>
                          )}
                          {reply.status === 'In Review' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              In Review
                            </span>
                          )}
                          {reply.status === 'Critical' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Critical
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            type="button"
                            className="p-1 text-slate-400 group-hover:text-blue-600 transition"
                            title="Inspect reply text"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
              <span>
                Showing <strong>{totalCount}</strong> records authorized for <strong>{user?.name}</strong>
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                SQL Filter: {user?.role === 'specialist' ? 'specialist_id = auth.uid()' : 'user_brand_managed(brand_id)'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): User Context, Brand Config, Deviation Distribution */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Active User Details & Role */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Current Session User</h3>
                  <div className="text-[10px] text-slate-400">Simulated Auth Context</div>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  user?.role === 'specialist'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {user?.role === 'specialist' ? 'Specialist' : 'Team Lead'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-bold text-slate-800">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account:</span>
                <span className="font-semibold text-slate-800">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UUID:</span>
                <span className="font-mono text-[10px] text-slate-600 truncate max-w-[170px]" title={user?.id}>
                  {user?.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Brands:</span>
                <span className="font-bold text-blue-700">{assignedBrandsList.join(', ')}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-600 mb-2">Switch Active User to Test RLS:</div>
              <div className="grid grid-cols-2 gap-2">
                {testUsers.map((tu) => (
                  <button
                    key={tu.id}
                    type="button"
                    onClick={() => switchUser(tu.email)}
                    className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer ${
                      user?.email === tu.email
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate">{tu.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{tu.role.replace('_', ' ')}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Brand Configuration (Filtered to user's assigned brands) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Assigned Brands ({assignedBrandsList.length})</h3>
                  <div className="text-[10px] text-slate-400">Quality Procedures & Policies</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {assignedBrandsList.map((brandName) => {
                const info = brandDescriptions[brandName] || {
                  summary: 'General enterprise standard procedures apply.',
                  color: 'text-blue-700',
                  bg: 'bg-blue-100',
                };
                const brandRepliesCount = visibleReplies.filter((r) => r.brand === brandName).length;

                return (
                  <div
                    key={brandName}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${info.bg} ${info.color}`}>
                          {brandName}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{brandName} Operations</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {brandRepliesCount} records
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{info.summary}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Deviation Distribution (Calculated from user's visible replies) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Response Style Distribution</h3>
                <div className="text-[10px] text-slate-400">
                  Classification of {totalCount} authorized records
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                {deviationsSummary.totalDeviations} Deviations
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Direct & Professional */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Direct & Professional
                  </span>
                  <span className="font-semibold text-slate-900">
                    {deviationsSummary.professional} cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{
                      width: `${totalCount > 0 ? (deviationsSummary.professional / totalCount) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Overly Verbose */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Overly Verbose / Slow to point
                  </span>
                  <span className="font-semibold text-slate-900">
                    {deviationsSummary.verbose} cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{
                      width: `${totalCount > 0 ? (deviationsSummary.verbose / totalCount) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Condescending */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Condescending Tone
                  </span>
                  <span className="font-semibold text-slate-900">
                    {deviationsSummary.condescending} cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{
                      width: `${totalCount > 0 ? (deviationsSummary.condescending / totalCount) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Disrespectful */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Disrespectful / Harsh
                  </span>
                  <span className="font-semibold text-slate-900">
                    {deviationsSummary.disrespectful} cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-1.5 rounded-full"
                    style={{
                      width: `${totalCount > 0 ? (deviationsSummary.disrespectful / totalCount) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit / Reply Detail Modal */}
      {selectedReply && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{selectedReply.id}</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                    selectedReply.brand === 'IBM'
                      ? 'bg-blue-100 text-blue-700'
                      : selectedReply.brand === 'NVIDIA'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {selectedReply.brand}
                </span>
                <span className="text-xs text-slate-400">• {selectedReply.dateAgo}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReply(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Customer Complaint Scenario
                </div>
                <div className="font-semibold text-slate-800 text-sm">{selectedReply.caseTitle}</div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Specialist Reply Text (Audited)
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed font-sans text-xs">
                  "{selectedReply.content}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Author Specialist</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedReply.specialistName}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Style Classification</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedReply.style}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Quality Score</div>
                  <div
                    className={`font-bold text-sm mt-0.5 ${
                      selectedReply.score >= 90
                        ? 'text-emerald-600'
                        : selectedReply.score >= 70
                        ? 'text-slate-800'
                        : 'text-red-600'
                    }`}
                  >
                    {selectedReply.score} / 100
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Audit Status</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedReply.status}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  RLS Authorization check passed: <code>auth.uid() = {user?.id}</code> has access to this record.
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedReply(null)}
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
