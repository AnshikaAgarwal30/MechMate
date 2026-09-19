import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <div className="bg-primary text-white py-5 mb-5">
        <Container className="text-center">
          <h1 className="display-4 mb-3">MechMate</h1>
          <p className="lead mb-4">AI Powered Roadside Vehicle Breakdown Assistance System</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-light btn-lg">Get Started</Link>
            <Link to="/login" className="btn btn-outline-light btn-lg">Login</Link>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="mb-5">
          <Col md={4}>
            <Card className="h-100 text-center">
              <Card.Body>
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
                <h3 className="mt-3">Emergency Assistance</h3>
                <p className="text-muted">Get immediate help when your vehicle breaks down. Our AI-powered system connects you with nearby mechanics instantly.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 text-center">
              <Card.Body>
                <i className="bi bi-geo-alt" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
                <h3 className="mt-3">Location-Based Assistance</h3>
                <p className="text-muted">Share your vehicle location and get matched with nearby verified mechanics with estimated arrival information.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 text-center">
              <Card.Body>
                <i className="bi bi-star" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
                <h3 className="mt-3">Verified Mechanics</h3>
                <p className="text-muted">All our mechanics are verified and rated by customers. Choose the best mechanic based on reviews and ratings.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col md={6}>
            <Card className="h-100">
              <Card.Body>
                <h3>For Customers</h3>
                <ul>
                  <li>Quick breakdown request submission</li>
                  <li>Location-based mechanic matching</li>
                  <li>Scheduled service bookings</li>
                  <li>Review and rate mechanics</li>
                  <li>Vehicle profile management</li>
                </ul>
                <Link to="/register" className="btn btn-primary">Register as Customer</Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100">
              <Card.Body>
                <h3>For Mechanics</h3>
                <ul>
                  <li>Receive nearby breakdown requests</li>
                  <li>Manage job schedules efficiently</li>
                  <li>Build your reputation with reviews</li>
                  <li>Flexible availability settings</li>
                  <li>Earn competitive rates</li>
                </ul>
                <Link to="/register" className="btn btn-success">Register as Mechanic</Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="bg-light">
          <Card.Body className="text-center">
            <h2>How It Works</h2>
            <Row className="mt-4">
              <Col md={3}>
                <div className="mb-3">
                  <span className="badge bg-primary rounded-circle p-3" style={{ fontSize: '1.5rem' }}>1</span>
                </div>
                <h5>Report Breakdown</h5>
                <p className="text-muted">Submit your vehicle details and location through our app</p>
              </Col>
              <Col md={3}>
                <div className="mb-3">
                  <span className="badge bg-primary rounded-circle p-3" style={{ fontSize: '1.5rem' }}>2</span>
                </div>
                <h5>Get Matched</h5>
                <p className="text-muted">Our AI system matches you with nearby available mechanics</p>
              </Col>
              <Col md={3}>
                <div className="mb-3">
                  <span className="badge bg-primary rounded-circle p-3" style={{ fontSize: '1.5rem' }}>3</span>
                </div>
                <h5>Track Progress</h5>
                <p className="text-muted">Follow request status and view the estimated arrival time</p>
              </Col>
              <Col md={3}>
                <div className="mb-3">
                  <span className="badge bg-primary rounded-circle p-3" style={{ fontSize: '1.5rem' }}>4</span>
                </div>
                <h5>Rate & Review</h5>
                <p className="text-muted">Rate your experience to help others and improve service</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Home;
