import Session from "./modules/session.js";
import Talk from "./modules/talk.js";
import Bookmarks from "./modules/bookmarks.js";
//init moment-range
window["moment-range"].extendMoment(moment);

var talks;

function anchorHandler(anchor) {
  let link = $(anchor).attr("href");
  //push the new page state onto the history api
  window.history.pushState(null, null, link);
  loadByUrl();
  //cancel the default anchor link behaviour
  return false;
  //loadPage(page);
}

function loadSessions() {
  return drawSessions(Session.loadAll());
}
function drawSessions(sessionsPromise) {
  //display the session data

  //create holding div to append to (only children are returned)
  var content = $("<div>");
  return $.when(sessionsPromise, $.ready)
    .done(function(sessions) {
      var template = $("#sessions_template").html();
      $.each(sessions, function() {
        var html = $(Mustache.to_html(template, this));
        content.append(html);
      });
    })
    .then(function() {
      return content.children();
    });
}

function loadTalks() {
  return drawTalks(Talk.loadAll());
}
function drawTalks(talksPromise) {
  //create holding div to append to (only children are returned)
  var content = $("<div>");
  //return a promise that has the html generated for this page
  //this is executed when both the document is ready and talks have been loaded from the server
  return $.when(talksPromise, $.ready)
    .done(function(data_talks) {
      //setup talks global
      talks = data_talks;
      var template = $("#talks_template").html();
      function fillStars(html, id, ratings) {
        //set ratings amount
        html.find(".ratings>.count").text("x" + ratings.length);
        //check average ratings
        let total = 0;
        for (let i = 0; i < ratings.length; i++) {
          total += parseInt(ratings[i]);
        }
        var average = total / ratings.length;
        if (!total) {
          average = 0;
        }

        //set the rating value
        html.find("[rating]").attr("rating", average);
        //set each star width
        var filledStars = Math.floor(average * 1) / 1;
        var partialStar = parseFloat((average % 1).toFixed(2)) * 100;
        let filledPartial = false;
        html.find(".star-over").each(function() {
          let starNum = $(this).attr("star");
          if (filledStars >= starNum) {
            $(this).width("100%");
          } else if (!filledPartial) {
            $(this).width(partialStar + "%");
            filledPartial = true;
          } else if (filledPartial) {
            $(this).width("0%");
          }
        });

        //set each star click handler to rate
        html
          .find(".ratings")
          .children("[star]")
          .each(function() {
            //click function
            $(this).off();
            $(this).on("click", function() {
              var star = $(this);
              var rating = star.attr("star");
              //get the talk by using the mustache filled talk id to index into the talks global
              var talk = talks[star.closest("[talkid]").attr("talkid") - 1];
              talk.rate(rating);
              ratings.push(rating);
              fillStars(html, id, ratings);
            });
          });
        return html;
      }
      function fillTags(html) {
        //set the submission handler for new tags
        let icon = html.find(".tags>.new>.icon");
        let form = html.find("form[for='newtags']");
        let newtagInput = form.find("[name='tag']");

        newtagInput.on("input", function() {
          var ctx = $("<canvas>")[0].getContext("2d");
          let thisJ = $(this);
          var font = thisJ.css("font-size") + " " + thisJ.css("font-family");
          ctx.font = font;

          this.style.width = ctx.measureText(this.value).width + 26 + "px";
        });

        icon.on("click", function() {
          //reset other form elements
          $("form[for='newtags']").hide();
          $(".tags>.new>.icon").show();
          $(this).hide();
          //reset the form
          html.find("form[for='newtags']>[name='tag']").val("");
          html.find("form[for='newtags']").show();
        });

        //remove old handler
        form.off("submit");
        //click data is logged in html, only js handler is setup due to refresh issue
        form.on("submit", function(test) {
          test.preventDefault();

          let url = form.attr("action");
          let method = form.attr("method");
          let formdata = form.serializeArray()[0];
          let data = {};
          data[formdata.name] = formdata.value;

          $.ajax({
            method: method,
            url: url,
            data: data,
            dataType: "application/json",
            complete: function() {
              let ele = $($("#talks_template").html())
                .find(".tags>.tag")
                .prop("outerHTML");
              var tag = $(Mustache.to_html(ele, data.tag));
              html.find(".tags>.tag:last").after(tag);
              //rereun the tag filler to enable popper correctly
              fillTags(html);
            }
          });
          form.hide();
          icon.show();
        });

        //init popper
        html
          .find('[data-toggle="tooltip"]')
          .on("mouseenter", function() {
            //setup the tooltip to only display if the content is too wide
            var $t = $(this);
            var title = $t.attr("title");
            if (!title) {
              if (this.offsetWidth < this.scrollWidth) {
                //it is ellipsed
                $t.attr("data-original-title", $t.text());
              } else {
                $t.removeAttr("data-original-title");
              }
            } else {
              if (this.offsetWidth >= this.scrollWidth && title == $t.text()) {
              }
            }
          })
          .tooltip();

        return html;
      }
      function fillBookmarks(html, talk) {
        //setup the display of bookmarks
        var bookmarks = Bookmarks.get();
        if (bookmarks.some(bookmark => bookmark.talkid === talk.id)) {
          html.find(".bookmark>.bookmark-over").attr("active", "");
        }
        //setup the listener and handler of bookmarks
        html.find(".bookmarks>.bookmark-under").on("click", function() {
          //find out if this bookmark is triggered
          let inner = $(this).find(".bookmark-over");
          let activated = inner.attr("active") != null;

          let id = talk.id;
          let time = talk.time;

          if (activated) {
            //deactivate the bookmark
            Bookmarks.remove(id);
            html.find(".bookmark>.bookmark-over").removeAttr("active");
          } else {
            //activate the bookmark

            //but first check if this time is already booked

            //setup the times
            let reqArr = talk.time.split("-");
            let reqStart = moment(reqArr[0], "HH:mm:ss");
            let reqEnd = moment(reqArr[1], "HH:mm:ss");
            let reqRange = moment.range(reqStart, reqEnd);

            //go through each timeSegment and see if it overlaps with the currently requested one
            console.log(Bookmarks.get());

            var overlaps = false;
            Bookmarks.get().forEach(bookmark => {
              let arr = bookmark.time.split("-");
              let start = moment(arr[0], "HH:mm:ss");
              let end = moment(arr[1], "HH:mm:ss");
              let range = moment.range(start, end);

              if (reqRange.overlaps(range)) {
                //the time overlaps
                if (!overlaps) {
                  //init array
                  overlaps = [];
                }
                overlaps.push(bookmark);
              }
            });
            if (!overlaps) {
              //this bookmark is valid to be added
              Bookmarks.add(id, time);
              html.find(".bookmark>.bookmark-over").attr("active", "");
            } else {
              //this bookmark overlaps with some others

              //go through each overlaped talk and get the data
              var overlapedTalkPromises = [];
              overlaps.forEach(overlap => {
                overlapedTalkPromises.push(Talk.loadById(overlap.talkid));
              });
              $.when(...overlapedTalkPromises).done(function(
                ...overlappedTalkData
              ) {
                var description = "";
                //setup the talk titles
                for (let i = 0; i < overlappedTalkData.length; i++) {
                  console.log(overlappedTalkData[i]);

                  description +=
                    i +
                    1 +
                    ": " +
                    overlappedTalkData[i].title +
                    " <small>" +
                    overlappedTalkData[i].time +
                    "</small>" +
                    "<br />";
                  console.log(description);
                }

                $(".popover").popover("dispose");
                html
                  .find(".bookmarks>.bookmark-under")
                  .popover({
                    title: "Talk times overlap",
                    html: true,
                    content: description
                  })
                  .popover("show");
                setTimeout(() => {
                  html.find(".bookmarks>.bookmark-under").popover("hide");
                }, 3000);
              });
            }
          }
        });
        return html;
      }
      $.each(talks, function() {
        var html = $(Mustache.to_html(template, this));
        html = fillStars(html, this.id, this.ratings);
        html = fillTags(html);
        html = fillBookmarks(html, this);

        content.append(html);
      });
    })
    .then(function() {
      return content.children();
    });
}

