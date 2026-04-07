const supabase = require('../config/supabase');

// ─── Row ↔ JS object conversion ───────────────────────────────────────────────
const fromDB = (row) => {
  if (!row) return null;
  return {
    _id:       row.id,
    id:        row.id,
    section:   row.section,
    data:      row.data,
    isActive:  row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// ─── Query helpers ─────────────────────────────────────────────────────────────
const SiteContent = {
  async findOne(query) {
    let q = supabase.from('site_content').select('*');
    if (query.section) q = q.eq('section', query.section);
    const { data } = await q.maybeSingle();
    return fromDB(data);
  },

  async findAll() {
    const { data } = await supabase.from('site_content').select('*');
    return (data || []).map(fromDB);
  },

  // Upsert by section key (replaces Mongoose findOneAndUpdate with upsert:true)
  async upsertSection(section, data) {
    const { data: row, error } = await supabase
      .from('site_content')
      .upsert(
        { section, data, is_active: true, updated_at: new Date().toISOString() },
        { onConflict: 'section' }
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return fromDB(row);
  },
};

module.exports = SiteContent;
