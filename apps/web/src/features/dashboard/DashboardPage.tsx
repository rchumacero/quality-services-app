import React, { useState } from 'react';
import {
  Download,
  Plus,
  CheckSquare,
  MessageSquareReply,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Eye,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Users as UsersIcon,
  X,
} from 'lucide-react';

interface AuditItem {
  id: string;
  brand: string;
  type: 'Reply QA' | 'Evaluation';
  auditor: string;
  score: number;
  status: 'Resolved' | 'In Review' | 'Critical';
}

const recentAudits: AuditItem[] = [
  {
    id: '#REV-9821',
    brand: 'Nexus Pay',
    type: 'Reply QA',
    auditor: 'Carlos Mendoza',
    score: 98,
    status: 'Resolved',
  },
  {
    id: '#REV-9820',
    brand: 'Stellar Cloud',
    type: 'Evaluation',
    auditor: 'Elena R.',
    score: 74,
    status: 'In Review',
  },
  {
    id: '#REV-9819',
    brand: 'Apex Retail',
    type: 'Reply QA',
    auditor: 'Ignacio Soto',
    score: 52,
    status: 'Critical',
  },
  {
    id: '#REV-9818',
    brand: 'Nexus Pay',
    type: 'Evaluation',
    auditor: 'Marta Vidal',
    score: 94,
    status: 'Resolved',
  },
];

const weeklyActivityData = [
  { day: 'Mon 12', audited: 65, deviation: 12 },
  { day: 'Tue 13', audited: 78, deviation: 10 },
  { day: 'Wed 14', audited: 84, deviation: 14 },
  { day: 'Thu 15', audited: 72, deviation: 15 },
  { day: 'Fri 16', audited: 88, deviation: 12 },
  { day: 'Sat 17', audited: 54, deviation: 8 },
  { day: 'Today (Sun)', audited: 62, deviation: 9 },
];

