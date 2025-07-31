/**
 * 卡片大小控制器模块
 * @description 处理动态调整文件卡片大小的功能
 */

let cardSizeSlider = null;
let cardSizeValue = null;
let cardSizeControl = null;

// 初始化卡片大小控制器
function initCardSizeController() {
    cardSizeSlider = document.getElementById('card-size-slider');
    cardSizeValue = document.getElementById('card-size-value');
    cardSizeControl = document.getElementById('card-size-control');
    
    if (!cardSizeSlider || !cardSizeValue || !cardSizeControl) {
        console.error('卡片大小控制器元素未找到');
        return;
    }
    
    // 监听滑块变化
    cardSizeSlider.addEventListener('input', function() {
        updateCardSize(this.value);
    });
    
    // 监听滑块释放事件，保存设置
    cardSizeSlider.addEventListener('change', function() {
        saveCardSizePreference(this.value);
    });
    
    // 加载保存的卡片大小设置
    loadCardSizePreference();
    
    console.log('✓ 卡片大小控制器已初始化');
}

// 更新卡片大小
function updateCardSize(size) {
    const numSize = parseInt(size);
    
    // 更新显示值
    cardSizeValue.textContent = numSize;
    
    // 更新CSS变量
    document.documentElement.style.setProperty('--card-size', numSize + 'px');
    document.documentElement.style.setProperty('--card-preview-height', (numSize * 0.8) + 'px');
    
    // 添加平滑过渡效果
    const fileGrid = document.querySelector('.file-grid');
    if (fileGrid) {
        fileGrid.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            fileGrid.style.transition = '';
        }, 300);
    }
}

// 显示卡片大小控制器
function showCardSizeController() {
    if (cardSizeControl) {
        cardSizeControl.style.display = 'block';
        // 添加淡入动画
        cardSizeControl.style.opacity = '0';
        cardSizeControl.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            cardSizeControl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            cardSizeControl.style.opacity = '1';
            cardSizeControl.style.transform = 'translateY(0)';
        }, 10);
    }
}

// 隐藏卡片大小控制器
function hideCardSizeController() {
    if (cardSizeControl) {
        cardSizeControl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        cardSizeControl.style.opacity = '0';
        cardSizeControl.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            cardSizeControl.style.display = 'none';
            cardSizeControl.style.transition = '';
        }, 300);
    }
}

// 保存卡片大小偏好设置
function saveCardSizePreference(size) {
    try {
        localStorage.setItem('gif-maker-card-size', size);
    } catch (error) {
        console.warn('无法保存卡片大小设置:', error);
    }
}

// 加载卡片大小偏好设置
function loadCardSizePreference() {
    try {
        const savedSize = localStorage.getItem('gif-maker-card-size');
        if (savedSize) {
            const size = parseInt(savedSize);
            if (size >= 100 && size <= 250) {
                cardSizeSlider.value = size;
                updateCardSize(size);
            }
        }
    } catch (error) {
        console.warn('无法加载卡片大小设置:', error);
    }
}

// 获取当前卡片大小
function getCurrentCardSize() {
    return parseInt(cardSizeSlider?.value || 150);
}

// 设置卡片大小
function setCardSize(size) {
    if (size >= 100 && size <= 250) {
        if (cardSizeSlider) {
            cardSizeSlider.value = size;
        }
        updateCardSize(size);
        saveCardSizePreference(size);
    }
}

// 重置为默认大小
function resetCardSize() {
    setCardSize(150);
}

// 导出
window.CardSizeController = {
    init: initCardSizeController,
    show: showCardSizeController,
    hide: hideCardSizeController,
    getCurrentSize: getCurrentCardSize,
    setSize: setCardSize,
    reset: resetCardSize
};
