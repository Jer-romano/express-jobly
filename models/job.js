"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, queryBuilder } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
      
    /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, job_title }
   * */
  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
            title,
            salary,
            equity,
            company_handle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */
  static async findAll() {
    const jobsRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           ORDER BY title`);
    return jobsRes.rows;
  }

   /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

   static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }

//   static async search(request) {
//     if(request.minEmployees && request.maxEmployees) {
//       if(parseInt(request.minEmployees) > parseInt(request.maxEmployees)) {
//         throw new BadRequestError("minEmployees parameter cannot be greater than maxEmployees parameter.");
//       }
//     }
//     const searchQuery = queryBuilder(request);
//     const jobRes = await db.query(
//       `SELECT title,
//               salary,
//               equity,
//               company_handle AS "numEmployees",
//               logo_url AS "logoUrl"
//        FROM jobs
//        WHERE ${searchQuery}`);

//     const job = jobRes.rows;

//     if (!job) throw new NotFoundError(`No job: ${title}`);

//     return job;
//   }


  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle",
        });
    const titleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${titleVarIdx} 
                      RETURNING id,
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id, title`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);
  }

}

module.exports = Job;
