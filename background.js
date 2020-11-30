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
    // if ($( this ).text() === 'Translate message'){
    //     setTimeout(function(){
    //
    //     }, 500);
    // }
    getPoliteness();
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
    // const translatedLanguage = $(languageButtonSelector).last().text();
    const textBody = $(textBodySelector).first();
    let originalText = ""
    textBody.children().each(function(){
        originalText = originalText + $(this).text();
    })

    let begin = 0
    for (let i = 0; i < originalText.length; i++) {
        if (originalText.charAt(i).match(/[\u3400-\u9FBF]/)){
            begin = i;
            break;
        }
    }
    let end = originalText.length-1;
    for (let i = originalText.length-1; i >= 0; i--){
        if (originalText.charAt(i).match(/[\u3400-\u9FBF]/)){
            end = i;
            break
        }
    }
    originalText = originalText.substring(begin, end+1);

    console.log(originalText);

    // const translatedText = $(textBodySelector).last().text()
    // const viewTranslationButton = $(viewTranslationButtonSelector).first().text();
    const translatedFromChinese = originalLanguage === 'Chinese' ;
    const detectCh = originalText.match(/[\u3400-\u9FBF]/);

    if (translatedFromChinese || detectCh.length) {
            if (cache[originalText]){
                let politeness = cache[originalText]
                // console.log("The Chinese text is:", politeness);
                injectHTML(originalLanguage, politeness);
            }else{
                console.log("Calling API")
                let politeness = await chinesePolitenessAPI(originalText); //polite, neutral, impolite
                cache[originalText] = politeness
                // console.log("The Chinese text is:", politeness);
                injectHTML(originalLanguage, politeness);
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
    // const proxyurl = 'https://cors-anywhere-politeness.herokuapp.com/';
    const url = "https://politeness-api.herokuapp.com/en-politeness";
    let response = await fetch(url, requestOptions)
    let json = await response.json();
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
    // in case CORS proxy is needed, change fetch to proxyurl + url
    // const proxyurl = 'https://cors-anywhere-politeness.herokuapp.com/';
    const url = "https://politeness-api.herokuapp.com/ch-politeness";
    let response = await fetch( url, requestOptions)
    let json = await response.json();
    console.log(json)
    return json
}

function injectHTML(language, politeness) {
    let label = politeness['label']
    let score = politeness['score'];
    let background = $(viewTranslationButtonSelector).first().parent().parent();
    background.css({
        'width': '100%',
        'height': '110px',
        'background': "#F5F5F5",
        'border-radius': '8px'
    })
    console.log(background)
    let translate = $(viewTranslationButtonSelector).first().parent()
    // translate.css({
    //     'position':'absolute',
    //     'left': '7.54%',
    //     'right': 'auto',
    //     'top':  '24.95%',
    //     'bottom': 'auto',
    // })

    console.log(translate)
    let wrapperDiv = $('.wrapper')
    if (!wrapperDiv.length){
        background.append("<div class=wrapper></div>");
        wrapperDiv = $('.wrapper')
    }

    let scaleurl = chrome.runtime.getURL("img/verypolite.png");
    if (score <= -0.5){
        scaleurl = chrome.runtime.getURL("img/veryimpolite.png");
    }else if (score < 0){
        scaleurl = chrome.runtime.getURL("img/impolite.png");
    }else if (score == 0){
        scaleurl = chrome.runtime.getURL("img/neutral.png");
    }else if (score <= 0.5) {
        scaleurl = chrome.runtime.getURL("img/polite.png");
    }

    const scale = "<span class='scale'><img src=" + scaleurl + " width='367px' height='31px'></span>"
    let scaleSpan = $('.scale')
    if (scaleSpan.length){
        scaleSpan.html(scale)
    }else{
        wrapperDiv.append(scale);
        scaleSpan = $('.scale');
        scaleSpan.css({
            // 'position':'absolute',
            // 'left':' 7.54%',
            // 'right': 'auto',
            // 'top': '45.00%',
            'display': 'block'
        })
    }

    const annotation = "<span class='annotation'>" + "The original message appears to be " + label + " in Chinese </span>"
    let annotationSpan = $('.annotation')
    if (annotationSpan.length){
        annotationSpan.html(annotation);
    }else{
        wrapperDiv.append(annotation);
        annotationSpan = $('.annotation')
        annotationSpan.css({
            // 'position':'absolute',
            // 'left': 'auto',
            // 'right': '20%',
            // 'top': '47%',
            // 'bottom': 'auto',
            'font-family': 'Roboto',
            'font-style': 'normal',
            'font-weight': '400',
            'font-size':'16px',
            'line-height': '23px',
            'color': '#444444'
        })
    }
}
