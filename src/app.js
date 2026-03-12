/**
 * 龙虾分镜 - 应用主逻辑
 * Storyboard Pro - Main Application Logic
 */

// ==================== 配置常量 ====================
const CONFIG = {
  MAX_DURATION: 10, // 时长条最大显示秒数
  AUTO_SAVE_INTERVAL: 5000, // 自动保存间隔（毫秒）
  STATUS_BAR_HEIGHT: 50, // 状态栏高度（像素）
  MAX_HISTORY_STEPS: 20, // 最大撤销/重做步数
  IMAGE_QUALITY: 0.8, // 图片压缩质量
  IMAGE_MAX_SIZE: 1920, // 图片最大尺寸
};

// 应用状态
const AppState = {
  currentProject: null,
  shots: [],
  selectedShotId: null,
  isModified: false,
  projectPath: null,
  // 撤销/重做历史
  history: [],
  historyIndex: -1,
  maxHistorySteps: CONFIG.MAX_HISTORY_STEPS,
  // 自动保存
  autoSaveTimer: null,
  autoSaveInterval: CONFIG.AUTO_SAVE_INTERVAL
};

// 镜头数据结构
// {
//   id: string,
//   number: string,
//   description: string,
//   duration: number,
//   type: string,
//   angle: string,
//   camera: string,
//   notes: string,
//   thumbnail: string (base64 或文件路径),
//   created: string,
//   modified: string
// }
const ShotTypeIcons = {
  wide: '🎑',
  medium: '👤',
  close: '😊',
  extreme: '👁️',
  over: '💬',
  point: '🎯'
};

// DOM 元素引用（延迟初始化）
let elements = {};

// 初始化 DOM 元素引用
function initElements() {
  elements = {
  shotList: document.getElementById('shot-list'),
  shotListDesktop: document.getElementById('shot-list-desktop'),
  shotEditor: document.getElementById('shot-editor'),
  noSelection: document.getElementById('no-selection'),
  previewCanvas: document.getElementById('preview-canvas'),
  
  // 移动端菜单
  sideMenu: document.getElementById('side-menu'),
  menuOverlay: document.getElementById('menu-overlay'),
  btnMenuToggle: document.getElementById('btn-menu-toggle'),
  btnMenuClose: document.getElementById('btn-menu-close'),
  btnAddShotMobile: document.getElementById('btn-add-shot-mobile'),
  btnAddShotDesktop: document.getElementById('btn-add-shot-desktop'),
  
  // 项目标题 - 单一 input，readonly 切换（PC 和移动端）
  projectTitlePc: document.getElementById('project-title-pc'),
  projectTitleMobile: document.getElementById('project-title-mobile'),
  
  // 表单字段
  shotNumber: document.getElementById('shot-number'),
  shotDescription: document.getElementById('shot-description'),
  shotDuration: document.getElementById('shot-duration'),
  shotType: document.getElementById('shot-type'),
  shotAngle: document.getElementById('shot-angle'),
  shotCamera: document.getElementById('shot-camera'),
  shotNotes: document.getElementById('shot-notes'),
  shotDialogue: document.getElementById('shot-dialogue'),
  shotNarration: document.getElementById('shot-narration'),
  shotAmbience: document.getElementById('shot-ambience'),
  
  // 按钮（PC 端）
  btnNew: document.getElementById('btn-new'),
  btnOpen: document.getElementById('btn-open'),
  btnSave: document.getElementById('btn-save'),
  btnDeleteShot: document.getElementById('btn-delete-shot'),
  btnSaveShot: document.getElementById('btn-save-shot'),
  btnDuplicateShot: document.getElementById('btn-duplicate-shot'),
  btnExportPdf: document.getElementById('btn-export-pdf'),
  btnExportImg: document.getElementById('btn-export-img'),
  btnUploadShot: document.getElementById('btn-upload-shot'),
  shotThumbnail: document.getElementById('shot-thumbnail'),
  
  // 按钮（移动端）
  btnNewMobile: document.getElementById('btn-new-mobile'),
  btnOpenMobile: document.getElementById('btn-open-mobile'),
  btnSaveMobile: document.getElementById('btn-save-mobile'),
  btnExportPdfMobile: document.getElementById('btn-export-pdf-mobile'),
  
  // 状态显示
  statusProject: document.getElementById('status-project'),
  statusShots: document.getElementById('status-shots'),
  statusSaved: document.getElementById('status-saved'),
  
  // 预览信息
  previewShotNumber: document.getElementById('preview-shot-number'),
  previewShotType: document.getElementById('preview-shot-type'),
  previewShotDuration: document.getElementById('preview-shot-duration'),
  
  // 镜头操作按钮容器（PC 端）
  shotActionsContainer: document.getElementById('shot-actions-container'),
  
  // 镜头操作按钮容器（移动端）
  shotActionsContainerMobile: document.getElementById('shot-actions-container-mobile'),
  btnSaveShotMobile: document.getElementById('btn-save-shot-mobile'),
  btnDuplicateShotMobile: document.getElementById('btn-duplicate-shot-mobile'),
  btnDeleteShotMobile: document.getElementById('btn-delete-shot-mobile'),
  
  // 移动端面包屑导航
  mobileBreadcrumb: document.getElementById('mobile-breadcrumb'),
  
  // 桌面端预览
  previewCanvasDesktop: document.getElementById('preview-canvas-desktop'),
  shotThumbnailDesktop: document.getElementById('shot-thumbnail-desktop'),
  btnUploadShotDesktop: document.getElementById('btn-upload-shot-desktop'),
  previewShotNumberDesktop: document.getElementById('preview-shot-number-desktop'),
  previewShotTypeDesktop: document.getElementById('preview-shot-type-desktop'),
  previewShotDurationDesktop: document.getElementById('preview-shot-duration-desktop'),
  shotActionsContainerDesktop: document.getElementById('shot-actions-container-desktop'),
  btnSaveShotDesktop: document.getElementById('btn-save-shot-desktop'),
  btnDuplicateShotDesktop: document.getElementById('btn-duplicate-shot-desktop'),
  btnDeleteShotDesktop: document.getElementById('btn-delete-shot-desktop')
  };
  
}

