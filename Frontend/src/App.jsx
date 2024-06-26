import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Container, Row, Col, Form, Button, Table, Pagination } from 'react-bootstrap';
import { BACKEND_URL } from './utils/constant.js';

const App = () => {
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState({ name: '', age: '', class: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editId, setEditId] = useState(null);


  const fetchStudents = async (page) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/students?page=${page}&limit=4`);
      setStudents(response.data.students);
      setTotalPages(Math.ceil(response.data.metadata.total / 4));
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchStudents(page);
  }, [page]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent({ ...student, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${BACKEND_URL}/students/${editId}`, student);
        Swal.fire('Updated!', 'Student updated successfully', 'success');
      } else {
        await axios.post('/students', student);
        Swal.fire('Created!', 'Student created successfully', 'success');
      }
      setStudent({ name: '', age: '', class: '' });
      setEditId(null);
      fetchStudents(page);
    } catch (error) {
      Swal.fire('Error!', 'There was an error processing your request', 'error');
    }
  };

  const handleEdit = (student) => {
    setStudent({ name: student.name, age: student.age, class: student.class });
    setEditId(student.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/students/${id}`);
      Swal.fire('Deleted!', 'Student deleted successfully', 'success');
      fetchStudents(page);
    } catch (error) {
      Swal.fire('Error!', 'There was an error processing your request', 'error');
    }
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h2>Student Management</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={student.name} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control type="number" name="age" value={student.age} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Class</Form.Label>
              <Form.Control type="text" name="class" value={student.class} onChange={handleChange} required />
            </Form.Group>
            <Button type="submit" className='btn btn-success'>{editId ? 'Update' : 'Create'}</Button>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Class</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.age}</td>
                  <td>{student.class}</td>
                  <td>
                    <Button variant="warning" size='sm' onClick={() => handleEdit(student)} className="me-2">
                      <i className="bi bi-pencil-square"></i> Edit
                    </Button>
                    <Button variant="danger" size='sm' onClick={() => handleDelete(student.id)}>
                      <i className="bi bi-trash"></i> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination>
            <Pagination.Prev onClick={() => page > 1 && handlePageChange(page - 1)} />
            {Array.from({ length: totalPages }, (_, index) => (
              <Pagination.Item key={index + 1} active={index + 1 === page} onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => page < totalPages && handlePageChange(page + 1)} />
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
