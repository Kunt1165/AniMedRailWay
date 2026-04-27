const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// GET all pets for current user
router.get('/', auth, async (req, res) => {
  try {
    const [pets] = await db.query(
      'SELECT * FROM Pet WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single pet
router.get('/:id', auth, async (req, res) => {
  try {
    const [pets] = await db.query(
      'SELECT * FROM Pet WHERE pet_id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (pets.length === 0) return res.status(404).json({ error: 'Pet not found' });
    res.json(pets[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create pet
router.post('/', auth, async (req, res) => {
  try {
    const { name, species, breed, age, photo, allergies, microchip } = req.body;
    if (!name || !species)
      return res.status(400).json({ error: 'Name and species are required' });

    const [result] = await db.query(
      'INSERT INTO Pet (user_id, name, species, breed, age, photo, allergies, microchip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.userId, name, species, breed || null, age || null, photo || null, allergies || null, microchip ? 1 : 0]
    );
    const [pets] = await db.query('SELECT * FROM Pet WHERE pet_id = ?', [result.insertId]);
    res.status(201).json(pets[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update pet
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, species, breed, age, photo, allergies, microchip } = req.body;
    const [check] = await db.query(
      'SELECT pet_id FROM Pet WHERE pet_id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (check.length === 0) return res.status(404).json({ error: 'Pet not found' });

    await db.query(
      'UPDATE Pet SET name=?, species=?, breed=?, age=?, photo=?, allergies=?, microchip=? WHERE pet_id=?',
      [name, species, breed || null, age || null, photo || null, allergies || null, microchip ? 1 : 0, req.params.id]
    );
    const [pets] = await db.query('SELECT * FROM Pet WHERE pet_id = ?', [req.params.id]);
    res.json(pets[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE pet
router.delete('/:id', auth, async (req, res) => {
  try {
    const [check] = await db.query(
      'SELECT pet_id FROM Pet WHERE pet_id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (check.length === 0) return res.status(404).json({ error: 'Pet not found' });

    await db.query('DELETE FROM Pet WHERE pet_id = ?', [req.params.id]);
    res.json({ message: 'Pet deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
