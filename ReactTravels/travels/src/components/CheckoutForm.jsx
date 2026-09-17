import React, { useState, useEffect } from "react";
// import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

// const stripePromise = loadStripe("pk_test_123456789"); 

function CheckoutForm({ token, seatId, busId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create PaymentIntent on backend
    axios.post(
      "http://localhost:8000/api/create-payment-intent/",
      { seat_id: seatId },
      { headers: { Authorization: `Token ${token}` } }
    )
    .then(res => setClientSecret(res.data.client_secret))
    .catch(err => alert(err.response?.data?.error || "Failed to create payment intent"));
  }, [seatId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const card = elements.getElement(CardElement);

    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card }
    });

    if (error) {
      alert(error.message);
    } else if (paymentIntent.status === "succeeded") {
      // Payment successful → create booking
      axios.post(
        "http://localhost:8000/api/booking/",
        { seat: seatId }, // your booking endpoint
        { headers: { Authorization: `Token ${token}` } }
      )
      .then(res => alert("Booking successful!"))
      .catch(err => alert(err.response?.data?.error || "Booking failed"));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || !clientSecret}>Pay</button>
    </form>
  );
}

export default function PaymentWrapper({ token, seatId, busId }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm token={token} seatId={seatId} busId={busId} />
    </Elements>
  );
}
