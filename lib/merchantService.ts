import { marketAPI } from './marketApi';

export const checkMerchantAccess = async () => {
  
  try {
    // Ensure the absolute path string perfectly mirrors Django's final regex pattern with a trailing slash
    const res = await marketAPI.get('/market/store/status/'); 
    
    // Explicit safety assertion block
    if (res && res.data) {
      return {
        exists: res.data.exists ?? false,
        is_active: res.data.is_active ?? false
      };
    }
    
    return { exists: false, is_active: false };
  } catch (error: any) {
    if (error.response) {
      // Catching the HTML 404 response safely
      if (typeof error.response.data === 'string' && error.response.data.includes('<!doctype html>')) {
      }
    }
    
    // Fail gracefully back to false instead of letting the application engine throw an unhandled exception
    return { exists: false, is_active: false };
  }
};
