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
    let background = $(viewTranslationButtonSelector).first().parent().parent();
    background.css({
        'width': '100%',
        'height': '127px',
        'background': "#F5F5F5",
        'border-radius': '8px'
    })

    let translate = $(viewTranslationButtonSelector).first().parent()
    translate.css({
        'position':'absolute',
        'left': '7.54%',
        'right': '67.79%',
        'top': '24.95%',
        'bottom': '71.55%'
    })

    const scale = "<div class='scale'>" +
        "<span class='neutral'>NEUTRAL</span>" +
        "<span class='impolite'>IMPOLITE</span>" +
        "<span class='polite'>POLITE</span>" +
        "<div class='rainbow'></div>"+
        "</div>"
    let scaleDiv = $('.scale')
    if (scaleDiv.length){
        scaleDiv.html(scale)
    }else{
        background.append(scale);
        let neutral = $('.neutral')
        neutral.css({
            'position':'absolute',
            'left': '16.43%',
            'right': '80.94%',
            'top': '31.84%',
            'bottom': '66.63%',
            'font-family': 'Roboto',
            'font-style': 'normal',
            'font-weight': 'bold',
            'font-size': '12px',
            'line-height': '14px',
            /* identical to box height */
            'color': '#444444',
            'opacity': '0.3'
        })
        let impolite = $('.impolite')
        impolite.css({
            'position':'absolute',
            'left':  '9.83%',
            'right': '87.44%',
            'top': '31.84%',
            'bottom': '66.63%',
            'font-family': 'Roboto',
            'font-style': 'normal',
            'font-weight': 'bold',
            'font-size': '12px',
            'line-height': '14px',
            /* identical to box height */
            'color': '#444444',
            'opacity': '0.3'
        })
        let polite = $('.polite')
        polite.css({
            'position':'absolute',
            'left':  '23.68%',
            'right': '74.28%',
            'top': '31.84%',
            'bottom': '66.63%',
            'font-family': 'Roboto',
            'font-style': 'normal',
            'font-weight': 'bold',
            'font-size': '12px',
            'line-height': '14px',
            /* identical to box height */
            'color': '#444444',
            'opacity': '0.3'
        })

    }

    const annotation = "<span class='annotation'>" + "The message appears to be " + label + " in " + language + "</span>"
    let annotationSpan = $('.annotation')
    if (annotationSpan.length){
        annotationSpan.html(annotation);
    }else{
        background.append(annotation);
        annotationSpan = $('.politeness')
        annotationSpan.css({
            'position':'absolute',
            'left':' 27.25%',
            'right': '22.88%',
            'top': '35.17%',
            'bottom': '62.47%',
            'font-family': 'Roboto',
            'font-style': 'normal',
            'font-weight': '500',
            'font-size':'20px',
            'line-height': '23px',
            'color': '#444444'
        })
    }



}
