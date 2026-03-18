import type { NextApiRequest, NextApiResponse } from 'next';
import { SignJWT } from 'jose';

type ResponseData = {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    plan: string;
    generations_used: number;
    generations_limit: number;
  };
  error?: string;
};

// In production, use a secure environment variable
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // In production, verify against database
    // This is a mock implementation
    const user = {
      id: 'user_123',
      email: email,
      name: email.split('@')[0],
      plan: 'pro',
      generations_used: 3,
      generations_limit: 50
    };

    // Create JWT token
    const token = await new SignJWT({ 
      userId: user.id,
      email: user.email 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(JWT_SECRET);

    return res.status(200).json({
      success: true,
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
}
