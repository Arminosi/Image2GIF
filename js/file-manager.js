/**
 * 文件管理模块
 * @description 文件选择、显示、排序和操作功能
 */

// 文件处理函数
function handleFileSelection(files) {
    if (files.length > 0) {
        // 存储文件并排序（初始按文件名排序）
        AppCore.appState.selectedFiles = Array.from(files).sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, {numeric: true});
        });
        
        AppCore.appState.clearSelections();
        
        // 显示文件列表
        displayFileList();
        
        // 启用生成按钮
        document.getElementById('generate-btn').disabled = false;
        
        // 清除状态
        document.getElementById('status').textContent = '';
        
        AppCore.notifyStateUpdate();
    }
}

// 显示选中文件列表
function displayFileList() {
    const fileListElement = document.getElementById('file-list');
    fileListElement.innerHTML = '';
    
    // 如果没有文件，显示空状态
    if (AppCore.appState.selectedFiles.length === 0) {
        // 隐藏卡片大小控制器
        if (window.CardSizeController) {
            CardSizeController.hide();
        }
        
        // 显示空状态提示
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-icon">📁</div>
            <div class="empty-state-text">还没有选择文件</div>
            <div class="empty-state-hint">请点击"选择PNG文件"按钮导入图片</div>
        `;
        fileListElement.appendChild(emptyState);
        return;
    }
    
    // 如果有文件，显示卡片大小控制器
    if (window.CardSizeController) {
        CardSizeController.show();
    }
    
    // 添加标题
    const header = document.createElement('div');
    header.className = 'file-list-header';
    header.innerHTML = `
        <div>📁 已导入的帧</div>
        <div style="font-size: 14px; font-weight: 400; margin-top: 5px; opacity: 0.9;">
          可以拖拽排序 • Ctrl+C/V 复制粘贴
        </div>
    `;
    fileListElement.appendChild(header);
    
    // 添加控制按钮
    const controls = document.createElement('div');
    controls.className = 'selection-controls';
    
    const selectAllBtn = document.createElement('button');
    selectAllBtn.className = 'control-btn';
    selectAllBtn.innerHTML = '🔲 全选';
    selectAllBtn.onclick = selectAll;
    
    const deselectAllBtn = document.createElement('button');
    deselectAllBtn.className = 'control-btn';
    deselectAllBtn.innerHTML = '⭕ 取消全选';
    deselectAllBtn.onclick = deselectAll;
    
    const copySelectedBtn = document.createElement('button');
    copySelectedBtn.className = 'control-btn';
    copySelectedBtn.innerHTML = '📋 复制选中';
    copySelectedBtn.onclick = copySelected;
    copySelectedBtn.id = 'copy-selected-btn';
    
    const deleteSelectedBtn = document.createElement('button');
    deleteSelectedBtn.className = 'control-btn';
    deleteSelectedBtn.innerHTML = '🗑️ 删除选中';
    deleteSelectedBtn.onclick = deleteSelected;
    deleteSelectedBtn.id = 'delete-selected-btn';
    
    const appendImportBtn = document.createElement('button');
    appendImportBtn.className = 'control-btn';
    appendImportBtn.innerHTML = '➕ 追加图片';
    appendImportBtn.onclick = appendImportFiles;
    appendImportBtn.id = 'append-import-btn';
    appendImportBtn.title = '追加导入PNG图片到当前序列';
    
    const selectionInfo = document.createElement('div');
    selectionInfo.className = 'selection-info';
    selectionInfo.id = 'selection-info';
    
    controls.appendChild(selectAllBtn);
    controls.appendChild(deselectAllBtn);
    controls.appendChild(copySelectedBtn);
    controls.appendChild(deleteSelectedBtn);
    controls.appendChild(appendImportBtn);
    controls.appendChild(selectionInfo);
    
    fileListElement.appendChild(controls);
    
    // 创建文件网格容器
    const gridContainer = document.createElement('div');
    gridContainer.className = 'file-grid-container';
    
    const fileGrid = document.createElement('div');
    fileGrid.className = 'file-grid';
    
    // 创建文件项
    AppCore.appState.selectedFiles.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        fileGrid.appendChild(fileItem);
    });

    gridContainer.appendChild(fileGrid);
    fileListElement.appendChild(gridContainer);

    // 启用拖拽排序功能
    if (window.DragSortController) {
        window.DragSortController.enableDragSort(fileGrid);
    }

    updateSelectionInfo();
}

// 创建文件项元素
function createFileItem(file, index) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item selection-mode';
    fileItem.dataset.index = index;
    
    // 启用拖拽 - 由 DragSortController 管理
    fileItem.draggable = false; // 初始设为 false，由控制器启用
    fileItem.setAttribute('draggable', 'false');
    
    // 如果该项被选中，添加选中样式
    if (AppCore.appState.selectedIndices.has(index)) {
        fileItem.classList.add('selected');
    }
    
    // 创建选择复选框
    const checkboxOverlay = document.createElement('div');
    checkboxOverlay.className = 'checkbox-overlay';
    checkboxOverlay.dataset.index = index;
    
    // 根据选中状态设置样式
    if (AppCore.appState.selectedIndices.has(index)) {
        checkboxOverlay.classList.add('checked');
    }
    
    // 点击事件处理
    checkboxOverlay.addEventListener('click', function(e) {
        e.stopPropagation();
        const isCurrentlySelected = AppCore.appState.selectedIndices.has(index);
        toggleSelection(index, !isCurrentlySelected);
    });
    
    checkboxOverlay.addEventListener('mousedown', function(e) {
        e.stopPropagation();
    });
    
    // 创建图片预览容器
    const previewContainer = document.createElement('div');
    previewContainer.className = 'file-preview-container';
    
    const img = document.createElement('img');
    img.className = 'file-preview';
    img.src = URL.createObjectURL(file);
    img.alt = file.name;
    img.draggable = false; // 禁用图片本身的拖拽
    
    // 禁用图片的拖拽，但不影响父容器的拖拽
    img.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // 阻止图片的鼠标事件影响选择
    img.addEventListener('mousedown', function(e) {
        // 不阻止事件冒泡，让父容器能处理拖拽
        // e.preventDefault(); 注释掉这行
    });
    
    previewContainer.appendChild(img);
    
    // 创建文件信息区域
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    
    // 文件头部信息
    const fileHeader = document.createElement('div');
    fileHeader.className = 'file-header';
    
    const fileNumber = document.createElement('span');
    fileNumber.className = 'file-number';
    fileNumber.textContent = `#${index + 1}`;
    
    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.textContent = file.name;
    fileName.title = file.name;
    
    fileHeader.appendChild(fileNumber);
    fileHeader.appendChild(fileName);
    
    // 添加帧时间间隔设置
    const frameDelayContainer = document.createElement('div');
    frameDelayContainer.className = 'frame-delay-container';
    
    const delayLabel = document.createElement('span');
    delayLabel.className = 'delay-label';
    delayLabel.textContent = '时长';
    
    const delayInput = document.createElement('input');
    delayInput.type = 'number';
    delayInput.className = 'frame-delay-input';
    delayInput.min = '50';
    delayInput.max = '2000';
    delayInput.step = '10';
    delayInput.value = AppCore.appState.getFrameDelay(index);
    delayInput.title = '设置此帧的显示时间（毫秒）';
    
    delayInput.addEventListener('change', function(e) {
        const newDelay = parseInt(e.target.value) || 100;
        AppCore.appState.setFrameDelay(index, newDelay);
        AppCore.notifyStateUpdate();
    });
    
    delayInput.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    const delayUnit = document.createElement('span');
    delayUnit.className = 'delay-unit';
    delayUnit.textContent = 'ms';
    
    frameDelayContainer.appendChild(delayLabel);
    frameDelayContainer.appendChild(delayInput);
    frameDelayContainer.appendChild(delayUnit);
    
    fileInfo.appendChild(fileHeader);
    fileInfo.appendChild(frameDelayContainer);
    
    // 组装元素
    fileItem.appendChild(previewContainer);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(checkboxOverlay);
    
    // 恢复子元素的交互
    previewContainer.style.pointerEvents = 'auto';
    fileInfo.style.pointerEvents = 'auto';
    checkboxOverlay.style.pointerEvents = 'auto';
    
    // 添加右键菜单事件
    fileItem.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // 如果右击的不是选中的项，先选中它
        if (!AppCore.appState.selectedIndices.has(index)) {
            // 清除其他选择，只选中当前项
            AppCore.appState.clearSelections();
            toggleSelection(index, true);
        }
        
        // 显示右键菜单 (使用clientX/Y避免滚动位置影响)
        ContextMenu.show(e.clientX, e.clientY, index);
    });
    
    return fileItem;
}

