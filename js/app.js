/**
 * 主应用程序入口文件
 * @description 初始化所有模块并启动应用程序
 */

// 应用程序初始化
function initializeApp() {
    console.log('初始化PNG转GIF应用程序...');
    
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
                FloatingStatus.error('历史记录管理器未加载', 3000);
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
