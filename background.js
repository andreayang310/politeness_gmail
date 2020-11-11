// Some Logging for debugging
// translateButton.log();
// textBody.log();
// console.log(translationButton.text());
// console.log(textBody.text());
// console.log(originalLanguage.text());

const menuTranslateSelector = '.cj';
const viewTranslationButtonSelector = '.B9.J-J5-Ji';
const textBodySelector = '.a3s.aiL';
const languageButtonSelector = '.J-J5-Ji.J-JN-M-I-Jm';
let cache = {}

// register click event for translation button
$(document).on('click', menuTranslateSelector, function() {
    if ($( this ).text() === 'Translate message'){
        setTimeout(function(){
            getPoliteness();
        }, 1500);
    }
});

$(document).on('click', viewTranslationButtonSelector, function(){
    getPoliteness();
});


$.fn.log = function() {
    console.log.apply(console, this);
    return this;
};

async function getPoliteness() {
    const originalLanguage = $(languageButtonSelector).first().text();
    const translatedLanguage = $(languageButtonSelector).last().text();
    const originalText = $(textBodySelector).first().text();
    const translatedText = $(textBodySelector).last().text()
    const viewTranslationButton = $(viewTranslationButtonSelector).first().text();

    if (originalLanguage === 'Chinese' && translatedLanguage === 'English') {
        if (viewTranslationButton == "View translated message") {
            // console.log("Getting Chinese Politeness")
            if (cache[originalText]){
                let politeness = cache[originalText]
                // console.log("The Chinese text is:", politeness);
                injectHTML(originalLanguage, politeness);
            }else{
                let politeness = await chinesePolitenessAPI(originalText); //polite, neutral, impolite
                cache[originalText] = politeness
                // console.log("The Chinese text is:", politeness);
                injectHTML(originalLanguage, politeness);
            }
        } else {
            // console.log("Getting English Politeness")
            if (cache[translatedText]){
                let politeness = cache[translatedText]
                // console.log("The English text is:", politeness);
                injectHTML(translatedLanguage, politeness);
            }else{
                let politeness = await englishPolitenessAPI(translatedText); //polite, neutral, impolite
                // console.log("The English text is:", politeness);
                cache[translatedText] = politeness
                injectHTML(translatedLanguage, politeness);
            }
        }
    }
}

//{'label': label, 'score': score}
async function englishPolitenessAPI(text) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    const urlencoded = new URLSearchParams();
    urlencoded.append("sentence", text);
    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',

    };
    const proxyurl = 'https://cors-anywhere-politeness.herokuapp.com/';
    const url = "https://politeness-api.herokuapp.com/en-politeness";
    let response = await fetch(proxyurl + url, requestOptions)
    let json = await response.json();
    console.log(json)
    return json
}

async function chinesePolitenessAPI(text) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    const urlencoded = new URLSearchParams();
    urlencoded.append("sentence", text);
    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',

    };
    const proxyurl = 'https://cors-anywhere-politeness.herokuapp.com/';
    const url = "https://politeness-api.herokuapp.com/ch-politeness";
    let response = await fetch(proxyurl + url, requestOptions)
    let json = await response.json();
    return json
}

function injectHTML(language, politeness) {
    let label = politeness['label']
    let score = politeness['score'];
    let translationBox = $(viewTranslationButtonSelector).first().parent().parent();
    translationBox.css({
        'height': 80,
    })
    const newHTML = "<div id='politeness'><p>" + "The " + language + " text is: " + label + "</p></div>";
    let politenessBox = $('#politeness')
    if (politenessBox.length){
        politenessBox.html(newHTML);
    }else{
        translationBox.append(newHTML);
    }
    console.log(newHTML);

}
