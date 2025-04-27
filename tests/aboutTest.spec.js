import request from 'supertest';
import { expect } from 'chai';
import { app } from '../src/index.js';

describe('GET /about', () => {
  it('should return status 200 and contain expected fields', async function () {
    this.timeout(5000); // נותן לבדיקה 5 שניות לסיים
    const res = await request(app).get('/about');
    
    expect(res.status).to.equal(200); // כאן לשים 200!!
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('title').that.equals('About EXpresso');
    expect(res.body).to.have.property('section1').that.is.a('string').that.is.not.empty;
  });
});
