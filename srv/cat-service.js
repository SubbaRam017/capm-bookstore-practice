
class CatalogService extends cds.ApplicationService {
    init() {

        const { Books } = cds.entities('sap.capire.bookshop');
        const { employees } = cds.entities("sap.capire.bookshop");
        const { v4: uuidv4 } = require('uuid');
        const { ListOfBooks } = this.entities
        const cfLogging = require('cf-nodejs-logging-support');
        const dbClass = require('sap-hdbext-promisfied');
        const hdbext = require('@sap/hdbext');

        const { ReadEmployeeSrv } = this.entities;

        // Add some discount for overstocked books
        this.after('each', ListOfBooks, book => {
            if (book.stock > 10) book.title += ` -- 11% discount!`
        })

        // Reduce stock of ordered books if available stock suffices
        this.on('submitOrder', async req => {
            let { book: id, quantity } = req.data
            let book = await SELECT.from(Books, id, b => b.stock)

            // Validate input data
            if (!book) return req.error(404, `Book #${id} doesn't exist`)
            if (quantity < 1) return req.error(400, `quantity has to be 1 or more`)
            if (quantity > book.stock) return req.error(409, `${quantity} exceeds stock for book #${id}`)

            // Reduce stock in database and return updated stock value
            await UPDATE(Books, id).with({ stock: book.stock -= quantity })
            return book
        })

        /**
         * Hello Function With Return Paramter
         */
        this.on('hello', (req) => {
            return "Hello " + req.data.to + "!";
        });

        /**
         * Function For Sleep your code for few minutes
         */
        this.on('getBooksData', async (req) => {
            try {
                cfLogging.setLoggingLevel("Info");
                cfLogging.info("Calling Procedure");
                let id = req.data.passingId;

                /***
                 *          req Is Parameter will Hold All passing parameters and paylod 
                 *          if URL parameters are passed those all are captured using req.data.prametername
                 *          if body is passed it will be captured under req.body
                 *  */

                const db = await cds.connect.to('db'); // CDS Offers a Method to connect to Database , Which will share the credentials 

                let dbConn = new dbClass(await dbClass.createConnection(db.options.credentials)); // dbClass is creates the connection <- Which Required a Credentials which will be used from db parameter
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'book'); // loadProcedurePromisified 
                const output = await dbConn.callProcedurePromisified(sp, [id]);// Passing Argunments 
                console.log(output);
                return output;
            } catch (error) {
                console.log(error);
                return false;
            }
        });


        this.on("READ", ReadEmployeeSrv, async () => {

            var results = [];
            results.push({
                "ID": "02BD213-0809-1EEA-ACDDD-4546546654DSD5",
                "nameFirst": "Virat",
                "nameLast": "Kohli"
            });

            return results;

        });

        this.on("CREATE", "InsertEmployeeSrv", async (req, res) => {
            console.log(req.data);
            var dataSet = [];
            const element = req.data;
            element.ID = uuidv4();;
            dataSet.push(element);
            console.log(dataSet);
            let returnData = await cds.transaction(req).run([
                INSERT.into(employees).entries([req.data])
            ]).then((resolve, reject) => {
                console.log("inserted");
                if (typeof (resolve) !== undefined) {
                    return req.data;
                } else {
                    req.error(500, "There was an issue in insert");
                }
            }).catch(err => {
                req.error(500, "there was an error " + err.toString());
            });

            return returnData;

        });


        this.on("UPDATE", "UpdateEmployeeSrv", async (req, res) => {

            let returnData = await cds.transaction(req).run([

                UPDATE(employees).set({
                    nameFirst: req.data.nameFirst
                }).where({ ID: req.data.ID }),

                UPDATE(employees).set({
                    nameLast: req.data.nameLast
                }).where({ ID: req.data.ID })

            ]).then((resolve, reject) => {
                if (typeof (resolve) !== undefined) {
                    return req.data;
                } else {
                    req.error(500, "There was an issue in insert");
                }
            }).catch(err => {
                req.error(500, "there was an error " + err.toString());
            });

            return returnData;

        });

        this.on("DELETE", "DeleteEmployeeSrv", async (req, res) => {

            let returnData = await cds.transaction(req).run([

                DELETE.from(employees).where(req.data)

            ]).then((resolve, reject) => {
                if (typeof (resolve) !== undefined) {
                    return req.data;
                } else {
                    req.error(500, "There was an issue in insert");
                }
            }).catch(err => {
                req.error(500, "there was an error " + err.toString());
            });

            return returnData;

        });
        // Delegate requests to the underlying generic service
        return super.init()
    }
}

module.exports = CatalogService;