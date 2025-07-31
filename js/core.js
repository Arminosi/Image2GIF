/**
 * 核心应用程序模块
 * @description 应用程序的主要控制逻辑和状态管理
 */

// 应用程序状态
class AppState {
    constructor() {
        this.selectedFiles = [];
        this.selectedIndices = new Set();
        this.copiedFiles = [];
        this.contextMenuVisible = false;
        this.contextMenu = null;
        this.undoStack = []; // 撤销操作栈
        this.frameDelays = {}; // 存储每帧的时间间隔，key为文件索引
    }

    // 重置状态
    reset() {
        this.selectedFiles = [];
        this.selectedIndices.clear();
        this.copiedFiles = [];
        this.contextMenuVisible = false;
        this.undoStack = [];
        this.frameDelays = {};
    }

    // 保存操作到撤销栈
    saveOperation(operationType, data) {
        this.undoStack.push({
            type: operationType,
            data: data,
            timestamp: Date.now()
        });
        // 限制撤销栈大小，保留最近20个操作
        if (this.undoStack.length > 20) {
            this.undoStack.shift();
        }
    }

    // 执行撤销操作
    undo() {
        if (this.undoStack.length === 0) {
            return false;
        }
        
        const lastOperation = this.undoStack.pop();
        return lastOperation;
    }

    // 检查是否可以撤销
    canUndo() {
        return this.undoStack.length > 0;
    }

    // 切换模式
    toggleMode() {
        // 移除拖拽模式，仅保留选择模式
        this.selectedIndices.clear();
    }

    // 添加选择
    addSelection(index) {
        this.selectedIndices.add(index);
    }

    // 移除选择
    removeSelection(index) {
        this.selectedIndices.delete(index);
    }

    // 清除所有选择
    clearSelections() {
        this.selectedIndices.clear();
    }

    // 全选
    selectAll() {
        this.selectedIndices.clear();
        for (let i = 0; i < this.selectedFiles.length; i++) {
            this.selectedIndices.add(i);
        }
    }

    // 获取选中的文件
    getSelectedFiles() {
        return Array.from(this.selectedIndices).map(index => this.selectedFiles[index]);
    }

    // 设置特定帧的延迟时间
    setFrameDelay(index, delay) {
        this.frameDelays[index] = delay;
    }

    // 获取特定帧的延迟时间
    getFrameDelay(index) {
        return this.frameDelays[index] || 100; // 默认100ms
    }

    // 重新映射帧延迟（当文件顺序改变时）
    remapFrameDelays(indexMapping) {
        const newFrameDelays = {};
        Object.keys(this.frameDelays).forEach(oldIndex => {
            const newIndex = indexMapping[oldIndex];
            if (newIndex !== undefined) {
                newFrameDelays[newIndex] = this.frameDelays[oldIndex];
            }
        });
        this.frameDelays = newFrameDelays;
    }
}

// 全局应用程序状态实例
const appState = new AppState();

// 状态更新回调
const onStateUpdate = new Set();

// 添加状态更新监听器
function addStateUpdateListener(callback) {
    onStateUpdate.add(callback);
}

// 移除状态更新监听器
function removeStateUpdateListener(callback) {
    onStateUpdate.delete(callback);
}

// 触发状态更新
function notifyStateUpdate() {
    onStateUpdate.forEach(callback => {
        try {
            callback(appState);
        } catch (error) {
            console.error('State update callback error:', error);
        }
    });
}

// 导出
window.AppCore = {
    appState,
    addStateUpdateListener,
    removeStateUpdateListener,
    notifyStateUpdate,
    // 添加保存操作功能
    saveOperation: (operationType, data) => appState.saveOperation(operationType, data),
    // 添加撤销功能
    undo: () => appState.undo(),
    canUndo: () => appState.canUndo()
};
