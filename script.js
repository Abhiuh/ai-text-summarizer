// Enhanced SumaRise script with careful functionality improvements
document.addEventListener('DOMContentLoaded', function() {
    console.log('SumaRise script loaded');
    
    // DOM elements
    const inputText = document.getElementById('input-text');
    const summarizeBtn = document.getElementById('summarize-btn');
    const result = document.getElementById('result');
    const summaryText = document.getElementById('summary-text');
    const themeToggle = document.getElementById('theme-toggle');
    const fileInput = document.getElementById('file-input');
    const summaryLength = document.getElementById('summary-length');
    const summaryMode = document.getElementById('summary-mode');
    const languageSelect = document.getElementById('language');
    const toggleAdvanced = document.getElementById('toggle-advanced');
    const advancedOptions = document.getElementById('advanced-options');
    const keyTakeaways = document.getElementById('key-takeaways');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const newSummaryBtn = document.getElementById('new-summary-btn');
    const inputWordCount = document.getElementById('input-word-count');
    const summaryWordCount = document.getElementById('summary-word-count');
    const shareBtn = document.getElementById('share-btn');
    const shareOptions = document.getElementById('share-options');
    const emailShare = document.getElementById('email-share');
    const twitterShare = document.getElementById('twitter-share');
    const linkedinShare = document.getElementById('linkedin-share');
    const facebookShare = document.getElementById('facebook-share');
    
    // Get button text and loader elements
    const btnText = summarizeBtn ? summarizeBtn.querySelector('.btn-text') : null;
    const loader = summarizeBtn ? summarizeBtn.querySelector('.loader') : null;

    // Theme toggle functionality
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeToggle) {
            themeToggle.innerHTML = `<i class="lucide lucide-${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
        }
        localStorage.setItem('theme', theme);
        console.log('Theme set to:', theme);
    }

    // Initialize theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
    setTheme(savedTheme);

    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
            showNotification(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`);
        });
    }

    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Toggle advanced settings
    if (toggleAdvanced && advancedOptions) {
        toggleAdvanced.addEventListener('click', function() {
            advancedOptions.classList.toggle('hidden');
            
            // Change icon based on state
            const icon = toggleAdvanced.querySelector('i');
            if (icon) {
                if (advancedOptions.classList.contains('hidden')) {
                    icon.className = 'lucide lucide-settings';
                } else {
                    icon.className = 'lucide lucide-settings-2';
                }
            }
        });
    }
    
    // Toggle history
    const toggleHistory = document.getElementById('toggle-history');
    const historyContainer = document.getElementById('history-container');
    const historyList = document.getElementById('history-list');
    
    if (toggleHistory && historyContainer) {
        toggleHistory.addEventListener('click', function() {
            historyContainer.classList.toggle('hidden');
            
            // Change icon based on state
            const icon = toggleHistory.querySelector('i');
            if (icon) {
                if (historyContainer.classList.contains('hidden')) {
                    icon.className = 'lucide lucide-history';
                } else {
                    icon.className = 'lucide lucide-x';
                    // Load history when opened
                    loadHistory();
                }
            }
        });
    }
    
    // Load history from localStorage
    function loadHistory() {
        if (!historyList) return;
        
        try {
            const history = JSON.parse(localStorage.getItem('summaryHistory') || '[]');
            
            if (history.length === 0) {
                historyList.innerHTML = '<div class="empty-history">No previous summaries found</div>';
                return;
            }
            
            // Clear previous content
            historyList.innerHTML = '';
            
            // Add history items
            history.forEach((item, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.dataset.index = index;
                
                // Format date
                const date = new Date(item.timestamp);
                const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // Create title based on mode and length
                let title = '';
                switch(item.length) {
                    case 'short': title = 'Short'; break;
                    case 'medium': title = 'Medium'; break;
                    case 'detailed': title = 'Detailed'; break;
                    default: title = '';
                }
                
                switch(item.mode) {
                    case 'eli5': title += ' ELI5'; break;
                    case 'factual': title += ' Factual'; break;
                    case 'key-points': title += ' Key Points'; break;
                }
                
                title += ' Summary';
                
                // Get preview of original text
                const previewText = item.originalText.substring(0, 100) + (item.originalText.length > 100 ? '...' : '');
                
                historyItem.innerHTML = `
                    <div class="history-item-header">
                        <span class="history-item-title">${title}</span>
                        <span class="history-item-date">${formattedDate}</span>
                    </div>
                    <div class="history-item-preview">${previewText}</div>
                `;
                
                // Add click event to load this summary
                historyItem.addEventListener('click', function() {
                    loadSummaryFromHistory(item);
                });
                
                historyList.appendChild(historyItem);
            });
        } catch (error) {
            console.error('Error loading history:', error);
            historyList.innerHTML = '<div class="empty-history">Error loading history</div>';
        }
    }
    
    // Load a summary from history
    function loadSummaryFromHistory(historyItem) {
        if (!inputText || !summaryText || !result) return;
        
        // Set the input text
        inputText.value = historyItem.originalText;
        updateWordCounts();
        
        // Set the summary text
        summaryText.textContent = historyItem.summary;
        
        // Update summary type
        const summaryType = document.getElementById('summary-type');
        if (summaryType) {
            let title = '';
            switch(historyItem.length) {
                case 'short': title = 'Short'; break;
                case 'medium': title = 'Medium'; break;
                case 'detailed': title = 'Detailed'; break;
                default: title = '';
            }
            
            switch(historyItem.mode) {
                case 'eli5': title += ' ELI5'; break;
                case 'factual': title += ' Factual'; break;
                case 'key-points': title += ' Key Points'; break;
            }
            
            summaryType.textContent = title + ' Summary';
        }
        
        // Update summary word count
        if (summaryWordCount) {
            const count = countWords(historyItem.summary);
            summaryWordCount.textContent = 'Words: ' + count;
        }
        
        // Calculate and display analytics
        updateAnalytics(historyItem.originalText, historyItem.summary);
        
        // Show the result
        result.classList.remove('hidden');
        
        // Close history panel
        if (historyContainer) {
            historyContainer.classList.add('hidden');
            
            // Update icon
            const icon = toggleHistory.querySelector('i');
            if (icon) {
                icon.className = 'lucide lucide-history';
            }
        }
        
        showNotification('Loaded summary from history');
    }

    // Word count function
    function countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    // Update word counts
    function updateWordCounts() {
        if (inputText && inputWordCount) {
            const inputWords = countWords(inputText.value);
            inputWordCount.textContent = `Words: ${inputWords}`;
        }
    }

    // Show notification
    function showNotification(message, isError = false) {
        // Check if notification container exists, if not create it
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification ' + (isError ? 'error' : 'success');
        notification.textContent = message;
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Auto remove after delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        console.log(isError ? 'Error: ' : 'Notification: ', message);
    }

    // Input text change handler
    if (inputText) {
        inputText.addEventListener('input', function() {
            updateWordCounts();
            
            // Auto-detect language if set to auto
            if (languageSelect && languageSelect.value === 'auto' && inputText.value.trim().length > 50) {
                detectLanguage(inputText.value.trim());
            }
        });
        
        // Initial word count update
        updateWordCounts();
    }
    
    // Detect language using franc library
    function detectLanguage(text) {
        if (!window.franc || !window.langs) {
            console.error('Language detection libraries not loaded');
            return;
        }
        
        try {
            // Get the detected language code (ISO 639-3)
            const detectedLang3 = window.franc(text, {minLength: 50});
            
            if (detectedLang3 === 'und') {
                console.log('Language could not be reliably detected');
                return;
            }
            
            // Convert ISO 639-3 to ISO 639-1
            const langMapping = {
                'eng': 'en', 'spa': 'es', 'fra': 'fr', 'deu': 'de',
                'ita': 'it', 'por': 'pt', 'zho': 'zh', 'jpn': 'ja',
                'kor': 'ko', 'rus': 'ru', 'ara': 'ar', 'hin': 'hi'
            };
            
            const detectedLang1 = langMapping[detectedLang3] || 'en';
            
            // Check if the detected language is in our dropdown
            const options = Array.from(languageSelect.options).map(opt => opt.value);
            if (options.includes(detectedLang1)) {
                // Update the language dropdown
                languageSelect.value = detectedLang1;
                
                // Get language name for notification
                const langName = window.langs.getName(detectedLang1, 'en') || detectedLang1.toUpperCase();
                showNotification(`Detected language: ${langName}`);
                console.log('Detected language:', langName, `(${detectedLang1})`);
            }
        } catch (error) {
            console.error('Error detecting language:', error);
        }
    }

    // File upload handler
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Show loading notification
            showNotification('Reading file...');
            
            if (file.type === 'text/plain') {
                // Handle text files
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (inputText) {
                        inputText.value = e.target.result;
                        updateWordCounts();
                    }
                    showNotification('Text file uploaded successfully');
                };
                reader.onerror = function() {
                    showNotification('Error reading file', true);
                };
                reader.readAsText(file);
            } else if (file.type === 'application/pdf') {
                // Handle PDF files
                const reader = new FileReader();
                reader.onload = function(e) {
                    const typedArray = new Uint8Array(e.target.result);
                    
                    // Initialize PDF.js
                    const loadingTask = pdfjsLib.getDocument(typedArray);
                    loadingTask.promise.then(function(pdf) {
                        console.log('PDF loaded');
                        
                        // Get all pages text
                        let textContent = '';
                        const numPages = pdf.numPages;
                        let pagesProcessed = 0;
                        
                        // Show progress notification
                        showNotification(`Processing PDF (0/${numPages} pages)...`);
                        
                        // Function to extract text from each page
                        function getPageText(pageNum) {
                            return pdf.getPage(pageNum).then(function(page) {
                                return page.getTextContent().then(function(content) {
                                    // Extract text items and join them
                                    const strings = content.items.map(item => item.str);
                                    const pageText = strings.join(' ');
                                    return pageText;
                                });
                            });
                        }
                        
                        // Process pages sequentially
                        let promise = Promise.resolve();
                        for (let i = 1; i <= numPages; i++) {
                            promise = promise.then(function() {
                                return getPageText(i).then(function(pageText) {
                                    textContent += pageText + '\n\n';
                                    pagesProcessed++;
                                    
                                    // Update progress notification for every 5 pages
                                    if (pagesProcessed % 5 === 0 || pagesProcessed === numPages) {
                                        showNotification(`Processing PDF (${pagesProcessed}/${numPages} pages)...`);
                                    }
                                    
                                    // If all pages are processed, update the input text
                                    if (pagesProcessed === numPages) {
                                        if (inputText) {
                                            inputText.value = textContent.trim();
                                            updateWordCounts();
                                        }
                                        showNotification('PDF processed successfully');
                                    }
                                });
                            });
                        }
                    }).catch(function(error) {
                        console.error('Error loading PDF:', error);
                        showNotification('Error processing PDF', true);
                    });
                };
                reader.onerror = function() {
                    showNotification('Error reading file', true);
                };
                reader.readAsArrayBuffer(file);
            } else {
                showNotification('Unsupported file type. Please upload a .txt or .pdf file.', true);
            }
        });
    }

    // Copy to clipboard
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            if (!summaryText || !summaryText.textContent) return;
            
            try {
                // Create a temporary textarea element
                const textarea = document.createElement('textarea');
                textarea.value = summaryText.textContent;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showNotification('Summary copied to clipboard');
            } catch (error) {
                console.error('Copy error:', error);
                showNotification('Failed to copy text', true);
            }
        });
    }

    // Download summary
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            if (!summaryText || !summaryText.textContent) return;
            
            try {
                const blob = new Blob([summaryText.textContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'summary.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification('Summary downloaded');
            } catch (error) {
                console.error('Download error:', error);
                showNotification('Failed to download summary', true);
            }
        });
    }

    // New summary button
    if (newSummaryBtn) {
        newSummaryBtn.addEventListener('click', function() {
            // Hide the result section
            if (result) {
                result.classList.add('hidden');
            }
            
            // Focus on the input text area
            if (inputText) {
                inputText.focus();
            }
        });
    }

    // Extract key takeaways from text
    function extractKeyTakeaways(text) {
        // Simple algorithm to extract key sentences
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        
        // Sort by length (assuming longer sentences might have more information)
        // and take up to 5 key points
        return sentences
            .sort((a, b) => b.length - a.length)
            .slice(0, 5)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    // Handle summarize button click
    if (summarizeBtn) {
        summarizeBtn.addEventListener('click', function() {
            console.log('Summarize button clicked');
            
            // Basic validation
            if (!inputText || !inputText.value.trim()) {
                showNotification('Please enter some text to summarize', true);
                return;
            }
            
            // Show loading state
            if (btnText) btnText.textContent = 'Summarizing...';
            if (loader) loader.classList.remove('hidden');
            summarizeBtn.disabled = true;
            
            // Make API request
            fetch('/api/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: inputText.value.trim(),
                    length: summaryLength ? summaryLength.value : 'medium',
                    mode: summaryMode ? summaryMode.value : 'standard',
                    language: languageSelect ? languageSelect.value : 'en'
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Parsed response:', data);
                
                if (data.summary) {
                    // Update summary type display
                    const summaryType = document.getElementById('summary-type');
                    if (summaryType && summaryLength) {
                        let summaryTypeText = '';
                        
                        switch(summaryLength.value) {
                            case 'short':
                                summaryTypeText = 'Concise';
                                break;
                            case 'medium':
                                summaryTypeText = 'Balanced';
                                break;
                            case 'detailed':
                                summaryTypeText = 'Detailed';
                                break;
                            default:
                                summaryTypeText = '';
                        }
                        
                        if (summaryMode && summaryMode.value !== 'standard') {
                            switch(summaryMode.value) {
                                case 'eli5':
                                    summaryTypeText += ' ELI5';
                                    break;
                                case 'factual':
                                    summaryTypeText += ' Factual';
                                    break;
                                case 'key-points':
                                    summaryTypeText += ' Key Points';
                                    break;
                            }
                        }
                        
                        summaryType.textContent = summaryTypeText + ' Summary';
                    }
                    
                    // Display summary
                    if (summaryText) summaryText.textContent = data.summary;
                    
                    // Update summary word count
                    if (summaryWordCount) {
                        const count = countWords(data.summary);
                        summaryWordCount.textContent = 'Words: ' + count;
                        
                        // Calculate and display analytics
                        updateAnalytics(inputText.value, data.summary);
                    }
                    
                    // Show the result
                    if (result) {
                        result.classList.remove('hidden');
                    }
                    
                    // Save to history in localStorage
                    saveToHistory({
                        timestamp: new Date().toISOString(),
                        originalText: inputText.value,
                        summary: data.summary,
                        mode: summaryMode ? summaryMode.value : 'standard',
                        length: summaryLength ? summaryLength.value : 'medium'
                    });
                    
                    // Extract key takeaways for Key Points mode
                    if (summaryMode && summaryMode.value === 'key-points') {
                        const keyTakeawaysList = extractKeyTakeaways(data.summary);
                        if (keyTakeaways) {
                            keyTakeaways.innerHTML = '';
                            const ul = document.createElement('ul');
                            keyTakeawaysList.forEach(point => {
                                const pointElement = document.createElement('li');
                                pointElement.textContent = point;
                                ul.appendChild(pointElement);
                            });
                            keyTakeaways.appendChild(ul);
                        }
                    }
                    
                    showNotification('Summary generated successfully');
                } else {
                    showNotification('No summary returned from the server', true);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error: ' + error.message, true);
            })
            .finally(() => {
                // Reset button state
                if (btnText) btnText.textContent = 'Summarize';
                if (loader) loader.classList.add('hidden');
                summarizeBtn.disabled = false;
            });
        });
    }
    
    // Save summary to history in localStorage
    function saveToHistory(summaryData) {
        try {
            // Get existing history or initialize empty array
            const history = JSON.parse(localStorage.getItem('summaryHistory') || '[]');
            
            // Add new summary to history (limit to 10 items)
            history.unshift(summaryData);
            if (history.length > 10) {
                history.pop();
            }
            
            // Save back to localStorage
            localStorage.setItem('summaryHistory', JSON.stringify(history));
            console.log('Saved to history:', summaryData);
        } catch (error) {
            console.error('Error saving to history:', error);
        }
    }
    
    // Update analytics function
    function updateAnalytics(inputText, summaryText) {
        const inputWordCount = countWords(inputText);
        const summaryWordCount = countWords(summaryText);
        const compressionRatio = (inputWordCount - summaryWordCount) / inputWordCount * 100;
        
        // Calculate reading time (average reading speed: 200 words per minute)
        const readingSpeed = 200; // words per minute
        const originalReadingTime = inputWordCount / readingSpeed;
        const summaryReadingTime = summaryWordCount / readingSpeed;
        const timeSaved = originalReadingTime - summaryReadingTime;
        
        // Update UI elements
        const wordReductionElement = document.getElementById('word-reduction');
        const timeSavedElement = document.getElementById('time-saved');
        
        if (wordReductionElement) {
            wordReductionElement.textContent = compressionRatio.toFixed(0) + '%';
        }
        
        if (timeSavedElement) {
            timeSavedElement.textContent = timeSaved.toFixed(1) + ' min';
        }
        
        console.log('Analytics:');
        console.log('Input word count:', inputWordCount);
        console.log('Summary word count:', summaryWordCount);
        console.log('Compression ratio:', compressionRatio.toFixed(2) + '%');
        console.log('Time saved:', timeSaved.toFixed(2) + ' minutes');
    }
    
    // Handle share button click
    if (shareBtn && shareOptions) {
        // Toggle share options dropdown
        shareBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            shareOptions.classList.toggle('hidden');
        });
        
        // Close share options when clicking outside
        document.addEventListener('click', function(e) {
            if (!shareBtn.contains(e.target) && !shareOptions.contains(e.target)) {
                shareOptions.classList.add('hidden');
            }
        });
        
        // Email sharing
        if (emailShare) {
            emailShare.addEventListener('click', function() {
                if (!summaryText || !summaryText.textContent) return;
                
                const subject = 'Summary from SumaRise';
                const body = summaryText.textContent;
                const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                
                window.open(mailtoLink, '_blank');
                shareOptions.classList.add('hidden');
                showNotification('Email client opened');
            });
        }
        
        // Twitter sharing
        if (twitterShare) {
            twitterShare.addEventListener('click', function() {
                if (!summaryText || !summaryText.textContent) return;
                
                // Limit to Twitter's character limit
                const text = summaryText.textContent.substring(0, 280);
                const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                
                window.open(twitterLink, '_blank', 'width=550,height=420');
                shareOptions.classList.add('hidden');
                showNotification('Opened Twitter sharing');
            });
        }
        
        // LinkedIn sharing
        if (linkedinShare) {
            linkedinShare.addEventListener('click', function() {
                if (!summaryText || !summaryText.textContent) return;
                
                const text = summaryText.textContent;
                const linkedinLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`;
                
                window.open(linkedinLink, '_blank', 'width=550,height=420');
                shareOptions.classList.add('hidden');
                showNotification('Opened LinkedIn sharing');
            });
        }
        
        // Facebook sharing
        if (facebookShare) {
            facebookShare.addEventListener('click', function() {
                if (!summaryText || !summaryText.textContent) return;
                
                const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(summaryText.textContent)}`;
                
                window.open(facebookLink, '_blank', 'width=550,height=420');
                shareOptions.classList.add('hidden');
                showNotification('Opened Facebook sharing');
            });
        }
    }
    
    // Add subtle animations with a delay to ensure DOM is ready
    setTimeout(function() {
        // Animate the title
        const title = document.querySelector('h1');
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(-10px)';
            title.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(function() {
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 100);
        }
        
        // Animate the card
        const card = document.querySelector('.card');
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(function() {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 200);
        }
    }, 300);
    
    // Hide key takeaways container initially
    const keyTakeawaysContainer = document.querySelector('.key-takeaways-container');
    if (keyTakeawaysContainer) {
        keyTakeawaysContainer.style.display = 'none';
    }
    
    console.log('SumaRise enhanced script initialized');
});
