import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Badge, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'mechanic':
        return '/mechanic/dashboard';
      default:
        return '/customer/dashboard';
    }
  };

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          <i className="bi bi-tools me-2"></i>
          MechMate
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to={getDashboardLink()}>Dashboard</Nav.Link>
                {user.role === 'customer' && (
                  <>
                    <Nav.Link as={Link} to="/customer/request">Request Help</Nav.Link>
                    <Nav.Link as={Link} to="/customer/bookings">My Bookings</Nav.Link>
                  </>
                )}
                {user.role === 'mechanic' && (
                  <>
                    <Nav.Link as={Link} to="/mechanic/requests">Available Requests</Nav.Link>
                    <Nav.Link as={Link} to="/mechanic/my-jobs">My Jobs</Nav.Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Nav.Link as={Link} to="/admin/users">Users</Nav.Link>
                    <Nav.Link as={Link} to="/admin/requests">Requests</Nav.Link>
                    <Nav.Link as={Link} to="/admin/bookings">Bookings</Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light">
                    <i className="bi bi-bell me-1"></i>
                    {unreadCount > 0 && <Badge bg="danger">{unreadCount}</Badge>}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/notifications">
                      View All Notifications
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Dropdown align="end" className="ms-2">
                  <Dropdown.Toggle variant="light">
                    <i className="bi bi-person-circle me-1"></i>
                    {user.name}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-white">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="text-white">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
