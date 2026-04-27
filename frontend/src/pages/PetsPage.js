import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const speciesEmoji = { dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', other: '🐾' };
const speciesLabel = { dog: 'Собака', cat: 'Кіт', bird: 'Птах', rabbit: 'Кролик', other: 'Інше' };

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPet, setEditPet] = useState(null);
  const [form, setForm] = useState({ name: '', species: 'dog', breed: '', age: '', allergies: '', microchip: false });
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.get('/pets').then(r => setPets(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditPet(null);
    setForm({ name: '', species: 'dog', breed: '', age: '', allergies: '', microchip: false });
    setShowModal(true);
  };

  const openEdit = (pet, e) => {
    e.stopPropagation();
    setEditPet(pet);
    setForm({ name: pet.name, species: pet.species, breed: pet.breed || '', age: pet.age || '', allergies: pet.allergies || '', microchip: !!pet.microchip });
    setShowModal(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    try {
      if (editPet) {
        await api.put(`/pets/${editPet.pet_id}`, form);
        toast.success('Дані оновлено!');
      } else {
        await api.post('/pets', form);
        toast.success('Улюбленця додано!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Помилка');
    }
  };

  const handleDelete = async (pet, e) => {
    e.stopPropagation();
    if (!window.confirm(`Видалити ${pet.name}?`)) return;
    try {
      await api.delete(`/pets/${pet.pet_id}`);
      toast.success('Видалено');
      load();
    } catch {
      toast.error('Помилка');
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Мої улюбленці</h1>
          <p>Управляйте профілями ваших тварин</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Додати тварину</button>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : pets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🐾</div>
            <h3>Ще немає тварин</h3>
            <p>Додайте вашого першого улюбленця!</p>
            <button className="btn btn-primary" onClick={openAdd}>Додати тварину</button>
          </div>
        ) : (
          <div className="grid-3">
            {pets.map(pet => (
              <div key={pet.pet_id} className="card fade-up" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => navigate(`/pets/${pet.pet_id}`)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(30,40,50,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ padding: '28px 24px 20px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--mint-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 16px' }}>
                    {speciesEmoji[pet.species]}
                  </div>
                  <h3 style={{ fontSize: 20, marginBottom: 4 }}>{pet.name}</h3>
                  <p style={{ color: 'var(--warm-grey)', fontSize: 14 }}>{speciesLabel[pet.species]} · {pet.breed}</p>
                </div>

                <div style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--warm-grey)', marginBottom: 2 }}>ВІК</div>
                      <div style={{ fontWeight: 700 }}>{pet.age} р.</div>
                    </div>
                    <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--warm-grey)', marginBottom: 2 }}>ЧІП</div>
                      <div style={{ fontWeight: 700 }}>{pet.microchip ? '✅ Так' : '❌ Ні'}</div>
                    </div>
                  </div>

                  {pet.allergies && (
                    <div style={{ marginBottom: 12 }}>
                      <span className="badge badge-orange">⚠ {pet.allergies}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={e => openEdit(pet, e)}>✏️ Редагувати</button>
                    <button className="btn btn-danger btn-sm" onClick={e => handleDelete(pet, e)}>🗑️</button>
                  </div>
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
              <h2>{editPet ? `Редагувати ${editPet.name}` : 'Нова тварина'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleSave}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Ім'я *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Барсик" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Вид *</label>
                  <select className="form-control" value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))}>
                    <option value="dog">🐕 Собака</option>
                    <option value="cat">🐈 Кіт</option>
                    <option value="bird">🦜 Птах</option>
                    <option value="rabbit">🐇 Кролик</option>
                    <option value="other">🐾 Інше</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Порода</label>
                  <input className="form-control" value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder="Лабрадор" />
                </div>
                <div className="form-group">
                  <label className="form-label">Вік (роки)</label>
                  <input className="form-control" type="number" step="0.5" min="0" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="3" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Алергії</label>
                <input className="form-control" value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} placeholder="Курятина, пилок..." />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="microchip" checked={form.microchip} onChange={e => setForm(f => ({ ...f, microchip: e.target.checked }))} style={{ width: 18, height: 18 }} />
                <label htmlFor="microchip" style={{ cursor: 'pointer', fontWeight: 500 }}>🔲 Є мікрочіп</label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" type="button" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Скасувати</button>
                <button className="btn btn-primary" type="submit" style={{ flex: 1, justifyContent: 'center' }}>
                  {editPet ? 'Зберегти' : 'Додати'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