// 切换选择状态
function toggleSelection(index, checked) {
    if (checked) {
        AppCore.appState.addSelection(index);
    } else {
        AppCore.appState.removeSelection(index);
    }
    updateSelectionUI();
    AppCore.notifyStateUpdate();
}

// 全选
function selectAll() {
    AppCore.appState.selectAll();
    updateSelectionUI();
    AppCore.notifyStateUpdate();
}

// 取消全选
function deselectAll() {
    AppCore.appState.clearSelections();
    updateSelectionUI();
    AppCore.notifyStateUpdate();
}

// 复制选中的文件（Ctrl+C）
function copySelectedToClipboard() {
    if (AppCore.appState.selectedIndices.size === 0) {
        return false;
    }
    
    AppCore.appState.copiedFiles = [];
    AppCore.appState.selectedIndices.forEach(index => {
        AppCore.appState.copiedFiles.push(AppCore.appState.selectedFiles[index]);
    });
    
    return true;
}

// 粘贴文件（Ctrl+V）
function pasteFromClipboard() {
    if (AppCore.appState.copiedFiles.length === 0) {
        return false;
    }
    
    // 保存当前状态到撤销栈
    AppCore.appState.saveOperation('paste', {
        fileCount: AppCore.appState.copiedFiles.length,
        originalLength: AppCore.appState.selectedFiles.length
    });
    
    AppCore.appState.selectedFiles.push(...AppCore.appState.copiedFiles);
    displayFileList();
    AppCore.notifyStateUpdate();
    
    return true;
}

