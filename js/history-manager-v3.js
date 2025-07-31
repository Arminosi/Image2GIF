/**
 * 历史记录管理器 v3.0 - 全新分页设计
 * @description 完全重写的历史记录窗口，5个卡片分页设计
 */

class HistoryManagerV3 {
    constructor() {
        this.storageKey = 'gif_generation_history';
        this.maxHistoryItems = 100; // 最多保存100个历史记录
        this.itemsPerPage = 5; // 每页显示5个项目
        this.currentPage = 1; // 当前页码
        this.totalPages = 1; // 总页数
        this.isWindowOpen = false;
        this.historyData = [];
        
        this.init();
    }

    init() {
        this.loadHistoryData();
        this.createHistoryWindow();
        this.bindEvents();
    }

    /**
     * 加载历史数据
     */
    loadHistoryData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            const rawData = stored ? JSON.parse(stored) : [];
            
            // 清理和验证数据格式
            this.historyData = rawData.filter(item => {
                // 确保每个项目都有必需的属性
                return item && item.data && typeof item.data === 'string';
            }).map(item => {
                // 确保数据格式完整
                return {
                    id: item.id || Date.now(),
                    filename: item.filename || `gif_${Date.now()}.gif`,
                    data: item.data,
                    timestamp: item.timestamp || Date.now(),
                    size: item.size || 0,
                    delay: item.delay || 100,
                    frames: item.frames || 1,
                    sequenceFrames: item.sequenceFrames || []  // 新增：序列帧数据
                };
            });
            
