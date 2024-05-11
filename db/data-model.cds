using {
  Currency,
  managed,
  sap,
  cuid
} from '@sap/cds/common';

namespace sap.capire.bookshop;

type stringX     : String(32);

type Gender      : String(1) enum {
  male         = 'M';
  female       = 'F';
  nonBinary    = 'N';
  noDisclosure = 'D';
  selfDescribe = 'S';
};

type PhoneNumber : String(30) @assert.format: '^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$';
type Email       : String(255) @assert.format: '^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$';

type AmountT     : Decimal(15, 2) @(
  Semantics.amount.currencyCode: 'CURRENCY_CODE',
  sap.unit                     : 'CURRENCY_CODE'
);

aspect Amount {
  CURRENCY_CODE : String(4);
  GROSS_AMOUNT  : AmountT;
  NET_AMOUNT    : AmountT;
  TAX_AMOUNT    : AmountT;
}


entity Books : managed {
  key ID       : Integer; // Primary Key
      title    : localized String(111)  @mandatory;
      descr    : localized String(1111);
      author   : Association to Authors @mandatory;
      genre    : Association to Genres;
      stock    : Integer;
      price    : Decimal;
      currency : Currency;
      image    : LargeBinary            @Core.MediaType: 'image/png';
}

entity Authors : managed {
  key ID           : Integer;
      name         : String(111) @mandatory;
      dateOfBirth  : Date;
      dateOfDeath  : Date;
      placeOfBirth : String;
      placeOfDeath : String;
      books        : Association to many Books
                       on books.author = $self;
}

// /** Hierarchically organized Code List for Genres */
entity Genres : sap.common.CodeList {
  key ID       : Integer;
      parent   : Association to Genres;
      children : Composition of many Genres
                   on children.parent = $self;
}

entity product {
  key NODE_KEY       : stringX;
      PRODUCT_ID     : String(28);
      TYPE_CODE      : String(2);
      CATEGORY       : String(32);
      DESCRIPTION    : localized String(255);
      TAX_TARIF_CODE : Integer;
      MEASURE_UNIT   : String(2);
      WEIGHT_MEASURE : Decimal(5, 2);
      WEIGHT_UNIT    : String(2);
      CURRENCY_CODE  : String(4);
      PRICE          : Decimal(15, 2);
      WIDTH          : Decimal(5, 2);
      DEPTH          : Decimal(5, 2);
      HEIGHT         : Decimal(5, 2);
      DIM_UNIT       : String(2);

}

entity purchaseorder : cuid, Amount {
  PO_ID            : String(24);
  LIFECYCLE_STATUS : String(1);
  OVERALL_STATUS   : String(1);
  NOTE             : String(120);
  Items            : Composition of many poitems
                       on Items.PARENT_KEY = $self
}

entity poitems : cuid, Amount {
  PARENT_KEY   : Association to purchaseorder;
  PO_ITEM_POS  : Integer;
  PRODUCT_GUID : Association to product;

}

entity employees : cuid {
  nameFirst     : String(40);
  nameMiddle    : String(40);
  nameLast      : String(40);
  nameInitials  : String(40);
  sex           : Gender;
  language      : String(1);
  phoneNumber   : PhoneNumber;
  email         : Email;
  loginName     : String(12);
  Currency      : Currency;
  salaryAmount  : AmountT;
  accountNumber : String(16);
  bankId        : String(20);
  bankName      : String(64);
}