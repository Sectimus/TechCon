$(document).ready(function(){
  var email;
  $("#registerform").on('submit', function(e){
    e.preventDefault();

    $("p[errorType]").hide();
    if (checkPasswords() && checkEmails()) {
      $("#registerbtn").attr("disabled", true);
      $.ajax({
        url: window.location.href,
        method: 'POST',
        dataType: 'json',
        data: $(this).serialize(),
        success: function(data){
          email=$("#email").val();
          $("#registerform").hide();

          $("#authcodeemail").text(email);
          $("#confirmationform").show();

          $("#registerbtn").attr("disabled", false);
        },
        error: function(a, b, c){
          console.log(a);
          console.log(b);
          console.log(c);
          console.log(a.responseJSON);
          grecaptcha.reset();
          $(".g-recaptcha").show();
          $("#registerbtn").hide();
          switch (a.responseJSON.id) {
            case "AlreadyExistsUsername":{
              $("p[errorType='username']").show();
              break;
            }
            case "AlreadyExistsEmail":{
              $("p[errorType='emailregistered']").show();
              break;
            }
          }

          $("#registerbtn").attr("disabled", false);
        }
      });
    }
  });
  $("#confirmationform").on('submit', function(e){
    console.log($(this).serialize());
    e.preventDefault();
    $("#confirmbtn").attr("disabled", true);
    $("p[errorType]").hide();
    console.log(e);
    $.ajax({
      url: window.location.href,
      method: 'POST',
      dataType: 'json',
      data: $(this).serialize()+"&email="+email,
      success: function(data){
        alert("registered");
      },
      error: function(a, b, c){
        console.log(a);
        console.log(b);
        console.log(c);
        console.log(a.responseJSON);
        switch (a.responseJSON.id) {
          case "AttemptsRemaining":{
            $("p[errorType='wrongcode']").text("Incorrect! "+a.responseJSON.text+" Attempts remaining.");
            $("p[errorType='wrongcode']").show();
            break;
          }
          case "NotRequested":{
            $("p[errorType='nocode']").show();
            break;
          }
          case "OutOfAttempts":{
            $("p[errorType='codeout']").show();
            setTimeout(function(){ location.reload(); }, 2000);

            break;
          }
        }
        $("#confirmbtn").attr("disabled", false);
      }
    });
  });

  //tooltips
  $("input[target^='tooltip']").on('focus', function(e){tooltipShow(e);});
  $("input[target^='tooltip']").on('focusout', function(e){tooltipHide(e);});
});
function checkPasswords(){
  var pwd1=$("#password").val(), pwd2=$("#confpassword").val();
  if (pwd1==pwd2) {
    $("p[errorType='passwordnomatch']").hide();
    return true;
  } else{
    $("p[errorType='passwordnomatch']").show();
    return false;
  }
}
function checkEmails(){
  var eml1=$("#email").val(), eml1=$("#confemail").val();
  if (eml1==eml1) {
    $("p[errorType='emailnomatch']").hide();
    return true;
  } else{
    $("p[errorType='emailnomatch']").show();
    return false;
  }
}


function tooltipShow(e){
  var el = $(e.target);
  var target = el.attr("target");
  if (el.hasClass("col-12")) {
    el.removeClass("col-12"); el.addClass("col-11");
  } else if(el.hasClass("col-6")){
    el.removeClass("col-6"); el.addClass("col-5");
  }
  $("span[id^='tooltip']").stop();
  $("span[id^='tooltip']").hide();
  $("#"+target).delay( 250 ).fadeIn( 100 );
}
function tooltipHide(e){
  var el = $(e.target);
  var target = el.attr("target");
  if (el.hasClass("col-11")) {
    el.removeClass("col-11"); el.addClass("col-12");
  } else if(el.hasClass("col-5")){
    el.removeClass("col-5"); el.addClass("col-6");
  }
  $("span[id^='tooltip']").stop();
  $("span[id^='tooltip']").hide();
}
function captchaCallback(token){
  console.log(token);
  $(".g-recaptcha").hide();
  $("#registerbtn").show();
}
