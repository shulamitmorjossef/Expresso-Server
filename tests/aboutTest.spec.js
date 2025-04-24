import * as chai from 'chai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const expect = chai.expect;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('About file test', () => {
  it('should exist and contain some text', (done) => {
    const filePath = path.join(__dirname, '../src/about.txt');

    fs.readFile(filePath, 'utf8', (err, data) => {
      expect(err).to.be.null;
      expect(data).to.be.a('string');
      expect(data.length).to.be.greaterThan(0); // no empty 
      done();
    });
  });
});
