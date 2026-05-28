import request from "supertest";
import { describe, it, expect, afterAll } from '@jest/globals';
import sequelize from '../../database/connection/database.js';
import app from "../../app.js";

describe("Auth APIs", () => {
 
  const uniqueId = Date.now();
  const testEmail = `test_${uniqueId}@gmail.com`;
  const testPassword = "Password@123";

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        gmail: testEmail, 
        password: testPassword,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it("should login user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        gmail: testEmail,
        password: testPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  afterAll(async () => {
    try {
      await sequelize.close(); 
      console.log('Database connection pool closed safely.');
    } catch (error) {
      console.error('Error closing database connections:', error);
    }
  });
});