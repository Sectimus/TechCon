import Session from "./modules/session.js";
import Talk from "./modules/talk.js";
import Bookmarks from "./modules/bookmarks.js";

var talks;

function loadSessions() {
  //display the session data
  $.when(Session.loadAll(), $.ready).done(function(sessions) {
    console.log(sessions);
    var template = $("#sessions_template").html();
    $.each(sessions, function() {
      var html = $(Mustache.to_html(template, this));
      $("#contentWrapper").append(html);
    });
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
      $.each(talks, function() {
        let talk = this;
        //check average ratings
        let average = (function getAverage(set) {
          let total = 0;
          for (let i = 0; i < set.length; i++) {
            total += parseInt(set[i]);
          }
          var avg = total / set.length;
          if (!total) {
            return 0;
          } else {
            return avg;
          }
        })(this.ratings);
        var filledStars = Math.floor(average * 1) / 1;
        var partialStar = parseFloat((average % 1).toFixed(2)) * 100;

        var html = $(Mustache.to_html(template, this));
        //set each star width
        (function fillStars() {
          let filledPartial = false;
          html.find(".star-over").each(function() {
            let starNum = $(this).attr("star");
            if (filledStars >= starNum) {
              $(this).width("100%");
            } else if (!filledPartial) {
              $(this).width(partialStar + "%");
              filledPartial = true;
            }
          });
        })();
        //set each star click handler to rate
        (function setupRatingHandlers() {
          html
            .find(".ratings")
            .children()
            .each(function() {
              //click function
              $(this).on("click", function() {
                var star = $(this);
                var rating = star.attr("star");
                //get the talk by using the mustache filled talk id to index into the talks global
                var talk = talks[star.closest("[talkid]").attr("talkid") - 1];

                talk.rate(rating);
              });
            });
        })();
        //set the submission handler for new tags
        (function setupNewTags() {
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
            $(this).hide();
            html.find("form[for='newtags']").show();
          });

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
              success: function(datas) {
                console.log(datas);
              }
            });
            form.hide();
            icon.show();
          });
        })();
        //set up the currently set bookmarks
        (function setupBookmarks() {
          //setup the display of bookmarks
          var bookmarks = Bookmarks.get();
          if (bookmarks.includes(talk.id)) {
            html.find(".bookmark>.bookmark-over").attr("active", "");
          }
          //setup the listener and handler of bookmarks
          html.find(".bookmarks>.bookmark-under").on("click", function() {
            //find out if this bookmark is triggered
            let inner = $(this).find(".bookmark-over");
            let activated = inner.attr("active") != null;

            let id = html.closest("[talkid]").attr("talkid");

            if (activated) {
              //deactivate the bookmark
              Bookmarks.remove(id);
              html.find(".bookmark>.bookmark-over").removeAttr("active");
            } else {
              //activate the bookmark
              Bookmarks.add(id);
              html.find(".bookmark>.bookmark-over").attr("active", "");
            }
          });
        })();

        content.append(html);
      });
    })
    .then(function(asd) {
      return content.children();
    });
}

$(document).ready(function() {
  $("#test").on("click", function() {
    switchPage("talks", loadTalks());
  });
});

//loadSessions();
//loadTalks();
//startSwitch("Session search");

//takes a promise that child elements will be provided
function switchPage(pagename, promise) {
  var animation = startSwitch(pagename);
  //when the page data has loaded, animation completed and the document is ready
  $.when(promise, animation, $.ready).done(function(content) {
    endSwitch(content);
  });
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
function startSwitch(pagename) {
  var template = $("#loader_template").html();
  var html = $(Mustache.to_html(template, { pagename: pagename }));
  var animation = animationTransition(html);
  return animation;
}
//switch to the new content
function endSwitch(to) {
  var animation = animationTransition(to);
  return animation;
}
