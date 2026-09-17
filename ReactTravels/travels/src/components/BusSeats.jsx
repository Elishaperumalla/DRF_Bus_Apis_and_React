import React, { useState, useEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import './BusSeats.css'; 


const BusSeats = ({ token }) => {
  const [bus, setBus] = useState({});
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { busId } = useParams();
  
  // Get token from prop or localStorage as fallback
  const authToken = token || localStorage.getItem('token');

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:8000/api/buses/${busId}`);
        // Set bus details if available in response
        if (response.data.bus_name || response.data.origin) {
          setBus(response.data);
        }
        // Set seats from response
        setSeats(response.data.seats || []);
      } catch (error) {
        console.error('Error fetching details:', error);
        setError(`Failed to load bus details: ${error.response?.data?.detail || error.message || 'Network error'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBusDetails();
  }, [busId]);

  const handleBook = async (seatId) => {
  if (!authToken) {
    alert('Please login to book a seat');
    navigate('/login');
    return;
  }

  // Load Razorpay script dynamically once
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const res = await loadRazorpayScript();
  if (!res) {
    alert("Failed to load Razorpay SDK. Please check your internet connection.");
    return;
  }

  try {
    // Create Razorpay order in backend
    const orderRes = await axios.post(
      "http://localhost:8000/api/create-payment-order/",
      { seat_id: seatId },
      { headers: { Authorization: `Token ${authToken}` } }
    );

    const { order_id, razorpay_key_id, amount } = orderRes.data;

    const options = {
      key: razorpay_key_id,
      amount: amount,
      currency: "INR",
      order_id: order_id,
      name: "Bus Ticket Booking",
      description: "Complete your booking payment",
      handler: async function (response) {
        try {
          // Confirm booking in backend on successful payment
          await axios.post(
            'http://localhost:8000/api/booking/',
            { seat: seatId },
            { headers: { Authorization: `Token ${authToken}` } }
          );

          alert("Payment successful and seat booked!");

          // Update seat to booked state in UI
          setSeats(prevSeats =>
            prevSeats.map(seat =>
              seat.id === seatId ? { ...seat, is_booked: true } : seat
            )
          );
        } catch (bookingError) {
          alert(bookingError.response?.data?.error || "Booking confirmation failed");
        }
      },
      prefill: {
        // Optionally prefill user info here
      },
      theme: {
        color: "#3399cc",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

    paymentObject.on('payment.failed', function (response) {
      alert(`Payment failed: ${response.error.description}`);
    });
  } catch (error) {
    alert(error.response?.data?.error || "Failed to create payment order");
  }
};

  

  // Arrange the seats
  const firstRowSeats = seats.slice(0,1 );
  const secondRowSeats = seats.slice(1, 3);
  const lastRowSeats = seats.slice(seats.length - 5);
  const middleSeats = seats.slice(3, seats.length - 5);

  // Divide middleSeats into chunks of 4 (2 left, 2 right)
  const middleRows = [];
  for (let i = 0; i < middleSeats.length; i += 4) {
    middleRows.push(middleSeats.slice(i, i + 4));
  }

  if (loading) return <p style={{ textAlign: 'center', padding: '20px' }}>Loading bus details...</p>;
  if (error) return <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</p>;

  return (
    <div className="bus-container">
      
      {bus && (
        <div className="bus-details">
          <h3>{bus.bus_name}</h3>
          <p>Bus No: {bus.nunber}</p>
          <p>From: {bus.origin} → To: {bus.destination}</p>
          <p>Departure: {bus.start_time} | Arrival: {bus.reach_time}</p>
           {/* Seat Legend */}
    <div className="seat-legend">
    <div className="legend-item">
      <div className="seat occupied"></div>
      <span>Booked</span>
    </div>
    <div className="legend-item">
      <div className="seat selected"></div>
      <span>Selected</span>
    </div>
    <div className="legend-item">
      <div className="seat"></div>
      <span>Available</span>
    </div>
  </div>
        </div>
      )}
      
      <div className="bus">
        <div className="driver">
          <div className="hub"></div>
        </div>

        {/* First Row */}
        <div className="row first-row">
          {firstRowSeats.map((seat) => (
            <div
              key={seat.id}
              className={`seat ${seat.is_booked ? 'occupied' : ''}`}
              onClick={() => !seat.is_booked && handleBook(seat.id)}
            >
              {seat.seat_number}
            </div>
          ))}
        </div>
        {/* Second Row */}
        <div className="row second-row">
          {secondRowSeats.map((seat) => (
            <div
              key={seat.id}
              className={`seat ${seat.is_booked ? 'occupied' : ''}`}    
              onClick={() => !seat.is_booked && handleBook(seat.id)}
            > 
              {seat.seat_number}
            </div>
          ))}
        </div>

        {/* Middle Rows */}
        {middleRows.map((row, idx) => (
          <div className="row" key={idx}>
            <div
              className={`seat ${row[0]?.is_booked ? 'occupied' : ''}`}
              onClick={() => row[0] && !row[0].is_booked && handleBook(row[0].id)}
            >
              {row[0]?.seat_number}
            </div>
            <div
              className={`seat ${row[1]?.is_booked ? 'occupied' : ''}`}
              onClick={() => row[1] && !row[1].is_booked && handleBook(row[1].id)}
            >
              {row[1]?.seat_number}
            </div>
            <div className="aisle" />
            <div
              className={`seat ${row[2]?.is_booked ? 'occupied' : ''}`}
              onClick={() => row[2] && !row[2].is_booked && handleBook(row[2].id)}
            >
              {row[2]?.seat_number}
            </div>
            <div
              className={`seat ${row[3]?.is_booked ? 'occupied' : ''}`}
              onClick={() => row[3] && !row[3].is_booked && handleBook(row[3].id)}
            >
              {row[3]?.seat_number}
            </div>
          </div>
        ))}

        {/* Last Row */}
        <div className="row last-row">
          {lastRowSeats.map((seat) => (
            <div
              key={seat.id}
              className={`seat ${seat.is_booked ? 'occupied' : ''}`}
              onClick={() => !seat.is_booked && handleBook(seat.id)}
            >
              {seat.seat_number}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusSeats;
