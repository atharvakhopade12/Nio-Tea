const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

// ─── Row ↔ JS object conversion ───────────────────────────────────────────────
const fromDB = (row, { includePassword = false } = {}) => {
  if (!row) return null;
  return {
    _id:       row.id,
    id:        row.id,
    name:      row.name,
    email:     row.email,
    role:      row.role,
    isActive:  row.is_active,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(includePassword && { password: row.password }),
  };
};

const toDB = (obj) => {
  const row = {};
  if (obj.name      !== undefined) row.name       = obj.name;
  if (obj.email     !== undefined) row.email      = obj.email.toLowerCase();
  if (obj.password  !== undefined) row.password   = obj.password;
  if (obj.role      !== undefined) row.role       = obj.role;
  if (obj.isActive  !== undefined) row.is_active  = obj.isActive;
  if (obj.lastLogin !== undefined) row.last_login = obj.lastLogin instanceof Date ? obj.lastLogin.toISOString() : obj.lastLogin;
  return row;
};

// ─── Query helpers ─────────────────────────────────────────────────────────────
const Admin = {
  // Standard lookup — password excluded
  async findById(id) {
    const { data } = await supabase.from('admins').select('*').eq('id', id).maybeSingle();
    return fromDB(data);
  },

  async findOne(query) {
    let q = supabase.from('admins').select('*');
    if (query.email) q = q.eq('email', query.email.toLowerCase());
    const { data } = await q.maybeSingle();
    return fromDB(data);
  },

  // Login flow — returns admin WITH hashed password for bcrypt comparison
  async findOneWithPassword(query) {
    let q = supabase.from('admins').select('*');
    if (query.email) q = q.eq('email', query.email.toLowerCase());
    const { data } = await q.maybeSingle();
    return fromDB(data, { includePassword: true });
  },

  async findAll() {
    const { data } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });
    return (data || []).map((row) => fromDB(row));
  },

  async create(fields) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(fields.password, salt);
    const row = toDB({ ...fields, password: hashedPassword });
    const { data, error } = await supabase.from('admins').insert(row).select().single();
    if (error) throw new Error(error.message);
    return fromDB(data);
  },

  // Update fields; pass newPassword (plain text) to change the password
  async updateById(id, fields, { newPassword } = {}) {
    const updates = toDB(fields);
    if (newPassword && newPassword.length >= 6) {
      const salt = await bcrypt.genSalt(12);
      updates.password = await bcrypt.hash(newPassword, salt);
    }
    const { data, error } = await supabase
      .from('admins')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return fromDB(data);
  },

  async updateLastLogin(id) {
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);
  },

  async findByIdAndDelete(id) {
    const { data } = await supabase.from('admins').select('*').eq('id', id).maybeSingle();
    if (!data) return null;
    await supabase.from('admins').delete().eq('id', id);
    return fromDB(data);
  },

  // Static password comparison helper used by controllers
  async matchPassword(enteredPassword, hashedPassword) {
    return bcrypt.compare(enteredPassword, hashedPassword);
  },
};

module.exports = Admin;
