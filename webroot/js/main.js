/**
 * Crond4Android WebUI JS
 * 具有多语言(i18n)与多主题支持
 */

// --- 国际化字典 ---
const locales = {
    'zh-CN': {
        statusChecking: '检查中...',
        statusRunning: '运行中',
        statusStopped: '已停止',
        configTitle: 'Crontab 配置',
        btnSave: '保存配置',
        configPlaceholder: '正在加载配置文件...',
        configHint: '编辑后需点击保存，建议重启进程使其立即生效。',
        logTitle: '运行日志',
        btnClearLog: '清空',
        logLoading: '正在读取日志...',
        logEmpty: '日志为空',
        msgSaveSuccess: '配置保存成功！',
        msgSaveFailed: '保存失败: ',
        msgLogCleared: '日志已清空',
        msgLogClearFailed: '日志清空失败',
        msgRestarting: '进程重启指令已下发...',
        confirmClear: '确定要清空运行日志吗？',
        btnWait: '请稍候...',
        btnStart: '启动',
        btnStop: '停止',
        titleStart: '启动服务',
        titleStop: '停止服务',
        msgStarting: '正在启动服务...',
        msgStopping: '正在停止服务...',
        confirmTitle: '确认操作',
        btnConfirm: '确定',
        btnCancel: '取消',
        themeSystem: '主题：跟随系统',
        themeDark: '主题：深色模式',
        themeLight: '主题：浅色模式',
        btnSettings: '模块设置',
        settingsTitle: '模块设置',
        autoStartTitle: '开机自启动',
        autoStartDesc: '开机时自动启动 crond 服务（禁用即创建 MANUAL 文件）',
        keepDataTitle: '卸载保留数据',
        keepDataDesc: '卸载模块时保留配置与日志（创建 KEEP_ON_UNINSTALL 文件）',
        msgSettingUpdated: '设置已更新',
        msgSettingFailed: '设置更新失败: '
    },
    'en-US': {
        statusChecking: 'Checking...',
        statusRunning: 'Running',
        statusStopped: 'Stopped',
        configTitle: 'Crontab Config',
        btnSave: 'Save Config',
        configPlaceholder: 'Loading configuration...',
        configHint: 'Save after editing. Recommended to restart daemon to apply.',
        logTitle: 'Access Log',
        btnClearLog: 'Clear',
        logLoading: 'Reading logs...',
        logEmpty: 'Log is empty',
        msgSaveSuccess: 'Configuration saved successfully!',
        msgSaveFailed: 'Failed to save: ',
        msgLogCleared: 'Log cleared',
        msgLogClearFailed: 'Failed to clear log',
        msgRestarting: 'Restart command issued...',
        confirmClear: 'Are you sure you want to clear the logs?',
        btnWait: 'Wait...',
        btnStart: 'Start',
        btnStop: 'Stop',
        titleStart: 'Start Service',
        titleStop: 'Stop Service',
        msgStarting: 'Starting service...',
        msgStopping: 'Stopping service...',
        confirmTitle: 'Confirmation',
        btnConfirm: 'OK',
        btnCancel: 'Cancel',
        themeSystem: 'Theme: System',
        themeDark: 'Theme: Dark',
        themeLight: 'Theme: Light',
        btnSettings: 'Module Settings',
        settingsTitle: 'Settings',
        autoStartTitle: 'Auto-Start on Boot',
        autoStartDesc: 'Start crond daemon on boot (disabling creates MANUAL file)',
        keepDataTitle: 'Keep Data on Uninstall',
        keepDataDesc: 'Preserve crond directory when uninstalling (creates KEEP_ON_UNINSTALL file)',
        msgSettingUpdated: 'Setting updated',
        msgSettingFailed: 'Failed to update setting: '
    }
};

