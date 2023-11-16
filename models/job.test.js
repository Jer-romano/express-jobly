"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe("Create", function() {
    const newJob = {
        title: "Secretary",
        salary: 100,
        equity: 0.1,
        company_handle: 'c1'
    }
    const newJobWithID = {
        id: 1,
        title: "Secretary",
        salary: 100,
        equity: "0.1",
        companyHandle: 'c1'
    }

    test("works", async function() {
        const jobRes = await Job.create(newJob);

        expect(jobRes).toEqual(newJobWithID);

        const result = await db.query(`SELECT id,
                                              title,
                                              salary,
                                              equity,
                                              company_handle
                                              FROM jobs
                                              WHERE id = 1
                                              `);
        expect(result.rows[0]).toEqual({
            id: 1,
            title: "Secretary",
            salary: 100,
            equity: "0.1",
            company_handle: 'c1'
        });
    });


});