// 加载 Demo 测试数据
function loadDemoData() {
  // 保存到 localStorage
  const demoShots = [
    {
      id: 'shot_demo_001',
      number: 'SC-001',
      description: '开场镜头，城市天际线全景，清晨阳光洒在建筑物上',
      duration: 5.0,
      type: 'wide',
      angle: 'eye',
      camera: 'static',
      notes: '营造氛围，建立场景',
      created: new Date().toISOString()
    },
    {
      id: 'shot_demo_002',
      number: 'SC-002',
      description: '主角从咖啡厅走出来，手拿咖啡杯，神色匆忙',
      duration: 3.5,
      type: 'medium',
      angle: 'eye',
      camera: 'track',
      notes: '跟拍镜头',
      created: new Date().toISOString()
    },
    {
      id: 'shot_demo_003',
      number: 'SC-003',
      description: '特写：咖啡杯上的热气袅袅升起',
      duration: 2.0,
      type: 'close',
      angle: 'eye',
      camera: 'static',
      notes: '细节镜头',
      created: new Date().toISOString()
    },
    {
      id: 'shot_demo_004',
      number: 'SC-004',
      description: '低角度仰拍，主角抬头看天空，表情凝重',
      duration: 4.0,
      type: 'medium',
      angle: 'low',
      camera: 'static',
      notes: '表现内心戏',
      created: new Date().toISOString()
    },
    {
      id: 'shot_demo_005',
      number: 'SC-005',
      description: '鸟瞰视角，十字路口人来人往，主角在人群中穿行',
      duration: 6.0,
      type: 'wide',
      angle: 'bird',
      camera: 'pan',
      notes: '大场景调度',
      created: new Date().toISOString()
    },
    {
      id: 'shot_demo_006',
      number: 'SC-006',
      description: '过肩镜头，主角与陌生人对话，背景虚化',
      duration: 4.5,
      type: 'over',
      angle: 'eye',
      camera: 'static',
      notes: '对话场景',
      created: new Date().toISOString()
    },
    {
      id: 'shot_demo_007',
      number: 'SC-008',
      description: '手持摄影，紧张追逐场景，镜头晃动增加紧迫感',
      duration: 8.0,
      type: 'medium',
      angle: 'eye',
      camera: 'hand',
      notes: '动作戏',
      created: new Date().toISOString()
    },
    {
      id: 'shot_demo_008',
      number: 'SC-009',
      description: '大特写：主角眼睛，眼神坚定',
      duration: 3.0,
      type: 'extreme',
      angle: 'eye',
      camera: 'zoom',
      notes: '情绪高潮',
      created: new Date().toISOString()
    }
  ];
  
  AppState.shots = demoShots;
  AppState.currentProject = {
    name: '🦞 分镜 Demo 项目',
    title: '🦞 分镜 Demo 项目',
    created: new Date().toISOString(),
    modified: new Date().toISOString()
  };
  AppState.selectedShotId = null;
  AppState.isModified = false;
  
  // 先更新 UI 再渲染列表
  updateTitleDisplay();
  updateStatus();
  renderShotList();
  updateEditor();
  updatePreview();
  updateDesktopPreview();
  
  // 保存到 localStorage
  try {
    localStorage.setItem('storyboard_shots', JSON.stringify(AppState.shots));
    localStorage.setItem('storyboard_project', JSON.stringify(AppState.currentProject));
    console.log('💾 Demo 数据已保存到 localStorage');
  } catch(e) {
    console.error('保存 Demo 数据失败:', e);
  }
  
  console.log(`✅ Demo 数据已加载，共 ${AppState.shots.length} 个镜头`);
}

// 自动保存到 localStorage
function autoSave() {
  if (!AppState.currentProject || AppState.shots.length === 0) {
    return;
  }
  
  try {
    localStorage.setItem('storyboard_shots', JSON.stringify(AppState.shots));
    localStorage.setItem('storyboard_project', JSON.stringify(AppState.currentProject));
  } catch(e) {
    console.error('自动保存失败:', e);
  }
}

// 从 localStorage 恢复
function restoreFromStorage() {
  try {
    const savedShots = localStorage.getItem('storyboard_shots');
    const savedProject = localStorage.getItem('storyboard_project');
    
    if (savedShots && savedProject) {
      AppState.shots = JSON.parse(savedShots);
      AppState.currentProject = JSON.parse(savedProject);
      
      // 同步标题输入框（PC 和移动端）
      const title = AppState.currentProject.title || '';
      if (elements.projectTitlePc) elements.projectTitlePc.value = title;
      if (elements.projectTitleMobile) elements.projectTitleMobile.value = title;
      
      renderShotList();
      updateEditor();
      updateStatus();
      clearPreview();
      
      return true;
    }
  } catch(e) {
    console.error('恢复数据失败:', e);
  }
  return false;
}

// 启动自动保存
function startAutoSave() {
  if (AppState.autoSaveTimer) {
    clearInterval(AppState.autoSaveTimer);
  }
  AppState.autoSaveTimer = setInterval(() => {
    if (AppState.isModified) {
      autoSave();
      AppState.isModified = false;
      elements.statusSaved.textContent = '✅ 已自动保存';
      elements.statusSaved.style.color = '#52c41a';
      setTimeout(() => {
        if (!AppState.isModified) {
          elements.statusSaved.textContent = '✅ 已保存';
          elements.statusSaved.style.color = '#a0a0a0';
        }
      }, 2000);
    }
  }, AppState.autoSaveInterval);
}

// 初始化应用
function init() {
  initElements(); // 先初始化 DOM 元素
  bindEvents();
  
  // 检查 URL 参数，如果有 demo=1 则加载测试数据
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('demo') === '1' || urlParams.get('test') === '1') {
    // 清空 localStorage 避免冲突
    localStorage.removeItem('storyboard_shots');
    localStorage.removeItem('storyboard_project');
    createNewProject(true);
    loadDemoData();
  } else {
    // 尝试从 localStorage 恢复
    const restored = restoreFromStorage();
    if (!restored) {
      createNewProject(true);
    }
  }
  
  // 启动自动保存
  startAutoSave();
}

