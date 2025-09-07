import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { chatWithGenie, analyzeMoodFromText, generateMotivationalQuote } from "./gemini";
import { 
  insertJournalEntrySchema, 
  insertCommunityPostSchema, 
  insertPostCommentSchema,
  insertMoodEntrySchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...updates,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Journal routes
  app.get('/api/journal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post('/api/journal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertJournalEntrySchema.parse({
        ...req.body,
        userId,
      });

      // Analyze mood from content
      const moodAnalysis = await analyzeMoodFromText(entryData.content);
      entryData.mood = moodAnalysis.mood;

      const entry = await storage.createJournalEntry(entryData);
      
      // Also create a mood entry
      await storage.createMoodEntry({
        userId,
        mood: moodAnalysis.mood,
        notes: `From journal: ${entryData.title || 'Untitled entry'}`,
      });

      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.patch('/api/journal/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.delete('/api/journal/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryId = req.params.id;
      
      const success = await storage.deleteJournalEntry(entryId, userId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // Community routes
  app.get('/api/community/posts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await storage.getCommunityPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.post('/api/community/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { imageBase64, ...bodyData } = req.body;
      
      let imageUrl = null;
      
      // Handle base64 image if provided
      if (imageBase64 && typeof imageBase64 === 'string') {
        // For now, we'll store the base64 directly as the imageUrl
        // In a production app, you'd upload to a service like Cloudinary or AWS S3
        imageUrl = imageBase64;
      }
      
      const postData = insertCommunityPostSchema.parse({
        ...bodyData,
        userId,
        imageUrl,
      });

      const post = await storage.createCommunityPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(500).json({ message: "Failed to create community post" });
    }
  });

  app.post('/api/community/posts/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = req.params.id;
      
      const success = await storage.likeCommunityPost(userId, postId);
      res.json({ success });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete('/api/community/posts/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = req.params.id;
      
      const success = await storage.unlikeCommunityPost(userId, postId);
      res.json({ success });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  app.get('/api/community/posts/:id/comments', async (req, res) => {
    try {
      const postId = req.params.id;
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/community/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = req.params.id;
      const commentData = insertPostCommentSchema.parse({
        ...req.body,
        userId,
        postId,
      });

      const comment = await storage.createPostComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Mood routes
  app.get('/api/mood', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 7;
      
      const moods = await storage.getMoodEntries(userId, days);
      res.json(moods);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  app.post('/api/mood', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const moodData = insertMoodEntrySchema.parse({
        ...req.body,
        userId,
      });

      const mood = await storage.createMoodEntry(moodData);
      res.json(mood);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(500).json({ message: "Failed to create mood entry" });
    }
  });

  // AI routes
  app.get('/api/ai/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const conversations = await storage.getAiConversations(userId, limit);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching AI conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await chatWithGenie(message, context);
      
      // Store the conversation
      await storage.createAiConversation({
        userId,
        message,
        response: response.message,
      });

      res.json(response);
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Content routes
  app.get('/api/content/quote', async (req, res) => {
    try {
      const quote = await generateMotivationalQuote();
      res.json(quote);
    } catch (error) {
      console.error("Error generating quote:", error);
      res.status(500).json({ message: "Failed to generate quote" });
    }
  });

  // Media recommendations (mock data for now)
  app.get('/api/media/movies', async (req, res) => {
    res.json([
      { id: 1, title: "The Pursuit of Happyness", genre: "Drama • Inspiration", thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1" },
      { id: 2, title: "Soul", genre: "Animation • Philosophy", thumbnail: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9" },
      { id: 3, title: "Inside Out", genre: "Animation • Emotional", thumbnail: "https://images.unsplash.com/photo-1489599613-e715e6ebe90d" },
      { id: 4, title: "The Secret Life of Walter Mitty", genre: "Adventure • Inspiration", thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4" },
      { id: 5, title: "Good Will Hunting", genre: "Drama • Growth", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" },
    ]);
  });

  app.get('/api/media/music', async (req, res) => {
    res.json([
      { id: 1, title: "Three Little Birds", artist: "Bob Marley", mood: "Uplifting", url: "https://open.spotify.com/track/1example" },
      { id: 2, title: "Happy", artist: "Pharrell Williams", mood: "Joyful", url: "https://open.spotify.com/track/2example" },
      { id: 3, title: "Here Comes the Sun", artist: "The Beatles", mood: "Hopeful", url: "https://open.spotify.com/track/3example" },
      { id: 4, title: "Good Vibrations", artist: "The Beach Boys", mood: "Positive", url: "https://open.spotify.com/track/4example" },
      { id: 5, title: "I Can See Clearly Now", artist: "Johnny Nash", mood: "Optimistic", url: "https://open.spotify.com/track/5example" },
    ]);
  });

  app.get('/api/media/ted-talks', async (req, res) => {
    res.json([
      { id: 1, title: "The Power of Vulnerability", speaker: "Brené Brown", duration: "20:50", url: "https://www.ted.com/talks/brene_brown_the_power_of_vulnerability" },
      { id: 2, title: "How to Make Stress Your Friend", speaker: "Kelly McGonigal", duration: "14:28", url: "https://www.ted.com/talks/kelly_mcgonigal_how_to_make_stress_your_friend" },
      { id: 3, title: "The Happy Secret to Better Work", speaker: "Shawn Achor", duration: "12:20", url: "https://www.ted.com/talks/shawn_achor_the_happy_secret_to_better_work" },
      { id: 4, title: "Your Body Language May Shape Who You Are", speaker: "Amy Cuddy", duration: "21:02", url: "https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are" },
      { id: 5, title: "The Puzzle of Motivation", speaker: "Dan Pink", duration: "18:36", url: "https://www.ted.com/talks/dan_pink_the_puzzle_of_motivation" },
    ]);
  });

  app.get('/api/games', async (req, res) => {
    res.json([
      { id: 1, title: "Peaceful Puzzles", description: "Relaxing jigsaw puzzles", icon: "puzzle-piece", url: "https://www.jigsawplanet.com" },
      { id: 2, title: "Garden Zen", description: "Virtual gardening", icon: "seedling", url: "https://www.gardenscapes.com" },
      { id: 3, title: "Meditation Quest", description: "Mindful adventure", icon: "leaf", url: "https://example.com/meditation-quest" },
      { id: 4, title: "Color Therapy", description: "Relaxing coloring", icon: "palette", url: "https://www.colorfy.net" },
      { id: 5, title: "Breathing Bubbles", description: "Breath-guided game", icon: "circle", url: "https://example.com/breathing-bubbles" },
    ]);
  });

  app.get('/api/books', async (req, res) => {
    res.json([
      { id: 1, title: "The Power of Now", author: "Eckhart Tolle", description: "A guide to spiritual enlightenment", url: "https://archive.org/details/powerofnow00tol" },
      { id: 2, title: "Mindfulness for Beginners", author: "Jon Kabat-Zinn", description: "Introduction to mindfulness meditation", url: "https://archive.org/details/mindfulnessforbe00kaba" },
      { id: 3, title: "The Happiness Project", author: "Gretchen Rubin", description: "A year-long journey to happiness", url: "https://archive.org/details/happinessproject00rubi" },
      { id: 4, title: "Emotional Intelligence", author: "Daniel Goleman", description: "Understanding and managing emotions", url: "https://archive.org/details/emotionalintelli00gole" },
      { id: 5, title: "The Gifts of Imperfection", author: "Brené Brown", description: "Embracing vulnerability and courage", url: "https://archive.org/details/giftsofimperfect00brow" },
    ]);
  });

  const httpServer = createServer(app);
  return httpServer;
}
