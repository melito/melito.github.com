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
 * @param  {Object} dom Defaults to `document` if not provided.  Allows for mocking/stubbing
 * @return {Object}  New 'App' with default state (empty result set)
 */
function App(dom) {
  this.state           = { results: null, current_page: null, current_request: null }
  this.default_timeout = 500
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
  this._fetch(url)
}

/**
 * App.prototype._fetch - Used to make JSONP requests.
 *                        Works by creating a script element and appending it to the dom.
 *                        Mutates requests array for in flight tracking.
 *
 * @param  {String} url JSONP endpoint you would like to request data from
 */
App.prototype._fetch = function(url) {
  var skript        = this.dom.createElement('script')
  skript.src        = url
  skript.id         = string_to_hash(url)
  skript.className  = 'jsonp_request'
  this.dom.body.appendChild(skript)
  this.requests[skript.id] =  {complete: false}

  var hi = this
  setTimeout(function() {
    this.error = 'Could not connect to api'
    console.log(hi.requests.filter(function(x) { return x === skript.id }))
  }, this.default_timeout)
}

/**
 * App.prototype._fetched - Used by the JSONP callback whenever a remote resource is loaded
 *
 * @param  {Object} data Results from the API. (https://dev.twitch.tv/docs/v5/reference/search/#search-streams)
 */
App.prototype._fetched = function(data) {
  console.log(data)
  this.state.results      = data
  this.state.current_page = 1
  if (this.state.results) {
    this._updateUI(this.state.results)
  }
}

/**
 * App.prototype._updateUI - Called when the app should update it user interface
 *
 */
App.prototype._updateUI = function(results) {
  addTotalCount(this.dom, results)
  addPagingControls(this.dom, results, this.state.current_page)
  addResults(this.dom, results)
}

var addTotalCount = function(dom, results) {
  dom.getElementById('results-controls').innerHTML = `<span class='total-results'>Total: ${results._total}</span>`
}

var addPagingControls = function(dom, results, current_page) {
  var node        = document.createElement("span")
  node.className  = 'paging-controls'
  node.innerHTML  = `${buildPageLink('prev')} ${current_page}/${page_count(results._total)} ${buildPageLink('next')}`
  dom.getElementById('results-controls').appendChild(node)
}

var addResults = function(dom, results) {
  dom.getElementById('results').innerHTML = results.streams.map(build_result).join('')
}

var buildPageLink = function(direction, link) {
  if (direction == 'prev') {
    return `<a href='#'>&#8678;</a>`
  } else {
    return `<a href='#'>&#8680;</a>`
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
 * build_result - This will build an html slug for use in populating a result set
 *
 * @param  {Object} stream Object representing a stream.
 * @return {String}        HTML partial with populated fields
 */
var build_result = function(stream) {
  var template =
  `<div class="result">
    <img class='stream-img' src="${image_url(stream)}"/><h1>${stream.game}</h1>
    <h2>${stream.game} - ${stream.viewers} Viewers</h2>
    <p>${stream.channel.status}</p>
  </div>`
  return template
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
 * params_to_string - Converts a dictionary to query params usable with a url
 *
 * @param  {Object} dict Dictionary containing the key/values to be used as params
 * @return {String} A string representing the params
 */
var params_to_string = function(dict) {
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
    url = `${url}?${params_to_string(this.params)}`
  }
  return url
}


/**
 * var string_to_hash - Poorman's string hash.  Used to create a finger print for strings we can use for keying jsonp requests/state
 *
 * @param  {String} str A string with some type of information in it
 * @return {String}     A hash of the string that was input
 */
var string_to_hash = function(str) {
  var hash = 0
  if (str.length <= 0) { return hash }

  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i)
    hash = (hash<<5)-char
    hash = hash + hash
  }
  return hash.toString()
}

/// Make available to the test harness
module.exports = {
  App: App,
  url_for: url_for,
  image_url: image_url,
  page_count: page_count,
  string_to_hash: string_to_hash
}

/// Make available to the browser window for initialization
if (typeof window !== 'undefined') {
  window.App = App
}
