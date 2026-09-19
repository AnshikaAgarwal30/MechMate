import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeRequests: 0,
    completedRequests: 0,
    upcomingBookings: 0,
    totalReviews: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [requestsRes, bookingsRes] = await Promise.all([
        api.get('/requests'),
        api.get('/bookings')
      ]);

      const activeRequests = requestsRes.data.requests.filter(
        r => r.status === 'pending' || r.status === 'accepted' || r.status === 'in_progress'
      ).length;
      const completedRequests = requestsRes.data.requests.filter(
        r => r.status === 'completed'
      ).length;
      const upcomingBookings = bookingsRes.data.bookings.filter(
        b => b.status === 'pending' || b.status === 'confirmed'
      ).length;

      setStats({
        activeRequests,
        completedRequests,
        upcomingBookings,
        totalReviews: 0
      });
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Welcome, {user?.name}!</h2>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center mb-3" bg="primary" text="white">
            <Card.Body>
              <h3>{stats.activeRequests}</h3>
              <p>Active Requests</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center mb-3" bg="success" text="white">
            <Card.Body>
              <h3>{stats.completedRequests}</h3>
              <p>Completed Requests</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center mb-3" bg="info" text="white">
            <Card.Body>
              <h3>{stats.upcomingBookings}</h3>
              <p>Upcoming Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center mb-3" bg="warning" text="dark">
            <Card.Body>
              <h3>{stats.totalReviews}</h3>
              <p>Total Reviews</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <h5>Quick Actions</h5>
              <div className="d-flex gap-3 mt-3">
                <Link to="/customer/request" className="btn btn-primary">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Request Help
                </Link>
                <Link to="/customer/bookings" className="btn btn-success">
                  <i className="bi bi-calendar-check me-2"></i>
                  My Bookings
                </Link>
                <Link to="/customer/requests" className="btn btn-info">
                  <i className="bi bi-list-check me-2"></i>
                  My Requests
                </Link>
                <Link to="/profile" className="btn btn-secondary">
                  <i className="bi bi-person me-2"></i>
                  Profile
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerDashboard;
