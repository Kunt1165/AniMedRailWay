import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { uk } from 'date-fns/locale';

const typeEmoji = { vaccination: '💉', checkup: '🩺', medication: '💊', grooming: '✂️', other: '📌' };
const typeLabel = { vaccination: 'Вакцинація', checkup: 'Огляд', medication: 'Ліки', grooming: 'Грумінг', other: 'Інше' };
const typeColor = { vaccination: '#E8F7F5', checkup: '#D4EDD9', medication: '#FDE8FF', grooming: '#FEE9E2', other: '#F5EFE6' };

const emptyForm = (petId = '', date = '') => ({
  pet_id: petId,
  title: '',
  date,
  time: '',
  type: 'checkup',
  notes: ''
});

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents]           = useState([]);
  const [pets, setPets]               = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState(emptyForm());
  const [saving, setSaving]           = useState(false);

  const load = useCallback(async () => {
    try {
      const [eRes, pRes] = await Promise.all([api.get('/events'), api.get('/pets')]);
      setEvents(eRes.data);
      setPets(pRes.data);
      // Встановлюємо першу тварину як дефолтну, якщо ще не обрана
      if (pRes.data.length > 0) {
        setForm(prev => ({
          ...prev,
          pet_id: prev.pet_id || String(pRes.data[0].pet_id)
        }));
      }
    } catch {
      toast.error('Помилка завантаження');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Будуємо сітку календаря
  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(currentDate);
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd     = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days       = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = day =>
    events.filter(e => {
      if (!e.date) return false;
      return isSameDay(new Date(e.date + 'T00:00:00'), day);
    });

  // Відкрити модалку з попередньо заповненою датою
  const openAdd = day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    setForm(prev => ({
      ...emptyForm(prev.pet_id || String(pets[0]?.pet_id || ''), dateStr)
    }));
    setSelectedDay(day);
    setShowModal(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!form.pet_id) {
      toast.error('Оберіть тварину');
      return;
    }
    if (!form.title.trim()) {
      toast.error('Введіть назву події');
      return;
    }
    if (!form.date) {
      toast.error('Оберіть дату');
      return;
    }

    setSaving(true);
    try {
      await api.post('/events', {
        pet_id: Number(form.pet_id),   // ← конвертуємо в число
        title:  form.title.trim(),
        date:   form.date,
        time:   form.time   || null,
        type:   form.type,
        notes:  form.notes.trim() || null
      });
      toast.success('Подію додано!');
      setShowModal(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || 'Помилка збереження';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async ev => {
    try {
      await api.patch(`/events/${ev.event_id}/complete`);
      load();
    } catch {
      toast.error('Помилка');
    }
  };

  const deleteEvent = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/events/${id}`);
      toast.success('Видалено');
      load();
    } catch {
      toast.error('Помилка видалення');
    }
  };

  // Події для правої панелі
  const dayEvents = selectedDay
    ? getEventsForDay(selectedDay)
    : events
        .filter(e => e.date && !isNaN(new Date(e.date + 'T00:00:00').getTime()) && isSameMonth(new Date(e.date + 'T00:00:00'), currentDate))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Календар</h1>
          <p>Плануйте ветеринарні візити та процедури</p>
        </div>
        <button className="btn btn-primary" onClick={() => openAdd(new Date())}>
          + Додати подію
        </button>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

          {/* ── Сітка календаря ── */}
          <div className="card fade-up">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}>←</button>
              <h2 style={{ fontSize: 20 }}>{format(currentDate, 'LLLL yyyy', { locale: uk })}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}>→</button>
            </div>

            <div style={{ padding: 16 }}>
              {/* Заголовки днів тижня */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--warm-grey)', padding: '4px 0' }}>{d}</div>
                ))}
              </div>

              {/* Клітинки днів */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {days.map(day => {
                  const dayEvs    = getEventsForDay(day);
                  const isSelected = selectedDay && isSameDay(day, selectedDay);
                  const inMonth   = isSameMonth(day, currentDate);
                  return (
                    <div
                      key={day.toString()}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      style={{
                        minHeight: 70,
                        padding: '6px 8px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        background: isSelected ? 'var(--mint-light)' : isToday(day) ? '#E8F7F5' : 'transparent',
                        border: isSelected
                          ? '1.5px solid var(--mint)'
                          : isToday(day)
                            ? '1.5px solid rgba(61,187,171,0.4)'
                            : '1.5px solid transparent',
                        opacity: inMonth ? 1 : 0.3,
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{
                        fontSize: 13,
                        fontWeight: isToday(day) ? 700 : 400,
                        color: isToday(day) ? 'var(--mint-dark)' : 'var(--charcoal)',
                        marginBottom: 4
                      }}>
                        {format(day, 'd')}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {dayEvs.slice(0, 2).map(ev => (
                          <div key={ev.event_id} style={{
                            fontSize: 10,
                            padding: '2px 5px',
                            borderRadius: 4,
                            background: typeColor[ev.type] || '#F5F5F5',
                            color: 'var(--charcoal)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            opacity: ev.completed ? 0.5 : 1
                          }}>
                            {typeEmoji[ev.type]} {ev.title}
                          </div>
                        ))}
                        {dayEvs.length > 2 && (
                          <div style={{ fontSize: 10, color: 'var(--warm-grey)' }}>+{dayEvs.length - 2}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Бічна панель подій ── */}
          <div className="card fade-up" style={{ height: 'fit-content' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 16 }}>
                {selectedDay
                  ? format(selectedDay, 'd MMMM', { locale: uk })
                  : format(currentDate, 'LLLL', { locale: uk })}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--warm-grey)' }}>{dayEvents.length} подій</p>
            </div>

            <div style={{ padding: '8px 0', maxHeight: 500, overflowY: 'auto' }}>
              {dayEvents.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--warm-grey)', fontSize: 14 }}>
                  {selectedDay ? 'Немає подій в цей день' : 'Немає подій в цьому місяці'}
                </div>
              ) : dayEvents.map(ev => (
                <div key={ev.event_id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', opacity: ev.completed ? 0.55 : 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{typeEmoji[ev.type]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, textDecoration: ev.completed ? 'line-through' : 'none' }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--warm-grey)' }}>
                        {ev.pet_name}{ev.time ? ` · ${ev.time.slice(0, 5)}` : ''}
                      </div>
                      {ev.notes && (
                        <div style={{ fontSize: 12, color: 'var(--warm-grey)', marginTop: 2 }}>{ev.notes}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button
                        onClick={() => toggleComplete(ev)}
                        title={ev.completed ? 'Скасувати' : 'Виконано'}
                        style={{ background: ev.completed ? 'var(--soft-green)' : 'var(--sand)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 12 }}
                      >
                        {ev.completed ? '✓' : '○'}
                      </button>
                      <button
                        onClick={e => deleteEvent(ev.event_id, e)}
                        style={{ background: '#FEE2E2', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 12 }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedDay && (
              <div style={{ padding: 12 }}>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => openAdd(selectedDay)}
                >
                  + Додати на {format(selectedDay, 'd MMM', { locale: uk })}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Модальне вікно додавання події ── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Нова подія</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form className="modal-body" onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Тварина *</label>
                {pets.length === 0 ? (
                  <p style={{ color: 'var(--warm-grey)', fontSize: 13 }}>Спочатку додайте тварину в розділі «Мої тварини»</p>
                ) : (
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
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Назва події *</label>
                <input
                  className="form-control"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Вакцинація від сказу, плановий огляд..."
                  required
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
                <label className="form-label">Тип події</label>
                <select
                  className="form-control"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  {Object.entries(typeLabel).map(([k, v]) => (
                    <option key={k} value={k}>{typeEmoji[k]} {v}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Нотатки</label>
                <textarea
                  className="form-control"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Адреса клініки, ім'я лікаря, додаткова інформація..."
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