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
describe("create", function() {
    const newJob = {
        title: "Secretary",
        salary: 100,
        equity: 0.1,
        company_handle: 'c1'
    }
    const newJobWithID = {
        id: 4,
        title: "Secretary",
        salary: 100,
        equity: "0.1",
        companyHandle: 'c1'
    }

    test("works", async function() {
        const jobRes = await Job.create(newJob);

        expect(jobRes).toEqual(newJobWithID);
        //check to see if it's in the DB
        const result = await db.query(
                            `SELECT id,
                                title,
                                salary,
                                equity,
                                company_handle AS "companyHandle"
                             FROM jobs
                             WHERE id = 4`);
        expect(result.rows[0]).toEqual(newJobWithID);
    });
});
/************************************** findAll */

describe("findAll", function() {
    test("works", async function() {
        const jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: 1,
                title: "Engineer",
                salary: 200,
                equity: '0.1',
                companyHandle: 'c2'
            },
            {
                id: 2,
                title: "Secretary",
                salary: 50,
                equity: '0.01',
                companyHandle: 'c2'
            },
            {
                id: 3,
                title: "CEO",
                salary: 300,
                equity: '0.2',
                companyHandle: 'c3'
            }
        ])
    }); 
});
/************************************** get */

describe("get", function() {
    test("works", async function() {
        const job = await Job.get(1);
        expect(job).toEqual({
            id: 1,
            title: "Engineer",
            salary: 200,
            equity: '0.1',
            companyHandle: 'c2'
        });
    });

    test("not found if no such job", async function() {
        try {
            await Job.get(999);
            fail(); 
        } catch(err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    }); 

});
/************************************** update */

describe("update", function() {
    const updateData = {
        title: "Best Engineer",
        salary: 500,
        equity: "0.01"
    }
    test("works", async function() {
        const result = await Job.update(1, updateData);

        expect(result).toEqual({
            id: 1,
            ...updateData,
            companyHandle: 'c2'
        });

        const query = await db.query(
            `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
            FROM jobs
            WHERE id = 1`);
        expect(query.rows[0]).toEqual({
            id: 1,
            ...updateData,
            companyHandle: 'c2'
        });
    });

    test("not found if no such job", async function () {
        try {
          await Job.update(999, updateData);
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
    
    test("bad request with no data", async function () {
        try {
            await Job.update(2, {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

});
/************************************** remove */

describe("remove", function() {
    test("works", async function() {
        await Job.remove(2);
        const res = await db.query(`
            SELECT title FROM jobs WHERE id = 2`);
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such job", async function () {
        try {
          await Job.remove(99);
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });

});


