import client from './client';

export const authApi = {
  async register(payload) {
    const { data } = await client.post('/auth/register', payload);
    return data.data;
  },
  async login(payload) {
    const { data } = await client.post('/auth/login', payload);
    return data.data;
  },
  async me() {
    const { data } = await client.get('/auth/me');
    return data.data.user;
  },
  async logout() {
    await client.post('/auth/logout');
  },
};
