const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db.js');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
    origin:  process.env.FRONTEND_URL,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use(bodyParser.json());

app.post('/students', async (req, res) => {
    try {
        const { name, age, class: studentClass } = req.body;

 
        if (!name || !age || !studentClass) {
            return res.status(400).json({ message: 'Name, age, and class are required fields' });
        }

     
        const query = 'INSERT INTO students(name, age, class) VALUES($1, $2, $3) RETURNING *';
        const values = [name, age, studentClass];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]); 
    } catch (error) {
        console.error('Error inserting student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/students', async (req, res) => {
    const { page = 1, limit = 4 } = req.query;
    const offset = (page - 1) * limit;
    try {
        const result = await pool.query('SELECT * FROM students LIMIT $1 OFFSET $2', [limit, offset]);
        const totalResult = await pool.query('SELECT COUNT(*) FROM students');
        const total = parseInt(totalResult.rows[0].count, 10);
        res.json({ students: result.rows, metadata: { total, page: parseInt(page), limit: parseInt(limit) } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
        const marksResult = await pool.query('SELECT * FROM marks WHERE student_id = $1', [id]);
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const student = studentResult.rows[0];
        student.marks = marksResult.rows;
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { name, age, class: studentClass } = req.body;
    try {
        const result = await pool.query(
            'UPDATE students SET name = $1, age = $2, class = $3 WHERE id = $4 RETURNING *',
            [name, age, studentClass, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