// 复制选中的文件（按钮方式）
function copySelected() {
    if (copySelectedToClipboard()) {
        AppCore.appState.clearSelections();
        displayFileList();
        AppCore.notifyStateUpdate();
    } else {
        alert('请先选择要复制的帧！');
    }
}

// 删除选中的文件
function deleteSelected() {
    if (AppCore.appState.selectedIndices.size === 0) {
        // 使用状态消息替代alert
        const statusElement = document.getElementById('status');
        const originalText = statusElement.textContent;
        statusElement.textContent = '请先选择要删除的帧！';
        statusElement.style.color = '#FF5722';
        setTimeout(() => {
            statusElement.textContent = originalText;
            statusElement.style.color = '#666';
        }, 3000);
        return;
    }
    
    // 使用统一的删除确认对话框
    ContextMenu.showDeleteConfirmDialog();
}

// 更新选择相关的UI
function updateSelectionUI() {
    document.querySelectorAll('.file-item').forEach((item, index) => {
        const checkboxOverlay = item.querySelector('.checkbox-overlay');
        const isSelected = AppCore.appState.selectedIndices.has(index);
        
        // 更新复选框样式
        if (isSelected) {
            checkboxOverlay.classList.add('checked');
            item.classList.add('selected');
        } else {
            checkboxOverlay.classList.remove('checked');
            item.classList.remove('selected');
        }
    });
    
    updateSelectionInfo();
}

// 更新选择信息
function updateSelectionInfo() {
    const infoElement = document.getElementById('selection-info');
    if (infoElement) {
        const selectedCount = AppCore.appState.selectedIndices.size;
        const totalCount = AppCore.appState.selectedFiles.length;
        
        if (selectedCount === 0) {
            infoElement.innerHTML = `
                <span style="color: #666;">📊 总共 ${totalCount} 个文件</span>
                <span style="color: #999; margin-left: 10px;">未选择任何文件</span>
            `;
        } else {
            infoElement.innerHTML = `
                <span style="color: #667eea; font-weight: 700;">✅ 已选择 ${selectedCount} 个文件</span>
                <span style="color: #666; margin-left: 10px;">总共 ${totalCount} 个文件</span>
            `;
        }
    }
    
    const copyBtn = document.getElementById('copy-selected-btn');
    const deleteBtn = document.getElementById('delete-selected-btn');
    if (copyBtn) copyBtn.disabled = AppCore.appState.selectedIndices.size === 0;
    if (deleteBtn) deleteBtn.disabled = AppCore.appState.selectedIndices.size === 0;
}

