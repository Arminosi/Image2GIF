# Image Sequence to GIF Animation Tool  
# [中文](README.md) | ENG  

---

## Direct Access  
- Direct use: https://arminosi.github.io/Image2GIF/  
- Sprite sheet slicing tool: https://arminosi.github.io/SpriteSlice/  

---

This tool is also developed by AI, with manual verification to implement basic functions. It took two days of work, aiming for usability over polish.  
The fancy UI is not a priority—though resource-heavy, I lack the capacity to optimize it further.  
**All processing is local and offline**: No files (including history) are uploaded to servers. When browser cache is cleared, files are lost.  

A web app that converts multiple PNG images into a GIF animation.  
Honestly, I don’t even feel like updating this README.  

### Known Issues  
- The transparent channel erases black areas, making original black blocks fully transparent. I can’t resolve this, and AI hasn’t figured it out either.  

---

## 🚀 Features  

- **Selection Mode**: Batch select and manipulate frames  
- **Keyboard Shortcuts**: `Ctrl+C/V` to copy/paste frames; `Ctrl+Z` to undo  
- **Right-Click Menu**: Contextual operations for convenience  
- **Animation Settings**: Custom frame intervals and background colors  
- **Frame-Specific Timing**: Adjust display intervals per frame individually  
- **Batch Timing**: Apply interval settings to all frames at once  
- **Real-Time Preview**: Instantly view generated GIFs  
- **Modern Interface**: Glass-morphism design  

---

## 📁 Project Structure  

```
v02_hy/
├── index-new.html          # New modular HTML entry  
├── index.html             # Original single-file backup  
├── gif.worker.js          # GIF.js worker script  
├── css/                   # Styles directory  
│   ├── main.css           # Base styles (layout, buttons, animations)  
│   ├── file-list.css      # File list/selection styles  
│   └── form-controls.css  # Form element styles  
├── js/                    # JavaScript modules  
│   ├── app.js             # App entry/initialization  
│   ├── core.js            # State management  
│   ├── file-manager.js    # File handling (select/sort/operate)  
│   ├── drag-drop.js       # Drag-and-drop sorting  
│   ├── context-menu.js    # Right-click menu logic  
│   ├── keyboard-shortcuts.js # Shortcut handling  
│   └── gif-generator.js   # GIF creation/preview  
├── assets/                # Reserved for static resources  
└── lib/                   # Reserved for third-party libraries  
```  

---

## 🎯 How to Use  

1. Open `index.html` in a browser.  
2. Click "Select PNG Files" to choose multiple PNG images.  
3. Use Selection Mode to manage frames.  
4. Set animation parameters (global interval, background color).  
5. Adjust individual frame intervals if needed.  
6. Click "Apply to All Frames" to batch-set intervals.  
7. Click "Generate GIF Animation."  
8. Preview and download the result.  

---

## ⌨️ Keyboard Shortcuts  

- `Ctrl + C`: Copy selected frames  
- `Ctrl + V`: Paste copied frames  
- `Ctrl + Z`: Undo last paste  
- Right-click menu: Quick access to actions  

---

## 🔄 Operation Modes  

- **Selection Mode**: Use checkboxes to batch-select and manipulate frames.  

---

## 🎨 Technical Specifications  

- **Modular Architecture**: Decoupled code for easier maintenance.  
- **Modern CSS**: CSS variables, gradients, and animations.  
- **ES6+ Syntax**: Leverages modern JavaScript features.  
- **Responsive Design**: Adapts to different screen sizes.  
- **Glass Morphism**: Contemporary visual style.  

---

## 📋 Dependencies  

- https://github.com/jnordberg/gif.js: GIF generation library.  

---

## 🔧 Development Notes  

### CSS Modules  
- `main.css`: Base variables, layout, buttons, and animations.  
- `file-list.css`: Styles for file lists, drag-and-drop, and selection.  
- `form-controls.css`: Styles for sliders, radio buttons, and form elements.  

### JavaScript Modules  
- `core.js`: Manages application state with a unified interface.  
- `file-manager.js`: Handles file selection, display, sorting, and operations.  
- `drag-drop.js`: Implements drag-and-drop sorting logic.  
- `context-menu.js`: Manages right-click context menus.  
- `keyboard-shortcuts.js`: Processes keyboard shortcuts.  
- `gif-generator.js`: Generates GIFs, shows progress, and previews results.  
- `app.js`: Initializes all modules and starts the app.  

---

## 🚀 Deployment  

Upload all files to a web server. No additional configuration is needed.  

---

## 📝 Changelog  

### v2.0  
- Rebuilt with modular architecture.  
- Separated CSS and JavaScript files.  
- Improved code organization and maintainability.  
- Enhanced performance and user experience.  

---  

#中文 | ENG
