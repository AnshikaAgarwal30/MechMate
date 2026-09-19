import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${id}`);
        setBooking(response.data.booking);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load booking.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return <Container className="py-5 text-center"><Spinner /></Container>;
  }

  if (error || !booking) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Booking not found.'}</Alert>
        <Button onClick={() => navigate('/customer/bookings')}>Back to My Bookings</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Booking Details</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/customer/bookings')}>
          Back to My Bookings
        </Button>
      </div>

      <Card>
        <Card.Body>
          <Row className="g-4">
            <Col md={6}>
              <h5>Booking Information</h5>
              <p><strong>Booking ID:</strong> {booking._id}</p>
              <p><strong>Service:</strong> {booking.serviceType}</p>
              <p><strong>Date:</strong> {new Date(booking.scheduledDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {booking.scheduledTime}</p>
              <p><strong>Status:</strong> <Badge bg={
                booking.status === 'completed' ? 'success' :
                booking.status === 'cancelled' ? 'danger' :
                booking.status === 'in_progress' ? 'primary' : 'info'
              }>{booking.status}</Badge></p>
              <p><strong>Payment:</strong> {booking.paymentStatus}</p>
              {booking.actualCost !== undefined && booking.actualCost !== null && (
  <p>
    <strong>Actual Cost:</strong> ₹{booking.actualCost}
  </p>
)}
            </Col>
            <Col md={6}>
              <h5>Mechanic</h5>
              <p><strong>Name:</strong> {booking.mechanic?.name || 'Not assigned'}</p>
              <p><strong>Phone:</strong> {booking.mechanic?.phone || 'N/A'}</p>
              <p><strong>Rating:</strong> {booking.mechanic?.mechanicDetails?.rating || 0} ⭐</p>

              <h5 className="mt-4">Location</h5>
              <p>{booking.location?.address || 'N/A'}</p>
              {booking.location?.coordinates?.length === 2 && (
                <p className="text-muted">
                  Coordinates: {booking.location.coordinates[1]}, {booking.location.coordinates[0]}
                </p>
              )}
            </Col>
          </Row>
          {booking.notes && (
            <div className="mt-3">
              <h5>Notes</h5>
              <p>{booking.notes}</p>
            </div>
          )}
          <Link className="btn btn-primary mt-2" to="/customer/bookings">View All Bookings</Link>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BookingDetails;
