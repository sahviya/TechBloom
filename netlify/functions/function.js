// server/function.ts
import serverless from "serverless-http";

// server/app.ts
import dotenv from "dotenv";
import express2 from "express";
import cors from "cors";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// server/storage.ts
import { PrismaClient } from "@prisma/client";
var prisma = new PrismaClient();
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  }
  async upsertUser(userData) {
    if (!userData.id) {
      if (userData.email) {
        const existing = await prisma.user.findUnique({ where: { email: userData.email } });
        if (existing) {
          const updated = await prisma.user.update({ where: { id: existing.id }, data: { ...userData, updatedAt: /* @__PURE__ */ new Date() } });
          return updated;
        }
        const created = await prisma.user.create({ data: userData });
        return created;
      }
      throw new Error("Unable to upsert user: missing id and email");
    }
    const user = await prisma.user.upsert({
      where: { id: userData.id },
      update: { ...userData, updatedAt: /* @__PURE__ */ new Date() },
      create: { ...userData }
    });
    return user;
  }
  // Journal operations
  async createJournalEntry(entry) {
    const journalEntry = await prisma.journalEntry.create({ data: entry });
    return journalEntry;
  }
  async getJournalEntries(userId) {
    return await prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }
  async updateJournalEntry(id, userId, updates) {
    const updated = await prisma.journalEntry.updateMany({
      where: { id, userId },
      data: { ...updates, updatedAt: /* @__PURE__ */ new Date() }
    });
    if (updated.count === 0) return void 0;
    return await prisma.journalEntry.findUnique({ where: { id } });
  }
  async deleteJournalEntry(id, userId) {
    const result = await prisma.journalEntry.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }
  // Community operations
  async createCommunityPost(post) {
    const communityPost = await prisma.communityPost.create({ data: post });
    return communityPost;
  }
  async getCommunityPosts(limit = 20, offset = 0) {
    const posts = await prisma.communityPost.findMany({
      include: { user: true, likesRel: true, comments: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    });
    return posts.map((p) => ({
      ...p,
      user: p.user,
      likesCount: p.likesRel.length,
      commentsCount: p.comments.length,
      userLiked: false
    }));
  }
  async likeCommunityPost(userId, postId) {
    try {
      await prisma.postLike.create({ data: { userId, postId } });
      return true;
    } catch {
      return false;
    }
  }
  async unlikeCommunityPost(userId, postId) {
    const result = await prisma.postLike.deleteMany({ where: { userId, postId } });
    return result.count > 0;
  }
  // Comments operations
  async createPostComment(comment) {
    const postComment = await prisma.postComment.create({ data: comment });
    return postComment;
  }
  async getPostComments(postId) {
    const comments = await prisma.postComment.findMany({ where: { postId }, include: { user: true }, orderBy: { createdAt: "asc" } });
    return comments;
  }
  // Mood operations
  async createMoodEntry(mood) {
    const moodEntry = await prisma.moodEntry.create({ data: mood });
    return moodEntry;
  }
  async getMoodEntries(userId, days = 7) {
    const since = /* @__PURE__ */ new Date();
    since.setDate(since.getDate() - days);
    return await prisma.moodEntry.findMany({ where: { userId, createdAt: { gte: since } }, orderBy: { createdAt: "desc" } });
  }
  // AI conversation operations
  async createAiConversation(conversation) {
    const aiConversation = await prisma.aiConversation.create({ data: conversation });
    return aiConversation;
  }
  async getAiConversations(userId, limit = 50) {
    return await prisma.aiConversation.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: limit });
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient as PrismaClient2 } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
var prisma2 = new PrismaClient2();
var JWT_SECRET = process.env.JWT_SECRET || "devsecret";
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
var googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : void 0;
async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
    const existing = await prisma2.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "User already exists" });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma2.user.create({ data: { email, password: hash, name } });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