$(document).ready(function() {
  //setup popstate handler
  $(window).on("popstate", e => loadByUrl());
  //setup the navigation anchors
  $("#navigation")
    .find("[href*='/view/']")
    .on("click", function() {
      return anchorHandler(this);
    });
  //load the page by url
  loadByUrl();
  //setup the filters
  setupFilters();
});

function setupFilters() {
  $("#filter").on("submit", function(e) {
    e.preventDefault();
    var shownFilter = $("[filter]:not([style='display:none;'])");

    //make an array of the content in order
    var content = $("#contentWrapper")
      .children()
      .toArray();

    //reset the view
    content.forEach(element => {
      $(element).show();
    });
    //check which filter is active
    switch (shownFilter.attr("filter")) {
      case "talks": {
        //sort by
        $(this)
          .serializeArray()
          .forEach(formdata => {
            switch (formdata.name) {
              case "speaker": {
                //if the speaker is wanting to be searched
                if (formdata.value) {
                  content.forEach(element => {
                    element = $(element);
                    let speaker = element.find("[talk='speaker']").text();

                    if (
                      speaker
                        .toLowerCase()
                        .includes(formdata.value.toLowerCase())
                    ) {
                      element.show();
                    } else {
                      element.hide();
                    }
                  });
                }
                break;
              }
              case "session": {
                break;
              }
              case "tags": {
                //if the tag is wanting to be searched
                if (formdata.value) {
                  //split the tags
                  var tags = formdata.value.split(",");
                  //for each element
                  content.forEach(element => {
                    element = $(element);
                    var $tags = element.find("[talk='tag']");
                    //for each tag element that is being searched
                    var found = false;
                    $tags.each(function() {
                      //for each tag the user entered

                      tags.forEach(tag => {
                        if (
                          $(this)
                            .text()
                            .toLowerCase()
                            .trim() == tag.toLowerCase().trim()
                        ) {
                          found = true;
                        }
                      });
                    });
                    if (!found) {
                      element.hide();
                    }
                  });
                }
                break;
              }
              case "sort": {
                //check which sort option was selected
                switch (formdata.value) {
                  case "titleasc":
                  case "titledesc":
                  case "default": {
                    //if it is not the default value then do a sort
                    if (formdata.value != "default") {
                      content.sort(function(a, b) {
                        let $a = $(a);
                        let $b = $(b);

                        let titleA = $a.find("[talk='title']").text();
                        let titleB = $b.find("[talk='title']").text();
                        return titleA.localeCompare(titleB);
                      });
                      if (formdata.value == "titledesc") {
                        content.reverse();
                      }
                    } else {
                      //preserve the default state (sort by id)
                      content.sort(function(a, b) {
                        let $a = $(a);
                        let $b = $(b);

                        let idA = $a.attr("talkid");
                        let idB = $b.attr("talkid");
                        return idA - idB;
                      });
                    }
                    break;
                  }
                  case "ratinghigh":
                  case "ratinglow": {
                    content.sort(function(a, b) {
                      let $a = $(a);
                      let $b = $(b);

                      let ratingA = $a.find("[rating]").attr("rating");
                      let ratingB = $b.find("[rating]").attr("rating");
                      return ratingB - ratingA;
                    });
                    if (formdata.value == "ratinglow") {
                      content.reverse();
                    }
                    break;
                  }
                  case "ratingmost":
                  case "ratingleast": {
                    content.sort(function(a, b) {
                      let $a = $(a);
                      let $b = $(b);

                      let ratingsA = $a
                        .find("[talk='ratings']")
                        .text()
                        .substr(1);
                      let ratingsB = $b
                        .find("[talk='ratings']")
                        .text()
                        .substr(1);
                      return ratingsB - ratingsA;
                    });
                    if (formdata.value == "ratingleast") {
                      content.reverse();
                    }
                    break;
                    break;
                  }
                }
                break;
              }
            }
          });

        break;
      }
    }
    $("#contentWrapper").append(
      $(
        $.map(content, function(el) {
          return $.makeArray(el);
        })
      )
    );
  });
}

