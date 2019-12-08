var username;
$(document).ready(function(){
  $("#loginform").on('submit', function(e){
    e.preventDefault();
    $("p[errorType]").hide();
    $("#loginbtn").attr("disabled", true);
    username=$("#username").val();
    $.ajax({
      url: window.location.href,
      method: 'POST',
      dataType: 'json',
      data: $(this).serialize(),
      success: function(data){
        console.log(data);
        switch (data.id) {
          case "Need2FA":{
            $("#loginform").hide();
            $("#confirmationform").show();
            break;
          }
          case "LoggedIn":{
            login();
            break;
          }
        }
      },
      error: function(a, b, c){
        console.log(a);
        console.log(b);
        console.log(c);
        console.log(a.responseJSON);
        switch (a.responseJSON.id) {
          case "AlreadyLoggedIn":{
            $("p[errorType='loggedin']").show();
            break;
          }
          case "LoginInvalid":{
            $("p[errorType='incorrect']").show();
            break;
          }
          case "CaptchaError":{
            $("p[errorType='captcha']").show();
            break;
          }
        }
      },
      complete: function(jqXHR, status){
        $(".g-recaptcha").show();
        grecaptcha.reset();
        $("#loginbtn").hide();
        $("#loginbtn").attr("disabled", false);
      }
    });
  });
  $("#confirmationform").on('submit', function(e){
    console.log($(this).serialize());
    e.preventDefault();
    $("#confirmbtn").attr("disabled", true);
    $("p[errorType]").hide();
    console.log(e);
    $.ajax({
      url: "/account/conf",
      method: 'POST',
      dataType: 'json',
      data: $(this).serialize()+"&username="+username,
      success: function(data){
        login();
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
});

function login(){
  //Read GET request
  var callback = new URLSearchParams(window.location.search).get("callback");
  if (callback) {
    window.location.replace(callback);
  }
  else{
    window.location.replace("/");
  }
}

function captchaCallback(token){
  console.log(token);
  $(".g-recaptcha").hide();
  $("#loginbtn").show();
}
