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
    //end the switch
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
