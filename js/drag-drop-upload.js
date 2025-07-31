/**
 * 拖拽上传功能模块
 * 处理文件拖拽选择和上传区域交互
 */

class DragDropUpload {
    constructor() {
        this.uploadZone = null;
        this.fileInput = null;
        this.dragCounter = 0; // 防止拖拽事件冲突
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    setupElements() {
        this.uploadZone = document.getElementById('upload-zone');
        this.fileInput = document.getElementById('file-input');

        if (!this.uploadZone || !this.fileInput) {
            console.warn('拖拽上传：未找到必要的DOM元素');
            return;
        }

        this.bindEvents();
    }

    bindEvents() {
        // 拖拽事件
        this.uploadZone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));

        // 点击事件
        this.uploadZone.addEventListener('click', () => this.handleClick());

        // 全局拖拽事件（防止页面其他地方拖拽时的默认行为）
        document.addEventListener('dragover', this.preventDefault);
        document.addEventListener('drop', this.preventDefault);
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.dragCounter++;
        
        if (this.dragCounter === 1) {
            this.uploadZone.classList.add('drag-over');
            this.showDragOverlay();
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // 设置拖拽效果
        e.dataTransfer.dropEffect = 'copy';
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.dragCounter--;
        
        if (this.dragCounter <= 0) {
            this.dragCounter = 0;
            this.uploadZone.classList.remove('drag-over');
            this.hideDragOverlay();
        }
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.dragCounter = 0;
        this.uploadZone.classList.remove('drag-over');
        this.hideDragOverlay();

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            this.processFiles(files);
        }
    }

    handleClick() {
        this.fileInput.click();
    }

    processFiles(files) {
        // 过滤只保留图片文件
        const imageFiles = Array.from(files).filter(file => {
            const isImage = file.type.startsWith('image/');
            const isSupportedFormat = /\.(png|jpe?g|webp)$/i.test(file.name);
            return isImage && isSupportedFormat;
        });

        if (imageFiles.length === 0) {
            this.showMessage('请选择有效的图片文件（PNG、JPG、WebP格式）', 'error');
            return;
        }

        if (imageFiles.length !== files.length) {
            const unsupportedCount = files.length - imageFiles.length;
            this.showMessage(`已过滤 ${unsupportedCount} 个不支持的文件，仅处理图片文件`, 'warning');
        }

        // 直接调用文件处理函数，而不是尝试设置file input的files属性
        if (window.FileManager && typeof window.FileManager.handleFileSelection === 'function') {
            window.FileManager.handleFileSelection(imageFiles);
        } else {
            console.error('FileManager未找到或handleFileSelection方法不存在');
        }

        // 显示成功消息
        const message = window.i18n ? 
            window.i18n.t('upload.success').replace('{count}', imageFiles.length) :
            `成功选择 ${imageFiles.length} 个图片文件`;
        this.showMessage(message, 'success');
    }

    showDragOverlay() {
        // 可以在这里添加额外的拖拽提示效果
        if (window.i18n) {
            const mainText = this.uploadZone.querySelector('.upload-main-text');
            const subText = this.uploadZone.querySelector('.upload-sub-text');
            if (mainText) mainText.textContent = window.i18n.t('upload.drop_text') || '释放文件到此处';
            if (subText) subText.textContent = window.i18n.t('upload.drop_hint') || '支持多个文件同时上传';
        }
    }

    hideDragOverlay() {
        // 恢复原始文本
        if (window.i18n) {
            const mainText = this.uploadZone.querySelector('.upload-main-text');
            const subText = this.uploadZone.querySelector('.upload-sub-text');
            if (mainText) mainText.textContent = window.i18n.t('upload.main_text');
            if (subText) subText.textContent = window.i18n.t('upload.sub_text');
        }
    }

    showMessage(message, type = 'info') {
        // 使用现有的浮动状态提示系统
        if (window.FloatingStatus) {
            window.FloatingStatus.show(message, type, 3000);
        } else {
            // 回退到alert
            alert(message);
        }
    }

    preventDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 销毁方法，用于清理事件监听器
    destroy() {
        if (this.uploadZone) {
            this.uploadZone.removeEventListener('dragenter', this.handleDragEnter);
            this.uploadZone.removeEventListener('dragover', this.handleDragOver);
            this.uploadZone.removeEventListener('dragleave', this.handleDragLeave);
            this.uploadZone.removeEventListener('drop', this.handleDrop);
            this.uploadZone.removeEventListener('click', this.handleClick);
        }

        document.removeEventListener('dragover', this.preventDefault);
        document.removeEventListener('drop', this.preventDefault);
    }
}

// 创建全局实例
window.DragDropUpload = new DragDropUpload();

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DragDropUpload;
}
