import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { LocationPicker } from "./LocationPicker";
import { Id } from "../../convex/_generated/dataModel";

interface EditMemoryProps {
  memoryId: Id<"memories">;
  onClose: () => void;
}

export function EditMemory({ memoryId, onClose }: EditMemoryProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "event" as "event" | "photo" | "music" | "calendar",
    tags: "",
    importance: 5,
    location: null as { lat: number; lng: number; name: string } | null,
    // Photo fields
    selectedImage: null as File | null,
    // Music fields
    musicUrl: "",
    musicTitle: "",
    musicArtist: "",
    // Calendar fields
    calendarDate: "",
    calendarEndDate: "",
    calendarType: "event" as "event" | "reminder" | "birthday" | "anniversary",
  });

  const memory = useQuery(api.memories.getMemory, { memoryId });
  const updateMemory = useMutation(api.memories.updateMemory);
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);

  useEffect(() => {
    if (memory) {
      setFormData({
        title: memory.title,
        content: memory.content,
        type: memory.type,
        tags: memory.tags.join(", "),
        importance: memory.importance,
        location: memory.location || null,
        selectedImage: null,
        musicUrl: memory.musicUrl || "",
        musicTitle: memory.musicTitle || "",
        musicArtist: memory.musicArtist || "",
        calendarDate: memory.calendarDate ? new Date(memory.calendarDate).toISOString().slice(0, 16) : "",
        calendarEndDate: memory.calendarEndDate ? new Date(memory.calendarEndDate).toISOString().slice(0, 16) : "",
        calendarType: memory.calendarType || "event",
      });
    }
  }, [memory]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageStorageId = memory?.imageStorageId;

      // Handle photo upload if it's a photo memory and new image selected
      if (formData.type === "photo" && formData.selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": formData.selectedImage.type },
          body: formData.selectedImage,
        });
        const json = await result.json();
        if (!result.ok) {
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        }
        imageStorageId = json.storageId;
      }

      await updateMemory({
        memoryId,
        title: formData.title,
        content: formData.content,
        type: formData.type,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        importance: formData.importance,
        location: formData.location || undefined,
        // Photo fields
        imageStorageId,
        // Music fields
        musicUrl: formData.type === "music" ? formData.musicUrl : undefined,
        musicTitle: formData.type === "music" ? formData.musicTitle : undefined,
        musicArtist: formData.type === "music" ? formData.musicArtist : undefined,
        // Calendar fields
        calendarDate: formData.type === "calendar" && formData.calendarDate ? 
          new Date(formData.calendarDate).getTime() : undefined,
        calendarEndDate: formData.type === "calendar" && formData.calendarEndDate ? 
          new Date(formData.calendarEndDate).getTime() : undefined,
        calendarType: formData.type === "calendar" ? formData.calendarType : undefined,
      });

      toast.success("Memory updated successfully! ✨");
      handleClose();
    } catch (error) {
      toast.error("Failed to update memory");
    }
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

  if (!memory) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Edit Memory
            </h2>
            <p className="text-slate-300">Update your memory details</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-white font-semibold mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-300"
                placeholder="Give your memory a title..."
                required
              />
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-white font-semibold mb-3">Memory Type</label>
              <div className="grid grid-cols-4 gap-3">
                {(["event", "photo", "music", "calendar"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      formData.type === type
                        ? `border-cyan-400 bg-gradient-to-r ${getTypeColor(type)} bg-opacity-20`
                        : "border-slate-600 bg-slate-800/30 hover:border-slate-500"
                    }`}
                  >
                    <div className="text-2xl mb-2">{getTypeIcon(type)}</div>
                    <div className="text-sm font-medium text-white capitalize">{type}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            {formData.type === "photo" && (
              <div>
                <label className="block text-white font-semibold mb-2">Update Photo</label>
                {memory.imageUrl && !formData.selectedImage && (
                  <div className="mb-4">
                    <img
                      src={memory.imageUrl}
                      alt="Current photo"
                      className="w-full h-48 object-cover rounded-xl border border-white/10"
                    />
                    <p className="text-slate-400 text-sm mt-2">Current photo - upload a new one to replace it</p>
                  </div>
                )}
                <div className="border-2 border-dashed border-purple-400/50 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, selectedImage: e.target.files?.[0] || null })}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    {formData.selectedImage ? (
                      <div>
                        <div className="text-4xl mb-2">✅</div>
                        <p className="text-purple-300 font-medium">{formData.selectedImage.name}</p>
                        <p className="text-slate-400 text-sm">Click to change photo</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-purple-300 font-medium">Click to upload a new photo</p>
                        <p className="text-slate-400 text-sm">JPG, PNG, GIF up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Music Fields */}
            {formData.type === "music" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Music URL</label>
                  <input
                    type="url"
                    value={formData.musicUrl}
                    onChange={(e) => setFormData({ ...formData, musicUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-300"
                    placeholder="https://youtube.com/watch?v=... or Spotify link"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Song Title</label>
                    <input
                      type="text"
                      value={formData.musicTitle}
                      onChange={(e) => setFormData({ ...formData, musicTitle: e.target.value })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-300"
                      placeholder="Song title"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Artist</label>
                    <input
                      type="text"
                      value={formData.musicArtist}
                      onChange={(e) => setFormData({ ...formData, musicArtist: e.target.value })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-300"
                      placeholder="Artist name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Fields */}
            {formData.type === "calendar" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Calendar Type</label>
                  <select
                    value={formData.calendarType}
                    onChange={(e) => setFormData({ ...formData, calendarType: e.target.value as any })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-300"
                  >
                    <option value="event">Event</option>
                    <option value="reminder">Reminder</option>
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      value={formData.calendarDate}
                      onChange={(e) => setFormData({ ...formData, calendarDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">End Date (Optional)</label>
                    <input
                      type="datetime-local"
                      value={formData.calendarEndDate}
                      onChange={(e) => setFormData({ ...formData, calendarEndDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div>
              <label className="block text-white font-semibold mb-2">Description</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-300 resize-none"
                rows={4}
                placeholder="Describe your memory in detail..."
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-white font-semibold mb-2">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-300"
                placeholder="family, vacation, birthday (comma separated)"
              />
            </div>

            {/* Importance */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Importance: {formData.importance}/10
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-sm">Low</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.importance}
                  onChange={(e) => setFormData({ ...formData, importance: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-slate-400 text-sm">High</span>
              </div>
              <div className="flex justify-center mt-2">
                <div className="flex space-x-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i < formData.importance 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-400/30' 
                          : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-white font-semibold mb-2">Location</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.location?.name || ""}
                  readOnly
                  className="flex-1 px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-slate-400 cursor-pointer"
                  placeholder="Click 'Select on Map' to choose location"
                />
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  📍 Select on Map
                </button>
                {formData.location && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, location: null })}
                    className="px-4 py-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-slate-800/50 text-slate-300 font-semibold rounded-xl hover:bg-slate-700/50 transition-colors border border-slate-600/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Update Memory ✨
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          onLocationSelect={(location) => {
            setFormData({ ...formData, location });
            setShowLocationPicker(false);
          }}
          initialLocation={formData.location || undefined}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </>
  );
}
