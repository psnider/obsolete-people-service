import { browser, element, by } from 'protractor';

describe('people-service E2E Tests', function () {

  let expectedMsg = /people-service/i


  beforeEach(function () {
    browser.get('');
  });

  it('should display: ' + expectedMsg, function () {
    var h1_text = element(by.css('h1')).getText()
    expect(h1_text).toMatch(expectedMsg, '<h1> should say something about "people-service"');
  });

});
