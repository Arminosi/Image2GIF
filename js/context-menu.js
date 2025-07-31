/**
 * 右键菜单模块
 * @description 处理右键上下文菜单功能，支持批量操作
 */

let contextMenu = null;
let delayDialog = null;
let contextMenuTargetIndex = -1; // 记录右键点击的目标位置索引

// 初始化右键菜单
function initContextMenu() {
    contextMenu = document.getElementById('context-menu');
    delayDialog = document.getElementById('delay-dialog');
    
    const contextCopyBtn = document.getElementById('context-copy');
    const contextPasteBtn = document.getElementById('context-paste');
    const contextDeleteBtn = document.getElementById('context-delete');
    const contextSetDelayBtn = document.getElementById('context-set-delay');
    const delayConfirmBtn = document.getElementById('delay-confirm-btn');
    const delayCancelBtn = document.getElementById('delay-cancel-btn');
    
    // 复制选中的帧
    if (contextCopyBtn) {
        contextCopyBtn.addEventListener('click', function() {
            hide();
            copySelectedFrames();
        });
    }
    
    // 粘贴帧到指定位置
    if (contextPasteBtn) {
        contextPasteBtn.addEventListener('click', function() {
            hide();
            pasteFramesToPosition();
        });
    }
    
    // 删除选中的帧
    if (contextDeleteBtn) {
        contextDeleteBtn.addEventListener('click', function() {
            hide();
            deleteSelectedFrames();
        });
    }
    
    // 设置选中帧时长
    if (contextSetDelayBtn) {
        contextSetDelayBtn.addEventListener('click', function() {
            hide();
            GifGenerator.showDelayDialogForSelected();
        });
    }
    
    // 时长对话框按钮
    if (delayConfirmBtn) {
        delayConfirmBtn.addEventListener('click', function() {
            applyBatchDelay();
            hideDelayDialog();
        });
    }
    
    if (delayCancelBtn) {
        delayCancelBtn.addEventListener('click', function() {
            hideDelayDialog();
        });
    }
    
    // 对话框关闭按钮
    const delayCloseBtn = document.getElementById('delay-dialog-close');
    if (delayCloseBtn) {
        delayCloseBtn.addEventListener('click', function() {
            hideDelayDialog();
        });
    }
    
    // 注释：已删除点击遮罩关闭对话框功能
    // const delayOverlay = document.getElementById('delay-dialog-overlay');
    // if (delayOverlay) {
    //     delayOverlay.addEventListener('click', function() {
    //         hideDelayDialog();
    //     });
    // }
    
    // 删除确认对话框事件
    const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
    const deleteCancelBtn = document.getElementById('delete-cancel-btn');
    const deleteCloseBtn = document.getElementById('delete-dialog-close');
    const deleteOverlay = document.getElementById('delete-dialog-overlay');
    
    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', function() {
            confirmDeleteFrames();
            hideDeleteConfirmDialog();
        });
    }
    
    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', function() {
            hideDeleteConfirmDialog();
        });
    }
    
    if (deleteCloseBtn) {
        deleteCloseBtn.addEventListener('click', function() {
            hideDeleteConfirmDialog();
        });
    }
    
    // 注释：已删除点击遮罩关闭删除确认对话框功能
    // if (deleteOverlay) {
    //     deleteOverlay.addEventListener('click', function() {
    //         hideDeleteConfirmDialog();
    //     });
    // }
    
    // ESC键关闭对话框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const delayDialog = document.getElementById('delay-dialog');
            const deleteDialog = document.getElementById('delete-dialog');
            
            if (delayDialog && delayDialog.classList.contains('show')) {
                hideDelayDialog();
            }
            
            if (deleteDialog && deleteDialog.classList.contains('show')) {
                hideDeleteConfirmDialog();
            }
        }
    });
    
    // 点击其他地方隐藏菜单
    document.addEventListener('click', function(e) {
        if (!contextMenu.contains(e.target)) {
            hide();
        }
    });
    
    // 阻止右键菜单的默认行为
    document.addEventListener('contextmenu', function(e) {
        if (!e.target.closest('.file-item')) {
            hide();
        }
    });
}

