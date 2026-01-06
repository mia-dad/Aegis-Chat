import { ExecuteRequest, ExecuteResponse } from '../types';

// Sleep helper to simulate network latency
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const executeAgent = async (request: ExecuteRequest): Promise<ExecuteResponse> => {
  await sleep(1000 + Math.random() * 1000); // 1-2s delay

  // 1. Resume Execution Logic (Handling User Input)
  if (request.executionId && request.userInput) {
    // Scenario: Sales Report Flow - Step 2 (After Region selected)
    if (request.executionId === 'exec-sales-step-1' && request.userInput.region) {
      return {
        status: 'WAITING_FOR_INPUT',
        skillId: 'sales_report_generator',
        intent: 'sales_report',
        executionId: 'exec-sales-step-2',
        awaitMessage: `You selected **${request.userInput.region}**. Now, please specify the analysis period (e.g., 2024Q1).`,
        inputSchema: {
          period: { type: 'string', required: true, description: 'Period (e.g., 2024Q1)' }
        },
        durationMs: 450,
        success: true,
        error: null
      };
    }

    // Scenario: Sales Report Flow - Final (After Period selected)
    if (request.executionId === 'exec-sales-step-2' && request.userInput.period) {
       return {
        status: 'COMPLETED',
        skillId: 'sales_report_generator',
        intent: 'sales_report',
        durationMs: 1200,
        success: true,
        error: null,
        output: {
          type: 'document',
          version: 'v1',
          blocks: [
            {
              type: 'paragraph',
              text: `### Sales Report - ${request.userInput.period}\n\nHere is the performance analysis you requested. The region shows strong growth compared to previous quarters.`
            },
            {
              type: 'chart',
              chart: {
                type: 'bar',
                title: 'Monthly Revenue (Million USD)',
                x: ['Jan', 'Feb', 'Mar'],
                series: [
                  { name: 'Revenue', data: [120, 132, 101] },
                  { name: 'Target', data: [100, 100, 100] }
                ]
              }
            },
             {
              type: 'paragraph',
              text: `> Note: Data is preliminary and subject to audit.`
            },
          ]
        }
      };
    }
    
    // Fallback for unknown execution ID
    return {
        status: 'FAILED',
        success: false,
        error: 'Execution session expired or invalid.',
        durationMs: 100
    };
  }

  // 2. New Execution Logic
  if (request.query) {
    const queryLower = request.query.toLowerCase();

    // Trigger Multi-turn Flow
    if (queryLower.includes('sales') || queryLower.includes('report')) {
      return {
        status: 'WAITING_FOR_INPUT',
        skillId: 'sales_report_generator',
        intent: 'sales_report',
        executionId: 'exec-sales-step-1',
        awaitMessage: 'I can help with the sales report. Which **Region** would you like to analyze?',
        inputSchema: {
          region: { type: 'string', required: true, description: 'Region (e.g. North America, APAC)' },
          includeForecast: { type: 'boolean', required: false, description: 'Include 2025 Forecast?' }
        },
        durationMs: 600,
        success: true,
        error: null
      };
    }

    // Trigger Chart Document Flow directly
    if (queryLower.includes('market') || queryLower.includes('analysis')) {
      return {
        status: 'COMPLETED',
        skillId: 'market_analysis',
        intent: 'market_analysis',
        durationMs: 1500,
        success: true,
        error: null,
        output: {
          type: 'document',
          version: 'v1',
          blocks: [
            {
              type: 'paragraph',
              text: '## Market Analysis\n\nThe current market trend indicates a significant uptake in AI-driven solutions. Below is the trend analysis for the last 5 years.'
            },
            {
              type: 'chart',
              chart: {
                type: 'line',
                title: 'Market Share Trend (%)',
                x: ['2020', '2021', '2022', '2023', '2024'],
                series: [
                  { name: 'Aegis Corp', data: [15, 22, 35, 45, 58] },
                  { name: 'Competitor X', data: [40, 35, 30, 25, 20] }
                ]
              }
            }
          ]
        }
      };
    }

    // Default Chat
    return {
      status: 'COMPLETED',
      skillId: 'chat',
      intent: 'chat',
      durationMs: 300,
      success: true,
      error: null,
      output: {
        type: 'document',
        version: 'v1',
        blocks: [
          {
            type: 'paragraph',
            text: `I understood: "${request.query}".\n\nI am the Aegis Agent. I can generate **Sales Reports** or perform **Market Analysis**. Try asking: \n\n* "Generate a sales report"\n* "Show me market analysis"`
          }
        ]
      }
    };
  }

  return {
    status: 'FAILED',
    success: false,
    error: 'Empty query.',
    durationMs: 0
  };
};

export const checkServiceStatus = async () => {
    await sleep(500);
    return { available: true };
}