/// <reference path="../../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../../node_modules/@types/chai/index.d.ts" />

import {expect} from 'chai';
import {RequestExecutor} from "../../src/Http/Request/RequestExecutor";
import {PutDocumentCommand} from "../../src/Database/Commands/PutDocumentCommand";
import {GetDocumentCommand} from "../../src/Database/Commands/GetDocumentCommand";
import {DeleteDocumentCommand} from "../../src/Database/Commands/DeleteDocumentCommand";
import {IRavenResponse} from "../../src/Database/RavenCommandResponse";
import {IRavenObject} from "../../src/Typedef/IRavenObject";

describe('Delete command test', () => {
  let requestExecutor: RequestExecutor;
  let changeVector: string, otherChangeVector: string;

  beforeEach(function(): void {
    ({requestExecutor} = this.currentTest as IRavenObject);
  });

  beforeEach(async () => requestExecutor
    .execute(new PutDocumentCommand('Products/101', {'Name': 'test', '@metadata': {}}))
    .then(() => requestExecutor.execute(new GetDocumentCommand('Products/101')))
    .then((response: IRavenResponse) => changeVector = response.Results[0]['@metadata']['@change-vector'])
    .then(() => requestExecutor.execute(new PutDocumentCommand('Products/102', {'Name': 'test', '@metadata': {}})))    
    .then(() => requestExecutor.execute(new GetDocumentCommand('Products/102')))
    .then((response: IRavenResponse) => otherChangeVector = response.Results[0]['@metadata']['@change-vector'])
  );

  describe('Delete()', () => {
    it('should delete with no changeVector', async () => {
      let command: DeleteDocumentCommand = new DeleteDocumentCommand('Products/101');

      await expect(requestExecutor.execute(command)).to.be.fulfilled;
    });

    it('should delete with changeVector', async() => {
      let command2: DeleteDocumentCommand = new DeleteDocumentCommand('Products/102', otherChangeVector);

      await expect(requestExecutor.execute(command2)).to.be.fulfilled;
    });

    it('should fail delete if changeVector mismatches', async() => expect(
      requestExecutor
        .execute(new DeleteDocumentCommand('Products/101', `${changeVector}:BROKEN:VECTOR`))
      ).to.be.rejected
    )
  })
});