// 显示右键菜单
function show(x, y, targetIndex = -1) {
    contextMenuTargetIndex = targetIndex; // 记录目标位置
    
    const selectedCount = AppCore.appState.selectedIndices.size;
    
    // 如果没有选中任何帧，不显示菜单
    if (selectedCount === 0) {
        return;
    }
    
    // 使用视窗坐标，不受页面滚动影响
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';
    AppCore.appState.contextMenuVisible = true;
    
    // 检查菜单项状态
    const copyItem = document.getElementById('context-copy');
    const pasteItem = document.getElementById('context-paste');
    const deleteItem = document.getElementById('context-delete');
    
    if (selectedCount === 0) {
        copyItem.classList.add('disabled');
        deleteItem.classList.add('disabled');
    } else {
        copyItem.classList.remove('disabled');
        deleteItem.classList.remove('disabled');
    }
    
    // 检查剪贴板状态来决定粘贴按钮是否可用
    if (AppCore.appState.copiedFiles && AppCore.appState.copiedFiles.length > 0) {
        pasteItem.classList.remove('disabled');
    } else {
        pasteItem.classList.add('disabled');
    }
    
    // 确保菜单不会超出屏幕（使用视窗坐标）
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = (y - rect.height) + 'px';
    }
}

// 隐藏右键菜单
function hide() {
    if (contextMenu) {
        contextMenu.style.display = 'none';
        AppCore.appState.contextMenuVisible = false;
    }
}

// 复制选中的帧
function copySelectedFrames() {
    if (AppCore.appState.selectedIndices.size === 0) {
        showStatusMessage('请先选择要复制的帧！', 'error');
        return;
    }
    
    if (FileManager.copySelectedToClipboard()) {
        showStatusMessage(`已复制 ${AppCore.appState.selectedIndices.size} 个帧到剪贴板`, 'success');
    } else {
        showStatusMessage('复制失败！', 'error');
    }
}

// 粘贴帧到指定位置
function pasteFramesToPosition() {
    if (!AppCore.appState.copiedFiles || AppCore.appState.copiedFiles.length === 0) {
        showStatusMessage('剪贴板为空，请先复制一些帧！', 'warning');
        return;
    }
    
    if (contextMenuTargetIndex < 0) {
        showStatusMessage('未指定粘贴位置！', 'error');
        return;
    }
    
    // 保存操作到撤销栈
    AppCore.appState.saveOperation('paste-at-position', {
        targetIndex: contextMenuTargetIndex,
        fileCount: AppCore.appState.copiedFiles.length,
        originalLength: AppCore.appState.selectedFiles.length
    });
    
    // 在指定位置插入复制的文件
    const filesToPaste = [...AppCore.appState.copiedFiles];
    
    // 计算插入位置（在目标索引之后）
    const insertIndex = contextMenuTargetIndex + 1;
    
    // 执行插入操作
    AppCore.appState.selectedFiles.splice(insertIndex, 0, ...filesToPaste);
    
    // 清除当前选择
    AppCore.appState.clearSelections();
    
    // 选中新粘贴的帧
    for (let i = 0; i < filesToPaste.length; i++) {
        AppCore.appState.addSelection(insertIndex + i);
    }
    
    // 重新渲染文件列表
    FileManager.displayFileList();
    
    // 通知状态更新
    AppCore.notifyStateUpdate();
    
    showStatusMessage(`已粘贴 ${filesToPaste.length} 个帧到位置 ${insertIndex}`, 'success');
    
    console.log(`粘贴了 ${filesToPaste.length} 个文件到索引 ${insertIndex}`);
}

// 删除选中的帧
function deleteSelectedFrames() {
    if (AppCore.appState.selectedIndices.size === 0) {
        showStatusMessage('请先选择要删除的帧！', 'error');
        return;
    }
    
    showDeleteConfirmDialog();
}

// 显示删除确认对话框
function showDeleteConfirmDialog() {
    const selectedCount = AppCore.appState.selectedIndices.size;
    const deleteDialog = document.getElementById('delete-dialog');
    const deleteOverlay = document.getElementById('delete-dialog-overlay');
    const deleteCountSpan = document.getElementById('delete-count');
    
    if (!deleteDialog || !deleteOverlay || !deleteCountSpan) {
        console.error('删除确认对话框元素未找到');
        return;
    }
    
    // 更新删除数量
    deleteCountSpan.textContent = selectedCount;
    
    // 显示遮罩和对话框
    deleteOverlay.classList.add('show');
    
    setTimeout(() => {
        deleteDialog.classList.add('show');
    }, 50);
    
    // 防止页面滚动
    document.body.style.overflow = 'hidden';
}

