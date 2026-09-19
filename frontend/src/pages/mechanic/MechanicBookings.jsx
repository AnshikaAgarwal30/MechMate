import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import api from '../../services/api';

const MechanicBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: '',
    actualCost: '',
    message: ''
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending' , statusForm);
      const response = await api.put(
      `/bookings/${selectedBooking._id}/status`,
      statusForm
    );

      //await api.put(`/bookings/${selectedBooking._id}/status`, statusForm);
      console.log('update response:', response.data);
      setShowStatusModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const openStatusModal = (booking) => {
    setSelectedBooking(booking);
    setStatusForm({
      status: booking.status,
      actualCost: booking.actualCost || '' ,
      message: ''
    });
    setShowStatusModal(true);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Bookings</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Service Type</th>
            <th>Scheduled Date</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td>{booking._id.substring(0, 8)}...</td>
              <td>
                {booking.customer?.name}
                <br />
                <small className="text-muted">{booking.customer?.phone}</small>
              </td>
              <td>{booking.serviceType}</td>
              <td>
                {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
              </td>
              <td>{booking.location?.address}</td>
              <td>
                <Badge bg={
                  booking.status === 'completed' ? 'success' :
                  booking.status === 'in_progress' ? 'primary' :
                  booking.status === 'cancelled' ? 'danger' : 'secondary'
                }>
                  {booking.status}
                </Badge>
              </td>
              <td>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openStatusModal(booking)}
                >
                  Update Status
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Booking Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateStatus}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                required
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>
            {statusForm.status === 'completed' && (
              <Form.Group className="mb-3">
                <Form.Label>Actual Cost (₹)</Form.Label>
                <Form.Control
                  type="number"
                  value={statusForm.actualCost}
                  onChange={(e) => setStatusForm({ ...statusForm, actualCost: e.target.value })}
                  required
                  placeholder="Enter actual cost"
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
  <Form.Label>Message</Form.Label>
  <Form.Control
    as="textarea"
    rows={3}
    value={statusForm.message}
    onChange={(e) =>
      setStatusForm({
        ...statusForm,
        message: e.target.value
      })
    }
    placeholder="Add a message for the customer..."
  />
</Form.Group>


            <Button variant="primary" type="submit">
              Update Status
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MechanicBookings;
