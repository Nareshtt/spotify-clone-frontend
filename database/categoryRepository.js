import { getDatabase } from './db';
import { Category } from './models';

export const getAllCategories = async () => {
  const db = getDatabase();
  const result = await db.getAllAsync('SELECT * FROM categories WHERE is_hidden = 0 ORDER BY is_pinned DESC, order_index ASC, created_at ASC');
  return result.map(row => new Category(row.id, row.title, JSON.parse(row.playlist_ids), row.order_index, row.is_pinned === 1, row.is_hidden === 1));
};

export const getCategoryById = async (id) => {
  const db = getDatabase();
  const result = await db.getFirstAsync('SELECT * FROM categories WHERE id = ?', [id]);
  if (!result) return null;
  return new Category(result.id, result.title, JSON.parse(result.playlist_ids), result.order_index, result.is_pinned === 1, result.is_hidden === 1);
};

export const addCategory = async (title, playlistIds = []) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO categories (title, playlist_ids) VALUES (?, ?)',
    [title, JSON.stringify(playlistIds)]
  );
  return result.lastInsertRowId;
};

export const deleteCategory = async (id) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
};

export const updateCategory = async (id, title, playlistIds, orderIndex, isPinned, isHidden) => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE categories SET title = ?, playlist_ids = ?, order_index = ?, is_pinned = ?, is_hidden = ? WHERE id = ?',
    [title, JSON.stringify(playlistIds), orderIndex, isPinned ? 1 : 0, isHidden ? 1 : 0, id]
  );
};

export const updateCategoryPinStatus = async (id, isPinned) => {
  const db = getDatabase();
  await db.runAsync('UPDATE categories SET is_pinned = ? WHERE id = ?', [isPinned ? 1 : 0, id]);
};

export const updateCategoryHiddenStatus = async (id, isHidden) => {
  const db = getDatabase();
  await db.runAsync('UPDATE categories SET is_hidden = ? WHERE id = ?', [isHidden ? 1 : 0, id]);
};

export const updateCategoryOrder = async (id, orderIndex) => {
  const db = getDatabase();
  await db.runAsync('UPDATE categories SET order_index = ? WHERE id = ?', [orderIndex, id]);
};

export const addPlaylistToCategory = async (categoryId, playlistId) => {
  const category = await getCategoryById(categoryId);
  if (!category) throw new Error('Category not found');
  
  const updatedPlaylistIds = [...category.playlistIds, playlistId];
  await updateCategory(categoryId, category.title, updatedPlaylistIds, category.orderIndex, category.isPinned, category.isHidden);
};

export const removePlaylistFromCategory = async (categoryId, playlistId) => {
  const category = await getCategoryById(categoryId);
  if (!category) throw new Error('Category not found');
  
  const updatedPlaylistIds = category.playlistIds.filter(id => id !== playlistId);
  await updateCategory(categoryId, category.title, updatedPlaylistIds, category.orderIndex, category.isPinned, category.isHidden);
};
