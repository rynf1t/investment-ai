class InvestmentChart {
    constructor() {
        console.log('Initializing InvestmentChart');
        const canvas = document.getElementById('investmentChart');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        this.ctx = canvas.getContext('2d');
        this.chart = null;
    }

    initialize() {
        if (!this.ctx) return;
        
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
                interaction: {
                    mode: 'index',
                    intersect: false
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
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    notation: 'compact',
                                    maximumFractionDigits: 1
                                }).format(value);
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
        
        const labels = Array.from({length: years + 1}, (_, i) => `Year ${i}`);
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data.nominal;
        this.chart.data.datasets[1].data = data.expenses;
        this.chart.update('none');
    }
}
