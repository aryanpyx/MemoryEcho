import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MemoryMap } from "./MemoryMap";
import { TimelineView } from "./TimelineView";
import { AISuggestions } from "./AISuggestions";
import { Navigation } from "./Navigation";
import { MemoryDetail } from "./MemoryDetail";
import { CreateMemory } from "./CreateMemory";

export function MemoryEcho() {
  const [currentView, setCurrentView] = useState<"map" | "timeline">("map");
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  const [showCreateMemory, setShowCreateMemory] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);

  const memories = useQuery(api.memories.getMemories);
  const suggestions = useQuery(api.memories.getAISuggestions);

  // Ambient particle system
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => [
        ...prev.filter(p => p.opacity > 0),
        {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: 0.3,
        }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(p => ({ ...p, opacity: p.opacity - 0.01 }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Ambient Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed w-1 h-1 bg-cyan-400 rounded-full pointer-events-none animate-pulse z-0"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.opacity * 10}px rgba(34, 211, 238, ${particle.opacity})`,
          }}
        />
      ))}

      {/* Navigation */}
      <Navigation 
        currentView={currentView}
        onViewChange={setCurrentView}
        onCreateMemory={() => setShowCreateMemory(true)}
      />

      {/* AI Suggestions */}
      <AISuggestions suggestions={suggestions} />

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 min-h-screen">
        {currentView === "map" ? (
          <MemoryMap 
            onMemorySelect={setSelectedMemory}
          />
        ) : (
          <TimelineView 
            memories={memories}
            onMemorySelect={setSelectedMemory}
          />
        )}
      </main>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <MemoryDetail
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
        />
      )}

      {/* Create Memory Modal */}
      {showCreateMemory && (
        <CreateMemory
          onClose={() => setShowCreateMemory(false)}
        />
      )}
    </div>
  );
}
