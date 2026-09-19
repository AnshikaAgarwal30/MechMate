// // import React, { useEffect, useState } from 'react';
// // import { Container, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
// // import api from '../../services/api';
// // import Navbar from '../../components/Navbar';

// // const AdminUsers = () => {
// //   const [users, setUsers] = useState([]);
// //   const [filter, setFilter] = useState('all');
// //   const [showDeleteModal, setShowDeleteModal] = useState(false);
// //   const [selectedUser, setSelectedUser] = useState(null);

// //   useEffect(() => {
// //     fetchUsers();
// //   }, [filter]);

// //   const fetchUsers = async () => {
// //     try {
// //       const params = filter !== 'all' ? { role: filter } : {};
// //       const response = await api.get('/users', { params });
// //       setUsers(response.data.users);
// //     } catch (error) {
// //       console.error('Failed to fetch users');
// //     }
// //   };

// //   const handleApproveMechanic = async (userId) => {
// //     try {
// //       await api.put(`/users/mechanics/${userId}/approve`);
// //       fetchUsers();
// //     } catch (error) {
// //       console.error('Failed to approve mechanic');
// //     }
// //   };

// //   const handleDeleteUser = async () => {
// //     try {
// //       await api.delete(`/users/${selectedUser}`);
// //       setShowDeleteModal(false);
// //       fetchUsers();
// //     } catch (error) {
// //       console.error('Failed to delete user');
// //     }
// //   };

// //   const filteredUsers = filter === 'all' 
// //     ? users 
// //     : users.filter(user => user.role === filter);

// //   return (
// //     <>
// //     <Navbar />
// //     <Container className="py-4">
// //       <div className="d-flex justify-content-between align-items-center mb-4">
// //         <h2>Manage Users</h2>
// //         <Form.Select 
// //           style={{ width: '200px' }}
// //           value={filter}
// //           onChange={(e) => setFilter(e.target.value)}
// //         >
// //           <option value="all">All Users</option>
// //           <option value="customer">Customers</option>
// //           <option value="mechanic">Mechanics</option>
// //           <option value="admin">Admins</option>
// //         </Form.Select>
// //       </div>

// //       <Table striped bordered hover responsive>
// //         <thead>
// //           <tr>
// //             <th>Name</th>
// //             <th>Email</th>
// //             <th>Phone</th>
// //             <th>Role</th>
// //             <th>Status</th>
// //             <th>Actions</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {filteredUsers.map((user) => (
// //             <tr key={user._id}>
// //               <td>{user.name}</td>
// //               <td>{user.email}</td>
// //               <td>{user.phone}</td>
// //               <td>
// //                 <Badge bg={user.role === 'admin' ? 'danger' : user.role === 'mechanic' ? 'success' : 'primary'}>
// //                   {user.role}
// //                 </Badge>
// //               </td>
// //               <td>
// //                 {user.role === 'mechanic' && (
// //                   user.mechanicDetails?.isVerified ? (
// //                     <Badge bg="success">Verified</Badge>
// //                   ) : (
// //                     <Badge bg="warning">Pending</Badge>
// //                   )
// //                 )}
// //               </td>
// //               <td>
// //                 {user.role === 'mechanic' && !user.mechanicDetails?.isVerified && (
// //                   <Button 
// //                     variant="success" 
// //                     size="sm"
// //                     className="me-2"
// //                     onClick={() => handleApproveMechanic(user._id)}
// //                   >
// //                     Approve
// //                   </Button>
// //                 )}
// //                 <Button 
// //                   variant="danger" 
// //                   size="sm"
// //                   onClick={() => {
// //                     setSelectedUser(user._id);
// //                     setShowDeleteModal(true);
// //                   }}
// //                 >
// //                   Delete
// //                 </Button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </Table>

// //       <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
// //         <Modal.Header closeButton>
// //           <Modal.Title>Confirm Delete</Modal.Title>
// //         </Modal.Header>
// //         <Modal.Body>
// //           Are you sure you want to delete this user? This action cannot be undone.
// //         </Modal.Body>
// //         <Modal.Footer>
// //           <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
// //             Cancel
// //           </Button>
// //           <Button variant="danger" onClick={handleDeleteUser}>
// //             Delete
// //           </Button>
// //         </Modal.Footer>
// //       </Modal>
// //     </Container>
// //   );
// // };

// // export default AdminUsers;


// import React, { useEffect, useState } from 'react';
// import { Container, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
// import api from '../../services/api';
// import Navbar from '../../components/Navbar';

// const AdminUsers = () => {
//   const [users, setUsers] = useState([]);
//   const [filter, setFilter] = useState('all');
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);

//   useEffect(() => {
//     fetchUsers();
//   }, [filter]);

