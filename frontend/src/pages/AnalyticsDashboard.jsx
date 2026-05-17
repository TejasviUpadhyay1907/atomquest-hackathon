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

  // Debug logging
  console.log('📊 Analytics Dashboard Data:');
  console.log('Distribution:', distribution);
  console.log('Status Overview:', statusOverview);
  console.log('Completion:', completion);
  console.log('Achievements:', achievements);

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
      {/* Metric Cards Row */}
      <div className="summary-cards-row" style={{ marginBottom: 24 }}>
        <div className="metric-card">
          <div className="metric-card-icon blue">
            <span>👥</span>
          </div>
          <div className="stat-number">{completion.total_employees || 0}</div>
          <div className="stat-label">Total Employees</div>
          <div className="stat-trend neutral">
            Active in system
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-icon green">
            <span>✅</span>
          </div>
          <div className="stat-number">{completion.fully_completed || 0}</div>
          <div className="stat-label">Completed Check-ins</div>
          <div className="stat-trend up">
            {selectedQuarter} Quarter
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-icon orange">
            <span>🎯</span>
          </div>
          <div className="stat-number">{goalDistributionData.reduce((sum, item) => sum + item.value, 0)}</div>
          <div className="stat-label">Total Goals</div>
          <div className="stat-trend neutral">
            All thrust areas
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-icon red">
            <span>📊</span>
          </div>
          <div className="stat-number">{achievements.length}</div>
          <div className="stat-label">Total Check-ins</div>
          <div className="stat-trend neutral">
            All quarters
          </div>
        </div>
      </div>

      {/* Main Dashboard Card */}
      <div className="card-modern">
        <div className="card-modern-header">
          <h2 className="card-modern-title">Analytics Dashboard</h2>
          <Select 
            value={selectedQuarter} 
            onChange={setSelectedQuarter} 
            style={{ width: 120 }}
            size="large"
          >
            <Option value="Q1">Q1 2024</Option>
            <Option value="Q2">Q2 2024</Option>
            <Option value="Q3">Q3 2024</Option>
            <Option value="Q4">Q4 2024</Option>
          </Select>
        </div>
        
        <div className="card-modern-body">
          <Row gutter={[24, 24]}>
            {/* Goal Distribution by Thrust Area */}
            <Col xs={24} lg={12}>
              <div className="chart-container">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Goal Distribution by Thrust Area</div>
                    <div className="chart-subtitle">Distribution across different focus areas</div>
                  </div>
                </div>
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
              </div>
            </Col>

            {/* Status Overview */}
            <Col xs={24} lg={12}>
              <div className="chart-container">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Goal Status Overview</div>
                    <div className="chart-subtitle">Current status distribution</div>
                  </div>
                </div>
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
              </div>
            </Col>

            {/* Completion Rates */}
            <Col xs={24} lg={12}>
              <div className="chart-container">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Completion Rates - {selectedQuarter}</div>
                    <div className="chart-subtitle">Employee performance this quarter</div>
                  </div>
                </div>
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
              </div>
            </Col>

            {/* Progress Trends */}
            <Col xs={24} lg={12}>
              <div className="chart-container">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Average Progress by Quarter</div>
                    <div className="chart-subtitle">Quarterly performance trends</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressByQuarter}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="progress" stroke="#1890ff" strokeWidth={3} name="Progress %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>

            {/* UoM Distribution */}
            <Col xs={24} lg={12}>
              <div className="chart-container">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Goals by UoM Type</div>
                    <div className="chart-subtitle">Measurement type distribution</div>
                  </div>
                </div>
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
              </div>
            </Col>

            {/* Team Performance Table */}
            <Col xs={24} lg={12}>
              <div className="chart-container">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Team Performance</div>
                    <div className="chart-subtitle">Individual completion rates</div>
                  </div>
                </div>
                <div style={{ padding: '16px 0' }}>
                  {completionRatesData.slice(0, 6).map((emp, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: 16,
                      padding: '12px 16px',
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                        marginRight: 12
                      }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{emp.name}</div>
                        <div className="table-progress-cell">
                          <div className="table-progress-bar">
                            <div 
                              className="table-progress-fill" 
                              style={{ width: `${emp.completion}%` }}
                            />
                          </div>
                          <div className="table-progress-text">{emp.completion}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
