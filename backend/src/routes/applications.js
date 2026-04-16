const express = require('express');
const supabase = require('../supabaseClient');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Student submits new application
router.post('/', auth, async (req, res) => {
  const { student_name, prn, program, reason } = req.body;

  const { data: application, error } = await supabase
    .from('applications')
    .insert([{ student_id: req.user.id, student_name, prn, program, reason, status: 'submitted' }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Create pending approval rows for all 4 departments
  const departments = ['Accounts', 'Library', 'Sports Dept', 'Program Office'];
  const approvalRows = departments.map(dept => ({
    application_id: application.id,
    department: dept,
    status: 'pending'
  }));

  await supabase.from('approvals').insert(approvalRows);

  res.json({ application });
});

// Get student's own applications with approval status
router.get('/my', auth, async (req, res) => {
  const { data: applications, error } = await supabase
    .from('applications')
    .select('*, approvals(*)')
    .eq('student_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ applications });
});

// Department gets all applications assigned to them
router.get('/department', auth, async (req, res) => {
  if (req.user.role !== 'department') return res.status(403).json({ error: 'Forbidden' });

  const { data: approvals, error } = await supabase
    .from('approvals')
    .select('*, applications(*)')
    .eq('department', req.user.department)
    .order('id', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ approvals });
});

module.exports = router;