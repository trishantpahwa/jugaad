const assert = require("assert");
const { before, describe, it } = require("mocha");
const { get, put } = require("axios");
const { readFileSync } = require("fs");

const BASE_URL = "http://localhost:3000/api/";

let tokens;

describe("Test the APIs of the web application.", () => {
  before(() => {
    console.log("Starting API tests...");
    console.log("Fetching token");
    tokens = JSON.parse(readFileSync("tokens.json"));
  });

  it("PUT /project", async () => {
    const response = await put(
      `${BASE_URL}project`,
      {
        username: "trishantpahwa",
        repository: "express-generator",
      },
      {
        headers: {
          Authorization: `Bearer ${tokens.jwt}`,
        },
      }
    );
    assert.equal(response.data.success, true);
  });
  it("GET /projects", async () => {
    const response = await get(`${BASE_URL}projects`, {
      headers: {
        Authorization: `Bearer ${tokens.jwt}`,
      },
    });
    assert.equal(response.data.success, true);
  });
  it("GET /contributions", async () => {
    const response = await get(`${BASE_URL}contributions`, {
      headers: {
        Authorization: `Bearer ${tokens.jwt}`,
      },
    });
    assert.equal(response.data.success, true);
  });
  it("PUT /contributor", async () => {
    const response = await put(
      `${BASE_URL}contributor`,
      {
        username: "trishantpahwa",
        repository: "express-generator",
      },
      {
        headers: {
          Authorization: `Bearer ${tokens.jwt}`,
        },
      }
    );
    console.log(response.data);
    // assert.equal(response.data.success, true);
  });
  it("GET /contributors", async () => {
    const response = await get(`${BASE_URL}contributors`, {
      headers: {
        Authorization: `Bearer ${tokens.jwt}`,
      },
    });
    assert.equal(response.data.success, true);
  });
});
