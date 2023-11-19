const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function() {
    test("works", function() {
        const data =  {firstName: 'Aliya', age: 32};
        const colNames = {firstName: "first_name"};

        const res = sqlForPartialUpdate(data, colNames);
        expect(res.setCols).toEqual(`"first_name"=$1, "age"=$2`);
        expect(res.values).toEqual(['Aliya', 32]);
    })

    test("works for boolean columns", function() {
        const data =  {firstName: 'Aliya', isAdmin: true};
        const colNames = {firstName: "first_name", isAdmin: "is_admin"};

        const res = sqlForPartialUpdate(data, colNames);
        expect(res.setCols).toEqual(`"first_name"=$1, "is_admin"=$2`);
        expect(res.values).toEqual(['Aliya', true]);
    })

    test("throws error if no data supplied", function() {
        try {
            const data =  {};
            const colNames = {};
            sqlForPartialUpdate(data, colNames);
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
        //expect().toThrow(BadRequestError);
    });

});