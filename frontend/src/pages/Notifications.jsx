import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';
import { useNotification } from '../context/NotificationContext';

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotification();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      await deleteNotification(id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request':
        return 'bi-exclamation-triangle';
      case 'booking':
        return 'bi-calendar-check';
      case 'review':
        return 'bi-star';
      case 'mechanic_approval':
        return 'bi-check-circle';
      default:
        return 'bi-info-circle';
    }
  };

  const getNotificationBadge = (type) => {
    switch (type) {
      case 'request':
        return 'warning';
      case 'booking':
        return 'info';
      case 'review':
        return 'success';
      case 'mechanic_approval':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Notifications</h2>
        {notifications.some(n => !n.isRead) && (
          <Button variant="outline-primary" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <Card.Body>
          {notifications.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr 
                    key={notification._id} 
                    style={{ backgroundColor: notification.isRead ? '' : '#f8f9fa' }}
                  >
                    <td>
                      <Badge bg={getNotificationBadge(notification.type)}>
                        <i className={`bi ${getNotificationIcon(notification.type)} me-1`}></i>
                        {notification.type}
                      </Badge>
                    </td>
                    <td>{notification.title}</td>
                    <td>{notification.message}</td>
                    <td>
                      {notification.isRead ? (
                        <Badge bg="secondary">Read</Badge>
                      ) : (
                        <Badge bg="primary">Unread</Badge>
                      )}
                    </td>
                    <td>{new Date(notification.createdAt).toLocaleString()}</td>
                    <td>
                      {!notification.isRead && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(notification._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-bell-slash" style={{ fontSize: '3rem', color: '#ccc' }}></i>
              <p className="text-muted mt-3">No notifications yet.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Notifications;
