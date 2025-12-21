import React, { useRef, useState, useEffect } from 'react';
import SubscriptionInput from './SubscriptionInput';
import Treemap from './Treemap';
import { useSubscriptions, CURRENCIES } from '../context/SubscriptionContext';
import { Download, Upload, Moon, Sun, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';

const Dashboard = () => {
    const {
        totalMonthly, totalYearly, currency, displayCurrency, setDisplayCurrency,
        addSubscription, exchangeRates, ratesLoading, ratesError, lastUpdate, fetchExchangeRates
    } = useSubscriptions();

    // Son güncelleme zamanını formatla
    const formatLastUpdate = (isoString) => {
        if (!isoString) return 'Hiç';
        const date = new Date(isoString);
        return date.toLocaleString('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };
    const fileInputRef = useRef(null);
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (isDark) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    const handleExport = async () => {
        const element = document.getElementById('treemap-export');
        if (element) {
            const canvas = await html2canvas(element, {
                backgroundColor: null,
                scale: 2
            });
            const data = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = data;
            link.download = 'aboneliklerim.png';
            link.click();
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Simple heuristic: look for name/description and price/amount columns
                results.data.forEach(row => {
                    // Normalize keys to lowercase for matching
                    const normalizedRow = {};
                    Object.keys(row).forEach(key => {
                        normalizedRow[key.toLowerCase()] = row[key];
                    });

                    const name = normalizedRow.name || normalizedRow.description || normalizedRow.service || normalizedRow['açıklama'];
                    const priceStr = normalizedRow.price || normalizedRow.amount || normalizedRow.cost || normalizedRow['tutar'];

                    if (name && priceStr) {
                        // Clean price string (remove currency symbols)
                        const price = parseFloat(priceStr.toString().replace(/[^0-9.-]+/g, ""));

                        if (!isNaN(price) && price > 0) {
                            addSubscription({
                                name: name,
                                price: price,
                                color: '#6366f1', // Default color, user can change later
                                icon: 'box'
                            });
                        }
                    }
                });
            }
        });
        // Reset input
        event.target.value = null;
    };

    return (
        <div className="app-container">
            <div className="header">
                <h1>Abonelik Haritası</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                        value={displayCurrency}
                        onChange={e => setDisplayCurrency(e.target.value)}
                        className="btn header-btn"
                        style={{ cursor: 'pointer' }}
                    >
                        {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                            <option key={code} value={code}>{symbol} {name}</option>
                        ))}
                    </select>
                    <button className="btn header-btn" onClick={toggleTheme}>
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        style={{ display: 'none' }}
                    />
                    <button className="btn header-btn" onClick={handleImportClick}>
                        <Upload size={18} /> CSV Yükle
                    </button>
                    <button className="btn btn-primary" onClick={handleExport}>
                        <Download size={18} /> Resmi İndir
                    </button>
                </div>
            </div>

            <div className="grid-layout">
                <aside>
                    <SubscriptionInput />

                    <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', opacity: 0.7, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toplam / Ay</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            {currency}{totalMonthly.toFixed(2)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Yıllık Tahmin</span>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{currency}{totalYearly.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Döviz Kuru Bilgisi */}
                    <div className="glass-panel" style={{ marginTop: '1rem', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>Döviz Kurları</span>
                            <button
                                onClick={fetchExchangeRates}
                                disabled={ratesLoading}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    opacity: ratesLoading ? 0.5 : 1,
                                    color: 'var(--text-secondary)'
                                }}
                                title="Kurları Güncelle"
                            >
                                <RefreshCw size={14} className={ratesLoading ? 'spinning' : ''} />
                            </button>
                        </div>
                        <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>1 USD</span>
                                <span style={{ fontWeight: 600 }}>{(1 / exchangeRates.USD).toFixed(2)} ₺</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>1 EUR</span>
                                <span style={{ fontWeight: 600 }}>{(1 / exchangeRates.EUR).toFixed(2)} ₺</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.5rem' }}>
                            Güncelleme: {formatLastUpdate(lastUpdate)}
                        </div>
                        {ratesError && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '0.25rem' }}>
                                {ratesError}
                            </div>
                        )}
                    </div>
                </aside>

                <main>
                    <Treemap />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
