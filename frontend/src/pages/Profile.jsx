import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Tabs, Tab, Table, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    vin: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const [mechanicForm, setMechanicForm] = useState({
    specialization: '',
    experience: '',
    hourlyRate: '',
    licenseNumber: '',
    isAvailable: true,
    coordinates: [0, 0]
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });

      if (user.role === 'mechanic') {
        setMechanicForm({
          specialization: user.mechanicDetails?.specialization?.join(', ') || '',
          experience: user.mechanicDetails?.experience || '',
          hourlyRate: user.mechanicDetails?.hourlyRate || '',
          licenseNumber: user.mechanicDetails?.licenseNumber || '',
          isAvailable: user.mechanicDetails?.isAvailable ?? true,
          coordinates: user.address?.location?.coordinates || [0, 0]
        });
      }
    }
  }, [user]);

  const handleDetectMechanicLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [
          Number(pos.coords.longitude.toFixed(6)),
          Number(pos.coords.latitude.toFixed(6))
        ];
        setMechanicForm(prev => ({
          ...prev,
          coordinates: coords
        }));
        setGeoLoading(false);
        setMessage('Shop / Service coordinates detected successfully. Click Save to apply.');
      },
      (err) => {
        setMessage('Could not detect location: ' + err.message);
        setGeoLoading(false);
      }
    );
  };

  const handleUpdateMechanicProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const specs = mechanicForm.specialization
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        mechanicDetails: {
          specialization: specs,
          experience: Number(mechanicForm.experience) || 0,
          hourlyRate: Number(mechanicForm.hourlyRate) || 0,
          licenseNumber: mechanicForm.licenseNumber,
          isAvailable: mechanicForm.isAvailable
        },
        address: {
          ...profileForm.address,
          location: {
            type: 'Point',
            coordinates: mechanicForm.coordinates
          }
        }
      };

      await api.put('/users/profile', payload);
      setMessage('Mechanic professional details and location updated successfully!');
      fetchUser();
    } catch (error) {
      setMessage('Failed to update mechanic profile: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileForm({
        ...profileForm,
        [parent]: {
          ...profileForm[parent],
          [child]: value
        }
      });
    } else {
      setProfileForm({
        ...profileForm,
        [name]: value
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/profile', profileForm);
      setMessage('Profile updated successfully');
      fetchUser();
    } catch (error) {
      setMessage('Failed to update profile');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/password', passwordForm);
      setMessage('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      setMessage('Failed to update password');
    }
    setLoading(false);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/vehicles', vehicleForm);
      setMessage('Vehicle added successfully');
      setVehicleForm({
        make: '',
        model: '',
        year: '',
        licensePlate: '',
        vin: ''
      });
      fetchUser();
    } catch (error) {
      setMessage('Failed to add vehicle');
    }
    setLoading(false);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Profile</h2>
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}
      <Card>
        <Card.Body>
          <Tabs defaultActiveKey="profile" className="mb-3">
            <Tab eventKey="profile" title="Profile Information">
              <Form onSubmit={handleUpdateProfile}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={user?.email || ''}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    required
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Street Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.street"
                        value={profileForm.address.street}
                        onChange={handleProfileChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.city"
                        value={profileForm.address.city}
                        onChange={handleProfileChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.state"
                        value={profileForm.address.state}
                        onChange={handleProfileChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Zip Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.zipCode"
                        value={profileForm.address.zipCode}
                        onChange={handleProfileChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Form>
            </Tab>

            <Tab eventKey="password" title="Change Password">
              <Form onSubmit={handleUpdatePassword}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength="6"
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </Form>
            </Tab>

            {user?.role === 'customer' && (
              <Tab eventKey="vehicles" title="My Vehicles">
                <div className="mb-4">
                  <h5>Add New Vehicle</h5>
                  <Form onSubmit={handleAddVehicle}>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Make</Form.Label>
                          <Form.Control
                            type="text"
                            value={vehicleForm.make}
                            onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Model</Form.Label>
                          <Form.Control
                            type="text"
                            value={vehicleForm.model}
                            onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Year</Form.Label>
                          <Form.Control
                            type="number"
                            value={vehicleForm.year}
                            onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>License Plate</Form.Label>
                          <Form.Control
                            type="text"
                            value={vehicleForm.licensePlate}
                            onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>VIN</Form.Label>
                          <Form.Control
                            type="text"
                            value={vehicleForm.vin}
                            onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Vehicle'}
                    </Button>
                  </Form>
                </div>

                <h5>Registered Vehicles</h5>
                {user?.vehicleDetails?.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Make</th>
                        <th>Model</th>
                        <th>Year</th>
                        <th>License Plate</th>
                        <th>VIN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.vehicleDetails.map((vehicle, index) => (
                        <tr key={index}>
                          <td>{vehicle.make}</td>
                          <td>{vehicle.model}</td>
                          <td>{vehicle.year}</td>
                          <td>{vehicle.licensePlate}</td>
                          <td>{vehicle.vin || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-muted">No vehicles registered yet.</p>
                )}
              </Tab>
            )}

            {user?.role === 'mechanic' && (
              <Tab eventKey="mechanic" title="Mechanic Professional Profile">
                <Form onSubmit={handleUpdateMechanicProfile}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Professional Skills & Service Configuration</h5>
                    <Badge bg={user.mechanicDetails?.isVerified ? 'success' : 'warning'}>
                      {user.mechanicDetails?.isVerified ? 'Verified Mechanic' : 'Approval Pending'}
                    </Badge>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Specializations (comma separated)</Form.Label>
                    <Form.Control
                      type="text"
                      value={mechanicForm.specialization}
                      onChange={(e) => setMechanicForm({ ...mechanicForm, specialization: e.target.value })}
                      placeholder="e.g., battery, electrical, engine, tire, fuel, brakes, overhaul"
                    />
                    <Form.Text className="text-muted">
                      Keywords matched by our AI recommendation engine when dispatching emergency requests.
                    </Form.Text>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Years of Experience</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          max="60"
                          value={mechanicForm.experience}
                          onChange={(e) => setMechanicForm({ ...mechanicForm, experience: e.target.value })}
                          placeholder="e.g., 8"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Standard Hourly Rate (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          value={mechanicForm.hourlyRate}
                          onChange={(e) => setMechanicForm({ ...mechanicForm, hourlyRate: e.target.value })}
                          placeholder="e.g., 500"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Trade / License Number</Form.Label>
                        <Form.Control
                          type="text"
                          value={mechanicForm.licenseNumber}
                          onChange={(e) => setMechanicForm({ ...mechanicForm, licenseNumber: e.target.value })}
                          placeholder="e.g., DL-MECH-2020-001"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Availability Status</Form.Label>
                        <Form.Select
                          value={mechanicForm.isAvailable ? 'true' : 'false'}
                          onChange={(e) => setMechanicForm({ ...mechanicForm, isAvailable: e.target.value === 'true' })}
                        >
                          <option value="true">Active & Ready for Breakdown Requests</option>
                          <option value="false">Off-Duty / Unavailable</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Location & GPS Detection */}
                  <div className="p-3 bg-light rounded border mb-3">
                    <h6>
                      <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                      Service / Garage Base Coordinates
                    </h6>
                    <p className="small text-muted mb-2">
                      Accurate coordinates allow nearby stranded motorists to locate you via the AI recommendation engine.
                    </p>
                    <div className="d-flex align-items-center gap-3">
                      <div>
                        Coordinates:{' '}
                        {mechanicForm.coordinates[1] !== 0 ? (
                          <Badge bg="success">
                            {mechanicForm.coordinates[1]}, {mechanicForm.coordinates[0]}
                          </Badge>
                        ) : (
                          <Badge bg="secondary">Not Set (0, 0)</Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        onClick={handleDetectMechanicLocation}
                        disabled={geoLoading}
                      >
                        {geoLoading ? 'Detecting...' : '📍 Set Base GPS to Current Location'}
                      </Button>
                    </div>
                  </div>

                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Mechanic Profile'}
                  </Button>
                </Form>
              </Tab>
            )}
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
