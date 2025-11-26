import React, { useState, useEffect } from 'react';
import { UWEvent, EventTag } from './types';
import { INITIAL_EVENTS } from './constants';
import EventCard from './components/EventCard';
import CompareModal from './components/CompareModal';
import RSOPlanner from './components/RSOPlanner';
import LoginPage from './components/LoginPage';
import MapView from './components/MapView';
import EventDetailsModal from './components/EventDetailsModal';
import { GraduationCap, LogOut, Filter, X, Calendar, Map as MapIcon, List, Navigation } from 'lucide-react';
import { formatTime } from './utils';

const App: React.FC = () => {
  const [events, setEvents] = useState<UWEvent[]>(INITIAL_EVENTS);
  const [userRole, setUserRole] = useState<'student' | 'rso' | null>(null);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [viewingEvent, setViewingEvent] = useState<UWEvent | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [filterTags, setFilterTags] = useState<EventTag[]>([]);
  const [filterDate, setFilterDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null); // Default: Red Square if null

  // Simulate default location (Red Square) for initial load if permission not granted
  const DEFAULT_LOCATION = { lat: 47.6559, lng: -122.3092 };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Using default location (Red Square)", error);
          setUserLocation(DEFAULT_LOCATION);
        }
      );
    } else {
       setUserLocation(DEFAULT_LOCATION);
    }
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959; // Radius of the earth in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; // Distance in miles
    return d.toFixed(1) + " mi";
  };

  const handleAddEvent = (newEvent: UWEvent) => {
    setEvents(prev => [...prev, newEvent].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)));
    alert("Event published! Switching to student view to see it.");
    setUserRole('student'); 
  };

  const toggleEventSelection = (id: string) => {
    setSelectedEventIds(prev => {
      if (prev.includes(id)) return prev.filter(eid => eid !== id);
      if (prev.length >= 3) {
        alert("You can compare up to 3 events at a time.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleViewDetails = (id: string) => {
    const event = events.find(e => e.id === id);
    if (event) setViewingEvent(event);
  };

  const toggleFilterTag = (tag: EventTag) => {
    setFilterTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setFilterTags([]);
    setFilterDate('');
  };

  const filteredEvents = events.filter(e => {
    // Filter by Date
    if (filterDate && e.date !== filterDate) return false;

    // Filter by Tags
    if (filterTags.length === 0) return true;
    return filterTags.some(tag => e.tags.includes(tag));
  });

  const eventsToCompare = events.filter(e => selectedEventIds.includes(e.id));

  if (!userRole) {
    return <LoginPage onLogin={setUserRole} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      {/* Navbar */}
      <nav className="bg-uw-purple text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <GraduationCap size={32} className="text-uw-gold" />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight leading-none">HuskySync</span>
                <span className="text-xs text-uw-gold opacity-90 font-medium uppercase tracking-wider">
                  {userRole === 'student' ? 'Student Portal' : 'RSO Dashboard'}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setUserRole(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              Switch Role
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {userRole === 'student' ? (
          <div className="space-y-6">
            
            {/* Header & View Toggle */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
                <p className="text-gray-500">Discover free food, swag, and opportunities on campus.</p>
              </div>
              
              <div className="flex bg-white p-1 rounded-lg border shadow-sm">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-uw-purple text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List size={16} /> List
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-uw-purple text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <MapIcon size={16} /> Map
                </button>
              </div>
            </div>

            {/* Robust Filter System */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Date Filter */}
                <div className="w-full md:w-auto min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <Calendar size={14} />
                    Specific Date
                  </div>
                  <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-uw-purple outline-none bg-white text-black hover:bg-white transition-colors"
                  />
                </div>

                {/* Tag Filters */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <Filter size={14} />
                    Filter by Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(EventTag).map(tag => {
                      const isActive = filterTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleFilterTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            isActive 
                              ? 'bg-uw-purple text-white border-uw-purple shadow-md' 
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear Button */}
                {(filterTags.length > 0 || filterDate) && (
                  <div className="flex items-end pb-1">
                    <button 
                      onClick={clearAllFilters}
                      className="px-4 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-red-100"
                    >
                      <X size={16} /> Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* View Content */}
            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => {
                  const distance = userLocation 
                    ? calculateDistance(userLocation.lat, userLocation.lng, event.coordinates.lat, event.coordinates.lng) 
                    : undefined;
                  
                  return (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      showSelect={true}
                      isSelected={selectedEventIds.includes(event.id)}
                      onToggleSelect={toggleEventSelection}
                      onViewDetails={handleViewDetails}
                      distance={distance}
                    />
                  );
                })}
                {filteredEvents.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                    <Filter size={48} className="mb-4 opacity-20" />
                    <p>No events found matching your filters.</p>
                    <button 
                      onClick={clearAllFilters}
                      className="mt-4 text-uw-purple font-semibold hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[600px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
                 <MapView 
                    events={filteredEvents} 
                    userLocation={userLocation} 
                    onEventSelect={handleViewDetails}
                 />
                 <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow text-xs text-gray-600 z-[400] max-w-[150px]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                      <span>You (Red Square)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-uw-purple border-2 border-white shadow"></div>
                      <span>Events</span>
                    </div>
                 </div>
              </div>
            )}

            {/* Compare Bar (Sticky at bottom if events selected) */}
            {selectedEventIds.length > 0 && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[500] bg-uw-purple text-white pl-6 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-4 animate-bounce-in border-2 border-uw-gold">
                <div className="flex flex-col">
                  <span className="font-bold text-sm leading-tight">{selectedEventIds.length} selected</span>
                  <span className="text-[10px] opacity-80">Select up to 3 to compare</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsCompareModalOpen(true)}
                    className="bg-uw-gold text-uw-purple px-4 py-2 rounded-full text-sm font-bold hover:bg-white transition-colors shadow-sm"
                  >
                    Compare
                  </button>
                  <button onClick={() => setSelectedEventIds([])} className="p-2 hover:bg-white/10 rounded-full">
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          <RSOPlanner events={events} onAddEvent={handleAddEvent} />
        )}

      </main>

      {/* Modals */}
      {isCompareModalOpen && (
        <CompareModal 
          events={eventsToCompare} 
          onClose={() => setIsCompareModalOpen(false)} 
        />
      )}

      {viewingEvent && (
        <EventDetailsModal
          event={viewingEvent}
          userLocation={userLocation}
          onClose={() => setViewingEvent(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} HuskySync. Built for UW Students & RSOs.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
