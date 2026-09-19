import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Table, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    mechanic: '',
    request: '',
    rating: 5,
    comment: ''
  });
  const [requests, setRequests] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReviews();
    if (user?.role === 'customer') {
      fetchCompletedRequests();
      fetchMechanics();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const params = user?.role === 'mechanic' ? { mechanic: user._id } : {};
      const response = await api.get('/reviews', { params });
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Failed to fetch reviews');
    }
  };

  const fetchCompletedRequests = async () => {
    try {
      const response = await api.get('/requests');
      const completed = response.data.requests.filter(
        r => r.status === 'completed' && r.assignedMechanic
      );
      setRequests(completed);
    } catch (error) {
      console.error('Failed to fetch requests');
    }
  };

  const fetchMechanics = async () => {
    try {
      const response = await api.get('/users/mechanics');
      setMechanics(response.data.mechanics);
    } catch (error) {
      console.error('Failed to fetch mechanics');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', reviewForm);
      setMessage('Review submitted successfully');
      setShowReviewForm(false);
      setReviewForm({
        mechanic: '',
        request: '',
        rating: 5,
        comment: ''
      });
      fetchReviews();
    } catch (error) {
      setMessage('Failed to submit review');
    }
  };

  const handleRespond = async (reviewId, response) => {
    try {
      await api.put(`/reviews/${reviewId}/respond`, { response });
      setMessage('Response submitted successfully');
      fetchReviews();
    } catch (error) {
      setMessage('Failed to submit response');
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Reviews & Ratings</h2>
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      {user?.role === 'customer' && (
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <h5>Submit a Review</h5>
              <Button variant="primary" onClick={() => setShowReviewForm(!showReviewForm)}>
                {showReviewForm ? 'Cancel' : 'Write Review'}
              </Button>
            </div>
            {showReviewForm && (
              <Form onSubmit={handleSubmitReview} className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>Select Completed Request</Form.Label>
                  <Form.Select
                    value={reviewForm.request}
                    onChange={(e) => {
                      const selectedRequest = requests.find(r => r._id === e.target.value);
                      setReviewForm({
                        ...reviewForm,
                        request: e.target.value,
                        mechanic: selectedRequest?.assignedMechanic || ''
                      });
                    }}
                    required
                  >
                    <option value="">Choose a request...</option>
                    {requests.map((request) => (
                      <option key={request._id} value={request._id}>
                        {request.vehicle?.make} {request.vehicle?.model} - {new Date(request.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Rating</Form.Label>
                  <Form.Select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                    required
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Very Poor</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    required
                    placeholder="Share your experience..."
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Submit Review
                </Button>
              </Form>
            )}
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Header>
          <h5>All Reviews</h5>
        </Card.Header>
        <Card.Body>
          {reviews.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mechanic</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Response</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id}>
                    <td>{review.customer?.name}</td>
                    <td>{review.mechanic?.name}</td>
                    <td>
                      <Badge bg="warning" text="dark">
                        {renderStars(review.rating)} ({review.rating})
                      </Badge>
                    </td>
                    <td>{review.comment}</td>
                    <td>
                      {review.response ? (
                        <div>
                          <small className="text-muted">{review.response}</small>
                        </div>
                      ) : user?.role === 'mechanic' && review.mechanic?._id === user._id ? (
                        <Form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const responseText = e.target.elements.response.value;
                            handleRespond(review._id, responseText);
                          }}
                          className="d-flex"
                        >
                          <Form.Control
                            name="response"
                            type="text"
                            placeholder="Add response..."
                            className="me-2"
                          />
                          <Button variant="primary" size="sm">Reply</Button>
                        </Form>
                      ) : (
                        <small className="text-muted">No response yet</small>
                      )}
                    </td>
                    <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No reviews yet.</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Reviews;
