import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createJWT } from '@/lib/jwt';
import { setAdminCookie } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
    const adminPassword = process.env.ADMIN_PASSWORD || 'NoteHub2026!';

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const jwt = await createJWT(email, 'admin');
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
