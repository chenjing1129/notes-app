import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag } from 'antd';
import { getNote } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Note = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  useEffect(() => {
    const fetchNoteDetails = async () => {
      try {
        const fetchedNote = await getNote(id);
        console.log(fetchedNote);
        setNote(fetchedNote.data);
      } catch (error) {
        console.error('Failed to fetch note details:', error);
        alert('获取笔记详情失败');
        navigate('/notes');
      }
    };

    fetchNoteDetails();
  }, [id, navigate]);

  if (!note) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <Card className="note-card m-4" hoverable>
        <Card.Meta title={note.title} />
        <div
          className="note-content my-4 ql-editor"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
        <div className="my-4">
          {note.tags &&
            note.tags.length > 0 &&
            note.tags.map((tag) => (
              <Tag color="cyan" key={tag}>
                {tag}
              </Tag>
            ))}
        </div>
      </Card>
    </>
  );
};

export default Note;
