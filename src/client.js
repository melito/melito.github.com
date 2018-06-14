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
 * @param  {Object} dom          Defaults to `document` if not provided.  Allows for mocking/stubbing
 * @param  {String} cb_signature Defaults to `window.jitters._fetched`.  This is the callback name we send to the api
 * @return {Object}              New 'App' with default state (empty result set)
 */
function App(dom, cb_signature) {
  this.default_timeout = 5000
  this.state = { results: null,
         current_request: null,
            current_page: null }

  if (typeof cb_signature !== 'undefined') { this.cb_signature = cb_signature }
  else { this.cb_signature = 'window.jitters._fetched' }

  if (typeof dom !== 'undefined') { this.dom = dom }
  else { this.dom = document }

  configureForm(this)
}


/**
 * var configureForm - Used to configure the search form after the App is initalized
 *
 * @param  {App} app The app injects itself as an argument here
 */
var configureForm = function(app) {

  /// Function for validating input and executing the search
  var checkAndSubmit = function(app) {
    var value = app.dom.getElementById('search-input').value
    if (!value.isEmpty()) {
      app.state.current_page = null
      app.search(value)
    }
  }

  /// Bind click events to the submit button
  var submitBtn = app.dom.getElementById('submit')
  if (submitBtn) {
    submitBtn.addEventListener('click', function() {
      checkAndSubmit(app)
    })
  }

  /// Bind 'enter' events to the search input
  var input = app.dom.getElementById('search-input')
  if (input) {
    input.addEventListener('keyup', function(e) {
      e.preventDefault()
      if (event.keyCode === 13) {
        checkAndSubmit(app)
      }
    })
  }
}


/**
 * String.prototype.isEmpty - Prototype for checking for empty/blank strings
 *
 * @return {Boolean}  Is the string blank or not?
 */
String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
}

/**
 * App.prototype.search - Perform a search on the API and render the result set in the API
 *
 * @param  {String} query A string describing what you're searching for
 */
App.prototype.search = function(query) {
  var url    = url_for('search', {q: query,
                          client_id: client_id,
                           callback: this.cb_signature})
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
  setLoaderVisibility(this.dom, true)
  this.error        = null

  var skript        = this.dom.createElement('script')
  if (!url.includes("client_id")) { url = url + `&client_id=${client_id}` }
  if (!url.includes("callback")) { url = url + `&callback=${this.cb_signature}` }

  skript.src        = url
  skript.id         = string_to_hash(url)
  this.dom.body.appendChild(skript)
  this.state.current_request = url

  /// Setup the timeout handler
  var self = this
  setTimeout(function() {
    handleTimeoutForRequest(self, url)
  }, this.default_timeout)
}


/**
 * var handleTimeoutForRequest - Timeout handler.
 *                               JSONP is fickle with error handling so we have
 *                               a timeout that we use to check if a request has
 *                               completed or not in a reasonable amount of time.
 *
 * @param  {type} app description
 * @param  {type} url description
 * @return {type}     description
 */
var handleTimeoutForRequest = function(app, url) {
  var req = app.state.current_request
  if (req && req == url) {
    app.error                 = 'Could not connect to api'
    app.state.current_request = null
    app._removeRequestForID(string_to_hash(url))
    app._updateUI({})
    setLoaderVisibility(app.dom, false)
  }
}

/**
 * var setLoaderVisibility - Function that explicitly sets the state of the loader
 *
 * @param  {Object} dom        Object used to represent the DOM
 * @param  {Boolean} visibility Whether the loader should be hidden or not
 */
var setLoaderVisibility = function(dom, visibility) {
  var elems = dom.getElementsByClassName('loader')
  var state = visibility == true ? 'visible' : 'hidden'
  for (var i = 0; i < elems.length; i++) {
    elems[i].style.visibility = state
  }
}

/**
 * App.prototype._removeRequestForID - Remove the script element responsible for making a JSONP request.
 *                                     This happens when a request has timed out and should cancel it.
 *
 * @param  {String} request_id ID of the request.  This is just a hash of the url
 */
App.prototype._removeRequestForID = function(request_id) {
  var requestElement = this.dom.getElementById(request_id)
  if (requestElement) { requestElement.remove() }
}

/**
 * App.prototype._fetched - Used by the JSONP callback whenever a remote resource is loaded
 *
 * @param  {Object} data Results from the API. (https://dev.twitch.tv/docs/v5/reference/search/#search-streams)
 */
App.prototype._fetched = function(data) {
  this.state.results          = data
  this._removeRequestForID(string_to_hash(this.state.current_request))
  this.state.current_request  = null
  this.error                  = null
  if (this.state.results) {
    if (this.state.results._total > 0) {
      this._updateUI(this.state.results)
    } else {
      showError(this.dom, 'Your search had no results.')
    }
  }
  setLoaderVisibility(this.dom, false)
}

/**
 * App.prototype._updateUI - Called when the app should update it user interface
 *
 */
App.prototype._updateUI = function(results) {
  if (this.error) {
    showError(this.dom, this.error)
  } else {
    if (!this.state.current_page) { this.state.current_page = 1  }

    addTotalCount(this.dom, results)
    addPagingControls(this.dom, results, this.state.current_page)
    addResults(this.dom, results)
  }
}

var showError = function(dom, errorMsg) {
  var elem = dom.getElementById('results')
  if (elem) { elem.innerHTML = error_template(errorMsg) }

  elem = dom.getElementById('results-controls')
  if (elem) { elem.innerHTML = "" }
}

