import { NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prismaClient.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // In a real app we'd use bcrypt, but here we compare plainly since we mocked the passwords
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Remove password before sending user data
    const { password: _, ...userData } = user;

    return NextResponse.json({ user: userData }, { status: 200 });

  } catch (error) {
    console.error('[POST /api/auth/login] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to authenticate user', 
      details: error.message 
    }, { status: 500 });
  }
}
