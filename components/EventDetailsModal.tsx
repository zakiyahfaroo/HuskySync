import React, { useState } from 'react';
import { UWEvent, EventTag } from '../types';
import { X, MapPin, Calendar, Clock, User, Navigation, Share2 } from 'lucide-react';
import MapView from './MapView';
import { formatTime } from '../utils';

interface EventDetailsModalProps {
  event: UWEvent;
  userLocation: { lat: number; lng: number } | null;
  onClose: () => void;
}

const TagBadge: React.FC<{ tag: EventTag }> = ({ tag }) => {
  let colorClass = "bg-gray-100 text-gray-800";
  
  switch (tag) {
    case EventTag.FREE_FOOD:
      colorClass = "bg-green-100 text-green-800 border-green-200";
      break;
    case EventTag.FREE_MERCH:
      colorClass = "bg-purple-100 text-purple-800 border-purple-200";
      break;
    case EventTag.RSVP_REQUIRED:
      colorClass = "bg-red-100 text-red-800 border-red-200";
      break;
    case EventTag.CAREER:
      colorClass = "bg-blue-100 text-blue-800 border-blue-200";
      break;
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
      {tag}
    </span>
  );
};

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, userLocation, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'map'>('overview');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header Image Area */}
        <div className="h-48 relative shrink-0">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
             <span className="text-uw-gold font-bold uppercase tracking-wider text-sm mb-1">{event.organizer}</span>
             <h2 className="text-3xl font-bold text-white leading-tight">{event.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'overview' ? 'text-uw-purple border-b-2 border-uw-purple bg-purple-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'map' ? 'text-uw-purple border-b-2 border-uw-purple bg-purple-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Campus Map
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="text-uw-purple shrink-0" size={20} />
                  <div>
                    <span className="block text-xs text-gray-500 font-bold uppercase">Date</span>
                    <span className="font-medium text-gray-900">{event.date}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="text-uw-purple shrink-0" size={20} />
                  <div>
                    <span className="block text-xs text-gray-500 font-bold uppercase">Time</span>
                    <span className="font-medium text-gray-900">{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="text-uw-purple shrink-0" size={20} />
                  <div>
                    <span className="block text-xs text-gray-500 font-bold uppercase">Location</span>
                    <span className="font-medium text-gray-900">{event.location}</span>
                  </div>
                </div>
                 <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="text-uw-purple shrink-0" size={20} />
                  <div>
                    <span className="block text-xs text-gray-500 font-bold uppercase">Host</span>
                    <span className="font-medium text-gray-900 truncate">{event.organizer}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">About this event</h3>
                <p className="text-gray-600 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Event Features</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(tag => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200">
               <MapView 
                  events={[event]} 
                  userLocation={userLocation} 
                  onEventSelect={() => {}} 
                  hidePopupActions={true}
               />
               <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-start gap-2">
                  <Navigation size={16} className="mt-0.5 shrink-0" />
                  <p>
                    <strong>Getting there:</strong> Head towards {event.location}. 
                    {userLocation && " Follow the map route from your current location (blue dot)."}
                  </p>
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button className="flex-1 bg-uw-purple text-white font-bold py-3 rounded-xl hover:bg-uw-dark transition-colors shadow-lg shadow-purple-200">
            RSVP Now
          </button>
          <button className="px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 text-gray-700 font-bold flex items-center gap-2">
            <Share2 size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventDetailsModal;
