import React, { useState } from 'react';
import '../styles/Progress.css';

const Progress = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const milestones = [
    {
      id: 1,
      category: 'Physical',
      icon: '🏃',
      title: 'Walking Independently',
      description: 'Can walk without support',
      date: '2024-01-15',
      achieved: true
    },
    {
      id: 2,
      category: 'Social',
      icon: '🤝',
      title: 'Playing with Others',
      description: 'Enjoys group activities',
      date: '2024-01-20',
      achieved: true
    },
    {
      id: 3,
      category: 'Cognitive',
      icon: '🧠',
      title: 'Recognizing Colors',
      description: 'Can identify primary colors',
      date: '2024-02-01',
      achieved: true
    },
    {
      id: 4,
      category: 'Language',
      icon: '💬',
      title: 'Speaking in Sentences',
      description: 'Forms 3-4 word sentences',
      date: '2024-02-10',
      achieved: true
    },
    {
      id: 5,
      category: 'Physical',
      icon: '⚽',
      title: 'Kicking a Ball',
      description: 'Can kick a ball forward',
      date: 'In Progress',
      achieved: false
    },
    {
      id: 6,
      category: 'Cognitive',
      icon: '🔢',
      title: 'Counting to 10',
      description: 'Learning to count',
      date: 'In Progress',
      achieved: false
    }
  ];

  const growthData = {
    height: [
      { month: 'Jan', value: 85 },
      { month: 'Feb', value: 87 },
      { month: 'Mar', value: 89 },
      { month: 'Apr', value: 91 },
      { month: 'May', value: 93 },
      { month: 'Jun', value: 95 }
    ],
    weight: [
      { month: 'Jan', value: 12 },
      { month: 'Feb', value: 12.5 },
      { month: 'Mar', value: 13 },
      { month: 'Apr', value: 13.5 },
      { month: 'May', value: 14 },
      { month: 'Jun', value: 14.5 }
    ]
  };

  const categories = ['All', 'Physical', 'Social', 'Cognitive', 'Language'];

  const filteredMilestones = selectedCategory === 'all'
    ? milestones
    : milestones.filter(m => m.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="progress-page">
      <div className="progress-header">
        <div className="container">
          <h1>📈 Progress Tracking</h1>
          <p>Monitor your child's developmental milestones and growth</p>
        </div>
      </div>

      <div className="container">
        {/* Growth Charts */}
        <div className="growth-section">
          <h2>Growth Charts</h2>
          <div className="charts-grid">
            {/* Height Chart */}
            <div className="chart-card">
              <h3>Height (cm)</h3>
              <div className="chart">
                {growthData.height.map((data, index) => (
                  <div key={index} className="chart-bar-group">
                    <div 
                      className="chart-bar chart-bar-height"
                      style={{ height: `${data.value * 2}px` }}
                    >
                      <span className="bar-value">{data.value}</span>
                    </div>
                    <span className="bar-label">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weight Chart */}
            <div className="chart-card">
              <h3>Weight (kg)</h3>
              <div className="chart">
                {growthData.weight.map((data, index) => (
                  <div key={index} className="chart-bar-group">
                    <div 
                      className="chart-bar chart-bar-weight"
                      style={{ height: `${data.value * 12}px` }}
                    >
                      <span className="bar-value">{data.value}</span>
                    </div>
                    <span className="bar-label">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="milestones-section">
          <div className="section-header">
            <h2>Developmental Milestones</h2>
            <div className="milestone-categories">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.toLowerCase())}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="milestones-grid">
            {filteredMilestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`milestone-card ${milestone.achieved ? 'achieved' : 'in-progress'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="milestone-icon">{milestone.icon}</div>
                <div className="milestone-content">
                  <div className="milestone-header">
                    <h3>{milestone.title}</h3>
                    <span className={`milestone-badge ${milestone.achieved ? 'badge-achieved' : 'badge-progress'}`}>
                      {milestone.achieved ? '✓ Achieved' : '⏱ In Progress'}
                    </span>
                  </div>
                  <p className="milestone-description">{milestone.description}</p>
                  <div className="milestone-footer">
                    <span className="milestone-category">{milestone.category}</span>
                    <span className="milestone-date">📅 {milestone.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="progress-summary">
          <div className="summary-card">
            <div className="summary-icon">🎯</div>
            <div className="summary-content">
              <h3>{milestones.filter(m => m.achieved).length}</h3>
              <p>Milestones Achieved</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⏱️</div>
            <div className="summary-content">
              <h3>{milestones.filter(m => !m.achieved).length}</h3>
              <p>In Progress</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <h3>{Math.round((milestones.filter(m => m.achieved).length / milestones.length) * 100)}%</h3>
              <p>Overall Progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;