// 绑定事件
function bindEvents() {
  // 移动端菜单控制
  if (elements.btnMenuToggle && elements.sideMenu && elements.menuOverlay) {
    elements.btnMenuToggle.addEventListener('click', openSideMenu);
    elements.btnMenuClose.addEventListener('click', closeSideMenu);
    elements.menuOverlay.addEventListener('click', closeSideMenu);
  }
  
  // 移动端添加镜头按钮（关闭菜单）
  if (elements.btnAddShotMobile) {
    elements.btnAddShotMobile.addEventListener('click', () => {
      addNewShot();
      closeSideMenu();
    });
  }
  
  // 添加镜头按钮
  if (elements.btnAddShotDesktop) {
    elements.btnAddShotDesktop.addEventListener('click', addNewShot);
  }
  if (elements.btnAddShotMobile) {
    elements.btnAddShotMobile.addEventListener('click', () => {
      addNewShot();
      closeSideMenu();
    });
  }
  
  // 项目标题编辑 - PC 端（readonly 切换模式）
  if (elements.projectTitlePc) {
    elements.projectTitlePc.addEventListener('click', () => {
      if (elements.projectTitlePc.hasAttribute('readonly')) {
        elements.projectTitlePc.removeAttribute('readonly');
        elements.projectTitlePc.focus();
        elements.projectTitlePc.select();
      }
    });
    // 失焦提交
    elements.projectTitlePc.addEventListener('blur', () => {
      hideTitleInputPc();
    });
    // Enter 键提交
    elements.projectTitlePc.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        elements.projectTitlePc.blur();
      }
    });
  }
  
  // 项目标题编辑 - 移动端（readonly 切换模式）
  if (elements.projectTitleMobile) {
    elements.projectTitleMobile.addEventListener('click', () => {
      if (elements.projectTitleMobile.hasAttribute('readonly')) {
        // 进入编辑模式
        elements.projectTitleMobile.removeAttribute('readonly');
        elements.projectTitleMobile.focus();
        elements.projectTitleMobile.select();
      }
    });
    // 失焦提交
    elements.projectTitleMobile.addEventListener('blur', () => {
      hideTitleInputMobile();
    });
    // Enter 键提交
    elements.projectTitleMobile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        elements.projectTitleMobile.blur();
      }
    });
  }
  
  // 移动端面包屑导航切换
  if (elements.mobileBreadcrumb) {
    elements.mobileBreadcrumb.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('breadcrumb-item')) {
        const panel = e.target.dataset.panel;
        switchMobilePanel(panel);
      }
    });
  }
  
  // 统一绑定按钮事件
  const buttonEvents = {
    // 项目操作
    btnNew: () => createNewProject(false),
    btnOpen: openProject,
    btnSave: saveProject,
    btnNewMobile: () => createNewProject(false),
    btnOpenMobile: openProject,
    btnSaveMobile: saveProject,
    // 导出操作
    btnExportPdf: exportToPDF,
    btnExportPdfMobile: exportToPDF,
    // 镜头操作
    btnDeleteShot: deleteSelectedShot,
    btnSaveShot: saveCurrentShot,
    btnDuplicateShot: duplicateSelectedShot,
    btnDeleteShotDesktop: deleteSelectedShot,
    btnSaveShotDesktop: saveCurrentShot,
    btnDuplicateShotDesktop: duplicateSelectedShot,
    btnDeleteShotMobile: deleteSelectedShot,
    btnSaveShotMobile: saveCurrentShot,
    btnDuplicateShotMobile: duplicateSelectedShot,
  };
  
  Object.entries(buttonEvents).forEach(([id, handler]) => {
    if (elements[id]) {
      elements[id].addEventListener('click', handler);
    }
  });
  
  // 镜头操作
  if (elements.btnDeleteShot) elements.btnDeleteShot.addEventListener('click', deleteSelectedShot);
  if (elements.btnSaveShot) elements.btnSaveShot.addEventListener('click', saveCurrentShot);
  if (elements.btnDuplicateShot) elements.btnDuplicateShot.addEventListener('click', duplicateSelectedShot);
  
  // 导出操作
  if (elements.btnExportImg) elements.btnExportImg.addEventListener('click', exportToImage);
  
  // 画面上传操作（移动端）
  if (elements.btnUploadShot && elements.shotThumbnail) {
    elements.btnUploadShot.addEventListener('click', () => {
      if (!AppState.selectedShotId) {
        alert('请先选择一个镜头');
        return;
      }
      elements.shotThumbnail.click();
    });
    elements.shotThumbnail.addEventListener('change', handleThumbnailUpload);
  }
  
  // 画面上传操作（桌面端）
  if (elements.btnUploadShotDesktop) {
    elements.btnUploadShotDesktop.addEventListener('click', () => {
      if (!AppState.selectedShotId) {
        alert('请先选择一个镜头');
        return;
      }
      elements.shotThumbnailDesktop.click();
    });
    elements.shotThumbnailDesktop.addEventListener('change', handleThumbnailUploadDesktop);
  }
  
  // 桌面端镜头操作按钮
  if (elements.btnSaveShotDesktop) {
    elements.btnSaveShotDesktop.addEventListener('click', saveCurrentShot);
  }
  if (elements.btnDuplicateShotDesktop) {
    elements.btnDuplicateShotDesktop.addEventListener('click', duplicateSelectedShot);
  }
  if (elements.btnDeleteShotDesktop) {
    elements.btnDeleteShotDesktop.addEventListener('click', deleteSelectedShot);
  }
  
  // 移动端镜头操作按钮
  if (elements.btnSaveShotMobile) {
    elements.btnSaveShotMobile.addEventListener('click', saveCurrentShot);
  }
  if (elements.btnDuplicateShotMobile) {
    elements.btnDuplicateShotMobile.addEventListener('click', duplicateSelectedShot);
  }
  if (elements.btnDeleteShotMobile) {
    elements.btnDeleteShotMobile.addEventListener('click', deleteSelectedShot);
  }
  
  // 表单自动保存（失焦时自动保存）
  const formInputs = elements.shotEditor.querySelectorAll('input, textarea, select');
  formInputs.forEach(input => {
    input.addEventListener('blur', () => {
      if (AppState.selectedShotId) {
        saveCurrentShot();
      }
    });
  });
  
  // 撤销/重做快捷键
  document.addEventListener('keydown', handleUndoRedo);
}

// 显示标题输入框
function showTitleInput() {
  // PC 端（readonly 模式）
  if (elements.projectTitlePc) {
    elements.projectTitlePc.removeAttribute('readonly');
    elements.projectTitlePc.focus();
    elements.projectTitlePc.select();
  }
  
  // 移动端（readonly 模式）
  if (elements.projectTitleMobile) {
    elements.projectTitleMobile.removeAttribute('readonly');
    elements.projectTitleMobile.focus();
    elements.projectTitleMobile.select();
  }
}

// 隐藏标题输入框（PC 端 - readonly 模式）
function hideTitleInputPc() {
  if (elements.projectTitlePc) {
    const newTitle = elements.projectTitlePc.value.trim();
    if (AppState.currentProject) {
      AppState.currentProject.title = newTitle;
      AppState.currentProject.name = newTitle || '未命名项目';
      markAsModified();
      updateTitleDisplay();
      updateStatus();
    }
    elements.projectTitlePc.setAttribute('readonly', 'readonly');
  }
}

