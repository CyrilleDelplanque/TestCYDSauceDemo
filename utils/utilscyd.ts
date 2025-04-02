/**
 * Function to extract currency and prices from a list of price strings
 *
 * @param {string[]} prices
 * @returns { { currency: string, priceValues: number[] } }
 */
export function extractCurrencyAndPrices(prices: string[]): { currency: string, priceValues: number[] } {
    if (prices.length === 0) {
        throw new Error("❌ No prices provided");
    }
    // Extract current as it is first character 
    const currency = prices[0].charAt(0);  

    // Validate if the first character is a valid currency symbol (e.g., $, €, £)
    const validCurrencyRegex = /^[\$\€\£\¥\₹]/;
    if (!validCurrencyRegex.test(currency)) {
        throw new Error(`❌ Invalid currency symbol detected: ${currency}`);
    }

    // Map the prices to numbers and validate each price
    const priceValues = prices.map(price => {
        // Check that the price follows the correct format (currency symbol + numeric value)
        const priceRegex = /^\d+(?:\s?\d{3})*(?:\.\d{2})?$/;
        if (!priceRegex.test(price.slice(1))) {  // Remove the currency symbol for validation
            throw new Error(`❌ Invalid price format detected: ${price}`);
        }

        // Remove the currency symbol and convert the price to a number
        return parseFloat(price.slice(1));
    });

    return { currency, priceValues };
}

/**
 * Function to validate if the price is in correct format
 * It checks that the price has only digits, optional spaces as thousand separators, and a decimal point.
 *
 * @param {string} price
 * @returns {boolean}
 */
function isValidPrice(price: string): boolean {
    // Regex to validate price format (digits, optional space, optional decimal)
    const priceRegex = /^\d+(?:\s?\d{3})*(?:\.\d{2})?$/;

    return priceRegex.test(price);
}


/**
 * Sort a List with number
 *
 * @export
 * @param {number[]} numbers 
 * @param {('asc' | 'desc')} [order='asc'] 
 * @returns {number[]} 
 */
export function sortNumbers(numbers: number[], order: 'asc' | 'desc' = 'asc'): number[] {
    return numbers.sort((a, b) => {
        if (order === 'asc') {
            return a - b; // 
        } else {
            return b - a; // 
        }
    });
}


/**
 * Sort a list with string
 *
 * @export
 * @param {string[]} strings 
 * @param {('AtoZ' | 'ZtoA')} [order='AtoZ'] 
 * @returns {string[]} 
 */
export function sortStrings(strings: string[], order: 'AtoZ' | 'ZtoA' = 'AtoZ'): string[] {
    return strings.sort((a, b) => {
        if (order === 'AtoZ') {
            return a.localeCompare(b); 
        } else {
            return b.localeCompare(a); 
        }
    });
}