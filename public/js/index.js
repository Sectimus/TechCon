import Session from "./modules/session.js";
import Talk from "./modules/talk.js";

function loadSessions() {
  //display the session data
  $.when(Session.loadAll(), $.ready).done(function(sessions) {
    console.log(sessions);
    var template = $("#session_template").html();
    $.each(sessions, function() {
      var html = $(Mustache.to_html(template, this));
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