// 隐藏标题输入框（移动端 - readonly 模式）
function hideTitleInputMobile() {
  if (elements.projectTitleMobile) {
    const newTitle = elements.projectTitleMobile.value.trim();
    if (AppState.currentProject) {
      AppState.currentProject.title = newTitle;
      AppState.currentProject.name = newTitle || '未命名项目';
      markAsModified();
      updateTitleDisplay();
      updateStatus();
    }
    elements.projectTitleMobile.setAttribute('readonly', 'readonly');
  }
}

// 更新标题显示
function updateTitleDisplay() {
  const title = AppState.currentProject?.title || '未命名项目';
  if (elements.projectTitlePc) elements.projectTitlePc.value = title;
  if (elements.projectTitleMobile) elements.projectTitleMobile.value = title;
}

// 处理撤销/重做快捷键
function handleUndoRedo(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      redo();
    } else {
      undo();
    }
  }
}

// 创建新项目
function createNewProject(skipConfirm) {
  if (!skipConfirm) {
    // 检查是否有本地保存的数据
    const hasSavedData = localStorage.getItem('storyboard_shots') || localStorage.getItem('storyboard_project');
    
    if (hasSavedData) {
      const confirmed = confirm('⚠️ 风险提示\n\n新建项目将清除当前本地自动保存的数据！\n\n如果您需要保留当前项目，请先点击"💾 保存"按钮下载备份。\n\n确定要继续吗？');
      if (!confirmed) {
        return;
      }
      // 清除本地自动保存的数据
      localStorage.removeItem('storyboard_shots');
      localStorage.removeItem('storyboard_project');
    } else if (AppState.isModified && !confirm('当前项目有未保存的更改，确定要新建项目吗？')) {
      return;
    }
  }
  
  AppState.currentProject = {
    name: '未命名项目',
    title: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString()
  };
  AppState.shots = [];
  AppState.selectedShotId = null;
  AppState.isModified = false;
  AppState.projectPath = null;
  
  // 重置标题显示
  if (elements.projectTitlePc) {
    elements.projectTitlePc.value = '';
  }
  if (elements.projectTitleMobile) {
    elements.projectTitleMobile.value = '';
  }
  
  // 初始化历史记录
  initHistory();
  
  renderShotList();
  updateEditor();
  updatePreview();
  updateDesktopPreview();
  updateStatus();
  updateTitleDisplay();
  clearPreview();
}

// 添加新镜头
function addNewShot() {
  // 找到最大编号
  let maxNum = 0;
  AppState.shots.forEach(shot => {
    const match = shot.number.match(/SC-(\d+)/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNum) maxNum = num;
    }
  });
  
  const newShot = {
    id: generateShotId(),
    number: `SC-${String(maxNum + 1).padStart(3, '0')}`,
    description: '',
    duration: 3.0,
    type: 'wide',
    angle: 'eye',
    camera: 'static',
    notes: '',
    dialogue: '',
    narration: '',
    ambience: '',
    created: new Date().toISOString()
  };
  
  AppState.shots.push(newShot);
  AppState.selectedShotId = newShot.id;
  saveHistory();
  markAsModified();
  
  renderShotList();
  updateEditor();
  updatePreview();
  updateDesktopPreview();
  updateShotActionsDisplay();
  updateStatus();
}

