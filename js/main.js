class App {
    constructor() {
        this.calculator = new InvestmentCalculator();
        this.chart = new InvestmentChart();
        this.form = document.getElementById('calculatorForm');
        this.metricsContainer = document.getElementById('keyMetrics');
        
        // Initialize chart after DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.chart.initialize();
            this.setupEventListeners();
            this.setupInputFormatting();
        });
    }

    setupEventListeners() {
        const calculateButton = document.getElementById('calculateButton');
        if (calculateButton) {
            calculateButton.addEventListener('click', () => this.calculate());
        }

        // Add enter key handler
        this.form.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.calculate();
            }
        });
    }

    setupInputFormatting() {
        const currencyInputs = ['initialInvestment', 'yearlyExpenses', 'annualDeposits'];
        const percentageInputs = ['inflationRate', 'expectedGrowthRate', 'contributionGrowthRate'];

        currencyInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (!input) return;

            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^\d.]/g, '');
                e.target.value = value;
                this.calculate();
            });

            input.addEventListener('blur', (e) => {
                this.formatCurrencyInput(e.target);
            });
        });

        percentageInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (!input) return;

            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^\d.-]/g, '');
                e.target.value = value;
                this.calculate();
            });
        });
    }

    formatCurrencyInput(input) {
        let value = parseFloat(input.value.replace(/,/g, ''));
        input.value = !isNaN(value) ? value.toLocaleString('en-US') : '0';
    }

    getInputs() {
        return {
            initialInvestment: parseFloat(document.getElementById('initialInvestment').value.replace(/,/g, '')) || 0,
            expectedGrowthRate: parseFloat(document.getElementById('expectedGrowthRate').value) || 0,
            annualDeposits: parseFloat(document.getElementById('annualDeposits').value.replace(/,/g, '')) || 0,
            contributionGrowthRate: parseFloat(document.getElementById('contributionGrowthRate').value) || 0,
            yearlyExpenses: parseFloat(document.getElementById('yearlyExpenses').value.replace(/,/g, '')) || 0,
            inflationRate: parseFloat(document.getElementById('inflationRate').value) || 0,
            years: parseInt(document.getElementById('years').value) || 30
        };
    }

    calculate() {
        try {
            const inputs = this.getInputs();
            const data = this.calculator.calculateProjection(inputs);
            
            if (data) {
                this.chart.update(data, inputs.years);
                this.updateMetrics(data);
            }
        } catch (error) {
            console.error('Calculation error:', error);
        }
    }

    updateMetrics(data) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        });

        const metrics = [
            {
                label: 'Final Portfolio Balance',
                value: formatter.format(data.nominal[data.nominal.length - 1])
            },
            {
                label: 'Final Yearly Expenses',
                value: formatter.format(data.expenses[data.expenses.length - 1])
            },
            {
                label: 'Portfolio Status',
                value: data.isPortfolioSustainable ? 'Sustainable' : `Depleted in Year ${data.depletionYear}`
            }
        ];

        this.metricsContainer.innerHTML = metrics.map(metric => `
            <div class="p-4 bg-gray-50 rounded-lg shadow">
                <p class="text-sm text-gray-600">${metric.label}</p>
                <p class="mt-1 text-lg font-semibold text-gray-900">${metric.value}</p>
            </div>
        `).join('');
    }
}

// Initialize the app
new App();
