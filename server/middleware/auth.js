import { createSupabaseClient } from '../config/database.js';

export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createSupabaseClient(token);

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    req.supabase = supabase;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseClient(token);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      req.user = user;
      req.supabase = supabase;
    } catch (error) {
      console.error('Optional auth error:', error);
    }
  }

  if (!req.supabase) {
    req.supabase = createSupabaseClient();
  }

  next();
};
