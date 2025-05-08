import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Tag, message, Select } from 'antd'; // 引入 Ant Design 组件
import ReactQuill from 'react-quill-new'; // 引入 ReactQuill
import 'react-quill-new/dist/quill.snow.css'; // 引入 Quill 的 CSS
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
  const [categories, setCategories] = useState([]); // 分类状态，用于存储从 API 获取的分类数据
  const [content, setContent] = useState(''); // 新增 state 用于存储富文本内容

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
    // console.log(values); // values from Form.Item names
    // console.log('Content from state:', content); // content from ReactQuill
    try {
      const noteData = {
        ...values, // title, categoryId from Form
        content: content, // 使用来自 ReactQuill 的 content state
        tags,
        userId: user.id,
      };
      await createNote(noteData);
      message.success('笔记创建成功');
      navigate('/notes');
    } catch (error) {
      console.error('Failed to create note:', error);
      message.error('创建笔记失败');
    }
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

          {/* 内容输入框 - 替换为 ReactQuill */}
          <Form.Item
            label="内容"
            rules={[{ required: true, message: '请输入笔记内容' }]}
          >
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="请输入笔记内容"
              style={{ height: '200px', marginBottom: '40px' }} // 增加默认高度和底部间距
              modules={{
                toolbar: [
                  [{ header: '1' }, { header: '2' }, { font: [] }],
                  [{ size: [] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [
                    { list: 'ordered' },
                    { list: 'bullet' },
                    { indent: '-1' },
                    { indent: '+1' },
                  ],
                  ['link', 'image', 'video'],
                  ['clean'],
                ],
              }}
            />
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
