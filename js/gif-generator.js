/**
 * GIF生成模块
 * @description 处理GIF动画生成和预览功能
 */

// 获取选择的背景颜色
function getSelectedBackgroundColor() {
    const selectedRadio = document.querySelector('input[name="background"]:checked');
    if (selectedRadio.value === 'transparent') {
        return null;
    } else if (selectedRadio.value === 'custom') {
        return document.getElementById('custom-color').value;
    } else {
        return selectedRadio.value;
    }
}

// 生成GIF动画
function generateGIF() {
    // 检查是否有选中的文件
    if (AppCore.appState.selectedFiles.length === 0) {
        FloatingStatus.warning('请先选择PNG图片文件！');
        return;
    }
    
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const statusElement = document.getElementById('status');
    const generateBtn = document.getElementById('generate-btn');
    
    // 获取用户设置的帧间隔和背景颜色
    const frameDelay = parseInt(document.getElementById('frame-delay').value);
    const backgroundColor = getSelectedBackgroundColor();
    
    // 显示进度
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    statusElement.textContent = '正在处理帧...';
    statusElement.style.color = '#666';
    
    // 使用悬浮状态显示进度
    const progressMessageId = FloatingStatus.progress('正在处理帧:', 0, AppCore.appState.selectedFiles.length);
    
    // 处理期间禁用生成按钮并更改文本
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ 正在生成中...';
    
    // 隐藏之前的预览
    document.getElementById('gif-preview-container').style.display = 'none';
    
    // 从第一帧获取尺寸
    const firstFile = AppCore.appState.selectedFiles[0];
    const img = new Image();
    img.onload = function() {
        const width = img.width;
        const height = img.height;
        
        // 使用本地worker脚本创建GIF实例
        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: width,
            height: height,
            workerScript: 'gif.worker.js',
            transparent: backgroundColor ? null : 'rgba(0,0,0,0)',
            background: backgroundColor,
            dither: false
        });
        
        // 处理每一帧
        processFrames(0, AppCore.appState.selectedFiles.length, img.width, img.height, gif, statusElement, progressContainer, progressBar, frameDelay, backgroundColor, progressMessageId);
    };
    
    img.onerror = function() {
        statusElement.textContent = `加载图片出错: ${firstFile.name}`;
        statusElement.style.color = '#FF5722';
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.style.color = '#666';
        }, 3000);
        
        // 重置界面状态（错误状态）
        resetGenerationState(statusElement, progressContainer, progressBar, true);
    };
    
    img.src = URL.createObjectURL(firstFile);
}

// 处理每一帧并添加到GIF
function processFrames(index, total, width, height, gif, statusElement, progressContainer, progressBar, defaultFrameDelay, backgroundColor, progressMessageId) {
    if (index >= total) {
        finishGif(gif, statusElement, progressContainer, progressBar, progressMessageId);
        return;
    }
    
    const file = AppCore.appState.selectedFiles[index];
    const img = new Image();
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (backgroundColor) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);
        } else {
            ctx.clearRect(0, 0, width, height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        // 使用每帧独立的延迟时间，如果没有设置则使用默认值
        const frameDelay = AppCore.appState.getFrameDelay(index) || defaultFrameDelay;
        gif.addFrame(canvas, {delay: frameDelay});
        
        updateProgress(index + 1, total, statusElement, progressContainer, progressBar, progressMessageId);
        processFrames(index + 1, total, width, height, gif, statusElement, progressContainer, progressBar, defaultFrameDelay, backgroundColor, progressMessageId);
    };
    
    img.onerror = function() {
        // 隐藏进度消息
        if (progressMessageId) {
            FloatingStatus.hide(progressMessageId);
        }
        
        statusElement.textContent = `加载图片出错: ${file.name}`;
        statusElement.style.color = '#FF5722';
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.style.color = '#666';
        }, 3000);
        
        // 显示错误消息
        FloatingStatus.error(`加载图片出错: ${file.name}`, 5000);
        
        // 重置界面状态（错误状态）
        resetGenerationState(statusElement, progressContainer, progressBar, true);
    };
    
    img.src = URL.createObjectURL(file);
}

// 更新进度指示器
function updateProgress(current, total, statusElement, progressContainer, progressBar, progressMessageId) {
    const percent = Math.round((current / total) * 100);
    progressBar.style.width = `${percent}%`;
    progressBar.textContent = `${percent}%`;
    
    // 使用悬浮状态更新进度，不再更新 statusElement 避免刷屏
    FloatingStatus.progress('正在处理帧:', current, total, progressMessageId);
}

