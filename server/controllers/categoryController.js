const supabase = require('../config/supabase');

const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

const fromDB = (row) => {
  if (!row) return null;
  return {
    _id:         row.id,
    id:          row.id,
    name:        row.name,
    slug:        row.slug,
    description: row.description,
    isActive:    row.is_active,
    sortOrder:   row.sort_order,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
};

// @desc  Get all categories (public — active only)
// @route GET /api/categories
// @access Public
const getCategories = async (req, res) => {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true });
  res.status(200).json({ success: true, categories: (data || []).map(fromDB) });
};

// @desc  Get all categories (admin — including inactive)
// @route GET /api/admin/categories
// @access Admin
const adminGetCategories = async (req, res) => {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true });
  res.status(200).json({ success: true, categories: (data || []).map(fromDB) });
};

// @desc  Create category
// @route POST /api/admin/categories
// @access Admin
const createCategory = async (req, res) => {
  const { name, description = '', sortOrder = 0 } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ success: false, message: 'Category name is required.' });
  }

  const slug = generateSlug(name.trim());

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: name.trim(), slug, description, sort_order: sortOrder })
    .select()
    .single();

  if (error) {
    if (error.message.includes('23505')) {
      return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
    }
    throw new Error(error.message);
  }

  res.status(201).json({ success: true, category: fromDB(data) });
};

// @desc  Update category
// @route PUT /api/admin/categories/:id
// @access Admin
const updateCategory = async (req, res) => {
  const { name, description, isActive, sortOrder } = req.body;
  const updates = {};
  if (name        !== undefined) { updates.name = name.trim(); updates.slug = generateSlug(name.trim()); }
  if (description !== undefined) updates.description = description;
  if (isActive    !== undefined) updates.is_active   = isActive;
  if (sortOrder   !== undefined) updates.sort_order  = sortOrder;

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    if (error.message.includes('23505')) {
      return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
    }
    throw new Error(error.message);
  }
  if (!data) return res.status(404).json({ success: false, message: 'Category not found.' });

  res.status(200).json({ success: true, category: fromDB(data) });
};

// @desc  Delete category
// @route DELETE /api/admin/categories/:id
// @access Admin
const deleteCategory = async (req, res) => {
  // Check if any products use this category
  const cat = await supabase.from('categories').select('name').eq('id', req.params.id).maybeSingle();
  if (!cat.data) return res.status(404).json({ success: false, message: 'Category not found.' });

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category', cat.data.name);

  if (count > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete — ${count} product(s) are using this category. Re-assign them first.`,
    });
  }

  await supabase.from('categories').delete().eq('id', req.params.id);
  res.status(200).json({ success: true, message: 'Category deleted.' });
};

module.exports = { getCategories, adminGetCategories, createCategory, updateCategory, deleteCategory };
