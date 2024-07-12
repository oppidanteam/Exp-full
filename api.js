const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Protected route example
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  res.json(req.user);
});

// Google OAuth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, 'secret-key', { expiresIn: '1h' });
    res.redirect(`/dashboard?token=${token}`);
  }
);

// Apple OAuth routes (replace with actual implementation)
router.get('/auth/apple', passport.authenticate('apple', { scope: ['name', 'email'] }));
router.post('/auth/apple/callback', passport.authenticate('apple', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, 'secret-key', { expiresIn: '1h' });
    res.redirect(`/dashboard?token=${token}`);
  }
);

module.exports = router;
