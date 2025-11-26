import React from 'react';
import { UWEvent, EventTag } from '../types';
import { Clock, MapPin, CheckSquare, Square, Navigation, ChevronRight } from 'lucide-react';
import { formatTime } from '../utils';

interface EventCardProps {
  event: UWEvent;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  showSelect: boolean;
  distance?: string;
  onViewDetails?: (id: string) => void;
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
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {tag}
    </span>
  );
};

const EventCard: React.FC<EventCardProps> = ({ event, isSelected, onToggleSelect, showSelect, distance, onViewDetails }) => {
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent clicking if we clicked the select button
    if ((e.target as HTMLElement).closest('.select-btn')) return;
    if (onViewDetails) onViewDetails(event.id);
  };

  return (
    <div 
      className={`relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all border-2 flex flex-col h-full cursor-pointer group ${isSelected ? 'border-uw-purple' : 'border-transparent'}`}
      onClick={handleCardClick}
    >
      
      {showSelect && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(event.id);
          }}
          className="select-btn absolute top-2 right-2 z-10 p-1 bg-white/80 rounded-full hover:bg-white text-uw-purple"
        >
          {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
        </button>
      )}

      <div className="h-32 w-full bg-gray-200 overflow-hidden relative">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {distance && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
            <Navigation size={10} />
            {distance} away
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-bold text-uw-gold uppercase tracking-wider">{event.organizer}</span>
            <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-uw-purple transition-colors">{event.title}</h3>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-uw-purple flex-shrink-0" />
            <span>{event.date} • {formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-uw-purple flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>

        <div className="flex items-end justify-between mt-auto gap-2">
          <div className="flex flex-wrap gap-2">
            {event.tags.slice(0, 3).map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
            {event.tags.length > 3 && (
              <span className="text-xs text-gray-500 py-1">+ {event.tags.length - 3}</span>
            )}
          </div>
          <button className="text-uw-purple hover:bg-purple-50 p-1 rounded-full transition-colors">
             <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
