//menuButton = $(".T-I.J-J5-Ji.T-I-Js-Gs.aap.T-I-awG.T-I-ax7.L3")
//viewTranslateButton = $('.B9.J-J5-Ji') or $(':contains(View translated message)').last()
//translateButton in Menu = $(':contains(Translate message)').last()


// register click event for translation button
$(document).on('click', ".B9.J-J5-Ji", function(){
    let translationButton = $('.B9.J-J5-Ji');
    translationButton.log();
    console.log(translationButton.text());
    let textBody = $('.a3s.aiL');
    textBody.log();
    console.log(textBody.text());
});


$.fn.log = function() {
    console.log.apply(console, this);
    return this;
};

