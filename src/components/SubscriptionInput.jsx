import React, { useState } from 'react';
import { useSubscriptions, CURRENCIES } from '../context/SubscriptionContext';
import * as Icons from 'lucide-react';

// Popüler abonelik ikonları
const ICONS = [
    { name: 'Box', label: 'Kutu' },
    { name: 'Video', label: 'Video' },
    { name: 'Music', label: 'Müzik' },
    { name: 'Cloud', label: 'Bulut' },
    { name: 'ShoppingCart', label: 'Alışveriş' },
    { name: 'Gamepad2', label: 'Oyun' },
    { name: 'BookOpen', label: 'Kitap' },
    { name: 'Newspaper', label: 'Haber' },
    { name: 'Dumbbell', label: 'Spor' },
    { name: 'Palette', label: 'Tasarım' },
    { name: 'Code', label: 'Yazılım' },
    { name: 'Wifi', label: 'İnternet' },
    { name: 'Phone', label: 'Telefon' },
    { name: 'Mail', label: 'E-posta' },
    { name: 'Shield', label: 'Güvenlik' },
];

const COLORS = [
    '#ef4444', // Red
    '#FB923C', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#d946ef', // Fuchsia
    '#1e293b', // Slate
];



const SubscriptionInput = () => {
    const { addSubscription, displayCurrency } = useSubscriptions();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        color: COLORS[0],
        icon: 'box',
        isYearly: false,
        currency: displayCurrency || 'TRY',
        startDate: '',
        endDate: ''
    });

    const [dateError, setDateError] = useState('');

    // Tarih doğrulama
    const validateDates = () => {
        if (formData.startDate && formData.endDate) {
            if (new Date(formData.startDate) > new Date(formData.endDate)) {
                setDateError('Başlangıç tarihi bitiş tarihinden sonra olamaz!');
                return false;
            }
        }
        setDateError('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return;
        if (!validateDates()) return;

        const inputPrice = parseFloat(formData.price);
        addSubscription({
            name: formData.name,
            price: formData.isYearly ? inputPrice / 12 : inputPrice,
            color: formData.color,
            icon: formData.icon,
            isYearly: formData.isYearly,
            originalPrice: inputPrice,
            currency: formData.currency,
            startDate: formData.startDate,
            endDate: formData.endDate
        });

        setFormData({ ...formData, name: '', price: '', isYearly: false, startDate: '', endDate: '' });
        setDateError('');
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Abonelik Ekle</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>İsim</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Fiyat</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="number"
                            step="5"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            style={{ flex: 1 }}
                        />
                        <select
                            value={formData.currency}
                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            style={{ width: 'auto', minWidth: '70px' }}
                        >
                            {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                                <option key={code} value={code}>{symbol} {code}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        id="isYearly"
                        checked={formData.isYearly}
                        onChange={e => setFormData({ ...formData, isYearly: e.target.checked })}
                        style={{ width: 'auto' }}
                    />
                    <label htmlFor="isYearly" style={{ fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
                        Yıllık Ödeme
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Başlangıç</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Bitiş</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                </div>
                {dateError && (
                    <div style={{
                        color: 'var(--danger)',
                        fontSize: '0.85rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px'
                    }}>
                        ⚠️ {dateError}
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>İkon</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {ICONS.map(({ name, label }) => {
                            const IconComponent = Icons[name] || Icons.Box;
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: name })}
                                    title={label}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: formData.icon === name ? formData.color : 'var(--input-bg)',
                                        color: formData.icon === name ? 'white' : 'var(--text-secondary)',
                                        border: '1px solid var(--input-border)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <IconComponent size={18} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Renk</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {COLORS.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setFormData({ ...formData, color: c })}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: c,
                                    border: formData.color === c ? '2px solid white' : 'none',
                                    outline: formData.color === c ? '2px solid ' + c : 'none',
                                    cursor: 'pointer'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                    Abonelik Ekle
                </button>
            </form>
        </div>
    );
};

export default SubscriptionInput;
