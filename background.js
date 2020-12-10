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
    getPoliteness();
});

//
$(document).on('click', viewTranslationButtonSelector, function(){
    getPoliteness();
});


$.fn.log = function() {
    console.log.apply(console, this);
    return this;
};

async function getPoliteness() {
    const originalLanguage = $(languageButtonSelector).first().text();
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
                let politeness = await chinesePolitenessAPI(originalText);
                cache[originalText] = politeness
                // console.log("The Chinese text is:", politeness);
                injectHTML(originalLanguage, politeness);
            }

    }
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
    let score = politeness['score'];
    let sibling = $(viewTranslationButtonSelector).first().parent().parent();
    let background = $('.background');
    let backgroundDiv = "<div class=background style=width:100%;height:55px;background:#F5F5F5;border-radius:8px;overflow:hidden></div>"
    if (!background.length){
        $(backgroundDiv).insertAfter(sibling);
        background = $('.background').first();
    }

    let wrapperDiv = $('.wrapper')
    if (!wrapperDiv.length){
        background.append("<div class=wrapper></div>");
        wrapperDiv = $('.wrapper');
    }

    let scaleurl = chrome.runtime.getURL("img/verypolite.png");
    let label = "very polite";
    let highlightColor = '0DD459';
    if (score <= -0.5){
        scaleurl = chrome.runtime.getURL("img/veryimpolite.png");
        label = "very impolite";
        highlightColor = '#FF893B';
    }else if (score < 0){
        scaleurl = chrome.runtime.getURL("img/impolite.png");
        label = "impolite";
        highlightColor = '#FF893B';
    }else if (score == 0){
        scaleurl = chrome.runtime.getURL("img/neutral.png");
        label = "neutral";
        highlightColor = '#FECA56';
    }else if (score <= 0.5) {
        scaleurl = chrome.runtime.getURL("img/polite.png");
        label = "polite";
        highlightColor = '0DD459';
    }
    let scale = "<span class='scale'><img class='scaleImg' src=" + scaleurl + "></span>"
    let scaleDiv = $('.scale')
    if (scaleDiv.length){
        scaleDiv.html(scale);
    } else{
        wrapperDiv.append(scale);
        scaleDiv = $('.scale');
        scaleDiv.css({
            'vertical-align': 'middle'
        })
        let scaleImg = $('.scaleImg')
        scaleImg.css({
            'max-width':'300px',
            'min-width': '100px',
            'height':'auto'
        })
    }

    const labelhighlight = "<mark style=background-color:" +highlightColor + '>' +label + "</mark>";
    const annotation = "<span class='annotation'>" + "The original message appears to be " + labelhighlight + " in Chinese </span>"
    let annotationSpan = $('.annotation')
    if (annotationSpan.length){
        annotationSpan.html(annotation);
    }else{
        wrapperDiv.append(annotation);
        annotationSpan = $('.annotation')
        annotationSpan.css({
            'vertical-align': 'middle',
            'padding':'20px',
            'font-family': 'Roboto',
            'font-style': 'normal',
            'font-weight': '400',
            'font-size':'14px',
            'line-height': '20px',
            'color': '#444444'
        })
    }

    wrapperDiv.css({
        'padding-left':'8px',
        'padding-top':'15px',
        'vertical-align':'middle'
    })


}
