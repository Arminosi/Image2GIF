/**
 * 键盘快捷键模块
 * @description 处理键盘快捷键功能
 */

// 初始化键盘事件监听
function initKeyboardEvents() {
    document.addEventListener('keydown', function(e) {
        // 检查是否在历史窗口中
        const historyWindow = document.getElementById('history-window');
        const isHistoryWindowOpen = historyWindow && historyWindow.style.display !== 'none' && 
                                   historyWindow.classList.contains('show');
        
        // 如果历史窗口打开，不处理任何快捷键，让历史窗口自己处理
        if (isHistoryWindowOpen) {
            return;
        }
        
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
            // 成功消息已在undoLastOperation函数中处理，这里不重复显示
        } else {
            if (window.FloatingStatus) {
                const message = window.i18n ? window.i18n.t('status.undo_failed') : '撤销操作失败';
                FloatingStatus.show(message, 'error', 2000);
            } else {
                showStatusMessage('撤销操作失败', 'error');
            }
        }
    } else {
        if (window.FloatingStatus) {
            const message = window.i18n ? window.i18n.t('status.no_undo_available') : '没有可撤销的操作';
            FloatingStatus.show(message, 'info', 2000);
        } else {
            showStatusMessage('没有可撤销的操作', 'info');
        }
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
