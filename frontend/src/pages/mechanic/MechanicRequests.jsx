import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import api from '../../services/api';

const MechanicRequests = () => {
  const [requests, setRequests] = useState([]);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [acceptForm, setAcceptForm] = useState({
    estimatedArrival: '',
    estimatedCost: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests/available');
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch requests');
    }
  };

  const handleAcceptRequest = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/requests/${selectedRequest._id}/accept`, acceptForm);
      setShowAcceptModal(false);
      fetchRequests();
    } catch (error) {
      console.error('Failed to accept request');
    }
  };

  const openAcceptModal = (request) => {
    setSelectedRequest(request);
    setAcceptForm({
      estimatedArrival: '',
      estimatedCost: ''
    });
    setShowAcceptModal(true);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Available Breakdown Requests</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Issue Type</th>
            <th>Urgency</th>
            <th>Location</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request._id}>
              <td>{request._id.substring(0, 8)}...</td>
              <td>
                {request.customer?.name}
                <br />
                <small className="text-muted">{request.customer?.phone}</small>
              </td>
              <td>
                {request.vehicle?.make} {request.vehicle?.model}
                <br />
                <small className="text-muted">{request.vehicle?.year}</small>
              </td>
              <td>{request.issueType}</td>
              <td>
                <Badge bg={
                  request.urgency === 'emergency' ? 'danger' :
                  request.urgency === 'high' ? 'warning' : 'info'
                }>
                  {request.urgency}
                </Badge>
              </td>
              <td>{request.location?.address}</td>
              <td>
                <small>{request.description?.substring(0, 50)}...</small>
              </td>
              <td>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => openAcceptModal(request)}
                >
                  Accept
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showAcceptModal} onHide={() => setShowAcceptModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Accept Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAcceptRequest}>
            <Form.Group className="mb-3">
              <Form.Label>Estimated Arrival Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={acceptForm.estimatedArrival}
                onChange={(e) => setAcceptForm({ ...acceptForm, estimatedArrival: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estimated Cost (₹)</Form.Label>
              <Form.Control
                type="number"
                value={acceptForm.estimatedCost}
                onChange={(e) => setAcceptForm({ ...acceptForm, estimatedCost: e.target.value })}
                required
                placeholder="Enter estimated cost"
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Accept Request
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MechanicRequests;
