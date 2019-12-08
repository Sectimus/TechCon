$(document).ready(function(){
  var ticket_data = JSON.parse($("#ticket_data").text());
  var comment_data = JSON.parse($("#comment_data").text());

  var template = $("#ticket_template").html();
  var html = $(Mustache.to_html(template, ticket_data));
  $("[ticket='container']").append(html);

  switch (ticket_data.type) {
    case "Development":{
      html.find("[ticket='edittype']").find("[value='Development']").attr('selected', '');
      break;
    }
    case "Testing":{
      html.find("[ticket='edittype']").find("[value='Testing']").attr('selected', '');
      break;
    }
    case "Deployment":{
      html.find("[ticket='edittype']").find("[value='Deployment']").attr('selected', '');
      break;
    }
    default:{
      html.find("[ticket='type']").addClass("badge-secondary");
      break;
    }
  }
  switch (ticket_data.priority) {
    case "High":{
      html.find("[ticket='type']").addClass("badge-danger");
      html.find("[ticket='editpriority']").find("[value='High']").attr('selected', '');
      break;
    }
    case "Medium":{
      html.find("[ticket='type']").addClass("badge-warning");
      html.find("[ticket='editpriority']").find("[value='Medium']").attr('selected', '');
      break;
    }
    case "Low":{
      html.find("[ticket='type']").addClass("badge-secondary");
      html.find("[ticket='editpriority']").find("[value='Low']").attr('selected', '');
      break;
    }
    default:{
      html.find("[ticket='type']").addClass("badge-secondary");
      break;
    }
  }
  switch (ticket_data.status) {
    case "Open":{
      html.find("[ticket='status']").addClass("badge-info");
      html.find("[ticket='editstatus']").find("[value='Open']").attr('selected', '');
      break;
    }
    case "Resolved":{
      html.find("[ticket='status']").addClass("badge-success");
      html.find("[ticket='editstatus']").find("[value='Resolved']").attr('selected', '');
      break;
    }
    case "Closed":{
      html.find("[ticket='status']").addClass("badge-secondary");
      html.find("[ticket='editstatus']").find("[value='Closed']").attr('selected', '');
      break;
    }
    default:{
      html.find("[ticket='status']").addClass("badge-secondary");
      break;
    }
  }
  if (ticket_data.admin) {
    $("[ticket='delete']").on('click', function(){
      var url = "/ticket/"+ticket_data.id;
      $.ajax({
        url: url,
        method: 'DELETE',
        success: function(data){
          window.location.replace("/tickets/");
        },
        error: function(a,b,c){
        }
      });
    });
    if (ticket_data.owner) {
      $("[ticket='edit']").show();
    }
    $("[ticket='adminpanel']").show();
  }
  $("[ticket='container']").append(html);

  template = $("#comment_template").html();
  $.each(comment_data, function() {
    html = $(Mustache.to_html(template, this));
    console.log(this);
    if (this.admin) {
      var obj = this;
      html.find("[comment='delete']").on('click', function(){
        var commentid=$(this).attr('commentid');
        var url = "/ticket/"+ticket_data.id+"/comment/"+commentid;
        $.ajax({
          url: url,
          method: 'DELETE',
          success: function(data){
            location.reload();
          },
          error: function(a,b,c){
          }
        });
      });
      if (this.owner) {
        html.find("[comment='edit']").show();
      }
      html.find("[comment='adminpanel']").show();
    }
    $("[comment='container']").append(html);
  });

  if (ticket_data.status != "Open") {
    $("[comment='create']").hide();
    $("[comment='edit']").hide();
    $("[ticket='edit']").hide();
    $("[ticket='reopen']").on('click', function(){
      // TODO: save the stuff and reload
      var url = "/ticket/"+ticket_data.id;
      $.ajax({
        url: url,
        method: 'PUT',
        success: function(data){
          window.location.reload();
        },
        error: function(a,b,c){
          console.log(a);console.log(b);console.log(c);
        }
      });
    });
    $("[ticket='reopen']").show();
  }

  $("[ticket='edit']").on('click', function(){
    switch ($("[ticket='wrapper']").attr('mode')) {
      case 'display':{
        $("[ticket='displaypanel']").hide();
        $("[ticket='editpanel']").show();
        $("[ticket='edit']").text("Save");
        $("[ticket='delete']").hide();
        $("[ticket='wrapper']").attr('mode', 'edit');
        break;
      }
      case 'edit':{
        // TODO: save the stuff and reload
        var url = "/ticket/"+ticket_data.id;
        $.ajax({
          url: url,
          method: 'PATCH',
          data: $("[ticket='editpanel']").serialize(),
          success: function(data){
            window.location.reload();
          },
          error: function(a,b,c){
          }
        });
        break;
      }
    }
  });
  $("[comment='edit']").on('click', function(){
    var commentid=$(this).attr('commentid');
    var commentwrapper=$("[comment='wrapper'][commentid="+commentid+"]");
    var commenteditpanel=$("[comment='editpanel'][commentid="+commentid+"]");//commentid
    console.log(commentwrapper); //.find("[comment='displaypanel']")
    switch (commentwrapper.attr('mode')) {

      case 'display':{
        commentwrapper.find("[comment='displaypanel']").hide();
        commentwrapper.find("[comment='editpanel']").show();
        commentwrapper.find("[comment='edit']").text("Save");
        commentwrapper.find("[comment='delete']").hide();
        commentwrapper.attr('mode', 'edit');
        break;
      }
      case 'edit':{
        // TODO: save the stuff and reload
        var url = "/ticket/"+ticket_data.id+"/comment/"+commentid;
        $.ajax({
          url: url,
          method: 'PATCH',
          data: commentwrapper.find("[comment='editpanel']").serialize(),
          success: function(data){
            window.location.reload();
          },
          error: function(a,b,c){
          }
        });
        break;
      }
    }
  });

  $("[comment='create'").on('click', function(){
    $("[comment='createpanel']").show();
    $("[comment='create'").text("Save").removeClass("btn-dark").addClass("btn-success");

    $("[comment='create'").off('click');
    $("[comment='create'").on('click', function(){
      // TODO: save the stuff and reload
      var url = "/ticket/"+ticket_data.id+"/comment/";
      $.ajax({
        url: url,
        method: 'POST',
        data: $("[comment='createpanel']").serialize(),
        success: function(data){
          window.location.reload();
        },
        error: function(a,b,c){
          console.log(a); console.log(b); console.log(c);
        }
      });
    });
  });

});