            this.calculatePagination();
        } catch (error) {
            console.error('加载历史数据失败:', error);
            this.historyData = [];
            this.totalPages = 1;
        }
    }

    /**
     * 计算分页信息
     */
    calculatePagination() {
        this.totalPages = Math.max(1, Math.ceil(this.historyData.length / this.itemsPerPage));
        this.currentPage = Math.min(this.currentPage, this.totalPages);
    }

    /**
     * 创建历史窗口
     */
    createHistoryWindow() {
        // 移除旧窗口
        const existingOverlay = document.getElementById('history-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'history-overlay';
        overlay.className = 'history-overlay';
        
        overlay.innerHTML = `
            <div class="history-window" id="history-window">
                <div class="history-header">
                    <h3 class="history-title" data-i18n="history.title">历史记录</h3>
                    
                    <div class="header-controls">
                        <button class="clear-all-btn" id="clear-all-btn" data-i18n-title="history.clear.tooltip">
                            <span data-i18n="history.clear.button">🗑️ 清空全部</span>
                        </button>
                        
                        <div class="pagination-controls" id="pagination-controls">
                            <button class="page-nav-btn" id="first-page-btn" data-i18n-title="history.pagination.first">⏮</button>
                            <button class="page-nav-btn" id="prev-page-btn" data-i18n-title="history.pagination.prev">◀</button>
                            <input type="number" class="page-input" id="page-input" min="1" placeholder="1">
                            <span class="page-info" id="page-info">/ 1</span>
                            <button class="page-nav-btn" id="next-page-btn" data-i18n-title="history.pagination.next">▶</button>
                            <button class="page-nav-btn" id="last-page-btn" data-i18n-title="history.pagination.last">⏭</button>
                        </div>
                    </div>
                    
                    <button class="close-btn" id="close-history-btn" title="关闭">✕</button>
                </div>
                
                <div class="history-content">
                    <div class="history-stats" id="history-stats">
                        <div class="stats-item">
                            <span>总计:</span>
                            <span class="stats-value" id="total-count">0</span>
                            <span>个文件</span>
                        </div>
                        <div class="stats-item">
                            <span>当前页:</span>
                            <span class="stats-value" id="current-page-display">1</span>
                            <span>/</span>
                            <span class="stats-value" id="total-pages-display">1</span>
                        </div>
                        <div class="stats-item">
                            <span>总大小:</span>
                            <span class="stats-value" id="total-size">0 KB</span>
                        </div>
                    </div>
                    
                    <div class="cards-container">
                        <div class="cards-grid" id="cards-grid">
                            <!-- 卡片将在这里动态生成 -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        
        // 应用国际化
        if (window.i18n) {
            window.i18n.applyToContainer(overlay);
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const overlay = document.getElementById('history-overlay');
        const closeBtn = document.getElementById('close-history-btn');
        const clearAllBtn = document.getElementById('clear-all-btn');
        const firstPageBtn = document.getElementById('first-page-btn');
        const prevPageBtn = document.getElementById('prev-page-btn');
        const nextPageBtn = document.getElementById('next-page-btn');
        const lastPageBtn = document.getElementById('last-page-btn');
        const pageInput = document.getElementById('page-input');

        // 关闭窗口
        closeBtn.addEventListener('click', () => this.closeWindow());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeWindow();
        });

        // 清空全部按钮
        clearAllBtn.addEventListener('click', () => this.clearAllHistory());

        // 分页按钮
        firstPageBtn.addEventListener('click', () => this.goToPage(1));
        prevPageBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        nextPageBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        lastPageBtn.addEventListener('click', () => this.goToPage(this.totalPages));

        // 页码输入
        pageInput.addEventListener('change', (e) => {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= this.totalPages) {
                this.goToPage(page);
            }
        });

        pageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= this.totalPages) {
                    this.goToPage(page);
                }
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (!this.isWindowOpen) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.goToPage(this.currentPage - 1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.goToPage(this.currentPage + 1);
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToPage(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToPage(this.totalPages);
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.closeWindow();
                    break;
            }
        });
    }

    /**
     * 跳转到指定页面
     */
    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        
        this.currentPage = page;
        this.updateDisplay();
        this.updatePaginationControls();
    }

    /**
     * 更新分页控件状态
     */
    updatePaginationControls() {
        const firstPageBtn = document.getElementById('first-page-btn');
        const prevPageBtn = document.getElementById('prev-page-btn');
        const nextPageBtn = document.getElementById('next-page-btn');
        const lastPageBtn = document.getElementById('last-page-btn');
        const pageInput = document.getElementById('page-input');
        const pageInfo = document.getElementById('page-info');

        // 更新按钮状态
        firstPageBtn.disabled = this.currentPage === 1;
        prevPageBtn.disabled = this.currentPage === 1;
        nextPageBtn.disabled = this.currentPage === this.totalPages;
        lastPageBtn.disabled = this.currentPage === this.totalPages;

        // 更新页码显示
        pageInput.value = this.currentPage;
        pageInput.max = this.totalPages;
        pageInfo.textContent = `/ ${this.totalPages}`;

        // 更新统计信息
        document.getElementById('current-page-display').textContent = this.currentPage;
        document.getElementById('total-pages-display').textContent = this.totalPages;
    }

    /**
     * 更新显示内容
     */
    updateDisplay() {
        const cardsGrid = document.getElementById('cards-grid');
        const totalCount = document.getElementById('total-count');
        const totalSize = document.getElementById('total-size');

        // 更新统计信息
        totalCount.textContent = this.historyData.length;
        
        const totalSizeBytes = this.historyData.reduce((sum, item) => sum + (item.size || 0), 0);
        totalSize.textContent = this.formatSize(totalSizeBytes);

        // 清空现有内容
        cardsGrid.innerHTML = '';

        if (this.historyData.length === 0) {
            cardsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">📭</div>
                    <p class="empty-text" data-i18n="history.empty">暂无历史记录</p>
                </div>
            `;
            // 应用国际化到空状态
            if (window.i18n) {
                window.i18n.applyToContainer(cardsGrid);
            }
            return;
        }

        // 计算当前页数据
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.historyData.length);
        const pageData = this.historyData.slice(startIndex, endIndex);

        // 生成卡片
        pageData.forEach((item, index) => {
            const card = this.createHistoryCard(item, startIndex + index);
            cardsGrid.appendChild(card);
        });
    }

    /**
     * 创建历史卡片
     */
    createHistoryCard(item, index) {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.style.animationDelay = `${(index % this.itemsPerPage) * 0.05}s`;

        // 确保数据完整性
        const filename = item.filename || (window.i18n ? window.i18n.t('history.card.unnamed') : `未命名文件_${item.id || Date.now()}`);
        const createTime = new Date(item.timestamp || Date.now()).toLocaleString();
        const fileSize = this.formatSize(item.size || 0);
        const delay = item.delay || 100;
        
        // 处理帧数显示
        let framesDisplay = '';
        if (item.sequenceFrames && item.sequenceFrames.length > 0) {
            if (window.i18n && window.i18n.getCurrentLanguage() === 'en') {
                framesDisplay = `<span class="info-tag">🎞️ ${item.sequenceFrames.length} frames</span>`;
            } else {
                framesDisplay = `<span class="info-tag">🎞️ ${item.sequenceFrames.length}帧</span>`;
            }
        }

        card.innerHTML = `
            <div class="card-header">
                <h4 class="card-title">${filename}</h4>
            </div>
            
            <div class="card-content">
                <img src="${item.data}" alt="GIF预览" class="gif-preview">
                <div class="card-info">
                    <span class="info-tag">📅 ${createTime}</span>
                    <span class="info-tag">📦 ${fileSize}</span>
                    <span class="info-tag">⏱️ ${delay}ms</span>
                    ${framesDisplay}
                </div>
            </div>
            
            <div class="card-footer">
                <button class="card-btn btn-preview" data-action="preview" data-index="${index}" data-i18n="history.card.preview">
                    👁️ 预览
                </button>
                <button class="card-btn btn-download" data-action="download" data-index="${index}" data-i18n="history.card.download">
                    💾 下载
                </button>
                ${item.sequenceFrames && item.sequenceFrames.length > 0 ? 
                    `<button class="card-btn btn-import" data-action="import" data-index="${index}" data-i18n="history.card.import" title="${window.i18n && window.i18n.getCurrentLanguage() === 'en' ? `Import ${item.sequenceFrames.length} sequence frames` : `导入 ${item.sequenceFrames.length} 个序列帧`}">
                        📥 导入
                    </button>` : 
                    ''
                }
                <button class="card-btn btn-delete" data-action="delete" data-index="${index}" data-i18n="history.card.delete">
                    🗑️ 删除
                </button>
            </div>
        `;

        // 应用国际化
        if (window.i18n) {
            window.i18n.applyToContainer(card);
        }

        // 绑定卡片事件
        card.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const itemIndex = parseInt(e.target.dataset.index);
            
            if (action && itemIndex !== undefined) {
                this.handleCardAction(action, itemIndex, item);
            }
        });

        return card;
    }

    /**
     * 处理卡片操作
     */
    handleCardAction(action, index, item) {
        switch (action) {
            case 'preview':
                this.previewItem(item);
                break;
            case 'download':
                this.downloadItem(item);
                break;
            case 'import':
                this.importSequence(item);
                break;
            case 'delete':
                this.deleteItem(index);
                break;
        }
    }

    /**
     * 预览项目
     */
    previewItem(item) {
        const blob = this.base64ToBlob(item.data);
        const url = URL.createObjectURL(blob);
        
        const preview = window.open('', '_blank', 'width=600,height=400');
        preview.document.write(`
            <html>
                <head>
                    <title>GIF预览 - ${item.filename}</title>
                    <style>
                        body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 40px); font-family: Arial, sans-serif; }
                        img { max-width: 100%; max-height: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
                    </style>
                </head>
                <body>
                    <img src="${url}" alt="GIF预览">
                </body>
            </html>
        `);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /**
     * 下载项目
     */
    downloadItem(item) {
        const blob = this.base64ToBlob(item.data);
        const url = URL.createObjectURL(blob);
        const filename = item.filename || `gif_${item.id || Date.now()}.gif`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        // 显示下载成功消息
        if (window.FloatingStatus) {
            const message = window.i18n ? window.i18n.t('status.downloaded') : '已下载:';
            FloatingStatus.show(`${message} ${filename}`, 'success', 2000);
        }
    }

    /**
     * 删除项目
     */
    deleteItem(index) {
        const globalIndex = (this.currentPage - 1) * this.itemsPerPage + index;
        const item = this.historyData[globalIndex];
        const filename = item.filename || `未命名文件_${item.id || Date.now()}`;
        
        if (confirm(`确定要删除 "${filename}" 吗？`)) {
            this.historyData.splice(globalIndex, 1);
            this.saveHistoryData();
            this.calculatePagination();
            
            // 如果当前页没有数据了，跳转到上一页
            if (this.currentPage > this.totalPages) {
                this.currentPage = Math.max(1, this.totalPages);
            }
            
            this.updateDisplay();
            this.updatePaginationControls();
            
            if (window.FloatingStatus) {
                const message = window.i18n ? window.i18n.t('status.deleted') : '已删除:';
                FloatingStatus.show(`${message} ${filename}`, 'success', 2000);
            }
        }
    }

    /**
     * 保存历史数据
     */
    saveHistoryData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.historyData));
        } catch (error) {
            console.error('保存历史数据失败:', error);
        }
    }

    /**
     * 添加新的历史记录
     */
    addHistoryItem(gifData, filename, options = {}) {
        const newItem = {
            id: Date.now(),
            filename: filename,
            data: gifData,
            timestamp: Date.now(),
            size: this.getDataSize(gifData),
            delay: options.delay || 100,
            frames: options.frames || 1,
            sequenceFrames: options.sequenceFrames || []  // 新增：保存序列帧数据
        };

        this.historyData.unshift(newItem);
        
        // 限制历史记录数量
        if (this.historyData.length > this.maxHistoryItems) {
            this.historyData = this.historyData.slice(0, this.maxHistoryItems);
        }

        this.saveHistoryData();
        this.calculatePagination();

        if (this.isWindowOpen) {
            this.goToPage(1); // 跳转到第一页显示新项目
        }
    }

    /**
     * 打开历史窗口
     */
    openWindow() {
        this.loadHistoryData();
        this.updateDisplay();
        this.updatePaginationControls();
        
        const overlay = document.getElementById('history-overlay');
        overlay.classList.add('show');
        this.isWindowOpen = true;
    }

    /**
     * 关闭历史窗口
     */
    closeWindow() {
        const overlay = document.getElementById('history-overlay');
        overlay.classList.remove('show');
        this.isWindowOpen = false;
    }

    /**
     * 工具方法
     */
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    getDataSize(base64Data) {
        if (!base64Data) return 0;
        const data = base64Data.split(',')[1] || base64Data;
        return Math.floor(data.length * 0.75);
    }

    base64ToBlob(base64) {
        const [header, data] = base64.split(',');
        const mime = header.match(/:(.*?);/)[1];
        const binary = atob(data);
        const array = new Uint8Array(binary.length);
        
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }
        
        return new Blob([array], { type: mime });
    }

    /**
     * 导入序列帧到主页面
     */
    async importSequence(item) {
        if (!item.sequenceFrames || item.sequenceFrames.length === 0) {
            if (window.FloatingStatus) {
                const message = window.i18n ? window.i18n.t('status.no_frame_data') : '该历史记录没有保存序列帧数据';
                FloatingStatus.show(message, 'warning', 3000);
            } else {
                const message = window.i18n ? window.i18n.t('status.no_frame_data') : '该历史记录没有保存序列帧数据';
                alert(message);
            }
            return;
        }

        try {
            console.log('开始导入序列帧:', item.sequenceFrames.length, '个帧');
            
            // 清空当前文件列表
            if (window.AppCore && window.AppCore.appState) {
                window.AppCore.appState.reset();
            }

            // 创建文件对象数组
            const files = [];
            for (let i = 0; i < item.sequenceFrames.length; i++) {
                const frame = item.sequenceFrames[i];
                
                // 将base64转换为文件对象
                const response = await fetch(frame.data);
                const blob = await response.blob();
                const file = new File([blob], frame.name, { type: 'image/png' });
                
                files.push(file);
            }

            console.log('创建了', files.length, '个文件对象');

            // 使用文件管理器的标准处理流程
            if (window.FileManager && window.FileManager.handleFileSelection) {
                // 调用文件管理器的处理函数，这会自动更新UI
                window.FileManager.handleFileSelection(files);
                
                console.log('已调用FileManager.handleFileSelection');
            } else {
                // 备用方案：手动处理
                if (window.AppCore && window.AppCore.appState) {
                    window.AppCore.appState.selectedFiles = files;
                    
                    // 手动显示文件列表
                    if (window.FileManager && window.FileManager.displayFileList) {
                        window.FileManager.displayFileList();
                    }
                    
                    // 启用生成按钮
                    const generateBtn = document.getElementById('generate-btn');
                    if (generateBtn) {
                        generateBtn.disabled = false;
                    }
                }
            }

            // 恢复每帧的时间间隔设置
            setTimeout(() => {
                if (window.AppCore && window.AppCore.appState) {
                    console.log('开始恢复每帧时长设置...');
                    
                    // 恢复每帧的时间间隔数据
                    item.sequenceFrames.forEach((frame, index) => {
                        if (frame.delay) {
                            window.AppCore.appState.frameDelays[index] = frame.delay;
                            console.log(`恢复第${index}帧时长: ${frame.delay}ms (文件: ${frame.name})`);
                        }
                    });
                    
                    console.log('当前frameDelays状态:', window.AppCore.appState.frameDelays);
                    
                    // 更新UI中每个文件卡片的时长输入框
                    this.updateFrameDelayInputs(item.sequenceFrames);
                    
                    // 更新UI中显示的帧间隔到平均值
                    const avgDelay = item.sequenceFrames.reduce((sum, frame) => sum + (frame.delay || item.delay), 0) / item.sequenceFrames.length;
                    const delaySlider = document.getElementById('frame-delay');
                    const delayValue = document.getElementById('delay-value');
                    if (delaySlider && delayValue) {
                        delaySlider.value = Math.round(avgDelay);
                        delayValue.textContent = Math.round(avgDelay);
                        console.log(`设置全局平均时长: ${Math.round(avgDelay)}ms`);
                    }

                    console.log('完成序列帧导入和设置，已恢复每帧时长');
                }
            }, 200); // 增加延迟时间，确保UI完全渲染完成

            // 关闭历史窗口
            this.closeWindow();

            if (window.FloatingStatus) {
                const message = window.i18n ? window.i18n.t('status.import_success', { count: files.length }) : `成功导入 ${files.length} 个序列帧`;
                FloatingStatus.show(message, 'success', 3000);
            }
        } catch (error) {
            console.error('导入序列帧失败:', error);
            if (window.FloatingStatus) {
                const errorMessage = window.i18n ? window.i18n.t('status.import_failed') : '导入序列帧失败:';
                FloatingStatus.show(`${errorMessage} ${error.message}`, 'error', 3000);
            } else {
                const errorMessage = window.i18n ? window.i18n.t('status.import_failed') : '导入序列帧失败:';
                alert(`${errorMessage} ${error.message}`);
            }
        }
    }

    /**
     * 更新文件卡片中的时长输入框
     */
    updateFrameDelayInputs(sequenceFrames) {
        try {
            // 等待UI渲染完成后更新输入框
            setTimeout(() => {
                sequenceFrames.forEach((frame, index) => {
                    if (frame.delay) {
                        // 查找对应的时长输入框
                        const fileCards = document.querySelectorAll('.file-card');
                        if (fileCards[index]) {
                            const delayInput = fileCards[index].querySelector('.frame-delay-input');
                            if (delayInput) {
                                delayInput.value = frame.delay;
                                console.log(`更新第${index}帧时长输入框: ${frame.delay}ms`);
                            }
                        }
                    }
                });
            }, 50);
        } catch (error) {
            console.warn('更新时长输入框时出错:', error);
        }
    }

    /**
     * 清空所有历史记录
     */
    clearAllHistory() {
        if (this.historyData.length === 0) {
            if (window.FloatingStatus) {
                const message = window.i18n ? window.i18n.t('status.no_history_to_clear') : '没有历史记录需要清空';
                FloatingStatus.show(message, 'info', 2000);
            } else {
                const message = window.i18n ? window.i18n.t('status.no_history_to_clear') : '没有历史记录需要清空';
                alert(message);
            }
            return;
        }

        const totalCount = this.historyData.length;
        const confirmMsg = `确定要清空所有 ${totalCount} 个历史记录吗？\n\n此操作不可撤销！`;
        
        if (confirm(confirmMsg)) {
            this.historyData = [];
            this.saveHistoryData();
            this.calculatePagination();
            this.currentPage = 1;
            this.updateDisplay();
            this.updatePaginationControls();
            
            if (window.FloatingStatus) {
                const message = window.i18n ? window.i18n.t('status.history_cleared', { count: totalCount }) : `已清空 ${totalCount} 个历史记录`;
                FloatingStatus.show(message, 'success', 3000);
            } else {
                const message = window.i18n ? window.i18n.t('status.history_cleared', { count: totalCount }) : `已清空 ${totalCount} 个历史记录`;
                alert(message);
            }
        }
    }
}

// 创建全局实例
window.HistoryManagerV3 = new HistoryManagerV3();
