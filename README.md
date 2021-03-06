# RavenDB client for Node.js

## Installation

```bash
npm install --save ravendb
```

## Getting started

1. Require `DocumentStore` class from package
```javascript
const {DocumentStore} = require('ravendb');
```
or
```javascript
const DocumentStore = require('ravendb').default;
```
or (using ES6 / Typescript imports)
```javascript
import DocumentStore from 'ravendb';
```
2. Initialize document store (this can be kept as a global object)
```javascript
const store = DocumentStore.create('database url', 'default database name');
store.initialize();
```
3. Open a session
```javascript
const session = store.openSession();
```
4. Call `saveChanges()` when you'll finish working with a session
```javascript
session
 .load('Users/1-A')
 .then((user) => {
   user.password = PBKDF2('new password');

   return session.store(user);
 })
 .then(() => session.saveChanges())
 .then(() => {
    // here you can finish request
  });
```

## Supported asynchronous call types
1. You can use callbacks
```javascript
session
 .load('Users/1-A', (user) => {
   user.password = PBKDF2('new password');

   session.store(user, null, () => {
     session.saveChanges(() => {
       // here session is complete
     });
   });
 })
```

2. You can use promises as well
```javascript
session
 .load('Users/1-A')
 .then((user) => {
   user.password = PBKDF2('new password');

   return session.store(user);
 })
 .then(() => session.saveChanges())
 .then(() => {
    // here session is complete
  });
```

3. With `co` library or frameworks using it (such as `AdonisJS`) you can `yield` calls
```javascript
const co = require('co');

// ...

co(function * () {
  session = store.openSession();

  let user = yield store.load('Users/1-A');

  user.password = PBKDF2('new password');
  yield session.store(user);

  yield session.saveChanges();

  // here session is complete
});
```
4. Also client is supporting `async` / `await` stuff
```javascript
async () => {
  session = store.openSession();

  let user = await store.load('Users/1-A');

  user.password = PBKDF2('new password');
  await session.store(user);

  await session.saveChanges();

  // here session is complete
})
```
## CRUD example

### Creating documents
```javascript
let product = {
  title: 'iPhone X',
  price: 999.99,
  currency: 'USD',
  storage: 64,
  manufacturer: 'Apple',
  in_stock: true,
  last_update: new Date('2017-10-01T00:00:00')
};

product = await session.store(product, 'Products/');
console.log(product.id); // will output Products/<some number>-<some letter (server node tag)> e.g. Products/1-A
await session.saveChanges();
```

### Loading documents
```javascript
product = await session.load('Products/1-A');
console.log(product.title); // iPhone X
console.log(product.id); // Products/1-A
```
### Updating documents
```javascript
product = await session.load('Products/1-A');
product.in_stock = false;
product.last_update = new Date();
await session.store(product);
await session.saveChanges();

product = await session.load('Products/1-A');
console.log(product.in_stock); // false
console.log(product.last_update); // outputs current date
```
### Deleting documents
```javascript
product = await session.load('Products/1-A');
await session.delete(product);
// or you can just do
// await session.delete('Products/1-A');
await session.saveChanges();

product = await session.load('Products/1-A');
console.log(product); // undefined
```
## Querying documents
1. Create `DocumentQuery` instance using `query()` method of session:
```javascript
query = session.query({
  collection: 'Products', // specify which collection you'd like to query
  // optionally you may specify an index name for querying
  // indexName: 'PopularProductsWithViewsCount'
});
```
2. Apply conditions, ordering etc. Query supports chaining calls:
```javascript
const {DocumentStore, QueryOperators} = require('ravendb');

// ...

query
  .waitForNonStaleResults()
  .usingDefaultOperator(QueryOperators.And)  
  .whereEquals('manufacturer', 'Apple')
  .whereEquals('in_stock', true)
  .whereBetween('last_update', new Date('2017-10-01T00:00:00'), new Date())
  .orderBy('price');
```
3. Finally, you may get query results:
```javascript
let documents = await query.all();
```

