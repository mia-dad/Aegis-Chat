import { ExecuteRequest, ExecuteResponse } from '../types';

export const executeAgent = async (request: ExecuteRequest): Promise<ExecuteResponse> => {
  try {
    const response = await fetch('/api/agent/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorBody = await response.json();
        if (errorBody.message || errorBody.error) {
          errorMessage = errorBody.message || errorBody.error;
        }
      } catch (e) {
        // Fallback to text if JSON parsing fails
        const textBody = await response.text();
        if (textBody) errorMessage = textBody;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data as ExecuteResponse;
  } catch (error: any) {
    console.error('API Execution Error:', error);
    return {
      status: 'FAILED',
      success: false,
      error: error.message || 'Failed to connect to server.',
      durationMs: 0
    };
  }
};

export const checkServiceStatus = async () => {
  try {
    // Attempt to check service health. 
    // If /api/health is not implemented, this might 404 or fail, which is handled.
    const response = await fetch('/api/health');
    return { available: response.ok };
  } catch (error) {
    console.warn('Health check failed:', error);
    return { available: false };
  }
};