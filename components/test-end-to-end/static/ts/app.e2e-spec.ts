
describe('people-service E2E Tests', function () {

  let expectedMsg = /people-service/i


  beforeEach(function () {
    browser.get('');
  });

  it('should display: ' + expectedMsg, function () {
    expect(element(by.css('h1')).getText()).toMatch(expectedMsg, '<h1> should say something about "people-service"');
  });

});