#### DocumentQuery methods overview
<table>
    <tr>
        <th>Method</th>
        <th>RQL / description</th>
    </tr>
    <tr>
        <td><pre lang="typescript">selectFields(fields: string[], 
projections?: string[]): IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">SELECT field1 [AS projection1], ...</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">distinct(): IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">SELECT DISTINCT</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">whereEquals
&lt;V extends ConditionValue&gt;(
fieldName: string, value: V, 
exact?: boolean)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE fieldName = &lt;value&gt;</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">whereNotEquals
&lt;V extends ConditionValue&gt;(
fieldName: string, value: V, 
exact?: boolean)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE fieldName != &lt;value&gt;</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">whereIn
&lt;V extends ConditionValue&gt;(
fieldName: string, values: V[], 
exact?: boolean)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE fieldName IN (&lt;value1&gt;, &lt;value2&gt;, ...)</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">whereStartsWith
&lt;V extends ConditionValue&gt;(
fieldName: string, value: V)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE startsWith(fieldName, '&lt;value&gt;')</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">whereEndsWith
&lt;V extends ConditionValue&gt;(
fieldName: string, value: V)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE endsWith(fieldName, '&lt;value&gt;')</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">whereBetween
&lt;V extends ConditionValue&gt;(
fieldName: string, start: V, end: V, 
exact?: boolean) : IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE fieldName BETWEEN &lt;start&gt; AND &lt;end&gt;</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">whereGreaterThan
&lt;V extends ConditionValue&gt;(
fieldName: string, value: V, 
exact?: boolean)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE fieldName > &lt;value&gt;</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">whereGreaterThanOrEqual
&lt;V extends ConditionValue&gt;(
fieldName: string, value: V, 
exact?: boolean)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE fieldName >= &lt;value&gt;</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">whereLessThan
&lt;V extends ConditionValue&gt;(
fieldName: string, value: V, 
exact?: boolean)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE fieldName < &lt;value&gt;</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">whereLessThanOrEqual
&lt;V extends ConditionValue&gt;(
fieldName: string, value: V, 
exact?: boolean)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE fieldName <= &lt;value&gt;</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">whereExists(fieldName: string)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE exists(fieldName)</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">containsAny
&lt;V extends ConditionValue&gt;(
fieldName: string, values: V[])
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE fieldName IN (&lt;value1&gt;, &lt;value2&gt;, ...)</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">containsAll
&lt;V extends ConditionValue&gt;(
fieldName: string, values: V[])
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">WHERE fieldName ALL IN (&lt;value1&gt;, &lt;value2&gt;, ...)</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">search(fieldName: string, 
searchTerms: string, 
operator?: SearchOperator)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td>Performs full-text search</td>
    </tr>
    <tr>
        <td><pre lang="typescript">openSubclause(): IDocumentQuery&lt;T&gt;;</pre></td>
        <td>Opens subclause <code lang="sql">(</code></td>
    </tr>
    <tr>
        <td><pre lang="typescript">closeSubclause(): IDocumentQuery&lt;T&gt;;</pre></td>
        <td>Closes subclause <code lang="sql">)</code></td>
    </tr>
    <tr>
        <td><pre lang="typescript">negateNext(): IDocumentQuery&lt;T&gt;;</pre></td>
        <td>Adds <code lang="sql">NOT</code> before next condition</td>
    </tr>
    <tr>
        <td><pre lang="typescript">andAlso(): IDocumentQuery&lt;T&gt;;</pre></td>
        <td>Adds <code lang="sql">AND</code> before next condition</td>
    </tr>
    <tr>
        <td><pre lang="typescript">orElse(): IDocumentQuery&lt;T&gt;;</pre></td>
        <td>Adds <code lang="sql">OR</code> before next condition</td>
    </tr>
    <tr>
        <td><pre lang="typescript">usingDefaultOperator
