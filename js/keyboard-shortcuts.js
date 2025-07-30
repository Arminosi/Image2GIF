/**
 * 键盘快捷键模块
 * @description 处理键盘快捷键功能
 */

// 初始化键盘事件监听
function initKeyboardEvents() {
    document.addEventListener('keydown', function(e) {
        // 只在没有聚焦输入框时响应快捷键
        if (document.activeElement.tagName !== 'INPUT' && 
            document.activeElement.tagName !== 'TEXTAREA') {
            
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                handleCopyShortcut();
            } else if (e.ctrlKey && e.key === 'v') {
                e.preventDefault();
                handlePasteShortcut();
            } else if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                handleUndoShortcut();
            }
        }
    });
}

// 处理Ctrl+C快捷键
function handleCopyShortcut() {
    if (FileManager.copySelectedToClipboard()) {
        showStatusMessage(
            `已复制 ${AppCore.appState.copiedFiles.length} 个帧到剪贴板`,
            'success'
        );
    } else {
        showStatusMessage('请先选择要复制的帧！', 'error');
    }
}

// 处理Ctrl+V快捷键
function handlePasteShortcut() {
    if (FileManager.pasteFromClipboard()) {
        showStatusMessage(
            `已粘贴 ${AppCore.appState.copiedFiles.length} 个帧`,
            'success'
        );
    } else {
        showStatusMessage('剪贴板中没有可粘贴的帧！', 'error');
    }
}

// 处理Ctrl+Z快捷键（撤销）
function handleUndoShortcut() {
    if (AppCore.appState.canUndo()) {
        if (FileManager.undoLastOperation()) {
            showStatusMessage('已撤销上一次操作', 'success');
        } else {
            showStatusMessage('撤销操作失败', 'error');
        }
    } else {
        showStatusMessage('没有可撤销的操作', 'error');
    }
}

// 显示状态消息
function showStatusMessage(message, type = 'info') {
    const statusElement = document.getElementById('status');
    const originalText = statusElement.textContent;
    statusElement.textContent = message;
    
    switch (type) {
        case 'success':
            statusElement.style.color = '#4CAF50';
            break;
        case 'error':
            statusElement.style.color = '#FF5722';
            break;
        default:
            statusElement.style.color = '#666';
    }
    
    setTimeout(() => {
        statusElement.textContent = originalText;
        statusElement.style.color = '#666';
    }, 2000);
}

// 导出
window.KeyboardShortcuts = {
    init: initKeyboardEvents
};
