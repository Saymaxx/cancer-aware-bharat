import React from 'react';
import { BookOpen, Trash2 } from 'lucide-react';
import { BlogArticle } from '../../types';

export default function AdminBlogsTab({
  newBlogCategory,
  setNewBlogCategory,
  newBlogTitle,
  setNewBlogTitle,
  newBlogSummary,
  setNewBlogSummary,
  newBlogAuthor,
  setNewBlogAuthor,
  handlePublishBlog,
  blogs,
  handleDeleteBlog,
}: {
  newBlogCategory: 'Prevention' | 'Nutrition' | 'Survivors' | 'Research';
  setNewBlogCategory: (val: 'Prevention' | 'Nutrition' | 'Survivors' | 'Research') => void;
  newBlogTitle: string;
  setNewBlogTitle: (val: string) => void;
  newBlogSummary: string;
  setNewBlogSummary: (val: string) => void;
  newBlogAuthor: string;
  setNewBlogAuthor: (val: string) => void;
  handlePublishBlog: (e: React.FormEvent) => void;
  blogs: BlogArticle[];
  handleDeleteBlog: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.4s_ease-out]">

      {/* Blog publisher */}
      <div className="lg:col-span-1 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs self-start">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-4.5 h-4.5 text-primary" /> Publish Notice / Blog
        </h3>

        <form onSubmit={handlePublishBlog} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Post Category</label>
            <select
              value={newBlogCategory}
              onChange={e => setNewBlogCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none cursor-pointer"
            >
              <option value="Prevention">Oncology Prevention</option>
              <option value="Nutrition">Nutrition Guide</option>
              <option value="Research">Important Announcement / Research</option>
              <option value="Survivors">Survivor Story</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Title</label>
            <input
              type="text"
              required
              value={newBlogTitle}
              onChange={e => setNewBlogTitle(e.target.value)}
              placeholder="e.g. Nutrition Tips during Chemotherapy"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Abstract Summary</label>
            <textarea
              rows={3}
              required
              value={newBlogSummary}
              onChange={e => setNewBlogSummary(e.target.value)}
              placeholder="Write brief description for public readers..."
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Author</label>
            <input
              type="text"
              required
              value={newBlogAuthor}
              onChange={e => setNewBlogAuthor(e.target.value)}
              placeholder="e.g. Dr. Ramesh Sharma"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-95 shadow-sm transition-opacity cursor-pointer"
          >
            Publish to Portal News
          </button>
        </form>
      </div>

      {/* Published articles log */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Published Announcements & News</h3>

        <div className="space-y-3">
          {blogs.map((art) => (
            <div key={art.id} className="p-3 border border-outline-variant/40 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold border border-slate-200">{art.category}</span>
                <h4 className="font-bold text-slate-900 mt-2">{art.title}</h4>
                <p className="text-slate-400 mt-0.5">Author: {art.author} • {art.date}</p>
              </div>
              <button
                onClick={() => handleDeleteBlog(art.id)}
                className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition-colors"
                title="Delete Blog Article"
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
