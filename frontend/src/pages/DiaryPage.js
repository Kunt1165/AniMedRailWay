import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const moodEmoji = { great: '😄', good: '🙂', ok: '😐', bad: '😟', sick: '🤒' };
const moodLabel = { great: 'Відмінно', good: 'Добре', ok: 'Нормально', bad: 'Погано', sick: 'Хворий' };

export default function DiaryPage() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), note: '', symptoms: '', mood: 'good' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/pets').then(r => {
      setPets(r.data);
      if (r.data.length > 0) setSelectedPet(r.data[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedPet) return;
    setLoading(true);
    api.get(`/diary/pet/${selectedPet.pet_id}`)
      .then(r => setEntries(r.data))
      .finally(() => setLoading(false));
  }, [selectedPet]);

  const handleSave = async e => {
    e.preventDefault();
    try {
      await api.post('/diary', { pet_id: selectedPet.pet_id, ...form });
      toast.success('Запис додано!');
      setShowModal(false);
      const r = await api.get(`/diary/pet/${selectedPet.pet_id}`);
      setEntries(r.data);
    } catch { toast.error('Помилка'); }
  };

  const del = async id => {
    await api.delete(`/diary/${id}`);
    setEntries(e => e.filter(x => x.entry_id !== id));
    toast.success('Видалено');
  };

  const speciesEmoji = { dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', other: '🐾' };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Щоденник здоров'я</h1>
          <p>Спостерігайте за станом ваших улюбленців</p>
        </div>
        {selectedPet && (
          <button className="btn btn-primary" onClick={() => { setForm({ date: format(new Date(), 'yyyy-MM-dd'), note: '', symptoms: '', mood: 'good' }); setShowModal(true); }}>
            + Новий запис
          </button>
        )}
      </div>

      <div className="page-content">
        {/* Pet selector */}
        {pets.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {pets.map(pet => (
              <button key={pet.pet_id} onClick={() => setSelectedPet(pet)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px',
                border: '1.5px solid', borderRadius: 50,
                borderColor: selectedPet?.pet_id === pet.pet_id ? 'var(--mint)' : 'var(--border)',
                background: selectedPet?.pet_id === pet.pet_id ? 'var(--mint-light)' : 'white',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
                color: selectedPet?.pet_id === pet.pet_id ? 'var(--mint-dark)' : 'var(--charcoal)',
                transition: 'all 0.2s'
              }}>
                <span>{speciesEmoji[pet.species]}</span>
                {pet.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : !selectedPet ? (
          <div className="empty-state">
            <div className="empty-icon">🐾</div>
            <h3>Додайте спочатку тварину</h3>
          </div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📓</div>
            <h3>Щоденник {selectedPet.name} порожній</h3>
            <p>Фіксуйте стан, поведінку та самопочуття щодня</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Перший запис</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {entries.map(entry => (
              <div key={entry.entry_id} className="card fade-up">
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--mint-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                        {moodEmoji[entry.mood]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{moodLabel[entry.mood]}</div>
                        <div style={{ fontSize: 13, color: 'var(--warm-grey)' }}>
                          {format(new Date(entry.date), 'EEEE, d MMMM yyyy', { locale: uk })}
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => del(entry.entry_id)}>🗑️</button>
                  </div>

                  <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: entry.symptoms ? 12 : 0 }}>{entry.note}</p>

                  {entry.symptoms && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 14px', background: '#FEE9E2', borderRadius: 10 }}>
                      <span style={{ fontSize: 16 }}>⚠️</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#C14D2A', marginBottom: 2 }}>СИМПТОМИ</div>
                        <div style={{ fontSize: 14, color: '#C14D2A' }}>{entry.symptoms}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Запис для {selectedPet?.name}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleSave}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Дата *</label>
                  <input className="form-control" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Настрій</label>
                  <select className="form-control" value={form.mood} onChange={e => setForm(f => ({ ...f, mood: e.target.value }))}>
                    <option value="great">😄 Відмінно</option>
                    <option value="good">🙂 Добре</option>
                    <option value="ok">😐 Нормально</option>
                    <option value="bad">😟 Погано</option>
                    <option value="sick">🤒 Хворий</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Нотатка *</label>
                <textarea className="form-control" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Як пройшов день? Апетит, активність, поведінка..." required rows={4} />
              </div>
              <div className="form-group">
                <label className="form-label">Симптоми (необов'язково)</label>
                <input className="form-control" value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} placeholder="Чхання, кашель, відмова від їжі..." />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Скасувати</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Зберегти</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
