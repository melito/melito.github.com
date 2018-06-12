var test = require('tape')
var client = require('../src/client')

var app = new client.App({})
var stream = {
  preview: {
    template: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_rotterdam08-{width}x{height}.jpg'
  }
}

var results = {

}

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
  t.equals(url, 'https://static-cdn.jtvnw.net/previews-ttv/live_user_rotterdam08-125x125.jpg', 'image url should template properly')
})

test('that we can calulate the number of pages in a result set', function(t){
  t.plan(3)
  t.equals(client.page_count(138), 14, "138 results should be 14 pages")
  t.equals(client.page_count(100), 10, "100 results should be 10 pages")
  t.equals(client.page_count(122), 13, "122 results should be 13 pages")
})
