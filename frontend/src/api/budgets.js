import client from './client';

export const budgetsApi = {
  async list(month) {
    const { data } = await client.get('/budgets', { params: month ? { month } : {} });
    return data.data;
  },
  async set(payload) {
    const { data } = await client.put('/budgets', payload);
    return data.data.budget;
  },
  async remove(id) {
    await client.delete(`/budgets/${id}`);
  },
};
