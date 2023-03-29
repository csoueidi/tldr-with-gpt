
const api = typeof browser !== 'undefined' ? browser : chrome;


function setSummaryText(text){
    let summaryDiv = document.getElementById("summary");
    
    summaryDiv.innerHTML = text;
    
    api.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
        const select1 = document.getElementById('language');
        const select2 = document.getElementById('option');
        
        const language = select1.options[select1.selectedIndex].value;
        const option = select2.options[select2.selectedIndex].value;
        
        const url = tabs[0].url;
        localStorage.setItem(url, JSON.stringify({ option: option, language: language, content:text}))
        console.log("Stored result in local storage also");
        
        
    })
    .catch(error => console.error(error));
    
    
    localStorage.setItem('lastItem', text)
    
    const extractTextButton = document.getElementById('extractText');
    extractTextButton.classList.remove('spinning');
    extractTextButton.disabled = false;
}




function updateDropdownOptions() {
    
    // Load and populate dropdown options from localStorage
    const savedDropdownOptions = JSON.parse(localStorage.getItem('dropdownOptions')) || [];
    populateDropdown(savedDropdownOptions);
    
    
    
    // Load and populate dropdown options from localStorage
    const savedLangageOptions = JSON.parse(localStorage.getItem('languages')) || [];
    populateLanguageDropdown(savedLangageOptions);
    
    
    
    const optionsWrapper = document.getElementById('optionsWrapper');
    const messageWrapper = document.getElementById('messageWrapper');
    
    const savedApiKey = localStorage.getItem('ApiKey');
    if (savedApiKey) {
        optionsWrapper.style.display = 'block';
        messageWrapper.style.display = 'none';
    }else{
        optionsWrapper.style.display = 'none';
        messageWrapper.style.display = 'block';
    }
    
}

// Populate the dropdown
function populateLanguageDropdown(langOptions) {
    const languageDropdown = document.getElementById('language');
    languageDropdown.innerHTML = ''; // Clear existing options
    langOptions.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        languageDropdown.appendChild(opt);
    });
}

// Populate the dropdown
function populateDropdown(dropdownOptions) {
    const optionsDropdown = document.getElementById('option');
    optionsDropdown.innerHTML = ''; // Clear existing options
    dropdownOptions.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        optionsDropdown.appendChild(opt);
    });
}


function isEmpty(str) {
    return (!str || str.trim().length === 0);
}

document.addEventListener('DOMContentLoaded', () => {
    
    var count =  localStorage.getItem('count');
    if(count){
        localStorage.setItem('count', count + 1);
    }else{
        localStorage.setItem('count', 1);
    }
    
    updateDropdownOptions();
    
    
    let summaryDiv = document.getElementById("summary");
    
    // Check if summaryDiv is empty
    if (isEmpty(summaryDiv.innerHTML)) {
        
        api.tabs.query({ active: true, currentWindow: true })
        .then(tabs => {
            const url = tabs[0].url;
            
            const last =   JSON.parse(localStorage.getItem(url))
            if (last && Object.keys(last).length > 0) {
                const select1 = document.getElementById('language');
                const select2 = document.getElementById('option');
                
                select1.value = last.language;
                select2.value = last.option
                summaryDiv.innerHTML =  last.content
                
            }
        })
        .catch(error => console.error(error));
        
    }
    
    
    const openSettingsButton = document.getElementById('openSettings');
    
    openSettingsButton.addEventListener('click', () => {
        api.runtime.openOptionsPage();
    });
    
});



document.getElementById('extractText').addEventListener('click', async () => {
    
    const extractTextButton = document.getElementById('extractText');
    extractTextButton.classList.toggle('spinning');
    
    // Toggle the disabled state
    extractTextButton.disabled = !extractTextButton.disabled;
    
    
    const [currentTab] = await api.tabs.query({ active: true, currentWindow: true });
    console.log(currentTab)
    
    var tabId = currentTab.id;
    
    const select1 = document.getElementById('language');
    const select2 = document.getElementById('option');
    
    const language = select1.options[select1.selectedIndex].value;
    var option = select2.options[select2.selectedIndex].value;
    
    
    
    // Load dropdown options from localStorage
    const savedDropdownOptions = JSON.parse(localStorage.getItem('dropdownOptions')) || [];
    
    // Find the option with the selected value
    const selectedOption = savedDropdownOptions.find(op => op.value ===  option);
    
    var temperature;
    
    // Extract the dataField if the selected option is found
    if (selectedOption) {
        option = selectedOption.dataField;
        temperature = selectedOption.temperature;
        
        
    } else {
        console.log('Option not found');
    }
    
    var key = localStorage.getItem('ApiKey');
    var model= localStorage.getItem('GptModel');
    
    
    const message = { type: 'getContext', content: '' };
    
    const queryOptions = { active: true, currentWindow: true };
    api.tabs.query(queryOptions, (tabs) => {
        if (tabs.length > 0) {
            const activeTabId = tabs[0].id;
            const message = { type: 'getContent', content: 'Hello from the extension!' };
            sendMessageWithResponse(activeTabId, message)
            .then((response) => {
                
                if(response.content === ''){
                    setSummaryText('Page is unreadable! Sorry')
                }else{
                    
                    const pageContent = response.content;
                    
                    let endpoint, requestBody, recent;
                    
                    switch (model) {
                        case "gpt-4":
                        case "gpt-4-0314":
                        case "gpt-4-32k":
                        case "gpt-4-32k-0314":
                        case "gpt-3.5-turbo":
                        case "gpt-3.5-turbo-0301":
                            endpoint = "https://api.openai.com/v1/chat/completions";
                            requestBody = {
                                "model": model,
                                "messages": [{"role": "user", "content": " " + option + language + getLimitedWords(pageContent, 950)}],
                                "temperature": temperature,
                                
                            };
                            recent = true;
                            break;
                        case "text-davinci-003":
                        case "text-davinci-002":
                        case "text-curie-001":
                        case "text-babbage-001":
                        case "text-ada-001":
                        case "davinci":
                        case "curie":
                        case "babbage":
                        case "ada":
                            endpoint = "https://api.openai.com/v1/completions";
                            requestBody = {
                                "model": model,
                                "prompt": option + language + getLimitedWords(pageContent, 900),
                                "temperature": temperature,
                                "n" : 1 ,
                                "stop": "\n"
                            };
                            
                            recent = false;
                            break;
                        default:
                            console.error("Unsupported model name:", model);
                            return;
                    }
                    
                    fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + key
                    },
                    body: JSON.stringify(requestBody)
                    })
                    .then(response => response.json())
                    .then(data => {
                        
                        
                        var response = recent ? data.choices[0].message.content : data.choices[0].text
                        setSummaryText(response.trim() === "" ? "No results!" : response)
                        
                        
                        
                        
                    })
                    .catch(error => {
                        
                        setSummaryText("Some error occured. Check console")
                        console.error(error)
                    });
                    
                }
                
                
            })
            .catch((error) => {
                setSummaryText('Error in getting text from page!')
                console.error('Error sending message:', error);
            });
        }
    });

    
});

function sendMessageWithResponse(tabId, message) {
    return new Promise((resolve, reject) => {
        api.tabs.sendMessage(tabId, message, (response) => {
            if (api.runtime.lastError) {
                reject(api.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}


function getLimitedWords(str, wordLimit) {
    const words = str.split(/\s+/);
    const limitedWords = words.slice(0, wordLimit);
    return limitedWords.join(' ');
}
