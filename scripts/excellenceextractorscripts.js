document.addEventListener('DOMContentLoaded', () => {
  // Grab all the buttons in the container
  const buttons = document.querySelectorAll('.button-container .buttons');
  const inputArea  = document.querySelector('.input-section .inputarea');
  const outputArea = document.getElementById('output-view');

  if (buttons.length < 3 || !inputArea || !outputArea) {
    console.warn('Required elements missing. Check your HTML classes and IDs.');
    return;
  }

  // Assign the buttons based on their order in the HTML
  const cleanUpBtn = buttons[0];
  const copyBtn    = buttons[1];
  const clearBtn   = buttons[2];

  // --- 1. THE PASTE SHIELD ---
  inputArea.addEventListener('paste', (e) => {
    e.preventDefault();
    
    const rawHTML = e.clipboardData.getData('text/html');
    const rawText = e.clipboardData.getData('text/plain');

    if (rawHTML) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHTML, 'text/html');

      const links = doc.querySelectorAll('a');
      links.forEach(a => {
        let href = a.getAttribute('href') || '';
        href = href.trim();

        if (href.startsWith('/document/') || href.startsWith('/spreadsheets/')) {
          href = 'https://docs.google.com' + href;
        } else if (href && !/^(https?|mailto|tel|ftp|#)/i.test(href)) {
          href = 'https://' + href;
        }
        
        a.setAttribute('href', href);
      });

      inputArea.innerHTML = doc.body.innerHTML;
    } else {
      inputArea.innerText = rawText;
    }
  });

  // --- 2. CLEAN UP BUTTON ---
    cleanUpBtn.addEventListener('click', () => {
    let cleanedHTML = stripTablesAndStructure(inputArea);

    // FIX: Remove any sneaky empty <p> tags or whitespace at the very top and bottom
    cleanedHTML = cleanedHTML.replace(/^(<p>(\s|&nbsp;|<br>)*<\/p>\s*)+/gi, '')
                             .replace(/(<p>(\s|&nbsp;|<br>)*<\/p>\s*)+$/gi, '')
                             .trim();

    // Create a temporary div to easily count the extracted links
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanedHTML;
    const linkCount = tempDiv.querySelectorAll('a').length;

    // Apply the requested prefix based on link count
    let prefix = '';
    if (linkCount >= 2) {
      prefix = '<p>No match found. Please see search queries below.</p>';
      &nbsp;
    } else if (linkCount === 1) {
      prefix = '<p>No match found. Please see search query below.</p><p>&nbsp;</p>';
    }

    // Apply the suffix (Since we stripped ALL bottom spaces above, we will explicitly add exactly two here)
    let suffix = '';
    if (linkCount >= 2) {
      suffix = '<p>&nbsp;</p>';
    } else if (linkCount === 1) {
      suffix = '<p>&nbsp;</p><p>&nbsp;</p>';
    }

    // Render the final combination
    outputArea.innerHTML = prefix + cleanedHTML + suffix;
  });

  // --- 3. COPY BUTTON ---
  copyBtn.addEventListener('click', async () => {
    if (!outputArea.innerHTML.trim()) return; // Don't copy if empty

    try {
      const htmlContent = outputArea.innerHTML;
      const textContent = outputArea.innerText;

      // Create a payload with both HTML and plain text formats
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([textContent], { type: 'text/plain' })
      });

      await navigator.clipboard.write([clipboardItem]);

      // Give visual feedback that it worked
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);

    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy to clipboard.');
    }
  });

  // --- 4. CLEAR BUTTON ---
  clearBtn.addEventListener('click', () => {
    inputArea.innerHTML = '';
    outputArea.innerHTML = '';
  });
});

// --- CORE CLEANUP LOGIC ---
function stripTablesAndStructure(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const tag = node.tagName.toLowerCase();

  if (['style', 'script', 'meta', 'title', 'head'].includes(tag)) {
    return '';
  }

  let innerContent = '';
  for (const child of node.childNodes) {
    innerContent += stripTablesAndStructure(child);
  }

  if (tag === 'a') {
    let href = node.getAttribute('href') || '';
    const text = innerContent.trim();
    
    if (href.includes('google.com/url?')) {
      try {
        const urlObj = new URL(href, 'https://dummy.com'); 
        href = urlObj.searchParams.get('q') || urlObj.searchParams.get('url') || href;
      } catch {}
    }

    if (href && text) {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    return innerContent;
  }

  if (['tr', 'p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
    return innerContent.trim() ? `<p>${innerContent.trim()}</p>` : '';
  }

  if (tag === 'td' || tag === 'th') {
    return innerContent + ' ';
  }

  if (['table', 'tbody', 'thead', 'tfoot', 'ul', 'ol', 'span', 'b', 'i', 'strong', 'em', 'u'].includes(tag)) {
    return innerContent;
  }

  return innerContent;

}



