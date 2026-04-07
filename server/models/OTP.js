const supabase = require('../config/supabase');

// ─── Row ↔ JS object conversion ───────────────────────────────────────────────
const fromDB = (row) => {
  if (!row) return null;
  return {
    _id:       row.id,
    id:        row.id,
    phone:     row.phone,
    otp:       row.otp,
    purpose:   row.purpose,
    expiresAt: row.expires_at,
    attempts:  row.attempts,
    verified:  row.verified,
    createdAt: row.created_at,
  };
};

// ─── Query helpers ─────────────────────────────────────────────────────────────
const OTP = {
  // Rate-limit check: did a send happen within the last `withinMs` milliseconds?
  async findRecentByPhone(phone, withinMs = 60_000) {
    const since = new Date(Date.now() - withinMs).toISOString();
    const { data } = await supabase
      .from('otps')
      .select('*')
      .eq('phone', phone)
      .gte('created_at', since)
      .maybeSingle();
    return fromDB(data);
  },

  async deleteByPhone(phone) {
    await supabase.from('otps').delete().eq('phone', phone);
  },

  async create(fields) {
    const row = {
      phone:      fields.phone,
      otp:        fields.otp,
      purpose:    fields.purpose,
      expires_at: fields.expiresAt instanceof Date ? fields.expiresAt.toISOString() : fields.expiresAt,
    };
    const { data, error } = await supabase.from('otps').insert(row).select().single();
    if (error) throw new Error(error.message);
    return fromDB(data);
  },

  // Find unverified & unexpired OTP for phone (for verify step)
  async findUnverifiedByPhone(phone) {
    const { data } = await supabase
      .from('otps')
      .select('*')
      .eq('phone', phone)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    return fromDB(data);
  },

  // Find any unverified OTP (including expired) — used to give the right error message
  async findAnyByPhone(phone) {
    const { data } = await supabase
      .from('otps')
      .select('*')
      .eq('phone', phone)
      .eq('verified', false)
      .maybeSingle();
    return fromDB(data);
  },

  async deleteById(id) {
    await supabase.from('otps').delete().eq('id', id);
  },

  async incrementAttempts(id) {
    const { data } = await supabase.from('otps').select('attempts').eq('id', id).single();
    if (data) {
      await supabase.from('otps').update({ attempts: data.attempts + 1 }).eq('id', id);
    }
  },

  async markVerified(id) {
    await supabase.from('otps').update({ verified: true }).eq('id', id);
  },
};

module.exports = OTP;
