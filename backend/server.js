const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const applicationRoutes = require('./src/routes/applications');
const approvalRoutes = require('./src/routes/approvals');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/approvals', approvalRoutes);

app.get('/', (req, res) => res.json({ status: 'MIT-WPU TC API running' }));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));