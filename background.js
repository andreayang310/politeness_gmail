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
    const textBody = $(textBodySelector).first();
    let originalText = ""
    textBody.children().each(function(){
        originalText = originalText + $(this).text();
    })
    console.log(originalText);

    const translatedText = $(textBodySelector).last().text()
    const viewTranslationButton = $(viewTranslationButtonSelector).first().text();

    if (originalLanguage === 'Chinese' && translatedLanguage === 'English') {
        // if (viewTranslationButton == "View translated message") {
        //     // console.log("Getting Chinese Politeness")
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
        // } else {
        //     // console.log("Getting English Politeness")
        //     if (cache[translatedText]){
        //         let politeness = cache[translatedText]
        //         // console.log("The English text is:", politeness);
        //         injectHTML(translatedLanguage, politeness);
        //     }else{
        //         let politeness = await englishPolitenessAPI(translatedText); //polite, neutral, impolite
        //         // console.log("The English text is:", politeness);
        //         cache[translatedText] = politeness
        //         injectHTML(translatedLanguage, politeness);
        //     }
        // }
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
        "<text style='position: absolute; left: 16.43%; right: 80.94%; top: 31.84%; bottom: 66.63%; " +
        "font-family: Roboto; font-style: normal; font-weight: bold; font-size: 12px; line-height: 14px;" +
        "color: #444444; opacity: 0.3;'>NEUTRAL</text>"+
        "<text style='position: absolute; left: 9.83%; right: 87.44%; top: 31.84%; bottom: 66.63%; " +
        "font-family: Roboto; font-style: normal; font-weight: bold; font-size: 12px; line-height: 14px;" +
        "color: #444444; opacity: 0.3;'>IMPOLITE</text>" +
        "<text style='position: absolute; left: 23.68%; right: 74.28%; top: 31.84%; bottom: 66.63%; " +
        "font-family: Roboto; font-style: normal; font-weight: bold; font-size: 12px; line-height: 14px;" +
        "color: #444444; opacity: 0.3;'>POLITE</text>"+
        "<svg style='position: absolute; left: 7.54%; right: 90.97%; top: 31.95%;bottom: 64.77%;'" +
        "width=\"30\" height=\"30\" viewBox=\"0 0 30 30\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">" +
        "<path d=\"M14.9875 2.5C8.0875 2.5 2.5 8.1 2.5 15C2.5 21.9 8.0875 27.5 14.9875 27.5C21.9 27.5 27.5 21.9 27.5 15C27.5 8.1 21.9 2.5 14.9875 2.5ZM23.65 10H19.9625C19.5625 8.4375 18.9875 6.9375 18.2375 5.55C20.5375 6.3375 22.45 7.9375 23.65 10ZM15 5.05C16.0375 6.55 16.85 8.2125 17.3875 10H12.6125C13.15 8.2125 13.9625 6.55 15 5.05ZM5.325 17.5C5.125 16.7 5 15.8625 5 15C5 14.1375 5.125 13.3 5.325 12.5H9.55C9.45 13.325 9.375 14.15 9.375 15C9.375 15.85 9.45 16.675 9.55 17.5H5.325ZM6.35 20H10.0375C10.4375 21.5625 11.0125 23.0625 11.7625 24.45C9.4625 23.6625 7.55 22.075 6.35 20ZM10.0375 10H6.35C7.55 7.925 9.4625 6.3375 11.7625 5.55C11.0125 6.9375 10.4375 8.4375 10.0375 10ZM15 24.95C13.9625 23.45 13.15 21.7875 12.6125 20H17.3875C16.85 21.7875 16.0375 23.45 15 24.95ZM17.925 17.5H12.075C11.9625 16.675 11.875 15.85 11.875 15C11.875 14.15 11.9625 13.3125 12.075 12.5H17.925C18.0375 13.3125 18.125 14.15 18.125 15C18.125 15.85 18.0375 16.675 17.925 17.5ZM18.2375 24.45C18.9875 23.0625 19.5625 21.5625 19.9625 20H23.65C22.45 22.0625 20.5375 23.6625 18.2375 24.45ZM20.45 17.5C20.55 16.675 20.625 15.85 20.625 15C20.625 14.15 20.55 13.325 20.45 12.5H24.675C24.875 13.3 25 14.1375 25 15C25 15.8625 24.875 16.7 24.675 17.5H20.45Z\" fill=\"#767676\"/>\n" +
        "</svg>"+
        "<rect width= '321px' height='8px' style='position: absolute; left: 9.83%; right: 74.24%; top: 33.81%; bottom: 65.32%;" +
        "background: linear-gradient(270deg, #00A743 1.46%, #FECA56 40.17%, #FECA56 56.73%, #FB7B26 100%);'/>"+
        "</div>"

    let scaleDiv = $('.scale')
    if (scaleDiv.length){
        scaleDiv.html(scale)
    }else{
        background.append(scale);
    }


    const annotation = "<span class='annotation'>" + "The original message appears to be " + label + " in " + language + "</span>"
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
