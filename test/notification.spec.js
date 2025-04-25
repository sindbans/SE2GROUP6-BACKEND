const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

afterAll(async () => {
  await Notification.deleteMany({ title: "Summer Sale" }); // Clean test data
  await mongoose.disconnect();
});

describe("POST /api/notifications/create", () => {
  it("should create a new notification", async () => {
    const res = await request(app)
      .post("/api/notifications/create")
      .send({
        title: "Summer Sale",
        content: "Enjoy 20% off on all tickets!",
        type: "Promotional",
        targetAudience: "All Users",
        startDate: "2025-04-25T00:00:00Z",
        endDate: "2025-05-05T00:00:00Z",
        activateImmediately: true
      })
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Summer Sale");
  });
});
