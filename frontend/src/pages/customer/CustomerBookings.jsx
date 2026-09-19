import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Modal, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CustomerBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [mechanics, setMechanics] = useState([]);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    mechanic: '',
    serviceType: 'scheduled',
    scheduledDate: '',
    scheduledTime: '',
    location: { address: '', coordinates: [0, 0] },
    notes: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchMechanics();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    }
  };

  const fetchMechanics = async () => {
    try {
      const response = await api.get('/users/mechanics');
      setMechanics(response.data.mechanics || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch available mechanics');
    }
  };

  const getCurrentLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const longitude = Number(coords.longitude.toFixed(6));
        const latitude = Number(coords.latitude.toFixed(6));
        let address = `Current location (${latitude}, ${longitude})`;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: 'application/json' } }
          );
          if (response.ok) {
            const data = await response.json();
            address = data.display_name || address;
          }
        } catch {
          // Keep coordinate fallback.
        }

        setBookingForm(prev => ({
          ...prev,
          location: { address, coordinates: [longitude, latitude] }
        }));
        setLocationLoading(false);
      },
      (geoError) => {
        const messages = {
          1: 'Location permission was denied. Please allow location access.',
          2: 'Your location could not be determined. Please try again.',
          3: 'Location request timed out. Please try again.'
        };
        setError(messages[geoError.code] || 'Unable to get your current location.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const resetBookingForm = () => {
    setBookingForm({
      mechanic: '',
      serviceType: 'scheduled',
      scheduledDate: '',
      scheduledTime: '',
      location: { address: '', coordinates: [0, 0] },
      notes: ''
    });
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setError('');

    if (bookingForm.location.coordinates[0] === 0 && bookingForm.location.coordinates[1] === 0) {
      setError('Please use Current Location before creating the booking.');
      return;
    }

    setBookingLoading(true);
    try {
      const response = await api.post('/bookings', bookingForm);
      const bookingId = response.data.booking?._id;
      resetBookingForm();
      setShowBookingModal(false);
      await fetchBookings();
      if (bookingId) navigate(`/customer/bookings/${bookingId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  return (
    <Container className="py-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">My Bookings</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => navigate('/customer/dashboard')}>Dashboard</Button>
          <Button variant="primary" onClick={() => { setError(''); setShowBookingModal(true); }}>
            + New Booking
          </Button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Alert variant="info">
          You don't have any bookings yet. Click <strong>New Booking</strong> to schedule a service.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th><th>Mechanic</th><th>Service</th><th>Scheduled</th>
              <th>Status</th><th>Payment</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td><Link to={`/customer/bookings/${booking._id}`}>{booking._id.substring(0, 8)}...</Link></td>
                <td>
                  {booking.mechanic?.name || 'N/A'}<br />
                  <small className="text-muted">
                    Rating: {booking.mechanic?.mechanicDetails?.rating || 'N/A'} ⭐
                  </small>
                </td>
                <td>{booking.serviceType}</td>
                <td>{new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}</td>
                <td>
                  <Badge bg={
                    booking.status === 'completed' ? 'success' :
                    booking.status === 'in_progress' ? 'primary' :
                    booking.status === 'cancelled' ? 'danger' :
                    booking.status === 'confirmed' ? 'info' : 'secondary'
                  }>{booking.status}</Badge>
                </td>
                <td><Badge bg={booking.paymentStatus === 'paid' ? 'success' : 'warning'}>{booking.paymentStatus}</Badge></td>
                <td>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => navigate(`/customer/bookings/${booking._id}`)}>View</Button>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <Button variant="danger" size="sm" onClick={() => handleCancelBooking(booking._id)}>Cancel</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Create New Booking</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateBooking}>
            <Form.Group className="mb-3">
              <Form.Label>Select Mechanic</Form.Label>
              <Form.Select value={bookingForm.mechanic}
                onChange={(e) => setBookingForm(prev => ({ ...prev, mechanic: e.target.value }))} required>
                <option value="">Choose a verified available mechanic...</option>
                {mechanics.map((mechanic) => (
                  <option key={mechanic._id} value={mechanic._id}>
                    {mechanic.name} — {mechanic.mechanicDetails?.rating || 0} ⭐
                  </option>
                ))}
              </Form.Select>
              {mechanics.length === 0 && <Form.Text className="text-danger">No verified mechanics are currently available.</Form.Text>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Service Type</Form.Label>
              <Form.Select value={bookingForm.serviceType}
                onChange={(e) => setBookingForm(prev => ({ ...prev, serviceType: e.target.value }))} required>
                <option value="scheduled">Scheduled Service</option>
                <option value="inspection">Vehicle Inspection</option>
                <option value="roadside">Roadside Assistance</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" min={new Date().toISOString().split('T')[0]}
                    value={bookingForm.scheduledDate}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, scheduledDate: e.target.value }))} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Time</Form.Label>
                  <Form.Control type="time" value={bookingForm.scheduledTime}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, scheduledTime: e.target.value }))} required />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Service Location</Form.Label>
              <Form.Control type="text" value={bookingForm.location.address}
                onChange={(e) => setBookingForm(prev => ({
                  ...prev, location: { ...prev.location, address: e.target.value }
                }))} required placeholder="Use Current Location" />
              <Form.Text>
                Coordinates: {bookingForm.location.coordinates[1] !== 0
                  ? `${bookingForm.location.coordinates[1]}, ${bookingForm.location.coordinates[0]}`
                  : 'Not detected'}
              </Form.Text>
            </Form.Group>
            <Button type="button" variant="outline-primary" className="mb-3" onClick={getCurrentLocation} disabled={locationLoading}>
              {locationLoading ? <><Spinner size="sm" className="me-2" />Detecting...</> : '📍 Use Current Location'}
            </Button>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={3} value={bookingForm.notes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes..." />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={bookingLoading || mechanics.length === 0}>
              {bookingLoading ? 'Creating Booking...' : 'Create Booking'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CustomerBookings;
