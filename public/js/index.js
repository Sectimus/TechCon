import Session from "./modules/session.js";
import Talk from "./modules/talk.js";

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
  return drawTalks(Talk.loadBySessionId("B"));
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
