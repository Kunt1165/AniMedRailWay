import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { uk } from 'date-fns/locale';

const speciesEmoji = { dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', other: '🐾' };
const moodEmoji = { great: '😄', good: '🙂', ok: '😐', bad: '😟', sick: '🤒' };
const eventTypeLabel = { vaccination: '💉', checkup: '🩺', medication: '💊', grooming: '✂️', other: '📌' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [events, setEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/pets'),
      api.get('/events'),
      api.get('/reminders')
    ]).then(([pRes, eRes, rRes]) => {
      setPets(pRes.data);
      setEvents(eRes.data.filter(e => !e.completed));
      setReminders(rRes.data.filter(r => !r.completed));
    }).finally(() => setLoading(false));
  }, []);

  const upcoming = [...events, ...reminders.map(r => ({ ...r, title: r.medicine_name, type: 'medication', isReminder: true }))]
    .filter(e => e.date && !isNaN(new Date(e.date + 'T00:00:00').getTime()))
    .filter(e => !isPast(new Date(e.date + 'T00:00:00')) || isToday(new Date(e.date + 'T00:00:00')))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  if (loading) return (
    <div style={{ padding: 40, marginLeft: 260 }}>
      <div className="loading"><div className="spinner" /></div>
    </div>
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Доброго ранку';
    if (h < 18) return 'Доброго дня';
    return 'Доброго вечора';
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>{greeting()}, {user?.name?.split(' ')[0]}! 🐾</h1>
          <p>Ось огляд турботи про ваших улюбленців</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/pets/new')}>
          + Додати тварину
        </button>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="grid-3 fade-up" style={{ marginBottom: 28 }}>
          <div className="card card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🐾</div>
            <div style={{ fontSize: 32, fontFamily: 'Fraunces, serif', fontWeight: 900, color: 'var(--mint)' }}>{pets.length}</div>
            <div style={{ color: 'var(--warm-grey)', fontSize: 14 }}>Улюбленців</div>
          </div>
          <div className="card card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📅</div>
            <div style={{ fontSize: 32, fontFamily: 'Fraunces, serif', fontWeight: 900, color: 'var(--mint)' }}>{events.length}</div>
            <div style={{ color: 'var(--warm-grey)', fontSize: 14 }}>Майбутніх подій</div>
          </div>
          <div className="card card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔔</div>
            <div style={{ fontSize: 32, fontFamily: 'Fraunces, serif', fontWeight: 900, color: 'var(--mint)' }}>{reminders.length}</div>
            <div style={{ color: 'var(--warm-grey)', fontSize: 14 }}>Нагадувань</div>
          </div>
        </div>

        <div className="grid-2">
          {/* My Pets */}
          <div className="card fade-up">
            <div className="card-header">
              <h3 style={{ fontSize: 18 }}>Мої улюбленці</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/pets')}>Всі</button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {pets.length === 0 ? (
                <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--warm-grey)' }}>
                  <div style={{ fontSize: 40 }}>🐾</div>
                  <p>Додайте вашого першого улюбленця</p>
                </div>
              ) : pets.map(pet => (
                <div
                  key={pet.pet_id}
                  className="pet-row"
                  onClick={() => navigate(`/pets/${pet.pet_id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', cursor: 'pointer', transition: 'background 0.15s', borderRadius: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--mint-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {speciesEmoji[pet.species]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{pet.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--warm-grey)' }}>{pet.breed} · {pet.age} р.</div>
                  </div>
                  {pet.allergies && <span className="badge badge-orange">⚠ Алергія</span>}
                  {pet.microchip && <span className="badge badge-mint">🔲 Чіп</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="card fade-up">
            <div className="card-header">
              <h3 style={{ fontSize: 18 }}>Найближчі події</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/calendar')}>Календар</button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {upcoming.length === 0 ? (
                <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--warm-grey)' }}>
                  <div style={{ fontSize: 40 }}>✅</div>
                  <p>Немає майбутніх подій</p>
                </div>
              ) : upcoming.map((ev, i) => {
                if (!ev.date) return null;
                const evDate = new Date(ev.date + 'T00:00:00');
                if (isNaN(evDate.getTime())) return null;
                const dateLabel = isToday(evDate) ? 'Сьогодні' : isTomorrow(evDate) ? 'Завтра' : format(evDate, 'd MMM', { locale: uk });
                const isOverdue = isPast(evDate) && !isToday(evDate);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: isOverdue ? '#FEE2E2' : 'var(--mint-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {eventTypeLabel[ev.type] || '📌'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{ev.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--warm-grey)' }}>{ev.pet_name} · {ev.time ? ev.time.slice(0, 5) : ''}</div>
                    </div>
                    <span className={`badge ${isOverdue ? 'badge-red' : isToday(evDate) ? 'badge-orange' : 'badge-mint'}`}>
                      {dateLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}