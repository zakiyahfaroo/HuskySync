import React from 'react';
import { UWEvent, EventTag } from '../types';
import { X, AlertTriangle, Check, Minus } from 'lucide-react';
import { formatTime } from '../utils';

interface CompareModalProps {
  events: UWEvent[];
  onClose: () => void;
}

const CompareModal: React.FC<CompareModalProps> = ({ events, onClose }) => {
  if (events.length === 0) return null;

  // Simple clash detection
  const checkClash = (e1: UWEvent, e2: UWEvent) => {
    if (e1.date !== e2.date) return false;
    // Simple string comparison for hh:mm works because it's 24h format
    return (e1.startTime < e2.endTime && e1.endTime > e2.startTime);
  };

  const hasClash = events.some((e1, i) => 
    events.some((e2, j) => i !== j && checkClash(e1, e2))
  );

  const allTags = Object.values(EventTag);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-uw-purple">Compare Events</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        {hasClash && (
          <div className="bg-red-50 p-3 text-red-800 text-sm flex items-center justify-center gap-2 border-b border-red-100">
            <AlertTriangle size={16} />
            <span className="font-semibold">Warning: Time Conflict Detected!</span>
             Some selected events overlap in schedule.
          </div>
        )}

        <div className="overflow-auto flex-1 p-6">
          <div className="grid" style={{ gridTemplateColumns: `150px repeat(${events.length}, minmax(200px, 1fr))` }}>
            
            {/* Header Row: Titles */}
            <div className="p-4 font-bold text-gray-500 border-b">Event</div>
            {events.map(event => (
              <div key={event.id} className="p-4 font-bold text-lg text-uw-purple border-b border-l">
                {event.title}
                <div className="text-xs text-gray-500 font-normal mt-1">by {event.organizer}</div>
              </div>
            ))}

            {/* Time Row */}
            <div className="p-4 font-semibold text-gray-600 border-b">Time</div>
            {events.map(event => (
              <div key={event.id} className="p-4 border-b border-l text-sm">
                <div className="font-medium">{event.date}</div>
                <div>{formatTime(event.startTime)} - {formatTime(event.endTime)}</div>
              </div>
            ))}

            {/* Location Row */}
            <div className="p-4 font-semibold text-gray-600 border-b">Location</div>
            {events.map(event => (
              <div key={event.id} className="p-4 border-b border-l text-sm">
                {event.location}
              </div>
            ))}

            {/* Feature Matrix */}
            {allTags.map(tag => (
              <React.Fragment key={tag}>
                <div className="p-4 text-sm text-gray-600 border-b flex items-center">{tag}</div>
                {events.map(event => {
                  const hasTag = event.tags.includes(tag);
                  return (
                    <div key={`${event.id}-${tag}`} className={`p-4 border-b border-l flex justify-center ${hasTag ? 'bg-green-50/30' : ''}`}>
                      {hasTag ? (
                        <Check size={20} className="text-green-600" />
                      ) : (
                        <Minus size={20} className="text-gray-300" />
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
