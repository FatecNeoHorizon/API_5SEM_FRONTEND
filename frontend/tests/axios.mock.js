// frontend/tests/axios.mock.js

// Objeto base de mock
const axiosMockInstance = {
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Exporta de forma compatível com import default e require
module.exports = {
  __esModule: true,
  default: axiosMockInstance,
  ...axiosMockInstance,
};
