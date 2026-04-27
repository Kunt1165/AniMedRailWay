import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const speciesEmoji = { dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', other: '🐾' };
const moodEmoji = { great: '😄', good: '🙂', ok: '😐', bad: '😟', sick: '🤒' };
const moodLabel = { great: 'Відмінно', good: 'Добре', ok: 'Нормально', bad: 'Погано', sick: 'Хворий' };

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [tab, setTab] = useState('medical');
  const [medical, setMedical] = useState([]);
  const [diary, setDiary] = useState([]);
  const [qr, setQr] = useState(null);
  const [showMedModal, setShowMedModal] = useState(false);
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [medForm, setMedForm] = useState({ date: '', vaccine_name: '', description: '', vet_name: '' });
  const [diaryForm, setDiaryForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), note: '', symptoms: '', mood: 'good' });
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    api.get(`/pets/${id}`).then(r => setPet(r.data)).catch(() => navigate('/pets'));
    api.get(`/medical/pet/${id}`).then(r => setMedical(r.data));
    api.get(`/diary/pet/${id}`).then(r => setDiary(r.data));
  }, [id]);

  const loadQr = async () => {
    if (qr) return;
    setQrLoading(true);
    try {
      const r = await api.get(`/qr/pet/${id}`);
      setQr(r.data);
    } catch { toast.error('Помилка генерації QR'); }
    finally { setQrLoading(false); }
  };

  useEffect(() => {
    if (tab === 'qr') loadQr();
  }, [tab]);

  const saveMedical = async e => {
    e.preventDefault();
    try {
      await api.post('/medical', { pet_id: id, ...medForm });
      toast.success('Запис додано!');
      setShowMedModal(false);
      const r = await api.get(`/medical/pet/${id}`);
      setMedical(r.data);
    } catch { toast.error('Помилка'); }
  };

  const deleteMedical = async rid => {
    if (!window.confirm('Видалити запис?')) return;
    await api.delete(`/medical/${rid}`);
    setMedical(m => m.filter(x => x.record_id !== rid));
    toast.success('Видалено');
  };

  const saveDiary = async e => {
    e.preventDefault();
    try {
      await api.post('/diary', { pet_id: id, ...diaryForm });
      toast.success('Запис додано!');
      setShowDiaryModal(false);
      const r = await api.get(`/diary/pet/${id}`);
      setDiary(r.data);
    } catch { toast.error('Помилка'); }
  };

  const deleteDiary = async eid => {
    await api.delete(`/diary/${eid}`);
    setDiary(d => d.filter(x => x.entry_id !== eid));
    toast.success('Видалено');
  };

  if (!pet) return <div className="main-content"><div className="loading"><div className="spinner" /></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/pets')}>← Назад</button>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--mint-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            {speciesEmoji[pet.species]}
          </div>
          <div>
            <h1>{pet.name}</h1>
            <p>{pet.breed} · {pet.age} р. · {pet.species}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {pet.allergies && <span className="badge badge-orange">⚠ {pet.allergies}</span>}
          {pet.microchip && <span className="badge badge-mint">🔲 Мікрочіп</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, padding: '0 36px', background: 'white', borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'medical', label: '💉 Медичні записи' },
          { key: 'diary', label: '📓 Щоденник' },
          { key: 'qr', label: '🔲 QR-код' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
            color: tab === t.key ? 'var(--mint)' : 'var(--warm-grey)',
            borderBottom: tab === t.key ? '2px solid var(--mint)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}>{t.label}</button>
        ))}
      </div>

      <div className="page-content">
        {/* Medical Records */}
        {tab === 'medical' && (
          <div className="fade-up">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button className="btn btn-primary" onClick={() => { setMedForm({ date: format(new Date(), 'yyyy-MM-dd'), vaccine_name: '', description: '', vet_name: '' }); setShowMedModal(true); }}>
                + Додати запис
              </button>
            </div>
            {medical.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💉</div>
                <h3>Немає медичних записів</h3>
                <p>Додайте перший запис про вакцинацію або огляд</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {medical.map(rec => (
                  <div key={rec.record_id} className="card card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--mint-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {rec.vaccine_name ? '💉' : '🩺'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{rec.vaccine_name || 'Ветеринарний огляд'}</div>
                      {rec.description && <p style={{ fontSize: 14, color: 'var(--warm-grey)', marginBottom: 6 }}>{rec.description}</p>}
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--warm-grey)' }}>
                        <span>📅 {format(new Date(rec.date), 'd MMMM yyyy', { locale: uk })}</span>
                        {rec.vet_name && <span>👨‍⚕️ {rec.vet_name}</span>}
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteMedical(rec.record_id)}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Diary */}
        {tab === 'diary' && (
          <div className="fade-up">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button className="btn btn-primary" onClick={() => { setDiaryForm({ date: format(new Date(), 'yyyy-MM-dd'), note: '', symptoms: '', mood: 'good' }); setShowDiaryModal(true); }}>
                + Новий запис
              </button>
            </div>
            {diary.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📓</div>
                <h3>Щоденник порожній</h3>
                <p>Фіксуйте стан і спостереження за вашим улюбленцем</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {diary.map(entry => (
                  <div key={entry.entry_id} className="card card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 28 }}>{moodEmoji[entry.mood]}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{moodLabel[entry.mood]}</div>
                          <div style={{ fontSize: 12, color: 'var(--warm-grey)' }}>{format(new Date(entry.date), 'd MMMM yyyy', { locale: uk })}</div>
                        </div>
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteDiary(entry.entry_id)}>🗑️</button>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.65, marginBottom: entry.symptoms ? 10 : 0 }}>{entry.note}</p>
                    {entry.symptoms && (
                      <div style={{ background: '#FEE9E2', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#C14D2A' }}>
                        ⚠ Симптоми: {entry.symptoms}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* QR Code */}
        {tab === 'qr' && (
          <div className="fade-up" style={{ display: 'flex', justifyContent: 'center' }}>
            {qrLoading ? (
              <div className="loading"><div className="spinner" /></div>
            ) : qr ? (
              <div style={{ maxWidth: 420, width: '100%' }}>
                <div className="card card-body" style={{ textAlign: 'center' }}>
                  <h3 style={{ marginBottom: 8 }}>QR-код для {pet.name}</h3>
                  <p style={{ color: 'var(--warm-grey)', fontSize: 14, marginBottom: 24 }}>Скануйте для перегляду інформації про тварину</p>
                  <img src={qr.qr_image} alt="QR Code" style={{ width: 240, height: 240, margin: '0 auto 24px', display: 'block', borderRadius: 12 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, textAlign: 'left' }}>
                    {[
                      ["🐾 Ім'я", qr.qr_data.name],
                      ['🏷️ Порода', qr.qr_data.breed],
                      ['👤 Власник', qr.qr_data.owner],
                      ['📞 Телефон', qr.qr_data.phone],
                      ['🔲 Мікрочіп', qr.qr_data.microchip ? 'Так ✅' : 'Ні'],
                      ...(qr.qr_data.allergies ? [['⚠️ Алергія', qr.qr_data.allergies]] : [])
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--mint-light)', borderRadius: 10, fontSize: 14 }}>
                        <span style={{ color: 'var(--warm-grey)' }}>{k}</span>
                        <span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <a href={qr.qr_image} download={`${pet.name}_qr.png`} className="btn btn-primary" style={{ justifyContent: 'center' }}>⬇️ Завантажити QR</a>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Medical Modal */}
      {showMedModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMedModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Медичний запис</h2>
              <button className="modal-close" onClick={() => setShowMedModal(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={saveMedical}>
              <div className="form-group">
                <label className="form-label">Дата *</label>
                <input className="form-control" type="date" value={medForm.date} onChange={e => setMedForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Назва вакцини / процедури</label>
                <input className="form-control" value={medForm.vaccine_name} onChange={e => setMedForm(f => ({ ...f, vaccine_name: e.target.value }))} placeholder="Rabies, Комплексна DHPPiL..." />
              </div>
              <div className="form-group">
                <label className="form-label">Опис</label>
                <textarea className="form-control" value={medForm.description} onChange={e => setMedForm(f => ({ ...f, description: e.target.value }))} placeholder="Деталі огляду, стан тварини..." />
              </div>
              <div className="form-group">
                <label className="form-label">Лікар</label>
                <input className="form-control" value={medForm.vet_name} onChange={e => setMedForm(f => ({ ...f, vet_name: e.target.value }))} placeholder="Лікар Петренко" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowMedModal(false)}>Скасувати</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Зберегти</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diary Modal */}
      {showDiaryModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDiaryModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Запис у щоденнику</h2>
              <button className="modal-close" onClick={() => setShowDiaryModal(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={saveDiary}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Дата *</label>
                  <input className="form-control" type="date" value={diaryForm.date} onChange={e => setDiaryForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Настрій</label>
                  <select className="form-control" value={diaryForm.mood} onChange={e => setDiaryForm(f => ({ ...f, mood: e.target.value }))}>
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
                <textarea className="form-control" value={diaryForm.note} onChange={e => setDiaryForm(f => ({ ...f, note: e.target.value }))} placeholder="Як пройшов день, поведінка, апетит..." required />
              </div>
              <div className="form-group">
                <label className="form-label">Симптоми (якщо є)</label>
                <input className="form-control" value={diaryForm.symptoms} onChange={e => setDiaryForm(f => ({ ...f, symptoms: e.target.value }))} placeholder="Чхання, відмова від їжі..." />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowDiaryModal(false)}>Скасувати</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Зберегти</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}