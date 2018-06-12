var client_id = '5lch5g05xtkp5zhfva8g3u1xlxzwvb'

/**
 * Dictionary for mapping query types to their respective paths on the API
 */
var routes = {
  'search': {
    path: 'kraken/search/streams'
  }
}

/**
 * App - Main 'App' Object
 *
 * @return {Object}  New 'App' with default state (empty result set)
 */
function App(dom) {
  this.state = { results: null }
  if (typeof dom !== 'undefined') { this.dom = dom }
  else { this.dom = document }
}

/**
 * App.prototype.search - Perform a search on the API and render the result set in the API
 *
 * @param  {String} query A string describing what you're searching for
 */
App.prototype.search = function(query) {
  var url    = url_for('search', {q: query, client_id: client_id, callback: 'window.jitters._fetched'})
  var skript = document.createElement('script')
  skript.src = url
  document.body.appendChild(skript)
}

/**
 * App.prototype.fetched - Used by the JSONP callback whenever a remote resource is loaded
 *
 * @param  {Object} data Results from the API. (https://dev.twitch.tv/docs/v5/reference/search/#search-streams)
 */
App.prototype._fetched = function(data) {
  console.log(data)
  this.state.results = data
  if (this.state.results) {
    this._updateUI(this.state.results)
  }
}


/**
 * var page_count - Calculates the number of pages in a result set
 *
 * @param  {Integer} results  Integer representing total number of results
 * @param  {Integer} per_page Integer representing total number of results per page
 * @return {Integer}          Integer representing total number of pages
 */
var page_count = function(results, per_page) {
  if (!per_page) { per_page = 10 }
  var result = results/per_page
  if (results % per_page) { return Math.floor(result)+1 }
  else { return result }
}

/**
 * _url_for - Returns a url for a particular query type & params
 *
 * @param  {String} query_type Type of query you are interested in making
 * @param  {Object} params     Arguments for the url endpoint
 * @return {String}            URL for endpoint
 */
var url_for = function(query_type, params) {
  var builder = new UrlBuilder(query_type, params)
  return builder.build()
}

/**
 * image_url - Builds an image url using the template url in a stream object
 *
 * @param  {Object} stream Stream object from results set.
 * @return {String}        URL to use as an image thumbnail for a string
 */
var image_url = function(stream) {
  if (stream.preview.template) {
    var result  = stream.preview.template.replace("{width}", 125)
    result      = result.replace("{height}", 125)
    return result
  }
  return "http://via.placeholder.com/125x125"
}


/**
 * _build_result - This will build an html slug for use in populating a result set
 *
 * @param  {Object} stream Object representing a stream.
 * @return {String}        HTML partial with populated fields
 */
var _build_result = function(stream) {
  var template =
  `<div class="result">
    <img class='stream-img' src="${image_url(stream)}"/><h1>${stream.game}</h1>
    <h2>${stream.game} - ${stream.viewers} Viewers</h2>
    <p>${stream.channel.status}</p>
  </div>`
  return template
}

/**
 * App.prototype._updateUI - Called when the app should update it user interface
 *
 */
App.prototype._updateUI = function(results) {
  addTotalCount(results)
  addPagingControls(results)
  document.getElementById('results').innerHTML = results.streams.map(_build_result).join('')
}

var addTotalCount = function(results) {
  document.getElementById('results-controls').innerHTML = `<p>Total ${results._total}</p>`
}

var addPagingControls = function(results) {
  var node        = document.createElement("span")
  node.innerHTML  = `<span>&#8678; hi &#8680;</span>`
  document.getElementById('results-controls').appendChild(node)
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

/// Make available to the test harness
module.exports = {
  App: App,
  url_for: url_for,
  image_url: image_url,
  page_count: page_count
}

/// Make available to the browser window for initialization
if (typeof window !== 'undefined') {
  window.App = App
}
