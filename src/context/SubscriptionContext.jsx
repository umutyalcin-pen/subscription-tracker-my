import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SubscriptionContext = createContext();

export const CURRENCIES = {
    TRY: { symbol: '₺', name: 'Türk Lirası', code: 'TRY' },
    USD: { symbol: '$', name: 'ABD Doları', code: 'USD' },
    EUR: { symbol: '€', name: 'Euro', code: 'EUR' }
};

const DEFAULT_RATES = {
    TRY: 1,
    USD: 0.028,
    EUR: 0.026
};

export const useSubscriptions = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscriptions must be used within a SubscriptionProvider');
    }
    return context;
};

const DEFAULT_SUBSCRIPTIONS = [
    { id: '1', name: 'Spotify', price: 10.99, color: '#1DB954', icon: 'music', currency: 'USD' },
    { id: '2', name: 'Netflix', price: 15.99, color: '#E50914', icon: 'video', currency: 'USD' },
    { id: '3', name: 'Adobe Creative Cloud', price: 54.99, color: '#FF0000', icon: 'palette', currency: 'USD' },
    { id: '4', name: 'Amazon Prime', price: 14.99, color: '#FF9900', icon: 'shopping-cart', currency: 'USD' },
];

export const SubscriptionProvider = ({ children }) => {
    const [subscriptions, setSubscriptions] = useState(() => {
        const saved = localStorage.getItem('subscriptions');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map(sub => ({ ...sub, currency: sub.currency || 'TRY' }));
        }
        return DEFAULT_SUBSCRIPTIONS;
    });

    const [displayCurrency, setDisplayCurrency] = useState(() => {
        return localStorage.getItem('displayCurrency') || 'TRY';
    });

    const [exchangeRates, setExchangeRates] = useState(() => {
        const cached = localStorage.getItem('exchangeRates');
        return cached ? JSON.parse(cached) : DEFAULT_RATES;
    });
    const [ratesLoading, setRatesLoading] = useState(false);
    const [ratesError, setRatesError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(() => {
        return localStorage.getItem('ratesLastUpdate') || null;
    });

    const currency = CURRENCIES[displayCurrency]?.symbol || '₺';

    const fetchExchangeRates = useCallback(async () => {
        setRatesLoading(true);
        setRatesError(null);

        try {
            const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/try.json');

            if (!response.ok) {
                throw new Error('Kurlar alınamadı');
            }

            const data = await response.json();

            const rates = {
                TRY: 1,
                USD: data.try?.usd || DEFAULT_RATES.USD,
                EUR: data.try?.eur || DEFAULT_RATES.EUR
            };

            setExchangeRates(rates);
            const now = new Date().toISOString();
            setLastUpdate(now);

            localStorage.setItem('exchangeRates', JSON.stringify(rates));
            localStorage.setItem('ratesLastUpdate', now);

        } catch (error) {
            console.error('Döviz kuru hatası:', error);
            setRatesError('Kurlar alınamadı, varsayılan değerler kullanılıyor');
        } finally {
            setRatesLoading(false);
        }
    }, []);

    useEffect(() => {
        const lastUpdateTime = lastUpdate ? new Date(lastUpdate).getTime() : 0;
        const oneHour = 60 * 60 * 1000;

        if (Date.now() - lastUpdateTime > oneHour) {
            fetchExchangeRates();
        }

        const interval = setInterval(fetchExchangeRates, oneHour);
        return () => clearInterval(interval);
    }, [fetchExchangeRates, lastUpdate]);

    const convertCurrency = useCallback((amount, fromCurrency, toCurrency) => {
        if (fromCurrency === toCurrency) return amount;
        const inTRY = amount / (exchangeRates[fromCurrency] || 1);
        return inTRY * (exchangeRates[toCurrency] || 1);
    }, [exchangeRates]);

    useEffect(() => {
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    }, [subscriptions]);

    useEffect(() => {
        localStorage.setItem('displayCurrency', displayCurrency);
    }, [displayCurrency]);

    const addSubscription = (sub) => {
        setSubscriptions(prev => [...prev, { ...sub, id: crypto.randomUUID() }]);
    };

    const removeSubscription = (id) => {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    };

    const reorderSubscriptions = (newOrder) => {
        setSubscriptions(newOrder);
    };

    const totalMonthly = subscriptions.reduce((acc, sub) => {
        const converted = convertCurrency(Number(sub.price), sub.currency || 'TRY', displayCurrency);
        return acc + converted;
    }, 0);
    const totalYearly = totalMonthly * 12;

    return (
        <SubscriptionContext.Provider value={{
            subscriptions,
            addSubscription,
            removeSubscription,
            reorderSubscriptions,
            currency,
            displayCurrency,
            setDisplayCurrency,
            totalMonthly,
            totalYearly,
            exchangeRates,
            ratesLoading,
            ratesError,
            lastUpdate,
            fetchExchangeRates,
            convertCurrency
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
