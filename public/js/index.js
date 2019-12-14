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
  //display the session data
  $.when(Talk.loadAll(), $.ready).done(function(data_talks) {
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

      $("#contentWrapper").append(html);
    });
  });
}

$(document).ready(function() {
  var t = new Talk(
    1,
    "Martin Fowler",
    "Patterns of Enterprise Application Architecture",
    "The practice of enterprise application development has benefited from the emergence of many new enabling technologies. Multi-tiered object-oriented platforms, such as Java and .NET, have become commonplace. These new tools and technologies are capable of building powerful applications, but they are not easily implemented. Common failures in enterprise applications often occur because their developers do not understand the architectural lessons that experienced object developers have learned.",
    "A",
    "9:00-10:00",
    ["patterns, archtecture"],
    []
  );
  /*
    var session = Session.load();
    session.addTalk(t);
    */
});

//loadSessions();
loadTalks();
