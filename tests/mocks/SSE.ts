
export function mockSSEmanager() {
  jest.mock("../../src/modules/sse/SSEManager", () => {
    return {
      SSEManager: {
        init: jest.fn(),
        emit: jest.fn()
      }
    }
  })
}