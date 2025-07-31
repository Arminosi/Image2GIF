/**
 * 悬浮状态提示系统
 * @description 右上角悬浮的状态消息提示，支持多种类型和自动消失
 */

class FloatingStatusManager {
    constructor() {
        this.container = null;
        this.messageQueue = [];
        this.activeMessages = new Map();
        this.messageCounter = 0;
        this.init();
    }
    
    init() {
        this.container = document.getElementById('floating-status-container');
        if (!this.container) {
            console.warn('悬浮状态容器未找到');
        }
    }
    
    /**
     * 显示状态消息
     * @param {string} text - 消息文本
     * @param {string} type - 消息类型：'success', 'error', 'warning', 'info', 'processing'
     * @param {number} duration - 显示时长（毫秒），0表示不自动消失
     * @param {Object} options - 额外选项
     */
    show(text, type = 'info', duration = 3000, options = {}) {
        if (!this.container) return null;
        
        const messageId = `status-${++this.messageCounter}`;
        const messageElement = this.createMessageElement(messageId, text, type, options);
        
        // 添加到容器
        this.container.appendChild(messageElement);
        this.activeMessages.set(messageId, messageElement);
        
        // 触发显示动画
        requestAnimationFrame(() => {
            messageElement.classList.add('show');
        });
        
        // 设置自动消失
        if (duration > 0) {
            setTimeout(() => {
                this.hide(messageId);
            }, duration);
        }
        
        return messageId;
    }
    
    /**
     * 创建消息元素
     */
    createMessageElement(messageId, text, type, options) {
        const messageElement = document.createElement('div');
        messageElement.className = `floating-status-message ${type}`;
        messageElement.id = messageId;
        
        // 图标映射
        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            processing: '⏳'
        };
        
        const icon = options.icon || iconMap[type] || 'ℹ️';
        
        messageElement.innerHTML = `
            <div class="floating-status-icon">${icon}</div>
            <div class="floating-status-text">${text}</div>
            ${options.progress !== undefined ? this.createProgressBar(options.progress) : ''}
        `;
        
        return messageElement;
    }
    
    /**
     * 创建进度条
     */
    createProgressBar(progress = 0) {
        return `
            <div class="mini-progress">
                <div class="mini-progress-bar" style="width: ${progress}%"></div>
            </div>
        `;
    }
    
    /**
     * 隐藏消息
     */
    hide(messageId) {
        const messageElement = this.activeMessages.get(messageId);
        if (!messageElement) return;
        
        messageElement.classList.remove('show');
        messageElement.classList.add('hide');
        
        // 移除元素
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
            this.activeMessages.delete(messageId);
        }, 400);
    }
    
    /**
     * 更新消息内容
     */
    update(messageId, text, options = {}) {
        const messageElement = this.activeMessages.get(messageId);
        if (!messageElement) return;
        
        const textElement = messageElement.querySelector('.floating-status-text');
        if (textElement) {
            textElement.textContent = text;
        }
        
        // 更新进度条
        if (options.progress !== undefined) {
            let progressBar = messageElement.querySelector('.mini-progress-bar');
            if (!progressBar && options.progress !== undefined) {
                // 如果没有进度条，创建一个
                const progressContainer = document.createElement('div');
                progressContainer.innerHTML = this.createProgressBar(options.progress);
                messageElement.appendChild(progressContainer.firstElementChild);
                progressBar = messageElement.querySelector('.mini-progress-bar');
            }
            if (progressBar) {
                progressBar.style.width = `${Math.min(100, Math.max(0, options.progress))}%`;
            }
        }
        
        // 更新图标
        if (options.icon) {
            const iconElement = messageElement.querySelector('.floating-status-icon');
            if (iconElement) {
                iconElement.textContent = options.icon;
            }
        }
    }
    
    /**
     * 清除所有消息
     */
    clearAll() {
        this.activeMessages.forEach((messageElement, messageId) => {
            this.hide(messageId);
        });
    }
    
    /**
     * 便捷方法
     */
    success(text, duration = 3000, options = {}) {
        return this.show(text, 'success', duration, options);
    }
    
    error(text, duration = 5000, options = {}) {
        return this.show(text, 'error', duration, options);
    }
    
    warning(text, duration = 4000, options = {}) {
        return this.show(text, 'warning', duration, options);
    }
    
    info(text, duration = 3000, options = {}) {
        return this.show(text, 'info', duration, options);
    }
    
    processing(text, duration = 0, options = {}) {
        return this.show(text, 'processing', duration, options);
    }
    
    /**
     * 显示带进度条的消息
     * @param {string} text - 基础文本
     * @param {number} current - 当前进度值
     * @param {number} total - 总进度值
     * @param {string} messageId - 消息ID，用于更新同一条消息
     * @returns {string} 消息ID
     */
    progress(text, current, total, messageId = null) {
        const percent = Math.round((current / total) * 100);
        const progressText = `${text} ${current}/${total} (${percent}%)`;
        
        if (messageId && this.activeMessages.has(messageId)) {
            // 更新现有消息
            this.update(messageId, progressText, { 
                progress: percent,
                icon: '⏳'
            });
            return messageId;
        } else {
            // 创建新消息
            return this.show(progressText, 'processing', 0, { 
                progress: percent,
                icon: '⏳'
            });
        }
    }
    
    /**
     * 显示带进度的处理消息
     */
    showProgress(text, progress = 0, messageId = null) {
        if (messageId && this.activeMessages.has(messageId)) {
            this.update(messageId, text, { progress });
            return messageId;
        } else {
            return this.processing(text, 0, { progress });
        }
    }
}

// 创建全局实例
window.FloatingStatus = new FloatingStatusManager();

// 兼容旧的status接口
window.showStatus = function(text, type = 'info', duration = 3000) {
    return window.FloatingStatus.show(text, type, duration);
};

// 为了向后兼容，创建一个虚拟的status元素
document.addEventListener('DOMContentLoaded', function() {
    // 创建虚拟status元素，拦截对它的操作
    const virtualStatus = {
        textContent: '',
        style: {
            color: '',
            display: ''
        },
        set textContent(value) {
            if (value && value.trim()) {
                // 根据内容和颜色判断消息类型
                let type = 'info';
                if (this.style.color === '#4CAF50' || value.includes('✅') || value.includes('成功')) {
                    type = 'success';
                } else if (this.style.color === 'red' || value.includes('❌') || value.includes('错误') || value.includes('失败')) {
                    type = 'error';
                } else if (value.includes('⚠️') || value.includes('警告')) {
                    type = 'warning';
                }
                
                window.FloatingStatus.show(value, type);
            }
        },
        get textContent() {
            return this._textContent || '';
        }
    };
    
    // 替换可能存在的getElementById调用
    const originalGetElementById = document.getElementById;
    document.getElementById = function(id) {
        if (id === 'status') {
            return virtualStatus;
        }
        return originalGetElementById.call(this, id);
    };
    
    // 添加测试功能（可选）
    window.testFloatingStatus = function() {
        console.log('测试悬浮状态提示...');
        const messages = [
            'status.select_images_first',
            'status.gif_creation_complete', 
            'status.processing_frames',
            'status.import_success',
            'status.deleted'
        ];
        
        messages.forEach((key, index) => {
            setTimeout(() => {
                const message = window.i18n ? window.i18n.t(key, { count: 5 }) : key;
                const types = ['success', 'error', 'warning', 'info', 'processing'];
                FloatingStatus.show(message, types[index % types.length], 3000);
            }, (index + 1) * 1000);
        });
    };
});
