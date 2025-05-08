import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Categories from '@/pages/Categories';
import CategoryNotes from '@/pages/CategoryNotes';
import Notes from '@/pages/Notes';
import Note from '../pages/Note';
import CreateNote from '../pages/CreateNote';
import EditNote from '../pages/EditNote';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import About from '../pages/About';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/notes/categories/:categoryId" element={<CategoryNotes />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/notes/:id" element={<Note />} />
      <Route path="/notes/edit/:noteId" element={<EditNote />} />
      <Route path="/create-note" element={<CreateNote />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} /> {/* 新增设置页面路由 */}
      <Route path="/about" element={<About />} /> {/* 新增关于我们页面路由 */}
    </Routes>
  );
};

export default AppRoutes;
