import { Layout, Typography, Form, Input, Button, Space } from 'antd';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import { Link } from 'react-router-dom'; // 引入 Link 组件

const { Content } = Layout;
const { Title } = Typography;

const Profile = () => {
  const { user } = useStore();
  const [form] = Form.useForm();

  // 表单提交处理函数
  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    // 这里可以添加更新用户信息的 API 调用
  };

  return (
    <Layout>
      <Navbar />
      <Content className="p-6 relative">
        {' '}
        {/* 添加 relative 类，以便绝对定位按钮 */}
        {/* 返回按钮 */}
        <Link to="/" className="absolute top-6 left-6">
          <Button>返回首页</Button>
        </Link>
        <Title level={2} className="text-center">
          个人中心
        </Title>
        <Form
          form={form}
          name="profileForm"
          initialValues={{
            username: user.username,
            nickname: user.nickname,
            email: user.email,
          }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="昵称"
            name="nickname"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存修改
              </Button>
              <Button>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default Profile;
