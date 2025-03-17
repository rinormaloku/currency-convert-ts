type CurrencyCode = string;
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
/**
 * Currency converter tool executor function
 * This function will be called when the agent uses the convertCurrency tool
 */
declare function convertCurrencyExecutor({ amount, fromCurrency, toCurrency, publishToClient, }: ConversionRequest): Promise<string>;
/**
 * Currency converter tool definition
 * This follows the ToolDefinition interface from @agentframework/core
 */
declare const convertCurrencyTool: {
    name: string;
    toolDefinition: {
        type: string;
        function: {
            name: string;
            description: string;
            strict: boolean;
            parameters: {
                type: string;
                properties: {
                    amount: {
                        type: string;
                        description: string;
                    };
                    fromCurrency: {
                        type: string;
                        description: string;
                    };
                    toCurrency: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
        };
    };
    executor: typeof convertCurrencyExecutor;
};
export { convertCurrencyTool, ConversionRequest, ConversionResult, CurrencyCode, ExchangeRateResponse };
