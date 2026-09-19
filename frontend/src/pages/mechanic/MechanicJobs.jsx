import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import api from '../../services/api';

const MechanicJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: '',
    message: '',
    actualCost: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/requests');
      setJobs(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch jobs');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/requests/${selectedJob._id}/status`, statusForm);
      setShowStatusModal(false);
      fetchJobs();
    } catch (error) {
      console.error('Failed to update status');
    }
  };

  const openStatusModal = (job) => {
    setSelectedJob(job);
    setStatusForm({
      status: job.status,
      message: '',
      actualCost: job.actualCost || ''
    });
    setShowStatusModal(true);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Jobs</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Issue Type</th>
            <th>Status</th>
            <th>Est. Cost</th>
            <th>Actual Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job._id}>
              <td>{job._id.substring(0, 8)}...</td>
              <td>
                {job.customer?.name}
                <br />
                <small className="text-muted">{job.customer?.phone}</small>
              </td>
              <td>
                {job.vehicle?.make} {job.vehicle?.model}
                <br />
                <small className="text-muted">{job.vehicle?.licensePlate}</small>
              </td>
              <td>{job.issueType}</td>
              <td>
                <Badge bg={
                  job.status === 'completed' ? 'success' :
                  job.status === 'in_progress' ? 'primary' :
                  job.status === 'accepted' ? 'info' :
                  job.status === 'cancelled' ? 'danger' : 'secondary'
                }>
                  {job.status}
                </Badge>
              </td>
              <td>{job.estimatedCost != null ? `₹${job.estimatedCost}` : 'N/A'}</td>
              <td>{job.actualCost != null ? `₹${job.actualCost}` : 'N/A'}</td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openStatusModal(job)}
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
          <Modal.Title>Update Job Status</Modal.Title>
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
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={statusForm.message}
                onChange={(e) => setStatusForm({ ...statusForm, message: e.target.value })}
                placeholder="Add a status update message..."
              />
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
            <Button variant="primary" type="submit">
              Update Status
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MechanicJobs;
