const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../config/db');

const checkPetOwner = async (petId, userId) => {
  const [r] = await db.query(
    'SELECT pet_id FROM Pet WHERE pet_id=? AND user_id=?',
    [petId, userId]
  );
  return r.length > 0;
};

// GET / — всі події користувача
router.get('/', auth, async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT e.*, p.name as pet_name, p.species as pet_species
       FROM Event e
       JOIN Pet p ON e.pet_id = p.pet_id
       WHERE p.user_id = ?
       ORDER BY e.date ASC, e.time ASC`,
      [req.userId]
    );
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /pet/:petId
router.get('/pet/:petId', auth, async (req, res) => {
  try {
    if (!await checkPetOwner(req.params.petId, req.userId))
      return res.status(403).json({ error: 'Access denied' });
    const [events] = await db.query(
      'SELECT * FROM Event WHERE pet_id=? ORDER BY date ASC, time ASC',
      [req.params.petId]
    );
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /
router.post('/', auth, async (req, res) => {
  try {
    const { pet_id, title, date, time, type, notes } = req.body;
    if (!pet_id || !title || !date)
      return res.status(400).json({ error: 'pet_id, title and date are required' });
    if (!await checkPetOwner(pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });

    const [result] = await db.query(
      'INSERT INTO Event (pet_id, title, date, time, type, notes) VALUES (?,?,?,?,?,?)',
      [pet_id, title, date, time || null, type || 'other', notes || null]
    );
    const [rows] = await db.query(
      `SELECT e.*, p.name as pet_name, p.species as pet_species
       FROM Event e JOIN Pet p ON e.pet_id = p.pet_id
       WHERE e.event_id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /:id/complete
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const [ev] = await db.query('SELECT * FROM Event WHERE event_id=?', [req.params.id]);
    if (ev.length === 0) return res.status(404).json({ error: 'Not found' });
    if (!await checkPetOwner(ev[0].pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });
    const newStatus = !ev[0].completed;
    await db.query('UPDATE Event SET completed=? WHERE event_id=?', [newStatus, req.params.id]);
    res.json({ completed: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id
router.put('/:id', auth, async (req, res) => {
  try {
    const [ev] = await db.query('SELECT * FROM Event WHERE event_id=?', [req.params.id]);
    if (ev.length === 0) return res.status(404).json({ error: 'Not found' });
    if (!await checkPetOwner(ev[0].pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });
    const { title, date, time, type, notes, completed } = req.body;
    await db.query(
      'UPDATE Event SET title=?, date=?, time=?, type=?, notes=?, completed=? WHERE event_id=?',
      [title, date, time || null, type, notes || null, completed ? 1 : 0, req.params.id]
    );
    const [rows] = await db.query(
      `SELECT e.*, p.name as pet_name FROM Event e
       JOIN Pet p ON e.pet_id=p.pet_id WHERE e.event_id=?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [ev] = await db.query('SELECT * FROM Event WHERE event_id=?', [req.params.id]);
    if (ev.length === 0) return res.status(404).json({ error: 'Not found' });
    if (!await checkPetOwner(ev[0].pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });
    await db.query('DELETE FROM Event WHERE event_id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;