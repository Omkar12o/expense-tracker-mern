import client from './client';

export const accountsApi = {
  async list() {
    const { data } = await client.get('/accounts');
    return data;
  },
  async create(payload) {
    const { data } = await client.post('/accounts', payload);
    return data.data.account;
  },
  async update(id, payload) {
    const { data } = await client.patch(`/accounts/${id}`, payload);
    return data.data.account;
  },
  async remove(id) {
    await client.delete(`/accounts/${id}`);
  },
};