export const DashboardPage: React.FC = () => {
  const [selectedAudit, setSelectedAudit] = useState<AuditItem | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, Elena!
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-semibold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System Online • Last sync 5 mins ago</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Consolidated operations summary for quality audit, reply moderation, and brand compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Executive Report</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/25 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Evaluation</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Evaluations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Total Evaluations
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">1,420</div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                <TrendingUp className="w-3 h-3" />
                +12.4% vs last month
              </span>
              <span className="text-slate-400 font-medium text-[11px]">340 this week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Replies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Pending Replies
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <MessageSquareReply className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">84</div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
                <AlertCircle className="w-3 h-3" />
                Needs Attention
              </span>
              <span className="text-slate-400 font-medium text-[11px]">Avg SLA: 4.2h</span>
            </div>
          </div>
        </div>

        {/* Card 3: QA Conformity Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              QA Conformity Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">98.2%</div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Target Exceeded (&gt;95%)
              </span>
              <span className="text-slate-400 font-medium text-[11px]">Deviation: 1.8%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Brands */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Active Brands
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">6</div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <div className="flex -space-x-1">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                  NX
                </span>
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                  ST
                </span>
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                  AP
                </span>
                <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                  +3
                </span>
              </div>
              <span className="text-slate-400 font-medium text-[11px]">100% compliance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Charts & Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Weekly Activity Bar Chart Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Weekly Activity: Replies & Evaluations
                </h2>
                <p className="text-xs text-slate-400">
                  Daily volume of audited interactions vs. detected deviations
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
                  <span>Audited</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-100"></span>
                  <span>With Deviation</span>
                </div>
                <span className="text-slate-400">Last 7 days</span>
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 px-4">
              {weeklyActivityData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full max-w-[42px] flex items-end justify-center gap-1 h-full pb-2">
                    {/* Audited Bar */}
                    <div
                      style={{ height: `${item.audited}%` }}
                      className="w-1/2 bg-blue-600 hover:bg-blue-700 rounded-t-md transition-all relative group/bar"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none transition z-10 whitespace-nowrap">
                        {item.audited} audits
                      </div>
                    </div>

                    {/* Deviation Bar */}
                    <div
                      style={{ height: `${item.deviation * 2.5}%` }}
                      className="w-1/2 bg-blue-100 hover:bg-blue-200 rounded-t-md transition-all relative group/dev"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover/dev:opacity-100 pointer-events-none transition z-10 whitespace-nowrap">
                        {item.deviation} dev
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Stream Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Audit Stream</h2>
                <p className="text-xs text-slate-400">
                  Latest generated evaluations and classified replies
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-blue-600">
                <button
                  type="button"
                  className="hover:text-blue-700 flex items-center gap-1 transition"
                >
                  <span>View all Replies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="hover:text-blue-700 flex items-center gap-1 transition"
                >
                  <span>Go to Evaluations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">ID</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">QA Auditor</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAudits.map((audit) => {
                    const scoreColorClass =
                      audit.score >= 90
                        ? 'text-emerald-600'
                        : audit.score >= 70
                        ? 'text-slate-800'
                        : 'text-red-600';

                    return (
                      <tr
                        key={audit.id}
                        className="hover:bg-slate-50/70 transition cursor-pointer"
                        onClick={() => setSelectedAudit(audit)}
                      >
                        <td className="py-3.5 px-5 font-semibold text-slate-800">{audit.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            <span className="font-medium text-slate-800">{audit.brand}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                              audit.type === 'Reply QA'
                                ? 'bg-sky-50 text-sky-700'
                                : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {audit.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{audit.auditor}</td>
                        <td className="py-3.5 px-4 font-bold">
                          <span className={scoreColorClass}>{audit.score}/100</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {audit.status === 'Resolved' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Resolved
                            </span>
                          )}
                          {audit.status === 'In Review' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              In Review
                            </span>
                          )}
                          {audit.status === 'Critical' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Critical
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-blue-600 transition"
                            title="View details"
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
              <span>Showing 4 of 128 records audited today</span>
              <button
                type="button"
                className="font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 transition"
              >
                <span>Load more results</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): User Management, Brands Config, Deviation Distribution */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: User Management */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <UsersIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">User Management</h3>
                  <div className="text-[10px] text-slate-400">Admin &gt; Users</div>
                </div>
              </div>

              <button
                type="button"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Directory &gt;
              </button>
            </div>

            <div className="flex items-center justify-between my-4">
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  48 <span className="text-xs font-normal text-slate-500">active</span>
                </div>
                <div className="text-[11px] text-slate-400">4 pending invitations</div>
              </div>

              <div className="flex -space-x-1.5">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-semibold text-[10px] flex items-center justify-center ring-2 ring-white">
                  ER
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-semibold text-[10px] flex items-center justify-center ring-2 ring-white">
                  CM
                </div>
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-[10px] flex items-center justify-center ring-2 ring-white">
                  MV
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-semibold text-[10px] flex items-center justify-center ring-2 ring-white">
                  +45
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Invite Auditor
              </button>
              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Manage Roles
              </button>
            </div>
          </div>

          {/* Card 2: Brand Configuration */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Brand Configuration</h3>
                  <div className="text-[10px] text-slate-400">Admin &gt; Brands</div>
                </div>
              </div>

              <button
                type="button"
                className="p-1 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                title="Add brand"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Brand Item 1 */}
              <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center">
                    NP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 leading-tight">Nexus Pay</div>
                    <div className="text-[10px] text-slate-400">Rule: Tone & SLA</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800">640 tickets</div>
                  <span className="text-[10px] font-semibold text-emerald-600">Active</span>
                </div>
              </div>

              {/* Brand Item 2 */}
              <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 font-bold text-[11px] flex items-center justify-center">
                    SC
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 leading-tight">Stellar Cloud</div>
                    <div className="text-[10px] text-slate-400">Rule: Tech Escalation</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800">420 tickets</div>
                  <span className="text-[10px] font-semibold text-emerald-600">Active</span>
                </div>
              </div>

              {/* Brand Item 3 */}
              <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center">
                    AR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 leading-tight">Apex Retail</div>
                    <div className="text-[10px] text-slate-400">Rule: Return Policy</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800">360 tickets</div>
                  <span className="text-[10px] font-semibold text-red-600">Audit req.</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center justify-center gap-1 transition"
              >
                <span>View all 6 Configured Brands</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 3: Deviation Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Deviation Distribution</h3>
                <div className="text-[10px] text-slate-400">
                  Categories of detected flaws this cycle
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                Total: 54
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Flaw 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Syntactic & grammar errors
                  </span>
                  <span className="font-semibold text-slate-900">24 cases</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '44%' }}></div>
                </div>
              </div>

              {/* Flaw 2 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Impolite / Lack of empathy
                  </span>
                  <span className="font-semibold text-slate-900">18 cases</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '33%' }}></div>
                </div>
              </div>

              {/* Flaw 3 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                    Tone unsuitable for brand
                  </span>
                  <span className="font-semibold text-slate-900">12 cases</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                Impact: <span className="font-semibold text-slate-700">-0.4% on NPS</span>
              </span>
              <button
                type="button"
                className="font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Configure Criteria
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{selectedAudit.id}</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
                  {selectedAudit.brand}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Record Type</span>
                <span className="font-semibold text-slate-800">{selectedAudit.type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">QA Auditor</span>
                <span className="font-semibold text-slate-800">{selectedAudit.auditor}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Quality Score</span>
                <span className="font-bold text-sm text-blue-600">{selectedAudit.score} / 100</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-slate-800">{selectedAudit.status}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
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
