import * as SecureStore from "expo-secure-store";
class ApiService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async  getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const token = await SecureStore.getItemAsync("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }



  private async handleResponse<T>(res: Response): Promise<T> {
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      throw new Error(`Invalid JSON response: ${text}`);
    }

    if (!res.ok) {
      throw new Error(data.message || `HTTP error ${res.status}`);
    }

    return data;
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: await this.getHeaders(),
    });
    return this.handleResponse<T>(res);
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(res);
  }

  async put<T>(endpoint: string, body: any, token?: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: await this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(res);
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: await this.getHeaders(),
    });
    return this.handleResponse<T>(res);
  }
}

export const api = new ApiService("https://myapartment.mnptechs.com/api/v1");
