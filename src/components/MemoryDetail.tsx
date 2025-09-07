import { useState } from "react";

interface MemoryDetailProps {
  memory: any;
  onClose: () => void;
}

export function MemoryDetail({ memory, onClose }: MemoryDetailProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "event": return "from-cyan-400 to-blue-500";
      case "photo": return "from-purple-400 to-pink-500";
      case "music": return "from-green-400 to-emerald-500";
      case "calendar": return "from-yellow-400 to-orange-500";
      default: return "from-slate-400 to-slate-600";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "event": return "🎉";
      case "photo": return "📸";
      case "music": return "🎵";
      case "calendar": return "📅";
      default: return "💭";
    }
  };

  const formatCalendarDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/95 to-purple-900/95 rounded-3xl border border-cyan-500/30 shadow-2xl transition-all duration-500 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 w-10 h-10 bg-slate-800/50 hover:bg-slate-700/50 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 z-10"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-8 pb-6">
          <div className="flex items-start space-x-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getTypeColor(memory.type)} flex items-center justify-center text-2xl shadow-2xl`}>
              {getTypeIcon(memory.type)}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{memory.title}</h2>
              <p className="text-slate-300 text-lg">
                {new Date(memory.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Importance Rating */}
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-slate-400 text-sm">Importance:</span>
            <div className="flex space-x-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < memory.importance 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-400/30' 
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-white font-medium">{memory.importance}/10</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Photo Display */}
          {memory.type === "photo" && memory.imageUrl && (
            <div className="mb-6">
              <img
                src={memory.imageUrl}
                alt={memory.title}
                className="w-full max-h-96 object-cover rounded-2xl border border-white/10 shadow-2xl"
              />
            </div>
          )}

          {/* Music Display */}
          {memory.type === "music" && (
            <div className="mb-6 bg-black/30 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-2xl">
                  🎵
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{memory.musicTitle || "Unknown Title"}</h3>
                  <p className="text-slate-300">{memory.musicArtist || "Unknown Artist"}</p>
                </div>
              </div>
              {memory.musicUrl && (
                <a
                  href={memory.musicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  <span>🔗</span>
                  <span>Listen Now</span>
                </a>
              )}
            </div>
          )}

          {/* Calendar Display */}
          {memory.type === "calendar" && (
            <div className="mb-6 bg-black/30 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-xl">
                  📅
                </div>
                <div>
                  <h3 className="text-white font-semibold capitalize">{memory.calendarType} Event</h3>
                  <p className="text-slate-300 text-sm">Calendar Entry</p>
                </div>
              </div>
              <div className="space-y-2">
                {memory.calendarDate && (
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-sm">Start:</span>
                    <span className="text-white">{formatCalendarDate(memory.calendarDate)}</span>
                  </div>
                )}
                {memory.calendarEndDate && (
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-sm">End:</span>
                    <span className="text-white">{formatCalendarDate(memory.calendarEndDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-black/30 rounded-2xl p-6 mb-6 border border-white/10">
            <p className="text-slate-200 text-lg leading-relaxed">{memory.content}</p>
          </div>

          {/* Tags */}
          {memory.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 rounded-full border border-cyan-500/30 backdrop-blur-sm text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {memory.location && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Location</h3>
              <div className="flex items-center space-x-3 bg-black/30 rounded-xl p-4 border border-white/10">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-white font-medium">{memory.location.name}</p>
                  <p className="text-slate-400 text-sm">
                    {memory.location.lat.toFixed(6)}, {memory.location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105">
              Edit Memory
            </button>
            <button className="flex-1 px-6 py-3 bg-slate-800/50 text-slate-300 font-semibold rounded-xl hover:bg-slate-700/50 transition-colors border border-slate-600/50">
              Share Memory
            </button>
          </div>
        </div>

        {/* Particle Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
