import { jest } from "@jest/globals";

describe("validateEnv Unit Tests", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = {};
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should pass without throwing an error if all required variables are present", async () => {
    process.env.PORT = "3000";
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgres://localhost:5432/db";
    process.env.JWT_SECRET = "supersecretkey";

    let error: any = null;
    try {
      // The query string forces the ESM loader to completely bypass module caching
      await import(`../../config/validateEnv.js?update=${Date.now()}`);
    } catch (err) {
      error = err;
    }

    expect(error).toBeNull();
  });

  it("should throw a specific error if PORT is missing", async () => {
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgres://localhost:5432/db";
    process.env.JWT_SECRET = "supersecretkey";

    let error: any = null;
    try {
      await import(`../../config/validateEnv.js?update=${Date.now()}`);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toContain("Missing required environment variable: PORT");
  });

  it("should throw a specific error if JWT_SECRET is missing", async () => {
    process.env.PORT = "3000";
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgres://localhost:5432/db";

    let error: any = null;
    try {
      await import(`../../config/validateEnv.js?update=${Date.now()}`);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toContain("Missing required environment variable: JWT_SECRET");
  });
});