// 完成GIF创建
function finishGif(gif, statusElement, progressContainer, progressBar, progressMessageId) {
    gif.on('finished', function(blob) {
        // 隐藏进度消息
        if (progressMessageId) {
            FloatingStatus.hide(progressMessageId);
        }
        
        const previewArea = document.querySelector('.preview-area'); // 使用class选择器
        const previewContainer = document.getElementById('gif-preview-container');
        const previewGif = document.getElementById('preview-gif');
        const downloadLink = document.getElementById('download-link');
        const gifSizeInfo = document.getElementById('gif-size-info');
        const copyGifBtn = document.getElementById('copy-gif-btn');
        const closeBtn = document.getElementById('close-preview-btn');

        const gifUrl = URL.createObjectURL(blob);
        previewGif.src = gifUrl;
        previewGif.style.display = 'block';
        previewContainer.style.display = 'flex';
        downloadLink.href = gifUrl;
        downloadLink.style.display = 'inline-block';
        downloadLink.download = 'frame_animation.gif';

        gifSizeInfo.textContent = `GIF大小: ${(blob.size/1024).toFixed(1)} KB`;

        // 保存到历史记录
        if (window.HistoryManager) {
            const metadata = {
                frameCount: AppCore.appState.selectedFiles.length,
                delay: parseInt(document.getElementById('frame-delay').value),
                dimensions: {
                    width: previewGif.naturalWidth || 0,
                    height: previewGif.naturalHeight || 0
                },
                fileName: `animation_${new Date().toISOString().slice(0,19).replace(/[:-]/g, '')}.gif`
            };
            
            // 等待图片加载完成后再获取尺寸
            previewGif.onload = function() {
                metadata.dimensions.width = this.naturalWidth;
                metadata.dimensions.height = this.naturalHeight;
                window.HistoryManager.saveToHistory(blob, metadata);
            };
            
            // 如果图片已经加载完成
            if (previewGif.complete && previewGif.naturalWidth > 0) {
                metadata.dimensions.width = previewGif.naturalWidth;
                metadata.dimensions.height = previewGif.naturalHeight;
                window.HistoryManager.saveToHistory(blob, metadata);
            }
        }

        // 关闭按钮
        closeBtn.onclick = function() {
            previewContainer.style.display = 'none';
            previewGif.src = '';
            downloadLink.href = '#';
            gifSizeInfo.textContent = '';
        };

        // 复制GIF到剪贴板
        copyGifBtn.onclick = async function() {
            try {
                await navigator.clipboard.write([
                    new window.ClipboardItem({
                        'image/gif': blob
                    })
                ]);
                gifSizeInfo.textContent = '已复制到剪贴板！';
                setTimeout(() => {
                    gifSizeInfo.textContent = `GIF大小: ${(blob.size/1024).toFixed(1)} KB`;
                }, 1800);
            } catch (err) {
                gifSizeInfo.textContent = '复制失败，浏览器不支持或权限不足';
                setTimeout(() => {
                    gifSizeInfo.textContent = `GIF大小: ${(blob.size/1024).toFixed(1)} KB`;
                }, 1800);
            }
        };

        // 安全地滚动到预览区域
        if (previewArea) {
            previewArea.scrollIntoView({behavior:'smooth', block:'center'});
        }

        // 立即重置按钮状态 - 确保在这里直接重置
        setTimeout(() => {
            const generateBtn = document.getElementById('generate-btn');
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.textContent = '🎬 生成GIF动画';
                console.log('GIF完成 - 按钮已重置');
            }
            
            // 隐藏进度条
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
            if (progressBar) {
                progressBar.style.width = '0%';
                progressBar.textContent = '0%';
            }
            
            // 设置成功状态
            if (statusElement) {
                statusElement.textContent = 'GIF创建成功！';
                statusElement.style.color = '#4CAF50';
                
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                        statusElement.style.color = '#666';
                    }
                }, 3000);
            }
            
            // 显示成功消息
            FloatingStatus.success('GIF动画创建完成！', 3000);
        }, 100); // 稍微延迟确保DOM更新完成
    });
    
    // 添加错误处理
    gif.on('abort', function() {
        // 隐藏进度消息
        if (progressMessageId) {
            FloatingStatus.hide(progressMessageId);
        }
        FloatingStatus.error('GIF生成被中止', 3000);
        resetGenerationState(statusElement, progressContainer, progressBar, true);
    });
    
    gif.render();
}

// 重置生成状态的函数
function resetGenerationState(statusElement, progressContainer, progressBar, isError = false) {
    console.log('正在重置生成状态...', { isError });
    
    // 重新启用生成按钮
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.textContent = '🎬 生成GIF动画';
        console.log('按钮已重置:', generateBtn.textContent, '禁用状态:', generateBtn.disabled);
    }
    
    // 完全隐藏并重置进度条
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
    if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
    }
    
    // 如果不是错误状态，设置成功消息
    if (!isError && statusElement) {
        statusElement.textContent = 'GIF创建成功！';
        statusElement.style.color = '#4CAF50';
        
        // 延迟重置状态文本
        setTimeout(() => {
            if (statusElement) {
                statusElement.textContent = '';
                statusElement.style.color = '#666';
            }
        }, 3000);
    }
}

