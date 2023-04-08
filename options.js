const api = typeof browser !== 'undefined' ? browser : chrome;

const defaultDropdownOptions = [
    { value: 'tldr', text: 'TLDR', dataField: 'TLDR Summary for this article.', temperature: 0 },
    { value: 'normal', text: 'Normal', dataField: 'Summarize this article.', temperature: 0 },
    { value: 'eli11', text: 'Like am 11 years old.', dataField: 'Explain briefly this article like i am 11 years old.', temperature: 0 },
    { value: 'keywords', text: 'Keywords', dataField: ' Extract keywords from this text.', temperature: 0.5 }
];


const defaultLanguageOptions = [
    { value: 'English', text: 'English' },
    { value: 'French', text: 'French' },
    { value: 'Arabic', text: 'Arabic' }
];


const defaultModel = 'gpt-3.5-turbo';




document.addEventListener('DOMContentLoaded', () => {
    const apiKeyForm = document.getElementById('apiKeyForm');
    const apiKeyInput = document.getElementById('apiKey');
    const dropdownOptionsForm = document.getElementById('dropdownOptionsForm');
    const optionValueInput = document.getElementById('optionValue');
    const optionTextInput = document.getElementById('optionText');
    const optionDataFieldInput = document.getElementById('optionDataField');
    const optionTemperatureInput = document.getElementById('optionTemperature');
    const optionsDropdown = document.getElementById('optionsDropdown');
    
    const gptForm = document.getElementById('gptForm');
    const gptInput = document.getElementById('gptInput');
    
    
    
    // Load saved model from localStorage
    const savedGptModel = localStorage.getItem('GptModel');
    if (savedGptModel) {
        gptInput.value = savedGptModel;
    }else{
        gptInput.value = defaultModel;
        localStorage.setItem('GptModel', defaultModel);
    }
    
    // Save model localStorage on form submit
    gptForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const gptModel = gptInput.value.trim();
        localStorage.setItem('GptModel', gptModel);
        showNotificationMsg('msg-1');
        alert('GPT Model saved successfully');
    });
    
    
    
    
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem('ApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }
    
    // Save API key to localStorage on form submit
    apiKeyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const apiKey = apiKeyInput.value.trim();
        localStorage.setItem('ApiKey', apiKey);
        showNotificationMsg('msg-1');
        alert('API Key saved successfully');
         
    });
    
    console.log("from options page")
    console.log(localStorage.getItem('dropdownOptions'))
    
    // Load and populate dropdown options from localStorage
    var savedDropdownOptions = JSON.parse(localStorage.getItem('dropdownOptions')) || [];
    
    
    if (savedDropdownOptions.length === 0) {
        console.log("resetting defaults")
        localStorage.setItem('dropdownOptions', JSON.stringify(defaultDropdownOptions));
        savedDropdownOptions = defaultDropdownOptions;
    }
    
    populateDropdown(savedDropdownOptions);
    
    
    // Save dropdown option on form submit
    dropdownOptionsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const optionValue = optionValueInput.value.trim();
        const optionText = optionTextInput.value.trim();
        const optionDataField = optionDataFieldInput.value.trim();
        const optionTemperature = parseFloat(optionTemperatureInput.value.trim());
        
        if (!optionValue || !optionText || !optionDataField || isNaN(optionTemperature)) {
            showNotificationMsg('msg-4');
            alert('All fields are required');
            return;
        }
        
        const index = savedDropdownOptions.findIndex(opt => opt.value === optionValue);
        if (index !== -1) {
            savedDropdownOptions[index] = {
            value: optionValue,
            text: optionText,
            dataField: optionDataField,
            temperature: optionTemperature
            };
        } else {
            savedDropdownOptions.push({
            value: optionValue,
            text: optionText,
            dataField: optionDataField,
            temperature: optionTemperature
            });
        }
        
        localStorage.setItem('dropdownOptions', JSON.stringify(savedDropdownOptions));
        populateDropdown(savedDropdownOptions);
        showNotificationMsg('msg-1');
        alert('Option saved successfully');
        optionValueInput.value = '';
        optionTextInput.value = '';
        optionDataFieldInput.value = '';
        optionTemperatureInput.value = '';
    });
    
    
    // Populate the dropdown
    function populateDropdown(dropdownOptions) {
        optionsDropdown.innerHTML = ''; // Clear existing options
        dropdownOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            opt.dataset.field = option.dataField; // Custom data attribute
            opt.dataset.temp = option.temperature; // Custom data attribute
            optionsDropdown.appendChild(opt);
        });
    }
    
    // Load option data into form when selecting an option from the dropdown
    optionsDropdown.addEventListener('change', () => {
        const selectedOption = savedDropdownOptions.find(opt => opt.value === optionsDropdown.value);
        if (selectedOption) {
            optionValueInput.value = selectedOption.value;
            optionTextInput.value = selectedOption.text;
            optionDataFieldInput.value = selectedOption.dataField;
            optionTemperatureInput.value = selectedOption.temperature; // Add this line
        }
    });
    
    
    // Reset the dropdown to default values
    resetDropdown.addEventListener('click', () => {
        localStorage.removeItem('dropdownOptions');
        localStorage.setItem('dropdownOptions', JSON.stringify(defaultDropdownOptions));
        populateDropdown(defaultDropdownOptions);
        showNotificationMsg('msg-2');
        alert('Options reset successfully');
    });
    
    const deleteOptionButton = document.getElementById('deleteOption');
    // Delete option from dropdown
    deleteOptionButton.addEventListener('click', () => {
        const selectedOptionIndex = optionsDropdown.selectedIndex;
        if (selectedOptionIndex !== -1) {
            savedDropdownOptions.splice(selectedOptionIndex, 1);
            localStorage.setItem('dropdownOptions', JSON.stringify(savedDropdownOptions));
            populateDropdown(savedDropdownOptions);
            showNotificationMsg('msg-5');
            alert('Option deleted successfully');
        } else {
            showNotificationMsg('msg-3');
            alert('Please select an option to delete');
        }
    });
    
    
    const languagesDropdown = document.getElementById('languagesDropdown');
    
    // Load and populate language options from localStorage
    let savedLanguageOptions = JSON.parse(localStorage.getItem('languages')) || [];
    
    if (savedLanguageOptions.length === 0) {
        savedLanguageOptions = defaultLanguageOptions;
        localStorage.setItem('languages', JSON.stringify(defaultLanguageOptions));
    }
    
    populateLanguagesDropdown(savedLanguageOptions);
    
    const languageForm = document.getElementById('languageForm');
    const languageValueInput = document.getElementById('languageValue');
    const languageTextInput = document.getElementById('languageText');
    const deleteLanguageButton = document.getElementById('deleteLanguage');
    
    // ...
    
    // Save language to localStorage on form submit
    languageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const languageValue = languageValueInput.value.trim();
        const languageText = languageTextInput.value.trim();
        
        if (!languageValue || !languageText) {
            showNotificationMsg('msg-4');
            alert('All fields are required');
            return;
        }
        
        const index = savedLanguageOptions.findIndex(lang => lang.value === languageValue);
        if (index !== -1) {
            savedLanguageOptions[index] = {value: languageValue, text: languageText};
        } else {
            savedLanguageOptions.push({value: languageValue, text: languageText});
        }
        
        localStorage.setItem('languages', JSON.stringify(savedLanguageOptions));
        populateLanguagesDropdown(savedLanguageOptions);
        showNotificationMsg('msg-1');
        alert('Language saved successfully');
        languageValueInput.value = '';
        languageTextInput.value = '';
    });
    
    function populateLanguagesDropdown(languageOptions) {
        languagesDropdown.innerHTML = ''; // Clear existing options
        languageOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            languagesDropdown.appendChild(opt);
        });
    }
    
    
    // Delete language from dropdown
    deleteLanguageButton.addEventListener('click', () => {
        const selectedLanguageIndex = languagesDropdown.selectedIndex;
        if (selectedLanguageIndex !== -1) {
            savedLanguageOptions.splice(selectedLanguageIndex, 1);
            localStorage.setItem('languages', JSON.stringify(savedLanguageOptions));
            populateLanguagesDropdown(savedLanguageOptions);
            showNotificationMsg('msg-5');
            alert('Language deleted successfully');
        } else {
            showNotificationMsg('msg-3');
            alert('Please select a language to delete');
        }
    });
    
    
    
    // Load language data into form when selecting an option from the dropdown
    languagesDropdown.addEventListener('change', () => {
        const selectedOption = savedLanguageOptions.find(opt => opt.value === languagesDropdown.value);
        if (selectedOption) {
            languageValueInput.value = selectedOption.value;
            languageTextInput.value = selectedOption.text;
        }
    });
    
    
    const resetLanguagesButton = document.getElementById('resetLanguages');
    // Reset the languages dropdown to default values
    resetLanguagesButton.addEventListener('click', () => {
        localStorage.setItem('languages', JSON.stringify(defaultLanguageOptions));
        populateLanguagesDropdown(defaultLanguageOptions);
        alert('Languages reset successfully');
    });
    
    
    function showNotificationMsg(msgId) {
      if (window.Notification && Notification.permission !== "granted") {
        const savedMsg = document.getElementById(msgId);
        savedMsg.classList.add('show-msg');
        setTimeout(function() {
          savedMsg.classList.remove('show-msg');
        }, 500);
      }
    }
});
