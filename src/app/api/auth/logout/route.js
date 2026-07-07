import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // In a stateless JWT/mock implementation, logout is mostly handled client-side
    // by destroying the local token or user state.
    // If there were server-side cookies or sessions, we would clear them here.
    
    return NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('[POST /api/auth/logout] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to logout', 
      details: error.message 
    }, { status: 500 });
  }
}