async function login(req, res) {
  try {
    console.log("Login attempt for:", req.body.email);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("Missing credentials");
      return res.status(400).json({ error: "Missing email or password" });
    }
    const user = await prisma2.user.findUnique({ where: { email } });
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log("Invalid password for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    console.log("Login successful for:", email);
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing Authorization header" });
  const parts = header.split(" ");
  const token = parts.length === 2 ? parts[1] : parts[0];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
async function googleLogin(req, res) {
  try {
    console.log("Starting Google login process");
    if (!googleClient) {
      console.error("Google client not configured. GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID);
      return res.status(500).json({ error: "Google client not configured" });
    }
    const { idToken } = req.body;
    console.log("Received idToken:", idToken ? "present" : "missing");
    if (!idToken) return res.status(400).json({ error: "Missing idToken" });
    const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      console.error("Google payload missing email", payload);
      return res.status(401).json({ error: "Invalid Google token" });
    }
    const email = payload.email;
    const name = payload.name || payload.given_name || null;
    const picture = payload.picture || null;
    let user = await prisma2.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma2.user.create({ data: { email, password: "", name, profileImageUrl: picture || void 0 } });
    } else if (!user.profileImageUrl && picture) {
      await prisma2.user.update({ where: { id: user.id }, data: { profileImageUrl: picture } });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name, profileImageUrl: user.profileImageUrl } });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(500).json({ error: "Google auth failed" });
  }
}

