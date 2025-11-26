import React, { useState } from 'react';
import { UWEvent, EventTag } from '../types';
import { getPlanningAdvice, generateMarketingContent, generateFlyerImage } from '../services/geminiService';
import { formatTime } from '../utils';
import { Plus, Calendar, Sparkles, AlertCircle, Loader2, Users, Info, Megaphone, Copy, Check, Image as ImageIcon, X, ZoomIn } from 'lucide-react';

interface RSOPlannerProps {
  events: UWEvent[];
  onAddEvent: (event: UWEvent) => void;
}

const RSOPlanner: React.FC<RSOPlannerProps> = ({ events, onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<EventTag[]>([]);
  
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Marketing State
  const [generatedMarketing, setGeneratedMarketing] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [marketingLoading, setMarketingLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [activeMarketingTab, setActiveMarketingTab] = useState<'email' | 'social' | 'flyer'>('email');
  const [copied, setCopied] = useState(false);

  // New State for Image Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Advanced Conflict Detection
  const conflicts = events
    .filter(e => {
      if (e.date !== date) return false;
      // Strict time overlap check
      return (startTime < e.endTime && endTime > e.startTime);
    })
    .map(e => {
      // Analyze the nature of the conflict
      const sharedTags = e.tags.filter(t => selectedTags.includes(t));
      const isAudienceClash = sharedTags.length > 0;
      return {
        event: e,
        isAudienceClash,
        sharedTags
      };
    });

  // Events happening on the same date (context for user)
  const sameDayEvents = date 
    ? events.filter(e => e.date === date).sort((a,b) => a.startTime.localeCompare(b.startTime)) 
    : [];

  const handleGetAdvice = async () => {
    if (!date || !title) return;
    setLoadingAi(true);
    setAiAdvice(null);
    const advice = await getPlanningAdvice(events, title, description, date);
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  const handleGenerateMarketing = async (type: 'email' | 'social' | 'flyer') => {
    if (!title || !date) {
      alert("Please fill in at least the Event Title and Date first.");
      return;
    }
    setMarketingLoading(true);
    setActiveMarketingTab(type);
    setCopied(false);
    
    // Convert tags enum to string array
    const tagsList = selectedTags.map(t => t.toString());
    
    const content = await generateMarketingContent(
      title, 
      organizer, 
      date, 
      formatTime(startTime), 
      location, 
      description, 
      tagsList, 
      type
    );
    
    setGeneratedMarketing(content);
    setMarketingLoading(false);
  };

  const handleGenerateImage = async () => {
    if (!title) return;
    setImageLoading(true);
    const tagsList = selectedTags.map(t => t.toString());
    const imageUrl = await generateFlyerImage(title, description, tagsList);
    if (imageUrl) {
      setGeneratedImage(imageUrl);
    }
    setImageLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMarketing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: UWEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      organizer,
      date,
      startTime,
      endTime,
      location,
      // Add default coordinates around UW campus (Red Square) for demo purposes
      coordinates: {
        lat: 47.6559 + (Math.random() - 0.5) * 0.005,
        lng: -122.3092 + (Math.random() - 0.5) * 0.005
      },
      description,
      tags: selectedTags,
      imageUrl: generatedImage || `https://picsum.photos/400/200?random=${Date.now()}`
    };
    onAddEvent(newEvent);
    // Reset form
    setTitle('');
    setDescription('');
    setAiAdvice(null);
    setGeneratedMarketing('');
    setGeneratedImage(null);
  };

  const toggleTag = (tag: EventTag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-uw-purple mb-4 flex items-center gap-2">
          <Calendar className="text-uw-gold" />
          Plan New Event
        </h2>
        <p className="text-gray-600 mb-6">Enter your event details below. The system will automatically check for conflicts with other RSO events to ensure maximum turnout.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-uw-purple outline-none bg-white text-black" placeholder="e.g. Spring Hackathon" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RSO Name</label>
              <input required value={organizer} onChange={e => setOrganizer(e.target.value)} type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-uw-purple outline-none bg-white text-black" placeholder="e.g. Husky Coding Club" />
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input required value={date} onChange={e => setDate(e.target.value)} type="date" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-uw-purple outline-none bg-white text-black" />
              
              {/* Immediate Date Context */}
              {date && (
                <div className="mt-3 bg-indigo-50/50 rounded-lg border border-indigo-100 p-3">
                  <div className="flex items-center gap-2 mb-2">
                     <Info size={14} className="text-uw-purple" />
                     <h4 className="text-xs font-bold text-uw-purple uppercase tracking-wider">Schedule for {date}</h4>
                  </div>
                  
                  {sameDayEvents.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No events scheduled yet. Clear sailing!</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {sameDayEvents.map(evt => (
                        <div key={evt.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-100 shadow-sm text-sm">
                           <div>
                             <span className="font-bold text-gray-900 block">{evt.title}</span>
                             <span className="text-xs text-gray-500">{formatTime(evt.startTime)} - {formatTime(evt.endTime)}</span>
                           </div>
                           <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium truncate max-w-[80px]">{evt.organizer}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input required value={location} onChange={e => setLocation(e.target.value)} type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-uw-purple outline-none bg-white text-black" placeholder="e.g. HUB 145" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input required value={startTime} onChange={e => setStartTime(e.target.value)} type="time" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-uw-purple outline-none bg-white text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input required value={endTime} onChange={e => setEndTime(e.target.value)} type="time" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-uw-purple outline-none bg-white text-black" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-uw-purple outline-none bg-white text-black" placeholder="What's happening? What will you provide?" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Attributes (Tags)</label>
            <p className="text-xs text-gray-500 mb-2">Select all that apply. This helps compare your event against others.</p>
            <div className="flex flex-wrap gap-2">
              {Object.values(EventTag).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    selectedTags.includes(tag) 
                      ? 'bg-uw-purple text-white border-uw-purple' 
                      : 'bg-white text-gray-600 border-gray-300 hover:border-uw-purple'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Conflict Warning Area */}
          {conflicts.length > 0 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
               <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-center gap-2 text-red-800 font-bold mb-1">
                  <AlertCircle size={20} />
                  <span>Scheduling Conflicts Detected ({conflicts.length})</span>
                </div>
                <p className="text-sm text-red-700">Other events are happening at the same time and location.</p>
              </div>

              {/* Detailed Conflict Cards */}
              <div className="grid gap-3">
                {conflicts.map((c, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border flex items-start justify-between ${c.isAudienceClash ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div>
                      <h4 className="font-bold text-gray-900">{c.event.title}</h4>
                      <p className="text-xs text-gray-600">by {c.event.organizer} • {formatTime(c.event.startTime)} - {formatTime(c.event.endTime)}</p>
                      {c.isAudienceClash && (
                        <div className="mt-2 flex items-center gap-1 text-xs font-bold text-orange-700">
                          <Users size={12} />
                          <span>Competing for same audience: {c.sharedTags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    {c.isAudienceClash ? (
                       <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">Major Clash</span>
                    ) : (
                       <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded">Time Overlap</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Advice Area */}
            <div className="bg-uw-light rounded-lg p-4 border border-indigo-100 relative overflow-hidden flex flex-col h-full">
               <div className="flex justify-between items-start mb-2 relative z-10">
                  <h3 className="font-semibold text-uw-purple flex items-center gap-2">
                    <Sparkles size={18} />
                    Planning Assistant
                  </h3>
               </div>
               
               <div className="flex-1">
                 {loadingAi ? (
                   <div className="flex justify-center py-4 text-uw-purple">
                     <Loader2 className="animate-spin" />
                   </div>
                 ) : aiAdvice ? (
                   <div className="text-sm text-gray-700 bg-white p-3 rounded border border-indigo-50 leading-relaxed">
                     {aiAdvice}
                   </div>
                 ) : (
                   <p className="text-xs text-gray-500 italic">Fill in details to get advice on themes and how to stand out.</p>
                 )}
               </div>

               <button 
                  type="button"
                  onClick={handleGetAdvice}
                  disabled={!date || !title || loadingAi}
                  className="mt-3 w-full text-xs bg-white border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50 font-bold text-uw-purple transition-colors"
                >
                  {loadingAi ? 'Analyzing...' : 'Get Event Advice'}
                </button>
            </div>

            {/* Marketing Studio Area */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border border-purple-100 flex flex-col h-full">
               <div className="flex items-center gap-2 text-uw-purple mb-3 font-semibold">
                  <Megaphone size={18} />
                  <h3>Marketing Studio</h3>
               </div>
               
               <div className="flex gap-2 mb-3">
                  {(['email', 'social', 'flyer'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleGenerateMarketing(type)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded capitalize transition-colors ${activeMarketingTab === type ? 'bg-uw-purple text-white shadow-sm' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                    >
                      {type}
                    </button>
                  ))}
               </div>

               <div className="flex-1 relative bg-white border rounded-lg p-2 min-h-[100px] mb-2 group">
                 {marketingLoading ? (
                   <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                      <Loader2 className="animate-spin text-uw-purple" />
                   </div>
                 ) : null}
                 
                 <textarea 
                    readOnly 
                    value={generatedMarketing} 
                    className="w-full h-full text-xs text-black resize-none outline-none bg-white font-sans"
                    placeholder="Generated content will appear here..."
                 />
                 
                 {generatedMarketing && (
                   <button 
                     type="button"
                     onClick={handleCopy}
                     className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                     title="Copy to clipboard"
                   >
                     {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                   </button>
                 )}
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                    type="button"
                    onClick={() => handleGenerateMarketing(activeMarketingTab)}
                    disabled={!title || marketingLoading}
                    className="w-full text-xs bg-purple-100 border border-purple-200 px-3 py-2 rounded-md hover:bg-purple-200 disabled:opacity-50 font-bold text-uw-purple transition-colors"
                  >
                    {marketingLoading ? 'Writing...' : 'Generate Text'}
                  </button>

                  <button 
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={!title || imageLoading}
                    className="w-full text-xs bg-white border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50 font-bold text-gray-700 transition-colors flex items-center justify-center gap-1"
                  >
                    {imageLoading ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />}
                    {imageLoading ? 'Creating...' : 'Create Flyer Art'}
                  </button>
               </div>

               {generatedImage && (
                 <div 
                  className="mt-2 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group relative"
                  onClick={() => setIsImageModalOpen(true)}
                 >
                    <img src={generatedImage} alt="Generated Flyer" className="w-full h-32 object-cover transition-transform group-hover:scale-105 duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                       <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                 </div>
               )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <button 
              type="submit" 
              className="w-full bg-uw-purple text-white font-bold py-3 rounded-xl hover:bg-uw-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
            >
              <Plus size={20} />
              Publish Event
            </button>
          </div>
        </form>
      </div>

      {/* Full Screen Image Modal */}
      {isImageModalOpen && generatedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center p-4">
             <button 
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full p-2"
             >
               <X size={24} />
             </button>
             <img 
               src={generatedImage} 
               alt="Flyer Full Screen" 
               className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
               onClick={(e) => e.stopPropagation()}
             />
             <div className="mt-4 flex gap-2">
                <a 
                  href={generatedImage} 
                  download={`husky-flyer.png`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-100"
                >
                  Download Image
                </a>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RSOPlanner;