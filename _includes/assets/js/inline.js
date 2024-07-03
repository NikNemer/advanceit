if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", user => {
    if (!user) {
      window.netlifyIdentity.on("login", () => {
        document.location.href = "/admin/";
      });
    }
  });
}
var tStart = 0 // Start transition 100px from top
  , tEnd = 300   // End at 300px
  , oStart = .15
  , oEnd = 1
  , oDiff = oEnd - oStart;

$(document).ready(function(){
  if ($(window).width() < 605) {
    $( "#mmenu" ).hide();
    $( "#mmenu .serv a" ).on( "click", function() {
      $("#mmenu:visible").hide();
        });
    
  }
    $(document).scroll(function() {
        var p = ($(this).scrollTop() - tStart) / (tEnd - tStart); // % of transition
        p = Math.min(1, Math.max(oStart, p)); // Clamp to [0, 1]
        var oBg = Math.round(oStart + oDiff) * p
        $(".fixed-top").css('background-color', 'rgb(15, 99, 174,' +oBg + ')');
        if ($(this).scrollTop() < 500) {
           $('.fixed-top').fadeIn();
        } else {
           $('.fixed-top').fadeOut();
        }
    });
  $('#mmenulogo').click(function() {
                $('#mmenu').slideToggle("fast");
    setTimeout(function() {
    $('#mmenu').fadeOut('fast');
}, 3000); // <-- time in milliseconds
        });
});
