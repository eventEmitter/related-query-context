(function() {
    'use strict';


    let   log   = require('ee-log')
        , Class = require('ee-class')
        , type  = require('ee-types')
        ;


    // valid query modes
    let modes = new Map();


    // please add new items at the end, else were going to 
    // see a big mess if someone has implemented stupid stuff
    // (like using magic numbers)
    ['null', 'select', 'query', 'insert', 'update', 'delete', 'drop', 'alter', 'grant', 'index'].forEach((name, index) => {
        modes.set(name, index);
    });








    module.exports = new Class({

        // the quey mode, used when thq query must
        // be compiled from an object
        mode: 0


        // the sql that msut be executed
        , sql: null


        // the values to be used for paramterized queries
        , _values: null
        , values: {
            get: function() {
                if (!this._values) this._values = [];
                return this._values;
            }
        }


        // the query object definition
        , query: null


        // the pool this connection has to wait in
        , pool: null





        // debugging stuff


        // query id
        , id: null


        // context id, can be used to assing this 
        // query to some stuff outside of the query
        , contextId: null


        // the connection id
        , connectionId: null


        // node Id
        , nodeId: null


        // the time when this query was defined
        , creationTime: 0


        // the time this query has been executed
        , executionTime: 0


        // the time the execution has fininshed
        , finishTime: 0




        // query results


        // the resilts of the query
        , data: null


        // the error returned from the db
        , err: null





        // the context status
        // unitialized, queued, executing, expired, errored, finished
        , status: 'uninitialized'




        , init: function(queryDefinition) {
            if (type.object(queryDefinition)) {
                if (queryDefinition.mode) {
                    if (!modes.has(queryDefinition.mode)) throw new Error(`The mode «${queryDefinition.mode}» does not exist!`);
                    else this.mode = queryDefinition.mode;
                }

                if (queryDefinition.sql) {
                    if (!type.string(queryDefinition.sql)) throw new Error(`SQL must be typeof string, got ${type(queryDefinition.sql)}!`);
                    else this.sql = queryDefinition.sql;
                }


                if (queryDefinition.query) {
                    if (!type.object(queryDefinition.query)) throw new Error(`the query must be typeof object, got ${type(queryDefinition.query)}!`);
                    else this.query = queryDefinition.query;
                }


                if (queryDefinition.pool) {
                    if (!type.string(queryDefinition.pool)) throw new Error(`the pool must be typeof string, got ${type(queryDefinition.pool)}!`);
                    else this.pool = queryDefinition.pool;
                }
            }


            // record the time we where created
            this.creationTime = Date.now();
        }




        , isValid: function() {
            return !!this.sql;
        }



        , invalidBecauseOf: function() {
            return 'No SQL to execute!';
        }



        , setStatus: function(status, err, data) {

            switch (status) {
                case 'before-execute':
                    this.executionTime = Date.now();
                    this.status = 'executing';
                    break;

                case 'after-execute':
                    this.finishTime = Date.now();
                    this.err = err;
                    this.data = data;
                    this.status = err? 'errored' : 'finished';
                    break;


                default:
                    throw new Error(`Ìnvalid status ${status}!`);
            }
        }
    });

    



    // export as static properties
    modes.forEach((value, key) => {
        module.exports[key] = value;
    });


    // return a name  for the int of a mode
    module.exports.mode = function(input) {
        return modes.has(input) ? modes.get(input) : null;
    }

})();
