import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sql = neon(process.env.DATABASE_URL!);

// User operations
export const userQueries = {
  async createUser({ name, email, password }: { name: string; email: string; password: string }) {
    return await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${password})
      RETURNING id, name, email
    `;
  },

  async getUserByEmail(email: string) {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result[0];
  },

  async updateUser(id: string, data: { name?: string; email?: string; password?: string }) {
    const updates = Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key} = ${value}`);

    return await sql`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ${id}
      RETURNING id, name, email
    `;
  }
};

export const taxReturnQueries = {
  async createTaxReturn({ userId, year, totalIncome, deductions, taxPaid }: {
    userId: string;
    year: number;
    totalIncome: number;
    deductions: number;
    taxPaid: number;
  }) {
    return await sql`
      INSERT INTO tax_returns (user_id, year, total_income, deductions, tax_paid, status)
      VALUES (${userId}, ${year}, ${totalIncome}, ${deductions}, ${taxPaid}, 'DRAFT')
      RETURNING *
    `;
  },

  async getTaxReturnsByUser(userId: string) {
    return await sql`
      SELECT * FROM tax_returns 
      WHERE user_id = ${userId}
      ORDER BY year DESC
    `;
  },

  async updateTaxReturnStatus(id: string, status: string) {
    return await sql`
      UPDATE tax_returns 
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
  }
};

// Document operations
export const documentQueries = {
  async createDocument({ userId, taxReturnId, name, type, url }: {
    userId: string;
    taxReturnId?: string;
    name: string;
    type: string;
    url: string;
  }) {
    return await sql`
      INSERT INTO documents (user_id, tax_return_id, name, type, url)
      VALUES (${userId}, ${taxReturnId}, ${name}, ${type}, ${url})
      RETURNING *
    `;
  },

  async getDocumentsByUser(userId: string) {
    return await sql`
      SELECT * FROM documents 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }
};

export const communityQueries = {
  async createPost({ userId, title, content }: {
    userId: string;
    title: string;
    content: string;
  }) {
    return await sql`
      INSERT INTO posts (user_id, title, content)
      VALUES (${userId}, ${title}, ${content})
      RETURNING *
    `;
  },

  async getPosts(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return await sql`
      SELECT p.*, u.name as author_name 
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  },

  async createComment({ userId, postId, content }: {
    userId: string;
    postId: string;
    content: string;
  }) {
    return await sql`
      INSERT INTO comments (user_id, post_id, content)
      VALUES (${userId}, ${postId}, ${content})
      RETURNING *
    `;
  }
};

export const notificationQueries = {
  async createNotification({ userId, title, message }: {
    userId: string;
    title: string;
    message: string;
  }) {
    return await sql`
      INSERT INTO notifications (user_id, title, message)
      VALUES (${userId}, ${title}, ${message})
      RETURNING *
    `;
  },

  async getUnreadNotifications(userId: string) {
    return await sql`
      SELECT * FROM notifications 
      WHERE user_id = ${userId} AND read = false
      ORDER BY created_at DESC
    `;
  },

  async markNotificationAsRead(id: string) {
    return await sql`
      UPDATE notifications 
      SET read = true
      WHERE id = ${id}
      RETURNING *
    `;
  }
};

export { pool, sql };

// Helper function to run queries with the pool
export async function query(text: string, params?: readonly unknown[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params ? params as unknown[] : []);
  } finally {
    client.release();
  }
}

import { PoolClient } from 'pg';

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
} 