const I18n = {
    lang: 'zh-CN',

    init() {
        const savedLang = localStorage.getItem('crond_lang');
        if (savedLang && locales[savedLang]) {
            this.lang = savedLang;
        } else {
            // Auto detect
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang.startsWith('en')) this.lang = 'en-US';
            else this.lang = 'zh-CN';
        }
        this.updateDOM();
    },

    setLang(lang) {
        if (locales[lang]) {
            this.lang = lang;
            localStorage.setItem('crond_lang', lang);
            this.updateDOM();
        }
    },

    get(key) {
        return locales[this.lang][key] || key;
    },

    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (locales[this.lang][key]) {
                el.innerText = locales[this.lang][key];
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (locales[this.lang][key]) {
                el.setAttribute('placeholder', locales[this.lang][key]);
            }
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (locales[this.lang][key]) {
                el.setAttribute('title', locales[this.lang][key]);
            }
        });
        // 更新多语言按钮的当前显示文本
        const btnLang = document.getElementById('btnLang');
        if (btnLang) {
            btnLang.innerText = this.lang === 'zh-CN' ? 'EN' : '中';
        }
        // 更新主题按钮 tooltip 文本
        if (typeof Theme !== 'undefined' && Theme.apply) {
            Theme.apply();
        }
    }
};

// --- 主题管理 ---
const Theme = {
    mode: 'system', // 'system' | 'dark' | 'light'
    mediaQuery: window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null,

    init() {
        const savedTheme = localStorage.getItem('crond_theme');
        if (savedTheme === 'dark' || savedTheme === 'theme-dark') {
            this.mode = 'dark';
        } else if (savedTheme === 'light' || savedTheme === 'theme-light') {
            this.mode = 'light';
        } else {
            this.mode = 'system';
        }

        if (this.mediaQuery) {
            const handleChange = () => {
                if (this.mode === 'system') {
                    this.apply();
                }
            };
            if (this.mediaQuery.addEventListener) {
                this.mediaQuery.addEventListener('change', handleChange);
            } else if (this.mediaQuery.addListener) {
                this.mediaQuery.addListener(handleChange);
            }
        }

        this.apply();
    },

    setMode(mode) {
        this.mode = mode;
        localStorage.setItem('crond_theme', mode);
        this.apply();
    },

    toggle() {
        const nextMap = {
            system: 'dark',
            dark: 'light',
            light: 'system'
        };
        this.setMode(nextMap[this.mode] || 'system');
    },

    getResolvedTheme() {
        if (this.mode === 'system') {
            const isDark = this.mediaQuery ? this.mediaQuery.matches : true;
            return isDark ? 'theme-dark' : 'theme-light';
        }
        return this.mode === 'light' ? 'theme-light' : 'theme-dark';
    },

    apply() {
        const resolvedTheme = this.getResolvedTheme();
        document.body.className = resolvedTheme;

        // 更新图标显示与按钮提示
        const auto = document.querySelector('.auto-icon');
        const moon = document.querySelector('.moon-icon');
        const sun = document.querySelector('.sun-icon');
        const btnTheme = document.getElementById('btnTheme');

        if (auto && moon && sun) {
            auto.style.display = this.mode === 'system' ? 'block' : 'none';
            moon.style.display = this.mode === 'dark' ? 'block' : 'none';
            sun.style.display = this.mode === 'light' ? 'block' : 'none';
        }

        if (btnTheme) {
            const titleKey = this.mode === 'system' ? 'themeSystem' : (this.mode === 'dark' ? 'themeDark' : 'themeLight');
            btnTheme.setAttribute('title', I18n.get(titleKey));
        }
    }
};

// --- 核心工具：KSU Shell 执行器 ---
let _callbackCounter = 0;

function _uniqueCallbackName(prefix) {
    return `${prefix}_cb_${Date.now()}_${_callbackCounter++}`;
}

