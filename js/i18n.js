/**
 * 国            zh: {
                // 标题和基本信息
                'title': 'Image2GIF',
                'app.version': 'v3.3',
                'app.author': '作者：Ocean',
 * 支持中文和英文语言切换
 */

class I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('gif-maker-language') || 'zh';
        this.translations = {
            zh: {
                // 标题和基本信息
                'title': '图片转GIF动画制作工具',
                'app.version': 'v3.3',
                'app.author': '作者：Arminosi',
                
                // 步骤标题和描述
                'step1_title': '📁 步骤 1: 选择图片文件',
                'step1_desc': '选择多个图片文件，支持PNG、JPG、WebP格式，将按文件名自动排序生成动画帧',
                'step2_title': '🎬 步骤 2: 动画设置',
                'step3_title': '🚀 步骤 3: 生成动画',
                
                // 按钮文本
                'select_files_btn': '📁 选择图片文件',
                'generate_btn': '🎬 生成GIF动画',
                'history_btn': '📱 历史记录',
                'download_btn': '💾 下载GIF',
                'copy_btn': '📋 复制GIF',
                'apply_to_all': '应用到所有帧',
                'reset_all': '重置所有帧',
                
                // 表单标签
                'frame_delay_label': '⏱️ 帧间隔 (毫秒):',
                'bg_color_label': '🎨 背景颜色:',
                'bg_transparent': '透明',
                'bg_white': '白色',
                'bg_black': '黑色',
                'bg_custom': '自定义:',
                'card_size_label': '卡片大小:',
                
                // 帮助文本
                'frame_delay_help': '较小的值=更快的动画，较大的值=更慢的动画。每帧可单独设置时间间隔。',
                'bg_color_help': '选择GIF的背景颜色（透明区域将显示此颜色）',
                
                // 面板标题
                'frame_sequence': '🎬 帧序列',
                'result_title': '🎯 生成结果',
                'files_count': '个文件',
                
                // 状态消息
                'no_result_text': '还没有生成结果',
                'no_result_hint': '点击"生成GIF动画"按钮开始制作',
                
                // 右键菜单
                'context_copy': '复制选中的帧',
                'context_paste': '粘贴帧到此位置',
                'context_delete': '删除选中的帧',
                'context_set_delay': '设置选中帧时长',
                
                // 工具提示
                'history_btn_title': '查看历史生成记录',
                'close_preview': '关闭预览',
                
                // 对话框
                'dialog.batch-delay.title': '⏱️ 批量设置帧时长',
                'dialog.batch-delay.duration': '持续时长',
                'dialog.batch-delay.placeholder': '输入毫秒数',
                'dialog.delete.title': '🗑️ 删除选中帧',
                'dialog.delete.confirm': '确定要删除选中的',
                'dialog.delete.frames': '个帧吗？',
                'dialog.delete.warning': '此操作不可撤销！',
                'dialog.delete.button': '删除',
                'dialog.cancel': '取消',
                'dialog.confirm': '确定',
                
                // 作者信息
                'author_label': '作者：',
                
                // 帧序列面板
                'frame.empty.text': '还没有帧序列',
                'frame.empty.hint': '点击左侧"选择PNG文件"按钮开始',
                'frame.header.title': '📁 已导入的帧',
                'frame.header.hint': '可以拖拽排序 • Ctrl+C/V 复制粘贴',
                'frame.controls.selectAll': '🔲 全选',
                'frame.controls.deselectAll': '⭕ 取消全选',
                'frame.controls.copy': '📋 复制选中',
                'frame.controls.delete': '🗑️ 删除选中',
                'frame.controls.append': '➕ 追加图片',
                'frame.controls.append.tooltip': '追加导入图片到当前序列（支持PNG、JPG、WebP）',
                
                // 历史记录
                'history.title': '历史记录',
                'history.clear.button': '🗑️ 清空全部',
                'history.clear.tooltip': '清空所有历史记录',
                'history.empty': '暂无历史记录',
                'history.pagination.first': '首页',
                'history.pagination.prev': '上一页',
                'history.pagination.next': '下一页',
                'history.pagination.last': '末页',
                'history.card.unnamed': '未命名文件',
                'history.card.preview': '👁️ 预览',
                'history.card.download': '💾 下载',
                'history.card.import': '📥 导入',
                'history.card.delete': '🗑️ 删除',
                
                // FloatingStatus 消息
                'status.history_manager_not_loaded': '历史记录管理器未加载',
                'status.select_frames_first': '请先选择要复制的帧！',
                'status.select_images_first': '请先选择PNG图片文件！',
                'status.processing_frames': '正在处理帧:',
                'status.image_load_error': '加载图片出错:',
                'status.gif_creation_complete': 'GIF动画创建完成！',
                'status.gif_generation_aborted': 'GIF生成被中止',
                'status.downloaded': '已下载:',
                'status.deleted': '已删除:',
                'status.no_frame_data': '该历史记录没有保存序列帧数据',
                'status.import_success': '成功导入 {count} 个序列帧',
                'status.import_failed': '导入序列帧失败:',
                'status.no_history_to_clear': '没有历史记录需要清空',
                'status.history_cleared': '已清空 {count} 个历史记录'
            },
            en: {
                // 标题和基本信息
                'title': 'Image2GIF',
                'app.version': 'v3.3',
                'app.author': 'Author: Ocean',
                
                // 步骤标题和描述
                'step1_title': '📁 Step 1: Select Image Files',
                'step1_desc': 'Select multiple image files, supports PNG, JPG, WebP formats, will be automatically sorted by filename to generate animation frames',
                'step2_title': '🎬 Step 2: Animation Settings',
                'step3_title': '🚀 Step 3: Generate Animation',
                
                // 按钮文本
                'select_files_btn': '📁 Select Image Files',
                'generate_btn': '🎬 Generate GIF Animation',
                'history_btn': '📱 History',
                'download_btn': '💾 Download GIF',
                'copy_btn': '📋 Copy GIF',
                'apply_to_all': 'Apply to All Frames',
                'reset_all': 'Reset All Frames',
                
                // 表单标签
                'frame_delay_label': '⏱️ Frame Interval (ms):',
                'bg_color_label': '🎨 Background Color:',
                'bg_transparent': 'Transparent',
                'bg_white': 'White',
                'bg_black': 'Black',
                'bg_custom': 'Custom:',
                'card_size_label': 'Card Size:',
                
                // 帮助文本
                'frame_delay_help': 'Smaller values = faster animation, larger values = slower animation. Each frame can set time interval individually.',
                'bg_color_help': 'Choose the background color for GIF (transparent areas will show this color)',
                
                // 面板标题
                'frame_sequence': '🎬 Frame Sequence',
                'result_title': '🎯 Generation Result',
                'files_count': 'files',
                
                // 状态消息
                'no_result_text': 'No generation result yet',
                'no_result_hint': 'Click "Generate GIF Animation" button to start',
                
                // 右键菜单
                'context_copy': 'Copy Selected Frames',
                'context_paste': 'Paste Frames Here',
                'context_delete': 'Delete Selected Frames',
                'context_set_delay': 'Set Selected Frame Duration',
                
                // 工具提示
                'history_btn_title': 'View generation history',
                'close_preview': 'Close preview',
                
                // 对话框
                'dialog.batch-delay.title': '⏱️ Batch Set Frame Duration',
                'dialog.batch-delay.duration': 'Duration',
                'dialog.batch-delay.placeholder': 'Enter milliseconds',
                'dialog.delete.title': '🗑️ Delete Selected Frames',
                'dialog.delete.confirm': 'Are you sure to delete',
                'dialog.delete.frames': 'selected frames?',
                'dialog.delete.warning': 'This action cannot be undone!',
                'dialog.delete.button': 'Delete',
                'dialog.cancel': 'Cancel',
                'dialog.confirm': 'Confirm',
                
                // 作者信息
                'author_label': 'Author:',
                
                // 帧序列面板
                'frame.empty.text': 'No frame sequence yet',
                'frame.empty.hint': 'Click "Select Image Files" button on the left to start',
                'frame.header.title': '📁 Imported Frames',
                'frame.header.hint': 'Drag to reorder • Ctrl+C/V to copy/paste',
                'frame.controls.selectAll': '🔲 Select All',
                'frame.controls.deselectAll': '⭕ Deselect All',
                'frame.controls.copy': '📋 Copy Selected',
                'frame.controls.delete': '🗑️ Delete Selected',
                'frame.controls.append': '➕ Add Images',
                'frame.controls.append.tooltip': 'Append images to current sequence (supports PNG, JPG, WebP)',
                
                // 历史记录
                'history.title': 'History',
                'history.clear.button': '🗑️ Clear All',
                'history.clear.tooltip': 'Clear all history records',
                'history.empty': 'No history records',
                'history.pagination.first': 'First',
                'history.pagination.prev': 'Previous',
                'history.pagination.next': 'Next',
                'history.pagination.last': 'Last',
                'history.card.unnamed': 'Unnamed File',
                'history.card.preview': '👁️ Preview',
                'history.card.download': '💾 Download',
                'history.card.import': '📥 Import',
                'history.card.delete': '🗑️ Delete',
                
                // FloatingStatus 消息
                'status.history_manager_not_loaded': 'History manager not loaded',
                'status.select_frames_first': 'Please select frames to copy first!',
                'status.select_images_first': 'Please select PNG image files first!',
                'status.processing_frames': 'Processing frames:',
                'status.image_load_error': 'Error loading image:',
                'status.gif_creation_complete': 'GIF animation created successfully!',
                'status.gif_generation_aborted': 'GIF generation aborted',
                'status.downloaded': 'Downloaded:',
                'status.deleted': 'Deleted:',
                'status.no_frame_data': 'This history record has no saved frame data',
                'status.import_success': 'Successfully imported {count} frames',
                'status.import_failed': 'Failed to import frames:',
                'status.no_history_to_clear': 'No history records to clear',
                'status.history_cleared': 'Cleared {count} history records'
            }
        };
        
        this.init();
    }
    
    /**
     * 初始化国际化系统
     */
    init() {
        this.updateUI();
        this.bindEvents();
    }
    
    /**
     * 获取翻译文本
     * @param {string} key 翻译键
     * @param {Object} params 参数
     * @returns {string} 翻译后的文本
     */
    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || key;
        
        // 替换参数，支持 {param} 和 {{param}} 两种格式
        return translation.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] || match;
        }).replace(/\{\{(\w+)\}\}/g, (match, param) => {
            return params[param] || match;
        });
    }
    
    /**
     * 切换语言
     * @param {string} language 语言代码
     */
    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            localStorage.setItem('gif-maker-language', language);
            this.updateUI();
            this.updateLanguageButtons();
            
            // 触发全局语言切换事件
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: language }
            }));
            
            // 重新渲染文件列表和历史记录
            this.updateDynamicContent();
        }
    }
    
    /**
     * 更新动态内容
     */
    updateDynamicContent() {
        // 重新渲染文件列表
        if (window.FileManager && window.FileManager.displayFileList) {
            window.FileManager.displayFileList();
        } else if (window.displayFileList && typeof window.displayFileList === 'function') {
            window.displayFileList();
        }
        
        // 重新渲染历史记录
        if (window.HistoryManager && window.HistoryManager.isWindowOpen) {
            window.HistoryManager.renderCards();
        }
        
        // 更新文件计数
        if (typeof updateFilesCount === 'function') {
            updateFilesCount();
        }
    }
    
    /**
     * 获取当前语言
     * @returns {string} 当前语言代码
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    /**
     * 更新UI文本
     */
    updateUI() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);
            
            if (element.hasAttribute('data-i18n-placeholder')) {
                element.placeholder = text;
            } else if (element.hasAttribute('data-i18n-title')) {
                element.title = text;
            } else {
                element.textContent = text;
            }
        });
        
        // 特殊处理删除对话框的数字文本
        this.updateDeleteDialogText();
    }
    
    /**
     * 应用国际化到指定容器内的元素
     * @param {Element} container 容器元素
     */
    applyToContainer(container) {
        if (!container) return;
        
        const elements = container.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);
            
            if (element.hasAttribute('data-i18n-placeholder')) {
                element.placeholder = text;
            } else if (element.hasAttribute('data-i18n-title')) {
                element.title = text;
            } else {
                element.textContent = text;
            }
        });
        
        // 处理title属性
        const titleElements = container.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const text = this.t(key);
            element.title = text;
        });
    }
    
    /**
     * 更新删除对话框文本（包含动态数字）
     */
    updateDeleteDialogText() {
        const deleteMessage = document.getElementById('delete-message');
        const deleteCount = document.getElementById('delete-count');
        if (deleteMessage && deleteCount) {
            const count = deleteCount.textContent || '0';
            if (this.currentLanguage === 'zh') {
                deleteMessage.innerHTML = `确定要删除选中的 <span id="delete-count">${count}</span> 个帧吗？`;
            } else {
                const frameText = count === '1' ? 'frame' : 'frames';
                deleteMessage.innerHTML = `Are you sure to delete <span id="delete-count">${count}</span> selected ${frameText}?`;
            }
        }
    }
    
    /**
     * 更新语言按钮状态
     */
    updateLanguageButtons() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(button => {
            const lang = button.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 语言切换按钮
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('lang-btn')) {
                const lang = e.target.getAttribute('data-lang');
                this.setLanguage(lang);
            }
        });
        
        // 页面加载完成后更新语言按钮状态
        document.addEventListener('DOMContentLoaded', () => {
            this.updateLanguageButtons();
        });
    }
    
    /**
     * 格式化数字
     * @param {number} number 数字
     * @returns {string} 格式化后的数字
     */
    formatNumber(number) {
        return new Intl.NumberFormat(this.currentLanguage === 'zh' ? 'zh-CN' : 'en-US').format(number);
    }
    
    /**
     * 格式化文件大小
     * @param {number} bytes 字节数
     * @returns {string} 格式化后的文件大小
     */
    formatFileSize(bytes) {
        const units = this.currentLanguage === 'zh' ? 
            ['字节', 'KB', 'MB', 'GB'] : 
            ['Bytes', 'KB', 'MB', 'GB'];
        
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
    }
    
    /**
     * 格式化时间
     * @param {number} ms 毫秒数
     * @returns {string} 格式化后的时间
     */
    formatTime(ms) {
        if (ms < 1000) {
            return `${ms}${this.t('settings.delay.unit')}`;
        } else {
            return `${(ms / 1000).toFixed(1)}s`;
        }
    }
}

// 创建全局实例
window.i18n = new I18n();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}
