import React, { useState, useEffect } from 'react';
import NannyCard from '../components/nanny/NannyCard';
import NannyFilters from '../components/nanny/NannyFilters';
import { usersAPI } from '../services/api';
import '../styles/NannySearch.css';

const NannySearch = () => {
  const [nannies, setNannies] = useState([]);
  const [filteredNannies, setFilteredNannies] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNannies();
  }, []);

  const fetchNannies = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getCaretakers({});
      if (response.success && response.caretakers) {
        const mappedNannies = response.caretakers.map((c, i) => ({
          id: c._id,
          name: c.name,
          photo: c.avatar || null,
          rating: c.rating || 0,
          reviewCount: c.totalReviews || 0,
          location: c.address || 'Available',
          experience: c.experience || 1,
          education: c.specializations?.[0] || 'Childcare Training',
          hourlyRate: c.hourlyRate || 0,
          bio: c.bio || `${c.name} is a trained childcare professional.`,
          specialties: c.specializations?.length ? c.specializations : ['Childcare'],
          availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          verified: c.isVerified || false,
          featured: c.rating >= 4.5,
        }));
        setNannies(mappedNannies);
        setFilteredNannies(mappedNannies);
      }
    } catch (err) {
      console.log('Failed to fetch nannies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...nannies];

    if (filters.search) {
      result = result.filter(nanny =>
        nanny.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        nanny.specialties.some(s => s.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    if (filters.location) {
      result = result.filter(nanny => nanny.location.toLowerCase().includes(filters.location.toLowerCase()));
    }

    if (filters.minExperience) {
      result = result.filter(nanny => nanny.experience >= parseInt(filters.minExperience));
    }

    if (filters.maxRate) {
      result = result.filter(nanny => nanny.hourlyRate <= parseInt(filters.maxRate));
    }

    if (filters.verifiedOnly) {
      result = result.filter(nanny => nanny.verified);
    }

    if (filters.specialties && filters.specialties.length > 0) {
      result = result.filter(nanny =>
        filters.specialties.some(specialty => 
          nanny.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
        )
      );
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        result.sort((a, b) => b.experience - a.experience);
        break;
      case 'price-low':
        result.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case 'price-high':
        result.sort((a, b) => b.hourlyRate - a.hourlyRate);
        break;
      default:
        break;
    }

    setFilteredNannies(result);
  }, [filters, sortBy, nannies]);

  return (
    <div className="nanny-search-page">
      <div className="search-header">
        <div className="container">
          <h1>Find Your Perfect Caretaker</h1>
          <p>Browse certified and experienced childcare professionals</p>
        </div>
      </div>

      <div className="container">
        <div className="search-content">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <NannyFilters onFilterChange={setFilters} />
          </aside>

          {/* Results */}
          <div className="search-results">
            <div className="results-header">
              <div className="results-count">
                <strong>{filteredNannies.length}</strong> caretakers found
              </div>
              <div className="results-sort">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {filteredNannies.length > 0 ? (
              <div className="nannies-grid">
                {filteredNannies.map((nanny) => (
                  <NannyCard key={nanny.id} nanny={nanny} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No caretakers found</h3>
                <p>Try adjusting your filters to see more results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NannySearch;