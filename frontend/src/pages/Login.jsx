import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert, Row, Col } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const role = result.user?.role || 'customer';
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'mechanic':
          navigate('/mechanic/dashboard');
          break;
        default:
          navigate('/customer/dashboard');
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };
  // Demo login helper – fills credentials and logs in
  const handleDemo = async (email, password) => {
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      const role = result.user?.role || 'customer';
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'mechanic':
          navigate('/mechanic/dashboard');
          break;
        default:
          navigate('/customer/dashboard');
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };


  const registrationMessage = location.state?.message;

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Login to MechMate</h2>
              {registrationMessage && <Alert variant="success">{registrationMessage}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              <div className="mt-3">
  <h6 className="text-center">Demo Accounts</h6>

  <Row className="g-2">
    <Col xs={12} md={4}>
      <Button
        variant="outline-primary"
        className="w-100"
        onClick={() =>
          handleDemo('demo.customer@mechmate.com', 'Demo@123')
        }
        disabled={loading}
      >
        Demo Customer
      </Button>
    </Col>

    <Col xs={12} md={4}>
      <Button
        variant="outline-success"
        className="w-100"
        onClick={() =>
          handleDemo('testmechanic@mechmate.com', 'Demo@123')
        }
        disabled={loading}
      >
        Demo Mechanic
      </Button>
    </Col>

    <Col xs={12} md={4}>
      <Button
        variant="outline-dark"
        className="w-100"
        onClick={() =>
          handleDemo('admin@mechmate.com', 'Demo@123')
        }
        disabled={loading}
      >
        Demo Admin
      </Button>
    </Col>
  </Row>
</div>
              <div className="text-center mt-3">
                <p>
                  Don't have an account? <Link to="/register">Register here</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
