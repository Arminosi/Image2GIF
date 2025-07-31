/**
 * 拖拽排序控制器
 * 处理文件项的拖拽排序功能
 */

class DragSortController {
    constructor() {
        this.draggedItem = null;
        this.draggedIndex = null;
        this.dragOverItem = null;
        this.isActive = false;
        this.originalOrder = [];
        
        this.init();
    }
    
    init() {
        // 绑定事件监听器
        this.boundDragStart = this.handleDragStart.bind(this);
        this.boundDragOver = this.handleDragOver.bind(this);
        this.boundDragEnter = this.handleDragEnter.bind(this);
        this.boundDragLeave = this.handleDragLeave.bind(this);
        this.boundDrop = this.handleDrop.bind(this);
        this.boundDragEnd = this.handleDragEnd.bind(this);
    }
    
    // 启用拖拽功能
    enableDragSort(fileGrid) {
        if (!fileGrid) {
            console.warn('fileGrid 不存在，无法启用拖拽排序');
            return;
        }
        
        console.log('启用拖拽排序功能...');
        
        const fileItems = fileGrid.querySelectorAll('.file-item');
        console.log(`找到 ${fileItems.length} 个文件项`);
        
        fileItems.forEach((item, index) => {
            this.setupDragEvents(item, index);
        });
        
        // 添加排序状态类
        fileGrid.classList.add('sorting-enabled');
        console.log('拖拽排序功能已启用');
    }
    
    // 设置单个文件项的拖拽事件
    setupDragEvents(fileItem, index) {
        // 启用拖拽
        fileItem.draggable = true;
        fileItem.setAttribute('draggable', 'true');
        
        console.log(`为第${index}个文件项启用拖拽:`, {
            element: fileItem,
            draggable: fileItem.draggable,
            draggableAttr: fileItem.getAttribute('draggable')
        });
        
        // 添加拖拽提示元素
        if (!fileItem.querySelector('.drag-hint')) {
            const dragHint = document.createElement('div');
            dragHint.className = 'drag-hint';
            dragHint.textContent = '🔄 拖拽到其他位置重新排序';
            fileItem.appendChild(dragHint);
        }
        
        // 绑定事件
        fileItem.addEventListener('dragstart', this.boundDragStart);
        fileItem.addEventListener('dragover', this.boundDragOver);
        fileItem.addEventListener('dragenter', this.boundDragEnter);
        fileItem.addEventListener('dragleave', this.boundDragLeave);
        fileItem.addEventListener('drop', this.boundDrop);
        fileItem.addEventListener('dragend', this.boundDragEnd);
        
        console.log(`拖拽事件已绑定到第${index}个文件项`);
        
        // 测试拖拽是否可用
        fileItem.addEventListener('mousedown', (e) => {
            console.log(`文件项${index}被鼠标按下，draggable=${fileItem.draggable}`);
        });
    }
    
    // 拖拽开始
    handleDragStart(e) {
        console.log('=== 拖拽开始事件触发 ===');
        console.log('事件目标:', e.target);
        console.log('事件类型:', e.type);
        
        this.isActive = true;
        this.draggedItem = e.target.closest('.file-item');
        
        if (!this.draggedItem) {
            console.error('无法找到文件项元素');
            return;
        }
        
        this.draggedIndex = parseInt(this.draggedItem.dataset.index);
        this.originalOrder = [...AppCore.appState.selectedFiles];
        
        console.log('开始拖拽:', {
            draggedIndex: this.draggedIndex,
            draggedItemClass: this.draggedItem.className,
            totalFiles: AppCore.appState.selectedFiles.length,
            datasetIndex: this.draggedItem.dataset.index
        });
        
        // 添加拖拽样式
        this.draggedItem.classList.add('dragging');
        
        // 设置拖拽数据
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.draggedItem.outerHTML);
        
        // 添加拖拽状态到容器
        const fileGrid = this.draggedItem.closest('.file-grid');
        if (fileGrid) {
            fileGrid.classList.add('sorting');
            console.log('已添加排序状态到网格');
        }
        
