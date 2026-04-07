const supabase = require('../config/supabase');

// ─── Row ↔ JS object conversion ───────────────────────────────────────────────
const fromDB = (row) => {
  if (!row) return null;
  const user = {
    _id:        row.id,
    id:         row.id,
    name:       row.name,
    phone:      row.phone,
    isVerified: row.is_verified,
    isActive:   row.is_active,
    lastLogin:  row.last_login,
    createdAt:  row.created_at,
    updatedAt:  row.updated_at,
  };
  // Allow authController to call user.save() as an instance method
  user.save = () => User.save(user);
  return user;
};

const toDB = (obj) => {
  const row = {};
  if (obj.name       !== undefined) row.name        = obj.name;
  if (obj.phone      !== undefined) row.phone       = obj.phone;
  if (obj.isVerified !== undefined) row.is_verified = obj.isVerified;
  if (obj.isActive   !== undefined) row.is_active   = obj.isActive;
  if (obj.lastLogin  !== undefined) row.last_login  = obj.lastLogin instanceof Date ? obj.lastLogin.toISOString() : obj.lastLogin;
  return row;
};

// ─── Query helpers ─────────────────────────────────────────────────────────────
const User = {
  async findById(id) {
    const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    return fromDB(data);
  },

  async findOne(query) {
    let q = supabase.from('users').select('*');
    if (query.phone) q = q.eq('phone', query.phone);
    const { data } = await q.maybeSingle();
    return fromDB(data);
  },

  async create(fields) {
    const { data, error } = await supabase
      .from('users')
      .insert(toDB(fields))
      .select()
      .single();
    if (error) throw new Error(error.message);
    return fromDB(data);
  },

  // Persist changes made directly on a user object (mirrors Mongoose instance.save())
  async save(user) {
    const { data, error } = await supabase
      .from('users')
      .update(toDB(user))
      .eq('id', user._id || user.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const updated = fromDB(data);
    Object.assign(user, updated);
    user.save = () => User.save(user); // re-attach after assign
    return user;
  },

  async findByIdAndUpdate(id, updates) {
    const { data } = await supabase
      .from('users')
      .update(toDB(updates))
      .eq('id', id)
      .select()
      .single();
    return fromDB(data);
  },

  async findByIdAndDelete(id) {
    const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (!data) return null;
    await supabase.from('users').delete().eq('id', id);
    return fromDB(data);
  },

  // Admin: total count, or count since a date
  async countDocuments(query = {}) {
    let q = supabase.from('users').select('*', { count: 'exact', head: true });
    if (query.createdAt?.$gte) q = q.gte('created_at', query.createdAt.$gte.toISOString());
    const { count } = await q;
    return count || 0;
  },

  // Admin dashboard: most-recent N users
  async findRecent(limit = 5) {
    const { data } = await supabase
      .from('users')
      .select('id, name, phone, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map(fromDB);
  },

  // Admin dashboard: registrations per day for the last-N-days chart
  async aggregateByDay(since) {
    const { data } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', since.toISOString());
    const byDay = {};
    (data || []).forEach((row) => {
      const day = row.created_at.slice(0, 10); // 'YYYY-MM-DD'
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return Object.entries(byDay)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => a._id.localeCompare(b._id));
  },

  // Admin users list: paginated with optional search
  async paginate({ search, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    let q = supabase
      .from('users')
      .select('id, name, phone, is_verified, is_active, created_at, last_login', { count: 'exact' });
    if (search) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    q = q.order('created_at', { ascending: false }).range(skip, skip + limit - 1);
    const { data, count } = await q;
    return { users: (data || []).map(fromDB), total: count || 0 };
  },

  // Admin export: all users
  async findAll() {
    const { data } = await supabase
      .from('users')
      .select('id, name, phone, is_verified, is_active, created_at, last_login');
    return (data || []).map(fromDB);
  },
};

module.exports = User;
