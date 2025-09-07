import { useState, useEffect, useRef } from "react";

interface TimelineViewProps {
  memories: any[] | undefined;
  onMemorySelect: (memory: any) => void;
}

export function TimelineView({ memories, onMemorySelect }: TimelineViewProps) {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollY(containerRef.current.scrollTop);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "event": return "border-cyan-400 bg-cyan-400/10";
      case "photo": return "border-purple-400 bg-purple-400/10";
      case "music": return "border-green-400 bg-green-400/10";
      case "calendar": return "border-yellow-400 bg-yellow-400/10";
      case "video": return "border-red-400 bg-red-400/10";
      case "thought": return "border-indigo-400 bg-indigo-400/10";
      default: return "border-slate-400 bg-slate-400/10";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "event": return "🎉";
      case "photo": return "📸";
      case "music": return "🎵";
      case "calendar": return "📅";
      case "video": return "🎬";
      case "thought": return "💭";
      default: return "💭";
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy": return "😊";
      case "sad": return "😢";
      case "excited": return "🤩";
      case "anxious": return "😰";
      case "peaceful": return "😌";
      case "frustrated": return "😤";
      case "grateful": return "🙏";
      case "nostalgic": return "🥺";
      default: return "😐";
    }
  };

  if (!memories) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  const sortedMemories = [...memories].sort((a, b) => b.date - a.date);

  return (
    <div
      ref={containerRef}
      className="max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-cyan-500/50 hover:scrollbar-thumb-cyan-500/70"
    >
      <div className="relative max-w-4xl mx-auto">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-purple-400 to-pink-400 opacity-60" />

        {/* Timeline Items */}
        <div className="space-y-8 pb-8">
          {sortedMemories.map((memory, index) => (
            <div
              key={memory._id}
              className="relative flex items-start space-x-6 group cursor-pointer"
              onClick={() => onMemorySelect(memory)}
              style={{
                transform: `translateY(${scrollY * 0.1 * (index % 3)}px)`,
              }}
            >
              {/* Timeline Node */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full border-4 border-slate-900 shadow-lg shadow-cyan-400/50 group-hover:scale-125 transition-transform duration-300" />
                <div className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-ping opacity-30" />
              </div>

              {/* Memory Card */}
              <div className={`flex-1 ${getTypeColor(memory.type)} rounded-2xl border-2 p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(memory.type)}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{memory.title}</h3>
                      <p className="text-slate-300 text-sm">
                        {new Date(memory.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < memory.importance / 2 ? 'bg-yellow-400' : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Photo Preview */}
                {memory.type === "photo" && memory.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={memory.imageUrl}
                      alt={memory.title}
                      className="w-full h-48 object-cover rounded-xl border border-white/10"
                    />
                  </div>
                )}

                {/* Video Preview */}
                {memory.type === "video" && memory.videoUrl && (
                  <div className="mb-4">
                    <video
                      src={memory.videoUrl}
                      className="w-full h-48 object-cover rounded-xl border border-white/10"
                      controls={false}
                      muted
                    />
                  </div>
                )}

                {/* Music Preview */}
                {memory.type === "music" && (
                  <div className="mb-4 bg-black/20 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-lg">
                        🎵
                      </div>
                      <div>
                        <p className="text-white font-medium">{memory.musicTitle || "Unknown Title"}</p>
                        <p className="text-slate-400 text-sm">{memory.musicArtist || "Unknown Artist"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Calendar Preview */}
                {memory.type === "calendar" && memory.calendarDate && (
                  <div className="mb-4 bg-black/20 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-lg">
                        📅
                      </div>
                      <div>
                        <p className="text-white font-medium capitalize">{memory.calendarType} Event</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(memory.calendarDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thought Preview */}
                {memory.type === "thought" && (
                  <div className="mb-4 bg-black/20 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-violet-500 rounded-lg flex items-center justify-center text-lg">
                        {memory.mood ? getMoodIcon(memory.mood) : "💭"}
                      </div>
                      <div>
                        <p className="text-white font-medium capitalize">{memory.thoughtCategory || "Thought"}</p>
                        <p className="text-slate-400 text-sm capitalize">{memory.mood || "Neutral"} mood</p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-slate-200 mb-4 leading-relaxed">{memory.content}</p>

                {memory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {memory.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/10 text-slate-300 text-sm rounded-full border border-white/20 backdrop-blur-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {memory.location && (
                  <div className="flex items-center space-x-2 text-slate-400 text-sm">
                    <span>📍</span>
                    <span>{memory.location.name}</span>
                  </div>
                )}

                {/* Hover Effects */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedMemories.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-2xl font-semibold text-white mb-2">Your Timeline Awaits</h3>
            <p className="text-slate-300 mb-6">Start creating memories to build your personal timeline</p>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