// server/gemini.ts
import { GoogleGenAI } from "@google/genai";
var ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" });
async function chatWithGenie(userMessage, context) {
  try {
    const systemPrompt = `You are a supportive AI companion called "Ur Genie" in the MindBloom wellness app. 
    You embody the wisdom and magical support of a caring genie friend. Your role is to:
    
    - Provide empathetic, supportive responses to users sharing their thoughts and feelings
    - Offer gentle encouragement and practical wellness suggestions
    - Use magical, mystical language occasionally but keep it natural and helpful
    - Be warm, understanding, and non-judgmental
    - Suggest breathing exercises, mindfulness practices, or positive activities when appropriate
    - Keep responses concise but meaningful (2-4 sentences)
    - Use emojis sparingly and appropriately
    
    Respond with JSON in this format:
    {
      "message": "Your supportive response",
      "tone": "supportive|encouraging|empathetic|motivational",
      "suggestions": ["optional array of helpful suggestions"]
    }`;
    const contextualPrompt = context ? `Previous context: ${context}

User message: ${userMessage}` : `User message: ${userMessage}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            message: { type: "string" },
            tone: { type: "string", enum: ["supportive", "encouraging", "empathetic", "motivational"] },
            suggestions: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["message", "tone"]
        }
      },
      contents: contextualPrompt
    });
    const rawJson = response.text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error in chatWithGenie:", error);
    return {
      message: "I'm here to support you, though I'm having a magical moment of silence right now. How are you feeling today? \u2728",
      tone: "supportive"
    };
  }
}
async function analyzeMoodFromText(text2) {
  try {
    const systemPrompt = `Analyze the emotional tone and mood from the given text.
    Determine the primary mood and provide insights.
    
    Respond with JSON in this format:
    {
      "mood": "very_happy|happy|neutral|sad|very_sad",
      "confidence": 0.0-1.0,
      "insights": ["array of emotional insights"]
    }`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            mood: { type: "string", enum: ["very_happy", "happy", "neutral", "sad", "very_sad"] },
            confidence: { type: "number" },
            insights: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["mood", "confidence", "insights"]
        }
      },
      contents: text2
    });
    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error in analyzeMoodFromText:", error);
    return {
      mood: "neutral",
      confidence: 0.5,
      insights: ["Unable to analyze mood at this time"]
    };
  }
}
async function generateMotivationalQuote() {
  try {
    const systemPrompt = `Generate an inspiring, uplifting motivational quote.
    The quote should be positive, encouraging, and suitable for a wellness app.
    
    Respond with JSON in this format:
    {
      "quote": "The inspirational quote text",
      "author": "Author name or 'Unknown' if original",
      "theme": "Brief theme description"
    }`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            quote: { type: "string" },
            author: { type: "string" },
            theme: { type: "string" }
          },
          required: ["quote", "author", "theme"]
        }
      },
      contents: "Generate a motivational quote for today"
    });
    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error in generateMotivationalQuote:", error);
    return {
      quote: "Every moment is a fresh beginning.",
      author: "T.S. Eliot",
      theme: "New beginnings"
    };
  }
}

// shared/schema.ts
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  theme: varchar("theme").default("dark"),
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title"),
  content: text("content").notNull(),
  mood: varchar("mood"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  imageUrl: varchar("image_url"),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow()
});
var postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var moodEntries = pgTable("mood_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mood: varchar("mood").notNull(),
  // "very_happy", "happy", "neutral", "sad", "very_sad"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var aiConversations = pgTable("ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var bookReadings = pgTable("book_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: varchar("book_id").notNull(),
  currentPage: integer("current_page").default(1),
  totalPages: integer("total_pages"),
  readingTheme: varchar("reading_theme").default("light"),
  // light, dark, sepia
  fontSize: integer("font_size").default(16),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var bookBookmarks = pgTable("book_bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: varchar("book_id").notNull(),
  pageNumber: integer("page_number").notNull(),
  title: varchar("title"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var bookHighlights = pgTable("book_highlights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: varchar("book_id").notNull(),
  pageNumber: integer("page_number").notNull(),
  text: text("text").notNull(),
  color: varchar("color").default("yellow"),
  // yellow, green, blue, pink
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  journalEntries: many(journalEntries),
  communityPosts: many(communityPosts),
  postLikes: many(postLikes),
  postComments: many(postComments),
  moodEntries: many(moodEntries),
  aiConversations: many(aiConversations),
  bookReadings: many(bookReadings),
  bookBookmarks: many(bookBookmarks),
  bookHighlights: many(bookHighlights)
}));
var journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id]
  })
}));
var communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id]
  }),
  likes: many(postLikes),
  comments: many(postComments)
}));
var postLikesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id]
  }),
  post: one(communityPosts, {
    fields: [postLikes.postId],
    references: [communityPosts.id]
  })
}));
var postCommentsRelations = relations(postComments, ({ one }) => ({
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id]
  }),
  post: one(communityPosts, {
    fields: [postComments.postId],
    references: [communityPosts.id]
  })
}));
var moodEntriesRelations = relations(moodEntries, ({ one }) => ({
  user: one(users, {
    fields: [moodEntries.userId],
    references: [users.id]
  })
}));
var aiConversationsRelations = relations(aiConversations, ({ one }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  likes: true,
  createdAt: true,
  updatedAt: true
});
var insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  createdAt: true
});
var insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true
});
var insertBookReadingSchema = createInsertSchema(bookReadings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertBookBookmarkSchema = createInsertSchema(bookBookmarks).omit({
  id: true,
  createdAt: true
});
var insertBookHighlightSchema = createInsertSchema(bookHighlights).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
import { readdir } from "fs/promises";
import { join } from "path";
async function registerRoutes(app2) {
  app2.use("/books", express.static(join(process.cwd(), "client", "public", "books")));
  app2.use("/ted-thumbnails", express.static(join(process.cwd(), "client", "public", "ted-thumbnails")));
  app2.post("/api/auth/register", register);
  app2.post("/api/auth/login", login);
  app2.post("/api/auth/google", googleLogin);
  app2.get("/api/auth/user", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.patch("/api/user/profile", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const updates = req.body;
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...updates
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.get("/api/journal", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });
  app2.post("/api/journal", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const entryData = insertJournalEntrySchema.parse({
        ...req.body,
        userId
      });
      const moodAnalysis = await analyzeMoodFromText(entryData.content);
      entryData.mood = moodAnalysis.mood;
      const entry = await storage.createJournalEntry(entryData);
      await storage.createMoodEntry({
        userId,
        mood: moodAnalysis.mood,
        notes: `From journal: ${entryData.title || "Untitled entry"}`
      });
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });
  app2.patch("/api/journal/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const entryId = req.params.id;
      const updates = req.body;
      if (updates.content) {
        const moodAnalysis = await analyzeMoodFromText(updates.content);
        updates.mood = moodAnalysis.mood;
      }
      const entry = await storage.updateJournalEntry(entryId, userId, updates);
      res.json(entry);
    } catch (error) {
      console.error("Error updating journal entry:", error);
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });
  app2.delete("/api/journal/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const entryId = req.params.id;
      const success = await storage.deleteJournalEntry(entryId, userId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });
  app2.get("/api/community/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      const posts = await storage.getCommunityPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });
  app2.post("/api/community/posts", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const { imageBase64, ...bodyData } = req.body;
      let imageUrl = null;
      if (imageBase64 && typeof imageBase64 === "string") {
        imageUrl = imageBase64;
      }
      const postData = insertCommunityPostSchema.parse({
        ...bodyData,
        userId,
        imageUrl
      });
      const post = await storage.createCommunityPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(500).json({ message: "Failed to create community post" });
    }
  });
  app2.post("/api/community/posts/:id/like", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const postId = req.params.id;
      const success = await storage.likeCommunityPost(userId, postId);
      res.json({ success });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });
  app2.delete("/api/community/posts/:id/like", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const postId = req.params.id;
      const success = await storage.unlikeCommunityPost(userId, postId);
      res.json({ success });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });
  app2.get("/api/community/posts/:id/comments", async (req, res) => {
    try {
      const postId = req.params.id;
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  app2.post("/api/community/posts/:id/comments", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const postId = req.params.id;
      const commentData = insertPostCommentSchema.parse({
        ...req.body,
        userId,
        postId
      });
      const comment = await storage.createPostComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });
  app2.get("/api/mood", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const days = parseInt(req.query.days) || 7;
      const moods = await storage.getMoodEntries(userId, days);
      res.json(moods);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });
  app2.post("/api/mood", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const moodData = insertMoodEntrySchema.parse({
        ...req.body,
        userId
      });
      const mood = await storage.createMoodEntry(moodData);
      res.json(mood);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(500).json({ message: "Failed to create mood entry" });
    }
  });
  app2.get("/api/ai/conversations", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit) || 50;
      const conversations = await storage.getAiConversations(userId, limit);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching AI conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  app2.post("/api/ai/chat", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      const response = await chatWithGenie(message, context);
      await storage.createAiConversation({
        userId,
        message,
        response: response.message
      });
      res.json(response);
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });
  app2.get("/api/content/quote", async (req, res) => {
    try {
      const quote = await generateMotivationalQuote();
      res.json(quote);
    } catch (error) {
      console.error("Error generating quote:", error);
      res.status(500).json({ message: "Failed to generate quote" });
    }
  });
  app2.get("/api/media/movies", async (req, res) => {
    res.json([
      {
        id: 1,
        title: "The Pursuit of Happyness",
        genre: "Drama \u2022 Inspiration",
        thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1",
        videoId: "dKi5XoeTN0k",
        // YouTube video ID
        description: "A struggling salesman takes custody of his son as he's poised to begin a life-changing professional career."
      },
      {
        id: 2,
        title: "Soul",
        genre: "Animation \u2022 Philosophy",
        thumbnail: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9",
        videoId: "xOsLiwp0A-M",
        // YouTube video ID
        description: "A musician who has lost his passion for music is transported out of his body and must find his way back."
      },
      {
        id: 3,
        title: "Inside Out",
        genre: "Animation \u2022 Emotional",
        thumbnail: "https://images.unsplash.com/photo-1489599613-e715e6ebe90d",
        videoId: "yRUAzGQ3nSY",
        // YouTube video ID
        description: "After young Riley is uprooted from her Midwest life and moved to San Francisco, her emotions conflict on how best to navigate a new city."
      },
      {
        id: 4,
        title: "The Secret Life of Walter Mitty",
        genre: "Adventure \u2022 Inspiration",
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        videoId: "QD6cy4PBQPI",
        // YouTube video ID
        description: "When his job along with that of his co-worker are threatened, Walter takes action in the real world embarking on a global journey."
      },
      {
        id: 5,
        title: "Good Will Hunting",
        genre: "Drama \u2022 Growth",
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        videoId: "QSMvyuEeIyw",
        // YouTube video ID
        description: "Will Hunting, a janitor at M.I.T., has a gift for mathematics, but needs help from a psychologist to find direction in his life."
      }
    ]);
  });
  app2.get("/api/media/movies/search", async (req, res) => {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      const query = req.query.q || "";
      if (!apiKey) {
        return res.status(500).json({ message: "Missing YOUTUBE_API_KEY" });
      }
      if (!query) {
        return res.json([]);
      }
      const params = new URLSearchParams({
        key: apiKey,
        part: "snippet",
        q: query,
        maxResults: "24",
        type: "video",
        videoEmbeddable: "true",
        safeSearch: "moderate"
      });
      const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
      const data = await ytRes.json();
      const items = (data.items || []).map((it, idx) => ({
        id: it.id?.videoId || idx,
        title: it.snippet?.title || "Untitled",
        genre: it.snippet?.channelTitle || "YouTube",
        thumbnail: it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url,
        videoId: it.id?.videoId,
        description: it.snippet?.description || ""
      }));
      res.json(items);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ message: "Failed to search movies" });
    }
  });
  app2.get("/api/media/music", async (req, res) => {
    res.json([
      {
        id: 1,
        title: "Three Little Birds",
        artist: "Bob Marley",
        mood: "Uplifting",
        trackId: "0JG5IlmQdM6BKlqpxkDW",
        // Spotify track ID
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        previewUrl: "https://p.scdn.co/mp3-preview/example1"
      },
      {
        id: 2,
        title: "Happy",
        artist: "Pharrell Williams",
        mood: "Joyful",
        trackId: "60nZcImufyMA1MKQY3dcC",
        // Spotify track ID
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        previewUrl: "https://p.scdn.co/mp3-preview/example2"
      },
      {
        id: 3,
        title: "Here Comes the Sun",
        artist: "The Beatles",
        mood: "Hopeful",
        trackId: "6dGnYIeXmHdcikdzNNDMm2",
        // Spotify track ID
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        previewUrl: "https://p.scdn.co/mp3-preview/example3"
      },
      {
        id: 4,
        title: "Good Vibrations",
        artist: "The Beach Boys",
        mood: "Positive",
        trackId: "2hZI2AO4gOBlBf4J7kqDkT",
        // Spotify track ID
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        previewUrl: "https://p.scdn.co/mp3-preview/example4"
      },
      {
        id: 5,
        title: "I Can See Clearly Now",
        artist: "Johnny Nash",
        mood: "Optimistic",
        trackId: "0oRL9MD8wWfkdUFdtK6kc",
        // Spotify track ID
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        previewUrl: "https://p.scdn.co/mp3-preview/example5"
      }
    ]);
  });
  app2.get("/api/media/ted-talks", async (req, res) => {
    const talks = [
      {
        id: 1,
        title: "The Power of Vulnerability",
        speaker: "Bren\xE9 Brown",
        duration: "20:50",
        talkId: "iCvmsMzlF7o",
        thumbnail: "/ted-thumbnails/iCvmsMzlF7o.jpg",
        embedUrl: "https://embed.ted.com/talks/lang/en/brene_brown_the_power_of_vulnerability",
        description: "Bren\xE9 Brown studies human connection \u2014 our ability to empathize, belong, love."
      },
      {
        id: 2,
        title: "How to Make Stress Your Friend",
        speaker: "Kelly McGonigal",
        duration: "14:28",
        talkId: "RcGyVTAoXEU",
        thumbnail: "/ted-thumbnails/RcGyVTAoXEU.jpg",
        embedUrl: "https://embed.ted.com/talks/lang/en/kelly_mcgonigal_how_to_make_stress_your_friend",
        description: "Psychologist Kelly McGonigal urges us to see stress as a positive, and introduces us to an unsung mechanism for stress reduction."
      },
      {
        id: 3,
        title: "The Happy Secret to Better Work",
        speaker: "Shawn Achor",
        duration: "12:20",
        talkId: "GXy__kBVq1M",
        thumbnail: "/ted-thumbnails/GXy__kBVq1M.jpg",
        embedUrl: "https://embed.ted.com/talks/lang/en/shawn_achor_the_happy_secret_to_better_work",
        description: "We believe we should work hard in order to be happy, but could we be thinking about things backwards?"
      },
      {
        id: 4,
        title: "Your Body Language May Shape Who You Are",
        speaker: "Amy Cuddy",
        duration: "21:02",
        talkId: "Ks-_Mh1QhMc",
        thumbnail: "/ted-thumbnails/Ks-_Mh1QhMc.jpg",
        embedUrl: "https://embed.ted.com/talks/lang/en/amy_cuddy_your_body_language_may_shape_who_you_are",
        description: "Body language affects how others see us, but it may also change how we see ourselves."
      },
      {
        id: 5,
        title: "The Puzzle of Motivation",
        speaker: "Dan Pink",
        duration: "18:36",
        talkId: "rrkrvAUbU9Y",
        thumbnail: "/ted-thumbnails/rrkrvAUbU9Y.jpg",
        embedUrl: "https://embed.ted.com/talks/lang/en/dan_pink_the_puzzle_of_motivation",
        description: "Career analyst Dan Pink examines the puzzle of motivation, starting with a fact that social scientists know but most managers don't."
      }
    ];
    res.json(talks);
  });
  app2.get("/api/media/shorts", async (req, res) => {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      const query = req.query.q || "funny shorts";
      if (!apiKey) {
        return res.status(500).json({ message: "Missing YOUTUBE_API_KEY" });
      }
      const params = new URLSearchParams({
        key: apiKey,
        part: "snippet",
        q: query,
        maxResults: "20",
        type: "video",
        videoEmbeddable: "true",
        safeSearch: "moderate",
        videoDuration: "short"
      });
      const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
      const data = await ytRes.json();
      const items = (data.items || []).map((it, idx) => ({
        id: it.id?.videoId || idx,
        title: it.snippet?.title || "Short",
        channel: it.snippet?.channelTitle || "YouTube",
        thumbnail: it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url,
        videoId: it.id?.videoId
      }));
      res.json(items);
    } catch (error) {
      console.error("Error fetching shorts:", error);
      res.status(500).json({ message: "Failed to load shorts" });
    }
  });
  app2.get("/api/games", async (req, res) => {
    res.json([
      { id: 1, title: "Peaceful Puzzles", description: "Relaxing jigsaw puzzles", icon: "puzzle-piece", url: "https://www.jigsawplanet.com" },
      { id: 2, title: "Garden Zen", description: "Virtual gardening", icon: "seedling", url: "https://www.gardenscapes.com" },
      { id: 3, title: "Meditation Quest", description: "Mindful adventure", icon: "leaf", url: "https://example.com/meditation-quest" },
      { id: 4, title: "Color Therapy", description: "Relaxing coloring", icon: "palette", url: "https://www.colorfy.net" },
      { id: 5, title: "Breathing Bubbles", description: "Breath-guided game", icon: "circle", url: "https://example.com/breathing-bubbles" }
    ]);
  });
  app2.get("/api/books", async (req, res) => {
    try {
      const booksDir = join(process.cwd(), "client", "public", "books");
      const files = await readdir(booksDir);
      const pdfFiles = files.filter((file) => file.toLowerCase().endsWith(".pdf"));
      const books = pdfFiles.map((filename, index2) => {
        const title = filename.replace(/\.pdf$/i, "").replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
        let author = "Unknown";
        const authorMatch = filename.match(/-([^-]+)\.pdf$/i);
        if (authorMatch) {
          author = authorMatch[1].replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
        }
        return {
          id: index2 + 1,
          title,
          author,
          description: `A transformative book about ${title.toLowerCase()}.`,
          pdfUrl: `/books/${filename}`,
          thumbnail: `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop&crop=center`
        };
      });
      res.json(books);
    } catch (error) {
      console.error("Error loading books:", error);
      res.status(500).json({ message: "Failed to load books" });
    }
  });
  app2.get("/api/books/:bookId/reading", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      const reading = await storage.getBookReading(userId, bookId);
      res.json(reading);
    } catch (error) {
      console.error("Error fetching book reading:", error);
      res.status(500).json({ message: "Failed to fetch book reading" });
    }
  });
  app2.post("/api/books/:bookId/reading", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      const readingData = insertBookReadingSchema.parse({
        ...req.body,
        userId,
        bookId
      });
      const reading = await storage.createBookReading(readingData);
      res.json(reading);
    } catch (error) {
      console.error("Error creating book reading:", error);
      res.status(500).json({ message: "Failed to create book reading" });
    }
  });
  app2.patch("/api/books/:bookId/reading", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      const updates = req.body;
      const reading = await storage.updateBookReading(userId, bookId, updates);
      res.json(reading);
    } catch (error) {
      console.error("Error updating book reading:", error);
      res.status(500).json({ message: "Failed to update book reading" });
    }
  });
  app2.get("/api/books/:bookId/bookmarks", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      const bookmarks = await storage.getBookBookmarks(userId, bookId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });
  app2.post("/api/books/:bookId/bookmarks", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      const bookmarkData = insertBookBookmarkSchema.parse({
        ...req.body,
        userId,
        bookId
      });
      const bookmark = await storage.createBookBookmark(bookmarkData);
      res.json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });
  app2.delete("/api/books/:bookId/bookmarks/:bookmarkId", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const bookmarkId = req.params.bookmarkId;
      const success = await storage.deleteBookBookmark(userId, bookmarkId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });
  app2.get("/api/books/:bookId/highlights", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      const highlights = await storage.getBookHighlights(userId, bookId);
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      res.status(500).json({ message: "Failed to fetch highlights" });
    }
  });
  app2.post("/api/books/:bookId/highlights", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      const highlightData = insertBookHighlightSchema.parse({
        ...req.body,
        userId,
        bookId
      });
      const highlight = await storage.createBookHighlight(highlightData);
      res.json(highlight);
    } catch (error) {
      console.error("Error creating highlight:", error);
      res.status(500).json({ message: "Failed to create highlight" });
    }
  });
  app2.delete("/api/books/:bookId/highlights/:highlightId", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const highlightId = req.params.highlightId;
      const success = await storage.deleteBookHighlight(userId, highlightId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting highlight:", error);
      res.status(500).json({ message: "Failed to delete highlight" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/app.ts
dotenv.config();
var app = express2();
var allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://aesthetic-sorbet-0a4bdb.netlify.app"
];
app.use(cors({
  origin: (origin, callback) => {
    console.log("Request origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson) {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(res, bodyJson);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      console.log(logLine);
    }
  });
  next();
});
registerRoutes(app);

// server/function.ts
var handler = serverless(app);
export {
  handler
};