class Shell {
    /**
     * 通过 KSU Java Bridge 执行 shell 命令
     * ksu.exec() 签名: ksu.exec(command, optionsJson, callbackFuncName)
     * 回调签名: window[callbackFuncName](errno, stdout, stderr)
     */
    static async exec(command) {
        return new Promise((resolve) => {
            if (typeof ksu !== 'undefined' && ksu.exec) {
                const cbName = _uniqueCallbackName('ksu_exec');
                window[cbName] = (errno, stdout, stderr) => {
                    resolve({ errno, stdout, stderr });
                    delete window[cbName];
                };
                try {
                    ksu.exec(command, '{}', cbName);
                } catch (err) {
                    resolve({ errno: -1, stdout: '', stderr: String(err) });
                    delete window[cbName];
                }
            } else {
                // Mock 环境：本地浏览器调试时使用
                console.warn('[Mock Shell] Executing:', command);
                setTimeout(() => {
                    if (command.includes('pidof crond') || command.includes('grep crond')) {
                        resolve({ errno: 0, stdout: '12345\n', stderr: '' });
                    } else if (command.includes('base64 -d')) {
                        resolve({ errno: 0, stdout: '', stderr: '' });
                    } else if (command.includes('cat /data/adb/crond/spool/root')) {
                        resolve({ errno: 0, stdout: '30 4 * * * echo "heartbeat" > /data/adb/crond/logs/run.log\n', stderr: '' });
                    } else if (command.includes('tail -n 100')) {
                        resolve({ errno: 0, stdout: 'Crond running...\nheartbeat\n', stderr: '' });
                    } else {
                        resolve({ errno: 0, stdout: 'success', stderr: '' });
                    }
                }, 300);
            }
        });
    }

    static async writeFileSafe(path, content) {
        const utf8Encoder = new TextEncoder();
        const bytes = utf8Encoder.encode(content);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64Content = window.btoa(binary);
        const cmd = `echo '${base64Content}' | base64 -d > '${path}' && chmod 644 '${path}'`;
        return await this.exec(cmd);
    }
}

// --- UI 控制中心 ---
const UI = {
    els: {
        statusBadge: document.getElementById('statusBadge'),
        statusText: document.getElementById('statusText'),
        btnSaveConfig: document.getElementById('btnSaveConfig'),
        crontabEditor: document.getElementById('crontabEditor'),
        btnRefreshLog: document.getElementById('btnRefreshLog'),
        btnClearLog: document.getElementById('btnClearLog'),
        logViewer: document.getElementById('logViewer'),
        toastContainer: document.getElementById('toastContainer'),
        btnTheme: document.getElementById('btnTheme'),
        btnLang: document.getElementById('btnLang'),
        btnSettings: document.getElementById('btnSettings'),
        settingsModal: document.getElementById('settingsModal'),
        btnCloseSettings: document.getElementById('btnCloseSettings'),
        switchAutoStart: document.getElementById('switchAutoStart'),
        switchKeepData: document.getElementById('switchKeepData')
    },

    state: {
        initialConfig: '',
        currentConfig: '',
        logAutoRefreshTimer: null
    },

    toast(msg, type = 'info') {
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerText = msg;
        this.els.toastContainer.appendChild(t);
        setTimeout(() => {
            t.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => t.remove(), 300);
        }, 3000);
    },

    setLoading(btnEl, isLoading) {
        if (isLoading) {
            btnEl.dataset.original = btnEl.innerHTML;
            // 保留 SVG 如果原来有的话，加上 wait 提示
            btnEl.innerHTML = `<svg class="spin" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10" stroke-dasharray="30 60"></circle></svg> <span>${I18n.get('btnWait')}</span>`;
            btnEl.disabled = true;
        } else {
            btnEl.innerHTML = btnEl.dataset.original;
            btnEl.disabled = false;
        }
    },

    /**
     * 自定义确认对话框，返回 Promise
     */
    async confirm(message) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="glass-panel modal-content">
                    <div class="modal-header">
                        <h3>${I18n.get('confirmTitle')}</h3>
                    </div>
                    <div class="modal-body">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="modalCancel">${I18n.get('btnCancel')}</button>
                        <button class="btn btn-primary" id="modalConfirm">${I18n.get('btnConfirm')}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // 触发动画
            setTimeout(() => overlay.classList.add('active'), 10);

            const cleanup = (value) => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                    resolve(value);
                }, 300);
            };

            overlay.querySelector('#modalCancel').onclick = () => cleanup(false);
            overlay.querySelector('#modalConfirm').onclick = () => cleanup(true);
            overlay.onclick = (e) => {
                if (e.target === overlay) cleanup(false);
            };
        });
    }
};

