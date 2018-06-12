var client_id = '5lch5g05xtkp5zhfva8g3u1xlxzwvb'


/**
 * Dictionary for mapping query types to their respective paths on the API
 */
var routes = {
  'search': {
    path: 'kraken/search/streams'
  }
}

function App() {
  this.state = { results: null }
}

App.prototype.search = function(query) {
  var url    = UrlFor('search', {q: query, client_id: client_id, callback: 'window.jitters.fetched'})
  var skript = document.createElement('script')
  skript.src = url
  document.body.appendChild(skript)
}

App.prototype.fetched = function(data) {
  console.log(data)
  this.state.results = data
  if (this.state.results) {
    updateUI(this.state.results)
  }
}

var updateUI = function(results) {
  document.getElementById('results-controls').innerHTML = `<p>Total ${results._total}</p>`
  document.getElementById('results').innerHTML = results.streams.map(buildResult).join('')
}

/**
 * UrlFor - Returns a url for a particular query type & params
 *
 * @param  {String} query_type Type of query you are interested in making
 * @param  {Object} params     Arguments for the url endpoint
 * @return {String}            URL for endpoint
 */
function UrlFor(query_type, params) {
  var builder = new UrlBuilder(query_type, params)
  return builder.build()
}

/**
 * UrlBuilder - Builder used for constructing urls
 *
 * @param  {String} query_type String key for query type to build
 * @param  {Object} params     Arguments for the api endpoint
 * @return {Object}            Prototype object with `build` function
 */
function UrlBuilder(query_type, params) {
  this.proto  = 'https'
  this.host   = 'api.twitch.tv'
  if (routes[query_type]) {
    this.path = routes[query_type].path
  }
  this.params = params
}

/**
 * ParamsToString - Converts a dictionary to query params usable with a url
 *
 * @param  {Object} dict Dictionary containing the key/values to be used as params
 * @return {String} A string representing the params
 */
function ParamsToString(dict) {
  return Object.entries(dict).map(function(kv){
    return kv.map(encodeURIComponent).join('=')
  }).join('&')
}

/**
 * UrlBuilder.prototype.build - Builds a URL
 *
 * @return {String}  URL for use with http client
 */
UrlBuilder.prototype.build = function() {
  var url = `${this.proto}://${this.host}/${this.path}`
  if (this.params) {
    url = `${url}?${ParamsToString(this.params)}`
  }
  return url
}

function Search(query) {
  this.method = 'GET'
  this.url    = UrlFor('search', {q: query})
  return this
}

var buildResult = function(result) {
  var template =
  `<div class="result">
    <img class='stream-img' src="${buildImageURL(result.preview.template, 125, 125)}"/><h1>${result.game}</h1>
    <h2>${result.game} - ${result.viewers} Viewers</h2>
    <p>hi</p>
  </div>`
  return template
}

var buildImageURL = function(previewTemplateURL, width, height) {
  var result  = previewTemplateURL.replace("{width}", width)
  result      = result.replace("{height}", height)
  return result
}

module.exports = {
  Search: Search,
  UrlFor: UrlFor,
  buildImageURL: buildImageURL
}

if (typeof window !== 'undefined') {
  window.App = App
}
