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
        btnCancel: '取消'
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
        btnCancel: 'Cancel'
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
        // 更新多语言按钮的当前显示文本
        const btnLang = document.getElementById('btnLang');
        if (btnLang) {
            btnLang.innerText = this.lang === 'zh-CN' ? 'EN' : '中';
        }
    }
};

// --- 主题管理 ---
const Theme = {
    current: 'theme-dark',

    init() {
        const savedTheme = localStorage.getItem('crond_theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // 默认深色，也可检测系统偏好
            const isLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
            this.setTheme(isLight ? 'theme-light' : 'theme-dark');
        }
    },

    setTheme(theme) {
        this.current = theme;
        document.body.className = theme;
        localStorage.setItem('crond_theme', theme);

        // 更新图标显示
        const moon = document.querySelector('.moon-icon');
        const sun = document.querySelector('.sun-icon');
        if (moon && sun) {
            if (theme === 'theme-light') {
                moon.style.display = 'block';
                sun.style.display = 'none';
            } else {
                moon.style.display = 'none';
                sun.style.display = 'block';
            }
        }
    },

    toggle() {
        this.setTheme(this.current === 'theme-dark' ? 'theme-light' : 'theme-dark');
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
                    } else if (command.includes('cat /data/adb/crond/root')) {
                        resolve({ errno: 0, stdout: '30 4 * * * echo "heartbeat" > /data/adb/crond/run.log\n', stderr: '' });
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
        btnLang: document.getElementById('btnLang')
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
        const res = await Shell.exec(`pgrep -f 'crond -b -c /data/adb/crond'`);
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
        const res = await Shell.exec(`cat /data/adb/crond/root 2>/dev/null || echo ""`);
        UI.state.initialConfig = res.stdout;
        UI.els.crontabEditor.value = res.stdout;
        UI.els.crontabEditor.disabled = false;
        UI.els.btnSaveConfig.disabled = true;
    },

    async saveConfig() {
        const newContent = UI.els.crontabEditor.value;
        UI.setLoading(UI.els.btnSaveConfig, true);
        const res = await Shell.writeFileSafe('/data/adb/crond/root', newContent);
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
        const res = await Shell.exec(`tail -n 150 /data/adb/crond/run.log 2>/dev/null || echo ""`);

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
        const res = await Shell.exec(`echo "" > /data/adb/crond/run.log`);
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
        }, 1500);
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
