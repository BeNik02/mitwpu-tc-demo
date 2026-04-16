const express = require('express');
const supabase = require('../supabaseClient');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Department approves or rejects
router.patch('/:id', auth, async (req, res) => {
  if (req.user.role !== 'department') return res.status(403).json({ error: 'Forbidden' });

  const { status, remarks } = req.body;
  const { id } = req.params;

  const { data, error } = await supabase
    .from('approvals')
    .update({ status, remarks, actioned_at: new Date().toISOString() })
    .eq('id', id)
    .eq('department', req.user.department)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Check if all 4 departments approved → update application status
  const { data: allApprovals } = await supabase
    .from('approvals')
    .select('status')
    .eq('application_id', data.application_id);

  const allApproved = allApprovals.every(a => a.status === 'approved');
  if (allApproved) {
    await supabase
      .from('applications')
      .update({ status: 'all_cleared' })
      .eq('id', data.application_id);
  }

  res.json({ approval: data });
});

module.exports = router;