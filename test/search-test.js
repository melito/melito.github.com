var test = require('tape')
var client = require('../src/client')

/////// Mock objects for dealing with no having a DOM
function FakeElement(name) { this.name = name }
FakeElement.prototype.appendChild = function(fake) {
  this[fake.name] = fake
}

function FakeDom() {
  this.body = new FakeElement('body')
}

FakeDom.prototype.createElement = function(name) {
  return new FakeElement(name)
}

FakeDom.prototype.getElementsByClassName = function(name) {
  return []
}

FakeDom.prototype.getElementById = function(name) { }
FakeDom.prototype.remove = function() { }

/////// Variables we'll be using with some of the tests
var dom = new FakeDom()
var app = new client.App(dom)
var stream = {
  preview: {
    template: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_rotterdam08-{width}x{height}.jpg'
  }
}

//////// Tests
test('that we can build a url', function(t) {
  t.plan(2)
  t.equals(client.url_for('search', {q: 'starcraft'}),
          'https://api.twitch.tv/kraken/search/streams?q=starcraft',
          'url #1 should be correct')

  t.equals(client.url_for('search', {q: 'rocket league'}),
          'https://api.twitch.tv/kraken/search/streams?q=rocket%20league',
          'url #2 should be correct')
})

test('that we can build an image url using a template', function(t){
  t.plan(1)
  var url = client.image_url(stream)
  t.equals(url,
    'https://static-cdn.jtvnw.net/previews-ttv/live_user_rotterdam08-125x125.jpg',
    'image url should template properly')
})

test('that we can calulate the number of pages in a result set', function(t){
  t.plan(3)
  t.equals(client.page_count(138), 14, "138 results should be 14 pages")
  t.equals(client.page_count(100), 10, "100 results should be 10 pages")
  t.equals(client.page_count(122), 13, "122 results should be 13 pages")
})

test('that we have a simple hashing function for identifying inflight requests', function(t){
  t.plan(3)
  t.equals(client.string_to_hash('https://www.google.com'), '-3413940314', 'should build expected hash')
  t.equals(client.string_to_hash('https://www.stanford.edu'), '914566422', 'should build expected hash')
  t.equals(client.string_to_hash('https://api.twitch.tv/kraken/search/streams?q=rocket%20league'), '-3440712522', 'should build expected hash')
})

test('that we can create an app object and verify its default state', function(t){
  t.plan(3)
  t.deepEqual(app.state, {results: null, current_page: null, current_request: null}, 'should have blank state')
  t.deepEqual(app.dom, dom, 'should have a dom set')
  t.equals(app.default_timeout, 5000, 'should have a default_timeout for requests')
})

test('that we can create requests and manage their state', function(t) {
  t.plan(7)
  app.default_timeout = 50

  t.notOk(app.state.current_request, 'should not have a current request')
  t.notOk(dom.body.script, 'should not have a script element in the dom')
  t.notOk(app.error, 'should not have an error in the app')

  app._fetch('https://api.twitch.tv/kraken/search/streams?q=rocket%20league')

  t.ok(app.state.current_request, 'should have request queued')
  t.ok(dom.body.script, 'should have appended the script element to kick off the request')
  t.equals(dom.body.script.id, '-3440712522', 'script element should have an id')

  setTimeout(function() {
    t.equals(app.error, 'Could not connect to api', 'should have registered an error with the app')
  }, 100)
})
