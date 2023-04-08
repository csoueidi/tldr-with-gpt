const api = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');

    populateHistory();

    searchInput.addEventListener('input', () => {
        populateHistory(searchInput.value);
    });

    function populateHistory(searchQuery = '') {
        const historyContainer = document.getElementById('historyContainer');
        historyContainer.innerHTML = '';

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (isUrl(key)) {
                const data = JSON.parse(localStorage.getItem(key));

                if (searchQuery === '' || key.includes(searchQuery) || data.content.includes(searchQuery)) {
                    const newRow = document.createElement('div');
                    newRow.classList.add('history-row');

                    newRow.innerHTML = `
                        <div class="url-col" title="URL: ${key}"><a href="${key}" target="_blank">${key}</a></div>
                        <div class="option-col" title="Option: ${data.option}">${data.option}</div>
                        <div class="language-col" title="Language: ${data.language}">${data.language}</div>
                        <div class="content-col" title="Content: ${data.content}">${data.content}</div>
                        <div class="action-col">
                            <button class="button is-danger is-small" data-url="${key}" title="Delete">Delete</button>
                        </div>
                    `;
                    historyContainer.appendChild(newRow);
                }
            }
        }

        const deleteButtons = document.querySelectorAll('button[data-url]');
        for (const button of deleteButtons) {
            button.addEventListener('click', (event) => {
                const url = event.target.getAttribute('data-url');
                localStorage.removeItem(url);
                populateHistory(searchInput.value);
            });
        }
    }

    function isUrl(str) {
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    }
});
