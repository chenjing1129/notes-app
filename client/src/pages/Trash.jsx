import React, { useState, useEffect } from 'react';
import { List, Button, Modal, message, Card, Tag, Typography } from 'antd';
import { useStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import {
  getTrashedNotes,
  restoreNote,
  permanentlyDeleteNote,
} from '@/api/noteApi';
import Navbar1 from '@/components/Navbar'; // Assuming Navbar1 is your main navbar
import {
  UndoOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';

const { Text } = Typography;
const { confirm } = Modal;

const Trash = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchTrashedNotes();
    }
  }, [user, navigate]);

  const fetchTrashedNotes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await getTrashedNotes(user.id);
      setTrashedNotes(response.data || []); // API response might be {data: [...]} or just [...]
    } catch (error) {
      console.error('Failed to fetch trashed notes:', error);
      message.error('获取垃圾箱笔记失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (noteId) => {
    if (!user) return;
    try {
      await restoreNote(noteId, user.id);
      message.success('笔记已恢复');
      fetchTrashedNotes(); // Refresh the list
    } catch (error) {
      console.error('Failed to restore note:', error);
      message.error('恢复笔记失败');
    }
  };

  const handlePermanentDelete = (noteId) => {
    if (!user) return;
    confirm({
      title: '确定要永久删除这条笔记吗?',
      icon: <ExclamationCircleFilled />,
      content: '此操作不可恢复，笔记将从数据库中彻底移除。',
      okText: '永久删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await permanentlyDeleteNote(noteId, user.id);
          message.success('笔记已永久删除');
          fetchTrashedNotes(); // Refresh the list
        } catch (error) {
          console.error('Failed to permanently delete note:', error);
          message.error('永久删除失败');
        }
      },
    });
  };

  return (
    <>
      <Navbar1 />
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">垃圾箱</h1>
        {loading && <p>加载中...</p>}
        {!loading && trashedNotes.length === 0 && <Text>垃圾箱是空的。</Text>}
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
          dataSource={trashedNotes}
          renderItem={(note) => (
            <List.Item>
              <Card
                title={note.title}
                actions={[
                  <Button
                    key="restore"
                    icon={<UndoOutlined />}
                    onClick={() => handleRestore(note.id)}
                    type="primary"
                  >
                    恢复
                  </Button>,
                  <Button
                    key="delete"
                    icon={<DeleteOutlined />}
                    onClick={() => handlePermanentDelete(note.id)}
                    danger
                  >
                    永久删除
                  </Button>,
                ]}
              >
                <Text type="secondary">
                  删除于: {new Date(note.deleted_at).toLocaleString()}
                </Text>
              </Card>
            </List.Item>
          )}
        />
      </div>
    </>
  );
};

export default Trash;