// 生成镜头 ID
function generateShotId() {
  return 'shot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 获取时长条颜色
function getDurationColor(duration) {
  if (duration < 3) return '#52c41a'; // 绿色 - 短
  if (duration <= 5) return '#faad14'; // 黄色 - 中
  return '#ff4d4f'; // 红色 - 长
}

// 渲染镜头列表
function renderShotList() {
  const lists = [elements.shotList];
  if (elements.shotListDesktop) {
    lists.push(elements.shotListDesktop);
  }
  
  lists.forEach(list => {
    if (!list) return;
    list.innerHTML = '';
    
    if (AppState.shots.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <p style="margin-bottom:20px;font-size:16px;">📭 暂无镜头</p>
          <button class="btn btn-primary" onclick="addNewShot()" style="padding:12px 32px;font-size:15px;">➕ 添加第一个镜头</button>
        </div>
      `;
      return;
    }
    
    AppState.shots.forEach((shot, index) => {
      const shotEl = document.createElement('div');
      shotEl.className = `shot-item ${shot.id === AppState.selectedShotId ? 'selected' : ''}`;
      shotEl.draggable = true;
      shotEl.dataset.index = index;
      shotEl.dataset.id = shot.id;
      
      // 计算时长条宽度（CONFIG.MAX_DURATION 秒为 100%）
      const durationPercent = Math.min(shot.duration / CONFIG.MAX_DURATION, 1) * 100;
      const durationColor = getDurationColor(shot.duration);
      
      shotEl.innerHTML = `
        <div class="shot-item-header">
          <span class="shot-number">${shot.number}</span>
          <span class="shot-duration">${shot.duration}s</span>
        </div>
        ${shot.thumbnailData ? `<div class="shot-thumbnail"><img src="${shot.thumbnailData}" alt="预览"></div>` : ''}
        <div class="shot-description">${shot.description || '无描述'}</div>
        <div class="duration-bar">
          <div class="duration-fill" style="width: ${durationPercent}%; background-color: ${durationColor};"></div>
        </div>
      `;
      
      shotEl.addEventListener('click', () => selectShot(shot.id));
      
      // PC 端拖动
      shotEl.addEventListener('dragstart', handleDragStart);
      shotEl.addEventListener('dragover', handleDragOver);
      shotEl.addEventListener('drop', handleDrop);
      shotEl.addEventListener('dragend', handleDragEnd);
      
      // 移动端触摸拖动
      shotEl.addEventListener('touchstart', handleTouchStart, { passive: true });
      shotEl.addEventListener('touchmove', handleTouchMove, { passive: false });
      shotEl.addEventListener('touchend', handleTouchEnd);
      
      list.appendChild(shotEl);
    });
  });
}

// 选择镜头
function selectShot(shotId) {
  AppState.selectedShotId = shotId;
  renderShotList();
  updateEditor();
  updatePreview();
  updateDesktopPreview();
  updateShotActionsDisplay();
}

// 压缩图片（使用 Canvas）
function compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        // 计算缩放比例
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // 创建 Canvas 并压缩
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // 压缩为 JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // 计算压缩后的大小
        const head = 'data:image/jpeg;base64,';
        const fileSize = Math.round((compressedDataUrl.length - head.length) * 3 / 4 / 1024);
        
        resolve({
          dataUrl: compressedDataUrl,
          width: width,
          height: height,
          fileSize: fileSize,
          originalSize: Math.round(file.size / 1024)
        });
      };
      img.onerror = function() {
        reject(new Error('图片加载失败'));
      };
      img.src = event.target.result;
    };
    reader.onerror = function() {
      reject(new Error('文件读取失败'));
    };
    reader.readAsDataURL(file);
  });
}

// 处理画面上传
async function handleThumbnailUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const shot = AppState.shots.find(s => s.id === AppState.selectedShotId);
  if (!shot) {
    alert('请先选择一个镜头');
    return;
  }
  
  showStatusMessage('🔄 正在压缩图片...');
  
  try {
    // 自动压缩图片
    const compressed = await compressImage(file, CONFIG.IMAGE_MAX_SIZE, CONFIG.IMAGE_MAX_SIZE, CONFIG.IMAGE_QUALITY);
    
    // 保存压缩后的图片
    shot.thumbnail = file.name;
    shot.thumbnailData = compressed.dataUrl;
    shot.thumbnailWidth = compressed.width;
    shot.thumbnailHeight = compressed.height;
    shot.modified = new Date().toISOString();
    
    saveHistory();
    markAsModified();
    renderShotList();
    updatePreview();
    updateDesktopPreview();
    
    const savedSize = Math.round((1 - compressed.fileSize / compressed.originalSize) * 100);
    showStatusMessage(`✅ 画面已上传：${file.name} (压缩 ${savedSize}%)`);
    
  } catch(error) {
    console.error('图片压缩失败:', error);
    alert('图片处理失败：' + error.message);
  }
  
  // 清空 input
  elements.shotThumbnail.value = '';
}

// 桌面端画面上传
async function handleThumbnailUploadDesktop(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const shot = AppState.shots.find(s => s.id === AppState.selectedShotId);
  if (!shot) {
    alert('请先选择一个镜头');
    return;
  }
  
  showStatusMessage('🔄 正在压缩图片...');
  
  try {
    // 自动压缩图片
    const compressed = await compressImage(file, CONFIG.IMAGE_MAX_SIZE, CONFIG.IMAGE_MAX_SIZE, CONFIG.IMAGE_QUALITY);
    
    // 保存压缩后的图片
    shot.thumbnail = file.name;
    shot.thumbnailData = compressed.dataUrl;
    shot.thumbnailWidth = compressed.width;
    shot.thumbnailHeight = compressed.height;
    shot.modified = new Date().toISOString();
    
    saveHistory();
    markAsModified();
    renderShotList();
    updatePreview();
    updateDesktopPreview();
    
    const savedSize = Math.round((1 - compressed.fileSize / compressed.originalSize) * 100);
    showStatusMessage(`✅ 画面已上传：${file.name} (压缩 ${savedSize}%)`);
    
  } catch(error) {
    console.error('图片压缩失败:', error);
    alert('图片处理失败：' + error.message);
  }
  
  // 清空 input
  elements.shotThumbnailDesktop.value = '';
}

// 更新编辑器
function updateEditor() {
  const shot = AppState.shots.find(s => s.id === AppState.selectedShotId);
  
  if (shot) {
    elements.shotEditor.classList.add('active');
    elements.noSelection.style.display = 'none';
    
    elements.shotNumber.value = shot.number;
    elements.shotDescription.value = shot.description || '';
    elements.shotDuration.value = shot.duration;
    elements.shotType.value = shot.type;
    elements.shotAngle.value = shot.angle;
    elements.shotCamera.value = shot.camera;
    elements.shotNotes.value = shot.notes || '';
    elements.shotDialogue.value = shot.dialogue || '';
    elements.shotNarration.value = shot.narration || '';
    elements.shotAmbience.value = shot.ambience || '';
    
    // 显示操作按钮和 AI 按钮
    if (elements.shotActionsContainer) {
      elements.shotActionsContainer.style.display = 'flex';
    }
    if (elements.aiButtonsContainer) {
      elements.aiButtonsContainer.style.display = 'flex';
    }
  } else {
    elements.shotEditor.classList.remove('active');
    elements.noSelection.style.display = 'flex';
    
    // 隐藏操作按钮和 AI 按钮
    if (elements.shotActionsContainer) {
      elements.shotActionsContainer.style.display = 'none';
    }
    if (elements.aiButtonsContainer) {
      elements.aiButtonsContainer.style.display = 'none';
    }
  }
}

// 保存当前镜头（静默保存，不刷新 UI）
function saveCurrentShot() {
  const shot = AppState.shots.find(s => s.id === AppState.selectedShotId);
  if (!shot) return;
  
  shot.description = elements.shotDescription.value.trim();
  shot.duration = parseFloat(elements.shotDuration.value) || 3.0;
  shot.type = elements.shotType.value;
  shot.angle = elements.shotAngle.value;
  shot.camera = elements.shotCamera.value;
  shot.notes = elements.shotNotes.value.trim();
  shot.dialogue = elements.shotDialogue.value.trim();
  shot.narration = elements.shotNarration.value.trim();
  shot.ambience = elements.shotAmbience.value.trim();
  shot.modified = new Date().toISOString();
  
  saveHistory();
  markAsModified();
}

// 删除选中的镜头
function deleteSelectedShot() {
  if (!AppState.selectedShotId) {
    alert('请先选择一个镜头');
    return;
  }
  
  if (!confirm('确定要删除这个镜头吗？')) return;
  
  AppState.shots = AppState.shots.filter(s => s.id !== AppState.selectedShotId);
  AppState.selectedShotId = null;
  saveHistory();
  markAsModified();
  
  // 重新编号
  AppState.shots.forEach((shot, index) => {
    shot.number = `SC-${String(index + 1).padStart(3, '0')}`;
  });
  
  renderShotList();
  updateEditor();
  clearPreview();
  updateDesktopPreview();
  updateShotActionsDisplay();
  updateStatus();
}

// 更新预览
function updatePreview() {
  const shot = AppState.shots.find(s => s.id === AppState.selectedShotId);
  if (!shot) return;
  
  const ctx = elements.previewCanvas.getContext('2d');
  const canvas = elements.previewCanvas;
  
  // 清空画布
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 如果有上传的画面，显示画面
  if (shot.thumbnailData) {
    const img = new Image();
    img.onload = function() {
      // 计算缩放比例（保持比例填充）
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      // 绘制镜头信息
      drawShotInfo(ctx, canvas, shot);
    };
    img.onerror = function() {
      console.error('图片加载失败');
    };
    img.src = shot.thumbnailData; // 使用 DataURL
  } else {
    // 绘制分镜格子（三分线、安全框）
    drawStoryboardGrid(ctx, canvas);
    
    // 绘制镜头编号
    ctx.fillStyle = '#eaeaea';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(shot.number, canvas.width / 2, canvas.height / 2 - 20);
    
    // 绘制时长
    ctx.fillStyle = '#4a9eff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`${shot.duration}秒`, canvas.width / 2, canvas.height / 2 + 20);
    
    // 绘制类型
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '14px Arial';
    ctx.fillText(getShotTypeName(shot.type), canvas.width / 2, canvas.height / 2 + 50);
  }
  
  // 更新预览信息
  elements.previewShotNumber.textContent = `镜头：${shot.number}`;
  elements.previewShotType.textContent = `类型：${getShotTypeName(shot.type)}`;
  elements.previewShotDuration.textContent = `时长：${shot.duration}秒`;
}

// 更新桌面端预览
function updateDesktopPreview() {
  const shot = AppState.shots.find(s => s.id === AppState.selectedShotId);
  if (!shot || !elements.previewCanvasDesktop) return;
  
  const ctx = elements.previewCanvasDesktop.getContext('2d');
  const canvas = elements.previewCanvasDesktop;
  
  // 清空画布
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 如果有上传的画面，显示画面
  if (shot.thumbnailData) {
    const img = new Image();
    img.onload = function() {
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      drawShotInfo(ctx, canvas, shot);
    };
    img.src = shot.thumbnailData;
  } else {
    drawStoryboardGrid(ctx, canvas);
    ctx.fillStyle = '#eaeaea';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(shot.number, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = '#4a9eff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`${shot.duration}秒`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '14px Arial';
    ctx.fillText(getShotTypeName(shot.type), canvas.width / 2, canvas.height / 2 + 50);
  }
  
  // 更新预览信息
  if (elements.previewShotNumberDesktop) elements.previewShotNumberDesktop.textContent = `镜头：${shot.number}`;
  if (elements.previewShotTypeDesktop) elements.previewShotTypeDesktop.textContent = `类型：${getShotTypeName(shot.type)}`;
  if (elements.previewShotDurationDesktop) elements.previewShotDurationDesktop.textContent = `时长：${shot.duration}秒`;
}

// 绘制镜头信息（叠加在画面上）
function drawShotInfo(ctx, canvas, shot) {
  // 底部信息栏背景
  const infoHeight = 60;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, canvas.height - infoHeight, canvas.width, infoHeight);
  
  // 镜头信息
  ctx.fillStyle = '#eaeaea';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`${shot.number} - ${getShotTypeName(shot.type)}`, 10, canvas.height - infoHeight + 25);
  
  ctx.font = '14px Arial';
  ctx.fillStyle = '#a0a0a0';
  ctx.fillText(`时长：${shot.duration}秒`, 10, canvas.height - infoHeight + 45);
}

// 绘制分镜格子（三分线、安全框）
function drawStoryboardGrid(ctx, canvas) {
  const width = canvas.width;
  const height = canvas.height;
  
  // 绘制安全框（80% 区域）
  const safeMargin = 0.1;
  const safeX = width * safeMargin;
  const safeY = height * safeMargin;
  const safeW = width * (1 - 2 * safeMargin);
  const safeH = height * (1 - 2 * safeMargin);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(safeX, safeY, safeW, safeH);
  ctx.setLineDash([]);
  
  // 绘制三分线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  
  // 垂直三分线
  const thirdW = width / 3;
  ctx.beginPath();
  ctx.moveTo(thirdW, 0);
  ctx.lineTo(thirdW, height);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(thirdW * 2, 0);
  ctx.lineTo(thirdW * 2, height);
  ctx.stroke();
  
  // 水平三分线
  const thirdH = height / 3;
  ctx.beginPath();
  ctx.moveTo(0, thirdH);
  ctx.lineTo(width, thirdH);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(0, thirdH * 2);
  ctx.lineTo(width, thirdH * 2);
  ctx.stroke();
  
  // 绘制中心点
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 3, 0, Math.PI * 2);
  ctx.fill();
}

// 获取镜头类型中文名
function getShotTypeName(type) {
  const names = {
    wide: '全景',
    medium: '中景',
    close: '特写',
    extreme: '大特写',
    over: '过肩镜头',
    point: '主观视角'
  };
  return names[type] || type;
}

// 清除预览
function clearPreview() {
  const ctx = elements.previewCanvas.getContext('2d');
  const canvas = elements.previewCanvas;
  
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#a0a0a0';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('无选中镜头', canvas.width / 2, canvas.height / 2);
  
  elements.previewShotNumber.textContent = '镜头：--';
  elements.previewShotType.textContent = '类型：--';
  elements.previewShotDuration.textContent = '时长：--';
}

// 标记为已修改并立即保存
function markAsModified() {
  AppState.isModified = true;
  if (AppState.currentProject) {
    AppState.currentProject.modified = new Date().toISOString();
  }
  if (elements.statusSaved) {
    elements.statusSaved.textContent = '⏳ 自动保存...';
    elements.statusSaved.style.color = '#faad14';
  }
  
  // 保存到 localStorage 供导出页面使用
  try {
    localStorage.setItem('storyboard_shots', JSON.stringify(AppState.shots));
    localStorage.setItem('storyboard_project', JSON.stringify(AppState.currentProject));
    AppState.isModified = false; // 保存后重置状态
    if (elements.statusSaved) {
      elements.statusSaved.textContent = '✅ 已自动保存';
      elements.statusSaved.style.color = '#52c41a';
      setTimeout(() => {
        if (!AppState.isModified && elements.statusSaved) {
          elements.statusSaved.textContent = '✅ 已保存';
          elements.statusSaved.style.color = '#a0a0a0';
        }
      }, 1500);
    }
  } catch(e) {
    console.error('保存失败:', e);
    elements.statusSaved.textContent = '❌ 保存失败';
    elements.statusSaved.style.color = '#ff4d4f';
  }
}

// 移动端侧边菜单控制
function openSideMenu() {
  if (elements.sideMenu) {
    elements.sideMenu.classList.add('open');
    if (elements.menuOverlay) {
      elements.menuOverlay.classList.add('open');
    }
  }
}

function closeSideMenu() {
  if (elements.sideMenu) {
    elements.sideMenu.classList.remove('open');
    if (elements.menuOverlay) {
      elements.menuOverlay.classList.remove('open');
    }
  }
}

// 移动端面板切换
function switchMobilePanel(panel) {
  const editorContainer = document.getElementById('editor-container');
  const previewContainer = document.getElementById('preview-container');
  const shotActionsContainer = document.getElementById('shot-actions-container');
  const breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
  
  // 切换编辑器和预览容器
  if (panel === 'editor') {
    if (editorContainer) editorContainer.style.display = 'block';
    if (previewContainer) previewContainer.style.display = 'none';
  } else if (panel === 'preview') {
    if (editorContainer) editorContainer.style.display = 'none';
    if (previewContainer) previewContainer.style.display = 'block';
    // 切换到预览时更新 canvas
    updateMobilePreview();
  }
  
  // 显示/隐藏镜头操作按钮（编辑和预览都显示）
  if (shotActionsContainer) {
    shotActionsContainer.style.display = AppState.selectedShotId ? 'flex' : 'none';
  }
  
  // 桌面端镜头操作按钮
  if (elements.shotActionsContainerDesktop) {
    elements.shotActionsContainerDesktop.style.display = AppState.selectedShotId ? 'flex' : 'none';
  }
  
  // 更新激活状态
  breadcrumbItems.forEach(item => {
    if (item.dataset.panel === panel) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// 监听窗口大小变化，屏幕旋转时自动恢复布局
let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
  const currentWidth = window.innerWidth;
  
  // 从竖屏切换到横屏（或手机→PC）
  if (lastWidth < 768 && currentWidth >= 768) {
    const editorContainer = document.getElementById('editor-container');
    const previewContainer = document.getElementById('preview-container');
    const breadcrumb = document.getElementById('mobile-breadcrumb');
    
    // 重置为 PC 布局
    if (editorContainer) editorContainer.style.display = 'block';
    if (previewContainer) previewContainer.style.display = 'none';
    if (breadcrumb) breadcrumb.style.display = 'none';
  }
  
  lastWidth = currentWidth;
});

// 更新镜头操作按钮显示
function updateShotActionsDisplay() {
  // PC 端
  if (elements.shotActionsContainer) {
    elements.shotActionsContainer.style.display = AppState.selectedShotId ? 'flex' : 'none';
  }
  if (elements.shotActionsContainerDesktop) {
    elements.shotActionsContainerDesktop.style.display = AppState.selectedShotId ? 'flex' : 'none';
  }
  
  // 移动端
  if (elements.shotActionsContainerMobile) {
    elements.shotActionsContainerMobile.style.display = AppState.selectedShotId ? 'flex' : 'none';
  }
}

// 更新移动端预览
function updateMobilePreview() {
  if (!elements.previewCanvas || !AppState.selectedShotId) return;
  
  const shot = AppState.shots.find(s => s.id === AppState.selectedShotId);
  if (!shot) return;
  
  // 更新预览信息
  if (elements.previewShotNumber) elements.previewShotNumber.textContent = `镜头：${shot.number}`;
  if (elements.previewShotType) elements.previewShotType.textContent = `类型：${ShotTypeIcons[shot.type] || shot.type}`;
  if (elements.previewShotDuration) elements.previewShotDuration.textContent = `时长：${shot.duration}秒`;
}

// 更新状态栏
function updateStatus() {
  elements.statusProject.textContent = `项目：${AppState.currentProject?.name || '未命名'}`;
  elements.statusShots.textContent = `镜头数：${AppState.shots.length}`;
  
  // 更新标题显示
  updateTitleDisplay();
}

// 显示状态消息
function showStatusMessage(message) {
  elements.statusSaved.textContent = message;
  elements.statusSaved.style.color = '#52c41a';
  setTimeout(() => {
    if (AppState.isModified) {
      elements.statusSaved.textContent = '⚠️ 未保存';
      elements.statusSaved.style.color = '#faad14';
    } else {
      elements.statusSaved.textContent = '✅ 已保存';
      elements.statusSaved.style.color = '#a0a0a0';
    }
  }, 2000);
}

// 保存项目
async function saveProject() {
  if (AppState.shots.length === 0) {
    alert('暂无镜头可保存');
    return;
  }
  
  const projectData = {
    ...AppState.currentProject,
    shots: AppState.shots
  };
  
  // 使用 Electron API 保存文件（如果有）
  if (window.electronAPI && window.electronAPI.saveProject) {
    const result = await window.electronAPI.saveProject(projectData);
    if (result) {
      AppState.projectPath = result.path;
      AppState.currentProject.name = result.name;
      AppState.isModified = false;
      updateStatus();
      showStatusMessage('✅ 项目已保存');
    }
  } else {
    // 浏览器环境：下载 JSON 文件
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${AppState.currentProject.name || 'storyboard'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    AppState.isModified = false;
    showStatusMessage('✅ 项目已导出');
  }
  
  // 保存后更新 localStorage
  autoSave();
}

// 打开项目
async function openProject() {
  if (AppState.isModified && !confirm('当前项目有未保存的更改，确定要打开其他项目吗？')) {
    return;
  }
  
  // 使用 Electron API 打开文件（如果有）
  if (window.electronAPI && window.electronAPI.openProject) {
    const result = await window.electronAPI.openProject();
    if (result) {
      loadProjectData(result);
    }
  } else {
    // 浏览器环境：使用文件输入
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            loadProjectData(data);
          } catch (err) {
            alert('文件格式错误');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
}

// 加载项目数据
function loadProjectData(data) {
  AppState.currentProject = {
    name: data.name || '导入的项目',
    title: data.title || data.name || '导入的项目',
    created: data.created || new Date().toISOString(),
    modified: data.modified || new Date().toISOString()
  };
  AppState.shots = data.shots || [];
  AppState.selectedShotId = null;
  AppState.isModified = false;
  AppState.projectPath = null;
  
  // 初始化历史记录
  initHistory();
  
  renderShotList();
  updateEditor();
  clearPreview();
  updateStatus();
  
  // 同步标题输入框（PC 和移动端）
  const title = AppState.currentProject.title || '';
  if (elements.projectTitlePc) elements.projectTitlePc.value = title;
  if (elements.projectTitleMobile) elements.projectTitleMobile.value = title;
  
  showStatusMessage('✅ 项目已加载');
}

// 导出为 PDF
async function exportToPDF() {
  if (AppState.shots.length === 0) {
    alert('暂无镜头可导出');
    return;
  }
  
  // 打开新的打印页面
  const printWindow = window.open('export.html', '_blank');
  
  if (!printWindow) {
    alert('浏览器阻止了弹窗，请允许弹窗后重试');
    return;
  }
  
  showStatusMessage('✅ 已打开打印预览');
}

// 导出为图片
async function exportToImage() {
  if (AppState.shots.length === 0) {
    alert('暂无镜头可导出');
    return;
  }
  
  showStatusMessage('🔄 正在生成图片...');
  
  // 导出当前预览
  const canvas = elements.previewCanvas;
  const dataURL = canvas.toDataURL('image/png');
  
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = `storyboard_preview_${Date.now()}.png`;
  a.click();
  
  showStatusMessage('✅ 图片已导出');
}

// 拖拽排序相关
let dragSrcIndex = null;
let touchSrcIndex = null;
let touchTargetIndex = null;

function handleDragStart(e) {
  dragSrcIndex = parseInt(this.dataset.index);
  this.classList.add('dragging');
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
  }
}

function handleDragOver(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

function handleDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.shot-item').forEach(item => {
    item.classList.remove('drag-over');
  });
}

function handleDrop(e) {
  e.stopPropagation();
  
  const dragOverIndex = parseInt(this.dataset.index);
  
  if (dragSrcIndex !== dragOverIndex) {
    // 交换镜头位置
    const temp = AppState.shots[dragSrcIndex];
    AppState.shots[dragSrcIndex] = AppState.shots[dragOverIndex];
    AppState.shots[dragOverIndex] = temp;
    
    // 重新编号
    AppState.shots.forEach((shot, index) => {
      shot.number = `SC-${String(index + 1).padStart(3, '0')}`;
    });
    
    saveHistory();
    markAsModified();
    renderShotList();
    updateStatus();
  }
  
  return false;
}

// ==================== 移动端触摸拖动 ====================

function handleTouchStart(e) {
  touchSrcIndex = parseInt(this.dataset.index);
  this.classList.add('dragging');
}

function handleTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target && target.classList.contains('shot-item')) {
    touchTargetIndex = parseInt(target.dataset.index);
    document.querySelectorAll('.shot-item').forEach(item => {
      item.classList.remove('drag-over');
    });
    target.classList.add('drag-over');
  }
}

function handleTouchEnd(e) {
  this.classList.remove('dragging');
  document.querySelectorAll('.shot-item').forEach(item => {
    item.classList.remove('drag-over');
  });
  
  if (touchSrcIndex !== null && touchTargetIndex !== null && touchSrcIndex !== touchTargetIndex) {
    // 交换镜头位置
    const temp = AppState.shots[touchSrcIndex];
    AppState.shots[touchSrcIndex] = AppState.shots[touchTargetIndex];
    AppState.shots[touchTargetIndex] = temp;
    
    // 重新编号
    AppState.shots.forEach((shot, index) => {
      shot.number = `SC-${String(index + 1).padStart(3, '0')}`;
    });
    
    saveHistory();
    markAsModified();
    renderShotList();
    updateStatus();
  }
  
  touchSrcIndex = null;
  touchTargetIndex = null;
}

// ==================== 撤销/重做功能 ====================

// 保存历史状态
function saveHistory() {
  // 如果当前有未提交的历史，删除后续历史
  if (AppState.historyIndex < AppState.history.length - 1) {
    AppState.history = AppState.history.slice(0, AppState.historyIndex + 1);
  }
  
  // 保存当前状态
  const state = {
    shots: JSON.parse(JSON.stringify(AppState.shots)),
    selectedShotId: AppState.selectedShotId
  };
  
  AppState.history.push(state);
  
  // 限制历史记录数量
  if (AppState.history.length > AppState.maxHistorySteps) {
    AppState.history.shift();
  } else {
    AppState.historyIndex++;
  }
}

// 撤销
function undo() {
  if (AppState.historyIndex <= 0) {
    console.log('⚠️ 没有可撤销的操作');
    return;
  }
  
  AppState.historyIndex--;
  const state = AppState.history[AppState.historyIndex];
  
  AppState.shots = JSON.parse(JSON.stringify(state.shots));
  AppState.selectedShotId = state.selectedShotId;
  
  markAsModified();
  renderShotList();
  updateEditor();
  updatePreview();
  updateStatus();
  
  console.log('↩️ 撤销完成');
  showStatusMessage('↩️ 已撤销');
}

// 重做
function redo() {
  if (AppState.historyIndex >= AppState.history.length - 1) {
    console.log('⚠️ 没有可重做的操作');
    return;
  }
  
  AppState.historyIndex++;
  const state = AppState.history[AppState.historyIndex];
  
  AppState.shots = JSON.parse(JSON.stringify(state.shots));
  AppState.selectedShotId = state.selectedShotId;
  
  markAsModified();
  renderShotList();
  updateEditor();
  updatePreview();
  updateStatus();
  
  console.log('↪️ 重做完成');
  showStatusMessage('↪️ 已重做');
}

// 初始化历史（保存初始状态）
function initHistory() {
  AppState.history = [];
  AppState.historyIndex = -1;
  saveHistory();
}

// ==================== 镜头复制功能 ====================

// 复制选中的镜头
function duplicateSelectedShot() {
  if (!AppState.selectedShotId) {
    alert('请先选择一个镜头');
    return;
  }
  
  const originalShot = AppState.shots.find(s => s.id === AppState.selectedShotId);
  if (!originalShot) return;
  
  // 找到当前镜头的索引
  const currentIndex = AppState.shots.findIndex(s => s.id === AppState.selectedShotId);
  
  // 创建复制的镜头
  const duplicatedShot = {
    ...originalShot,
    id: generateShotId(),
    number: `SC-${String(currentIndex + 2).padStart(3, '0')}`,
    description: originalShot.description + ' (复制)',
    created: new Date().toISOString()
  };
  
  // 插入到原镜头后面
  AppState.shots.splice(currentIndex + 1, 0, duplicatedShot);
  
  // 重新编号所有镜头
  AppState.shots.forEach((shot, index) => {
    shot.number = `SC-${String(index + 1).padStart(3, '0')}`;
  });
  
  AppState.selectedShotId = duplicatedShot.id;
  saveHistory();
  markAsModified();
  renderShotList();
  updateEditor();
  updatePreview();
  updateStatus();
  
  showStatusMessage('📋 镜头已复制');
}

// 启动应用
// 使用立即执行 + DOMContentLoaded 双重保障，避免浏览器缓存导致 init 不执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// 自动调整文本框高度
function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  const newHeight = Math.min(textarea.scrollHeight, 300);
  textarea.style.height = newHeight + 'px';
}

// 自动调整文本框高度
