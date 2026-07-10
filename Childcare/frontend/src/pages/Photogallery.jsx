import React, { useState } from 'react';
import '../styles/PhotoGallery.css';

const PhotoGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const categories = ['All', 'Meals', 'Activities', 'Naps', 'Outdoor', 'Learning'];

  const photos = [
    {
      id: 1,
      category: 'Activities',
      emoji: '🎨',
      title: 'Art Time',
      description: 'Finger painting',
      date: '2024-02-15',
      time: '10:30 AM',
      childName: 'Mily Rose'
    },
    {
      id: 2,
      category: 'Meals',
      emoji: '🍎',
      title: 'Snack Time',
      description: 'Healthy fruits',
      date: '2024-02-15',
      time: '11:00 AM',
      childName: 'Mily Rose'
    },
    {
      id: 3,
      category: 'Outdoor',
      emoji: '⚽',
      title: 'Playground Fun',
      description: 'Playing soccer',
      date: '2024-02-15',
      time: '2:30 PM',
      childName: 'Mily Rose'
    },
    {
      id: 4,
      category: 'Learning',
      emoji: '📚',
      title: 'Story Time',
      description: 'Reading books',
      date: '2024-02-14',
      time: '3:00 PM',
      childName: 'Mily Rose'
    },
    {
      id: 5,
      category: 'Activities',
      emoji: '🧱',
      title: 'Building Blocks',
      description: 'Creative play',
      date: '2024-02-14',
      time: '10:00 AM',
      childName: 'Mily Rose'
    },
    {
      id: 6,
      category: 'Naps',
      emoji: '😴',
      title: 'Nap Time',
      description: 'Peaceful sleep',
      date: '2024-02-14',
      time: '1:00 PM',
      childName: 'Mily Rose'
    }
  ];

  const filteredPhotos = photos.filter(photo => {
    const categoryMatch = selectedCategory === 'all' || photo.category.toLowerCase() === selectedCategory.toLowerCase();
    const dateMatch = !selectedDate || photo.date === selectedDate;
    return categoryMatch && dateMatch;
  });

  return (
    <div className="photo-gallery-page">
      <div className="gallery-header">
        <div className="container">
          <h1>📸 Photo Gallery</h1>
          <p>View your child's daily moments and activities</p>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <div className="gallery-filters">
          <div className="category-filters">
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

          <div className="date-filter">
            <label>Filter by Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Photos Grid */}
        {filteredPhotos.length > 0 ? (
          <div className="photos-grid">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="photo-item"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="photo-thumbnail">
                  <span className="photo-emoji">{photo.emoji}</span>
                </div>
                <div className="photo-info">
                  <h3>{photo.title}</h3>
                  <p>{photo.description}</p>
                  <div className="photo-meta">
                    <span className="photo-time">⏰ {photo.time}</span>
                    <span className="photo-date">📅 {photo.date}</span>
                  </div>
                </div>
                <span className="category-badge">{photo.category}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-photos">
            <div className="no-photos-icon">📷</div>
            <h3>No photos found</h3>
            <p>Try adjusting your filters or check back later for new photos</p>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPhoto(null)}>
              ✕
            </button>
            <div className="modal-photo">
              <span className="modal-emoji">{selectedPhoto.emoji}</span>
            </div>
            <div className="modal-info">
              <h2>{selectedPhoto.title}</h2>
              <p className="modal-description">{selectedPhoto.description}</p>
              <div className="modal-details">
                <div className="detail-item">
                  <span className="detail-icon">👶</span>
                  <span>{selectedPhoto.childName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>{selectedPhoto.date}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">⏰</span>
                  <span>{selectedPhoto.time}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📂</span>
                  <span>{selectedPhoto.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;