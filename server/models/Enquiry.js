const supabase = require('../config/supabase');

// Joined select — brings user name/phone and product name/slug alongside each enquiry
const JOINED_SELECT = `*, users:user_id(id, name, phone), products:product_id(id, name, slug)`;

// ─── Row ↔ JS object conversion ───────────────────────────────────────────────
const fromDB = (row) => {
  if (!row) return null;
  return {
    _id:         row.id,
    id:          row.id,
    user:        row.users    ? { _id: row.users.id,    id: row.users.id,    name: row.users.name,    phone: row.users.phone }    : row.user_id,
    product:     row.products ? { _id: row.products.id, id: row.products.id, name: row.products.name, slug: row.products.slug }  : row.product_id,
    productName: row.product_name,
    type:        row.type,
    name:        row.name,
    phone:       row.phone,
    email:       row.email,
    subject:     row.subject,
    message:     row.message,
    status:      row.status,
    adminNotes:  row.admin_notes,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
};

const toDB = (obj) => {
  const row = {};
  if (obj.userId      !== undefined) row.user_id      = obj.userId;
  if (obj.productId   !== undefined) row.product_id   = obj.productId;
  if (obj.productName !== undefined) row.product_name = obj.productName;
  if (obj.type        !== undefined) row.type         = obj.type;
  if (obj.name        !== undefined) row.name         = obj.name;
  if (obj.phone       !== undefined) row.phone        = obj.phone;
  if (obj.email       !== undefined) row.email        = obj.email;
  if (obj.subject     !== undefined) row.subject      = obj.subject;
  if (obj.message     !== undefined) row.message      = obj.message;
  if (obj.status      !== undefined) row.status       = obj.status;
  if (obj.adminNotes  !== undefined) row.admin_notes  = obj.adminNotes;
  return row;
};

// ─── Query helpers ─────────────────────────────────────────────────────────────
const Enquiry = {
  async create(fields) {
    const { data, error } = await supabase
      .from('enquiries')
      .insert(toDB(fields))
      .select()
      .single();
    if (error) throw new Error(error.message);
    return fromDB(data);
  },

  // Logged-in user's own enquiries
  async findByUser(userId, limit = 20) {
    const { data } = await supabase
      .from('enquiries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map(fromDB);
  },

  async countDocuments(query = {}) {
    let q = supabase.from('enquiries').select('*', { count: 'exact', head: true });
    if (query.type)   q = q.eq('type', query.type);
    if (query.status) q = q.eq('status', query.status);
    const { count } = await q;
    return count || 0;
  },

  // Admin paginated list with joined user/product data
  async findAdmin({ status, type, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    let q = supabase.from('enquiries').select(JOINED_SELECT, { count: 'exact' });
    if (status) q = q.eq('status', status);
    if (type)   q = q.eq('type',   type);
    q = q.order('created_at', { ascending: false }).range(skip, skip + limit - 1);
    const { data, count } = await q;
    return { enquiries: (data || []).map(fromDB), total: count || 0 };
  },

  // Admin update with refreshed user/product data in response
  async findByIdAndUpdate(id, updates) {
    const { data, error } = await supabase
      .from('enquiries')
      .update(toDB(updates))
      .eq('id', id)
      .select(JOINED_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return fromDB(data);
  },
};

module.exports = Enquiry;

