import React from 'react';
import * as Icons from 'lucide-react';
import { useSubscriptions, CURRENCIES } from '../context/SubscriptionContext';

const SubscriptionCard = ({ sub, total }) => {
    const { currency, displayCurrency, removeSubscription, convertCurrency } = useSubscriptions();

    const convertedPrice = convertCurrency(sub.price, sub.currency || 'TRY', displayCurrency);
    const originalDisplay = sub.isYearly ? sub.originalPrice : sub.price;
    const convertedOriginal = convertCurrency(originalDisplay, sub.currency || 'TRY', displayCurrency);

    const percentage = total > 0 ? ((convertedPrice / total) * 100).toFixed(0) : 0;

    const IconComponent = Icons[sub.icon] || Icons.Box;

    const isLarge = percentage > 15;
    const isMedium = percentage > 8;

    const style = {
        backgroundColor: sub.color + '20',
        color: '#1e293b',
        borderColor: sub.color + '40',
        position: 'relative'
    };

    return (
        <div
            className={`subscription-card ${isLarge ? 'card-large' : isMedium ? 'card-medium' : 'card-small'}`}
            style={style}
        >
            <div className="card-header">
                <div className="icon-wrapper" style={{ backgroundColor: sub.color, color: 'white' }}>
                    <IconComponent size={20} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="percentage-pill">{percentage}%</span>
                    <button
                        onClick={() => removeSubscription(sub.id)}
                        className="btn-icon delete-btn"
                        title="Sil"
                    >
                        <Icons.X size={14} />
                    </button>
                </div>
            </div>

            <div className="card-content">
                <h3 className="sub-name">{sub.name}</h3>
                <div className="price-container">
                    <span className="currency">{currency}</span>
                    <span className="amount">
                        {convertedOriginal.toFixed(2)}
                    </span>
                    {sub.isYearly && <span style={{ fontSize: '0.6em', opacity: 0.7, marginLeft: '2px' }}>/yıl</span>}
                </div>
                <div className="yearly-projection">
                    {sub.isYearly
                        ? `~${currency}${convertedPrice.toFixed(2)}/ay`
                        : `~${currency}${(convertedPrice * 12).toFixed(0)}/yıl`
                    }
                </div>
                {(sub.startDate || sub.endDate) && (
                    <div style={{
                        fontSize: '0.75rem',
                        opacity: 0.6,
                        marginTop: '0.5rem',
                        display: 'flex',
                        gap: '0.25rem',
                        alignItems: 'center'
                    }}>
                        <Icons.Calendar size={12} />
                        {sub.startDate && new Date(sub.startDate).toLocaleDateString('tr-TR')}
                        {sub.startDate && sub.endDate && ' - '}
                        {sub.endDate && new Date(sub.endDate).toLocaleDateString('tr-TR')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionCard;
