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

// GET /
router.get('/', auth, async (req, res) => {
  try {
    const [reminders] = await db.query(
      `SELECT r.*, p.name as pet_name, p.species as pet_species
       FROM Reminder r
       JOIN Pet p ON r.pet_id = p.pet_id
       WHERE p.user_id = ?
       ORDER BY r.date ASC, r.time ASC`,
      [req.userId]
    );
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /pet/:petId
router.get('/pet/:petId', auth, async (req, res) => {
  try {
    if (!await checkPetOwner(req.params.petId, req.userId))
      return res.status(403).json({ error: 'Access denied' });
    const [reminders] = await db.query(
      'SELECT * FROM Reminder WHERE pet_id=? ORDER BY date ASC',
      [req.params.petId]
    );
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /
router.post('/', auth, async (req, res) => {
  try {
    const { pet_id, medicine_name, dosage, date, time, notes } = req.body;
    if (!await checkPetOwner(pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });
    const [result] = await db.query(
      'INSERT INTO Reminder (pet_id, medicine_name, dosage, date, time, notes) VALUES (?,?,?,?,?,?)',
      [pet_id, medicine_name, dosage || null, date, time || null, notes || null]
    );
    const [rows] = await db.query(
      `SELECT r.*, p.name as pet_name, p.species as pet_species
       FROM Reminder r JOIN Pet p ON r.pet_id=p.pet_id
       WHERE r.reminder_id=?`,
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
    const [rem] = await db.query('SELECT * FROM Reminder WHERE reminder_id=?', [req.params.id]);
    if (rem.length === 0) return res.status(404).json({ error: 'Not found' });
    if (!await checkPetOwner(rem[0].pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });
    const newStatus = !rem[0].completed;
    await db.query('UPDATE Reminder SET completed=? WHERE reminder_id=?', [newStatus, req.params.id]);
    res.json({ completed: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id
router.put('/:id', auth, async (req, res) => {
  try {
    const [rem] = await db.query('SELECT * FROM Reminder WHERE reminder_id=?', [req.params.id]);
    if (rem.length === 0) return res.status(404).json({ error: 'Not found' });
    if (!await checkPetOwner(rem[0].pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });
    const { medicine_name, dosage, date, time, notes } = req.body;
    await db.query(
      'UPDATE Reminder SET medicine_name=?, dosage=?, date=?, time=?, notes=? WHERE reminder_id=?',
      [medicine_name, dosage || null, date, time || null, notes || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM Reminder WHERE reminder_id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [rem] = await db.query('SELECT * FROM Reminder WHERE reminder_id=?', [req.params.id]);
    if (rem.length === 0) return res.status(404).json({ error: 'Not found' });
    if (!await checkPetOwner(rem[0].pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });
    await db.query('DELETE FROM Reminder WHERE reminder_id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;