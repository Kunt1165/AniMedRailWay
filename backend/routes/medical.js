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

const formatRecord = r => ({
  ...r,
  date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : r.date,
});

// GET /pet/:petId
router.get('/pet/:petId', auth, async (req, res) => {
  try {
    if (!await checkPetOwner(req.params.petId, req.userId))
      return res.status(403).json({ error: 'Access denied' });

    const [records] = await db.query(
      'SELECT * FROM MedicalRecord WHERE pet_id=? ORDER BY date DESC',
      [req.params.petId]
    );
    res.json(records.map(formatRecord));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /
router.post('/', auth, async (req, res) => {
  try {
    const { pet_id, date, vaccine_name, description, vet_name } = req.body;
    if (!await checkPetOwner(pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });

    const [result] = await db.query(
      'INSERT INTO MedicalRecord (pet_id, date, vaccine_name, description, vet_name) VALUES (?,?,?,?,?)',
      [pet_id, date, vaccine_name || null, description || null, vet_name || null]
    );
    const [rows] = await db.query(
      'SELECT * FROM MedicalRecord WHERE record_id=?',
      [result.insertId]
    );
    res.status(201).json(formatRecord(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id
router.put('/:id', auth, async (req, res) => {
  try {
    const [rec] = await db.query('SELECT * FROM MedicalRecord WHERE record_id=?', [req.params.id]);
    if (rec.length === 0) return res.status(404).json({ error: 'Not found' });
    if (!await checkPetOwner(rec[0].pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });

    const { date, vaccine_name, description, vet_name } = req.body;
    await db.query(
      'UPDATE MedicalRecord SET date=?, vaccine_name=?, description=?, vet_name=? WHERE record_id=?',
      [date, vaccine_name || null, description || null, vet_name || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM MedicalRecord WHERE record_id=?', [req.params.id]);
    res.json(formatRecord(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [rec] = await db.query('SELECT * FROM MedicalRecord WHERE record_id=?', [req.params.id]);
    if (rec.length === 0) return res.status(404).json({ error: 'Not found' });
    if (!await checkPetOwner(rec[0].pet_id, req.userId))
      return res.status(403).json({ error: 'Access denied' });

    await db.query('DELETE FROM MedicalRecord WHERE record_id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;