// 初始化GIF生成器
function initGifGenerator() {
    // 生成按钮事件
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateGIF);
    }
    
    // 帧间隔滑块更新
    const frameDelaySlider = document.getElementById('frame-delay');
    const delayValueDisplay = document.getElementById('delay-value');
    
    if (frameDelaySlider && delayValueDisplay) {
        frameDelaySlider.addEventListener('input', function() {
            delayValueDisplay.textContent = this.value;
        });
    }
    
    // 应用到所有帧按钮
    const applyDelayAllBtn = document.getElementById('apply-delay-all');
    if (applyDelayAllBtn) {
        applyDelayAllBtn.addEventListener('click', function() {
            const globalDelay = parseInt(frameDelaySlider.value);
            for (let i = 0; i < AppCore.appState.selectedFiles.length; i++) {
                AppCore.appState.setFrameDelay(i, globalDelay);
            }
            FileManager.displayFileList();
            AppCore.notifyStateUpdate();
            
            // 显示成功消息
            const statusElement = document.getElementById('status');
            const originalText = statusElement.textContent;
            statusElement.textContent = `已将所有帧间隔设置为 ${globalDelay}ms`;
            statusElement.style.color = '#4CAF50';
            setTimeout(() => {
                statusElement.textContent = originalText;
                statusElement.style.color = '#666';
            }, 2000);
        });
    }
    
    // 重置所有帧间隔按钮
    const resetDelaysBtn = document.getElementById('reset-delays');
    if (resetDelaysBtn) {
        resetDelaysBtn.addEventListener('click', function() {
            AppCore.appState.frameDelays = {};
            FileManager.displayFileList();
            AppCore.notifyStateUpdate();
            
            // 显示成功消息
            const statusElement = document.getElementById('status');
            const originalText = statusElement.textContent;
            statusElement.textContent = '已重置所有帧间隔为默认值 100ms';
            statusElement.style.color = '#4CAF50';
            setTimeout(() => {
                statusElement.textContent = originalText;
                statusElement.style.color = '#666';
            }, 2000);
        });
    }
    
    // 背景颜色控制
    const customColorPicker = document.getElementById('custom-color');
    customColorPicker.disabled = true;
    
    document.querySelectorAll('input[name="background"]').forEach(radio => {
        radio.addEventListener('change', function() {
            customColorPicker.disabled = this.value !== 'custom';
        });
    });
    
    // 文件输入事件
    document.getElementById('file-input').addEventListener('change', function(event) {
        FileManager.handleFileSelection(event.target.files);
    });
}

// 显示选中帧的时长设置对话框
function showDelayDialogForSelected() {
    console.log('showDelayDialogForSelected被调用');
    console.log('选中的帧数量:', AppCore.appState.selectedIndices.size);
    
    if (AppCore.appState.selectedIndices.size === 0) {
        console.log('没有选中的帧，显示错误消息');
        // 显示错误消息
        const statusElement = document.getElementById('status');
        const originalText = statusElement.textContent;
        statusElement.textContent = '请先选择要设置时长的帧！';
        statusElement.style.color = '#FF5722';
        setTimeout(() => {
            statusElement.textContent = originalText;
            statusElement.style.color = '#666';
        }, 3000);
        return;
    }
    
    // 获取对话框元素
    const delayDialog = document.getElementById('delay-dialog');
    const delayOverlay = document.getElementById('delay-dialog-overlay');
    
    console.log('对话框元素:', delayDialog);
    console.log('遮罩元素:', delayOverlay);
    
    if (!delayDialog || !delayOverlay) {
        console.error('对话框或遮罩元素未找到');
        return;
    }
    
    // 获取第一个选中帧的当前时长作为默认值
    const firstSelectedIndex = Array.from(AppCore.appState.selectedIndices)[0];
    const currentDelay = AppCore.appState.getFrameDelay(firstSelectedIndex) || 100;
    
    console.log('当前时长:', currentDelay);
    
    // 设置输入框的值
    const inputElement = document.getElementById('batch-delay-input');
    console.log('输入框元素:', inputElement);
    
    if (inputElement) {
        inputElement.value = currentDelay;
        console.log('输入框值已设置为:', inputElement.value);
    }
    
    // 显示遮罩和对话框
    console.log('显示对话框...');
    delayOverlay.classList.add('show');
    
    // 延迟显示对话框以确保动画效果
    setTimeout(() => {
        delayDialog.classList.add('show');
        
        // 聚焦到输入框
        if (inputElement) {
            inputElement.focus();
            inputElement.select();
            console.log('输入框已聚焦');
        }
    }, 50);
    
    // 防止页面滚动
    document.body.style.overflow = 'hidden';
    
    console.log('对话框已显示');
}

// 导出
window.GifGenerator = {
    init: initGifGenerator,
    generateGIF,
    showDelayDialogForSelected
};
