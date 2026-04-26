import { handlers } from '@/auth';

// Auth.js v5 catch-all API route for authentication.
// Handles: Google OAuth, Resend magic link, session management.
export const { GET, POST } = handlers;