/**
 * var addResults - Takes an array of results and appends them to a section of the DOM
 *
 * @param  {Object} dom    This can be the document or any object you're using as a stub
 * @param  {Object} results An object returned by the twitch api
 */
var addResults = function(dom, results) {
  if (results.streams && results.streams.length > 0) {
      dom.getElementById('results').innerHTML = results.streams.map(build_result).join('')
  }
}


/**
 * var addTotalCount - Updates the total count of results in the UI
 *
 * @param  {Object} dom     This can be the document or any object you're using as a stub
 * @param  {Object} results An object returned by the twitch api
 */
var addTotalCount = function(dom, results) {
  if (results._total) {
    dom.getElementById('results-controls').innerHTML = `<span class='total-results'>Total: ${results._total}</span>`
  }
}


/**
 * var addPagingControls - Builds the DOM element containing pagination controls
 *
 * @param  {Object}  dom          This can be the document or any object you're using as a stub
 * @param  {Object}  results      An object returned by the twitch api
 * @param  {Integer} current_page A number representing the current page we're on
 */
var addPagingControls = function(dom, results, current_page) {
  if (results._total) {
    var node        = document.createElement("span")
    node.className  = 'paging-controls'
    node.innerHTML  = buildPagerLinks(results._links, results._total, current_page)
    dom.getElementById('results-controls').appendChild(node)
  }
}


/**
 * var buildPagerLinks - Checks the links object in the results to build appropriate paging controls
 *
 * @param  {Object} links      links object found in the response from the API
 * @param  {Integer} total     Number representing ALL the results twitch has for this query
 * @param  {Integer} current_page Current Page number we're on
 */
var buildPagerLinks = function(links, total, current_page) {
  var result = []
  if (links.prev) { result.push(buildPageLink('prev')) }
  if (links.self) { result.push(buildCurrentTotalPageInfo(current_page, total))}
  if (links.next) {
    if (parseOffsetFromLink(links.next) < total) {
      result.push(buildPageLink('next'))
    }
  }
  return result.join(' ')
}


/**
 * var buildPageLink - Builds an html link used for querying the
 *
 * @param  {type} direction description
 * @param  {type} link      description
 * @return {type}           description
 */
var buildPageLink = function(direction, link) {
  if (direction == 'prev') {
    return `<a href='#' onclick="window.jitters.fetch_prev()">&#8678;</a>`
  } else {
    return `<a href='#' onclick="window.jitters.fetch_next()">&#8680;</a>`
  }
}


/**
 * var buildCurrentTotalPageInfo - Builds a string for use in displaying the page info
 *
 * @param  {Integer} current_page Page of results the user is currently on
 * @param  {Integer} total        Number of pages total
 * @return {String}               String following format: `1/12`
 */
var buildCurrentTotalPageInfo = function(current_page, total) {
  var template = `${current_page}/${page_count(total)}`
  return template
}


/**
 * var parseOffsetFromLink - Pulls the offset number out of a link
 *
 * @param  {String} link URL on the twitch api that possible contains an offset query param
 * @return {Integer}     If param is present returns the integer for it, otherwise null
 */
var parseOffsetFromLink = function(link) {
  var matches = link.match(/offset=(\d+)/)
  if (matches && matches.length > 0) {
    return parseInt(matches[1])
  }
  return null
}

/**
 * App.prototype.fetch_next - Proceed to the next page
 *
 */
App.prototype.fetch_next = function() {
  this.fetch_page('next')
}


/**
 * App.prototype.fetch_prev - Proceed to the previous page
 *
 */
App.prototype.fetch_prev = function() {
  this.fetch_page('prev')
}


/**
 * App - Used to make page fetch requests
 *
 * @param  {String} direction 'next' or 'prev'
 */
App.prototype.fetch_page = function(direction) {
  var results = this.state.results
  if (direction == 'next') {
    this.state.current_page += 1
    this._fetch(results._links.next)
  } else {
    this.state.current_page -= 1
    this._fetch(results._links.prev)
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
  if (results % per_page) { return Math.floor(result) + 1 }
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
 * build_result - This will build an html partial for use in populating a result set
 *
 * @param  {Object} stream Object representing a stream.
 * @return {String}        HTML partial with populated fields
 */
var build_result = function(stream) {
  var template =
  `<div class="result">
    <img class='stream-img' src="${image_url(stream)}"/><h1>${stream.channel.display_name}</h1>
    <h2>${stream.game} - ${stream.viewers} Viewers</h2>
    <p>${stream.channel.status}</p>
  </div>`
  return template
}


/**
 * var error_template - This will build an html partial for use in populating an error message
 *
 * @param  {String} error_msg Message describing the error
 * @return {String}           HTML partial with populated fields
 */
var error_template = function(error_msg) {
  var template =
  `<div class='error'>
    <h1>Something went wrong...</h1>
    <p>${error_msg}</p>
    <p>Please try again.</p>
  </div>
  `
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
    hash     = (hash << 5) - char
    hash     = hash + hash
  }
  return hash.toString()
}

/// Make available to the test harness
module.exports = {
  App: App,
  url_for: url_for,
  image_url: image_url,
  page_count: page_count,
  string_to_hash: string_to_hash,
  buildPagerLinks: buildPagerLinks,
  parseOffsetFromLink: parseOffsetFromLink,
}

/// Make available to the browser window for initialization
if (typeof window !== 'undefined') {
  window.App = App
}