// --- 业务逻辑 ---
const Service = {
    async checkStatus() {
        UI.els.statusText.innerText = I18n.get('statusChecking');
        const res = await Shell.exec(`pgrep -f 'crond -b -c /data/adb/crond/spool'`);
        if (res.stdout.trim() !== '' && res.errno === 0) {
            UI.els.statusBadge.className = 'status-badge running';
            UI.els.statusText.innerText = I18n.get('statusRunning');
        } else {
            UI.els.statusBadge.className = 'status-badge stopped';
            UI.els.statusText.innerText = I18n.get('statusStopped');
        }
    },

    async loadConfig() {
        UI.els.crontabEditor.disabled = true;
        const res = await Shell.exec(`cat /data/adb/crond/spool/root 2>/dev/null || echo ""`);
        UI.state.initialConfig = res.stdout;
        UI.els.crontabEditor.value = res.stdout;
        UI.els.crontabEditor.disabled = false;
        UI.els.btnSaveConfig.disabled = true;
    },

    async saveConfig() {
        const newContent = UI.els.crontabEditor.value;
        UI.setLoading(UI.els.btnSaveConfig, true);
        const res = await Shell.writeFileSafe('/data/adb/crond/spool/root', newContent);
        UI.setLoading(UI.els.btnSaveConfig, false);

        if (res.errno === 0) {
            UI.toast(I18n.get('msgSaveSuccess'), 'success');
            UI.state.initialConfig = newContent;
            UI.els.btnSaveConfig.disabled = true;
        } else {
            UI.toast(I18n.get('msgSaveFailed') + res.stderr, 'error');
        }
    },

    async loadLog() {
        const res = await Shell.exec(`tail -n 150 /data/adb/crond/logs/run.log 2>/dev/null || echo ""`);

        if (res.stdout.trim() === '') {
            UI.els.logViewer.innerText = I18n.get('logEmpty');
        } else {
            UI.els.logViewer.innerText = res.stdout;
            UI.els.logViewer.scrollTop = UI.els.logViewer.scrollHeight;
        }
    },

    toggleLogAutoRefresh() {
        const icon = UI.els.btnRefreshLog.querySelector('svg');
        if (UI.state.logAutoRefreshTimer) {
            // 停止自动刷新
            clearInterval(UI.state.logAutoRefreshTimer);
            UI.state.logAutoRefreshTimer = null;
            if (icon) icon.classList.remove('spin');
        } else {
            // 启动自动刷新：立即执行一次，然后每3秒执行
            if (icon) icon.classList.add('spin');
            this.loadLog();
            UI.state.logAutoRefreshTimer = setInterval(() => this.loadLog(), 3000);
        }
    },

    async clearLog() {
        const res = await Shell.exec(`echo "" > /data/adb/crond/logs/run.log`);
        if (res.errno === 0) {
            UI.toast(I18n.get('msgLogCleared'), 'success');
            await this.loadLog();
        } else {
            UI.toast(I18n.get('msgLogClearFailed'), 'error');
        }
    },

    async restartService() {
        const isRunning = UI.els.statusBadge.classList.contains('running');
        UI.els.statusBadge.style.pointerEvents = 'none';
        UI.els.statusText.innerText = I18n.get('statusChecking');

        const cmd = `/data/adb/modules/crond4android/action.sh`;
        await Shell.exec(cmd);

        UI.toast(isRunning ? I18n.get('msgStopping') : I18n.get('msgStarting'));

        setTimeout(async () => {
            await this.checkStatus();
            UI.els.statusBadge.style.pointerEvents = 'auto';
        }, 1000);
    },

    async loadSettings() {
        const resManual = await Shell.exec(`[ -f /data/adb/crond/conf/MANUAL ] && echo 1 || echo 0`);
        const isManual = resManual.stdout.trim() === '1';
        UI.els.switchAutoStart.checked = !isManual;

        const resKeep = await Shell.exec(`[ -f /data/adb/crond/conf/KEEP_ON_UNINSTALL ] && echo 1 || echo 0`);
        const isKeep = resKeep.stdout.trim() === '1';
        UI.els.switchKeepData.checked = isKeep;
    },

    async toggleAutoStart(enable) {
        let res;
        if (enable) {
            // 开启自启 -> 移除 MANUAL 文件
            res = await Shell.exec(`rm -f /data/adb/crond/conf/MANUAL`);
        } else {
            // 禁用自启 -> 创建 MANUAL 文件
            res = await Shell.exec(`touch /data/adb/crond/conf/MANUAL`);
        }
        if (res.errno === 0) {
            UI.toast(I18n.get('msgSettingUpdated'), 'success');
        } else {
            UI.toast(I18n.get('msgSettingFailed') + res.stderr, 'error');
            UI.els.switchAutoStart.checked = !enable;
        }
    },

    async toggleKeepData(enable) {
        let res;
        if (enable) {
            // 保留数据 -> 创建 KEEP_ON_UNINSTALL 文件
            res = await Shell.exec(`touch /data/adb/crond/conf/KEEP_ON_UNINSTALL`);
        } else {
            // 不保留数据 -> 移除 KEEP_ON_UNINSTALL 文件
            res = await Shell.exec(`rm -f /data/adb/crond/conf/KEEP_ON_UNINSTALL`);
        }
        if (res.errno === 0) {
            UI.toast(I18n.get('msgSettingUpdated'), 'success');
        } else {
            UI.toast(I18n.get('msgSettingFailed') + res.stderr, 'error');
            UI.els.switchKeepData.checked = !enable;
        }
    }
};

