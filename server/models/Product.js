const supabase = require('../config/supabase');

// ─── Slug generator (mirrors old Mongoose pre-save hook) ──────────────────────
const generateSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

// ─── Row ↔ JS object conversion ───────────────────────────────────────────────
const fromDB = (row) => {
  if (!row) return null;
  return {
    _id:                 row.id,
    id:                  row.id,
    name:                row.name,
    slug:                row.slug,
    description:         row.description,
    shortDescription:    row.short_description,
    category:            row.category,
    leafGrade:           row.leaf_grade,
    origin:              row.origin,
    ingredients:         row.ingredients          ?? [],
    brewingInstructions: row.brewing_instructions ?? {},
    variants:            row.variants             ?? [],
    images:              row.images               ?? [],
    tags:                row.tags                 ?? [],
    ratings:             row.ratings              ?? { average: 0, count: 0 },
    seo:                 row.seo                  ?? {},
    isFeatured:          row.is_featured,
    isActive:            row.is_active,
    createdAt:           row.created_at,
    updatedAt:           row.updated_at,
  };
};

const toDB = (obj) => {
  const row = {};
  if (obj.name                !== undefined) row.name                 = obj.name;
  if (obj.slug                !== undefined) row.slug                 = obj.slug;
  if (obj.description         !== undefined) row.description          = obj.description;
  if (obj.shortDescription    !== undefined) row.short_description    = obj.shortDescription;
  if (obj.category            !== undefined) row.category             = obj.category;
  if (obj.leafGrade           !== undefined) row.leaf_grade           = obj.leafGrade;
  if (obj.origin              !== undefined) row.origin               = obj.origin;
  if (obj.ingredients         !== undefined) row.ingredients          = obj.ingredients;
  if (obj.brewingInstructions !== undefined) row.brewing_instructions = obj.brewingInstructions;
  if (obj.variants            !== undefined) row.variants             = obj.variants;
  if (obj.images              !== undefined) row.images               = obj.images;
  if (obj.tags                !== undefined) row.tags                 = obj.tags;
  if (obj.ratings             !== undefined) row.ratings              = obj.ratings;
  if (obj.seo                 !== undefined) row.seo                  = obj.seo;
  if (obj.isFeatured          !== undefined) row.is_featured          = obj.isFeatured;
  if (obj.isActive            !== undefined) row.is_active            = obj.isActive;
  return row;
};

// ─── Query helpers ─────────────────────────────────────────────────────────────
const Product = {
  async findById(id) {
    const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    return fromDB(data);
  },

  async findBySlug(slug) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();
    return fromDB(data);
  },

  async create(fields) {
    // Auto-generate slug from name if not provided (replaces Mongoose pre-save hook)
    if (!fields.slug && fields.name) fields.slug = generateSlug(fields.name);
    const { data, error } = await supabase
      .from('products')
      .insert(toDB(fields))
      .select()
      .single();
    if (error) throw new Error(error.message);
    return fromDB(data);
  },

  async findByIdAndUpdate(id, fields) {
    // Auto-update slug when name changes and no explicit slug is provided
    if (fields.name && !fields.slug) fields.slug = generateSlug(fields.name);
    const { data, error } = await supabase
      .from('products')
      .update(toDB(fields))
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return fromDB(data);
  },

  async deleteById(id) {
    await supabase.from('products').delete().eq('id', id);
  },

  // Public paginated list with filters (active products only)
  async findPublic({ category, leafGrade, search, isFeatured, page = 1, limit = 12 }) {
    const skip = (page - 1) * limit;
    let q = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true);
    if (category)   q = q.eq('category', category);
    if (leafGrade)  q = q.eq('leaf_grade', leafGrade);
    if (isFeatured) q = q.eq('is_featured', true);
    if (search)     q = q.textSearch('search_vector', search, { type: 'websearch' });
    q = q
      .order('is_featured', { ascending: false })
      .order('created_at',  { ascending: false })
      .range(skip, skip + limit - 1);
    const { data, count } = await q;
    return { products: (data || []).map(fromDB), total: count || 0 };
  },

  // Admin paginated list (all products, no active filter)
  async findAdmin({ category, search, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    let q = supabase.from('products').select('*', { count: 'exact' });
    if (category) q = q.eq('category', category);
    if (search)   q = q.textSearch('search_vector', search, { type: 'websearch' });
    q = q.order('created_at', { ascending: false }).range(skip, skip + limit - 1);
    const { data, count } = await q;
    return { products: (data || []).map(fromDB), total: count || 0 };
  },

  // Distinct values for filter dropdowns
  async distinct(field, where = {}) {
    const colMap = { category: 'category', leafGrade: 'leaf_grade', origin: 'origin' };
    const col = colMap[field] || field;
    let q = supabase.from('products').select(col);
    if (where.isActive !== undefined) q = q.eq('is_active', where.isActive);
    const { data } = await q;
    return [...new Set((data || []).map((r) => r[col]).filter(Boolean))];
  },

  async countDocuments(query = {}) {
    let q = supabase.from('products').select('*', { count: 'exact', head: true });
    if (query.isActive   !== undefined) q = q.eq('is_active',   query.isActive);
    if (query.isFeatured !== undefined) q = q.eq('is_featured', query.isFeatured);
    const { count } = await q;
    return count || 0;
  },

  // Admin analytics: product count grouped by category
  async groupByCategory() {
    const { data } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);
    const counts = {};
    (data || []).forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
    return Object.entries(counts)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count);
  },
};

module.exports = Product;

