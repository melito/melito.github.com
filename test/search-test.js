var test = require('tape')
var client = require('../src/client')

test('that we can build a url', function(t) {
  t.plan(2)
  t.equals(client.UrlFor('search', {q: 'starcraft'}),
          'https://api.twitch.tv/kraken/search/streams?q=starcraft',
          'url #1 should be correct')

  t.equals(client.UrlFor('search', {q: 'rocket league'}),
          'https://api.twitch.tv/kraken/search/streams?q=rocket%20league',
          'url #2 should be correct')
})

test('that we can build an image url using a template', function(t){
  t.plan(1)

  var url = client.buildImageURL('https://static-cdn.jtvnw.net/previews-ttv/live_user_rotterdam08-{width}x{height}.jpg', 125, 125)
  t.equals(url, 'https://static-cdn.jtvnw.net/previews-ttv/live_user_rotterdam08-125x125.jpg', 'image url should template properly')
})
