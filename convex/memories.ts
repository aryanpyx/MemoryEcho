import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMemories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memories = await ctx.db
      .query("memories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Add URLs for media memories
    const memoriesWithMedia = await Promise.all(
      memories.map(async (memory) => {
        const updatedMemory: any = { ...memory };
        
        if (memory.type === "photo" && memory.imageStorageId) {
          const imageUrl = await ctx.storage.getUrl(memory.imageStorageId);
          updatedMemory.imageUrl = imageUrl || undefined;
        }
        
        if (memory.type === "video" && memory.videoStorageId) {
          const videoUrl = await ctx.storage.getUrl(memory.videoStorageId);
          updatedMemory.videoUrl = videoUrl || undefined;
          
          if (memory.videoThumbnailStorageId) {
            const thumbnailUrl = await ctx.storage.getUrl(memory.videoThumbnailStorageId);
            updatedMemory.videoThumbnailUrl = thumbnailUrl || undefined;
          }
        }
        
        return updatedMemory;
      })
    );

    return memoriesWithMedia;
  },
});

export const getMemoryMap = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memories = await ctx.db
      .query("memories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Add URLs for media memories
    const memoriesWithMedia = await Promise.all(
      memories.map(async (memory) => {
        const updatedMemory: any = { ...memory };
        
        if (memory.type === "photo" && memory.imageStorageId) {
          const imageUrl = await ctx.storage.getUrl(memory.imageStorageId);
          updatedMemory.imageUrl = imageUrl || undefined;
        }
        
        if (memory.type === "video" && memory.videoStorageId) {
          const videoUrl = await ctx.storage.getUrl(memory.videoStorageId);
          updatedMemory.videoUrl = videoUrl || undefined;
          
          if (memory.videoThumbnailStorageId) {
            const thumbnailUrl = await ctx.storage.getUrl(memory.videoThumbnailStorageId);
            updatedMemory.videoThumbnailUrl = thumbnailUrl || undefined;
          }
        }
        
        return updatedMemory;
      })
    );

    // Transform memories into nodes with positions for the memory map
    return memoriesWithMedia.map((memory, index) => ({
      ...memory,
      x: Math.cos((index * 2 * Math.PI) / memoriesWithMedia.length) * 200 + 400,
      y: Math.sin((index * 2 * Math.PI) / memoriesWithMedia.length) * 200 + 300,
      radius: Math.max(20, memory.importance * 5),
    }));
  },
});

export const getMemory = query({
  args: { memoryId: v.id("memories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const memory = await ctx.db.get(args.memoryId);
    if (!memory || memory.userId !== userId) return null;

    const updatedMemory: any = { ...memory };
    
    // Add URLs for media memories
    if (memory.type === "photo" && memory.imageStorageId) {
      const imageUrl = await ctx.storage.getUrl(memory.imageStorageId);
      updatedMemory.imageUrl = imageUrl || undefined;
    }
    
    if (memory.type === "video" && memory.videoStorageId) {
      const videoUrl = await ctx.storage.getUrl(memory.videoStorageId);
      updatedMemory.videoUrl = videoUrl || undefined;
      
      if (memory.videoThumbnailStorageId) {
        const thumbnailUrl = await ctx.storage.getUrl(memory.videoThumbnailStorageId);
        updatedMemory.videoThumbnailUrl = thumbnailUrl || undefined;
      }
    }

    return updatedMemory;
  },
});

export const createMemory = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("event"), v.literal("photo"), v.literal("music"), v.literal("calendar"), v.literal("video"), v.literal("thought")),
    tags: v.array(v.string()),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      name: v.string(),
    })),
    importance: v.number(),
    // Photo-specific fields
    imageStorageId: v.optional(v.id("_storage")),
    // Music-specific fields
    musicUrl: v.optional(v.string()),
    musicTitle: v.optional(v.string()),
    musicArtist: v.optional(v.string()),
    // Video-specific fields
    videoStorageId: v.optional(v.id("_storage")),
    videoDuration: v.optional(v.number()),
    videoThumbnailStorageId: v.optional(v.id("_storage")),
    // Calendar-specific fields
    calendarDate: v.optional(v.number()),
    calendarEndDate: v.optional(v.number()),
    calendarType: v.optional(v.union(v.literal("event"), v.literal("reminder"), v.literal("birthday"), v.literal("anniversary"))),
    // Thought-specific fields
    mood: v.optional(v.union(v.literal("happy"), v.literal("sad"), v.literal("excited"), v.literal("anxious"), v.literal("peaceful"), v.literal("frustrated"), v.literal("grateful"), v.literal("nostalgic"))),
    isPrivate: v.optional(v.boolean()),
    thoughtCategory: v.optional(v.union(v.literal("reflection"), v.literal("idea"), v.literal("dream"), v.literal("goal"), v.literal("worry"), v.literal("gratitude"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("memories", {
      userId,
      ...args,
      date: Date.now(),
      connections: [],
    });
  },
});

