

const api = typeof browser !== 'undefined' ? browser : chrome;

 
api.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === 'getContent') {
        console.log('Received message:', request.content);
        try {
            const responseContent = await getTextFromPage();
            sendResponse({ content: responseContent });
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }
    return true; // Keep the message port open until sendResponse is called
});

async function getTextFromPage() {
    return new Promise((resolve) => {
        const article = new Readability(document.cloneNode(true)).parse();
        if (article) {
            resolve(article.textContent );
        }else{
            resolve('');
        }
    });
}


function getLimitedWords(str, wordLimit) {
    const words = str.split(/\s+/);
    const limitedWords = words.slice(0, wordLimit);
    return limitedWords.join(' ');
}


 

 


