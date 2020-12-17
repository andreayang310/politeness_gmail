
// set variables for relevant button selectors
const menuTranslateSelector = '.cj';
const viewTranslationButtonSelector = '.B9.J-J5-Ji';
const textBodySelector = '.a3s.aiL';
const languageButtonSelector = '.J-J5-Ji.J-JN-M-I-Jm';

// cache for storing already computed message politeness
let cache = {}

/** register click event for menu translate button **/
$(document).on('click', menuTranslateSelector, function() {
    getPoliteness();
});

/** register click event for the translation bar button **/
$(document).on('click', viewTranslationButtonSelector, function(){
    getPoliteness();
});

/** JQuery logging function **/
$.fn.log = function() {
    console.log.apply(console, this);
    return this;
};

/** Get the original text using selectors
 * Call chinesePolitenessAPI() on the original text if it is in Chinese
 * With the API results, call injectHTML() to display the politeness on the page
 * **/
async function getPoliteness() {
    const originalLanguage = $(languageButtonSelector).first().text();
    const textBody = $(textBodySelector).first();

    // concatenate text to handle embedded messages
    let originalText = ""
    textBody.children().each(function(){
        originalText = originalText + $(this).text();
    })

    // detect beginning and end of Chinese text to strip extraneous English text
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

    // Check translation button if original language is Chinese.
    // If button still says "detect language", try to match regex to the text
    const translatedFromChinese = originalLanguage === 'Chinese' ;
    const detectCh = originalText.match(/[\u3400-\u9FBF]/);

    if (translatedFromChinese || detectCh.length) {
            // if already in cache, no need to call again
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

/** Function for handling calling the Chinese Politeness api on text input
 * Returns: json in the format of {'label': label, 'score': score}
 * where label is the politeneess label of the text (rude/neutral/polite), score is the actual score value
 * **/
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

/** Modifying the page HTML and CSS to display the politeness scores and message**/
function injectHTML(language, politeness) {
    // add grey background box
    let sibling = $(viewTranslationButtonSelector).first().parent().parent();
    let background = $('.background');
    let backgroundDiv = "<div class=background style=width:100%;height:114px;background:#F5F5F5;border-radius:8px;overflow:hidden></div>"
    if (!background.length){
        $(backgroundDiv).insertAfter(sibling);
        background = $('.background').first();
    }

    // add wrapper div for scale, if there isn't already one
    let wrapperDiv = $('.wrapper')
    if (!wrapperDiv.length){
        background.append("<div class=wrapper></div>");
        wrapperDiv = $('.wrapper');
    }

    let headerText = "<span class='headertext'>Politeness estimator for emails translated from Chinese</span>";
    let helpIcon = chrome.runtime.getURL("img/icon.png");
    let translateIcon = chrome.runtime.getURL("img/translate.png");
    let headerDiv = "<div class='translateHeader'>" +
        "<img class='translateIcon' src=" + translateIcon + ">" +
        headerText +
        "<img class='helpIcon' src=" + helpIcon + ">" +
        "</div>";

    // Set the header for the translation bar
    let translateHeader = $('.translateHeader')
    if (translateHeader.length){
        translateHeader.html(headerDiv);
    } else{
        wrapperDiv.append(headerDiv);
        let translateIcon = $('.translateIcon')
        translateIcon.css({
            'padding-left': '5px',
            'padding-right':'5px',
            'vertical-align': 'top',
        })
        let helpIcon = $('.helpIcon')
        helpIcon.css({
            'padding-left': '5px',
            'padding-right':'5px',
            'vertical-align': 'top',
        })
        let headerText = $('.headertext')
        headerText.css({
            'vertical-align': 'middle',
            'font-family': 'Roboto',
            'font-style': 'normal',
            'font-weight': '500',
            'font-size':'15px',
            'line-height': '20px',
            'color': '#767676',
            'padding-left': '5px',
            'padding-right': '5px',
            'vertical-align': 'top'
        })
    }


    // choose the correct scale image and highlight color to display based on score value
    let score = politeness['score'];
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

    // Set the display of scale image
    let scale = "<span class='scale'><img class='scaleImg' src=" + scaleurl + "></span>"
    let scaleDiv = $('.scale')
    if (scaleDiv.length){
        scaleDiv.html(scale);
    } else{
        wrapperDiv.append(scale);
        scaleDiv = $('.scale');
        scaleDiv.css({
            'vertical-align': 'baseline'
        })
        let scaleImg = $('.scaleImg')
        scaleImg.css({
            'max-width':'300px',
            'min-width': '100px',
            'height':'auto',
            'padding-left': '40px',
            'padding-top': '20px'
        })
    }

    // setting text message displayed next to the politeness scale
    const labelhighlight = "<mark style=background-color:" +highlightColor + '>' + '<b>' + label + "</b></mark>";
    const annotation = "<span class='annotation'>" + "The original message appears to be " + labelhighlight + " in Chinese. </span>"
    let annotationSpan = $('.annotation')
    if (annotationSpan.length){
        annotationSpan.html(annotation);
    }else{
        wrapperDiv.append(annotation);
        annotationSpan = $('.annotation')
        annotationSpan.css({
            'padding':'15px',
            'font-family': 'Roboto',
            'font-style': 'normal',
            'font-weight': '400',
            'font-size':'15px',
            'line-height': '20px',
            'color': '#444444',
            'word-wrap':'break-word',
        })
    }

    // change padding and alignment of the wrapper div
    wrapperDiv.css({
        'padding-left':'8px',
        'padding-top':'15px',
    })


}