//   const fetchUsers = async () => {
//     try {
//       const params = filter !== 'all' ? { role: filter } : {};
//       const response = await api.get('/users', { params });
//       setUsers(response.data.users);
//     } catch (error) {
//       console.error('Failed to fetch users');
//     }
//   };

//   const handleApproveMechanic = async (userId) => {
//     try {
//       await api.put(`/users/mechanics/${userId}/approve`);
//       fetchUsers();
//     } catch (error) {
//       console.error('Failed to approve mechanic');
//     }
//   };

//   const handleDeleteUser = async () => {
//     try {
//       await api.delete(`/users/${selectedUser}`);
//       setShowDeleteModal(false);
//       setSelectedUser(null);
//       fetchUsers();
//     } catch (error) {
//       console.error('Failed to delete user');
//     }
//   };

//   const filteredUsers =
//     filter === 'all'
//       ? users
//       : users.filter((user) => user.role === filter);

//   return (
//     <>
//       <Navbar />

//       <Container className="py-4">
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <h2>Manage Users</h2>

//           <Form.Select
//             style={{ width: '200px' }}
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//           >
//             <option value="all">All Users</option>
//             <option value="customer">Customers</option>
//             <option value="mechanic">Mechanics</option>
//             <option value="admin">Admins</option>
//           </Form.Select>
//         </div>

//         <Table striped bordered hover responsive>
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Phone</th>
//               <th>Role</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredUsers.map((user) => (
//               <tr key={user._id}>
//                 <td>{user.name}</td>

//                 <td>{user.email}</td>

//                 <td>{user.phone}</td>

//                 <td>
//                   <Badge
//                     bg={
//                       user.role === 'admin'
//                         ? 'danger'
//                         : user.role === 'mechanic'
//                         ? 'success'
//                         : 'primary'
//                     }
//                   >
//                     {user.role}
//                   </Badge>
//                 </td>

//                 <td>
//                   {user.role === 'mechanic' &&
//                     (user.mechanicDetails?.isVerified ? (
//                       <Badge bg="success">Verified</Badge>
//                     ) : (
//                       <Badge bg="warning">Pending</Badge>
//                     ))}
//                 </td>

//                 <td>
//                   {user.role === 'mechanic' &&
//                     !user.mechanicDetails?.isVerified && (
//                       <Button
//                         variant="success"
//                         size="sm"
//                         className="me-2"
//                         onClick={() =>
//                           handleApproveMechanic(user._id)
//                         }
//                       >
//                         Approve
//                       </Button>
//                     )}

//                   <Button
//                     variant="danger"
//                     size="sm"
//                     onClick={() => {
//                       setSelectedUser(user._id);
//                       setShowDeleteModal(true);
//                     }}
//                   >
//                     Delete
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>

//         <Modal
//           show={showDeleteModal}
//           onHide={() => setShowDeleteModal(false)}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Confirm Delete</Modal.Title>
//           </Modal.Header>

//           <Modal.Body>
//             Are you sure you want to delete this user? This action
//             cannot be undone.
//           </Modal.Body>

//           <Modal.Footer>
//             <Button
//               variant="secondary"
//               onClick={() => setShowDeleteModal(false)}
//             >
//               Cancel
//             </Button>

//             <Button
//               variant="danger"
//               onClick={handleDeleteUser}
//             >
//               Delete
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       </Container>
//     </>
//   );
// };

// export default AdminUsers;

import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const params = filter !== 'all' ? { role: filter } : {};
      const response = await api.get('/users', { params });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleApproveMechanic = async (userId) => {
    try {
      await api.put(`/users/mechanics/${userId}/approve`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to approve mechanic');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/users/${selectedUser}`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user');
    }
  };

  const filteredUsers =
    filter === 'all'
      ? users
      : users.filter((user) => user.role === filter);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Users</h2>

        <Form.Select
          style={{ width: '200px' }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="customer">Customers</option>
          <option value="mechanic">Mechanics</option>
          <option value="admin">Admins</option>
        </Form.Select>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>

              <td>
                <Badge
                  bg={
                    user.role === 'admin'
                      ? 'danger'
                      : user.role === 'mechanic'
                      ? 'success'
                      : 'primary'
                  }
                >
                  {user.role}
                </Badge>
              </td>

              <td>
                {user.role === 'mechanic' &&
                  (user.mechanicDetails?.isVerified ? (
                    <Badge bg="success">Verified</Badge>
                  ) : (
                    <Badge bg="warning">Pending</Badge>
                  ))}
              </td>

              <td>
                {user.role === 'mechanic' &&
                  !user.mechanicDetails?.isVerified && (
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() =>
                        handleApproveMechanic(user._id)
                      }
                    >
                      Approve
                    </Button>
                  )}

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user._id);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this user? This action
          cannot be undone.
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleDeleteUser}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminUsers;