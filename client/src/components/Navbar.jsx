// 导入 antd 组件 + uncss 适配的图标及布局组件
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Space, Button } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  FolderOutlined,
  AppstoreOutlined,
  SettingOutlined, // 新增设置图标
  InfoCircleOutlined, // 新增关于我们图标
  DeleteOutlined, // 修改为 DeleteOutlined
} from '@ant-design/icons';
import { useStore } from '@/store/userStore';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation(); // 使用 useLocation 钩子获取当前页面位置

  const handleLogout = () => {
    if (window.confirm('确定退出')) {
      logout();
      navigate('/login');
    }
  };

  // 根据当前页面设置菜单选中项
  const selectedKeys = React.useMemo(() => {
    switch (location.pathname) {
      case '/':
        return ['home'];
      case '/categories':
        return ['categories'];
      case '/notes':
        return ['notes'];
      case '/trash': // 新增垃圾箱页面选中逻辑
        return ['trash'];
      case '/settings': // 新增设置页面选中逻辑
        return ['settings'];
      case '/about': // 新增关于我们页面选中逻辑
        return ['about'];
      default:
        return [];
    }
  }, [location.pathname]);

  return (
    <Header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={selectedKeys}
        className="w-200"
        items={[
          {
            key: 'home',
            label: (
              <Space size="middle">
                <HomeOutlined />
                <span>首页</span>
              </Space>
            ),
            onClick: () => navigate('/'),
          },
          {
            key: 'categories',
            label: (
              <Space size="middle">
                <AppstoreOutlined />
                <span>分类</span>
              </Space>
            ),
            onClick: () => navigate('/categories'),
          },
          {
            key: 'notes',
            label: (
              <Space size="middle">
                <FolderOutlined />
                <span>笔记</span>
              </Space>
            ),
            onClick: () => navigate('/notes'),
          },
          {
            key: 'trash', // 新增垃圾箱导航项
            label: (
              <Space size="middle">
                <DeleteOutlined /> {/* 修改为 DeleteOutlined */}
                <span>垃圾箱</span>
              </Space>
            ),
            onClick: () => navigate('/trash'),
          },
          {
            key: 'settings', // 新增设置导航项
            label: (
              <Space size="middle">
                <SettingOutlined />
                <span>设置</span>
              </Space>
            ),
            onClick: () => navigate('/settings'),
          },
          {
            key: 'about', // 新增关于我们导航项
            label: (
              <Space size="middle">
                <InfoCircleOutlined />
                <span>关于我们</span>
              </Space>
            ),
            onClick: () => navigate('/about'),
          },
        ]}
      />
      <Space onClick={handleLogout}>
        {user ? (
          <Space>
            {user.avatar_url ? (
              <Avatar src={user.avatar_url} />
            ) : (
              <Avatar icon={<UserOutlined />} />
            )}
            <Text className="ml-2 text-white">
              {user.nickname || user.username}
            </Text>
            <Space />
          </Space>
        ) : (
          <Button type="primary" onClick={() => navigate('/login')}>
            登录
          </Button>
        )}
      </Space>
    </Header>
  );
};

export default Navbar;
