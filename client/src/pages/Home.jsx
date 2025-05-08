import {
  Layout,
  Typography,
  Input,
  Button,
  Card,
  Tabs,
  List,
  Tag,
  Statistic,
  Row,
  Col,
  Space,
  Menu,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  StarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Home = () => {
  const { user } = useStore();
  const navigate = useNavigate();

  // 模拟数据
  const recentNotes = [
    {
      id: 1,
      title: '会议记录',
      content: '今天的产品讨论会...',
      tags: ['工作', '会议'],
    },
    {
      id: 2,
      title: '读书笔记',
      content: '《设计模式》读书笔记...',
      tags: ['学习', '编程'],
    },
  ];

  const templates = [
    { name: '会议记录模板', icon: <FileTextOutlined /> },
    { name: '读书笔记模板', icon: <FileTextOutlined /> },
    { name: '日程计划模板', icon: <FileTextOutlined /> },
  ];

  const stats = [
    { title: '本周笔记', value: 12 },
    { title: '本月字数', value: '2.3k' },
    { title: '收藏笔记', value: 5 },
  ];

  return (
    <Layout>
      <Navbar />
      <Layout>
        <Sider width={250} theme="light" className="p-4">
          <Menu
            mode="inline"
            defaultSelectedKeys={['all']}
            items={[
              {
                key: 'all',
                icon: <UnorderedListOutlined />,
                label: '全部笔记',
              },
              {
                key: 'recent',
                icon: <ClockCircleOutlined />,
                label: '最近编辑',
              },
              { key: 'starred', icon: <StarOutlined />, label: '收藏夹' },
              { type: 'divider' },
              {
                key: 'templates',
                icon: <FileTextOutlined />,
                label: '笔记模板',
              },
            ]}
          />
        </Sider>
        <Content className="p-6 bg-gray-50">
          <div className="mb-6 flex justify-between items-center">
            <Title level={3}>
              {user
                ? `欢迎回来, ${user.nickname || user.username}`
                : '欢迎使用笔记应用'}
            </Title>
            <Space>
              <Input.Search
                placeholder="搜索笔记"
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/create-note')}
              >
                新建笔记
              </Button>
            </Space>
          </div>

          <Row gutter={[16, 16]} className="mb-6">
            {stats.map((stat, index) => (
              <Col span={8} key={index}>
                <Card>
                  <Statistic title={stat.title} value={stat.value} />
                </Card>
              </Col>
            ))}
          </Row>

          <Tabs defaultActiveKey="grid">
            <TabPane
              tab={
                <span>
                  <AppstoreOutlined />
                  网格视图
                </span>
              }
              key="grid"
            >
              <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={recentNotes}
                renderItem={(note) => (
                  <List.Item>
                    <Card
                      title={note.title}
                      extra={<a href={`/notes/${note.id}`}>查看</a>}
                      hoverable
                    >
                      <p className="mb-4">{note.content}</p>
                      <div>
                        {note.tags.map((tag) => (
                          <Tag key={tag} color="blue">
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <UnorderedListOutlined />
                  列表视图
                </span>
              }
              key="list"
            >
              <List
                itemLayout="vertical"
                dataSource={recentNotes}
                renderItem={(note) => (
                  <List.Item
                    extra={
                      <Space>
                        {note.tags.map((tag) => (
                          <Tag key={tag} color="blue">
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                    }
                  >
                    <List.Item.Meta
                      title={<a href={`/notes/${note.id}`}>{note.title}</a>}
                      description={note.content}
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>

          <div className="mt-6">
            <Title level={4}>快速模板</Title>
            <List
              grid={{ gutter: 16, column: 4 }}
              dataSource={templates}
              renderItem={(template) => (
                <List.Item>
                  <Card hoverable className="text-center">
                    {template.icon}
                    <Text className="block mt-2">{template.name}</Text>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
