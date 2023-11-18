const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/**
 * This function helps write SQL Update queries by generating the SET
 * portion of a parameterized query, given the data to update and an 
 * object that maps the JS friendly column names to their SQL equivalent.
 * For example, given the following:
 *    dataToUpdate: {firstName: 'Aliya', age: 32}
 *    jsToSql: {firstName: "first_name"}
 * This function will return the following
 *  {
 *    setCols: ""first_name"=$1, "age"=$2"    
 *    values: ['Aliya', 32] 
 *  }
 * The setCols property of this object can be used inside of a template
 * string to form a parameterized query.    
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}
/**
 * This function helps build a query string where we are filtering
 * companies based on the following three criteria:
 * nameLike: The company name contains the provided string (case-insensitive)
 * minEmployees: The minimum number of employees that a company can have
 * maxEmployees: The maximum number of employees that a company can have
 * @param {*} request 
 * @returns query string
 */
function queryBuilder(request) {
  let queryString = [];
  let numb;
  if(request.nameLike) {
    queryString.push(`name ILIKE '%${request.nameLike}%'`);
  }
  if(request.minEmployees) {
    numb = parseInt(request.minEmployees);
    queryString.push(`num_employees >= ${numb}`);
  }
  if(request.maxEmployees) {
    numb = parseInt(request.maxEmployees);
    queryString.push(`num_employees <= ${numb}`);
  }
  return queryString.join(" AND ");
}

/**
 * Similar to the companies filtering above,
 *  This function aids in filtering jobs on the following possible
 *  criteria:
 * **title***: filter by job title.  case-insensitive, 
 *  matches-any-part-of-string .
 * **minSalary***: filter to jobs with at least that salary.
 * **hasEquity***: if ***true***, filter to jobs that provide a
 *  non-zero amount of equity. If ***false*** or not included in 
 * the filtering, list all jobs regardless of equity.
   @param {*} request
 * @returns query string
 */
function jobQueryBuilder(request) {
  let queryString = [];
  let numb;
  if(request.titleLike) {
    queryString.push(`title ILIKE '%${request.titleLike}%'`);
  }
  if(request.minSalary) {
    numb = parseInt(request.minSalary);
    queryString.push(`salary >= ${numb}`);
  }
  if(request.hasEquity) {
    if(request.hasEquity === "true") {
      queryString.push(`equity > 0.0`);

    }
  }
  return queryString.join(" AND ");
}




module.exports = { sqlForPartialUpdate,
                   queryBuilder,
                   jobQueryBuilder };