// 移动文件位置的函数
function moveFile(fromIndex, toIndex) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= AppCore.appState.selectedFiles.length) {
        return;
    }
    
    const fileToMove = AppCore.appState.selectedFiles[fromIndex];
    AppCore.appState.selectedFiles.splice(fromIndex, 1);
    AppCore.appState.selectedFiles.splice(toIndex, 0, fileToMove);
    
    // 创建索引映射表
    const indexMapping = {};
    const newSelectedIndices = new Set();
    
    // 处理选择状态
    AppCore.appState.selectedIndices.forEach(oldIndex => {
        let newIndex = oldIndex;
        
        if (oldIndex === fromIndex) {
            newIndex = toIndex;
        } else if (fromIndex < toIndex) {
            if (oldIndex > fromIndex && oldIndex <= toIndex) {
                newIndex = oldIndex - 1;
            }
        } else {
            if (oldIndex >= toIndex && oldIndex < fromIndex) {
                newIndex = oldIndex + 1;
            }
        }
        
        newSelectedIndices.add(newIndex);
        indexMapping[oldIndex] = newIndex;
    });
    
    // 处理未选中项的索引映射
    for (let i = 0; i < AppCore.appState.selectedFiles.length; i++) {
        if (!AppCore.appState.selectedIndices.has(i)) {
            let newIndex = i;
            if (i === fromIndex) {
                newIndex = toIndex;
            } else if (fromIndex < toIndex) {
                if (i > fromIndex && i <= toIndex) {
                    newIndex = i - 1;
                }
            } else {
                if (i >= toIndex && i < fromIndex) {
                    newIndex = i + 1;
                }
            }
            indexMapping[i] = newIndex;
        }
    }
    
    AppCore.appState.selectedIndices = newSelectedIndices;
    
    // 重新映射帧延迟设置
    AppCore.appState.remapFrameDelays(indexMapping);
    
    displayFileList();
    AppCore.notifyStateUpdate();
}

// 撤销最后一次操作
function undoLastOperation() {
    const lastOperation = AppCore.appState.undo();
    if (!lastOperation) {
        return false;
    }
    
    switch (lastOperation.type) {
        case 'paste':
            // 撤销粘贴：移除最后粘贴的文件
            const { fileCount, originalLength } = lastOperation.data;
            AppCore.appState.selectedFiles.splice(originalLength, fileCount);
            displayFileList();
            AppCore.notifyStateUpdate();
            return true;
        case 'paste-at-position':
            // 撤销位置粘贴：移除在指定位置粘贴的文件
            const { targetIndex, fileCount: pasteCount } = lastOperation.data;
            const insertIndex = targetIndex + 1;
            AppCore.appState.selectedFiles.splice(insertIndex, pasteCount);
            AppCore.appState.clearSelections(); // 清除选择状态
            displayFileList();
            AppCore.notifyStateUpdate();
            return true;
        case 'append-import':
            // 撤销追加导入：移除最后追加的文件
            const { fileCount: appendCount, originalLength: appendOrigLength } = lastOperation.data;
            AppCore.appState.selectedFiles.splice(appendOrigLength, appendCount);
            AppCore.appState.clearSelections(); // 清除选择状态
            displayFileList();
            AppCore.notifyStateUpdate();
            return true;
        default:
            return false;
    }
}

// 追加导入PNG文件
function appendImportFiles() {
    // 创建隐藏的文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.png';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    
    // 处理文件选择
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // 检查文件类型
            const invalidFiles = files.filter(file => !file.type.includes('png'));
            if (invalidFiles.length > 0) {
                alert(`检测到 ${invalidFiles.length} 个非PNG文件，仅支持PNG格式！`);
                document.body.removeChild(fileInput);
                return;
            }
            
            // 保存操作到撤销栈
            AppCore.appState.saveOperation('append-import', {
                originalLength: AppCore.appState.selectedFiles.length,
                fileCount: files.length
            });
            
            // 对新文件进行排序
            const sortedFiles = files.sort((a, b) => {
                return a.name.localeCompare(b.name, undefined, {numeric: true});
            });
            
            // 追加到现有文件数组
            AppCore.appState.selectedFiles.push(...sortedFiles);
            
            // 重新显示文件列表
            displayFileList();
            
            // 通知状态更新
            AppCore.notifyStateUpdate();
            
            // 显示成功消息
            const statusElement = document.getElementById('status');
            if (statusElement) {
                statusElement.textContent = `✅ 成功追加导入 ${files.length} 个PNG文件！`;
                statusElement.style.color = '#4CAF50';
                
                // 3秒后清除状态
                setTimeout(() => {
                    statusElement.textContent = '';
                }, 3000);
            }
            
            console.log(`追加导入了 ${files.length} 个PNG文件`);
        }
        
        // 清理输入元素
        document.body.removeChild(fileInput);
    });
    
    // 添加到DOM并触发点击
    document.body.appendChild(fileInput);
    fileInput.click();
}

// 导出
window.FileManager = {
    handleFileSelection,
    displayFileList,
    renderFileList: displayFileList, // 添加别名支持
    selectAll,
    deselectAll,
    copySelected,
    deleteSelected,
    copySelectedToClipboard,
    pasteFromClipboard,
    appendImportFiles,
    undoLastOperation,
    moveFile,
    updateSelectionUI,
    updateSelectionInfo
};
