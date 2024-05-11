using {sap.capire.bookshop as my} from '../db/data-model';

service CatalogService {
    entity Books @(odata.draft.enabled: true) as projection on my.Books;
    entity Authors                            as projection on my.Authors;
    entity ProductSet                         as projection on my.product;
    entity Poitems                            as projection on my.poitems;
    entity purchaseorder                      as projection on my.purchaseorder;


    @readonly
    entity ReadEmployeeSrv                    as projection on my.employees;
    entity InsertEmployeeSrv                  as projection on my.employees;
    entity UpdateEmployeeSrv                  as projection on my.employees;
    entity DeleteEmployeeSrv                  as projection on my.employees;

    action   submitOrder(book : Books:ID, quantity : Integer) returns {
        stock : Integer
    }; // Added Actions

    function hello(to : String)                               returns String; // Added functions
    function sleep()                                          returns Boolean;
    function getBooksData(passingId : Integer)                returns String;


}