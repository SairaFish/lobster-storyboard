/**
 * 龙虾分镜 - Electron 预加载脚本
 * Storyboard Pro - Preload Script
 */

const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  saveProject: (projectData) => ipcRenderer.invoke('save-project', projectData),
  openProject: () => ipcRenderer.invoke('open-project')
});
