require=function(r,e,n){function t(n,o){function i(r){return t(i.resolve(r))}function f(e){return r[n][1][e]||e}if(!e[n]){if(!r[n]){var c="function"==typeof require&&require;if(!o&&c)return c(n,!0);if(u)return u(n,!0);var l=new Error("Cannot find module '"+n+"'");throw l.code="MODULE_NOT_FOUND",l}i.resolve=f;var a=e[n]=new t.Module;r[n][0].call(a.exports,i,a,a.exports)}return e[n].exports}function o(){this.bundle=t,this.exports={}}var u="function"==typeof require&&require;t.Module=o,t.modules=r,t.cache=e,t.parent=u;for(var i=0;i<n.length;i++)t(n[i]);return t}({7:[function(require,module,exports) {
var t="5lch5g05xtkp5zhfva8g3u1xlxzwvb",e={search:{path:"kraken/search/streams"}};function n(t,e){this.default_timeout=5e3,this.state={results:null,current_request:null,current_page:null},this.cb_signature=void 0!==e?e:"window.jitters._fetched",this.dom=void 0!==t?t:document,r(this)}var r=function(t){var e=function(t){var e=t.dom.getElementById("search-input").value;e.isEmpty()||(t.state.current_page=null,t.search(e))},n=t.dom.getElementById("submit");n&&n.addEventListener("click",function(){e(t)});var r=t.dom.getElementById("search-input");r&&r.addEventListener("keyup",function(n){n.preventDefault(),13===event.keyCode&&e(t)})};String.prototype.isEmpty=function(){return 0===this.length||!this.trim()},n.prototype.search=function(e){var n=m("search",{q:e,client_id:t,hls:!0,callback:this.cb_signature});this._fetch(n)},n.prototype._fetch=function(e){i(this.dom,!0),this.error=null;var n=this.dom.createElement("script");e.includes("client_id")||(e+=`&client_id=${t}`),e.includes("callback")||(e+=`&callback=${this.cb_signature}`),n.src=e,n.id=k(e),this.dom.body.appendChild(n),this.state.current_request=e;var r=this;setTimeout(function(){s(r,e)},this.default_timeout)};var s=function(t,e){var n=t.state.current_request;n&&n==e&&(t.error="Could not connect to api",t.state.current_request=null,t._removeRequestForID(k(e)),t._updateUI({}),i(t.dom,!1))},i=function(t,e){for(var n=t.getElementsByClassName("loader"),r=1==e?"visible":"hidden",s=0;s<n.length;s++)n[s].style.visibility=r};n.prototype._removeRequestForID=function(t){var e=this.dom.getElementById(t);e&&e.remove()},n.prototype._fetched=function(t){this.state.results=t,this._removeRequestForID(k(this.state.current_request)),this.state.current_request=null,this.error=null,this.state.results&&(this.state.results._total>0?this._updateUI(this.state.results):o(this.dom,"Your search had no results.")),i(this.dom,!1)},n.prototype._updateUI=function(t){this.error?o(this.dom,this.error):(this.state.current_page||(this.state.current_page=1),u(this.dom,t),c(this.dom,t,this.state.current_page),a(this.dom,t))};var o=function(t,e){var n=t.getElementById("results");n&&(n.innerHTML=g(e)),(n=t.getElementById("results-controls"))&&(n.innerHTML="")},a=function(t,e){e.streams&&e.streams.length>0&&(t.getElementById("results").innerHTML=e.streams.map(_).join(""))},u=function(t,e){e._total&&(t.getElementById("results-controls").innerHTML=`<span class='total-results'>Total: ${e._total}</span>`)},c=function(t,e,n){if(e._total){var r=document.createElement("span");r.className="paging-controls",r.innerHTML=l(e._links,e._total,n),t.getElementById("results-controls").appendChild(r)}},l=function(t,e,n){var r=[];return t.prev&&r.push(h("prev")),t.self&&r.push(p(n,e)),t.next&&d(t.next)<e&&r.push(h("next")),r.join(" ")},h=function(t,e){return"prev"==t?"<a href='#' onclick=\"window.jitters.fetch_prev()\">&#8678;</a>":"<a href='#' onclick=\"window.jitters.fetch_next()\">&#8680;</a>"},p=function(t,e){return`${t}/${f(e)}`},d=function(t){var e=t.match(/offset=(\d+)/);return e&&e.length>0?parseInt(e[1]):null};n.prototype.fetch_next=function(){this.fetch_page("next")},n.prototype.fetch_prev=function(){this.fetch_page("prev")},n.prototype.fetch_page=function(t){var e=this.state.results;"next"==t?(this.state.current_page+=1,this._fetch(e._links.next)):(this.state.current_page-=1,this._fetch(e._links.prev))},n.prototype.fetch_stream=function(t){var e=this.state.results.streams.filter(function(e){return t==e._id});console.log(e)};var f=function(t,e){e||(e=10);var n=t/e;return t%e?Math.floor(n)+1:n},m=function(t,e){return new y(t,e).build()},v=function(t){if(t.preview.template){var e=t.preview.template.replace("{width}",200);return e=e.replace("{height}",200)}return"http://via.placeholder.com/125x125"},_=function(t){return`<div class="result row">\n    <img class='stream-img col-3' src="${v(t)}" onclick="window.jitters.fetch_stream(${t._id})"/>\n    <div class='col-9'>\n      <h1>${t.channel.display_name}</h1>\n      <h2>${t.game} - ${t.viewers} Viewers</h2>\n      <p>${t.channel.status}</p>\n    </div>\n  </div>`},g=function(t){return`<div class='error'>\n    <h1>Something went wrong...</h1>\n    <p>${t}</p>\n    <p>Please try again.</p>\n  </div>\n  `};function y(t,n){this.proto="https",this.host="api.twitch.tv",e[t]&&(this.path=e[t].path),this.params=n}var w=function(t){return Object.entries(t).map(function(t){return t.map(encodeURIComponent).join("=")}).join("&")};y.prototype.build=function(){var t=`${this.proto}://${this.host}/${this.path}`;return this.params&&(t=`${t}?${w(this.params)}`),t};var k=function(t){var e=0;if(t.length<=0)return e;for(var n=0;n<t.length;n++){e=(e<<5)-t.charCodeAt(n),e+=e}return e.toString()};module.exports={App:n,url_for:m,image_url:v,page_count:f,string_to_hash:k,buildPagerLinks:l,parseOffsetFromLink:d},"undefined"!=typeof window&&(window.App=n);
},{}]},{},[7])