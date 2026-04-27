const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../config/db');
const QRCode = require('qrcode');

// GET QR for pet
router.get('/pet/:petId', auth, async (req, res) => {
  try {
    const [pets] = await db.query(
      'SELECT p.*, u.name as owner_name, u.phone as owner_phone FROM Pet p JOIN User u ON p.user_id=u.user_id WHERE p.pet_id=? AND p.user_id=?',
      [req.params.petId, req.userId]
    );
    if (pets.length === 0) return res.status(404).json({ error: 'Pet not found' });

    const pet = pets[0];
    const qrData = JSON.stringify({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      owner: pet.owner_name,
      phone: pet.owner_phone,
      microchip: pet.microchip,
      allergies: pet.allergies
    });

    // Upsert QR record
    const [existing] = await db.query('SELECT qr_id FROM QR_Code WHERE pet_id=?', [req.params.petId]);
    if (existing.length > 0) {
      await db.query('UPDATE QR_Code SET qr_data=? WHERE pet_id=?', [qrData, req.params.petId]);
    } else {
      await db.query('INSERT INTO QR_Code (pet_id, qr_data) VALUES (?,?)', [req.params.petId, qrData]);
    }

    // Generate QR image as base64
    const qrImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#1E2832', light: '#FFFFFF' }
    });

    res.json({
      qr_image: qrImage,
      qr_data: JSON.parse(qrData),
      pet
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
