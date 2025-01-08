class App {
    constructor() {
        this.calculator = new InvestmentCalculator();
        this.chart = new InvestmentChart();
        this.chart.initialize();
        
        this.form = document.getElementById('calculatorForm');
        this.metricsContainer = document.getElementById('keyMetrics');
        
        this.setupEventListeners();
        this.setupInputFormatting();
    }

    setupEventListeners() {
        // Add calculate button event listener
        document.getElementById('calculateButton').addEventListener('click', () => {
            this.calculate();
        });

        // Add input event listeners with console logging
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                console.log('Input changed:', input.id, input.value);
                this.calculator.debounce(() => this.calculate(), 300);
            });

            // Add enter key handler for each input
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.calculate();
                }
            });
        });
    }

    setupInputFormatting() {
        const currencyInputs = ['initialInvestment', 'yearlyExpenses', 'annualDeposits'];
        const percentageInputs = ['inflationRate', 'expectedGrowthRate', 'contributionGrowthRate'];
        
        // Setup currency inputs
        currencyInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            
            // Format initial value
            if (input.value) {
                const value = parseFloat(input.value);
                if (!isNaN(value)) {
                    input.value = value.toLocaleString('en-US');
                }
            }

            input.addEventListener('focus', (e) => {
                // Remove commas when focusing
                e.target.value = e.target.value.replace(/,/g, '');
            });

            input.addEventListener('blur', (e) => {
                // Add commas when leaving the field
                if (e.target.value) {
                    let value = e.target.value.replace(/[^\d.]/g, '');
                    value = parseFloat(value);
                    
                    if (!isNaN(value)) {
                        e.target.value = value.toLocaleString('en-US');
                    } else {
                        e.target.value = '0';
                    }
                } else {
                    e.target.value = '0';
                }
            });

            // Prevent non-numeric input
            input.addEventListener('keypress', (e) => {
                const charCode = e.which ? e.which : e.keyCode;
                if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
                    e.preventDefault();
                }
            });
        });

        // Setup percentage inputs
        percentageInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                    e.target.value = value;
                }
            });
        });
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
            console.log('Inputs:', inputs);
            
            const data = this.calculator.calculateProjection(inputs);
            console.log('Calculation result:', data);
            
            this.chart.update(data, inputs.years);
            this.updateMetrics(data);
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
            <div class="bg-gray-50 p-4 rounded-lg flex flex-col items-start">
                <h3 class="text-sm font-medium text-gray-500">${metric.label}</h3>
                <p class="mt-1 text-lg font-semibold text-gray-900">${metric.value}</p>
            </div>
        `).join('');
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});