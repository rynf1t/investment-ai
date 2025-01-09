class InvestmentCalculator {
    constructor() {
        console.log('Initializing InvestmentCalculator');
        this.debounceTimeout = null;
        this.cache = new Map();
    }

    validateInputs(inputs) {
        return {
            initialInvestment: Math.max(0, parseFloat(inputs.initialInvestment) || 0),
            expectedGrowthRate: Math.max(-100, Math.min(100, parseFloat(inputs.expectedGrowthRate) || 0)),
            annualDeposits: Math.max(0, parseFloat(inputs.annualDeposits) || 0),
            contributionGrowthRate: Math.max(0, Math.min(20, parseFloat(inputs.contributionGrowthRate) || 0)),
            yearlyExpenses: Math.max(0, parseFloat(inputs.yearlyExpenses) || 0),
            inflationRate: Math.max(-5, Math.min(20, parseFloat(inputs.inflationRate) || 0)),
            years: Math.max(1, Math.min(150, parseInt(inputs.years) || 30))
        };
    }

    calculateProjection(inputs) {
        console.log('Calculating projection with inputs:', inputs);
        const cacheKey = JSON.stringify(inputs);
        if (this.cache.has(cacheKey)) {
            console.log('Using cached data');
            return this.cache.get(cacheKey);
        }

        const {
            initialInvestment,
            expectedGrowthRate,
            annualDeposits,
            contributionGrowthRate,
            yearlyExpenses,
            inflationRate,
            years
        } = this.validateInputs(inputs);

        let portfolioValue = initialInvestment + annualDeposits;
        let yearlyExpensesAdjusted = yearlyExpenses;
        let isPortfolioSustainable = true;
        let depletionYear = null;

        const data = {
            nominal: [portfolioValue],
            expenses: [yearlyExpensesAdjusted],
            isPortfolioSustainable: true,
            depletionYear: null,
            yearlyBreakdown: [{
                year: 0,
                nominal: portfolioValue,
                expenses: yearlyExpensesAdjusted,
                sustainable: true
            }]
        };

        for (let year = 1; year <= years; year++) {
            // Calculate this year's inflation-adjusted expenses
            yearlyExpensesAdjusted = yearlyExpenses * Math.pow(1 + inflationRate / 100, year);
            data.expenses.push(yearlyExpensesAdjusted);

            if (portfolioValue > 0) {
                // Calculate this year's contribution (adjusted for growth)
                const adjustedDeposits = annualDeposits * Math.pow(1 + (contributionGrowthRate / 100), year - 1);
                
                // Add deposits at start of year
                portfolioValue += adjustedDeposits;
                
                // Apply growth to entire portfolio (including this year's deposit)
                portfolioValue *= (1 + (expectedGrowthRate / 100));
                
                // Subtract expenses at end of year
                portfolioValue = Math.max(0, portfolioValue - yearlyExpensesAdjusted);

                if (portfolioValue === 0 && isPortfolioSustainable) {
                    isPortfolioSustainable = false;
                    depletionYear = year;
                }
            } else {
                portfolioValue = 0;
            }

            data.nominal.push(portfolioValue);
            data.yearlyBreakdown.push({
                year,
                nominal: portfolioValue,
                expenses: yearlyExpensesAdjusted,
                sustainable: portfolioValue > 0
            });
        }

        data.isPortfolioSustainable = isPortfolioSustainable;
        data.depletionYear = depletionYear;

        this.cache.set(cacheKey, data);
        return data;
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => func(), wait);
    }

    clearCache() {
        this.cache.clear();
    }
}