        console.log('拖拽初始化完成，索引:', this.draggedIndex);
    }
    
    // 拖拽悬停
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const currentItem = e.target.closest('.file-item');
        if (currentItem && currentItem !== this.draggedItem) {
            this.showInsertIndicator(currentItem, e);
        }
    }
    
    // 进入拖拽区域
    handleDragEnter(e) {
        e.preventDefault();
        const currentItem = e.target.closest('.file-item');
        if (currentItem && currentItem !== this.draggedItem) {
            // 清除之前的高亮
            this.clearAllHighlights();
            
            // 高亮当前目标
            currentItem.classList.add('swap-target');
            this.dragOverItem = currentItem;
            
            // 更新拖拽提示
            this.updateDragHint(currentItem, e);
        }
    }
    
    // 离开拖拽区域
    handleDragLeave(e) {
        const relatedTarget = e.relatedTarget;
        const currentItem = e.target.closest('.file-item');
        
        // 只有当真正离开文件项时才清除高亮
        if (currentItem && (!relatedTarget || !currentItem.contains(relatedTarget))) {
            this.clearAllHighlights();
            this.hideInsertIndicator();
        }
    }
    
    // 执行拖放
    handleDrop(e) {
        e.preventDefault();
        
        const dropTarget = e.target.closest('.file-item');
        if (!dropTarget || dropTarget === this.draggedItem) {
            this.resetDragState();
            return;
        }
        
        const targetIndex = parseInt(dropTarget.dataset.index);
        
        // 计算插入位置
        const insertIndex = this.calculateInsertPosition(dropTarget, e);
        
        // 执行重排序
        this.reorderFiles(this.draggedIndex, insertIndex);
        
        this.resetDragState();
    }
    
    // 拖拽结束
    handleDragEnd(e) {
        console.log('=== 拖拽结束 ===');
        
        // 移除网格的排序状态
        const fileGrid = document.querySelector('.file-grid');
        if (fileGrid) {
            fileGrid.classList.remove('sorting');
        }
        
        this.resetDragState();
    }
    
    // 显示拖放指示器
    showDropIndicator(targetItem, e) {
        this.hideDropIndicator();
        
        const rect = targetItem.getBoundingClientRect();
        const mouseX = e.clientX;
        const centerX = rect.left + rect.width / 2;
        
        let indicator = targetItem.querySelector('.sort-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'sort-indicator';
            targetItem.appendChild(indicator);
        }
        
        // 根据鼠标位置决定指示器位置
        if (mouseX < centerX) {
            indicator.classList.remove('right');
            indicator.classList.add('show');
        } else {
            indicator.classList.add('right');
            indicator.classList.add('show');
        }
    }
    
    // 计算插入位置
    calculateInsertPosition(targetItem, e) {
        const rect = targetItem.getBoundingClientRect();
        const mouseX = e.clientX;
        const centerX = rect.left + rect.width / 2;
        const targetIndex = parseInt(targetItem.dataset.index);
        
        // 如果鼠标在左半边，插入到目标项之前
        if (mouseX < centerX) {
            return targetIndex;
        } else {
            // 如果鼠标在右半边，插入到目标项之后
            return targetIndex + 1;
        }
    }
    
    // 隐藏拖放指示器
    hideDropIndicator() {
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.classList.remove('show');
        });
    }
    
    // 重新排序文件
    reorderFiles(fromIndex, toIndex) {
        console.log(`拖拽排序: 从索引 ${fromIndex} 插入到位置 ${toIndex}`);
        console.log('排序前的文件数组:', AppCore.appState.selectedFiles.map(f => f.name));
        
        // 保存操作到撤销栈
        if (typeof AppCore.saveOperation === 'function') {
            console.log('保存拖拽排序操作到撤销栈');
            AppCore.saveOperation('drag-sort', {
                fromIndex: fromIndex,
                toIndex: toIndex,
                originalFiles: [...AppCore.appState.selectedFiles]
            });
            console.log('撤销栈大小:', AppCore.appState.undoStack.length);
        } else {
            console.error('AppCore.saveOperation 不可用');
        }
        
        // 执行重排序 - 实现插入而不是替换
        const files = [...AppCore.appState.selectedFiles];
        const [movedFile] = files.splice(fromIndex, 1);
        
        // 调整插入位置，如果原位置在插入位置之前，需要减1
        let adjustedToIndex = toIndex;
        if (fromIndex < toIndex) {
            adjustedToIndex = toIndex - 1;
        }
        
        console.log(`调整后的插入位置: ${adjustedToIndex}`);
        
        files.splice(adjustedToIndex, 0, movedFile);
        
        // 更新应用状态
        AppCore.appState.selectedFiles = files;
        
        console.log('排序后的文件数组:', AppCore.appState.selectedFiles.map(f => f.name));
        
        // 更新选中状态索引
        this.updateSelectedIndicesForInsert(fromIndex, adjustedToIndex);
        
        // 触发状态更新通知
        if (typeof AppCore.notifyStateUpdate === 'function') {
            AppCore.notifyStateUpdate();
        }
        
        // 重新渲染文件列表
        if (typeof window.FileManager?.renderFileList === 'function') {
            console.log('调用 FileManager.renderFileList');
            window.FileManager.renderFileList();
        } else if (typeof renderFileList === 'function') {
            console.log('调用全局 renderFileList');
            renderFileList();
        } else {
            console.error('无法找到 renderFileList 函数');
        }
        
        console.log('文件插入排序完成');
    }
    
    // 更新选中状态索引（插入模式）
    updateSelectedIndicesForInsert(fromIndex, toIndex) {
        const newSelectedIndices = new Set();
        
        AppCore.appState.selectedIndices.forEach(index => {
            let newIndex = index;
            
            if (index === fromIndex) {
                // 被移动的项
                newIndex = toIndex;
            } else if (fromIndex < toIndex) {
                // 向后插入
                if (index > fromIndex && index <= toIndex) {
                    newIndex = index - 1;
                }
            } else {
                // 向前插入
                if (index >= toIndex && index < fromIndex) {
                    newIndex = index + 1;
                }
            }
            
            newSelectedIndices.add(newIndex);
        });
        
        AppCore.appState.selectedIndices = newSelectedIndices;
    }
    
    // 重置拖拽状态
    resetDragState() {
        // 移除拖拽样式
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('dragging', 'drag-over');
        });
        
        // 隐藏指示器
        this.hideDropIndicator();
        
        // 移除排序状态
        const fileGrid = document.querySelector('.file-grid');
        if (fileGrid) {
            fileGrid.classList.remove('sorting');
        }
        
        // 重置状态变量
        this.draggedItem = null;
        this.draggedIndex = null;
        this.dragOverItem = null;
        this.isActive = false;
    }
    
    // 禁用拖拽功能
    disableDragSort(fileGrid) {
        if (!fileGrid) return;
        
        const fileItems = fileGrid.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            item.draggable = false;
            item.setAttribute('draggable', 'false');
            
            // 移除事件监听器
            item.removeEventListener('dragstart', this.boundDragStart);
            item.removeEventListener('dragover', this.boundDragOver);
            item.removeEventListener('dragenter', this.boundDragEnter);
            item.removeEventListener('dragleave', this.boundDragLeave);
            item.removeEventListener('drop', this.boundDrop);
            item.removeEventListener('dragend', this.boundDragEnd);
            
            // 移除拖拽提示
            const dragHint = item.querySelector('.drag-hint');
            if (dragHint) {
                dragHint.remove();
            }
        });
        
        fileGrid.classList.remove('sorting-enabled');
    }
    
    // 显示插入指示器
    showInsertIndicator(targetItem, e) {
        this.hideInsertIndicator();
        
        const rect = targetItem.getBoundingClientRect();
        const mouseX = e.clientX;
        const centerX = rect.left + rect.width / 2;
        
        const indicator = document.createElement('div');
        indicator.className = 'insert-indicator active';
        indicator.id = 'drag-insert-indicator';
        
        if (mouseX < centerX) {
            indicator.classList.add('left');
        } else {
            indicator.classList.add('right');
        }
        
        targetItem.appendChild(indicator);
    }
    
    // 隐藏插入指示器
    hideInsertIndicator() {
        const existing = document.getElementById('drag-insert-indicator');
        if (existing) {
            existing.remove();
        }
    }
    
    // 清除所有高亮
    clearAllHighlights() {
        document.querySelectorAll('.file-item.swap-target, .file-item.drag-over').forEach(item => {
            item.classList.remove('swap-target', 'drag-over');
        });
    }
    
    // 更新拖拽提示
    updateDragHint(targetItem, e) {
        const dragHint = this.draggedItem.querySelector('.drag-hint');
        if (!dragHint) return;
        
        const rect = targetItem.getBoundingClientRect();
        const mouseX = e.clientX;
        const centerX = rect.left + rect.width / 2;
        const targetIndex = parseInt(targetItem.dataset.index);
        const currentIndex = this.draggedIndex;
        
        if (mouseX < centerX) {
            if (targetIndex < currentIndex) {
                dragHint.textContent = `📤 移动到第 ${targetIndex + 1} 位`;
            } else {
                dragHint.textContent = `📤 移动到第 ${targetIndex} 位`;
            }
        } else {
            if (targetIndex < currentIndex) {
                dragHint.textContent = `📤 移动到第 ${targetIndex + 2} 位`;
            } else {
                dragHint.textContent = `📤 移动到第 ${targetIndex + 1} 位`;
            }
        }
    }
    
    // 重置拖拽状态
    resetDragState() {
        if (this.draggedItem) {
            this.draggedItem.classList.remove('dragging');
            const dragHint = this.draggedItem.querySelector('.drag-hint');
            if (dragHint) {
                dragHint.textContent = '🔄 拖拽到其他位置重新排序';
            }
        }
        
        this.clearAllHighlights();
        this.hideInsertIndicator();
        
        this.draggedItem = null;
        this.draggedIndex = null;
        this.dragOverItem = null;
        this.isActive = false;
    }
}

// 创建全局实例
window.DragSortController = new DragSortController();
