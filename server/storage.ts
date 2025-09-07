import {
  users,
  journalEntries,
  communityPosts,
  postLikes,
  postComments,
  moodEntries,
  aiConversations,
  type User,
  type UpsertUser,
  type InsertJournalEntry,
  type JournalEntry,
  type InsertCommunityPost,
  type CommunityPost,
  type InsertPostComment,
  type PostComment,
  type InsertMoodEntry,
  type MoodEntry,
  type InsertAiConversation,
  type AiConversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Journal operations
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  updateJournalEntry(id: string, userId: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: string, userId: string): Promise<boolean>;
  
  // Community operations
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getCommunityPosts(limit?: number, offset?: number): Promise<Array<CommunityPost & { user: User; likesCount: number; commentsCount: number; userLiked: boolean }>>;
  likeCommunityPost(userId: string, postId: string): Promise<boolean>;
  unlikeCommunityPost(userId: string, postId: string): Promise<boolean>;
  
  // Comments operations
  createPostComment(comment: InsertPostComment): Promise<PostComment>;
  getPostComments(postId: string): Promise<Array<PostComment & { user: User }>>;
  
  // Mood operations
  createMoodEntry(mood: InsertMoodEntry): Promise<MoodEntry>;
  getMoodEntries(userId: string, days?: number): Promise<MoodEntry[]>;
  
  // AI conversation operations
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  getAiConversations(userId: string, limit?: number): Promise<AiConversation[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Journal operations
  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [journalEntry] = await db
      .insert(journalEntries)
      .values(entry)
      .returning();
    return journalEntry;
  }

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async updateJournalEntry(id: string, userId: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [updated] = await db
      .update(journalEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .returning();
    return updated;
  }

  async deleteJournalEntry(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Community operations
  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [communityPost] = await db
      .insert(communityPosts)
      .values(post)
      .returning();
    return communityPost;
  }

  async getCommunityPosts(limit = 20, offset = 0): Promise<Array<CommunityPost & { user: User; likesCount: number; commentsCount: number; userLiked: boolean }>> {
    const posts = await db
      .select({
        post: communityPosts,
        user: users,
        likesCount: count(postLikes.id).as('likesCount'),
        commentsCount: count(postComments.id).as('commentsCount'),
      })
      .from(communityPosts)
      .leftJoin(users, eq(communityPosts.userId, users.id))
      .leftJoin(postLikes, eq(communityPosts.id, postLikes.postId))
      .leftJoin(postComments, eq(communityPosts.id, postComments.postId))
      .groupBy(communityPosts.id, users.id)
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);

    return posts.map(({ post, user, likesCount, commentsCount }) => ({
      ...post,
      user: user!,
      likesCount: Number(likesCount),
      commentsCount: Number(commentsCount),
      userLiked: false, // This would need to be calculated based on current user
    }));
  }

  async likeCommunityPost(userId: string, postId: string): Promise<boolean> {
    try {
      await db.insert(postLikes).values({ userId, postId });
      return true;
    } catch {
      return false; // Already liked or post doesn't exist
    }
  }

  async unlikeCommunityPost(userId: string, postId: string): Promise<boolean> {
    const result = await db
      .delete(postLikes)
      .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Comments operations
  async createPostComment(comment: InsertPostComment): Promise<PostComment> {
    const [postComment] = await db
      .insert(postComments)
      .values(comment)
      .returning();
    return postComment;
  }

  async getPostComments(postId: string): Promise<Array<PostComment & { user: User }>> {
    const comments = await db
      .select({
        comment: postComments,
        user: users,
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);

    return comments.map(({ comment, user }) => ({
      ...comment,
      user: user!,
    }));
  }

  // Mood operations
  async createMoodEntry(mood: InsertMoodEntry): Promise<MoodEntry> {
    const [moodEntry] = await db
      .insert(moodEntries)
      .values(mood)
      .returning();
    return moodEntry;
  }

  async getMoodEntries(userId: string, days = 7): Promise<MoodEntry[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return await db
      .select()
      .from(moodEntries)
      .where(and(
        eq(moodEntries.userId, userId),
        sql`${moodEntries.createdAt} >= ${since}`
      ))
      .orderBy(desc(moodEntries.createdAt));
  }

  // AI conversation operations
  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const [aiConversation] = await db
      .insert(aiConversations)
      .values(conversation)
      .returning();
    return aiConversation;
  }

  async getAiConversations(userId: string, limit = 50): Promise<AiConversation[]> {
    return await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
