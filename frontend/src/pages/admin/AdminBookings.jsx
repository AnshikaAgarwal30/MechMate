import React, { useEffect, useState } from 'react';
import { Container, Table, Badge } from 'react-bootstrap';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/all');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings');
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">All Bookings</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Mechanic</th>
            <th>Service Type</th>
            <th>Scheduled Date</th>
            <th>Status</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td>{booking._id.substring(0, 8)}...</td>
              <td>{booking.customer?.name || 'N/A'}</td>
              <td>{booking.mechanic?.name || 'N/A'}</td>
              <td>{booking.serviceType}</td>
              <td>
                {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
              </td>
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
                <Badge bg={booking.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  {booking.paymentStatus}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminBookings;
