import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Tag, message, Select } from 'antd'; // 引入 Ant Design 组件
import { createNote } from '@/api/noteApi'; // 引入创建笔记的 API
import { getCategories } from '@/api/categoryApi'; // 引入获取分类的 API
import { getAllTags } from '@/api/tagApi'; // 引入获取所有标签的 API
import { useStore } from '@/store/userStore'; // 引入全局状态管理
import { useNavigate } from 'react-router-dom'; // 引入 React Router 的导航钩子
import Navbar from '@/components/Navbar'; // 引入导航栏组件

const CreateNote = () => {
  const navigate = useNavigate(); // 获取导航函数
  const { user } = useStore(); // 从全局状态中获取当前用户信息
  const [tags, setTags] = useState([]); // 标签状态，用于存储用户选择或创建的标签
  const [allTags, setAllTags] = useState([]); // 新增：存储所有从API获取的标签
  const [inputTag, setInputTag] = useState(''); // 输入框中的标签内容
  const [categories, setCategories] = useState([]); // 分类状态，用于存储从 API 获取的分类数据

  // 使用 useEffect 钩子在组件加载时获取分类和所有标签数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          getCategories(),
          getAllTags(),
        ]);
        setCategories(categoriesResponse.data);
        // 假设 getAllTags 返回的数据结构是 { data: [{ id: '1', name: 'tag1' }, ...] }
        // 或者直接是数组 [{ id: '1', name: 'tag1' }, ...]
        // 我们需要的是标签名数组用于 Select options
        setAllTags(
          tagsResponse.data
            ? tagsResponse.data.map((tag) => ({
                label: tag.name,
                value: tag.name,
              }))
            : tagsResponse.map((tag) => ({ label: tag.name, value: tag.name })),
        );
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        message.error('获取初始数据失败');
      }
    };
    fetchData();
  }, []);

  // 提交表单时的处理函数
  const handleSubmit = async (values) => {
    console.log(values);
    try {
      const noteData = {
        ...values, // 展开表单提交的值
        tags, // 添加标签到笔记数据中
        userId: user.id, // 添加当前用户的 ID
      };
      await createNote(noteData); // 调用 API 创建笔记
      message.success('笔记创建成功'); // 显示成功提示
      navigate('/notes'); // 导航到笔记列表页面
    } catch (error) {
      console.error('Failed to create note:', error); // 打印错误信息
      message.error('创建笔记失败'); // 显示失败提示
    }
  };

  // 输入框内容变化时的处理函数
  const handleInputTagChange = (e) => {
    setInputTag(e.target.value); // 更新输入框中的标签内容
  };

  // 添加标签的处理函数
  const handleAddTag = () => {
    // 如果输入框中有内容且标签未重复
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag]); // 将新标签添加到标签列表中
      setInputTag(''); // 清空输入框
    }
  };

  // 删除标签的处理函数
  const handleRemoveTag = (removedTag) => {
    const newTags = tags.filter((tag) => tag !== removedTag); // 过滤掉要删除的标签
    setTags(newTags); // 更新标签列表
  };

  // 渲染组件
  return (
    <>
      <Navbar />
      <div className="p-4">
        <h1>创建笔记</h1>
        <Form
          onFinish={handleSubmit} // 表单提交时调用 handleSubmit 函数
          layout="vertical" // 表单布局为垂直
          className="max-w-2xl mx-auto" // 样式：最大宽度为 2xl，居中
        >
          {/* 标题输入框 */}
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入笔记标题' }]}
          >
            <Input placeholder="请输入笔记标题" />
          </Form.Item>

          {/* 内容输入框 */}
          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入笔记内容' }]}
          >
            <Input.TextArea rows={6} placeholder="请输入笔记内容" />
          </Form.Item>

          {/* 分类选择框 */}
          <Form.Item
            label="类型"
            name="categoryId"
            rules={[{ required: true, message: '请选择笔记类型' }]}
          >
            <Select placeholder="请选择笔记类型">
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* 标签输入和显示区域 */}
          <div className="mb-4">
            <label className="block mb-2">标签</label>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="选择或创建标签"
              value={tags}
              onChange={(newTags) => setTags(newTags)}
              options={allTags}
              tokenSeparators={[',', ' ']}
            />
          </div>

          {/* 提交按钮 */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              创建笔记
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default CreateNote;
