class App {
    constructor() {
        console.log('Initializing App');
        this.calculator = new InvestmentCalculator();
        this.chart = new InvestmentChart();
        this.chart.initialize();
        
        this.form = document.getElementById('calculatorForm');
        this.metricsContainer = document.getElementById('keyMetrics');
        
        this.setupEventListeners();
        this.setupInputFormatting();
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        // Add calculate button event listener
        const calculateButton = document.getElementById('calculateButton');
        if (calculateButton) {
            calculateButton.addEventListener('click', () => {
                console.log('Calculate button clicked');
                this.calculate();
            });
        } else {
            console.error('Calculate button not found');
        }

        // Add input event listeners with console logging
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                console.log('Input changed:', input.id, input.value);
                this.calculator.debounce(() => {
                    console.log('Debounced calculate call');
                    this.calculate();
                }, 300);
            });

            // Add enter key handler for each input
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('Enter key pressed on', input.id);
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
                formatCurrencyInput(e.target);
            });

            // Prevent non-numeric input except for dot
            input.addEventListener('keypress', (e) => {
                const char = String.fromCharCode(e.which);
                if (!/[0-9.]/.test(char)) {
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

        // Helper function to format currency
        function formatCurrencyInput(input) {
            let value = input.value.replace(/,/g, '');
            value = parseFloat(value);
            
            if (!isNaN(value)) {
                input.value = value.toLocaleString('en-US');
            } else {
                input.value = '0';
            }
        }
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
            console.log('Starting calculation');
            const inputs = this.getInputs();
            console.log('Inputs:', inputs);
            
            const data = this.calculator.calculateProjection(inputs);
            console.log('Calculation result:', data);
            
            if (data) {
                this.chart.update(data, inputs.years);
                this.updateMetrics(data);
            } else {
                console.warn('No data returned from calculateProjection');
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
            <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600">${metric.label}</p>
                <p class="mt-1 text-lg font-semibold text-gray-900">${metric.value}</p>
            </div>
        `).join('');
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});