(operator: QueryOperator)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td>Sets default operator (which will be used if no <code lang="typescript">andAlso()</code> / <code lang="typescript">orElse()</code> was called. Just after query instantiation, <code lang="sql">OR</code> is used as default operator. Default operator can be changed only adding any conditions</td>
    </tr>
    <tr>
        <td><pre lang="typescript">orderBy(field: string, 
ordering?: OrderingType)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">ORDER BY field [DESC]</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">randomOrdering(seed?: string)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td><pre lang="sql">ORDER BY random()</pre></td>
    </tr>
    <tr>
        <td><pre lang="typescript">take(count: number)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td>Limits the number of result entries to <code>count</code></td>
    </tr>
    <tr>
        <td><pre lang="typescript">skip(count: number)
: IDocumentQuery&lt;T&gt;;</pre></td>
        <td>Skips first <code>count</code> results</td>
    </tr>
    <tr>
        <td><pre lang="typescript">async first(callback?
: EntityCallback<T>): Promise<T>;</pre></td>
        <td>Returns first document from result set</td>
    </tr>
    <tr>
        <td><pre lang="typescript">async single(callback?
: EntityCallback<T>): Promise<T>;</pre></td>
        <td>Returns single document matching query criteria. If there are no such document or more then one - throws an <code>InvalidOperationException</code></td>
    </tr>
    <tr>
        <td><pre lang="typescript">async all(callback?
: QueryResultsCallback<T[]>): Promise<T[]>;</pre></td>
        <td>Returns all documents from result set (considering <code lang="typescript">take()</code> / <code lang="typescript">skip()</code> options)</td>
    </tr>
    <tr>
        <td><pre lang="typescript">async count(callback?
: EntitiesCountCallback): Promise<number>;</pre></td>
        <td>Returns count of all documents matching query criteria (non-considering <code lang="typescript">take()</code> / <code lang="typescript">skip()</code> options)</td>
    </tr>
</table>


Condition value can be a string, number, boolean, null value or `Date` object:

```typescript
type ConditionValue = string | number | boolean | Date | null;
```

## Using ECMAScript 2015 classes as models instead of object literals

1. Define your model as class. Attributes should be just public properties:
```javascript
class Product {
  constructor(
    id = null,
    title = '',
    price = 0,
    currency = 'USD',
    storage = 0,
    manufacturer = '',
    in_stock = false,
    last_update = null
  ) {
    Object.assign(this, {
      title,
      price,
      currency,
      storage,
      manufacturer,
      in_stock,
      last_update: last_update || new Date()
    });
  }
}
```
2. For store model just pass it's instance without specifying collection prefix (e.g. `Products/`). Collection name will be detected automatically by model's class name
```javascript
let product = new Product(
  null, 'iPhone X', 999.99, 'USD', 64, 'Apple', true,
   new Date('2017-10-01T00:00:00')
};

product = await session.store(product);
console.log(product instanceof Product); // true
console.log(product.id.includes('Products/')); // true
await session.saveChanges();
```
3. When loading document, you need to use `session.load()` second `options` param. Pass class constructor as `documentType` option:
```javascript
let product = await session.load('Products/1-A', {documentType: Product});
console.log(product instanceof Product); // true
console.log(product.id); // Products/1-A
```
4. When querying documents, pass class constructor to `documentType` option of `session.query({  ... })`:
```javascript
let products = await session.query({
  collection: 'Products',
  documentType: Product
}).all();

products.forEach((product) => {
  console.log(product instanceof Product); // true
  console.log(product.id.includes('Products/')); // true
});
```

Also you can set global models class resolver (something like class autoloader in PHP). It should be a callback function accepting a name of the model class and returning its constructor:

```javascript
store.conventions.addDocumentInfoResolver({
  resolveConstructor: (className) =>
    require(`./relative/path/to/models/${className}`)[className]
});

session = store.openSession();

let product = await session.load('Products/1-A');
console.log(product instanceof Product); // true
console.log(product.id); // Products/1-A

let products = await session.query({ collection: 'Products' }).all();

products.forEach((product) => {
  console.log(product instanceof Product); // true
  console.log(product.id.includes('Products/')); // true
});
```

## Usage with TypeScript

All datatype definitions you can find in `lib/ravendb-node.d.ts`. An example of CRUD operations and querying documents you may find below:

```typescript

// file models/Product.ts

export class Product {
  constructor(
    public id: string = null,
    public title: string = '',
    public price: number = 0,
    public currency: string = 'USD',
    public storage: number = 0,
    public manufacturer: string = '',
    public in_stock: boolean = false,
    public last_update: Date = null
  ) {}
}

export default Product;

// file app.ts
import {DocumentStore, IDocumentStore, IDocumentSession, IDocumentQuery, DocumentConstructor, QueryOperators} from 'ravendb';

const store: IDocumentStore = DocumentStore.create('database url', 'database name');
let session: IDocumentSession;

store.initialize();
store.conventions.addDocumentInfoResolver({
  resolveConstructor: (typeName: string): DocumentConstructor =>
    <DocumentConstructor>require(`./models/${typeName}`)[typeName]
});

(async (): Promise<void> => {
  let product: Product = new Product(
    null, 'iPhone X', 999.99, 'USD', 64, 'Apple', true, new Date('2017-10-01T00:00:00')
  );

  product = await session.store<Product>(product);
  console.log(product instanceof Product); // true
  console.log(product.id.includes('Products/')); // true
  await session.saveChanges();

  product = await session.load<Product>('Products/1-A');
  console.log(product instanceof Product); // true
  console.log(product.id); // Products/1-A

  let products: Product[] = await session
    .query<Product>({ collection: 'Products' })
    .waitForNonStaleResults()
    .usingDefaultOperator(QueryOperators.And)
    .whereEquals<string>('manufacturer', 'Apple')
    .whereEquals<boolean>('in_stock', true)
    .whereBetween<Date>('last_update', new Date('2017-10-01T00:00:00'), new Date())
    .whereGreaterThanOrEqual<number>('storage', 64)
    .all();

  products.forEach((product: Product): void => {
    console.log(product instanceof Product); // true
    console.log(product.id.includes('Products/')); // true
  });
})();
```

## Working with secured server

1. Fill auth options object. Pass contents of the pem/pfx certificate, specify its type and (optionally) passphrase:
```javascript
const {DocumentStore, Certificate} = require('ravendb');

const certificate = `
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
`;

let authOptions = {
  certificate: certificate,
  type: Certificate.Pem,
  password: 'my passphrase' // optional  
};
``` 

Pfx certificates content should be passed as `Buffer` object:

```javascript
const {DocumentStore, Certificate} = require('ravendb');
const fs = require('fs');

const certificate = './cert.pfx';

let authOptions = {
  certificate: fs.readFileSync(certificate),
  type: Certificate.Pfx,
  password: 'my passphrase' // optional  
};
``` 


2. Pass auth options as third argument of `DocumentStore.create`:

```javascript
let store = DocumentStore.create(
  'database url',
  'default database name',
  authOptions
);

store.initialize();
```

#### Auth exceptions

- if no auth options was provided and you're trying to work with secured server, an `NotSupportedException` will be thrown during store initialization
- if certificate is invalid or doesn't have permissions for specific operations, an `AuthorizationException` will be thrown during working with sessions/querying/sending operations

## Advanced features

#### Attachments support

You can attach binary files to documents. 

1. For attach a file, use `PutAttachmentOperation`. Pass document id, attachment name (it can be just a file name), content type and file contents as an `Buffer` object:

```javascript
const {DocumentStore, PutAttachmentOperation} = require('ravendb');
const path = require('path');
const fs = require('fs');

// ...
const fileName = './iphone-x.png';

await store.operations.send(
  new PutAttachmentOperation(
    'Products/1-A', 
    path.basename(fileName), 
    fs.readFileSync(fileName), 
    'image/png' 
  )
);    
```

2. For read an attachment, use `GetAttachmentOperation`. Pass document id and attachment name. File contents will be stored as an `Buffer` object inside `stream` property of response:

```javascript
const {DocumentStore, PutAttachmentOperation, AttachmentTypes} = require('ravendb');
const fs = require('fs');

// ...
const fileName = 'iphone-x.png';

let attachmentResult = await store.operations.send(
  new GetAttachmentOperation(
    'Products/1-A', 
    fileName, 
    AttachmentTypes.Document
  )
);  

fs.writeFileSync(`./${fileName}`, attachmentResult.stream);
```

3. For delete an attachment, use `DeleteAttachmentOperation`. Pass document id and attachment name.

```javascript
const {DocumentStore, DeletAttachmentOperation} = require('ravendb');

// ...
const fileName = 'iphone-x.png';

await store.operations.send(
  new DeleteAttachmentOperation(
    'Products/1-A', 
    fileName
  )
);  
```

#### Custom document id property

By default document id is stored onto `id` property of document. But you can define which name of id property should be for specific document types. 

1. Define custom document id property name resolver as callback function. It accepts document type and should return id property name:

```javascript
// models.item.js
class Item {
  constructor(Id = null, Title = "", Options = []) {
    this.Id = Id;
    this.Title = Title;    
    this.Options = Options;    
  }  
}

exports.Item = Item; 

// index.js
const {DocumentStore} = require('ravendb');
const {Item} = require('./models/item');

const resolveIdProperty = (typeName) => {
  switch (typeName) {
    case Item.name:
      return 'Id';     
    // ...    
  }  
};
```

2. Pass this callback to `resolveIdProperty` option of `conventions.addDocumentInfoResolver`:

```javascript
store.conventions.addDocumentInfoResolver({ resolveIdProperty });
```

3. Now client will read/fill `Id` property with document id while doing CRUD operations:

```javascript
let session = store.openSession();

await session.store(new Item(null, 'First Item', [1, 2, 3]));
await session.saveChanges();

console.log(item.Id); // Items/1-A

session = store.openSession();
let item = await session.load('Items/1-A');

console.log(item.Id); // Items/1-A
console.log(item.Title); // First Item
console.log(item.Options); // [1, 2, 3]
```

#### Custom attributes serializer

You can define custom serializers if you need to implement your own logic for convert attributes names/values for specific document types.

1. Define your serializer as object with `onSerialized` / `onUnserialized` methods:

```javascript
const serializer = {
  onSerialized: (serialized) => {
  },
  onUnserialized: (serialized) => {
  }
};
```

Where `serialized` attribute has the following structure:

```typescript
interface ISerialized<T extends Object = IRavenObject> {
  source: object | T;
  target?: object | T;
  originalAttribute: string;
  serializedAttribute: string;
  originalValue: any;
  serializedValue: any;  
  attributePath: string;
  metadata?: object;
  nestedObjectTypes?: IRavenObject<DocumentConstructor>;
}
```

2. Store target attribute name/value into the `serializedAttribute`/`serializedValue` properties of `serialized` parameter:

```javascript
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.substring(1);
}

function uncapitalize(string) {
  return string.charAt(0).toLowerCase() + string.substring(1);
}

const serializer = {
  onSerialized: (serialized) => {
    switch (serialized.metadata['Raven-Node-Type']) {
      case Item.name:
        serialized.serializedAttribute = uncapitalize(serialized.originalAttribute);

        if ('Items' === serialized.originalAttribute) {
          serialized.serializedValue = serialized.originalValue.join(",");
        }  

        break;
        // ...  
    }  
  },
  onUnserialized: (serialized) => {
    switch (serialized.metadata['Raven-Node-Type']) {
      case Item.name:
        serialized.serializedAttribute = capitalize(serialized.originalAttribute);

        if ('items' === serialized.originalAttribute) {
          serialized.serializedValue = serialized.originalValue.split(",").map(parseInt);
        }  

        break;
        // ...  
    }  
  }    
};
```

3. Pass your serializer object to `conventions.addAttributeSerializer`:

```javascript
const {DocumentStore, GetDocumentCommand} = require('ravendb');

store.conventions.addAttributeSerializer(serializer);

let sesssion = store.openSession();

await session.store(new Item(null, 'First Item', [1, 2, 3]));
await session.saveChanges();

session = store.openSession();
let item = await session.load('Items/1-A');

console.log(item.Id); // Items/1-A
console.log(item.Title); // First Item
console.log(item.Options); // [1, 2, 3]

let response = await store.getRequestExecutor().execute(new GetDocumentCommand('Items/1-A'));
let rawDocument = response.Results[0];

console.log(rawDocument['@metadata']['@id']); // Items/1-A
console.log(rawDocument.title); // First Item
console.log(rawDocument.options); // "1,2,3"
```

## Building

```bash
npm run build
```

## Running tests

```bash
npm test -- -h 192.168.5.44 [-p 8080] [-c path/to/certificate.pem(pfx)] [-t DocumentSerializing [-f]]
```

| Option | Description |
| ------------- | ------------- |
| `-h` or `--ravendb-host=` | Database host |
| `-p` or `--ravendb-port=` | Database port. 8080 by default |
| `-c` or `--ravendb-certificate=` | Path to .pem or .pfx certificate. If specified, test runner will use https protocol |
| `-t` or `--test=` | Test name. For run multiple test, specify each test in separate --test= option. By default runs all tests |
| `-f` or `--no-fixtures` | Skip executing database fixtures (create test database, put test indexes etc). Can be usable for tests which doesn't executes raven commands (e.g. DocumentSerializing) |
