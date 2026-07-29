import { BookOpen, Trash2 } from 'lucide-react';
import type { BlogArticle } from '../../types';

export default function SuperAdminBlogsTab({
  newBlogCategory,
  setNewBlogCategory,
  newBlogTitle,
  setNewBlogTitle,
  newBlogSummary,
  setNewBlogSummary,
  handlePublishBlogBySuperAdmin,
  blogs,
  handleDeleteBlogBySuperAdmin,
}: {
  newBlogCategory: 'Prevention' | 'Nutrition' | 'Survivors' | 'Research';
  setNewBlogCategory: (val: 'Prevention' | 'Nutrition' | 'Survivors' | 'Research') => void;
  newBlogTitle: string;
  setNewBlogTitle: (val: string) => void;
  newBlogSummary: string;
  setNewBlogSummary: (val: string) => void;
  handlePublishBlogBySuperAdmin: (e: React.FormEvent) => void;
  blogs: BlogArticle[];
  handleDeleteBlogBySuperAdmin: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs self-start">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-4.5 h-4.5 text-indigo-600" /> Publish Executive Directive / News
        </h3>

        <form onSubmit={handlePublishBlogBySuperAdmin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Category</label>
            <select
              value={newBlogCategory}
              onChange={e => setNewBlogCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none cursor-pointer text-xs"
            >
              <option value="Prevention">Oncology Prevention</option>
              <option value="Nutrition">Nutrition Guide</option>
              <option value="Research">Research & Board Directive</option>
              <option value="Survivors">Survivor Story</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Headline Title</label>
            <input
              type="text"
              required
              value={newBlogTitle}
              onChange={e => setNewBlogTitle(e.target.value)}
              placeholder="e.g. National Cancer Awareness Board Issues New Directive"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-600 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Executive Summary</label>
            <textarea
              rows={3}
              required
              value={newBlogSummary}
              onChange={e => setNewBlogSummary(e.target.value)}
              placeholder="Write brief release notes..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-600 text-xs resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm cursor-pointer"
          >
            Publish to Public Portal
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Published Portal Articles & Directives</h3>
        <div className="space-y-3">
          {blogs.map(art => (
            <div key={art.id} className="p-3 border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-bold border border-indigo-200">{art.category}</span>
                <h4 className="font-bold text-slate-900 mt-2">{art.title}</h4>
                <p className="text-slate-400 mt-0.5">Author: {art.author} ({art.role}) • {art.date}</p>
              </div>
              <button
                onClick={() => handleDeleteBlogBySuperAdmin(art.id)}
                className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition-colors"
                title="Unpublish Article"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
