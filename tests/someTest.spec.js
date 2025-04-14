const { expect } = require('chai');

function add(a, b) {
  return a + b;
}

describe('add function', () => {
  it('should return 5 when adding 2 and 3', () => {
    expect(add(2, 3)).to.equal(5);
  });

  it('should return 0 when adding -2 and 2', () => {
    expect(add(-2, 2)).to.equal(0);
  });

  it('should return -5 when adding -2 and -3', () => {
    expect(add(-2, -3)).to.equal(-5);
  });
});
