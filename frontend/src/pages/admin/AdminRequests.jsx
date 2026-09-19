// // import React, { useEffect, useState } from 'react';
// // import { Container, Table, Badge } from 'react-bootstrap';
// // import api from '../../services/api';
// // import Navbar from '../../components/Navbar';

// // const AdminRequests = () => {
// //   const [requests, setRequests] = useState([]);

// //   useEffect(() => {
// //     fetchRequests();
// //   }, []);

// //   const fetchRequests = async () => {
// //     try {
// //       const response = await api.get('/requests/all');
// //       setRequests(response.data.requests);
// //     } catch (error) {
// //       console.error('Failed to fetch requests');
// //     }
// //   };

// //   return (
// //     <>
// //     <Navbar />
// //     <Container className="py-4">
// //       <h2 className="mb-4">All Breakdown Requests</h2>
// //       <Table striped bordered hover responsive>
// //         <thead>
// //           <tr>
// //             <th>ID</th>
// //             <th>Customer</th>
// //             <th>Issue Type</th>
// //             <th>Urgency</th>
// //             <th>Status</th>
// //             <th>Mechanic</th>
// //             <th>Date</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {requests.map((request) => (
// //             <tr key={request._id}>
// //               <td>{request._id.substring(0, 8)}...</td>
// //               <td>{request.customer?.name || 'N/A'}</td>
// //               <td>{request.issueType}</td>
// //               <td>
// //                 <Badge bg={
// //                   request.urgency === 'emergency' ? 'danger' :
// //                   request.urgency === 'high' ? 'warning' : 'info'
// //                 }>
// //                   {request.urgency}
// //                 </Badge>
// //               </td>
// //               <td>
// //                 <Badge bg={
// //                   request.status === 'completed' ? 'success' :
// //                   request.status === 'in_progress' ? 'primary' :
// //                   request.status === 'cancelled' ? 'danger' : 'secondary'
// //                 }>
// //                   {request.status}
// //                 </Badge>
// //               </td>
// //               <td>{request.assignedMechanic?.name || 'Not Assigned'}</td>
// //               <td>{new Date(request.createdAt).toLocaleDateString()}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </Table>
// //     </Container>
// //   );
// // };

// // export default AdminRequests;


// import React, { useEffect, useState } from 'react';
// import { Container, Table, Badge } from 'react-bootstrap';
// import api from '../../services/api';
// import Navbar from '../../components/Navbar';

// const AdminRequests = () => {
//   const [requests, setRequests] = useState([]);

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   const fetchRequests = async () => {
//     try {
//       const response = await api.get('/requests/all');
//       setRequests(response.data.requests);
//     } catch (error) {
//       console.error('Failed to fetch requests');
//     }
//   };

//   return (
//     <>
//       <Navbar />

//       <Container className="py-4">
//         <h2 className="mb-4">All Breakdown Requests</h2>

//         <Table striped bordered hover responsive>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Customer</th>
//               <th>Issue Type</th>
//               <th>Urgency</th>
//               <th>Status</th>
//               <th>Mechanic</th>
//               <th>Date</th>
//             </tr>
//           </thead>

//           <tbody>
//             {requests.map((request) => (
//               <tr key={request._id}>
//                 <td>{request._id.substring(0, 8)}...</td>

//                 <td>
//                   {request.customer?.name || 'N/A'}
//                 </td>

//                 <td>{request.issueType}</td>

//                 <td>
//                   <Badge
//                     bg={
//                       request.urgency === 'emergency'
//                         ? 'danger'
//                         : request.urgency === 'high'
//                         ? 'warning'
//                         : 'info'
//                     }
//                   >
//                     {request.urgency}
//                   </Badge>
//                 </td>

//                 <td>
//                   <Badge
//                     bg={
//                       request.status === 'completed'
//                         ? 'success'
//                         : request.status === 'in_progress'
//                         ? 'primary'
//                         : request.status === 'cancelled'
//                         ? 'danger'
//                         : 'secondary'
//                     }
//                   >
//                     {request.status}
//                   </Badge>
//                 </td>

//                 <td>
//                   {request.assignedMechanic?.name || 'Not Assigned'}
//                 </td>

//                 <td>
//                   {new Date(request.createdAt).toLocaleDateString()}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       </Container>
//     </>
//   );
// };

// export default AdminRequests;

import React, { useEffect, useState } from 'react';
import { Container, Table, Badge } from 'react-bootstrap';
import api from '../../services/api';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests/all');
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch requests');
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">All Breakdown Requests</h2>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Issue Type</th>
            <th>Urgency</th>
            <th>Status</th>
            <th>Mechanic</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((request) => (
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
                <Badge
                  bg={
                    request.urgency === 'emergency'
                      ? 'danger'
                      : request.urgency === 'high'
                      ? 'warning'
                      : 'info'
                  }
                >
                  {request.urgency}
                </Badge>
              </td>

              <td>
                <Badge
                  bg={
                    request.status === 'completed'
                      ? 'success'
                      : request.status === 'in_progress'
                      ? 'primary'
                      : request.status === 'cancelled'
                      ? 'danger'
                      : 'secondary'
                  }
                >
                  {request.status}
                </Badge>
              </td>

              <td>
                {request.assignedMechanic?.name || 'Not Assigned'}
              </td>

              <td>
                {new Date(request.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminRequests;