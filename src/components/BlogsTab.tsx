import React, { useState } from 'react';
import { Search, BookOpen, Clock, User, ChevronLeft, Send, CheckCircle, Heart } from 'lucide-react';
import { INITIAL_BLOGS } from '../data';
import { BlogArticle } from '../types';

export default function BlogsTab() {
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Prevention' | 'Nutrition' | 'Survivors' | 'Research'>('all');

  // Share story form states
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [storySubmitted, setStorySubmitted] = useState(false);
  const [storyName, setStoryName] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [cancerType, setCancerType] = useState('Breast Cancer');
  const [storyContent, setStoryContent] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');

  const filteredArticles = INITIAL_BLOGS.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || art.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyName || !storyTitle || !storyContent || !email) {
      setFormError('Please fill in all the required fields.');
      return;
    }

    const newStory = {
      id: Math.random().toString(36).substr(2, 9),
      name: storyName,
      title: storyTitle,
      cancerType,
      content: storyContent,
      inspiration,
      email,
      date: new Date().toLocaleDateString(),
    };

    // Save story to localstorage
    const existing = localStorage.getItem('aware_bharat_survivor_stories');
    const list = existing ? JSON.parse(existing) : [];
    list.push(newStory);
    localStorage.setItem('aware_bharat_survivor_stories', JSON.stringify(list));

    setStorySubmitted(true);
    setFormError('');
  };

  const handleResetStoryForm = () => {
    setShowStoryForm(false);
    setStorySubmitted(false);
    setStoryName('');
    setStoryTitle('');
    setCancerType('Breast Cancer');
    setStoryContent('');
    setInspiration('');
    setEmail('');
  };

  return (
    <div className="space-y-12">
      {selectedArticle ? (
        /* Full Article Detailed Reader View */
        <article className="max-w-3xl mx-auto space-y-6 bg-white border border-outline-variant/30 rounded-3xl p-6 md:p-12 shadow-sm">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer focus:outline-none mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Articles
          </button>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">
                {selectedArticle.category}
              </span>
              <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" /> {selectedArticle.readTime}
              </span>
            </div>

            <h1 className="font-display-lg text-primary text-2xl md:text-4xl font-black leading-tight">
              {selectedArticle.title}
            </h1>

            {/* Author Credit Block */}
            <div className="flex items-center space-x-3 border-y border-outline-variant/15 py-3.5 my-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary-fixed">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary leading-tight">{selectedArticle.author}</p>
                <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{selectedArticle.role} • {selectedArticle.date}</p>
              </div>
            </div>
          </div>

          {/* Article Banner Image */}
          <div className="h-64 md:h-96 rounded-2xl overflow-hidden bg-surface-container relative shadow-sm border border-outline-variant/20">
            <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
          </div>

          {/* Main article markup-like prose container */}
          <div className="prose max-w-none text-on-surface font-body-md text-sm md:text-base leading-relaxed space-y-5 whitespace-pre-line pt-4">
            {selectedArticle.content}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-outline-variant/15 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Keywords</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedArticle.tags.map(t => (
                <span key={t} className="bg-surface-container text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary-fixed-dim/30">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </article>
      ) : (
        /* Blog List & Share Story Widget Layout */
        <div className="space-y-12">
          {/* Header section */}
          <section className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              Educational Hub
            </span>
            <h1 className="font-display-lg text-primary text-3xl md:text-5xl font-black">
              Clinical Advice & Survivor Journeys
            </h1>
            <p className="font-body-lg text-on-surface-variant">
              Demystifying oncological science, guiding post-chemotherapy dietary care, and spreading messages of hope from survivors of Bharat.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Articles Directory */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Filter controls */}
              <div className="bg-white p-4.5 border border-outline-variant/40 rounded-2xl shadow-xs space-y-3">
                <div className="relative">
                  <Search className="w-4.5 h-4.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant/70" />
                  <input
                    type="text"
                    placeholder="Search articles, tags or topics..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-white text-xs focus:border-primary outline-none"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { val: 'all', label: 'All Articles' },
                    { val: 'Prevention', label: 'Prevention & Self-Exams' },
                    { val: 'Nutrition', label: 'Oncology Nutrition' },
                    { val: 'Survivors', label: 'Survivor Stories' },
                    { val: 'Research', label: 'Clinical Tech' }
                  ].map(cat => (
                    <button
                      key={cat.val}
                      onClick={() => setCategoryFilter(cat.val as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                        categoryFilter === cat.val 
                          ? 'bg-primary text-white' 
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Articles Grid / List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredArticles.map(art => (
                  <div 
                    key={art.id} 
                    onClick={() => setSelectedArticle(art)}
                    className="bg-white border border-outline-variant/45 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 bg-surface-container-high relative overflow-hidden">
                        <img src={art.image} alt={art.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300" />
                        <span className="absolute top-3 left-3 bg-white/95 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                          {art.category}
                        </span>
                      </div>
                      <div className="p-5 space-y-2 text-left">
                        <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-1">
                          <User className="w-3 h-3 text-primary" /> {art.author} • {art.date}
                        </span>
                        <h3 className="font-title-md text-base font-bold text-primary line-clamp-2 hover:text-primary-container">
                          {art.title}
                        </h3>
                        <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                          {art.summary}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-2 border-t border-outline-variant/10 flex items-center justify-between">
                      <span className="text-[10px] text-on-surface-variant font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {art.readTime}
                      </span>
                      <span className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                        Read Article →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Share Story widget and motivational quote */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Share Story Card */}
              <div className="bg-surface-container-low border border-primary-fixed-dim/40 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <Heart className="w-5.5 h-5.5 text-secondary" fill="currentColor" />
                </div>
                <div className="space-y-1.5 text-left">
                  <h3 className="font-title-md text-base font-bold text-primary">Share Your Cancer Journey</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Have you or a loved one triumphed over oncology battles? Your story can be the exact light of hope a newly-diagnosed patient in Bharat needs today.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowStoryForm(true)}
                  className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-95 shadow-sm transition-opacity cursor-pointer"
                >
                  Write Your Survivor Story
                </button>
              </div>

              {/* Patient Helpline Card */}
              <div className="bg-primary text-white rounded-2xl p-6 shadow-xs relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <BookOpen className="w-32 h-32 text-white" />
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-container">24/7 Companion Care</p>
                  <h3 className="font-headline-lg text-lg font-bold text-white">Need immediate educational guides?</h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Download specialized pamphlets detailing self-exams, nutrition charts for chemotherapy, and state financial aids lists.
                  </p>
                </div>
                <a
                  href="mailto:resources@awarebharat.org"
                  className="block text-center py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Request Resource Kits
                </a>
              </div>
            </div>
          </div>

          {/* Share Journey Form overlay */}
          {showStoryForm && (
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="relative bg-white w-full max-w-xl rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.15)] border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-secondary-container" fill="currentColor" />
                    <span className="font-headline-lg text-lg font-bold">Write Your Survivor Story</span>
                  </div>
                  <button onClick={handleResetStoryForm} className="text-white hover:text-white p-1 rounded-full">
                    ✕
                  </button>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto flex-grow">
                  {!storySubmitted ? (
                    <form onSubmit={handleStorySubmit} className="space-y-4">
                      
                      {formError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                          {formError}
                        </div>
                      )}

                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        We publish vetted stories to encourage current patients. Your email remains confidential, and you can publish under a pseudonym if preferred.
                      </p>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                              Your Name / Alias <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={storyName}
                              onChange={e => setStoryName(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                              placeholder="e.g. Rajeshwar S."
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                              Story Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={storyTitle}
                              onChange={e => setStoryTitle(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                              placeholder="e.g. My Victory Over Stage III Lymphoma"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                              Diagnosis / Cancer Stream
                            </label>
                            <select
                              value={cancerType}
                              onChange={e => setCancerType(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                            >
                              <option value="Breast Cancer">Breast Cancer</option>
                              <option value="Lymphoma / Leukemia">Lymphoma / Leukemia</option>
                              <option value="Oral / Throat Cancer">Oral / Throat Cancer</option>
                              <option value="Lung Cancer">Lung Cancer</option>
                              <option value="Cervical Cancer">Cervical Cancer</option>
                              <option value="Others">Others</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                              Your Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                              placeholder="For verification only"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                            Your Treatment & Recovery Journey <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={4}
                            required
                            value={storyContent}
                            onChange={e => setStoryContent(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                            placeholder="Share how you detected it, which hospital helped, what treatments you underwent, and what gave you hope..."
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                            Inspirational Quote or Message for Patients
                          </label>
                          <textarea
                            rows={2}
                            value={inspiration}
                            onChange={e => setInspiration(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm"
                            placeholder="e.g. You are stronger than any chemo session. Accept support and keep moving."
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4 border-t border-outline-variant/10">
                        <button
                          type="button"
                          onClick={handleResetStoryForm}
                          className="w-1/3 py-2 rounded-lg border border-outline text-xs font-semibold text-on-surface-variant"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-grow py-2 rounded-lg bg-primary text-white font-bold text-xs flex items-center justify-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Story for Review
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-6 px-4 space-y-4 flex flex-col items-center">
                      <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <div>
                        <h3 className="font-headline-lg text-lg text-primary font-bold">Story Submitted!</h3>
                        <p className="text-xs text-on-surface-variant mt-1 max-w-sm leading-relaxed">
                          Thank you so much, <strong>{storyName}</strong>. Your story has been queued for clinical sensitivity verification. Once approved, we will publish it on our portal to inspire thousands of fighters in India.
                        </p>
                      </div>
                      <button
                        onClick={handleResetStoryForm}
                        className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
