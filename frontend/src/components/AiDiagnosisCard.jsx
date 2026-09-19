import React from 'react';
import { Card, Badge, Alert, Row, Col, Button } from 'react-bootstrap';

const AiDiagnosisCard = ({ diagnosis, imageUrl, onApplyToForm }) => {
  if (!diagnosis) return null;

  const getUrgencyBadgeVariant = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'emergency': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'secondary';
    }
  };

  const getIssueBadgeVariant = (issue) => {
    switch (issue?.toLowerCase()) {
      case 'battery': return 'warning';
      case 'engine': return 'danger';
      case 'tire': return 'primary';
      case 'fuel': return 'info';
      case 'accident': return 'dark';
      default: return 'secondary';
    }
  };

  return (
    <Card className="border-primary shadow-sm mb-4">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <div>
          <i className="bi bi-cpu me-2"></i>
          <strong>MechMate AI Breakdown Assessment</strong>
        </div>
        <div>
          {diagnosis.confidenceScore && (
            <Badge bg="light" text="dark" className="me-2">
              Confidence: {diagnosis.confidenceScore.toUpperCase()}
            </Badge>
          )}
          <Badge bg={getUrgencyBadgeVariant(diagnosis.recommendedUrgency)}>
            Priority: {diagnosis.recommendedUrgency?.toUpperCase()}
          </Badge>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Title & Classification */}
        <div className="mb-3">
          <div className="d-flex align-items-center gap-2 mb-1">
            <Badge bg={getIssueBadgeVariant(diagnosis.predictedIssueType)} className="fs-6">
              {diagnosis.predictedIssueType?.toUpperCase()}
            </Badge>
            <h5 className="mb-0 text-dark">{diagnosis.issueTitle}</h5>
          </div>
        </div>

        {/* Uploaded Image preview if present */}
        {imageUrl && (
          <div className="mb-3 p-2 bg-light rounded border d-flex align-items-center gap-3">
            <img
              src={`http://localhost:5000${imageUrl}`}
              alt="Analyzed Component"
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <small className="text-muted d-block">Uploaded Breakdown Photo Analyzed</small>
              {diagnosis.detectedComponents?.length > 0 && (
                <div className="mt-1">
                  {diagnosis.detectedComponents.map((comp, idx) => (
                    <Badge bg="secondary" className="me-1" key={idx}>
                      <i className="bi bi-tag me-1"></i>{comp}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <Row className="mb-3">
          {/* Possible Causes */}
          <Col md={6}>
            <div className="p-3 bg-light rounded h-100 border">
              <h6 className="text-primary mb-2">
                <i className="bi bi-search me-1"></i>
                Likely Causes
              </h6>
              <ul className="mb-0 ps-3">
                {diagnosis.possibleCauses?.map((cause, idx) => (
                  <li key={idx} className="small mb-1">{cause}</li>
                ))}
              </ul>
            </div>
          </Col>

          {/* Recommended Specialization */}
          <Col md={6}>
            <div className="p-3 bg-light rounded h-100 border">
              <h6 className="text-primary mb-2">
                <i className="bi bi-person-gear me-1"></i>
                Recommended Mechanic Specialization
              </h6>
              <div className="d-flex flex-wrap gap-1 mb-2">
                {diagnosis.recommendedSpecialization?.map((spec, idx) => (
                  <Badge bg="info" text="dark" key={idx} className="p-2">
                    <i className="bi bi-check2 me-1"></i>{spec}
                  </Badge>
                ))}
              </div>
              <small className="text-muted d-block mt-2">
                Our recommendation engine will prioritize matching verified mechanics with these exact skills.
              </small>
            </div>
          </Col>
        </Row>

        {/* Immediate Safety Advice */}
        {diagnosis.safetyAdvice?.length > 0 && (
          <Alert variant="warning" className="mb-3">
            <Alert.Heading className="fs-6 d-flex align-items-center">
              <i className="bi bi-shield-exclamation me-2 fs-5"></i>
              Immediate Safety Instructions
            </Alert.Heading>
            <ul className="mb-0 ps-3">
              {diagnosis.safetyAdvice.map((advice, idx) => (
                <li key={idx} className="small fw-semibold">{advice}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Non-Guaranteed Disclaimer */}
        <Alert variant="secondary" className="mb-3 py-2 small d-flex align-items-center">
          <i className="bi bi-info-circle me-2 fs-5 text-muted"></i>
          <div>
            <strong>Automated Triage Notice: </strong>
            {diagnosis.disclaimer || 'This is an automated preliminary assessment based on reported symptoms and images. A physical inspection by a qualified mechanic is necessary for an official diagnosis.'}
          </div>
        </Alert>

        {/* Apply findings button */}
        {onApplyToForm && (
          <Button
            variant="outline-primary"
            className="w-100"
            onClick={onApplyToForm}
          >
            <i className="bi bi-arrow-down-circle me-2"></i>
            Apply AI Assessment to Breakdown Request Form
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default AiDiagnosisCard;
