import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Buslist.css';

const Buslist = () => {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:8000/api/buses/`);
        const busData = Array.isArray(response.data) ? response.data : response.data.results || [];
        setBuses(busData);
        setFilteredBuses(busData);
      } catch (error) {
        console.error('Error fetching bus data:', error);
        setError(`Failed to load buses: ${error.response?.data?.detail || error.message || 'Network error'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  // ✅ Filtering buses only by origin & destination
  const handleSearch = () => {
    const origin = originSearch.trim().toLowerCase();
    const destination = destinationSearch.trim().toLowerCase();

    const filtered = buses.filter((bus) => {
      return (
        (origin ? bus.origin.toLowerCase().includes(origin) : true) &&
        (destination ? bus.destination.toLowerCase().includes(destination) : true)
      );
    });

    setFilteredBuses(filtered);
  };

  // ✅ Passing selected date to seat page
  const handleViewSeats = (id) => {
    navigate(`/bus/${id}?date=${travelDate}`);
  };

  // ✅ Unique suggestions for autocomplete
  const originSuggestions = [...new Set(
    buses
      .map(bus => bus.origin)
      .filter(ori => ori?.toLowerCase().includes(originSearch.toLowerCase()))
  )];

  const destinationSuggestions = [...new Set(
    buses
      .map(bus => bus.destination)
      .filter(dest => dest?.toLowerCase().includes(destinationSearch.toLowerCase()))
  )];

  return (
    <div className="buslist-container">
      <h2>Search Buses</h2>

      <div className="search-bar">
       {/* Origin input with suggestions */}
<div className="search-field">
  <input
    type="text"
    placeholder="Leaving From"
    value={originSearch}
    onChange={(e) => {
      setOriginSearch(e.target.value);
      setShowOriginSuggestions(true);
    }}
    onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 100)}
  />
  {showOriginSuggestions && originSearch && (
    <ul className="suggestions">
      {originSuggestions.map((ori, idx) => (
        <li
          key={idx}
          onMouseDown={() => {   // ✅ Use onMouseDown
            setOriginSearch(ori);
            setShowOriginSuggestions(false);
          }}
        >
          {ori}
        </li>
      ))}
    </ul>
  )}
</div>

{/* Destination input with suggestions */}
<div className="search-field">
  <input
    type="text"
    placeholder="Going To"
    value={destinationSearch}
    onChange={(e) => {
      setDestinationSearch(e.target.value);
      setShowDestinationSuggestions(true);
    }}
    onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 100)}
  />
  {showDestinationSuggestions && destinationSearch && (
    <ul className="suggestions">
      {destinationSuggestions.map((dest, idx) => (
        <li
          key={idx}
          onMouseDown={() => {   // ✅ Use onMouseDown
            setDestinationSearch(dest);
            setShowDestinationSuggestions(false);
          }}
        >
          {dest}
        </li>
      ))}
    </ul>
  )}
</div>


        {/* Travel date */}
        <div className="search-field">
          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
          />
        </div>

        <div className="search-field">
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {/* Bus list */}
      <div className="bus-list">
        {filteredBuses.length > 0 ? (
          filteredBuses.map((item) => (
            <div key={item.id} className="bus-card">
              <div className="bus-header">
                <h3>{item.bus_name}</h3>
                <p><strong>BusNo:</strong> {item.nunber}</p>
              </div>
              <div className="bus-info">
                <div className="left-info">
                  <p><strong>From:</strong> {item.origin}</p>
                  <p><strong>Departure:</strong> {item.start_time}</p>
                  <p><strong>Features: </strong>{item.feature}</p>
                </div>
                <div className="right-info">
                  <p><strong>To:</strong> {item.destination}</p>
                  <p><strong>Arrival:</strong> {item.reach_time}</p>
                  <p><strong>Price:</strong> {item.prices}</p>
                </div>
                <div className="travel-date">
                  <p><strong>Date:</strong> {travelDate ? travelDate : "Select a date"}</p>
                  <div className="bus-actions">
                    <button onClick={() => handleViewSeats(item.id)}>View Seats</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No buses found.</p>
        )}
      </div>
    </div>
  );
};

export default Buslist;
