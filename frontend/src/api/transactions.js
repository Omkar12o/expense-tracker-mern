import client from './client';

export const transactionsApi = {
  async list(params = {}) {
    const { data } = await client.get('/transactions', { params });
    return data;
  },
  async get(id) {
    const { data } = await client.get(`/transactions/${id}`);
    return data.data.transaction;
  },
  async create(payload) {
    const { data } = await client.post('/transactions', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await client.patch(`/transactions/${id}`, payload);
    return data.data;
  },
  async remove(id) {
    await client.delete(`/transactions/${id}`);
  },
  async exportCsv(params = {}) {
    const response = await client.get('/transactions/export', {
      params,
      responseType: 'blob',
    });
    const disposition = response.headers['content-disposition'] || '';
    const filename = disposition.match(/filename="([^"]+)"/)?.[1] || 'transactions.csv';
    return { blob: response.data, filename };
  },
};
