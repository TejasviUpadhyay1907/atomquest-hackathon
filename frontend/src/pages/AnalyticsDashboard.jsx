import React, { useState } from 'react';
import { Card, Row, Col, Select, Spin } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { reportAPI } from '../services/api';

const { Option } = Select;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

const AnalyticsDashboard = () => {
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');

  // Fetch goal distribution
  const { data: distributionData, isLoading: distributionLoading } = useQuery({
    queryKey: ['goalDistribution'],
    queryFn: () => reportAPI.getGoalDistribution(),
  });

  // Fetch status overview
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['statusOverview'],
    queryFn: () => reportAPI.getStatusOverview(),
  });

  // Fetch completion dashboard
  const { data: completionData, isLoading: completionLoading } = useQuery({
    queryKey: ['completionDashboard', selectedQuarter],
    queryFn: () => reportAPI.getCompletionDashboard(selectedQuarter),
  });

  // Fetch achievement report for trends
  const { data: achievementData, isLoading: achievementLoading } = useQuery({
    queryKey: ['achievementReport'],
    queryFn: () => reportAPI.getAchievementReport(),
  });

  const distribution = distributionData?.data || [];
  const statusOverview = statusData?.data || [];
  const completion = completionData?.data || {};
  const achievements = achievementData?.data || [];

  // Process data for charts
  const goalDistributionData = distribution.map(item => ({
    name: item.thrust_area,
    value: item.count,
  }));

  const statusOverviewData = statusOverview.map(item => ({
    name: item.status,
    value: item.count,
  }));

  const completionRatesData = completion.employees?.map(emp => ({
    name: emp.employee_name.split(' ')[0], // First name only
    completion: emp.completion_percentage,
  })) || [];

  // Calculate average progress by quarter
  const progressByQuarter = ['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => {
    const quarterAchievements = achievements.filter(a => a.quarter === quarter);
    const avgProgress = quarterAchievements.length > 0
      ? quarterAchievements.reduce((sum, a) => sum + (a.progress_score || 0), 0) / quarterAchievements.length
      : 0;
    return {
      quarter,
      progress: Math.round(avgProgress),
    };
  });

  // UoM distribution
  const uomDistribution = achievements.reduce((acc, item) => {
    const uom = item.uom_type;
    acc[uom] = (acc[uom] || 0) + 1;
    return acc;
  }, {});

  const uomData = Object.entries(uomDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const isLoading = distributionLoading || statusLoading || completionLoading || achievementLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Card title="Analytics Dashboard" extra={
        <Select value={selectedQuarter} onChange={setSelectedQuarter} style={{ width: 120 }}>
          <Option value="Q1">Q1</Option>
          <Option value="Q2">Q2</Option>
          <Option value="Q3">Q3</Option>
          <Option value="Q4">Q4</Option>
        </Select>
      }>
        <Row gutter={[16, 16]}>
          {/* Goal Distribution by Thrust Area */}
          <Col xs={24} lg={12}>
            <Card title="Goal Distribution by Thrust Area" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={goalDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {goalDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Status Overview */}
          <Col xs={24} lg={12}>
            <Card title="Goal Status Overview" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusOverviewData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Completion Rates */}
          <Col xs={24} lg={12}>
            <Card title={`Completion Rates - ${selectedQuarter}`} size="small">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={completionRatesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completion" fill="#52c41a" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Progress Trends */}
          <Col xs={24} lg={12}>
            <Card title="Average Progress by Quarter" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressByQuarter}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="progress" stroke="#1890ff" strokeWidth={2} name="Progress %" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* UoM Distribution */}
          <Col xs={24} lg={12}>
            <Card title="Goals by UoM Type" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={uomData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#722ed1" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Summary Stats */}
          <Col xs={24} lg={12}>
            <Card title="Summary Statistics" size="small">
              <div style={{ padding: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>
                    {completion.total_employees || 0}
                  </div>
                  <div style={{ color: '#666' }}>Total Employees</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>
                    {completion.fully_completed || 0}
                  </div>
                  <div style={{ color: '#666' }}>Completed Check-ins</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 32, fontWeight: 'bold', color: '#faad14' }}>
                    {goalDistributionData.reduce((sum, item) => sum + item.value, 0)}
                  </div>
                  <div style={{ color: '#666' }}>Total Goals</div>
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 'bold', color: '#722ed1' }}>
                    {achievements.length}
                  </div>
                  <div style={{ color: '#666' }}>Total Check-ins</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
