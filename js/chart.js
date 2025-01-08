class InvestmentChart {
    constructor() {
        this.chart = null;
        const ctx = document.getElementById('investmentChart').getContext('2d');
        this.ctx = ctx;
    }

    initialize() {
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Portfolio Balance',
                        borderColor: 'rgba(59, 130, 246, 1)', // Tailwind blue-500
                        backgroundColor: 'rgba(59, 130, 246, 0.2)', // Tailwind blue-500 with opacity
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4, // Smoother lines
                        data: []
                    },
                    {
                        label: 'Yearly Expenses (Inflation Adjusted)',
                        borderColor: 'rgba(239, 68, 68, 1)', // Tailwind red-500
                        backgroundColor: 'rgba(239, 68, 68, 0.2)', // Tailwind red-500 with opacity
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4, // Smoother lines
                        data: []
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 8,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    update(data, years) {
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