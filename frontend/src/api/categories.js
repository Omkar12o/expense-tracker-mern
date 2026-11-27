import client from './client';

export const categoriesApi = {
  async list() {
    const { data } = await client.get('/categories');
    return data.data;
  },
  async create(payload) {
    const { data } = await client.post('/categories', payload);
    return data.data.category;
  },
  async remove(id) {
    await client.delete(`/categories/${id}`);
  },
};
