/**
 * 历史记录管理器
 * @description 管理GIF生成历史，提供本地存储和展示功能，包含自定义滚动条
 */

class HistoryManager {
    constructor() {
        this.storageKey = 'gif_generation_history';
        this.maxHistoryItems = 50; // 最多保存50个历史记录
        this.isWindowOpen = false;
        
        // 滚动相关属性
        this.scrollPosition = 0;
        this.maxScrollPosition = 0;
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartScrollTop = 0;
        this.indicatorTimeout = null;
        
        this.init();
    }
    
    init() {
        this.createHistoryWindow();
        this.bindEvents();
        this.initCustomScrollbar();
    }

    /**
     * 创建历史窗口HTML结构
     */
    createHistoryWindow() {
        const historyHTML = `
            <div id="history-window" class="history-window" style="display: none;">
                <div class="history-window-header">
                    <h3>GIF生成历史</h3>
                    <div class="history-window-controls">
                        <button id="clear-history-btn" class="control-btn clear-btn" title="清空历史">
                            🗑️ 清空
                        </button>
                        <button id="close-history-btn" class="control-btn close-btn" title="关闭窗口">
                            ✕ 关闭
                        </button>
                    </div>
                </div>
                <div class="history-window-content">
                    <div id="history-stats" class="history-stats">
                        <span id="history-count">📊 共 0 个历史记录</span>
                        <span id="total-size">💾 总大小: 0 KB</span>
                    </div>
                    <div class="history-list-container">
                        <div id="history-list" class="history-list">
                            <div class="history-empty">
                                <span>🎬</span>
                                <p>暂无生成记录<br/>生成GIF后会自动保存到历史记录</p>
                            </div>
                        </div>
                        <div class="custom-scrollbar" id="custom-scrollbar">
                            <div class="scroll-button up" id="scroll-up">▲</div>
                            <div class="scrollbar-track">
                                <div class="scrollbar-thumb" id="scrollbar-thumb"></div>
                            </div>
                            <div class="scroll-button down" id="scroll-down">▼</div>
                        </div>
                        <div class="scroll-indicator" id="scroll-indicator">1 / 1</div>
                    </div>
                </div>
            </div>
            <div id="history-overlay" class="history-overlay" style="display: none;"></div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', historyHTML);
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 关闭窗口
        const closeBtn = document.getElementById('close-history-btn');
        const overlay = document.getElementById('history-overlay');
        
        closeBtn.addEventListener('click', () => this.closeWindow());
        overlay.addEventListener('click', () => this.closeWindow());
        
        // 清空历史
        const clearBtn = document.getElementById('clear-history-btn');
        clearBtn.addEventListener('click', () => this.clearHistory());
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isWindowOpen) {
                this.closeWindow();
            }
        });
    }

    /**
     * 初始化自定义滚动条
     */
    initCustomScrollbar() {
        this.bindScrollbarEvents();
    }

    /**
     * 绑定滚动条事件
     */
    bindScrollbarEvents() {
        const scrollUp = document.getElementById('scroll-up');
        const scrollDown = document.getElementById('scroll-down');
        const scrollbarThumb = document.getElementById('scrollbar-thumb');
        const scrollbarTrack = scrollbarThumb.parentElement;
        const historyList = document.getElementById('history-list');

        // 向上滚动按钮
        scrollUp.addEventListener('click', () => {
            this.scrollByAmount(-80);
        });

        // 向下滚动按钮
        scrollDown.addEventListener('click', () => {
            this.scrollByAmount(80);
        });

        // 滚动条拖拽
        scrollbarThumb.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragStartY = e.clientY;
            this.dragStartScrollTop = this.scrollPosition;
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        // 滚动条轨道点击
        scrollbarTrack.addEventListener('click', (e) => {
            if (e.target === scrollbarTrack) {
                const trackRect = scrollbarTrack.getBoundingClientRect();
                const clickY = e.clientY - trackRect.top;
                const trackHeight = trackRect.height;
                const thumbHeight = scrollbarThumb.offsetHeight;
                
                const newScrollRatio = (clickY - thumbHeight / 2) / (trackHeight - thumbHeight);
                const newScrollPosition = Math.max(0, Math.min(this.maxScrollPosition, newScrollRatio * this.maxScrollPosition));
                
                this.updateScrollPosition(newScrollPosition);
            }
        });

        // 鼠标移动和释放事件
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaY = e.clientY - this.dragStartY;
                const trackHeight = scrollbarTrack.offsetHeight - scrollbarThumb.offsetHeight;
                const scrollRatio = deltaY / trackHeight;
                const newScrollPosition = this.dragStartScrollTop + (scrollRatio * this.maxScrollPosition);
                
                this.updateScrollPosition(Math.max(0, Math.min(this.maxScrollPosition, newScrollPosition)));
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                document.body.style.userSelect = '';
            }
        });

        // 鼠标滚轮事件
        historyList.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.scrollByAmount(e.deltaY);
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.isWindowOpen) {
                switch(e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        this.scrollByAmount(-40);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.scrollByAmount(40);
                        break;
                    case 'PageUp':
                        e.preventDefault();
                        this.scrollByAmount(-200);
                        break;
                    case 'PageDown':
                        e.preventDefault();
                        this.scrollByAmount(200);
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.updateScrollPosition(0);
                        break;
                    case 'End':
                        e.preventDefault();
                        this.updateScrollPosition(this.maxScrollPosition);
                        break;
                }
            }
        });
    }

    /**
     * 按指定量滚动
     */
    scrollByAmount(amount) {
        const newPosition = this.scrollPosition + amount;
        this.updateScrollPosition(Math.max(0, Math.min(this.maxScrollPosition, newPosition)));
    }

    /**
     * 更新滚动位置
     */
    updateScrollPosition(position) {
        this.scrollPosition = position;
        
        const historyList = document.getElementById('history-list');
        const scrollbarThumb = document.getElementById('scrollbar-thumb');
        const scrollbarTrack = scrollbarThumb.parentElement;
        
        // 更新内容位置
        historyList.style.transform = `translateY(-${position}px)`;
        
        // 更新滚动条滑块位置
        if (this.maxScrollPosition > 0) {
            const scrollRatio = position / this.maxScrollPosition;
            const trackHeight = scrollbarTrack.offsetHeight;
            const thumbHeight = scrollbarThumb.offsetHeight;
            const thumbTop = scrollRatio * (trackHeight - thumbHeight);
            
            scrollbarThumb.style.top = `${thumbTop}px`;
        }
        
        // 更新滚动指示器
        this.updateScrollIndicator();
    }

    /**
     * 更新滚动指示器
     */
    updateScrollIndicator() {
        const scrollIndicator = document.getElementById('scroll-indicator');
        const historyList = document.getElementById('history-list');
        const items = historyList.querySelectorAll('.history-item');
        
        if (items.length === 0) {
            scrollIndicator.classList.remove('show');
            return;
        }
        
        // 计算当前可见的项目范围
        const containerHeight = historyList.parentElement.offsetHeight;
        const visibleStart = Math.floor(this.scrollPosition / 100) + 1; // 假设每个项目约100px高
        const visibleEnd = Math.min(items.length, visibleStart + Math.floor(containerHeight / 100));
        
        scrollIndicator.textContent = `${visibleStart}-${visibleEnd} / ${items.length}`;
        scrollIndicator.classList.add('show');
        
        // 3秒后隐藏指示器
        clearTimeout(this.indicatorTimeout);
        this.indicatorTimeout = setTimeout(() => {
            scrollIndicator.classList.remove('show');
        }, 3000);
    }

    /**
     * 计算滚动范围
     */
    calculateScrollRange() {
        const historyList = document.getElementById('history-list');
        const container = historyList.parentElement;
        const customScrollbar = document.getElementById('custom-scrollbar');
        
        const contentHeight = historyList.scrollHeight;
        const containerHeight = container.offsetHeight;
        
        this.maxScrollPosition = Math.max(0, contentHeight - containerHeight);
        
        // 显示或隐藏滚动条
        if (this.maxScrollPosition > 0) {
            customScrollbar.classList.add('visible');
            this.updateScrollbarThumbSize();
        } else {
            customScrollbar.classList.remove('visible');
            this.updateScrollPosition(0);
        }
    }

    /**
     * 更新滚动条滑块大小
     */
    updateScrollbarThumbSize() {
        const scrollbarThumb = document.getElementById('scrollbar-thumb');
        const scrollbarTrack = scrollbarThumb.parentElement;
        const historyList = document.getElementById('history-list');
        const container = historyList.parentElement;
        
        const contentHeight = historyList.scrollHeight;
        const containerHeight = container.offsetHeight;
        const trackHeight = scrollbarTrack.offsetHeight;
        
        const thumbHeight = Math.max(30, (containerHeight / contentHeight) * trackHeight);
        scrollbarThumb.style.height = `${thumbHeight}px`;
    }

    /**
     * 打开历史窗口
     */
    openWindow() {
        const window = document.getElementById('history-window');
        const overlay = document.getElementById('history-overlay');
        
        this.loadHistory();
        
        overlay.style.display = 'block';
        window.style.display = 'block';
        this.isWindowOpen = true;
        
        // 添加动画
        requestAnimationFrame(() => {
            overlay.classList.add('show');
            window.classList.add('show');
        });
        
        FloatingStatus.info('历史记录窗口已打开', 2000);
    }

    /**
     * 关闭历史窗口
     */
    closeWindow() {
        const window = document.getElementById('history-window');
        const overlay = document.getElementById('history-overlay');
        
        overlay.classList.remove('show');
        window.classList.remove('show');
        
        setTimeout(() => {
            overlay.style.display = 'none';
            window.style.display = 'none';
            this.isWindowOpen = false;
        }, 300);
    }

    /**
     * 保存GIF到历史记录
     * @param {Blob} blob - GIF文件blob
     * @param {Object} metadata - 元数据信息
     */
    async saveToHistory(blob, metadata = {}) {
        try {
            const history = this.getHistory();
            
            // 创建历史记录项
            const historyItem = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                size: blob.size,
                frameCount: metadata.frameCount || 0,
                delay: metadata.delay || 100,
                dimensions: metadata.dimensions || { width: 0, height: 0 },
                fileName: metadata.fileName || `animation_${Date.now()}.gif`,
                // 将blob转为base64存储
                data: await this.blobToBase64(blob)
            };
            
            // 添加到历史记录开头
            history.unshift(historyItem);
            
            // 限制历史记录数量
            if (history.length > this.maxHistoryItems) {
                history.splice(this.maxHistoryItems);
            }
            
            // 保存到localStorage
            this.saveHistory(history);
            
            FloatingStatus.success(`已保存到历史记录 (${this.formatSize(blob.size)})`, 3000);
            
            // 如果窗口打开，刷新显示
            if (this.isWindowOpen) {
                this.loadHistory();
            }
        } catch (error) {
            console.error('保存历史记录失败:', error);
            FloatingStatus.error('保存历史记录失败', 3000);
        }
    }

    /**
     * 从localStorage获取历史记录
     */
    getHistory() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('读取历史记录失败:', error);
            return [];
        }
    }

    /**
     * 保存历史记录到localStorage
     */
    saveHistory(history) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(history));
        } catch (error) {
            console.error('保存历史记录失败:', error);
            // 如果存储空间不足，删除最老的记录
            if (error.name === 'QuotaExceededError') {
                history.splice(-10); // 删除最后10条记录
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(history));
                    FloatingStatus.warning('存储空间不足，已删除部分旧记录', 4000);
                } catch (e) {
                    FloatingStatus.error('存储空间严重不足，无法保存历史记录', 5000);
                }
            }
        }
    }

    /**
     * 加载并显示历史记录
     */
    loadHistory() {
        const history = this.getHistory();
        const listContainer = document.getElementById('history-list');
        const countElement = document.getElementById('history-count');
        const sizeElement = document.getElementById('total-size');
        
        // 更新统计信息
        const totalSize = history.reduce((sum, item) => sum + item.size, 0);
        countElement.textContent = `📊 共 ${history.length} 个历史记录`;
        sizeElement.textContent = `💾 总大小: ${this.formatSize(totalSize)}`;
        
        if (history.length === 0) {
            listContainer.innerHTML = `
                <div class="history-empty">
                    <span>🎬</span>
                    <p>暂无生成记录<br/>生成GIF后会自动保存到历史记录</p>
                </div>
            `;
            return;
        }
        
        // 生成历史记录列表
        const historyHTML = history.map(item => this.createHistoryItemHTML(item)).join('');
        listContainer.innerHTML = historyHTML;
        
        // 绑定历史记录项的事件
        this.bindHistoryItemEvents();
        
        // 重新计算滚动范围
        setTimeout(() => {
            this.calculateScrollRange();
        }, 100);
    }

    /**
     * 创建历史记录项HTML
     */
    createHistoryItemHTML(item) {
        const date = new Date(item.timestamp);
        const timeString = date.toLocaleString('zh-CN');
        
        return `
            <div class="history-item" data-id="${item.id}">
                <div class="history-item-preview">
                    <img src="${item.data}" alt="GIF预览" class="history-gif-preview" />
                </div>
                <div class="history-item-info">
                    <div class="history-item-title">${item.fileName}</div>
                    <div class="history-item-meta">
                        <span>📅 ${timeString}</span>
                        <span>📐 ${item.dimensions.width}×${item.dimensions.height}</span>
                        <span>🎞️ ${item.frameCount}帧</span>
                        <span>⏱️ ${item.delay}ms</span>
                        <span>📊 ${this.formatSize(item.size)}</span>
                    </div>
                </div>
                <div class="history-item-actions">
                    <button class="history-action-btn download-btn" data-action="download" title="下载到本地">
                        📥
                    </button>
                    <button class="history-action-btn copy-btn" data-action="copy" title="复制到剪贴板">
                        📋
                    </button>
                    <button class="history-action-btn delete-btn" data-action="delete" title="删除记录">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 绑定历史记录项事件
     */
    bindHistoryItemEvents() {
        const listContainer = document.getElementById('history-list');
        
        listContainer.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const itemElement = e.target.closest('.history-item');
            
            if (!action || !itemElement) return;
            
            const itemId = parseInt(itemElement.dataset.id);
            const history = this.getHistory();
            const item = history.find(h => h.id === itemId);
            
            if (!item) return;
            
            switch (action) {
                case 'download':
                    this.downloadHistoryItem(item);
                    break;
                case 'copy':
                    this.copyHistoryItem(item);
                    break;
                case 'delete':
                    this.deleteHistoryItem(itemId);
                    break;
            }
        });
    }

    /**
     * 下载历史记录项
     */
    downloadHistoryItem(item) {
        try {
            const blob = this.base64ToBlob(item.data);
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = item.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            FloatingStatus.success(`已下载: ${item.fileName}`, 3000);
        } catch (error) {
            console.error('下载失败:', error);
            FloatingStatus.error('下载失败', 3000);
        }
    }

    /**
     * 复制历史记录项到剪贴板
     */
    async copyHistoryItem(item) {
        try {
            const blob = this.base64ToBlob(item.data);
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/gif': blob })
            ]);
            FloatingStatus.success('已复制到剪贴板', 3000);
        } catch (error) {
            console.error('复制失败:', error);
            FloatingStatus.error('复制失败，浏览器不支持或权限不足', 3000);
        }
    }

    /**
     * 删除历史记录项
     */
    deleteHistoryItem(itemId) {
        if (!confirm('确定要删除这个历史记录吗？')) return;
        
        const history = this.getHistory();
        const newHistory = history.filter(item => item.id !== itemId);
        this.saveHistory(newHistory);
        this.loadHistory();
        
        FloatingStatus.success('已删除历史记录', 2000);
    }

    /**
     * 清空所有历史记录
     */
    clearHistory() {
        if (!confirm('确定要清空所有历史记录吗？此操作不可恢复！')) return;
        
        localStorage.removeItem(this.storageKey);
        this.loadHistory();
        FloatingStatus.success('历史记录已清空', 3000);
    }

    /**
     * Blob转Base64
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Base64转Blob
     */
    base64ToBlob(base64) {
        const arr = base64.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    /**
     * 格式化文件大小
     */
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 创建全局实例
window.HistoryManager = new HistoryManager();
