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




module.exports = { sqlForPartialUpdate, queryBuilder };
