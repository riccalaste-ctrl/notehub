import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { createJWT } from '@/lib/jwt';
import { setAdminCookie } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@notehub.local';
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    // Security: don't reveal if email exists
    if (email !== adminEmail) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!adminPasswordHash) {
      console.error('ADMIN_PASSWORD_HASH not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, adminPasswordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const jwt = await createJWT(email, 'admin');

    // Set cookie
    await setAdminCookie(jwt);

    return NextResponse.json({ 
      success: true,
      message: 'Login successful',
      token: jwt 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
