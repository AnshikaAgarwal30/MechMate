import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light" style={{fontSize: '0.6rem', lineHeight: 0.8, padding: '0.05rem 0'}}>
      <Container>
        <Row>
          <Col md={4}>
            <h5 className="mb-0">MechMate</h5>
            <p className="text-muted">
              AI Powered Roadside Vehicle Breakdown Assistance System
            </p>
          </Col>
          <Col md={4}>
            <h5 className="mb-0">Quick Links</h5>
            <ul className="list-unstyled mb-0">
              <li><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
              <li><Link to="/login" className="text-muted text-decoration-none">Login</Link></li>
              <li><Link to="/register" className="text-muted text-decoration-none">Register</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5 className="mb-0">Contact Info</h5>
            <p className="text-muted mb-0">
              <i className="bi bi-telephone me-2"></i>
              +1 (555) 123-4567
            </p>
            <p className="text-muted mb-0">
              <i className="bi bi-envelope me-2"></i>
              support@mechmate.com
            </p>
            <p className="text-muted">
              <i className="bi bi-geo-alt me-2"></i>
              123 Mechanic Street, Auto City
            </p>
          </Col>
        </Row>
        <hr className="border-secondary my-0" />
        <Row>
          <Col className="text-center text-muted">
            <p className="mb-0">&copy; {new Date().getFullYear()} MechMate. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
