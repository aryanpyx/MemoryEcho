import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AISuggestionsProps {
  suggestions: any[] | undefined;
}

export function AISuggestions({ suggestions }: AISuggestionsProps) {
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const dismissSuggestion = useMutation(api.memories.dismissSuggestion);

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "anniversary": return "🎂";
      case "gift": return "🎁";
      case "event": return "✨";
      case "connection": return "🔗";
      default: return "💡";
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case "anniversary": return "from-pink-400 to-rose-500";
      case "gift": return "from-green-400 to-emerald-500";
      case "event": return "from-blue-400 to-cyan-500";
      case "connection": return "from-purple-400 to-violet-500";
      default: return "from-slate-400 to-slate-600";
    }
  };

  return (
    <div className="fixed top-20 right-4 z-40 space-y-3 max-w-sm">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion._id}
          className="bg-black/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-4 shadow-2xl transform transition-all duration-500 hover:scale-105 animate-in slide-in-from-right-5 fade-in"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getSuggestionColor(suggestion.type)} flex items-center justify-center text-lg shadow-lg`}>
                {getSuggestionIcon(suggestion.type)}
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">{suggestion.title}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-cyan-300 text-xs font-medium">AI Suggestion</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => dismissSuggestion({ suggestionId: suggestion._id })}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            {suggestion.content}
          </p>

          {/* Confidence Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Confidence</span>
              <span>{Math.round(suggestion.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full bg-gradient-to-r ${getSuggestionColor(suggestion.type)} transition-all duration-1000`}
                style={{ width: `${suggestion.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              className={`flex-1 px-3 py-2 bg-gradient-to-r ${getSuggestionColor(suggestion.type)} text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
            >
              Act on This
            </button>
            <button
              onClick={() => setExpandedSuggestion(
                expandedSuggestion === suggestion._id ? null : suggestion._id
              )}
              className="px-3 py-2 bg-slate-700/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600/50 transition-colors"
            >
              {expandedSuggestion === suggestion._id ? "Less" : "More"}
            </button>
          </div>

          {/* Expanded Content */}
          {expandedSuggestion === suggestion._id && (
            <div className="mt-4 pt-4 border-t border-slate-700 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="text-xs text-slate-400 mb-2">Related Memories:</div>
              <div className="space-y-1">
                {suggestion.relatedMemoryIds.slice(0, 3).map((memoryId: string, index: number) => (
                  <div key={memoryId} className="text-xs text-slate-300 bg-slate-800/50 rounded px-2 py-1">
                    Memory #{index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getSuggestionColor(suggestion.type)} opacity-5 pointer-events-none`} />
        </div>
      ))}
    </div>
  );
}
