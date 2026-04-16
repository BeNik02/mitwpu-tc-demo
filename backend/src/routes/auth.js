const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../supabaseClient');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, department: user.department, display_name: user.display_name },
    'mitwpu_demo_secret_2024',
    { expiresIn: '24h' }
  );

  res.json({ token, user: { id: user.id, username: user.username, role: user.role, department: user.department, display_name: user.display_name } });
});

module.exports = router;