// src/pages/ChildProgressTracker.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ChildProgressTracker.css';

const ChildProgressTracker = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('physical');
  const [selectedAge, setSelectedAge] = useState('4-5');

  const categories = [
    { id: 'physical', name: 'Physical Development', icon: '🏃', color: '#3b82f6' },
    { id: 'cognitive', name: 'Cognitive Skills', icon: '🧠', color: '#8b5cf6' },
    { id: 'social', name: 'Social & Emotional', icon: '❤️', color: '#ec4899' },
    { id: 'language', name: 'Language & Communication', icon: '💬', color: '#10b981' },
    { id: 'creative', name: 'Creative Expression', icon: '🎨', color: '#f59e0b' }
  ];

  const milestones = {
    physical: [
      { id: 1, title: 'Walks independently', age: '1-2', achieved: true, date: 'Jan 15, 2024' },
      { id: 2, title: 'Runs smoothly', age: '2-3', achieved: true, date: 'Mar 20, 2024' },
      { id: 3, title: 'Hops on one foot', age: '3-4', achieved: true, date: 'Jun 10, 2024' },
      { id: 4, title: 'Catches a ball', age: '4-5', achieved: true, date: 'Sep 5, 2024' },
      { id: 5, title: 'Skips confidently', age: '4-5', achieved: false, inProgress: true },
      { id: 6, title: 'Rides bicycle with training wheels', age: '4-5', achieved: false }
    ],
    cognitive: [
      { id: 1, title: 'Recognizes colors', age: '2-3', achieved: true, date: 'Feb 12, 2024' },
      { id: 2, title: 'Counts to 10', age: '3-4', achieved: true, date: 'May 18, 2024' },
      { id: 3, title: 'Identifies shapes', age: '3-4', achieved: true, date: 'Jul 22, 2024' },
      { id: 4, title: 'Sorts objects by size', age: '4-5', achieved: true, date: 'Oct 8, 2024' },
      { id: 5, title: 'Understands time concepts', age: '4-5', achieved: false, inProgress: true },
      { id: 6, title: 'Solves simple puzzles (12+ pieces)', age: '4-5', achieved: false }
    ],
    social: [
      { id: 1, title: 'Plays alongside other children', age: '2-3', achieved: true, date: 'Mar 5, 2024' },
      { id: 2, title: 'Takes turns in games', age: '3-4', achieved: true, date: 'Jun 15, 2024' },
      { id: 3, title: 'Shows empathy', age: '4-5', achieved: true, date: 'Aug 20, 2024' },
      { id: 4, title: 'Makes friends easily', age: '4-5', achieved: true, date: 'Nov 2, 2024' },
      { id: 5, title: 'Resolves conflicts peacefully', age: '4-5', achieved: false, inProgress: true },
      { id: 6, title: 'Cooperates in group activities', age: '4-5', achieved: false }
    ],
    language: [
      { id: 1, title: 'Says first words', age: '1-2', achieved: true, date: 'Dec 10, 2023' },
      { id: 2, title: 'Uses 2-3 word sentences', age: '2-3', achieved: true, date: 'Apr 8, 2024' },
      { id: 3, title: 'Sings simple songs', age: '3-4', achieved: true, date: 'Jul 12, 2024' },
      { id: 4, title: 'Tells simple stories', age: '4-5', achieved: true, date: 'Sep 18, 2024' },
      { id: 5, title: 'Recognizes letters', age: '4-5', achieved: false, inProgress: true },
      { id: 6, title: 'Writes own name', age: '4-5', achieved: false }
    ],
    creative: [
      { id: 1, title: 'Scribbles with crayons', age: '2-3', achieved: true, date: 'Jan 25, 2024' },
      { id: 2, title: 'Draws recognizable shapes', age: '3-4', achieved: true, date: 'May 30, 2024' },
      { id: 3, title: 'Uses scissors safely', age: '3-4', achieved: true, date: 'Aug 5, 2024' },
      { id: 4, title: 'Creates imaginative art', age: '4-5', achieved: true, date: 'Oct 15, 2024' },
      { id: 5, title: 'Draws basic people/animals', age: '4-5', achieved: false, inProgress: true },
      { id: 6, title: 'Creates complex crafts', age: '4-5', achieved: false }
    ]
  };

  const growthData = [
    { month: 'Jan', height: 95, weight: 14 },
    { month: 'Feb', height: 96, weight: 14.2 },
    { month: 'Mar', height: 96.5, weight: 14.5 },
    { month: 'Apr', height: 97, weight: 14.8 },
    { month: 'May', height: 97.5, weight: 15 },
    { month: 'Jun', height: 98, weight: 15.3 },
    { month: 'Jul', height: 98.5, weight: 15.5 },
    { month: 'Aug', height: 99, weight: 15.8 },
    { month: 'Sep', height: 99.5, weight: 16 },
    { month: 'Oct', height: 100, weight: 16.2 },
    { month: 'Nov', height: 100.5, weight: 16.5 },
    { month: 'Dec', height: 101, weight: 16.8 }
  ];

  const achievements = [
    { id: 1, title: '🏆 First Week Completed!', date: 'Jan 22, 2024', description: 'Completed first full week at childcare' },
    { id: 2, title: '🎨 Little Artist Award', date: 'Mar 10, 2024', description: 'Created beautiful artwork for spring exhibition' },
    { id: 3, title: '👥 Friendship Star', date: 'Jun 5, 2024', description: 'Made three new friends this month' },
    { id: 4, title: '📚 Story Time Champion', date: 'Sep 15, 2024', description: 'Participated in every story time session' },
    { id: 5, title: '⭐ Kindness Award', date: 'Nov 8, 2024', description: 'Helped another child who was feeling sad' }
  ];

  const currentMilestones = milestones[selectedCategory] || [];
  const achievedCount = currentMilestones.filter(m => m.achieved).length;
  const totalCount = currentMilestones.length;
  const progressPercentage = Math.round((achievedCount / totalCount) * 100);

  const maxHeight = Math.max(...growthData.map(d => d.height));
  const maxWeight = Math.max(...growthData.map(d => d.weight));

  return (
    <div className="progress-tracker">
      {/* Header */}
      <div className="tracker-header">
        <div className="header-content">
          <div className="title-section">
            <h1>📊 Child Progress Tracker</h1>
            <p>Track {user?.childName || 'your child'}'s developmental journey</p>
          </div>
          <div className="header-actions">
            <button className="action-btn">📥 Download Report</button>
            <button className="action-btn">📧 Share with Caretaker</button>
          </div>
        </div>
      </div>

      <div className="tracker-content">
        {/* Overview Cards */}
        <div className="overview-section">
          <div className="overview-card card-milestones">
            <div className="card-icon">🎯</div>
            <div className="card-info">
              <h3>{achievedCount} of {totalCount}</h3>
              <p>Milestones Achieved</p>
            </div>
            <div className="card-progress">
              <div className="circular-progress">
                <svg width="80" height="80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="35" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="8"
                    strokeDasharray={`${progressPercentage * 2.2} 220`}
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <span className="progress-value">{progressPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="overview-card card-categories">
            <div className="card-icon">📋</div>
            <div className="card-info">
              <h3>{categories.length}</h3>
              <p>Development Areas</p>
            </div>
          </div>

          <div className="overview-card card-achievements">
            <div className="card-icon">🏆</div>
            <div className="card-info">
              <h3>{achievements.length}</h3>
              <p>Awards Earned</p>
            </div>
          </div>

          <div className="overview-card card-growth">
            <div className="card-icon">📈</div>
            <div className="card-info">
              <h3>{growthData[growthData.length - 1].height} cm</h3>
              <p>Current Height</p>
            </div>
          </div>
        </div>

        {/* Milestone Categories */}
        <div className="milestones-section">
          <h2>Developmental Milestones</h2>
          
          <div className="category-selector">
            {categories.map((category, index) => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
                style={{ 
                  '--category-color': category.color,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>

          <div className="milestones-grid">
            {currentMilestones.map((milestone, index) => (
              <div 
                key={milestone.id}
                className={`milestone-item ${milestone.achieved ? 'achieved' : ''} ${milestone.inProgress ? 'in-progress' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="milestone-status">
                  {milestone.achieved ? (
                    <div className="status-icon achieved-icon">✓</div>
                  ) : milestone.inProgress ? (
                    <div className="status-icon progress-icon">⏳</div>
                  ) : (
                    <div className="status-icon pending-icon">○</div>
                  )}
                </div>
                <div className="milestone-details">
                  <h4>{milestone.title}</h4>
                  <p className="milestone-age">Age: {milestone.age} years</p>
                  {milestone.achieved && (
                    <p className="milestone-date">Achieved: {milestone.date}</p>
                  )}
                  {milestone.inProgress && (
                    <p className="milestone-status-text">In Progress...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Chart */}
        <div className="growth-section">
          <h2>Growth Tracking (Past Year)</h2>
          
          <div className="growth-charts">
            {/* Height Chart */}
            <div className="chart-container">
              <h3>📏 Height (cm)</h3>
              <div className="line-chart">
                <svg width="100%" height="200" viewBox="0 0 600 200">
                  {/* Grid lines */}
                  {[0, 50, 100, 150, 200].map(y => (
                    <line key={y} x1="50" y1={y} x2="550" y2={y} stroke="#e5e7eb" strokeWidth="1"/>
                  ))}
                  
                  {/* Height line */}
                  <polyline
                    points={growthData.map((d, i) => 
                      `${50 + (i * 45)},${200 - ((d.height - 90) * 10)}`
                    ).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    className="chart-line"
                  />
                  
                  {/* Data points */}
                  {growthData.map((d, i) => (
                    <g key={i}>
                      <circle
                        cx={50 + (i * 45)}
                        cy={200 - ((d.height - 90) * 10)}
                        r="5"
                        fill="#3b82f6"
                        className="data-point"
                      />
                      <text
                        x={50 + (i * 45)}
                        y="220"
                        textAnchor="middle"
                        fontSize="12"
                        fill="#6b7280"
                      >
                        {d.month}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Weight Chart */}
            <div className="chart-container">
              <h3>⚖️ Weight (kg)</h3>
              <div className="line-chart">
                <svg width="100%" height="200" viewBox="0 0 600 200">
                  {/* Grid lines */}
                  {[0, 50, 100, 150, 200].map(y => (
                    <line key={y} x1="50" y1={y} x2="550" y2={y} stroke="#e5e7eb" strokeWidth="1"/>
                  ))}
                  
                  {/* Weight line */}
                  <polyline
                    points={growthData.map((d, i) => 
                      `${50 + (i * 45)},${200 - ((d.weight - 13) * 30)}`
                    ).join(' ')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    className="chart-line"
                  />
                  
                  {/* Data points */}
                  {growthData.map((d, i) => (
                    <g key={i}>
                      <circle
                        cx={50 + (i * 45)}
                        cy={200 - ((d.weight - 13) * 30)}
                        r="5"
                        fill="#10b981"
                        className="data-point"
                      />
                      <text
                        x={50 + (i * 45)}
                        y="220"
                        textAnchor="middle"
                        fontSize="12"
                        fill="#6b7280"
                      >
                        {d.month}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="achievements-section">
          <h2>🏆 Special Achievements</h2>
          <div className="achievements-timeline">
            {achievements.map((achievement, index) => (
              <div 
                key={achievement.id}
                className="achievement-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="achievement-badge">{achievement.title.split(' ')[0]}</div>
                <div className="achievement-content">
                  <h4>{achievement.title.substring(2)}</h4>
                  <p className="achievement-date">{achievement.date}</p>
                  <p className="achievement-desc">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildProgressTracker;