import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query, transaction } from '@/lib/db';
import { randomUUID } from 'crypto';

interface PostRequest {
  type: 'post';
  title: string;
  content: string;
  tags?: string[];
}

interface CommentRequest {
  type: 'comment';
  postId: string;
  content: string;
}

interface LikeRequest {
  type: 'like';
  targetId: string;
  targetType: 'post' | 'comment';
  userId: string;
}

interface AcceptCommentRequest {
  type: 'accept-comment';
  postId: string;
  commentId: string;
}

type CommunityActionBody = PostRequest | CommentRequest | LikeRequest | AcceptCommentRequest;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const filter = (url.searchParams.get('filter') ?? 'recent') as 'recent' | 'popular' | 'unanswered';
  const tag = url.searchParams.get('tag') ?? undefined;
  const search = url.searchParams.get('q') ?? undefined;
  const id = url.searchParams.get('id') ?? undefined;

  try {
    switch (type) {
      case 'posts':
        return await getPosts(filter, tag, search);
      case 'post':
        return await getPostDetail(id);
      case 'tags':
        return await getTags();
      case 'users':
        return await getTopContributors();
      default:
        return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }
  } catch (error) {
    console.error('[API /community GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CommunityActionBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    switch (body.type) {
      case 'post':
        return await createPost(body, session.user.id);
      case 'comment':
        return await createComment(body, session.user.id);
      case 'like':
        return await handleLike(body);
      case 'accept-comment':
        return await acceptComment(body, session.user.id);
      default:
        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }
  } catch (error) {
    console.error('[API /community POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getPosts(
  filter: 'recent' | 'popular' | 'unanswered',
  tag?: string,
  search?: string
): Promise<NextResponse> {
  let queryText = `
    SELECT 
      p.*,
      u.id as author_id,
      u.name as author_name,
      u.image as author_image,
      COUNT(c.id) as comment_count
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
  `;

  const conditions = [];
  const params = [];

  if (filter === 'unanswered') {
    conditions.push('p.is_answered = false');
  }

  if (tag) {
    conditions.push('$1 = ANY(p.tags)');
    params.push(tag);
  }

  if (search) {
    conditions.push('(p.title ILIKE $' + (params.length + 1) + ' OR p.content ILIKE $' + (params.length + 1) + ')');
    params.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    queryText += ' WHERE ' + conditions.join(' AND ');
  }

  queryText += ' GROUP BY p.id, u.id';

  if (filter === 'popular') {
    queryText += ' ORDER BY p.upvotes DESC';
  } else {
    queryText += ' ORDER BY p.created_at DESC';
  }

  queryText += ' LIMIT 20';

  const result = await query(queryText, params);
  return NextResponse.json(result.rows.map(formatPost));
}

async function getPostDetail(id?: string): Promise<NextResponse> {
  if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

  const postResult = await query(
    `SELECT 
      p.*,
      u.id as author_id,
      u.name as author_name,
      u.image as author_image
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.id = $1`,
    [id]
  );

  if (postResult.rows.length === 0) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const commentsResult = await query(
    `SELECT 
      c.*,
      u.id as author_id,
      u.name as author_name,
      u.image as author_image
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.is_accepted DESC, c.upvotes DESC, c.created_at DESC`,
    [id]
  );

  const post = {
    ...formatPost(postResult.rows[0]),
    answers: commentsResult.rows.map(formatComment)
  };

  return NextResponse.json(post);
}

async function getTags(): Promise<NextResponse> {
  const result = await query('SELECT DISTINCT unnest(tags) as tag FROM posts');
  const tagCounts = result.rows.reduce((acc: Record<string, number>, row) => {
    acc[row.tag] = (acc[row.tag] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json(
    Object.entries(tagCounts).map(([name, count]) => ({ name, count }))
  );
}

async function getTopContributors(): Promise<NextResponse> {
  const result = await query(`
    SELECT 
      u.id,
      u.name,
      u.image,
      COUNT(DISTINCT p.id) as post_count,
      COUNT(DISTINCT c.id) as comment_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN comments c ON u.id = c.user_id
    GROUP BY u.id
    ORDER BY comment_count DESC
    LIMIT 5
  `);

  return NextResponse.json(
    result.rows.map(row => ({
      id: row.id,
      name: row.name || 'Anonymous',
      avatar: row.image || '/avatars/default.png',
      posts: parseInt(row.post_count),
      comments: parseInt(row.comment_count),
    }))
  );
}

async function createPost(data: PostRequest, userId: string): Promise<NextResponse> {
  const { title, content, tags } = data;
  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO posts (id, title, content, user_id, tags)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [randomUUID(), title, content, userId, tags || []]
  );

  return NextResponse.json(formatPost(result.rows[0]));
}

async function createComment(data: CommentRequest, userId: string): Promise<NextResponse> {
  const { postId, content } = data;
  if (!postId || !content) {
    return NextResponse.json({ error: 'Post ID and content are required' }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO comments (id, content, post_id, user_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [randomUUID(), content, postId, userId]
  );

  return NextResponse.json(formatComment(result.rows[0]));
}

async function handleLike(data: LikeRequest): Promise<NextResponse> {
  const { targetId, targetType } = data;
  if (!targetId || !targetType) {
    return NextResponse.json({ error: 'Target ID and type are required' }, { status: 400 });
  }

  const table = targetType === 'post' ? 'posts' : 'comments';
  const likeTable = targetType === 'post' ? 'post_likes' : 'comment_likes';
  const idColumn = targetType === 'post' ? 'post_id' : 'comment_id';

  await transaction(async (client) => {
    // Add like record
    await client.query(
      `INSERT INTO ${likeTable} (user_id, ${idColumn})
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [data.userId, targetId]
    );

    // Update upvotes count
    await client.query(
      `UPDATE ${table} 
       SET upvotes = upvotes + 1 
       WHERE id = $1`,
      [targetId]
    );
  });

  return NextResponse.json({ success: true });
}

async function acceptComment(data: AcceptCommentRequest, userId: string): Promise<NextResponse> {
  const { postId, commentId } = data;

  await transaction(async (client) => {
    // Verify post ownership
    const postResult = await client.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [postId]
    );

    if (postResult.rows[0].user_id !== userId) {
      throw new Error('Unauthorized');
    }

    // Mark comment as accepted
    await client.query(
      `UPDATE comments 
       SET is_accepted = true 
       WHERE id = $1 AND post_id = $2`,
      [commentId, postId]
    );

    // Mark post as answered
    await client.query(
      'UPDATE posts SET is_answered = true WHERE id = $1',
      [postId]
    );
  });

  return NextResponse.json({ success: true });
}

interface PostRow {
  id: string;
  title: string;
  content: string;
  created_at: Date;
  upvotes: number;
  ai_suggestion: string | null;
  is_answered: boolean;
  tags: string[];
  author_id: string;
  author_name: string;
  author_image: string | null;
  comment_count: number;
}

function formatPost(row: PostRow) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: humanTime(row.created_at),
    upvotes: parseInt(row.upvotes.toString(), 10),
    aiSuggestion: row.ai_suggestion,
    isAnswered: row.is_answered,
    tags: row.tags,
    author: {
      id: row.author_id,
      name: row.author_name,
      image: row.author_image,
    },
    comments: row.comment_count || 0,
  };
}

interface CommentRow {
  id: string;
  content: string;
  created_at: Date;
  upvotes: number;
  is_accepted: boolean;
  author_id: string;
  author_name: string;
  author_image: string;
}

function formatComment(row: CommentRow) {
  return {
    id: row.id,
    body: row.content,
    createdAt: humanTime(row.created_at),
    likes: parseInt(row.upvotes.toString(), 10),
    isAccepted: row.is_accepted,
    author: {
      id: row.author_id,
      name: row.author_name,
      image: row.author_image,
    },
  };
}

function humanTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}