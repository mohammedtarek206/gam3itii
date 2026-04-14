import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaHeart, FaMobileAlt, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AMOUNTS = [50, 100, 200, 500];

export default function DonateModal({ onClose, caseId, caseTitle }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState('vodafone_cash');
  const [recurring, setRecurring] = useState('none');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  const handleDonate = async () => {
    if (!user) { toast.error('يرجى تسجيل الدخول أولاً'); return; }
    if (!finalAmount || finalAmount < 1) { toast.error('يرجى إدخال مبلغ صحيح'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/donations', {
        caseId, amount: finalAmount, method, recurring, anonymous,
      });
      toast.success(`${t('donate.success')} ${data.pointsEarned > 0 ? `\n+${data.pointsEarned} نقطة!` : ''}`);
      onClose();
    } catch (err) {
      toast.error(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>💚 {t('donate.title')}</h3>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        {caseTitle && (
          <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>
            📋 التبرع لحالة: {caseTitle}
          </div>
        )}

        <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{t('donate.choose_amount')}</p>
        <div className="amount-options">
          {AMOUNTS.map((a) => (
            <button key={a} className={`amount-option${amount === a && !customAmount ? ' selected' : ''}`}
              onClick={() => { setAmount(a); setCustomAmount(''); }}>
              {a} <small style={{ fontSize: '0.7rem' }}>{t('common.egp')}</small>
            </button>
          ))}
        </div>
        <div className="form-group">
          <input
            className="form-control"
            type="number"
            placeholder={`${t('donate.custom')} (${t('common.egp')})`}
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
          />
        </div>

        <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{t('donate.method')}</p>
        <div className="payment-methods">
          {[
            { key: 'vodafone_cash', label: t('donate.vodafone'), icon: '📱' },
            { key: 'bank_card', label: t('donate.bank'), icon: '💳' },
            { key: 'instapay', label: t('donate.instapay'), icon: '⚡' },
          ].map((m) => (
            <button key={m.key} className={`payment-method${method === m.key ? ' selected' : ''}`} onClick={() => setMethod(m.key)}>
              <div>{m.icon}</div>
              <div>{m.label}</div>
            </button>
          ))}
        </div>

        <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{t('donate.recurring')}</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {[{ key: 'none', label: t('donate.once') }, { key: 'monthly', label: t('donate.monthly') }, { key: 'weekly', label: t('donate.weekly') }].map((r) => (
            <button key={r.key} onClick={() => setRecurring(r.key)}
              style={{
                flex: 1, padding: '0.6rem', borderRadius: 'var(--radius)', border: `2px solid ${recurring === r.key ? 'var(--primary)' : 'var(--border)'}`,
                background: recurring === r.key ? 'var(--secondary)' : 'none',
                color: recurring === r.key ? 'var(--primary)' : 'var(--text-body)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'
              }}>
              {r.label}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', cursor: 'pointer', fontSize: '0.9rem' }}>
          <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
          {t('donate.anonymous')}
        </label>

        <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>المبلغ الإجمالي</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{finalAmount || 0} {t('common.egp')}</span>
        </div>

        <button className="btn btn-primary btn-block btn-lg" onClick={handleDonate} disabled={loading}>
          {loading ? '⏳ جاري التبرع...' : <><FaHeart /> {t('donate.confirm')}</>}
        </button>
      </div>
    </div>
  );
}
