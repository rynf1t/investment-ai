class InvestmentChart {
    constructor() {
        console.log('Initializing InvestmentChart');
        this.chart = null;
        const canvas = document.getElementById('investmentChart');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        this.ctx = canvas.getContext('2d');
    }

    initialize() {
        console.log('Initializing chart');
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Portfolio Balance',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 2,
                        fill: false,
                        data: []
                    },
                    {
                        label: 'Yearly Expenses (Inflation Adjusted)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 2,
                        fill: false,
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 300
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: 'compact',
                                maximumFractionDigits: 1
                            }).format(value)
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    maximumFractionDigits: 0
                                }).format(context.raw);
                                
                                return `${context.dataset.label}: ${value}`;
                            }
                        }
                    }
                }
            }
        });
    }

    update(data, years) {
        if (!this.chart) {
            console.error('Chart not initialized');
            return;
        }
        
        console.log('Updating chart with data:', data, 'and years:', years);
        requestAnimationFrame(() => {
            const labels = Array.from({length: years + 1}, (_, i) => `Year ${i}`);
            
            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = data.nominal;
            this.chart.data.datasets[1].data = data.expenses;
            
            // Update chart background based on sustainability
            this.chart.canvas.parentElement.style.backgroundColor = 
                data.isPortfolioSustainable ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)';
            
            this.chart.update('none');
        });
    }
}