// 隐藏删除确认对话框
function hideDeleteConfirmDialog() {
    const deleteDialog = document.getElementById('delete-dialog');
    const deleteOverlay = document.getElementById('delete-dialog-overlay');
    
    if (deleteDialog) {
        deleteDialog.classList.remove('show');
    }
    
    if (deleteOverlay) {
        deleteOverlay.classList.remove('show');
    }
    
    // 恢复页面滚动
    document.body.style.overflow = '';
}

// 执行删除操作
function confirmDeleteFrames() {
    const selectedCount = AppCore.appState.selectedIndices.size;
    const selectedIndicesArray = Array.from(AppCore.appState.selectedIndices);
    
    // 保存操作到撤销栈，包括文件和帧延迟数据
    AppCore.saveOperation('delete', {
        selectedIndices: selectedIndicesArray,
        deletedFiles: selectedIndicesArray.map(index => AppCore.appState.selectedFiles[index]),
        deletedDelays: selectedIndicesArray.map(index => AppCore.appState.frameDelays[index] || 100)
    });
    
    // 删除选中的帧（从后往前删，避免索引变化）
    const indicesToDelete = selectedIndicesArray.sort((a, b) => b - a);
    
    indicesToDelete.forEach(index => {
        AppCore.appState.selectedFiles.splice(index, 1);
        // 删除对应的帧延迟（frameDelays是对象，需要删除属性并重新索引）
        if (AppCore.appState.frameDelays[index] !== undefined) {
            delete AppCore.appState.frameDelays[index];
        }
    });
    
    // 重新索引frameDelays，因为删除操作影响了索引
    AppCore.appState.reindexFrameDelays();
    
    // 清除选择状态
    AppCore.appState.clearSelections();
    
    // 刷新文件列表显示
    FileManager.displayFileList();
    AppCore.notifyStateUpdate();
    
    showStatusMessage(`已删除 ${selectedCount} 个帧`, 'success');
}

// 隐藏时长设置对话框
function hideDelayDialog() {
    const delayDialog = document.getElementById('delay-dialog');
    const delayOverlay = document.getElementById('delay-dialog-overlay');
    
    if (delayDialog) {
        delayDialog.classList.remove('show');
    }
    
    if (delayOverlay) {
        delayOverlay.classList.remove('show');
    }
    
    // 恢复页面滚动
    document.body.style.overflow = '';
    
    console.log('对话框已隐藏');
}

// 应用批量时长设置
function applyBatchDelay() {
    const delayValue = parseInt(document.getElementById('batch-delay-input').value);
    
    if (isNaN(delayValue) || delayValue < 50 || delayValue > 2000) {
        showStatusMessage('请输入有效的时长值 (50-2000毫秒)！', 'error');
        return;
    }
    
    if (AppCore.appState.selectedIndices.size === 0) {
        showStatusMessage('请先选择要设置时长的帧！', 'error');
        return;
    }
    
    // 保存操作到撤销栈
    AppCore.saveOperation('batchDelay', {
        selectedIndices: Array.from(AppCore.appState.selectedIndices),
        oldDelays: Array.from(AppCore.appState.selectedIndices).map(index => ({
            index,
            delay: AppCore.appState.getFrameDelay(index)
        })),
        newDelay: delayValue
    });
    
    // 批量设置选中帧的时长
    Array.from(AppCore.appState.selectedIndices).forEach(index => {
        AppCore.appState.setFrameDelay(index, delayValue);
    });
    
    // 刷新文件列表显示
    FileManager.displayFileList();
    AppCore.notifyStateUpdate();
    
    showStatusMessage(`已将 ${AppCore.appState.selectedIndices.size} 个帧的时长设置为 ${delayValue}ms`, 'success');
}

// 显示状态消息
function showStatusMessage(message, type = 'info') {
    // 使用新的悬浮状态系统
    if (window.FloatingStatus) {
        window.FloatingStatus.show(message, type);
    } else {
        // 后备方案：使用旧的status元素
        const statusElement = document.getElementById('status');
        if (statusElement) {
            const originalText = statusElement.textContent;
            const originalColor = statusElement.style.color;
            
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
                statusElement.style.color = originalColor;
            }, 3000);
        }
    }
}

// 导出
window.ContextMenu = {
    init: initContextMenu,
    show,
    hide,
    showDeleteConfirmDialog
};
