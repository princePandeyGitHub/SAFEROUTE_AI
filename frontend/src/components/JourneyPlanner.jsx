import { useState } from 'react';
import '../styles/JourneyPlanner.css';

function JourneyPlanner({ onPlanJourney }) {
  const [showModal, setShowModal] = useState(false);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  const handlePlanJourney = () => {
    if (source.trim() && destination.trim()) {
      onPlanJourney({
        source,
        destination,
      });
      setSource('');
      setDestination('');
      setShowModal(false);
    } else {
      alert('Please enter both source and destination');
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className="journey-planner-btn"
        onClick={() => setShowModal(true)}
        title="Plan Your Journey"
      >
        📍 Plan Journey
      </button>

      {/* Modal Popup */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Plan Your Journey</h2>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="input-group">
                <label htmlFor="source">Source Location</label>
                <input
                  id="source"
                  type="text"
                  placeholder="e.g., Rajiv Chowk, Sector 14..."
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePlanJourney()}
                />
              </div>

              <div className="input-group">
                <label htmlFor="destination">Destination Location</label>
                <input
                  id="destination"
                  type="text"
                  placeholder="e.g., Cyber City, Golf Course..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePlanJourney()}
                />
              </div>

              <div className="safety-info">
                <p><strong>ℹ️ Journey Analysis:</strong></p>
                <p>The route will be color-coded based on safety:</p>
                <ul>
                  <li><span className="safe-dot"></span> <strong>Green:</strong> Very Safe</li>
                  <li><span className="moderate-dot"></span> <strong>Yellow:</strong> Moderately Safe</li>
                  <li><span className="unsafe-dot"></span> <strong>Red:</strong> Unsafe Areas</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="submit-btn"
                onClick={handlePlanJourney}
              >
                Plan Route
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default JourneyPlanner;
