import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 5000,
  adapter: async (config) => {
    const mockData =
      typeof config.mockData === 'function'
        ? await config.mockData(config)
        : (config.mockData ?? {});

    // TODO: 替换为真实接口调用
    return {
      data: {
        code: 0,
        message: 'success',
        data: mockData
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {}
    };
  }
});

request.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error?.response?.data || error)
);

export default request;
