import React, { useState } from 'react';
import '../../styles/NannyFilters.css';

const NannyFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    minExperience: '',
    maxRate: '',
    availability: [],
    specialties: [],
    verifiedOnly: false
  });

  const handleInputChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCheckboxChange = (field, value) => {
    const currentArray = filters[field];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    const newFilters = { ...filters, [field]: newArray };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      location: '',
      minExperience: '',
      maxRate: '',
      availability: [],
      specialties: [],
      verifiedOnly: false
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const availabilityOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const specialtyOptions = ['Infant Care', 'Toddler Care', 'Special Needs', 'Tutoring', 'Cooking', 'Light Housekeeping'];

  return (
    <div className="nanny-filters">
      <div className="filters-header">
        <h3>🔍 Filter Nannies</h3>
        <button className="btn-reset" onClick={handleReset}>
          Reset All
        </button>
      </div>

      {/* Search Bar */}
      <div className="filter-group">
        <label>Search by Name</label>
        <input
          type="text"
          placeholder="Search nanny name..."
          value={filters.search}
          onChange={(e) => handleInputChange('search', e.target.value)}
          className="filter-input"
        />
      </div>

      {/* Location */}
      <div className="filter-group">
        <label>Location</label>
        <select
          value={filters.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className="filter-select"
        >
          <option value="">All Locations</option>
          <option value="Downtown">Downtown</option>
          <option value="Suburbs">Suburbs</option>
          <option value="North Side">North Side</option>
          <option value="South Side">South Side</option>
          <option value="East Side">East Side</option>
          <option value="West Side">West Side</option>
        </select>
      </div>

      {/* Experience */}
      <div className="filter-group">
        <label>Minimum Experience (years)</label>
        <select
          value={filters.minExperience}
          onChange={(e) => handleInputChange('minExperience', e.target.value)}
          className="filter-select"
        >
          <option value="">Any Experience</option>
          <option value="1">1+ years</option>
          <option value="2">2+ years</option>
          <option value="3">3+ years</option>
          <option value="5">5+ years</option>
          <option value="10">10+ years</option>
        </select>
      </div>

      {/* Hourly Rate */}
      <div className="filter-group">
        <label>Maximum Hourly Rate ($)</label>
        <input
          type="number"
          placeholder="Max rate"
          value={filters.maxRate}
          onChange={(e) => handleInputChange('maxRate', e.target.value)}
          className="filter-input"
          min="0"
        />
      </div>

      {/* Verified Only */}
      <div className="filter-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => handleInputChange('verifiedOnly', e.target.checked)}
          />
          <span>Verified Nannies Only</span>
        </label>
      </div>

      {/* Availability */}
      <div className="filter-group">
        <label>Availability</label>
        <div className="checkbox-group">
          {availabilityOptions.map((day) => (
            <label key={day} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.availability.includes(day)}
                onChange={() => handleCheckboxChange('availability', day)}
              />
              <span>{day}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div className="filter-group">
        <label>Specialties</label>
        <div className="checkbox-group">
          {specialtyOptions.map((specialty) => (
            <label key={specialty} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.specialties.includes(specialty)}
                onChange={() => handleCheckboxChange('specialties', specialty)}
              />
              <span>{specialty}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NannyFilters;