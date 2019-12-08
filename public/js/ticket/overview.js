$(document).ready(function(){
  $.ajax({
    url: window.location.href,
    method: 'GET',
    dataType: 'json',
    data: {"type":"raw"},
    success: function(data){
      console.log(data);
      var template = $("#ticket_template").html();
      $.each(data, function() {
        var html = $(Mustache.to_html(template, this));
        switch (this.priority) {
          case "High":{
            html.find("[ticket='type']").addClass("badge-danger");
            break;
          }
          case "Medium":{
            html.find("[ticket='type']").addClass("badge-warning");
            break;
          }
          case "Low":{
            html.find("[ticket='type']").addClass("badge-secondary");
            break;
          }
          default:{
            html.find("[ticket='type']").addClass("badge-secondary");
            break;
          }
        }
        switch (this.status) {
          case "Open":{
            html.find("[ticket='status']").addClass("badge-info");
            break;
          }
          case "Resolved":{
            html.find("[ticket='status']").addClass("badge-success");
            break;
          }
          case "Closed":{
            html.find("[ticket='status']").addClass("badge-secondary");
            break;
          }
          default:{
            html.find("[ticket='status']").addClass("badge-secondary");
            break;
          }
        }
        html.find("[ticket='view']").attr('href', "/ticket/"+this.id);
        var obj = this;
        if (this.admin) {
          html.find("[ticket='delete']").on('click', function(){
            var url = "/ticket/"+obj.id;
            $.ajax({
              url: url,
              method: 'DELETE',
              success: function(data){
                location.reload();
              },
              error: function(a,b,c){
                console.log(a); console.log(b); console.log(c);
                location.reload();
              }
            });
          });
          html.find("[ticket='delete']").show();
        }


        html.find("[ticket='assignform']").on('submit', function(e){
          e.preventDefault();
          console.log(this);

          var url = "/ticket/"+$(this).attr('ticketid');
          $.ajax({
            url: url,
            method: 'PUT',
            data: $(this).serialize(),
            success: function(data){
              window.location.reload();
            },
            error: function(a,b,c){
              console.log(a); console.log(b); console.log(c);
              console.log(html.find("[ticket='assignform']").find("[name='teammember']"));
              html.find("[ticket='assignform']").find("[name='teammember']")[0].value = "Not a valid teammember"
            }
          });
        });


        $("[ticket='container']").append(html);
      });
    },
    error: function(a, b, c){
      console.log(a);
      console.log(b);
      console.log(c);
      console.log(a.responseJSON);
    },
    complete: function(jqXHR, status){

    }
  });
  $("[ticket='create']").on('click', function(){
    $("[ticket='createpanel']").show();
    $("[ticket='create'").text("Save").removeClass("btn-dark").addClass("btn-success");

    $("[ticket='create'").off('click');
    $("[ticket='create'").on('click', function(){
      // TODO: save the stuff and reload
      var url = "/ticket/";
      $.ajax({
        url: url,
        method: 'POST',
        data: $("[ticket='createpanel']").serialize(),
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
