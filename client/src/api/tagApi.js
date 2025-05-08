import axiosInstance from './axiosInstance';

// 获取所有标签
export const getAllTags = async () => {
  try {
    const response = await axiosInstance.get('/tags');
    return response.data; // 假设后端直接返回标签数组
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};
