// // import React, { useEffect, useState } from 'react';
// // import { Container, Row, Col, Card, Table } from 'react-bootstrap';
// // import { useAuth } from '../../context/AuthContext';
// // import api from '../../services/api';
// // import Navbar from '../../components/Navbar';
// // const AdminDashboard = () => {
// //   const { user } = useAuth();
// //   const [stats, setStats] = useState({
// //     totalUsers: 0,
// //     totalRequests: 0,
// //     totalBookings: 0,
// //     pendingMechanics: 0
// //   });
// //   const [recentRequests, setRecentRequests] = useState([]);

// //   useEffect(() => {
// //     fetchStats();
// //     fetchRecentRequests();
// //   }, []);

// //   const fetchStats = async () => {
// //     try {
// //       const [usersRes, requestsRes, bookingsRes] = await Promise.all([
// //         api.get('/users'),
// //         api.get('/requests/all'),
// //         api.get('/bookings/all')
// //       ]);

// //       const pendingMechanics = usersRes.data.users.filter(
// //         u => u.role === 'mechanic' && !u.mechanicDetails?.isVerified
// //       ).length;

// //       setStats({
// //         totalUsers: usersRes.data.users.length,
// //         totalRequests: requestsRes.data.requests.length,
// //         totalBookings: bookingsRes.data.bookings.length,
// //         pendingMechanics
// //       });
// //     } catch (error) {
// //       console.error('Failed to fetch stats');
// //     }
// //   };

// //   const fetchRecentRequests = async () => {
// //     try {
// //       const response = await api.get('/requests/all');
// //       setRecentRequests(response.data.requests.slice(0, 5));
// //     } catch (error) {
// //       console.error('Failed to fetch recent requests');
// //     }
// //   };

// //   return (
// //     <>
// //     <Navbar />
// //     <Container className="py-4">
// //       <h2 className="mb-4">Admin Dashboard</h2>
// //       <Row className="mb-4">
// //         <Col md={3}>
// //           <Card className="text-center mb-3" bg="primary" text="white">
// //             <Card.Body>
// //               <h3>{stats.totalUsers}</h3>
// //               <p>Total Users</p>
// //             </Card.Body>
// //           </Card>
// //         </Col>
// //         <Col md={3}>
// //           <Card className="text-center mb-3" bg="success" text="white">
// //             <Card.Body>
// //               <h3>{stats.totalRequests}</h3>
// //               <p>Total Requests</p>
// //             </Card.Body>
// //           </Card>
// //         </Col>
// //         <Col md={3}>
// //           <Card className="text-center mb-3" bg="info" text="white">
// //             <Card.Body>
// //               <h3>{stats.totalBookings}</h3>
// //               <p>Total Bookings</p>
// //             </Card.Body>
// //           </Card>
// //         </Col>
// //         <Col md={3}>
// //           <Card className="text-center mb-3" bg="warning" text="dark">
// //             <Card.Body>
// //               <h3>{stats.pendingMechanics}</h3>
// //               <p>Pending Mechanics</p>
// //             </Card.Body>
// //           </Card>
// //         </Col>
// //       </Row>

// //       <Row>
// //         <Col md={12}>
// //           <Card>
// //             <Card.Header>
// //               <h5>Recent Breakdown Requests</h5>
// //             </Card.Header>
// //             <Card.Body>
// //               <Table striped bordered hover responsive>
// //                 <thead>
// //                   <tr>
// //                     <th>ID</th>
// //                     <th>Customer</th>
// //                     <th>Issue Type</th>
// //                     <th>Urgency</th>
// //                     <th>Status</th>
// //                     <th>Date</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {recentRequests.map((request) => (
// //                     <tr key={request._id}>
// //                       <td>{request._id.substring(0, 8)}...</td>
// //                       <td>{request.customer?.name || 'N/A'}</td>
// //                       <td>{request.issueType}</td>
// //                       <td>
// //                         <span className={`badge bg-${
// //                           request.urgency === 'emergency' ? 'danger' :
// //                           request.urgency === 'high' ? 'warning' : 'info'
// //                         }`}>
// //                           {request.urgency}
// //                         </span>
// //                       </td>
// //                       <td>{request.status}</td>
// //                       <td>{new Date(request.createdAt).toLocaleDateString()}</td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </Table>
// //             </Card.Body>
// //           </Card>
// //         </Col>
// //       </Row>
// //     </Container>
// //   );
// // };

