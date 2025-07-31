/**
 * 主应用程序入口文件
 * @description 初始化所有模块并启动应用程序
 */

// 应用程序初始化
function initializeApp() {
    console.log('初始化图片转GIF应用程序...');
    
    // 初始化各个模块
    try {
        GifGenerator.init();
        console.log('✓ GIF生成器模块已初始化');
        
        ContextMenu.init();
        console.log('✓ 右键菜单模块已初始化');
        
        CardSizeController.init();
        console.log('✓ 卡片大小控制器已初始化');
        
        KeyboardShortcuts.init();
        console.log('✓ 键盘快捷键模块已初始化');
        
        // 初始化历史按钮事件
        initializeHistoryButton();
        console.log('✓ 历史记录管理器已初始化');
        
        // 初始显示空的文件列表状态
        if (window.FileManager && window.FileManager.displayFileList) {
            window.FileManager.displayFileList();
            console.log('✓ 文件列表初始状态已显示');
        }
        
        console.log('✓ 应用程序初始化完成');
    } catch (error) {
        console.error('应用程序初始化失败:', error);
    }
}

/**
 * 初始化历史按钮事件
 */
function initializeHistoryButton() {
    const historyBtn = document.getElementById('open-history-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            if (window.HistoryManagerV3) {
                window.HistoryManagerV3.openWindow();
            } else {
                const message = window.i18n ? window.i18n.t('status.history_manager_not_loaded') : '历史记录管理器未加载';
                FloatingStatus.error(message, 3000);
            }
        });
    }
}

// DOM加载完成后初始化应用程序
document.addEventListener('DOMContentLoaded', initializeApp);

// 导出应用程序对象
window.App = {
    init: initializeApp
};
