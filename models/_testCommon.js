const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await db.query("ALTER SEQUENCE jobs_id_seq RESTART WITH 1");

  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query("DELETE FROM jobs");

  await db.query(`
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
           ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
           ('c3', 'C3', 3, 'Desc3', 'http://c3.img'),
           ('homedepot', 'Home Depot', 2, 'Desc4', 'http://c4.img'),
           ('lowes', 'Lowes', 5, 'Desc5', 'http://c5.img')`);

  await db.query(`
      INSERT INTO jobs(title, salary, equity, company_handle)
      VALUES ('Engineer', 200, 0.1, 'c2'),
             ('Secretary', 50, 0.01, 'c2'),
             ('CEO', 300, 0.2, 'c3')`);

  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};