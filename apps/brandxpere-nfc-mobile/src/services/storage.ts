import * as SecureStore from 'expo-secure-store';
import { APP_CONFIG } from '../config/constants';

const TOKEN_KEY = 'bx_admin_token';
const USER_KEY = 'bx_user_profile';
const PIN_KEY = 'bx_master_pin';
const API_URL_KEY = 'bx_api_url';

export const Storage = {
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async saveMasterPin(pin: string): Promise<void> {
    await SecureStore.setItemAsync(PIN_KEY, pin);
  },

  async getMasterPin(): Promise<string> {
    const pin = await SecureStore.getItemAsync(PIN_KEY);
    return pin || APP_CONFIG.DEFAULT_MASTER_PIN;
  },

  async saveApiUrl(url: string): Promise<void> {
    await SecureStore.setItemAsync(API_URL_KEY, url);
  },

  async getApiUrl(): Promise<string> {
    const url = await SecureStore.getItemAsync(API_URL_KEY);
    return url || APP_CONFIG.DEFAULT_API_URL;
  }
};
