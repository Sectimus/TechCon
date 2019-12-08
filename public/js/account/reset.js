var email;
$(document).ready(function(){
  $("#resetform").on('submit', function(e){
    e.preventDefault();

    $("p[errorType]").hide();
      $("#resetbtn").attr("disabled", true);
      $.ajax({
        url: window.location.href,
        method: 'POST',
        dataType: 'json',
        data: $(this).serialize(),
        success: function(data){
          email=$("#email").val();
          $("#resetbtn").attr("disabled", false);


          $("#resetform").hide();

          $("#authcodeemail").text(email);
          $("#confirmationform").show();
        },
        error: function(a, b, c){
          console.log(a);
          console.log(b);
          console.log(c);
          console.log(a.responseJSON);
          grecaptcha.reset();
          $(".g-recaptcha").show();
          $("#resetbtn").hide();
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
            case "EmailSendError":{
              $("p[errorType='email']").show();
              break;
            }

          }
          $("#resetbtn").attr("disabled", false);
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
      url: window.location.href,
      method: 'POST',
      dataType: 'json',
      data: $(this).serialize()+"&email="+email,
      success: function(data){
        $("#confirmbtn").attr("disabled", false);

        $("#confirmationform").hide();
        $("#changeform").show();
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

  $("#changeform").on('submit', function(e){
    e.preventDefault();
    $("p[errorType]").hide();
    if (checkPasswords()) {
      $("#changebtn").attr("disabled", true);
      $.ajax({
        url: window.location.href,
        method: 'POST',
        dataType: 'json',
        data: $(this).serialize(),
        success: function(data){
          $("#confirmationform").hide();
          $("p[errorType='success']").show();
          setTimeout(function(){ window.location.replace("/account/manage"); }, 2000);
        },
        error: function(a, b, c){
          console.log(a);
          console.log(b);
          console.log(c);
          console.log(a.responseJSON);
          $("#changebtn").attr("disabled", false);
        }
      });
    } else{
      $("p[errorType='wrongcode']").show();
    }
  })
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

function captchaCallback(token){
  console.log(token);
  $(".g-recaptcha").hide();
  $("#resetbtn").show();
}
