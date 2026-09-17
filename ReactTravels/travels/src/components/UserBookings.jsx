import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserBookings.css";

export const UserBookings = ({ token, userId }) => {
  const [bookings, setBookings] = useState([]);
  const [bookingError, setBookingError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token || !userId) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:8000/api/user/${userId}/bookings/`,
          { headers: { Authorization: `Token ${token}` } }
        );
        setBookings(Array.isArray(response.data) ? response.data : response.data.results || []);
      } catch (error) {
        setBookingError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [token, userId]);

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setDeleting(bookingId);
    try {
      await axios.delete(
        `http://localhost:8000/api/booking_Cancel/${bookingId}/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      alert("Booking cancelled successfully.");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to cancel booking.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "350px" }}>Loading bookings...</p>;
  if (bookingError) return <p style={{ color: "red", marginTop: "350px" }}>{bookingError}</p>;
  if (!bookings.length) return <p style={{ textAlign: "center", marginTop: "350px" }}>No bookings found.</p>;

  return (
    <div className="user-bookings">
      {bookings.map((item) => (
        <div className="booking-card" key={item.id}>
          <h3>Booking {item.id}</h3>
          <div className="booking-info">
            <span><strong>Bus:</strong> {item.bus}</span>
            <span><strong>Seat:</strong> {item.seat?.seat_number}</span>
            <span className="date">{item.booking_date}</span>
          </div>
          <button
            className="delete-btn"
            onClick={() => handleDelete(item.id)}
            disabled={deleting === item.id}
          >
            {deleting === item.id ? "Cancelling..." : "Cancel Booking"}
          </button>
          <hr />
        </div>
      ))}
    </div>
  );
};

// Razorpay payment integration component
export const RazorpayCheckout = ({ seatId, token }) => {
  const handlePayment = async () => {
    if (!token || !seatId) {
      alert("Missing user authentication or seat selection.");
      return;
    }

    try {
      // Create order by calling backend
      const response = await axios.post(
        "http://localhost:8000/api/create-payment-order/",
        { seat_id: seatId },
        { headers: { Authorization: `Token ${token}` } }
      );

      const { order_id, razorpay_key_id, amount } = response.data;

      // Load Razorpay script dynamically if not loaded
      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: razorpay_key_id,
        amount: amount,
        currency: "INR",
        order_id: order_id,
        name: "Bus Ticket Booking",
        description: "Complete your payment",
        handler: function (response) {
          // Send payment response to backend for verification here
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
          // Ideally, POST payment ID and order ID to backend for verification and confirmation
        },
        prefill: {
          // Optionally prefill user data here if available
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response) {
        alert(`Payment failed: ${response.error.description}`);
      });
    } catch (error) {
      alert(error.response?.data?.error || "Failed to initiate payment.");
    }
  };

  return (
    <button onClick={handlePayment}>
      Pay Now
    </button>
  );
};

export default UserBookings;
