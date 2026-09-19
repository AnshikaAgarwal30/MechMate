import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import aiService from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import AiDiagnosisCard from '../../components/AiDiagnosisCard';
import MapComponent from '../../components/MapComponent';

const CustomerRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    vehicle: { make: '', model: '', year: '', licensePlate: '' },
    location: { address: '', coordinates: [0, 0] },
    issueType: 'engine',
    description: '',
    urgency: 'medium'
  });

  // AI & Image State
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [diagnosedImageUrl, setDiagnosedImageUrl] = useState(null);
  const [aiMessage, setAiMessage] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle saved vehicle quick selection
  const handleSelectSavedVehicle = (e) => {
    const idx = e.target.value;
    if (idx === '') return;
    const selected = user?.vehicleDetails?.[idx];
    if (selected) {
      setFormData(prev => ({
        ...prev,
        vehicle: {
          make: selected.make || '',
          model: selected.model || '',
          year: selected.year || '',
          licensePlate: selected.licensePlate || ''
        }
      }));
    }
  };

  // Handle image upload and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, or JPEG).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setDiagnosedImageUrl(null);
  };

  // Run AI breakdown diagnosis via Gemini Vision / Rules
  const handleRunAiDiagnosis = async () => {
    if (!formData.description.trim() && !selectedImage) {
      setError('Please describe your vehicle problem or upload an image before running AI diagnosis.');
      return;
    }

    setError('');
    setAiMessage('');
    setAiLoading(true);

    try {
      const data = new FormData();
      data.append('description', formData.description);
      data.append('make', formData.vehicle.make || '');
      data.append('model', formData.vehicle.model || '');
      data.append('year', formData.vehicle.year || '');

      if (selectedImage) {
        data.append('image', selectedImage);
      }

      const response = await aiService.diagnose(data);
      if (response.data?.success) {
        setAiDiagnosis(response.data.diagnosis);
        if (response.data.imageUrl) {
          setDiagnosedImageUrl(response.data.imageUrl);
        }
        setAiMessage('AI breakdown analysis completed successfully! Review findings below.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete AI diagnosis. Please check network.');
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI diagnosis findings directly into form
  const handleApplyAiFindings = () => {
    if (!aiDiagnosis) return;

    setFormData(prev => ({
      ...prev,
      issueType: aiDiagnosis.predictedIssueType || prev.issueType,
      urgency: aiDiagnosis.recommendedUrgency || prev.urgency,
      description: prev.description
        ? `${prev.description}\n\n[AI Assessment: ${aiDiagnosis.issueTitle}]`
        : `[AI Assessment: ${aiDiagnosis.issueTitle}]`
    }));

    setAiMessage('Applied AI recommended issue category and urgency to your request!');
  };

  const getCurrentLocation = () => {
    setError('');
    setLocationMessage('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const longitude = Number(coords.longitude.toFixed(6));
        const latitude = Number(coords.latitude.toFixed(6));
        let address = `Current location (${latitude}, ${longitude})`;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: 'application/json' } }
          );
          if (response.ok) {
            const data = await response.json();
            address = data.display_name || address;
          }
        } catch {
          // Coordinates are still valid even if reverse geocoding fails.
        }

        setFormData(prev => ({
          ...prev,
          location: { address, coordinates: [longitude, latitude] }
        }));
        setLocationMessage('Current location detected successfully.');
        setLocationLoading(false);
      },
      (geoError) => {
        const messages = {
          1: 'Location permission was denied. Please allow location access in your browser.',
          2: 'Your location could not be determined. Please try again.',
          3: 'Location request timed out. Please try again.'
        };
        setError(messages[geoError.code] || 'Unable to get your current location.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
      setError('Please click "📍 Use Current Location" or enter a valid location before submitting.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        vehicle: { ...formData.vehicle, year: Number(formData.vehicle.year) },
        images: diagnosedImageUrl ? [diagnosedImageUrl] : [],
        aiDiagnosis: aiDiagnosis || undefined
      };

      await api.post('/requests', payload);
      navigate('/customer/requests', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Request Roadside Assistance</h2>
          <small className="text-muted">AI-Powered Breakdown Diagnosis & Intelligent Mechanic Dispatch</small>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate('/customer/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {locationMessage && <Alert variant="success" dismissible onClose={() => setLocationMessage('')}>{locationMessage}</Alert>}
          {aiMessage && <Alert variant="info" dismissible onClose={() => setAiMessage('')}>{aiMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* 1. Vehicle Information */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">1. Vehicle Information</h5>
              {user?.vehicleDetails?.length > 0 && (
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">Select from saved:</small>
                  <Form.Select size="sm" style={{ width: 'auto' }} onChange={handleSelectSavedVehicle} defaultValue="">
                    <option value="" disabled>Choose your vehicle...</option>
                    {user.vehicleDetails.map((veh, i) => (
                      <option key={i} value={i}>
                        {veh.make} {veh.model} ({veh.licensePlate || veh.year})
                      </option>
                    ))}
                  </Form.Select>
                </div>
              )}
            </div>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Make</Form.Label>
                  <Form.Control type="text" name="vehicle.make" value={formData.vehicle.make}
                    onChange={handleChange} required placeholder="e.g., Hyundai / Toyota" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Model</Form.Label>
                  <Form.Control type="text" name="vehicle.model" value={formData.vehicle.model}
                    onChange={handleChange} required placeholder="e.g., Creta / Camry" />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control type="number" name="vehicle.year" value={formData.vehicle.year}
                    onChange={handleChange} required min="1950" max={new Date().getFullYear() + 1} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>License Plate</Form.Label>
                  <Form.Control type="text" name="vehicle.licensePlate" value={formData.vehicle.licensePlate}
                    onChange={handleChange} required placeholder="e.g., DL01AB1234" />
                </Form.Group>
              </Col>
            </Row>

            {/* 2. Problem Description & AI Triage */}
            <h5 className="mb-3 mt-4">2. Breakdown Problem & AI Diagnosis</h5>
            
            <Form.Group className="mb-3">
              <Form.Label>Describe the problem / symptoms</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description}
                onChange={handleChange} required placeholder="e.g., Engine clicking repeatedly and not starting, headlights are dim, battery warning light is illuminated on dashboard." />
              <Form.Text className="text-muted">
                Be as descriptive as possible. Our AI engine analyzes symptoms to classify the problem and match specialized mechanics.
              </Form.Text>
            </Form.Group>

            {/* Image upload for Vision analysis */}
            <Row className="mb-3 align-items-center">
              <Col md={7}>
                <Form.Group>
                  <Form.Label>
                    <i className="bi bi-camera me-1"></i>
                    Upload Component / Warning Light Photo (Optional)
                  </Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                  <Form.Text className="text-muted">
                    Photo of glowing dashboard warning light, flat tire, fluid leak, or engine bay.
                  </Form.Text>
                </Form.Group>
              </Col>
              {imagePreview && (
                <Col md={5} className="d-flex align-items-center gap-3 mt-2 mt-md-0">
                  <div className="position-relative">
                    <img
                      src={imagePreview}
                      alt="Breakdown preview"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                      className="border shadow-sm"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 p-0 px-1 rounded-circle"
                      onClick={handleRemoveImage}
                      title="Remove image"
                    >
                      &times;
                    </Button>
                  </div>
                  <small className="text-success fw-semibold">
                    <i className="bi bi-check-circle me-1"></i>Image ready for Vision Analysis
                  </small>
                </Col>
              )}
            </Row>

            {/* AI Diagnose Action Button */}
            <div className="mb-4">
              <Button
                type="button"
                variant="outline-primary"
                className="d-flex align-items-center gap-2 fw-semibold px-4 py-2"
                onClick={handleRunAiDiagnosis}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    <span>Analyzing symptoms with Gemini AI & Vision...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-stars text-warning fs-5"></i>
                    <span>Diagnose with MechMate AI</span>
                  </>
                )}
              </Button>
            </div>

            {/* Render AI Diagnosis Card if diagnosis is available */}
            {aiDiagnosis && (
              <AiDiagnosisCard
                diagnosis={aiDiagnosis}
                imageUrl={diagnosedImageUrl}
                onApplyToForm={handleApplyAiFindings}
              />
            )}

            {/* 3. Breakdown Location */}
            <h5 className="mb-3 mt-4">3. Breakdown Location</h5>
            <Form.Group className="mb-2">
              <Form.Label>Current / Service Address</Form.Label>
              <Form.Control type="text" name="location.address" value={formData.location.address}
                onChange={handleChange} required placeholder="Click 'Use Current Location' or enter your landmark" />
              <Form.Text>
                Coordinates:{' '}
                {formData.location.coordinates[1] !== 0
                  ? <Badge bg="success">{formData.location.coordinates[1]}, {formData.location.coordinates[0]}</Badge>
                  : <Badge bg="secondary">Not detected yet</Badge>}
              </Form.Text>
            </Form.Group>
            <Button type="button" variant="outline-primary" className="mb-4" onClick={getCurrentLocation}
              disabled={locationLoading}>
              {locationLoading ? <><Spinner size="sm" className="me-2" />Detecting location...</> : '📍 Use Current Location'}
            </Button>
{formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0 && (
  <MapComponent
    customerCoords={formData.location.coordinates}
    issueType={formData.issueType}
  />
)}
            {/* 4. Issue Classification & Urgency */}
            <h5 className="mb-3">4. Issue Classification & Priority</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Issue Category</Form.Label>
                  <Form.Select name="issueType" value={formData.issueType} onChange={handleChange} required>
                    <option value="engine">Engine Problem</option>
                    <option value="tire">Flat Tire / Puncture</option>
                    <option value="battery">Battery / Starting Issue</option>
                    <option value="fuel">Out of Fuel</option>
                    <option value="accident">Accident / Collision</option>
                    <option value="other">Other Mechanical Issue</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Urgency Level</Form.Label>
                  <Form.Select name="urgency" value={formData.urgency} onChange={handleChange} required>
                    <option value="low">Low (Can wait safely)</option>
                    <option value="medium">Medium (Standard roadside)</option>
                    <option value="high">High (Stranded on busy road)</option>
                    <option value="emergency">Emergency (Hazardous situation)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" size="lg" type="submit" className="w-100 mt-3" disabled={loading}>
              {loading ? <><Spinner size="sm" className="me-2" />Submitting Request & Dispatching...</> : '🚀 Submit Request & Find Mechanics'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CustomerRequest;
