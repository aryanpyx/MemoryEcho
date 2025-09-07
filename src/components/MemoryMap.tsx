import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";

interface MemoryMapProps {
  onMemorySelect: (memory: any) => void;
}

export function MemoryMap({ onMemorySelect }: MemoryMapProps) {
  const memoryNodes = useQuery(api.memories.getMemoryMap);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [connections, setConnections] = useState<Array<{ from: any; to: any }>>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (memoryNodes && memoryNodes.length > 1) {
      // Generate connections between related memories
      const newConnections: Array<{ from: any; to: any }> = [];
      memoryNodes.forEach((node, i) => {
        if (i < memoryNodes.length - 1) {
          const nextNode = memoryNodes[i + 1];
          if (node.tags.some((tag: string) => nextNode.tags.includes(tag))) {
            newConnections.push({ from: node, to: nextNode });
          }
        }
      });
      setConnections(newConnections);
    }
  }, [memoryNodes]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "event": return "from-cyan-400 to-blue-500";
      case "photo": return "from-purple-400 to-pink-500";
      case "music": return "from-green-400 to-emerald-500";
      case "calendar": return "from-yellow-400 to-orange-500";
      case "video": return "from-red-400 to-rose-500";
      case "thought": return "from-indigo-400 to-violet-500";
      default: return "from-slate-400 to-slate-600";
    }
  };

  const getNodeIcon = (type: string) => {
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

  if (!memoryNodes) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-900/50 to-purple-900/50 rounded-3xl border border-cyan-500/20 overflow-auto">
      <div className="relative min-h-[600px] w-full">
        {/* Connection Lines */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {connections.map((connection, index) => (
            <line
              key={index}
              x1={connection.from.x}
              y1={connection.from.y}
              x2={connection.to.x}
              y2={connection.to.y}
              stroke="url(#connectionGradient)"
              strokeWidth="2"
              opacity="0.6"
              className="animate-pulse"
            />
          ))}
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Memory Nodes */}
        {memoryNodes.map((node) => (
          <div
            key={node._id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: node.x,
              top: node.y,
              zIndex: hoveredNode === node._id ? 10 : 2,
            }}
            onMouseEnter={() => setHoveredNode(node._id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => onMemorySelect(node)}
          >
            {/* Node Glow Effect */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-r ${getNodeColor(node.type)} opacity-20 blur-xl transition-all duration-500 group-hover:opacity-40 group-hover:scale-150`}
              style={{
                width: node.radius * 3,
                height: node.radius * 3,
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Main Node */}
            <div
              className={`relative bg-gradient-to-r ${getNodeColor(node.type)} rounded-full flex items-center justify-center text-white font-bold shadow-2xl transition-all duration-300 group-hover:scale-110 border-2 border-white/20`}
              style={{
                width: node.radius * 2,
                height: node.radius * 2,
                fontSize: node.radius * 0.6,
              }}
            >
              {getNodeIcon(node.type)}
            </div>

            {/* Hover Card */}
            {hoveredNode === node._id && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-black/90 backdrop-blur-xl rounded-2xl p-4 min-w-64 border border-cyan-500/30 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <h3 className="text-white font-semibold text-lg mb-2">{node.title}</h3>
                
                {/* Photo Preview in Hover */}
                {node.type === "photo" && node.imageUrl && (
                  <div className="mb-3">
                    <img
                      src={node.imageUrl}
                      alt={node.title}
                      className="w-full h-32 object-cover rounded-lg border border-white/10"
                    />
                  </div>
                )}

                {/* Video Preview in Hover */}
                {node.type === "video" && node.videoUrl && (
                  <div className="mb-3">
                    <video
                      src={node.videoUrl}
                      className="w-full h-32 object-cover rounded-lg border border-white/10"
                      controls={false}
                      muted
                    />
                  </div>
                )}

                {/* Music Preview in Hover */}
                {node.type === "music" && (
                  <div className="mb-3 bg-black/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🎵</span>
                      <div>
                        <p className="text-white text-sm font-medium">{node.musicTitle || "Unknown"}</p>
                        <p className="text-slate-400 text-xs">{node.musicArtist || "Unknown Artist"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Calendar Preview in Hover */}
                {node.type === "calendar" && node.calendarDate && (
                  <div className="mb-3 bg-black/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="text-white text-sm font-medium capitalize">{node.calendarType}</p>
                        <p className="text-slate-400 text-xs">
                          {new Date(node.calendarDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thought Preview in Hover */}
                {node.type === "thought" && (
                  <div className="mb-3 bg-black/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{node.mood ? getMoodIcon(node.mood) : "💭"}</span>
                      <div>
                        <p className="text-white text-sm font-medium capitalize">{node.thoughtCategory || "Thought"}</p>
                        <p className="text-slate-400 text-xs capitalize">{node.mood || "Neutral"} mood</p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-slate-300 text-sm mb-3 line-clamp-2">{node.content}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {node.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-slate-400 text-xs">
                  {new Date(node.date).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Pulse Animation */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-r ${getNodeColor(node.type)} opacity-30 animate-ping`}
              style={{
                width: node.radius * 2,
                height: node.radius * 2,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          </div>
        ))}

        {/* Empty State */}
        {memoryNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-2xl font-semibold text-white mb-2">Your Memory Map Awaits</h3>
              <p className="text-slate-300 mb-6">Create your first memory to see the magic unfold</p>
              <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