// // export default AdminDashboard;


// import React, { useEffect, useState } from 'react';
// import { Container, Row, Col, Card, Table } from 'react-bootstrap';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import Navbar from '../../components/Navbar';

// const AdminDashboard = () => {
//   const { user } = useAuth();

//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalRequests: 0,
//     totalBookings: 0,
//     pendingMechanics: 0
//   });

//   const [recentRequests, setRecentRequests] = useState([]);

//   useEffect(() => {
//     fetchStats();
//     fetchRecentRequests();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const [usersRes, requestsRes, bookingsRes] = await Promise.all([
//         api.get('/users'),
//         api.get('/requests/all'),
//         api.get('/bookings/all')
//       ]);

//       const pendingMechanics = usersRes.data.users.filter(
//         (u) =>
//           u.role === 'mechanic' &&
//           !u.mechanicDetails?.isVerified
//       ).length;

//       setStats({
//         totalUsers: usersRes.data.users.length,
//         totalRequests: requestsRes.data.requests.length,
//         totalBookings: bookingsRes.data.bookings.length,
//         pendingMechanics
//       });
//     } catch (error) {
//       console.error('Failed to fetch stats', error);
//     }
//   };

//   const fetchRecentRequests = async () => {
//     try {
//       const response = await api.get('/requests/all');

//       setRecentRequests(
//         response.data.requests.slice(0, 5)
//       );
//     } catch (error) {
//       console.error('Failed to fetch recent requests', error);
//     }
//   };

//   return (
//     <>
//       <Navbar />

//       <Container className="py-4">
//         <h2 className="mb-4">Admin Dashboard</h2>

//         {/* Statistics Cards */}
//         <Row className="mb-4">

//           <Col md={3}>
//             <Card
//               className="text-center mb-3"
//               bg="primary"
//               text="white"
//             >
//               <Card.Body>
//                 <h3>{stats.totalUsers}</h3>
//                 <p>Total Users</p>
//               </Card.Body>
//             </Card>
//           </Col>

//           <Col md={3}>
//             <Card
//               className="text-center mb-3"
//               bg="success"
//               text="white"
//             >
//               <Card.Body>
//                 <h3>{stats.totalRequests}</h3>
//                 <p>Total Requests</p>
//               </Card.Body>
//             </Card>
//           </Col>

//           <Col md={3}>
//             <Card
//               className="text-center mb-3"
//               bg="info"
//               text="white"
//             >
//               <Card.Body>
//                 <h3>{stats.totalBookings}</h3>
//                 <p>Total Bookings</p>
//               </Card.Body>
//             </Card>
//           </Col>

//           <Col md={3}>
//             <Card
//               className="text-center mb-3"
//               bg="warning"
//               text="dark"
//             >
//               <Card.Body>
//                 <h3>{stats.pendingMechanics}</h3>
//                 <p>Pending Mechanics</p>
//               </Card.Body>
//             </Card>
//           </Col>

//         </Row>

//         {/* Recent Requests */}
//         <Row>
//           <Col md={12}>
//             <Card>

//               <Card.Header>
//                 <h5 className="mb-0">
//                   Recent Breakdown Requests
//                 </h5>
//               </Card.Header>

//               <Card.Body>
//                 <Table
//                   striped
//                   bordered
//                   hover
//                   responsive
//                 >
//                   <thead>
//                     <tr>
//                       <th>ID</th>
//                       <th>Customer</th>
//                       <th>Issue Type</th>
//                       <th>Urgency</th>
//                       <th>Status</th>
//                       <th>Date</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {recentRequests.map((request) => (
//                       <tr key={request._id}>

//                         <td>
//                           {request._id.substring(0, 8)}...
//                         </td>

//                         <td>
//                           {request.customer?.name || 'N/A'}
//                         </td>

//                         <td>
//                           {request.issueType}
//                         </td>

