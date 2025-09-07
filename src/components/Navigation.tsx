import { SignOutButton } from "../SignOutButton";

interface NavigationProps {
  currentView: "map" | "timeline";
  onViewChange: (view: "map" | "timeline") => void;
  onCreateMemory: () => void;
}

export function Navigation({ currentView, onViewChange, onCreateMemory }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              MemoryEcho
            </h1>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-slate-800/50 rounded-full p-1 border border-cyan-500/20">
            <button
              onClick={() => onViewChange("map")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                currentView === "map"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              Memory Map
            </button>
            <button
              onClick={() => onViewChange("timeline")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                currentView === "timeline"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              Timeline
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onCreateMemory}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
            >
              + New Memory
            </button>
            <SignOutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
