/**
 * Currency Conversion Tool (TypeScript Version)
 * This example tool converts amounts between different currencies using real exchange rates
 */
import axios from 'axios';

// Type definitions
type CurrencyCode = string; // Supporting all currency codes from the API

interface ConversionRequest {
  amount: number;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  publishToClient?: (data: any) => void;
}

interface ExchangeRateResponse {
  provider: string;
  base: string;
  date: string;
  time_last_updated: number;
  rates: Record<string, number>;
}

interface ConversionResult {
  amount: number;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: number;
  equivalentString: string;
  timestamp: string;
  lastUpdated: string | null;
  provider: string;
}

interface SuccessResponse {
  data: ConversionResult;
}

interface ErrorResponse {
  error: {
    message: string;
    details: any | null;
  };
}

type ToolResponse = SuccessResponse | ErrorResponse;

/**
 * Currency converter tool executor function
 * This function will be called when the agent uses the convertCurrency tool
 */
async function convertCurrencyExecutor({
  amount,
  fromCurrency,
  toCurrency,
  publishToClient,
}: ConversionRequest): Promise<string> {
  try {
    // If you want to publish progress or updates to the client
    if (publishToClient) {
      publishToClient({
        type: 'progress',
        data: {
          message: `Fetching current exchange rates...`,
          progress: 25
        }
      });
    }

    // Fetch the latest exchange rates from the API
    let response = await axios.get<ExchangeRateResponse>(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );

    const exchangeRateData = response.data;

    // Check if the API returned data successfully
    if (!exchangeRateData || !exchangeRateData.rates) {
      throw new Error('Failed to fetch exchange rates');
    }

    // Check if the target currency is supported
    if (!exchangeRateData.rates[toCurrency]) {
      throw new Error(`Conversion to ${toCurrency} is not supported`);
    }

    // Get the exchange rate for the target currency
    const rate = exchangeRateData.rates[toCurrency];

    // Calculate the converted amount
    const convertedAmount = amount * rate;

    // Format the result to 2 decimal places
    const formattedAmount = parseFloat(convertedAmount.toFixed(2));

    // Return the result as a JSON string
    const responseJs: SuccessResponse = {
      data: {
        amount: formattedAmount,
        fromCurrency,
        toCurrency,
        rate,
        equivalentString: `${amount} ${fromCurrency} = ${formattedAmount} ${toCurrency}`,
        timestamp: new Date().toISOString(),
        lastUpdated: exchangeRateData.time_last_updated
          ? new Date(exchangeRateData.time_last_updated * 1000).toISOString()
          : null,
        provider: exchangeRateData.provider || 'Exchange Rate API'
      }
    };

    return JSON.stringify(responseJs);
  } catch (error) {
    console.error('Currency conversion error:', error);

    // Handle errors and return them as a structured JSON response
    const errorResponse: ErrorResponse = {
      error: {
        message: error instanceof Error ? error.message : 'Failed to convert currency',
        details: axios.isAxiosError(error) ? error.response?.data : null
      }
    };

    return JSON.stringify(errorResponse);
  }
}

/**
 * Currency converter tool definition
 * This follows the ToolDefinition interface from @agentframework/core
 */
const convertCurrencyTool = {
  name: 'convert-currency-ts',
  toolDefinition: {
    type: 'function',
    function: {
      name: 'convert-currency-ts',
      description: 'Convert an amount from one currency to another using current exchange rates',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
            description: 'The amount of money to convert',
          },
          fromCurrency: {
            type: 'string',
            description: 'The source currency code (e.g., USD, EUR, GBP)',
          },
          toCurrency: {
            type: 'string',
            description: 'The target currency code (e.g., USD, EUR, GBP)',
          },
        },
        required: ['amount', 'fromCurrency', 'toCurrency'],
        additionalProperties: false,
      },
    },
  },
  executor: convertCurrencyExecutor,
};

// Export the tool so it can be loaded by the ToolLoader
export {
  convertCurrencyTool,
  // Exporting types for documentation purposes
  ConversionRequest,
  ConversionResult,
  CurrencyCode,
  ExchangeRateResponse
};