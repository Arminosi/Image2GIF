/**
 * 文件管理模块
 * @description 文件选择、显示、排序和操作功能
 */

// 文件处理函数
function handleFileSelection(files) {
    console.log('handleFileSelection被调用，文件数量:', files.length);
    if (files.length > 0) {
        console.log('开始处理文件列表...');
        // 存储文件并排序（初始按文件名排序）
        AppCore.appState.selectedFiles = Array.from(files).sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, {numeric: true});
        });
        
        console.log('文件已排序，总数:', AppCore.appState.selectedFiles.length);
        
        AppCore.appState.clearSelections();
        
        // 显示文件列表
        console.log('开始显示文件列表...');
        displayFileList();
        
        // 启用生成按钮
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.disabled = false;
            console.log('生成按钮已启用');
        }
        
        // 清除状态
        document.getElementById('status').textContent = '';
        
        AppCore.notifyStateUpdate();
        console.log('文件处理完成');
    } else {
        console.log('没有文件需要处理');
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
        
        // 创建空状态提示
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'file-list-empty-message';
        
        // 根据当前语言显示不同内容
        const isEnglish = window.i18n && window.i18n.getCurrentLanguage() === 'en';
        
        if (isEnglish) {
            emptyDiv.innerHTML = `
                <div class="icon">🎬</div>
                <div class="title">No frame sequence yet</div>
                <div class="hint">Click "Select Image Files" button on the left to start</div>
            `;
        } else {
            emptyDiv.innerHTML = `
                <div class="icon">🎬</div>
                <div class="title">还没有帧序列</div>
                <div class="hint">点击左侧"选择PNG文件"按钮开始</div>
            `;
        }
        
        fileListElement.appendChild(emptyDiv);
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
        <div data-i18n="frame.header.title">📁 已导入的帧</div>
        <div style="font-size: 14px; font-weight: 400; margin-top: 5px; opacity: 0.9;" data-i18n="frame.header.hint">
          可以拖拽排序 • Ctrl+C/V 复制粘贴
        </div>
    `;
    fileListElement.appendChild(header);
    
    // 应用国际化到标题
    if (window.i18n) {
        window.i18n.applyToContainer(header);
    }
    
    // 添加控制按钮
    const controls = document.createElement('div');
    controls.className = 'selection-controls';
    
    const selectAllBtn = document.createElement('button');
    selectAllBtn.className = 'control-btn';
    selectAllBtn.innerHTML = '<span data-i18n="frame.controls.selectAll">🔲 全选</span>';
    selectAllBtn.onclick = selectAll;
    
    const deselectAllBtn = document.createElement('button');
    deselectAllBtn.className = 'control-btn';
    deselectAllBtn.innerHTML = '<span data-i18n="frame.controls.deselectAll">⭕ 取消全选</span>';
    deselectAllBtn.onclick = deselectAll;
    
    const copySelectedBtn = document.createElement('button');
    copySelectedBtn.className = 'control-btn';
    copySelectedBtn.innerHTML = '<span data-i18n="frame.controls.copy">📋 复制选中</span>';
    copySelectedBtn.onclick = copySelected;
    copySelectedBtn.id = 'copy-selected-btn';
    
    const deleteSelectedBtn = document.createElement('button');
    deleteSelectedBtn.className = 'control-btn';
    deleteSelectedBtn.innerHTML = '<span data-i18n="frame.controls.delete">🗑️ 删除选中</span>';
    deleteSelectedBtn.onclick = deleteSelected;
    deleteSelectedBtn.id = 'delete-selected-btn';
    
    const undoBtn = document.createElement('button');
    undoBtn.className = 'control-btn undo-btn';
    undoBtn.innerHTML = '<span data-i18n="frame.controls.undo">↶ 撤销</span>';
    undoBtn.onclick = undoLastOperation;
    undoBtn.id = 'undo-btn';
    undoBtn.style.display = 'none'; // 初始隐藏
    undoBtn.setAttribute('data-i18n-title', 'frame.controls.undo.tooltip');
    
    const appendImportBtn = document.createElement('button');
    appendImportBtn.className = 'control-btn';
    appendImportBtn.innerHTML = '<span data-i18n="frame.controls.append">➕ 追加图片</span>';
    appendImportBtn.onclick = appendImportFiles;
    appendImportBtn.id = 'append-import-btn';
    appendImportBtn.setAttribute('data-i18n-title', 'frame.controls.append.tooltip');
    
    const selectionInfo = document.createElement('div');
    selectionInfo.className = 'selection-info';
    selectionInfo.id = 'selection-info';
    
    controls.appendChild(selectAllBtn);
    controls.appendChild(deselectAllBtn);
    controls.appendChild(copySelectedBtn);
    controls.appendChild(deleteSelectedBtn);
    controls.appendChild(undoBtn);
    controls.appendChild(appendImportBtn);
    controls.appendChild(selectionInfo);
    
    fileListElement.appendChild(controls);
    
    // 应用国际化到控制按钮
    if (window.i18n) {
        window.i18n.applyToContainer(controls);
    }
    
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
    updateUndoButtonState(); // 更新撤销按钮状态
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
    delayLabel.setAttribute('data-i18n', 'duration_label');
    delayLabel.textContent = window.i18n ? window.i18n.t('duration_label') : '时长';
    
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
    
    // 创建输入框和单位的行容器
    const delayInputRow = document.createElement('div');
    delayInputRow.className = 'delay-input-row';
    delayInputRow.appendChild(delayInput);
    delayInputRow.appendChild(delayUnit);
    
    frameDelayContainer.appendChild(delayLabel);
    frameDelayContainer.appendChild(delayInputRow);
    
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
    
    // 应用国际化到文件卡片
    if (window.i18n) {
        window.i18n.applyToContainer(fileItem);
    }
    
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
        const message = window.i18n ? window.i18n.t('status.select_frames_first') : '请先选择要复制的帧！';
        alert(message);
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
            if (window.i18n && window.i18n.getCurrentLanguage() === 'en') {
                const fileText = totalCount === 1 ? 'file' : 'files';
                infoElement.innerHTML = `
                    <span style="color: #666;">📊 Total ${totalCount} ${fileText}</span>
                    <span style="color: #999; margin-left: 10px;">No files selected</span>
                `;
            } else {
                infoElement.innerHTML = `
                    <span style="color: #666;">📊 总共 ${totalCount} 个文件</span>
                    <span style="color: #999; margin-left: 10px;">未选择任何文件</span>
                `;
            }
        } else {
            if (window.i18n && window.i18n.getCurrentLanguage() === 'en') {
                const selectedFileText = selectedCount === 1 ? 'file' : 'files';
                const totalFileText = totalCount === 1 ? 'file' : 'files';
                infoElement.innerHTML = `
                    <span style="color: #667eea; font-weight: 700;">✅ ${selectedCount} ${selectedFileText} selected</span>
                    <span style="color: #666; margin-left: 10px;">Total ${totalCount} ${totalFileText}</span>
                `;
            } else {
                infoElement.innerHTML = `
                    <span style="color: #667eea; font-weight: 700;">✅ 已选择 ${selectedCount} 个文件</span>
                    <span style="color: #666; margin-left: 10px;">总共 ${totalCount} 个文件</span>
                `;
            }
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
    console.log('执行撤销操作...');
    const lastOperation = AppCore.appState.undo();
    if (!lastOperation) {
        console.log('没有可撤销的操作');
        return false;
    }
    
    console.log('撤销操作类型:', lastOperation.type, '数据:', lastOperation.data);
    
    switch (lastOperation.type) {
        case 'paste':
            // 撤销粘贴：移除最后粘贴的文件
            const { fileCount, originalLength } = lastOperation.data;
            AppCore.appState.selectedFiles.splice(originalLength, fileCount);
            displayFileList();
            AppCore.notifyStateUpdate();
            if (window.FloatingStatus) {
                const message = window.i18n ? window.i18n.t('status.paste_undone') : '已撤销粘贴操作';
                FloatingStatus.show(message, 'success', 2000);
            }
            return true;
        case 'paste-at-position':
            // 撤销位置粘贴：移除在指定位置粘贴的文件
            const { targetIndex, fileCount: pasteCount } = lastOperation.data;
            const insertIndex = targetIndex + 1;
            AppCore.appState.selectedFiles.splice(insertIndex, pasteCount);
            AppCore.appState.clearSelections(); // 清除选择状态
            displayFileList();
            AppCore.notifyStateUpdate();
            if (window.FloatingStatus) {
                const message = window.i18n ? window.i18n.t('status.paste_undone') : '已撤销粘贴操作';
                FloatingStatus.show(message, 'success', 2000);
            }
            return true;
        case 'append-import':
            // 撤销追加导入：移除最后追加的文件
            const { fileCount: appendCount, originalLength: appendOrigLength } = lastOperation.data;
            AppCore.appState.selectedFiles.splice(appendOrigLength, appendCount);
            AppCore.appState.clearSelections(); // 清除选择状态
            displayFileList();
            AppCore.notifyStateUpdate();
            if (window.FloatingStatus) {
                const message = window.i18n ? window.i18n.t('status.import_undone') : '已撤销导入操作';
                FloatingStatus.show(message, 'success', 2000);
            }
            return true;
        case 'drag-sort':
            // 撤销拖拽排序：恢复原始文件顺序
            console.log('执行拖拽排序撤销');
            const { originalFiles } = lastOperation.data;
            if (originalFiles && Array.isArray(originalFiles)) {
                console.log('恢复原始文件顺序，文件数量:', originalFiles.length);
                AppCore.appState.selectedFiles = [...originalFiles];
                AppCore.appState.clearSelections(); // 清除选择状态
                displayFileList();
                AppCore.notifyStateUpdate();
                if (window.FloatingStatus) {
                    const message = window.i18n ? window.i18n.t('status.sort_undone') : '已撤销排序操作';
                    FloatingStatus.show(message, 'success', 2000);
                }
                console.log('拖拽排序撤销完成');
                return true;
            }
            console.error('撤销拖拽排序失败：originalFiles无效');
            return false;
        case 'delete':
            // 撤销删除：恢复被删除的文件
            console.log('执行删除撤销');
            const { selectedIndices, deletedFiles, deletedDelays } = lastOperation.data;
            if (deletedFiles && Array.isArray(deletedFiles) && selectedIndices && Array.isArray(selectedIndices)) {
                console.log('恢复被删除的文件，文件数量:', deletedFiles.length);
                
                // 按原始索引顺序恢复文件（从小到大排序）
                const sortedData = selectedIndices.map((index, i) => ({
                    index: index,
                    file: deletedFiles[i],
                    delay: deletedDelays ? deletedDelays[i] : 100
                })).sort((a, b) => a.index - b.index);
                
                // 从前往后插入文件，确保索引正确
                sortedData.forEach(({ index, file, delay }) => {
                    AppCore.appState.selectedFiles.splice(index, 0, file);
                    // 恢复帧延迟数据（frameDelays是对象，不是数组）
                    AppCore.appState.frameDelays[index] = delay;
                });
                
                // 重新索引frameDelays，因为插入操作可能影响后续索引
                AppCore.appState.reindexFrameDelays();
                
                AppCore.appState.clearSelections(); // 清除选择状态
                displayFileList();
                AppCore.notifyStateUpdate();
                
                if (window.FloatingStatus) {
                    const message = window.i18n ? window.i18n.t('status.delete_undone') : '已撤销删除操作';
                    FloatingStatus.show(message, 'success', 2000);
                }
                console.log('删除撤销完成');
                return true;
            }
            console.error('撤销删除失败：deletedFiles或selectedIndices无效');
            return false;
        default:
            updateUndoButtonState(); // 更新撤销按钮状态
            return false;
    }
    
    // 操作完成后更新撤销按钮状态
    updateUndoButtonState();
}

// 追加导入图片文件
function appendImportFiles() {
    // 创建隐藏的文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.png,.jpg,.jpeg,.webp';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    
    // 处理文件选择
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // 检查文件类型
            const invalidFiles = files.filter(file => 
                !file.type.includes('png') && 
                !file.type.includes('jpeg') && 
                !file.type.includes('jpg') && 
                !file.type.includes('webp')
            );
            if (invalidFiles.length > 0) {
                alert(`检测到 ${invalidFiles.length} 个不支持的文件格式！仅支持PNG、JPG、WebP格式。`);
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
                statusElement.textContent = `✅ 成功追加导入 ${files.length} 个图片文件！`;
                statusElement.style.color = '#4CAF50';
                
                // 3秒后清除状态
                setTimeout(() => {
                    statusElement.textContent = '';
                }, 3000);
            }
            
            console.log(`追加导入了 ${files.length} 个图片文件`);
        }
        
        // 清理输入元素
        document.body.removeChild(fileInput);
    });
    
    // 添加到DOM并触发点击
    document.body.appendChild(fileInput);
    fileInput.click();
}

// 更新撤销按钮状态
function updateUndoButtonState() {
    const undoBtn = document.getElementById('undo-btn');
    if (!undoBtn) return;
    
    const hasUndoableOperations = AppCore.appState.undoStack && AppCore.appState.undoStack.length > 0;
    
    if (hasUndoableOperations) {
        undoBtn.style.display = 'inline-block';
        // 更新按钮提示文本，显示可撤销的操作类型
        const lastOperation = AppCore.appState.undoStack[AppCore.appState.undoStack.length - 1];
        let tooltipKey = 'frame.controls.undo.tooltip';
        if (lastOperation) {
            switch (lastOperation.type) {
                case 'delete':
                    tooltipKey = 'frame.controls.undo.delete';
                    break;
                case 'drag-sort':
                    tooltipKey = 'frame.controls.undo.sort';
                    break;
                case 'paste':
                case 'paste-at-position':
                    tooltipKey = 'frame.controls.undo.paste';
                    break;
                case 'append-import':
                    tooltipKey = 'frame.controls.undo.import';
                    break;
            }
        }
        undoBtn.setAttribute('data-i18n-title', tooltipKey);
        if (window.i18n) {
            // 手动更新tooltip文本
            const tooltipText = window.i18n.t(tooltipKey);
            undoBtn.setAttribute('title', tooltipText);
            // 同时更新按钮文本内容以确保国际化
            const buttonText = window.i18n.t('frame.controls.undo');
            const span = undoBtn.querySelector('span[data-i18n="frame.controls.undo"]');
            if (span) {
                span.textContent = buttonText;
            }
        }
    } else {
        undoBtn.style.display = 'none';
    }
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
    updateUndoButtonState,
    updateSelectionUI,
    updateSelectionInfo
};