// --- 事件绑定 ---
function bindEvents() {
    UI.els.btnTheme.addEventListener('click', () => Theme.toggle());

    UI.els.btnLang.addEventListener('click', () => {
        const nextLang = I18n.lang === 'zh-CN' ? 'en-US' : 'zh-CN';
        I18n.setLang(nextLang);
        // 需要在当前立即重新刷新状态以替换通过 JS 设置的值（非 DOM 绑定的内容）
        if (UI.els.statusBadge.classList.contains('running')) {
            UI.els.statusText.innerText = I18n.get('statusRunning');
        } else {
            UI.els.statusText.innerText = I18n.get('statusStopped');
        }
        if (UI.els.logViewer.innerText === locales['zh-CN']['logEmpty'] || UI.els.logViewer.innerText === locales['en-US']['logEmpty']) {
            UI.els.logViewer.innerText = I18n.get('logEmpty');
        }
    });

    UI.els.statusBadge.addEventListener('click', () => Service.restartService());

    UI.els.btnRefreshLog.addEventListener('click', () => Service.toggleLogAutoRefresh());

    UI.els.btnClearLog.addEventListener('click', async () => {
        if (await UI.confirm(I18n.get('confirmClear'))) {
            Service.clearLog();
        }
    });

    UI.els.btnSaveConfig.addEventListener('click', () => Service.saveConfig());

    UI.els.crontabEditor.addEventListener('input', (e) => {
        if (e.target.value !== UI.state.initialConfig) {
            UI.els.btnSaveConfig.disabled = false;
        } else {
            UI.els.btnSaveConfig.disabled = true;
        }
    });

    if (UI.els.btnSettings) {
        UI.els.btnSettings.addEventListener('click', async () => {
            await Service.loadSettings();
            UI.els.settingsModal.classList.add('active');
        });
    }

    if (UI.els.btnCloseSettings) {
        UI.els.btnCloseSettings.addEventListener('click', () => {
            UI.els.settingsModal.classList.remove('active');
        });
    }

    if (UI.els.settingsModal) {
        UI.els.settingsModal.addEventListener('click', (e) => {
            if (e.target === UI.els.settingsModal) {
                UI.els.settingsModal.classList.remove('active');
            }
        });
    }

    if (UI.els.switchAutoStart) {
        UI.els.switchAutoStart.addEventListener('change', (e) => {
            Service.toggleAutoStart(e.target.checked);
        });
    }

    if (UI.els.switchKeepData) {
        UI.els.switchKeepData.addEventListener('change', (e) => {
            Service.toggleKeepData(e.target.checked);
        });
    }
}

// --- 初始化入口 ---
async function bootstrap() {
    Theme.init();
    I18n.init(); // 一定在渲染和其他方法之前调用

    bindEvents();

    await Promise.all([
        Service.checkStatus(),
        Service.loadConfig(),
        Service.loadLog()
    ]);
}

document.addEventListener('DOMContentLoaded', bootstrap);
