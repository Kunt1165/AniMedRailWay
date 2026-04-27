const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

const checkPetOwner = async (petId, userId) => {
  const [r] = await db.query('SELECT pet_id FROM Pet WHERE pet_id=? AND user_id=?', [petId, userId]);
  return r.length > 0;
};

// GET diary entries for a pet
router.get('/pet/:petId', auth, async (req, res) => {
  try {
    if (!await checkPetOwner(req.params.petId, req.userId))
      return res.status(403).json({ error: 'Access denied' });

    const [entries] = await db.query(
      'SELECT * FROM DiaryEntry WHERE pet_id=? ORDER BY date DESC, created_at DESC',
      [req.params.petId]
    );
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create entry
router.post('/', auth, async (req, res) => {
  try {
    const { pet_id, date, note, symptoms, mood } = req.body;
    if (!await checkPetOwner(pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });

    const [result] = await db.query(
      'INSERT INTO DiaryEntry (pet_id, date, note, symptoms, mood) VALUES (?,?,?,?,?)',
      [pet_id, date, note, symptoms || null, mood || 'good']
    );
    const [rows] = await db.query('SELECT * FROM DiaryEntry WHERE entry_id=?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update entry
router.put('/:id', auth, async (req, res) => {
  try {
    const [entry] = await db.query('SELECT * FROM DiaryEntry WHERE entry_id=?', [req.params.id]);
    if (entry.length === 0) return res.status(404).json({ error: 'Not found' });
    if (!await checkPetOwner(entry[0].pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });

    const { date, note, symptoms, mood } = req.body;
    await db.query(
      'UPDATE DiaryEntry SET date=?, note=?, symptoms=?, mood=? WHERE entry_id=?',
      [date, note, symptoms || null, mood || 'good', req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM DiaryEntry WHERE entry_id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const [entry] = await db.query('SELECT * FROM DiaryEntry WHERE entry_id=?', [req.params.id]);
    if (entry.length === 0) return res.status(404).json({ error: 'Not found' });
    if (!await checkPetOwner(entry[0].pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });

    await db.query('DELETE FROM DiaryEntry WHERE entry_id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