export const updateMemory = mutation({
  args: {
    memoryId: v.id("memories"),
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("event"), v.literal("photo"), v.literal("music"), v.literal("calendar"), v.literal("video"), v.literal("thought")),
    tags: v.array(v.string()),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      name: v.string(),
    })),
    importance: v.number(),
    // Photo-specific fields
    imageStorageId: v.optional(v.id("_storage")),
    // Music-specific fields
    musicUrl: v.optional(v.string()),
    musicTitle: v.optional(v.string()),
    musicArtist: v.optional(v.string()),
    // Video-specific fields
    videoStorageId: v.optional(v.id("_storage")),
    videoDuration: v.optional(v.number()),
    videoThumbnailStorageId: v.optional(v.id("_storage")),
    // Calendar-specific fields
    calendarDate: v.optional(v.number()),
    calendarEndDate: v.optional(v.number()),
    calendarType: v.optional(v.union(v.literal("event"), v.literal("reminder"), v.literal("birthday"), v.literal("anniversary"))),
    // Thought-specific fields
    mood: v.optional(v.union(v.literal("happy"), v.literal("sad"), v.literal("excited"), v.literal("anxious"), v.literal("peaceful"), v.literal("frustrated"), v.literal("grateful"), v.literal("nostalgic"))),
    isPrivate: v.optional(v.boolean()),
    thoughtCategory: v.optional(v.union(v.literal("reflection"), v.literal("idea"), v.literal("dream"), v.literal("goal"), v.literal("worry"), v.literal("gratitude"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { memoryId, ...updateData } = args;
    const memory = await ctx.db.get(memoryId);
    
    if (!memory || memory.userId !== userId) {
      throw new Error("Memory not found or unauthorized");
    }

    await ctx.db.patch(memoryId, updateData);
    return memoryId;
  },
});

export const deleteMemory = mutation({
  args: { memoryId: v.id("memories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const memory = await ctx.db.get(args.memoryId);
    if (!memory || memory.userId !== userId) {
      throw new Error("Memory not found or unauthorized");
    }

    await ctx.db.delete(args.memoryId);
    return args.memoryId;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});

export const getReminders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("reminders")
      .withIndex("by_user_and_completed", (q) => q.eq("userId", userId).eq("completed", false))
      .order("asc")
      .collect();
  },
});

export const getAISuggestions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("aiSuggestions")
      .withIndex("by_user_and_dismissed", (q) => q.eq("userId", userId).eq("dismissed", false))
      .order("desc")
      .take(3);
  },
});

export const dismissSuggestion = mutation({
  args: { suggestionId: v.id("aiSuggestions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.suggestionId, { dismissed: true });
  },
});

export const getThoughts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("memories")
      .withIndex("by_user_and_type", (q) => q.eq("userId", userId).eq("type", "thought"))
      .order("desc")
      .collect();
  },
});

export const getThoughtsByMood = query({
  args: { mood: v.union(v.literal("happy"), v.literal("sad"), v.literal("excited"), v.literal("anxious"), v.literal("peaceful"), v.literal("frustrated"), v.literal("grateful"), v.literal("nostalgic")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("memories")
      .withIndex("by_user_and_mood", (q) => q.eq("userId", userId).eq("mood", args.mood))
      .order("desc")
      .collect();
  },
});
