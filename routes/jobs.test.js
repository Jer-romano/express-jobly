"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 500,
    equity: 0.05,
    company_handle: "c1"
  };

  const queriedJob = {
    id: 4,
    title: "new",
    salary: 500,
    equity: "0.05",
    companyHandle: "c1"
  };

  test("ok for admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({ job: queriedJob });
  });

  test("bad request - user is not an admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "something",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: "new",
            salary: -500,
            company_handle: "c1"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
                id: 1,
                title: "t1",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1"
            },
            {
                id: 2,
                title: "t2",
                salary: 200,
                equity: "0.1",
                companyHandle: "c2"
            },
            {
                id: 3,
                title: "Professor",
                salary: 300,
                equity: "0",
                companyHandle: "c2"
            }
          ],
    });
  });

  test("works: filtering by title", async function() {
    const resp = await request(app)
        .get("/jobs?titleLike=t1");
    expect(resp.body).toEqual({
        jobs:
            [
                {
                    id: 1,
                    title: "t1",
                    salary: 100,
                    equity: "0.1",
                    companyHandle: "c1"
                }
            ]
    });
   });

   test("works: filtering by minSalary", async function() {
    const resp = await request(app)
        .get("/jobs?minSalary=150");
    expect(resp.body).toEqual({
        jobs:
            [
                {
                    id: 2,
                    title: "t2",
                    salary: 200,
                    equity: "0.1",
                    companyHandle: "c2"
                },
                {
                    id: 3,
                    title: "Professor",
                    salary: 300,
                    equity: "0",
                    companyHandle: "c2"
                }
            ]
    });
   });

   test("works: filtering by hasEquity", async function() {
    const resp = await request(app)
        .get("/jobs?hasEquity=true");
    expect(resp.body).toEqual({
        jobs:
            [
                {
                    id: 1,
                    title: "t1",
                    salary: 100,
                    equity: "0.1",
                    companyHandle: "c1"
                },
                {
                    id: 2,
                    title: "t2",
                    salary: 200,
                    equity: "0.1",
                    companyHandle: "c2"
                }
            ]
    });
   });

   test("works: filtering by title, minSalary, hasEquity",
    async function() {
    const resp = await request(app)
        .get("/jobs?titleLike=t&minSalary=150&hasEquity=true");
    expect(resp.body).toEqual({
        jobs:
            [
                {
                    id: 2,
                    title: "t2",
                    salary: 200,
                    equity: "0.1",
                    companyHandle: "c2"
                }
            ]
    });
   });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

 /************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "t1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1"
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/99`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "t1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "t1-new",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1"
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for regular user", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "C1-new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/99`)
        .send({
          title: "new title",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          id: 47
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on company_handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          company_handle: "c3"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          salary: -100
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:handle */

describe("DELETE /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ "deleted job": "1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for regular user", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/99`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
