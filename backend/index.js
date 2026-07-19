require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin_key';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Configure backend .env before deployment.');
}

const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

function ensureSupabase(req, res) {
  if (!supabase) {
    res.status(500).json({ success: false, message: 'Supabase not configured' });
    return false;
  }
  return true;
}

async function findCodeByCode(code) {
  const { data, error } = await supabase.from('access_codes').select('*').eq('code', code).maybeSingle();
  if (error) throw error;
  return data;
}

async function getLatestActivationForCode(codeId) {
  const { data, error } = await supabase.from('code_activations').select('*').eq('code_id', codeId).order('activated_at', { ascending: false }).limit(1);
  if (error) throw error;
  return (data && data[0]) || null;
}

async function insertActivation(record) {
  const { error } = await supabase.from('code_activations').insert([record]);
  if (error) throw error;
  return true;
}

async function markCodeUsed(codeId, userId) {
  const { error } = await supabase.from('access_codes').update({ is_used: true, used_by: userId || null }).eq('id', codeId);
  if (error) throw error;
}

async function insertAgentData(userId, payload) {
  const { error } = await supabase.from('agent_data').insert([{ user_id: userId, payload, created_at: new Date().toISOString() }]);
  if (error) throw error;
}

async function queryAgentData(userId, limit = 100) {
  const { data, error } = await supabase.from('agent_data').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

const adminAuth = (req, res, next) => {
  const key = req.headers['x-admin-key'] || req.query.admin_key;
  if (!key || key !== ADMIN_KEY) return res.status(401).json({ success: false, message: 'Unauthorized' });
  next();
};

app.post('/activate-code', async (req, res) => {
  if (!ensureSupabase(req, res)) return;
  const { code, deviceId, userId } = req.body;
  if (!code || !deviceId || !userId) return res.status(400).json({ success: false, message: 'code, deviceId and userId required' });

  try {
    const license = await findCodeByCode(code);
    if (!license) return res.status(404).json({ success: false, message: 'Code not found' });
    if (!license.is_active) return res.status(400).json({ success: false, message: 'Code inactive' });

    const latest = await getLatestActivationForCode(license.id);
    const now = Date.now();
    const durationDays = license.duration_days || 30;
    const durationMs = durationDays * 24 * 60 * 60 * 1000;

    if (latest && latest.expires_at && new Date(latest.expires_at).getTime() > now) {
      if (latest.device_id !== deviceId) {
        return res.status(403).json({ success: false, message: 'Code already in use on another device' });
      }
      return res.json({ success: true, message: 'Code already active on this device', plan: latest.plan_activated, expiresAt: latest.expires_at });
    }

    const newExpiry = new Date(Date.now() + durationMs).toISOString();
    await insertActivation({
      code_id: license.id,
      user_id: userId,
      device_id: deviceId,
      code_value: license.code,
      plan_activated: license.plan,
      activated_at: new Date().toISOString(),
      expires_at: newExpiry,
    });
    await markCodeUsed(license.id, userId);

    return res.json({ success: true, message: 'Code activated', plan: license.plan, expiresAt: newExpiry });
  } catch (err) {
    console.error('activate-code error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

app.post('/check-auth', async (req, res) => {
  if (!ensureSupabase(req, res)) return;
  const { code, deviceId } = req.body;
  if (!code || !deviceId) return res.status(400).json({ success: false, message: 'code and deviceId required' });

  try {
    const license = await findCodeByCode(code);
    if (!license) return res.status(404).json({ success: false });

    const latest = await getLatestActivationForCode(license.id);
    if (!latest) return res.json({ success: false });
    if (latest.device_id !== deviceId) return res.json({ success: false });
    if (new Date(latest.expires_at).getTime() < Date.now()) return res.json({ success: false });

    return res.json({ success: true, plan: latest.plan_activated, expiresAt: latest.expires_at });
  } catch (err) {
    console.error('check-auth error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

app.post('/api/resend_code', async (req, res) => {
  if (!ensureSupabase(req, res)) return;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

  console.log('Resend code requested for user', userId);
  return res.json({ success: true });
});

app.post('/admin/create-codes', adminAuth, async (req, res) => {
  if (!ensureSupabase(req, res)) return;
  const codes = req.body?.codes;
  if (!Array.isArray(codes)) return res.status(400).json({ success: false, message: 'codes array required' });

  try {
    const prepared = codes.map((c) => ({
      code: c.code,
      plan: c.plan || 'starter',
      duration_days: c.duration_days || 30,
      features: c.features || null,
      is_active: true,
      is_used: false,
      created_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('access_codes').insert(prepared);
    if (error) throw error;
    return res.json({ success: true, created: prepared.length });
  } catch (err) {
    console.error('create-codes error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

app.get('/admin/api/requests', adminAuth, async (req, res) => {
  if (!ensureSupabase(req, res)) return;
  try {
    const { data, error } = await supabase.from('code_activations').select('*').order('activated_at', { ascending: false }).limit(200);
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    console.error('admin requests error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

app.post('/admin/api/validate/:id', adminAuth, async (req, res) => {
  if (!ensureSupabase(req, res)) return;
  const id = req.params.id;
  try {
    const { error } = await supabase.from('code_activations').update({ validated: true }).eq('id', id);
    if (error) throw error;
    return res.json({ success: true });
  } catch (err) {
    console.error('validate error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

app.post('/admin/api/reject/:id', adminAuth, async (req, res) => {
  if (!ensureSupabase(req, res)) return;
  const id = req.params.id;
  try {
    const { error } = await supabase.from('code_activations').update({ validated: false, rejected: true }).eq('id', id);
    if (error) throw error;
    return res.json({ success: true });
  } catch (err) {
    console.error('reject error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

app.post('/agent/data', async (req, res) => {
  if (!ensureSupabase(req, res)) return;
  const { userId, data } = req.body;
  if (!userId || data == null) return res.status(400).json({ success: false, message: 'userId and data required' });
  try {
    await insertAgentData(userId, data);
    return res.json({ success: true });
  } catch (err) {
    console.error('agent data error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

app.post('/agent/analyze', async (req, res) => {
  if (!ensureSupabase(req, res)) return;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
  try {
    const data = await queryAgentData(userId, 100);
    const flatValues = data.map((row) => row.payload).flat();
    const numbers = flatValues.filter((value) => typeof value === 'number');
    const average = numbers.length ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : null;
    return res.json({ success: true, stats: { count: numbers.length, average } });
  } catch (err) {
    console.error('agent analyze error', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('BetAI backend is running. Use API routes under /activate-code, /check-auth, /agent, /admin, etc.');
});

app.listen(PORT, () => {
  console.log(`BetAI backend listening on port ${PORT}`);
});
