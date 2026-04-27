import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { uk } from 'date-fns/locale';

// ── Утиліти для роботи з датами як рядками 'yyyy-MM-dd' ──────────────────────
// Жодних Date-об'єктів і timezone — порівнюємо рядки напряму.

// Сьогодні у форматі 'yyyy-MM-dd' за ЛОКАЛЬНИМ часом браузера
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Завтра у форматі 'yyyy-MM-dd'
const tomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Красивий вивід дати для бейджа
const formatDateLabel = dateStr => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['січ', 'лют', 'бер', 'квіт', 'трав', 'черв',
                  'лип', 'серп', 'вер', 'жовт', 'лист', 'груд'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
};

// Статус нагадування на основі порівняння рядків
const getUrgency = r => {
  if (r.completed) return { label: '✅ Виконано',      cls: 'badge-green' };
  if (!r.date)     return { label: '📅 Без дати',       cls: 'badge-grey' };
  const today    = todayStr();
  const tomorrow = tomorrowStr();
  if (r.date < today)    return { label: '⚠️ Прострочено', cls: 'badge-red' };
  if (r.date === today)  return { label: '🔔 Сьогодні',    cls: 'badge-orange' };
  if (r.date === tomorrow) return { label: '📅 Завтра',    cls: 'badge-mint' };
  return { label: `📅 ${formatDateLabel(r.date)}`,         cls: 'badge-grey' };
};

// ─────────────────────────────────────────────────────────────────────────────

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [pets, setPets]           = useState([]);
  const [filter, setFilter]       = useState('upcoming');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm] = useState({
    pet_id: '', medicine_name: '', dosage: '', date: '', time: '', notes: ''
  });

  const load = async () => {
    try {
      const [rRes, pRes] = await Promise.all([
        api.get('/reminders'),
        api.get('/pets'),
      ]);
      setReminders(rRes.data);
      setPets(pRes.data);
      if (pRes.data.length > 0) {
        setForm(f => ({ ...f, pet_id: f.pet_id || String(pRes.data[0].pet_id) }));
      }
    } catch {
      toast.error('Помилка завантаження');
    }
  };

  useEffect(() => { load(); }, []);

  // Фільтрація — тільки рядкове порівняння дат
  const filtered = reminders.filter(r => {
    if (filter === 'completed') return r.completed;
    if (filter === 'upcoming') {
      if (r.completed) return false;
      if (!r.date) return true;              // без дати — показуємо
      return r.date >= todayStr();           // сьогодні і пізніше
    }
    return true;
  });

  const toggle = async r => {
    try {
      await api.patch(`/reminders/${r.reminder_id}/complete`);
      toast.success(r.completed ? 'Позначено як незавершене' : 'Виконано! ✅');
      load();
    } catch { toast.error('Помилка'); }
  };

  const del = async id => {
    try {
      await api.delete(`/reminders/${id}`);
      toast.success('Видалено');
      load();
    } catch { toast.error('Помилка видалення'); }
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/reminders', {
        pet_id:        Number(form.pet_id),
        medicine_name: form.medicine_name,
        dosage:        form.dosage || null,
        date:          form.date,
        time:          form.time   || null,
        notes:         form.notes  || null,
      });
      toast.success('Нагадування додано!');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Нагадування</h1>
          <p>Ліки та важливі процедури для ваших тварин</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Нагадування
        </button>
      </div>

      <div className="page-content">
        {/* Фільтри */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--sand)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
          {[
            ['upcoming',  '🔔 Майбутні'],
            ['all',       '📋 Всі'],
            ['completed', '✅ Виконані'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '8px 16px', border: 'none', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
                background: filter === key ? 'white' : 'none',
                color:      filter === key ? 'var(--charcoal)' : 'var(--warm-grey)',
                boxShadow:  filter === key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>Немає нагадувань</h3>
            <p>Додайте нагадування про ліки або процедури</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Додати нагадування
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(r => {
              const urgency = getUrgency(r);
              return (
                <div
                  key={r.reminder_id}
                  className="card card-body fade-up"
                  style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: r.completed ? 0.7 : 1 }}
                >
                  <button
                    onClick={() => toggle(r)}
                    title={r.completed ? 'Скасувати' : 'Позначити виконаним'}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', border: '2px solid',
                      borderColor: r.completed ? '#22c55e' : 'var(--border)',
                      background:  r.completed ? 'var(--soft-green)' : 'white',
                      cursor: 'pointer', fontSize: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 0.2s',
                    }}
                  >
                    {r.completed ? '✓' : ''}
                  </button>

                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'var(--mint-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>
                    💊
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600, fontSize: 15,
                      textDecoration: r.completed ? 'line-through' : 'none',
                      marginBottom: 2,
                    }}>
                      {r.medicine_name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--warm-grey)' }}>
                      {r.pet_name}
                      {r.dosage && ` · ${r.dosage}`}
                      {r.time   && ` · ${String(r.time).slice(0, 5)}`}
                    </div>
                    {r.notes && (
                      <div style={{ fontSize: 13, color: 'var(--warm-grey)', marginTop: 2 }}>
                        {r.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                    <span className={`badge ${urgency.cls}`}>{urgency.label}</span>
                    <button onClick={() => del(r.reminder_id)} className="btn btn-danger btn-sm">
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Нове нагадування</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Тварина *</label>
                <select
                  className="form-control"
                  value={form.pet_id}
                  onChange={e => setForm(f => ({ ...f, pet_id: e.target.value }))}
                  required
                >
                  <option value="">— Оберіть тварину —</option>
                  {pets.map(p => (
                    <option key={p.pet_id} value={String(p.pet_id)}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Назва препарату *</label>
                <input
                  className="form-control"
                  value={form.medicine_name}
                  onChange={e => setForm(f => ({ ...f, medicine_name: e.target.value }))}
                  placeholder="Дронтал, Омега-3..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Дозування</label>
                <input
                  className="form-control"
                  value={form.dosage}
                  onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                  placeholder="1 таблетка, 2 краплі..."
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Дата *</label>
                  <input
                    className="form-control"
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Час</label>
                  <input
                    className="form-control"
                    type="time"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Нотатки</label>
                <textarea
                  className="form-control"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Давати з їжею, особливі інструкції..."
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={saving || !form.pet_id}
                >
                  {saving ? 'Збереження...' : 'Зберегти'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}