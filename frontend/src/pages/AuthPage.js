import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';
import logo from '../assets/logo.png';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        toast.success('Ласкаво просимо!');
      } else {
        await register(form.name, form.email, form.password, form.phone);
        toast.success('Акаунт створено!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Помилка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <img src={logo} alt="PawCare logo" />
              </div>
              <h1>AniMed</h1>
              </div>
        </div>
        <h2>Розумна турбота<br />про ваших улюбленців</h2>
        <p>Керуйте здоров'ям, вакцинаціями та нагадуваннями для всіх ваших тварин.</p>
        <div className="auth-features">
          {['🐶 Профілі тварин', '💉 Медичні записи', '📅 Календар подій', '🔔 Нагадування', '📓 Щоденник', '🔲 QR-код'].map(f => (
            <div key={f} className="auth-feature">{f}</div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
              Увійти
            </button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
              Реєстрація
            </button>
          </div>

          <h2 className="auth-title">
            {tab === 'login' ? 'Вхід до акаунту' : 'Створити акаунт'}
          </h2>

          <form onSubmit={handleSubmit}>
            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Ваше ім'я</label>
                <input
                  className="form-control"
                  name="name"
                  placeholder="Олена Даниленко"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input
                className="form-control"
                type="password"
                name="password"
                placeholder="Мінімум 6 символів"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Телефон (необов'язково)</label>
                <input
                  className="form-control"
                  name="phone"
                  placeholder="+380991234567"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            )}

            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? '...' : tab === 'login' ? 'Увійти' : 'Зареєструватись'}
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
}
