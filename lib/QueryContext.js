(function() {
    'use strict';


    let   log   = require('ee-log')
        , Class = require('ee-class')
        , type  = require('ee-types')
        ;







    module.exports = new Class({


        // the sql that msut be executed
        sql: null


        // the values to be used for paramterized queries
        , _values: null
        , values: {
            get: function() {
                if (!this._values) this._values = [];
                return this._values;
            }
            , set: function(values) {
                this._values = values;
            }
        }


        // the query object definition
        , query: null


        // the pool this connection has to wait in
        , pool: null





        // debugging stuff


        // indicates if the query requires debugging
        , debug: false


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
                if (queryDefinition.debug) this.debug = true;


                if (queryDefinition.values) {
                    if (!type.array(queryDefinition.values)) throw new Error(`The values must be typeof array, got ${type(queryDefinition.values)}!`);
                    else this.values = queryDefinition.values;
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



        , isReady: function() {
            return !!this.sql;
        }



        , invalidBecauseOf: function() {
            return 'No SQL to execute!';
        }



        , setStatus: function(status, err) {

            switch (status) {
                case 'before-execute':
                    this.executionTime = Date.now();
                    this.status = 'executing';
                    break;

                case 'after-execute':
                    this.finishTime = Date.now();
                    this.status = err? 'errored' : 'finished';
                    if (err) this.err = err;
                    break;


                default:
                    throw new Error(`Ìnvalid status ${status}!`);
            }
        }




        , getWaitTime: function() {
            return this.executionTime - this.creationTime;
        }



        , getExecutionTime: function() {
            return this.finishTime - this.executionTime;
        }
    });
})();
