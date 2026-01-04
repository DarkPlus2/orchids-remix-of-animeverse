import { pgTable, serial, text, integer, real, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const anime = pgTable('anime', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  japaneseTitle: text('japanese_title').notNull(),
  synopsis: text('synopsis').notNull(),
  coverImage: text('cover_image').notNull(),
  bannerImage: text('banner_image').notNull(),
  rating: real('rating').notNull(),
  genres: jsonb('genres').notNull(),
  status: text('status').notNull(),
  releaseYear: integer('release_year').notNull(),
  totalEpisodes: integer('total_episodes').notNull(),
  type: text('type').notNull().default('Series'),
  trending: boolean('trending').notNull().default(false),
  mostWatched: boolean('most_watched').notNull().default(false),
  pinned: boolean('pinned').notNull().default(false),
  studios: jsonb('studios').notNull().default([]),
  producers: jsonb('producers').notNull().default([]),
  duration: integer('duration').notNull().default(24),
  seasonCount: integer('season_count').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const episodes = pgTable('episodes', {
  id: serial('id').primaryKey(),
  animeId: integer('anime_id').notNull().references(() => anime.id, { onDelete: 'cascade' }),
  episodeNumber: integer('episode_number').notNull(),
  title: text('title').notNull(),
  embedSources: jsonb('embed_sources').notNull(),
  thumbnail: text('thumbnail'),
  season: integer('season_new').notNull().default(1),
  createdAt: text('created_at').notNull(),
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const communityPosts = pgTable('community_posts', {
  id: serial('id').primaryKey(),
  authorName: text('author_name').notNull(),
  authorIsAdmin: boolean('author_is_admin').notNull().default(false),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  likes: integer('likes').notNull().default(0),
  comments: integer('comments').notNull().default(0),
  shares: integer('shares').notNull().default(0),
  pinned: boolean('pinned').notNull().default(false),
  category: text('category').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const scheduledEpisodes = pgTable('scheduled_episodes', {
  id: serial('id').primaryKey(),
  animeId: integer('anime_id').notNull().references(() => anime.id, { onDelete: 'cascade' }),
  episodeNumber: integer('episode_number').notNull(),
  title: text('title').notNull(),
  scheduledDate: text('scheduled_date').notNull(),
  scheduledTime: text('scheduled_time').notNull(),
  status: text('status').notNull(),
  notifyUsers: boolean('notify_users').notNull().default(true),
  streamUrl: text('stream_url'),
  notes: text('notes'),
  season: integer('season').notNull().default(1),
  embedSources: jsonb('embed_sources').notNull(),
  thumbnail: text('thumbnail'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull(),
  email: text('email'),
  createdAt: text('created_at').notNull(),
  lastLogin: text('last_login'),
  isActive: boolean('is_active').notNull().default(true),
});

export const adminSessions = pgTable('admin_sessions', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').notNull().references(() => admins.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  bio: text('bio'),
  profilePicture: text('profile_picture'),
  banner: text('banner'),
  favoriteGenres: jsonb('favorite_genres').notNull().default([]),
  status: text('status').notNull().default('active'),
  lastLogin: text('last_login'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const userSessions = pgTable('user_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  animeId: integer('anime_id').notNull(),
  episodeNumber: integer('episode_number'),
  content: text('content').notNull(),
  parentCommentId: integer('parent_comment_id'),
  likes: integer('likes').notNull().default(0),
  dislikes: integer('dislikes').notNull().default(0),
  isPinned: boolean('is_pinned').notNull().default(false),
  isSpoiler: boolean('is_spoiler').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const commentLikes = pgTable('comment_likes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  commentId: integer('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
});

export const commentDislikes = pgTable('comment_dislikes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  commentId: integer('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
});

export const watchHistory = pgTable('watch_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  animeId: integer('anime_id').notNull(),
  episodeNumber: integer('episode_number').notNull(),
  watchedAt: text('watched_at').notNull(),
  progress: integer('progress').notNull().default(0),
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  animeId: integer('anime_id').notNull(),
  createdAt: text('created_at').notNull(),
});

export const watchlist = pgTable('watchlist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  animeId: integer('anime_id').notNull(),
  createdAt: text('created_at').notNull(),
});

export const userActivity = pgTable('user_activity', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  content: text('content').notNull(),
  link: text('link'),
  createdAt: text('created_at').notNull(),
});
