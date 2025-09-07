import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  memories: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("event"), v.literal("photo"), v.literal("music"), v.literal("calendar"), v.literal("video"), v.literal("thought")),
    date: v.number(),
    tags: v.array(v.string()),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      name: v.string(),
    })),
    // Photo-specific fields
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    // Music-specific fields
    musicUrl: v.optional(v.string()),
    musicTitle: v.optional(v.string()),
    musicArtist: v.optional(v.string()),
    // Video-specific fields
    videoStorageId: v.optional(v.id("_storage")),
    videoUrl: v.optional(v.string()),
    videoDuration: v.optional(v.number()),
    videoThumbnailStorageId: v.optional(v.id("_storage")),
    videoThumbnailUrl: v.optional(v.string()),
    // Calendar-specific fields
    calendarDate: v.optional(v.number()),
    calendarEndDate: v.optional(v.number()),
    calendarType: v.optional(v.union(v.literal("event"), v.literal("reminder"), v.literal("birthday"), v.literal("anniversary"))),
    // Thought-specific fields
    mood: v.optional(v.union(v.literal("happy"), v.literal("sad"), v.literal("excited"), v.literal("anxious"), v.literal("peaceful"), v.literal("frustrated"), v.literal("grateful"), v.literal("nostalgic"))),
    isPrivate: v.optional(v.boolean()),
    thoughtCategory: v.optional(v.union(v.literal("reflection"), v.literal("idea"), v.literal("dream"), v.literal("goal"), v.literal("worry"), v.literal("gratitude"))),
    importance: v.number(), // 1-10 scale
    connections: v.array(v.id("memories")), // Connected memories
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_type", ["userId", "type"])
    .index("by_user_and_calendar_date", ["userId", "calendarDate"])
    .index("by_user_and_mood", ["userId", "mood"]),

  reminders: defineTable({
    userId: v.id("users"),
    memoryId: v.optional(v.id("memories")),
    title: v.string(),
    content: v.string(),
    dueDate: v.number(),
    completed: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    aiGenerated: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_due", ["userId", "dueDate"])
    .index("by_user_and_completed", ["userId", "completed"]),

  aiSuggestions: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("anniversary"), v.literal("gift"), v.literal("event"), v.literal("connection")),
    title: v.string(),
    content: v.string(),
    confidence: v.number(), // 0-1 scale
    relatedMemoryIds: v.array(v.id("memories")),
    dismissed: v.boolean(),
    actionTaken: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_dismissed", ["userId", "dismissed"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
