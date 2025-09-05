// Global variables
let conversionMode = 'normal';
let conversionHistory = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    updateHistoryDisplay();
    
    // Add input event listener for character counter
    const inputField = document.getElementById('input');
    inputField.addEventListener('input', updateCharCount);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to convert
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            convertText();
        }
        // Ctrl/Cmd + Shift + C to copy
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            copyOutput();
        }
    });
});

// Update character count
function updateCharCount() {
    const input = document.getElementById('input').value;
    document.getElementById('inputCharCount').textContent = input.length;
}

// Enhanced Unicode encoding function
function encodeToUnicode(text, mode = 'normal') {
    if (mode === 'full') {
        // Full mode - convert all Thai characters
        return [...text].map(ch => {
            const code = ch.charCodeAt(0);
            // Only Thai characters (0x0E00-0x0E7F)
            if (code >= 0x0E00 && code <= 0x0E7F) {
                return "\\u" + code.toString(16).padStart(4, "0");
            }
            return ch;
        }).join("");
    } else if (mode === 'special') {
        // Special mode - Thai characters and some punctuation
        return [...text].map(ch => {
            const code = ch.charCodeAt(0);
            // Thai characters and Thai punctuation
            if (code >= 0x0E00 && code <= 0x0E7F) {
                return "\\u" + code.toString(16).padStart(4, "0");
            }
            // Convert some special punctuation that might be filtered
            if (ch === '"' || ch === "'" || ch === '<' || ch === '>' || ch === '&') {
                return "\\u" + code.toString(16).padStart(4, "0");
            }
            return ch;
        }).join("");
    } else {
        // Normal mode - Only Thai characters
        return [...text].map(ch => {
            const code = ch.charCodeAt(0);
            // Only Thai characters (0x0E00-0x0E7F)
            if (code >= 0x0E00 && code <= 0x0E7F) {
                return "\\u" + code.toString(16).padStart(4, "0");
            }
            return ch;
        }).join("");
    }
}

// Main conversion function
function convertText() {
    const input = document.getElementById('input').value;
    
    if (!input.trim()) {
        showNotification('กรุณาใส่ข้อความที่ต้องการแปลง', 'error');
        return;
    }
    
    // Show loading on button
    const button = document.querySelector('.convert-btn');
    const originalContent = button.innerHTML;
    button.innerHTML = '<div class="loading"></div> กำลังแปลง...';
    button.disabled = true;
    
    // Simulate processing time for better UX
    setTimeout(() => {
        const output = encodeToUnicode(input, conversionMode);
        document.getElementById('output').value = output;
        
        // Add to history
        addToHistory(input, output);
        
        // Show action buttons
        document.getElementById('copyButton').style.display = 'inline-flex';
        document.getElementById('downloadButton').style.display = 'inline-flex';
        document.getElementById('clearOutputButton').style.display = 'inline-flex';
        
        // Restore button
        button.innerHTML = originalContent;
        button.disabled = false;
        
        // Show success notification
        showNotification('แปลงข้อความสำเร็จ!', 'success');
        
        // Auto-select output for easy copying
        document.getElementById('output').select();
    }, 300);
}

// Toggle conversion mode
function toggleMode() {
    const modes = ['normal', 'special', 'full'];
    const modeNames = {
        'normal': 'โหมดปกติ (ภาษาไทย)',
        'special': 'โหมดพิเศษ (ไทย + เครื่องหมาย)',
        'full': 'โหมดเต็ม (ภาษาไทยทั้งหมด)'
    };
    
    const currentIndex = modes.indexOf(conversionMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    conversionMode = modes[nextIndex];
    
    document.getElementById('modeText').textContent = modeNames[conversionMode];
    showNotification(`เปลี่ยนเป็น ${modeNames[conversionMode]}`, 'success');
}

// Copy to clipboard
function copyOutput() {
    const outputText = document.getElementById('output').value;
    
    if (!outputText) {
        showNotification('ไม่มีข้อความให้คัดลอก', 'error');
        return;
    }
    
    navigator.clipboard.writeText(outputText).then(() => {
        showNotification('คัดลอกสำเร็จ!', 'success');
        
        // Animate button
        const button = document.getElementById('copyButton');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 200);
    }).catch(err => {
        showNotification('ไม่สามารถคัดลอกได้: ' + err, 'error');
    });
}

// Download output as text file
function downloadOutput() {
    const output = document.getElementById('output').value;
    
    if (!output) {
        showNotification('ไม่มีข้อความให้ดาวน์โหลด', 'error');
        return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `unicode_output_${timestamp}.txt`;
    
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    showNotification('ดาวน์โหลดสำเร็จ!', 'success');
}

// Clear input
function clearInput() {
    document.getElementById('input').value = '';
    updateCharCount();
    showNotification('ล้างข้อความแล้ว', 'success');
}

// Clear output
function clearOutput() {
    document.getElementById('output').value = '';
    document.getElementById('copyButton').style.display = 'none';
    document.getElementById('downloadButton').style.display = 'none';
    document.getElementById('clearOutputButton').style.display = 'none';
    showNotification('ล้างผลลัพธ์แล้ว', 'success');
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    
    // Set content and class
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.className = 'notification show';
    if (type === 'error') {
        notification.classList.add('error');
    }
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// History management
function addToHistory(input, output) {
    const historyItem = {
        input: input,
        output: output,
        timestamp: new Date().toISOString()
    };
    
    conversionHistory.unshift(historyItem);
    
    // Keep only last 10 items
    if (conversionHistory.length > 10) {
        conversionHistory.pop();
    }
    
    saveHistory();
    updateHistoryDisplay();
}

function saveHistory() {
    try {
        localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

function loadHistory() {
    try {
        const saved = localStorage.getItem('conversionHistory');
        if (saved) {
            conversionHistory = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load history:', e);
        conversionHistory = [];
    }
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    
    if (conversionHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">ยังไม่มีประวัติการแปลง</p>';
        return;
    }
    
    historyList.innerHTML = conversionHistory.map((item, index) => {
        const date = new Date(item.timestamp);
        const timeString = date.toLocaleString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short'
        });
        
        const preview = item.input.length > 50 ? 
            item.input.substring(0, 50) + '...' : 
            item.input;
        
        return `
            <div class="history-item">
                <div class="history-text" title="${item.input}">${preview}</div>
                <div class="history-time">${timeString}</div>
                <div class="history-actions">
                    <button class="history-btn" onclick="restoreFromHistory(${index})" title="กู้คืน">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="history-btn" onclick="deleteFromHistory(${index})" title="ลบ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function restoreFromHistory(index) {
    const item = conversionHistory[index];
    if (item) {
        document.getElementById('input').value = item.input;
        document.getElementById('output').value = item.output;
        updateCharCount();
        
        // Show action buttons
        document.getElementById('copyButton').style.display = 'inline-flex';
        document.getElementById('downloadButton').style.display = 'inline-flex';
        document.getElementById('clearOutputButton').style.display = 'inline-flex';
        
        showNotification('กู้คืนข้อความสำเร็จ', 'success');
    }
}

function deleteFromHistory(index) {
    if (confirm('ต้องการลบประวัตินี้หรือไม่?')) {
        conversionHistory.splice(index, 1);
        saveHistory();
        updateHistoryDisplay();
        showNotification('ลบประวัติสำเร็จ', 'success');
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        encodeToUnicode,
        convertText,
        copyOutput,
        downloadOutput,
        clearInput,
        clearOutput
    };
}