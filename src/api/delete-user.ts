import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: 'Missing userId or token' });
    }

    // Verify token
    const { data: sessionData, error: verifyError } = await supabaseAdmin.auth.getUser(token);
    if (verifyError || sessionData.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete the user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ error: 'Server error during deletion.' });
  }
}
