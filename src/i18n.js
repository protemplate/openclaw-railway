/**
 * Shared i18n module for OpenClaw pages
 *
 * Generates CSS, HTML, and JS strings for embedding in inline HTML pages.
 * Both onboard-page.js and ui-page.js use this to produce self-contained
 * HTML with inline JS (no bundler), so this module generates *strings*.
 */

export const SUPPORTED_LANGS = ['en', 'zh-TW', 'zh-CN', 'ja', 'ko'];

export const LANG_META = {
  en:      { flag: '\uD83C\uDDEC\uD83C\uDDE7', name: 'English' },
  'zh-TW': { flag: '\uD83C\uDDF9\uD83C\uDDFC', name: '\u7E41\u9AD4\u4E2D\u6587' },
  'zh-CN': { flag: '\uD83C\uDDE8\uD83C\uDDF3', name: '\u7B80\u4F53\u4E2D\u6587' },
  ja:      { flag: '\uD83C\uDDEF\uD83C\uDDF5', name: '\u65E5\u672C\u8A9E' },
  ko:      { flag: '\uD83C\uDDF0\uD83C\uDDF7', name: '\uD55C\uAD6D\uC5B4' }
};

/**
 * Returns CSS for the language selector dropdown.
 * Can be injected into any page's <style> block.
 */
export function getLangSelectorCSS() {
  return `
    .lang-selector {
      position: relative;
    }
    .lang-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      font-size: 13px;
      font-weight: 500;
      font-family: var(--font-body);
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      user-select: none;
    }
    .lang-btn:hover {
      border-color: var(--border-strong);
      background: var(--bg-hover);
    }
    .lang-btn .lang-arrow {
      font-size: 10px;
      transition: transform 0.15s;
    }
    .lang-dropdown {
      display: none;
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      min-width: 180px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      z-index: 100;
      padding: 4px;
      animation: fadeIn 0.15s ease-out;
    }
    .lang-dropdown.open { display: block; }
    .lang-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 13px;
      color: var(--text);
      transition: background 0.1s;
    }
    .lang-option:hover { background: var(--bg-hover); }
    .lang-option .lang-flag { font-size: 16px; flex-shrink: 0; }
    .lang-option .lang-name { flex: 1; }
    .lang-check {
      font-size: 12px;
      color: var(--teal);
      opacity: 0;
      transition: opacity 0.1s;
    }
    .lang-check.active { opacity: 1; }`;
}

/**
 * Returns HTML for the language selector dropdown.
 * @param {string} idPrefix - Unique prefix for element IDs (e.g., 'wizard', 'lite')
 */
export function getLangSelectorHTML(idPrefix) {
  const options = SUPPORTED_LANGS.map(lang => {
    const m = LANG_META[lang];
    return `<div class="lang-option" onclick="setLanguage('${lang}')"><span class="lang-flag">${m.flag}</span><span class="lang-name">${m.name}</span><span class="lang-check" data-lang="${lang}">&#10003;</span></div>`;
  }).join('\n        ');

  return `<div class="lang-selector">
      <button class="lang-btn" id="${idPrefix}-lang-btn" onclick="toggleLangDropdown('${idPrefix}-lang-dropdown')">
        <span class="lang-flag" id="${idPrefix}-lang-flag"></span>
        <span id="${idPrefix}-lang-name"></span>
        <span class="lang-arrow">&#9662;</span>
      </button>
      <div class="lang-dropdown" id="${idPrefix}-lang-dropdown">
        ${options}
      </div>
    </div>`;
}

/**
 * Returns inline JS string containing the full i18n runtime.
 * @param {string|null} translationsJSON - JSON.stringify'd translations object, or null if TRANSLATIONS is already defined inline
 * @param {Object} options
 * @param {string[]} options.langSelectorIds - Array of ID prefixes for lang selectors on the page
 * @param {string} options.onChangeCallback - JS code string to execute after language change (e.g., 'applyDynamicTranslations();')
 */
export function getI18nBootstrapJS(translationsJSON, { langSelectorIds, onChangeCallback }) {
  const idsJSON = JSON.stringify(langSelectorIds);
  const translationsDecl = translationsJSON ? `var TRANSLATIONS = ${translationsJSON};` : '// TRANSLATIONS defined externally';
  return `
      var LANG_META = ${JSON.stringify(LANG_META)};
      ${translationsDecl}
      var currentLang = 'en';

      function t(key, params) {
        var dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
        var str = dict[key] || TRANSLATIONS.en[key] || key;
        if (params) {
          Object.keys(params).forEach(function(k) {
            str = str.replace('{' + k + '}', params[k]);
          });
        }
        return str;
      }

      function applyTranslations() {
        document.title = t('pageTitle');
        var els = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < els.length; i++) {
          els[i].textContent = t(els[i].getAttribute('data-i18n'));
        }
        var phEls = document.querySelectorAll('[data-i18n-placeholder]');
        for (var j = 0; j < phEls.length; j++) {
          phEls[j].placeholder = t(phEls[j].getAttribute('data-i18n-placeholder'));
        }
      }

      function detectBrowserLang() {
        var langs = navigator.languages || [navigator.language || 'en'];
        for (var i = 0; i < langs.length; i++) {
          var tag = langs[i].toLowerCase();
          if (tag === 'zh-tw' || tag === 'zh-hant' || tag === 'zh-hk') return 'zh-TW';
          if (tag === 'zh-cn' || tag === 'zh-hans' || tag === 'zh') return 'zh-CN';
          if (tag.indexOf('ja') === 0) return 'ja';
          if (tag.indexOf('ko') === 0) return 'ko';
          if (tag.indexOf('en') === 0) return 'en';
        }
        return 'en';
      }

      function initLanguage() {
        var stored = null;
        try { stored = localStorage.getItem('openclaw_lang'); } catch (e) {}
        currentLang = (stored && TRANSLATIONS[stored]) ? stored : detectBrowserLang();
      }

      function updateLangSelectorUI() {
        var meta = LANG_META[currentLang] || LANG_META.en;
        var ids = ${idsJSON};
        ids.forEach(function(prefix) {
          var flagEl = document.getElementById(prefix + '-lang-flag');
          var nameEl = document.getElementById(prefix + '-lang-name');
          if (flagEl) flagEl.textContent = meta.flag;
          if (nameEl) nameEl.textContent = meta.name;
        });
        var checks = document.querySelectorAll('.lang-check');
        for (var i = 0; i < checks.length; i++) {
          checks[i].classList.toggle('active', checks[i].getAttribute('data-lang') === currentLang);
        }
      }

      window.setLanguage = function(lang) {
        if (!TRANSLATIONS[lang]) return;
        currentLang = lang;
        try { localStorage.setItem('openclaw_lang', lang); } catch (e) {}
        updateLangSelectorUI();
        applyTranslations();
        ${onChangeCallback || ''}
        // Close dropdowns
        var dds = document.querySelectorAll('.lang-dropdown');
        for (var i = 0; i < dds.length; i++) dds[i].classList.remove('open');
      };

      window.toggleLangDropdown = function(id) {
        var dd = document.getElementById(id);
        if (!dd) return;
        var isOpen = dd.classList.contains('open');
        var dds = document.querySelectorAll('.lang-dropdown');
        for (var i = 0; i < dds.length; i++) dds[i].classList.remove('open');
        if (!isOpen) dd.classList.add('open');
      };

      // Close dropdown on outside click
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.lang-selector')) {
          var dds = document.querySelectorAll('.lang-dropdown');
          for (var i = 0; i < dds.length; i++) dds[i].classList.remove('open');
        }
      });`;
}
