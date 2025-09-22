// 定義環境變數的類型
declare global {
    interface ImportMetaEnv {
      VITE_APP_API_URL: string;
      VITE_APP_WS_URL: string;
      VITE_APP_PLAY_URL: string;
    }
  }
  
  const apiBaseUrl: string = import.meta.env.VITE_APP_API_URL || '';
  const apiWsUrl: string = import.meta.env.VITE_APP_WS_URL || '';
  const apiPlayer: string = import.meta.env.VITE_APP_PLAY_URL || '';
  
  /**
   * 構建後端 API URL
   * @param url - API 路徑
   * @returns 完整的 API URL
   */
  export const backendApi = (url: string): string => {
    try {
      const myUrl = `${apiBaseUrl}${url}`;
      return myUrl;
    } catch (error) {
      console.error('Error building API URL:', error);
      return '';
    }
  };

    /**
   * 構建會員後端 API URL
   * @param url - API 路徑
   * @returns 完整的 API URL
   */
  export const playerApi = (url: string): string => {
    try {
      const myUrl = `${apiPlayer}${url}`;
      return myUrl;
    } catch (error) {
      console.error('Error building API URL:', error);
      return '';
    }
  };
  
  /**
   * 構建 WebSocket API URL
   * @param url - WebSocket 路徑
   * @returns 完整的 WebSocket URL
   */
  export const wsApi = (url: string): string => {
    try {
      const myUrl = `${apiWsUrl}${url}`;
      return myUrl;
    } catch (error) {
      console.error('Error building WebSocket URL:', error);
      return '';
    }
  };
  
  /**
   * 獲取 API 工具函數
   */
  export function useApi() {
    /**
     * 獲取授權頭信息
     * @returns 包含授權信息的頭部對象
     */
    const getAuthHeaders = (): Record<string, string> => {
      const token = localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    };
  
    /**
     * 發送 GET 請求
     * @param url - 請求 URL
     * @param options - 請求選項
     * @returns Promise 包含響應數據
     */
    const get = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
      const headers: HeadersInit = {
        ...getAuthHeaders(),
        ...options.headers
      };
  
      try {
        const response = await fetch(url, {
          method: "GET",
          headers,
          ...options
        });
  
        if (!response.ok) {
          handleErrorResponse(response);
        }
  
        return response.json() as Promise<T>;
      } catch (error) {
        console.error("API request error:", error);
        throw error;
      }
    };
  
    /**
     * 發送 POST 請求
     * @param url - 請求 URL
     * @param data - 請求數據
     * @param options - 請求選項
     * @returns Promise 包含響應數據
     */
    const post = async <T, D = any>(url: string, data: D, options: RequestInit = {}): Promise<T> => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options.headers as Record<string, string>
      };
  
      try {
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(data),
          ...options
        });
  
        if (!response.ok) {
          handleErrorResponse(response);
        }
  
        return response.json() as Promise<T>;
      } catch (error) {
        console.error("API request error:", error);
        throw error;
      }
    };
  
    /**
     * 處理錯誤響應
     * @param response - 響應對象
     */
    const handleErrorResponse = (response: Response): never => {
      if (response.status === 401) {
        // 未授權，可能需要重新登入
        console.error("Unauthorized access, redirecting to login");
        // 可以在這裡添加重定向到登入頁面的邏輯
        // window.location.href = '/login';
      } else if (response.status === 403) {
        // 禁止訪問
        console.error("Access forbidden");
      } else if (response.status === 404) {
        // 資源不存在
        console.error("Resource not found");
      } else {
        // 其他錯誤
        console.error(`HTTP error: ${response.status}`);
      }
      
      throw new Error(`HTTP error: ${response.status}`);
    };
  
    /**
     * 獲取當前環境
     * @returns 當前環境名稱
     */
    const getCurrentEnvironment = (): string => {
      return import.meta.env.VITE_APP_ENV || 'development';
    };
  
    return {
      get,
      post,
      getCurrentEnvironment
    };
  }