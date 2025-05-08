import axiosInstance from './axiosInstance';

// 创建笔记
export const createNote = async (noteData) => {
  return axiosInstance.post('/notes', noteData);
};

// 查询某个用户的所有笔记
export const getNotes = async (userId) => {
  return axiosInstance.get(`/notes/user/${userId}`);
};

// 查询笔记详情
export const getNote = async (noteId) => {
  return axiosInstance.get(`/notes/${noteId}`);
};

// 查询某个用户某个分类的所有笔记
export const getNotesByCategory = async (userId, categoryId) => {
  return axiosInstance.get(`/notes/user/${userId}/category/${categoryId}`);
};

// 更新笔记
export const updateNote = async (noteId, noteData) => {
  return axiosInstance.put(`/notes/${noteId}`, noteData);
};

// 删除笔记
export const softDeleteNote = async (noteId, userId) => {
  return axiosInstance.delete(`/notes/${noteId}`, { data: { userId } });
};

// 获取垃圾箱中的笔记
export const getTrashedNotes = async (userId) => {
  return axiosInstance.get(`/notes/trash/${userId}`);
};

// 从垃圾箱恢复笔记
export const restoreNote = async (noteId, userId) => {
  return axiosInstance.put(`/notes/${noteId}/restore`, { userId });
};

// 永久删除笔记
export const permanentlyDeleteNote = async (noteId, userId) => {
  return axiosInstance.delete(`/notes/${noteId}/force`, { data: { userId } });
};