function loadByUrl() {
  var url = window.location.pathname;

  //build regex for matching page
  var paths = [
    {
      name: "specific talk",
      regex: new RegExp("^\\/view\\/talk\\/(?<id>\\d+)\\/?$", "gi")
    },
    {
      name: "talks",
      regex: new RegExp("^\\/view\\/talks\\/?$", "gi")
    },
    {
      name: "sessions",
      regex: new RegExp("^\\/view\\/sessions\\/?$", "gi")
    }
  ];
  var matched = false;
  paths.forEach(path => {
    let result = url.match(path.regex);
    if (result !== null) {
      matched = { path: path, results: result.groups };
    }
  });

  //if the page is matched by a path
  if (matched) {
    //hide the other filters
    $("[filter]").hide();
    //switch the path
    var page;
    switch (matched.path.name) {
      case "talks": {
        var page = { promise: null, name: null };
        page.promise = loadTalks();
        page.name = "talks";

        //show filter options
        $("[filter='talks']").show();
        break;
      }
      case "talkss": {
        var page = { promise: null, name: null };
        page.promise = loadTalks();
        page.name = "talks";
        break;
      }
      case "sessions": {
        var page = { promise: null, name: null };
        page.promise = loadSessions();
        page.name = "sessions";
        break;
      }
    }
    if (page != undefined) {
      switchPage(page.name, page.promise);
    } else {
      $("#contentWrapper").html("<h1>Error loading page</h1>");
    }
  } else {
    $("#contentWrapper").html("<h1>Invalid page path</h1>");
    //this page was not matched, return an error
  }

  /*
  var page = (url => {
    function isMatched(search) {
      return (
        url == search ||
        url == search + "/" ||
        url + "/" == search ||
        url + "/" == search + "/"
      );
    }
    switch (true) {
      case isMatched("/"): {
        $("#contentWrapper").html("<h1>HOME</h1>");
        break;
      }
      case isMatched("/view/talks"): {
        var o = { promise: null, name: null };
        o.promise = loadTalks();
        o.name = "talks";
        return o;
        break;
      }
      case isMatched("/view/talk/*"): {
        $("#contentWrapper").html("<h1>GOT IT</h1>");
        break;
      }
      default: {
        $("#contentWrapper").html("<h1>Error loading page</h1>");
        break;
      }
    }
  })(url);
  console.log(page);
*/
}

//loadSessions();
//loadTalks();
//startSwitch("Session search");

//takes a promise that child elements will be provided
function switchPage(pagename, promise) {
  var animation = startSwitch(pagename);
  //when the page data has loaded, animation completed and the document is ready
  $.when(promise, animation, $.ready).done(function(content) {
    //playground
    //setup click handlers for the anchor links to implement SPA functionality
    content.find("[href*='/view/']").on("click", function() {
      return anchorHandler(this);
    });
    //playground

    //end the switch
    endSwitch(content);
  });
}
function startSwitch(pagename) {
  var template = $("#loader_template").html();
  var html = $(Mustache.to_html(template, { pagename: pagename }));
  var animation = animationTransition(html);
  return animation;
}
//show the loading pane
function animationTransition(content) {
  var animation = $("#contentWrapper")
    .animate(
      {
        opacity: 0
      },
      150,
      function() {
        $("#contentWrapper").html(content);
        $("#contentWrapper").animate(
          {
            opacity: 1
          },
          150
        );
      }
    )
    .promise();
  return animation;
}
//switch to the new content
function endSwitch(to) {
  var animation = animationTransition(to);
  return animation;
}
