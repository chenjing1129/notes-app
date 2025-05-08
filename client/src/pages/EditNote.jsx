import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Tag, message, Select } from 'antd'; // 引入 Ant Design 组件
import ReactQuill from 'react-quill-new'; // 引入 ReactQuill
import 'react-quill-new/dist/quill.snow.css'; // 引入 Quill 的 CSS
import { updateNote, getNote } from '@/api/noteApi'; // 引入更新笔记和获取笔记的 API
import { getCategories } from '@/api/categoryApi'; // 引入获取分类的 API
import { getAllTags } from '@/api/tagApi'; // 引入获取所有标签的 API
import { useStore } from '@/store/userStore'; // 引入全局状态管理
import { useNavigate, useParams } from 'react-router-dom'; // 引入 React Router 的导航和路由参数钩子
import Navar from '../components/Navbar'; // 引入导航栏组件

const EditNote = () => {
  const navigate = useNavigate(); // 获取导航函数
  const { noteId } = useParams(); // 从路由参数中获取笔记 ID
  const { user } = useStore(); // 从全局状态中获取用户信息
  const [tags, setTags] = useState([]); // 标签状态，用于存储笔记的标签
  const [allTags, setAllTags] = useState([]); // 新增：存储所有从 API 获取的标签
  const [initialTags, setInitialTags] = useState([]); // 新增：存储笔记的原始标签
  const [categories, setCategories] = useState([]); // 分类状态，用于存储从 API 获取的分类数据
  const [form] = Form.useForm(); // 使用 Ant Design 的 Form useForm 钩子管理表单
  const [noteData, setNoteData] = useState(null); // 这个 state 仍然有用，用于存储从API获取的完整笔记数据
  const [content, setContent] = useState(''); // 新增 state 用于存储富文本内容

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [noteResponse, categoriesResponse, tagsResponse] =
          await Promise.all([getNote(noteId), getCategories(), getAllTags()]);

        const fetchedNoteData = noteResponse.data;
        setNoteData(fetchedNoteData); // 存储整个笔记对象
        const currentTags = fetchedNoteData.tags || [];
        setTags(currentTags);
        setInitialTags(currentTags);
        setContent(fetchedNoteData.content || ''); // 设置富文本编辑器的内容
        setCategories(categoriesResponse.data);
        setAllTags(
          tagsResponse.data
            ? tagsResponse.data.map((tag) => ({
                label: tag.name,
                value: tag.name,
              }))
            : tagsResponse.map((tag) => ({ label: tag.name, value: tag.name })),
        );

        // Ant Design Form 的 setFieldsValue 应该在数据获取后再调用
        form.setFieldsValue({
          title: fetchedNoteData.title,
          categoryId: fetchedNoteData.category_id,
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        message.error('获取数据失败');
      }
    };
    fetchData();
  }, [noteId, form]); // 添加 form 到依赖项，因为 setFieldsValue 用到了它

  const handleSubmit = async (values) => {
    try {
      const updatedNoteData = {
        ...values, // title, categoryId from Form
        content: content, // 使用来自 ReactQuill 的 content state
        tags,
        userId: user.id,
      };
      await updateNote(noteId, updatedNoteData);
      message.success('笔记更新成功');
      navigate('/notes');
    } catch (error) {
      console.error('Failed to update note:', error);
      message.error('更新笔记失败');
    }
  };

  return (
    <>
      <Navar />
      <div className="p-4">
        <h1>编辑笔记</h1>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="max-w-2xl mx-auto"
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入笔记标题' }]}
          >
            <Input placeholder="请输入笔记标题" />
          </Form.Item>
          <Form.Item
            label="内容"
            rules={[{ required: true, message: '请输入笔记内容' }]}
          >
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="请输入笔记内容"
              style={{ height: '200px', marginBottom: '40px' }}
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
              value={tags} // 当前选中的/修改中的标签
              onChange={(newTags) => setTags(newTags)}
              options={allTags}
              tokenSeparators={[',', ' ']}
            />
            {initialTags.length > 0 && (
              <div
                style={{ marginTop: '8px', fontSize: '12px', color: 'gray' }}
              >
                原始标签: {initialTags.join(', ')}
              </div>
            )}
          </div>
          {/* 提交按钮 */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              更新笔记
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default EditNote;
