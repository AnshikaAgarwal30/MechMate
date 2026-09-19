// import React, { useEffect, useState } from 'react';
// import { Container, Table, Badge, Button } from 'react-bootstrap';
// import api from '../../services/api';

// const CustomerRequests = () => {
//   const [requests, setRequests] = useState([]);

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   const fetchRequests = async () => {
//     try {
//       const response = await api.get('/requests');
//       setRequests(response.data.requests);
//     } catch (error) {
//       console.error('Failed to fetch requests');
//     }
//   };

//   const handleCancelRequest = async (id) => {
//     if (window.confirm('Are you sure you want to cancel this request?')) {
//       try {
//         await api.put(`/requests/${id}/cancel`);
//         fetchRequests();
//       } catch (error) {
//         console.error('Failed to cancel request');
//       }
//     }
//   };

//   return (
//     <Container className="py-4">
//       <h2 className="mb-4">My Breakdown Requests</h2>
//       <Table striped bordered hover responsive>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Vehicle</th>
//             <th>Issue Type</th>
//             <th>Urgency</th>
//             <th>Status</th>
//             <th>Mechanic</th>
//             <th>Date</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {requests.map((request) => (
//             <tr key={request._id}>
//               <td>{request._id.substring(0, 8)}...</td>
//               <td>
//                 {request.vehicle?.make} {request.vehicle?.model}
//                 <br />
//                 <small className="text-muted">{request.vehicle?.licensePlate}</small>
//               </td>
//               <td>{request.issueType}</td>
//               <td>
//                 <Badge bg={
//                   request.urgency === 'emergency' ? 'danger' :
//                   request.urgency === 'high' ? 'warning' : 'info'
//                 }>
//                   {request.urgency}
//                 </Badge>
//               </td>
//               <td>
//                 <Badge bg={
//                   request.status === 'completed' ? 'success' :
//                   request.status === 'in_progress' ? 'primary' :
//                   request.status === 'accepted' ? 'info' :
//                   request.status === 'cancelled' ? 'danger' : 'secondary'
//                 }>
//                   {request.status}
//                 </Badge>
//               </td>
//               <td>
//                 {request.assignedMechanic?.name || 'Not Assigned'}
//                 {request.assignedMechanic && (
//                   <div>
//                     <small className="text-muted">
//                       {request.assignedMechanic.phone}
//                     </small>
//                   </div>
//                 )}
//               </td>
//               <td>{new Date(request.createdAt).toLocaleDateString()}</td>
//               <td>
//                 {(request.status === 'pending' || request.status === 'accepted') && (
//                   <Button
//                     variant="danger"
//                     size="sm"
//                     onClick={() => handleCancelRequest(request._id)}
//                   >
//                     Cancel
//                   </Button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </Container>
//   );
// };

// export default CustomerRequests;


import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  Badge,
  Button,
  Modal,
  Card,
  Spinner,
  Alert
} from 'react-bootstrap';
import api from '../../services/api';

const CustomerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [mechanics, setMechanics] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingMechanics, setLoadingMechanics] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  // ======================================================
  // FETCH CUSTOMER REQUESTS
  // ======================================================
  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  // ======================================================
  // VIEW REQUEST DETAILS
  // ======================================================
  const handleViewDetails = async (request) => {
    setSelectedRequest(request);
    setShowDetails(true);

    // Fetch recommended mechanics only for pending requests
    if (request.status === 'pending') {
      fetchRecommendedMechanics(request._id);
    } else {
      setMechanics([]);
    }
  };

  // ======================================================
  // FETCH RECOMMENDED MECHANICS
  // ======================================================
  const fetchRecommendedMechanics = async (requestId) => {
    try {
      setLoadingMechanics(true);

      const response = await api.get(
        `/requests/${requestId}/recommendations`
      );

      setMechanics(response.data.mechanics || []);
    } catch (error) {
      console.error('Failed to fetch recommended mechanics:', error);
      setMechanics([]);
    } finally {
      setLoadingMechanics(false);
    }
  };

  // ======================================================
  // CANCEL REQUEST
  // ======================================================
  const handleCancelRequest = async (id) => {
    if (
      window.confirm(
        'Are you sure you want to cancel this request?'
      )
    ) {
      try {
        await api.put(`/requests/${id}/cancel`);

        await fetchRequests();

        setShowDetails(false);
        setSelectedRequest(null);

      } catch (error) {
        console.error('Failed to cancel request:', error);

        alert(
          error.response?.data?.message ||
          'Failed to cancel request'
        );
      }
    }
  };

  // ======================================================
  // STATUS BADGE
  // ======================================================
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'success';

      case 'in_progress':
        return 'primary';

      case 'accepted':
        return 'info';

      case 'cancelled':
        return 'danger';

      case 'pending':
        return 'warning';

      default:
        return 'secondary';
    }
  };

  // ======================================================
  // URGENCY BADGE
  // ======================================================
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'emergency':
        return 'danger';

      case 'high':
        return 'warning';

      case 'medium':
        return 'info';

      case 'low':
        return 'secondary';

      default:
        return 'secondary';
    }
  };

  return (
    <Container className="py-4">

      {/* PAGE TITLE */}
      <h2 className="mb-4">
        My Breakdown Requests
      </h2>

      {/* NO REQUESTS */}
      {requests.length === 0 ? (
        <Alert variant="info">
          You have no breakdown requests yet.
        </Alert>
      ) : (

        <Table
          striped
          bordered
          hover
          responsive
        >

          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle</th>
              <th>Issue Type</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Mechanic</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {requests.map((request) => (

              <tr key={request._id}>

                {/* ID */}
                <td>
                  {request._id?.substring(0, 8)}...
                </td>

                {/* VEHICLE */}
                <td>
                  <strong>
                    {request.vehicle?.make || 'N/A'}{' '}
                    {request.vehicle?.model || ''}
                  </strong>

                  <br />

                  <small className="text-muted">
                    {request.vehicle?.year || ''}
                  </small>

                  <br />

                  <small className="text-muted">
                    {request.vehicle?.licensePlate || 'No plate'}
                  </small>
                </td>

                {/* ISSUE */}
                <td>
                  {request.issueType}
                </td>

                {/* URGENCY */}
                <td>
                  <Badge
                    bg={getUrgencyBadge(request.urgency)}
                  >
                    {request.urgency}
                  </Badge>
                </td>

                {/* STATUS */}
                <td>
                  <Badge
                    bg={getStatusBadge(request.status)}
                  >
                    {request.status?.replace('_', ' ')}
                  </Badge>
                </td>

                {/* MECHANIC */}
                <td>

                  {request.assignedMechanic?.name ? (
                    <>
                      <strong>
                        {request.assignedMechanic.name}
                      </strong>

                      <div>
                        <small className="text-muted">
                          {request.assignedMechanic.phone}
                        </small>
                      </div>
                    </>
                  ) : (
                    <span className="text-muted">
                      Not Assigned
                    </span>
                  )}

                </td>

                {/* DATE */}
                <td>
                  {request.createdAt
                    ? new Date(
                        request.createdAt
                      ).toLocaleDateString()
                    : 'N/A'}
                </td>

                {/* ACTIONS */}
                <td>

                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() =>
                      handleViewDetails(request)
                    }
                  >
                    View
                  </Button>

                  {(request.status === 'pending' ||
                    request.status === 'accepted') && (

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        handleCancelRequest(
                          request._id
                        )
                      }
                    >
                      Cancel
                    </Button>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </Table>

      )}

      {/* ======================================================
          REQUEST DETAILS MODAL
      ====================================================== */}

      <Modal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        size="lg"
        centered
      >

        <Modal.Header closeButton>

          <Modal.Title>
            Breakdown Request Details
          </Modal.Title>

        </Modal.Header>

        <Modal.Body>

          {selectedRequest && (

            <>
              {/* REQUEST INFO */}
              <Card className="mb-3">

                <Card.Body>

                  <Card.Title>
                    Request Information
                  </Card.Title>

                  <p>
                    <strong>Request ID:</strong>{' '}
                    {selectedRequest._id}
                  </p>

                  <p>
                    <strong>Status:</strong>{' '}
                    <Badge
                      bg={getStatusBadge(
                        selectedRequest.status
                      )}
                    >
                      {selectedRequest.status?.replace(
                        '_',
                        ' '
                      )}
                    </Badge>
                  </p>

                  <p>
                    <strong>Issue:</strong>{' '}
                    {selectedRequest.issueType}
                  </p>

                  <p>
                    <strong>Urgency:</strong>{' '}
                    <Badge
                      bg={getUrgencyBadge(
                        selectedRequest.urgency
                      )}
                    >
                      {selectedRequest.urgency}
                    </Badge>
                  </p>

                  <p>
                    <strong>Description:</strong>{' '}
                    {selectedRequest.description}
                  </p>

                  <p>
                    <strong>Location:</strong>{' '}
                    {selectedRequest.location?.address ||
                      'Not available'}
                  </p>

                </Card.Body>

              </Card>

              {/* VEHICLE INFORMATION */}
              <Card className="mb-3">

                <Card.Body>

                  <Card.Title>
                    Vehicle Information
                  </Card.Title>

                  <p>
                    <strong>Make:</strong>{' '}
                    {selectedRequest.vehicle?.make ||
                      'N/A'}
                  </p>

                  <p>
                    <strong>Model:</strong>{' '}
                    {selectedRequest.vehicle?.model ||
                      'N/A'}
                  </p>

                  <p>
                    <strong>Year:</strong>{' '}
                    {selectedRequest.vehicle?.year ||
                      'N/A'}
                  </p>

                  <p>
                    <strong>License Plate:</strong>{' '}
                    {selectedRequest.vehicle?.licensePlate ||
                      'N/A'}
                  </p>

                </Card.Body>

              </Card>

              {/* ASSIGNED MECHANIC */}
              {selectedRequest.assignedMechanic && (

                <Card className="mb-3">

                  <Card.Body>

                    <Card.Title>
                      Assigned Mechanic
                    </Card.Title>

                    <p>
                      <strong>Name:</strong>{' '}
                      {selectedRequest.assignedMechanic.name}
                    </p>

                    <p>
                      <strong>Phone:</strong>{' '}
                      {selectedRequest.assignedMechanic.phone}
                    </p>

                    <p>
                      <strong>Email:</strong>{' '}
                      {selectedRequest.assignedMechanic.email}
                    </p>

                    {selectedRequest.estimatedArrival && (
                      <p>
                        <strong>Estimated Arrival:</strong>{' '}
                        {new Date(
                          selectedRequest.estimatedArrival
                        ).toLocaleString()}
                      </p>
                    )}

                    {selectedRequest.estimatedCost !==
                      undefined &&
                      selectedRequest.estimatedCost !== null && (
                        <p>
                          <strong>Estimated Cost:</strong>{' '}
                          ₹${selectedRequest.estimatedCost}
                        </p>
                      )}

                    {selectedRequest.actualCost !==
                      undefined &&
                      selectedRequest.actualCost !== null && (
                        <p>
                          <strong>Actual Cost:</strong>{' '}
                          ₹${selectedRequest.actualCost}
                        </p>
                      )}

                  </Card.Body>

                </Card>

              )}

              {/* AI BREAKDOWN DIAGNOSIS (IF ATTACHED) */}
              {selectedRequest.aiDiagnosis && (
                <Card className="mb-3 border-primary shadow-sm">
                  <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-cpu me-2"></i>
                      <strong>AI Breakdown Assessment</strong>
                    </div>
                    {selectedRequest.aiDiagnosis.confidenceScore && (
                      <Badge bg="light" text="dark">
                        Confidence: {selectedRequest.aiDiagnosis.confidenceScore?.toUpperCase()}
                      </Badge>
                    )}
                  </Card.Header>
                  <Card.Body>
                    <h6 className="text-primary">{selectedRequest.aiDiagnosis.issueTitle}</h6>
                    
                    {selectedRequest.images?.length > 0 && (
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Uploaded Breakdown Photo:</small>
                        <img
                          src={`http://localhost:5000${selectedRequest.images[0]}`}
                          alt="Breakdown component"
                          style={{ maxWidth: '140px', maxHeight: '140px', objectFit: 'cover', borderRadius: '6px' }}
                          className="border"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {selectedRequest.aiDiagnosis.possibleCauses?.length > 0 && (
                      <div className="mb-2">
                        <strong>Possible Causes:</strong>
                        <ul className="mb-1 ps-3 small">
                          {selectedRequest.aiDiagnosis.possibleCauses.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedRequest.aiDiagnosis.safetyAdvice?.length > 0 && (
                      <Alert variant="warning" className="py-2 px-3 mb-2 small">
                        <strong>Safety Advice: </strong>
                        {selectedRequest.aiDiagnosis.safetyAdvice.join('; ')}
                      </Alert>
                    )}

                    {selectedRequest.aiDiagnosis.recommendedSpecialization?.length > 0 && (
                      <div className="mb-2">
                        <small className="text-muted d-block">Recommended Specializations:</small>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {selectedRequest.aiDiagnosis.recommendedSpecialization.map((spec, i) => (
                            <Badge bg="info" text="dark" key={i}>{spec}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Alert variant="secondary" className="py-1 px-2 mb-0 small text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      {selectedRequest.aiDiagnosis.disclaimer || 'Preliminary automated assessment. Hands-on inspection required.'}
                    </Alert>
                  </Card.Body>
                </Card>
              )}

              {/* RECOMMENDED MECHANICS (INTELLIGENT RANKING & EXPLAINABILITY) */}
              {selectedRequest.status === 'pending' && (
                <Card className="mb-3 border-success">
                  <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-stars me-2"></i>
                      <strong>Intelligent Mechanic Recommendations</strong>
                    </div>
                    <small>Ranked by Specialization, Distance & Rating</small>
                  </Card.Header>
                  <Card.Body>
                    {loadingMechanics ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" variant="success" />
                        <p className="mt-2 text-muted">Analyzing candidate mechanics and ranking best matches...</p>
                      </div>
                    ) : mechanics.length === 0 ? (
                      <Alert variant="info">
                        No verified and available mechanics are currently within range.
                      </Alert>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {mechanics.map((mechanic, rankIdx) => (
                          <Card key={mechanic._id} className="border shadow-sm">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <div className="d-flex align-items-center gap-2">
                                    <Badge bg="dark" className="rounded-pill">#{rankIdx + 1}</Badge>
                                    <h5 className="mb-0 text-dark">{mechanic.name}</h5>
                                  </div>
                                  <div className="text-muted small mt-1">
                                    <i className="bi bi-telephone me-1"></i>
                                    <a href={`tel:${mechanic.phone}`} className="text-decoration-none">{mechanic.phone}</a>
                                    <span className="mx-2">•</span>
                                    <i className="bi bi-envelope me-1"></i>{mechanic.email}
                                  </div>
                                </div>
                                <div className="text-end">
                                  <Badge bg="success" className="fs-6 px-3 py-2">
                                    {mechanic.matchScore || 85}% Match
                                  </Badge>
                                  {mechanic.distanceKm !== null && mechanic.distanceKm !== undefined && (
                                    <div className="small text-muted mt-1">
                                      <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                                      {mechanic.distanceKm} km (~{mechanic.estimatedEtaMinutes || 15}m ETA)
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Attributes & Specialization Badges */}
                              <div className="d-flex flex-wrap align-items-center gap-2 my-2 py-1 border-top border-bottom">
                                <span className="small text-warning fw-bold">
                                  ⭐ {mechanic.mechanicDetails?.rating ? mechanic.mechanicDetails.rating.toFixed(1) : 'New'}
                                  {mechanic.mechanicDetails?.totalReviews ? ` (${mechanic.mechanicDetails.totalReviews} reviews)` : ''}
                                </span>
                                <span className="text-muted">•</span>
                                <span className="small text-secondary">
                                  <i className="bi bi-briefcase me-1"></i>
                                  {mechanic.mechanicDetails?.experience || 0} years exp
                                </span>
                                {mechanic.mechanicDetails?.hourlyRate && (
                                  <>
                                    <span className="text-muted">•</span>
                                    <span className="small text-secondary">
                                      Rate: ₹{mechanic.mechanicDetails.hourlyRate}/hr
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Specialization Tags */}
                              {mechanic.mechanicDetails?.specialization?.length > 0 && (
                                <div className="mb-2">
                                  <small className="text-muted me-2">Skills:</small>
                                  {mechanic.mechanicDetails.specialization.map((spec, sIdx) => (
                                    <Badge bg="light" text="dark" className="border me-1" key={sIdx}>
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Why Recommended Explanation List */}
                              {mechanic.recommendationReasons?.length > 0 && (
                                <div className="p-2 bg-light rounded border-start border-success border-3 mt-2">
                                  <strong className="small text-success d-block mb-1">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Why This Mechanic Was Recommended:
                                  </strong>
                                  <ul className="mb-0 ps-3 small text-secondary">
                                    {mechanic.recommendationReasons.map((reason, rIdx) => (
                                      <li key={rIdx}>{reason}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}

              {/* TIMELINE */}
              {selectedRequest.timeline?.length > 0 && (

                <Card className="mb-3">

                  <Card.Body>

                    <Card.Title>
                      Request Timeline
                    </Card.Title>

                    {selectedRequest.timeline
                      .slice()
                      .reverse()
                      .map((item, index) => (

                        <div
                          key={index}
                          className="border-start ps-3 mb-3"
                        >

                          <strong>
                            {item.status?.replace(
                              '_',
                              ' '
                            )}
                          </strong>

                          <p className="mb-1">
                            {item.message}
                          </p>

                          <small className="text-muted">
                            {item.timestamp
                              ? new Date(
                                  item.timestamp
                                ).toLocaleString()
                              : ''}
                          </small>

                        </div>

                      ))}

                  </Card.Body>

                </Card>

              )}

            </>

          )}

        </Modal.Body>

        <Modal.Footer>

          {selectedRequest &&
            (selectedRequest.status === 'pending' ||
              selectedRequest.status === 'accepted') && (

              <Button
                variant="danger"
                onClick={() =>
                  handleCancelRequest(
                    selectedRequest._id
                  )
                }
              >
                Cancel Request
              </Button>

            )}

          <Button
            variant="secondary"
            onClick={() => setShowDetails(false)}
          >
            Close
          </Button>

        </Modal.Footer>

      </Modal>

    </Container>
  );
};

export default CustomerRequests;
