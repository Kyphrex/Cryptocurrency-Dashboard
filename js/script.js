document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const cryptoGrid = document.getElementById('crypto-grid');
    const searchInput = document.getElementById('search-input');
    const coinCardTemplate = document.getElementById('coin-card-template');

    const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false';

    let allCoins = [];

    const setTheme = (theme) => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    };

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.className === 'dark' ? '' : 'dark';
        setTheme(currentTheme);
    });

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDark) {
        setTheme('dark');
    }

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(number);
    };

    const renderCoins = (coins) => {
        cryptoGrid.innerHTML = '';
        if (coins.length === 0) {
            cryptoGrid.innerHTML = '<p class="no-results">Nenhuma criptomoeda encontrada.</p>';
            return;
        }

        coins.forEach(coin => {
            const card = coinCardTemplate.content.cloneNode(true).children[0];
            card.querySelector('.coin-logo').src = coin.image;
            card.querySelector('.coin-name').textContent = coin.name;
            card.querySelector('.coin-symbol').textContent = coin.symbol;
            card.querySelector('.coin-price').textContent = formatCurrency(coin.current_price);
            
            const priceChange = coin.price_change_percentage_24h;
            const changeElement = card.querySelector('.coin-change');
            changeElement.textContent = `${priceChange.toFixed(2)}%`;

            changeElement.classList.remove('price-up', 'price-down');
            if (priceChange >= 0) {
                changeElement.classList.add('price-up');
            } else {
                changeElement.classList.add('price-down');
            }

            card.querySelector('.market-cap').textContent = formatCurrency(coin.market_cap);
            cryptoGrid.appendChild(card);
        });
    };

    const fetchCoins = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Falha ao buscar dados da API');
            
            allCoins = await response.json();
            renderCoins(allCoins);
        } catch (error) {
            console.error(error);
            cryptoGrid.innerHTML = '<p class="error">Não foi possível carregar os dados. Tente novamente mais tarde.</p>';
        }
    };

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredCoins = allCoins.filter(coin => 
            coin.name.toLowerCase().includes(searchTerm) || 
            coin.symbol.toLowerCase().includes(searchTerm)
        );
        renderCoins(filteredCoins);
    });

    fetchCoins();
    setInterval(fetchCoins, 60000);
});