//                         <td>
//                           <span
//                             className={`badge bg-${
//                               request.urgency === 'emergency'
//                                 ? 'danger'
//                                 : request.urgency === 'high'
//                                 ? 'warning'
//                                 : 'info'
//                             }`}
//                           >
//                             {request.urgency}
//                           </span>
//                         </td>

//                         <td>
//                           {request.status}
//                         </td>

//                         <td>
//                           {new Date(
//                             request.createdAt
//                           ).toLocaleDateString()}
//                         </td>

//                       </tr>
//                     ))}
//                   </tbody>

//                 </Table>
//               </Card.Body>

//             </Card>
//           </Col>
//         </Row>

//       </Container>
//     </>
//   );
// };

// export default AdminDashboard;


import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    totalBookings: 0,
    pendingMechanics: 0
  });

  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentRequests();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, requestsRes, bookingsRes] = await Promise.all([
        api.get('/users'),
        api.get('/requests/all'),
        api.get('/bookings/all')
      ]);

      const pendingMechanics = usersRes.data.users.filter(
        (u) =>
          u.role === 'mechanic' &&
          !u.mechanicDetails?.isVerified
      ).length;

      setStats({
        totalUsers: usersRes.data.users.length,
        totalRequests: requestsRes.data.requests.length,
        totalBookings: bookingsRes.data.bookings.length,
        pendingMechanics
      });
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const response = await api.get('/requests/all');

      setRecentRequests(
        response.data.requests.slice(0, 5)
      );
    } catch (error) {
      console.error('Failed to fetch recent requests', error);
    }
  };

  return (
    <Container className="py-4">

      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Statistics Cards */}
      <Row className="mb-4">

        {/* Total Users */}
        <Col md={3}>
          <Link
            to="/admin/users"
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <Card
              className="text-center mb-3"
              bg="primary"
              text="white"
              style={{ cursor: 'pointer' }}
            >
              <Card.Body>
                <h3>{stats.totalUsers}</h3>
                <p className="mb-0">Total Users</p>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Total Requests */}
        <Col md={3}>
          <Link
            to="/admin/requests"
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <Card
              className="text-center mb-3"
              bg="success"
              text="white"
              style={{ cursor: 'pointer' }}
            >
              <Card.Body>
                <h3>{stats.totalRequests}</h3>
                <p className="mb-0">Total Requests</p>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Total Bookings */}
        <Col md={3}>
          <Link
            to="/admin/bookings"
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <Card
              className="text-center mb-3"
              bg="info"
              text="white"
              style={{ cursor: 'pointer' }}
            >
              <Card.Body>
                <h3>{stats.totalBookings}</h3>
                <p className="mb-0">Total Bookings</p>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Pending Mechanics */}
        <Col md={3}>
          <Link
            to="/admin/users"
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <Card
              className="text-center mb-3"
              bg="warning"
              text="dark"
              style={{ cursor: 'pointer' }}
            >
              <Card.Body>
                <h3>{stats.pendingMechanics}</h3>
                <p className="mb-0">Pending Mechanics</p>
              </Card.Body>
            </Card>
          </Link>
        </Col>

      </Row>

      {/* Recent Requests */}
      <Row>
        <Col md={12}>
          <Card>

            <Card.Header>
              <h5 className="mb-0">
                Recent Breakdown Requests
              </h5>
            </Card.Header>

            <Card.Body>
              <Table
                striped
                bordered
                hover
                responsive
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Issue Type</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentRequests.map((request) => (
                    <tr key={request._id}>

                      <td>
                        {request._id.substring(0, 8)}...
                      </td>

                      <td>
                        {request.customer?.name || 'N/A'}
                      </td>

                      <td>
                        {request.issueType}
                      </td>

                      <td>
                        <span
                          className={`badge bg-${
                            request.urgency === 'emergency'
                              ? 'danger'
                              : request.urgency === 'high'
                              ? 'warning'
                              : 'info'
                          }`}
                        >
                          {request.urgency}
                        </span>
                      </td>

                      <td>
                        {request.status}
                      </td>

                      <td>
                        {new Date(
                          request.createdAt
                        ).toLocaleDateString()}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </Table>
            </Card.Body>

          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default AdminDashboard;