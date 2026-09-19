import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MechanicDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeJobs: 0,
    completedJobs: 0,
    availableRequests: 0,
    rating: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [requestsRes, availableRes] = await Promise.all([
        api.get('/requests'),
        api.get('/requests/available')
      ]);

      const activeJobs = requestsRes.data.requests.filter(
        r => r.status === 'accepted' || r.status === 'in_progress'
      ).length;
      const completedJobs = requestsRes.data.requests.filter(
        r => r.status === 'completed'
      ).length;

      setStats({
        activeJobs,
        completedJobs,
        availableRequests: availableRes.data.requests.length,
        rating: user?.mechanicDetails?.rating || 0
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
              <h3>{stats.activeJobs}</h3>
              <p>Active Jobs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center mb-3" bg="success" text="white">
            <Card.Body>
              <h3>{stats.completedJobs}</h3>
              <p>Completed Jobs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center mb-3" bg="info" text="white">
            <Card.Body>
              <h3>{stats.availableRequests}</h3>
              <p>Available Requests</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center mb-3" bg="warning" text="dark">
            <Card.Body>
              <h3>{stats.rating.toFixed(1)} ⭐</h3>
              <p>Rating</p>
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
                <Link to="/mechanic/requests" className="btn btn-primary">
                  <i className="bi bi-list-check me-2"></i>
                  Available Requests
                </Link>
                <Link to="/mechanic/my-jobs" className="btn btn-success">
                  <i className="bi bi-tools me-2"></i>
                  My Jobs
                </Link>
                <Link to="/mechanic/bookings" className="btn btn-info">
                  <i className="bi bi-calendar-check me-2"></i>
                  My Bookings
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

export default MechanicDashboard;
