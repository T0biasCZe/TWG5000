/*!
 * Photo Sphere Viewer / Settings Plugin 5.13.3
 * @copyright 2015-2025 Damien "Mistic" Sorel
 * @licence MIT (https://opensource.org/licenses/MIT)
 */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SettingsPlugin: () => SettingsPlugin,
  events: () => events_exports
});
module.exports = __toCommonJS(index_exports);
var import_core6 = require("@photo-sphere-viewer/core");

// src/events.ts
var events_exports = {};
__export(events_exports, {
  SettingChangedEvent: () => SettingChangedEvent
});
var import_core = require("@photo-sphere-viewer/core");
var _SettingChangedEvent = class _SettingChangedEvent extends import_core.TypedEvent {
  /** @internal */
  constructor(settingId, settingValue) {
    super(_SettingChangedEvent.type);
    this.settingId = settingId;
    this.settingValue = settingValue;
  }
};
_SettingChangedEvent.type = "setting-changed";
var SettingChangedEvent = _SettingChangedEvent;

// src/SettingsButton.ts
var import_core2 = require("@photo-sphere-viewer/core");

// src/icons/settings.svg
var settings_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="currentColor" d="M98.4 43.7c-.8-.5-7-4.3-9.6-5.4l-3-7.5c.9-2.5 2.6-9.4 3-10.6a3.3 3.3 0 00-1-3.1L83 12.2a3.3 3.3 0 00-3-.9c-1 .2-8 2-10.7 3l-7.5-3.1c-1-2.4-4.8-8.6-5.4-9.6A3.3 3.3 0 0053.4 0h-6.8a3.4 3.4 0 00-2.9 1.6c-.5.8-4.2 7-5.4 9.6l-7.5 3-10.6-3a3.3 3.3 0 00-3.1 1L12.2 17a3.3 3.3 0 00-.9 3c.2 1 2 8 3 10.7l-3.1 7.5c-2.4 1-8.6 4.8-9.6 5.4A3.3 3.3 0 000 46.6v6.8a3.4 3.4 0 001.6 2.9c.8.5 7 4.2 9.6 5.4l3 7.5-3 10.6a3.3 3.3 0 001 3.1l4.8 4.9a3.3 3.3 0 003.1.9c1-.2 8-2 10.7-3l7.5 3c1 2.5 4.7 8.6 5.4 9.7a3.3 3.3 0 002.9 1.6h6.8a3.4 3.4 0 002.9-1.6c.5-.8 4.2-7 5.4-9.6l7.5-3c2.5.9 9.4 2.6 10.6 3a3.3 3.3 0 003.1-1l4.9-4.8a3.3 3.3 0 00.9-3.1c-.2-1-2-8-3-10.7l3-7.5c2.5-1 8.6-4.7 9.7-5.4a3.3 3.3 0 001.6-2.9v-6.8a3.3 3.3 0 00-1.6-2.9zM50 71.7A21.8 21.8 0 1171.8 50 21.8 21.8 0 0150 71.8z"/><!-- Created by i cons from the Noun Project --></svg>\n';

// src/SettingsButton.ts
var SettingsButton = class extends import_core2.AbstractButton {
  constructor(navbar) {
    super(navbar, {
      className: "psv-settings-button",
      icon: settings_default,
      hoverScale: true,
      collapsable: false,
      tabbable: true
    });
    this.plugin = this.viewer.getPlugin("settings");
    this.badge = document.createElement("div");
    this.badge.className = "psv-settings-badge";
    this.badge.style.display = "none";
    this.container.appendChild(this.badge);
  }
  isSupported() {
    return !!this.plugin;
  }
  /**
   * Toggles settings
   */
  onClick() {
    this.plugin.toggleSettings();
  }
  /**
   * Changes the badge value
   */
  setBadge(value) {
    this.badge.innerText = value;
    this.badge.style.display = value ? "" : "none";
  }
};
SettingsButton.id = "settings";

// src/SettingsPlugin.ts
var import_core5 = require("@photo-sphere-viewer/core");

// src/constants.ts
var import_core3 = require("@photo-sphere-viewer/core");

// src/icons/check.svg
var check_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90"><polygon fill="currentColor" points="0,48 10,35 36,57 78,10 90,21 37,79 "/><!-- Created by Zahroe from the Noun Project --></svg>\n';

// src/icons/chevron.svg
var chevron_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="currentColor" d="M86.2 50.7l-44 44-9.9-9.9 34.1-34.1-34.7-34.8L41.6 6z"/><!-- Created by Renee Ramsey-Passmore from the Noun Project--></svg>\n';

// src/icons/switch-off.svg
var switch_off_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="2.4em" height="1.2em"><path fill="currentColor" transform="scale(1.88) translate(0, -25)" d="M72 73.2H44A26.4 26.4 0 0044 30h28a21.6 21.6 0 010 43.2M7.2 51.6a21.6 21.6 0 1143.2 0 21.6 21.6 0 01-43.2 0M72 25.2H28.8a26.4 26.4 0 000 52.8H72a26.4 26.4 0 000-52.8"/><!-- Created by Nikita from the Noun Project --></svg>\n';

// src/icons/switch-on.svg
var switch_on_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="2.4em" height="1.2em"><path fill="currentColor" transform="scale(1.88) translate(0, -25)" d="M72 73.2A21.6 21.6 0 1172 30a21.6 21.6 0 010 43.2M2.4 51.6A26.4 26.4 0 0028.8 78H72a26.4 26.4 0 000-52.8H28.8A26.4 26.4 0 002.4 51.6"/><!-- Created by Nikita from the Noun Project --></svg>\n';

// src/constants.ts
var LOCAL_STORAGE_KEY = "psvSettings";
var SETTING_DATA = "settingId";
var OPTION_DATA = "optionId";
var ID_BACK = "__back";
var ID_ENTER = "__enter";
var SETTING_DATA_KEY = import_core3.utils.dasherize(SETTING_DATA);
var OPTION_DATA_KEY = import_core3.utils.dasherize(OPTION_DATA);
var SETTINGS_TEMPLATE_ = {
  options: (setting, lang) => {
    const current = setting.current();
    const option = setting.options().find((opt) => opt.id === current);
    return `
<span class="psv-settings-item-label">${lang[setting.label] ?? setting.label}</span>
<span class="psv-settings-item-value">${option?.label ?? current}</span>
<span class="psv-settings-item-icon">${chevron_default}</span>
`;
  },
  toggle: (setting, lang) => `
<span class="psv-settings-item-label">${lang[setting.label] ?? setting.label}</span>
<span class="psv-settings-item-value">${setting.active() ? switch_on_default : switch_off_default}</span>
`
};
var SETTINGS_TEMPLATE = (settings, lang) => `
<ul class="psv-settings-list">
${settings.map((setting) => `
    <li class="psv-settings-item" tabindex="0"
        data-${SETTING_DATA_KEY}="${setting.id}" data-${OPTION_DATA_KEY}="${ID_ENTER}">
        ${SETTINGS_TEMPLATE_[setting.type](setting, lang)}
    </li>
`).join("")}
</ul>
`;
var SETTING_OPTIONS_TEMPLATE = (setting, lang) => {
  const current = setting.current();
  return `
<ul class="psv-settings-list">
    <li class="psv-settings-item psv-settings-item--header" tabindex="0"
        data-${SETTING_DATA_KEY}="${setting.id}" data-${OPTION_DATA_KEY}="${ID_BACK}">
        <span class="psv-settings-item-icon">${chevron_default}</span>
        <span class="psv-settings-item-label">${lang[setting.label] ?? setting.label}</span>
    </li>
${setting.options().map((option) => `
    <li class="psv-settings-item" tabindex="0"
        data-${SETTING_DATA_KEY}="${setting.id}" data-${OPTION_DATA_KEY}="${option.id}">
        <span class="psv-settings-item-icon">${option.id === current ? check_default : ""}</span>
        <span class="psv-settings-item-value">${lang[option.label] ?? option.label}</span>
    </li>
`).join("")}
</ul>
`;
};

// src/SettingsComponent.ts
var import_core4 = require("@photo-sphere-viewer/core");
var SettingsComponent = class extends import_core4.AbstractComponent {
  constructor(plugin, viewer) {
    super(viewer, {
      className: `psv-settings ${import_core4.CONSTANTS.CAPTURE_EVENTS_CLASS}`
    });
    this.plugin = plugin;
    this.container.addEventListener("click", this);
    this.container.addEventListener("transitionend", this);
    this.container.addEventListener("keydown", this);
    this.hide();
  }
  handleEvent(e) {
    switch (e.type) {
      case "click":
        this.__click(e);
        break;
      case "transitionend":
        if (e.target === this.container) {
          if (!this.isVisible()) {
            this.container.innerHTML = "";
          } else {
            this.__focusFirstOption();
          }
        }
        break;
      case "keydown":
        if (this.isVisible()) {
          switch (e.key) {
            case import_core4.CONSTANTS.KEY_CODES.Escape:
              this.plugin.hideSettings();
              break;
            case import_core4.CONSTANTS.KEY_CODES.Enter:
              this.__click(e);
              break;
          }
        }
        break;
    }
  }
  show(buttonPosition) {
    this.__showSettings(false);
    this.container.classList.add("psv-settings--open");
    this.container.style.right = "";
    this.container.style.left = "";
    if (buttonPosition) {
      const viewerRect = this.viewer.container.getBoundingClientRect();
      const buttonLeft = buttonPosition.left - viewerRect.left;
      const buttonRight = viewerRect.right - buttonPosition.right;
      const buttonWidth = buttonPosition.width;
      const menuWidth = this.container.offsetWidth;
      if (menuWidth >= buttonLeft + buttonWidth) {
        this.container.style.left = "0px";
      } else if (menuWidth >= buttonRight + buttonWidth) {
        this.container.style.right = "0px";
      } else if (buttonLeft + menuWidth < viewerRect.width) {
        this.container.style.left = `${buttonLeft}px`;
      } else {
        this.container.style.right = `${buttonRight}px`;
      }
    } else {
      this.container.style.right = "0px";
    }
    this.state.visible = true;
  }
  hide() {
    this.container.classList.remove("psv-settings--open");
    this.state.visible = false;
    if (import_core4.utils.hasParent(document.activeElement, this.container)) {
      this.viewer.navbar.focusButton(SettingsButton.id);
    }
  }
  /**
   * Handle clicks on items
   */
  __click(e) {
    const li = import_core4.utils.getMatchingTarget(e, ".psv-settings-item");
    if (!li) {
      return;
    }
    const settingId = li.dataset[SETTING_DATA];
    const optionId = li.dataset[OPTION_DATA];
    const setting = this.plugin.settings.find((s) => s.id === settingId);
    switch (optionId) {
      case ID_BACK:
        this.__showSettings(true);
        break;
      case ID_ENTER:
        switch (setting.type) {
          case "toggle":
            this.plugin.toggleSettingValue(setting);
            this.__showSettings(true);
            break;
          case "options":
            this.__showOptions(setting);
            break;
          default:
        }
        break;
      default:
        switch (setting.type) {
          case "options":
            this.hide();
            this.plugin.applySettingOption(setting, optionId);
            break;
          default:
        }
        break;
    }
  }
  /**
   * Shows the list of options
   */
  __showSettings(focus) {
    this.container.innerHTML = SETTINGS_TEMPLATE(this.plugin.settings, this.viewer.config.lang);
    if (focus) {
      this.__focusFirstOption();
    }
  }
  /**
   * Shows setting options panel
   */
  __showOptions(setting) {
    this.container.innerHTML = SETTING_OPTIONS_TEMPLATE(setting, this.viewer.config.lang);
    this.__focusFirstOption();
  }
  __focusFirstOption() {
    this.container.querySelector("[tabindex]")?.focus();
  }
};

// src/SettingsPlugin.ts
function getData() {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
}
function setData(data) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}
var getConfig = import_core5.utils.getConfigParser({
  persist: false,
  storage: {
    set(settingId, value) {
      const data = getData();
      data[settingId] = value;
      setData(data);
    },
    get(settingId) {
      return getData()[settingId];
    }
  }
});
var SettingsPlugin = class extends import_core5.AbstractPlugin {
  constructor(viewer, config) {
    super(viewer);
    this.settings = [];
    this.config = getConfig(config);
    this.component = new SettingsComponent(this, this.viewer);
  }
  /**
   * @internal
   */
  init() {
    super.init();
    import_core5.utils.checkStylesheet(this.viewer.container, "settings-plugin");
    this.viewer.addEventListener(import_core5.events.ClickEvent.type, this);
    this.viewer.addEventListener(import_core5.events.ShowPanelEvent.type, this);
    setTimeout(() => this.updateButton());
  }
  /**
   * @internal
   */
  destroy() {
    this.viewer.removeEventListener(import_core5.events.ClickEvent.type, this);
    this.viewer.removeEventListener(import_core5.events.ShowPanelEvent.type, this);
    this.component.destroy();
    this.settings.length = 0;
    super.destroy();
  }
  /**
   * @internal
   */
  handleEvent(e) {
    if (e instanceof import_core5.events.ClickEvent || e instanceof import_core5.events.ShowPanelEvent) {
      if (this.component.isVisible()) {
        this.hideSettings();
      }
    }
  }
  /**
   * Registers a new setting
   * @throws {@link PSVError} if the configuration is invalid
   */
  addSetting(setting) {
    if (!setting.id) {
      throw new import_core5.PSVError("Missing setting id");
    }
    if (!setting.type) {
      throw new import_core5.PSVError("Missing setting type");
    }
    if (this.settings.some((s) => s.id === setting.id)) {
      throw new import_core5.PSVError(`Setting "${setting.id}" already exists`);
    }
    if (setting.badge && this.settings.some((s) => s.badge)) {
      import_core5.utils.logWarn("More than one setting with a badge are declared, the result is unpredictable.");
    }
    this.settings.push(setting);
    if (this.component.isVisible()) {
      this.showSettings();
    }
    this.updateButton();
    if (this.config.persist) {
      Promise.resolve(this.config.storage.get(setting.id)).then((value) => {
        switch (setting.type) {
          case "toggle": {
            const toggle = setting;
            if (!import_core5.utils.isNil(value) && value !== toggle.active()) {
              toggle.toggle();
              this.dispatchEvent(new SettingChangedEvent(toggle.id, toggle.active()));
            }
            break;
          }
          case "options": {
            const options = setting;
            if (!import_core5.utils.isNil(value) && value !== options.current()) {
              options.apply(value);
              this.dispatchEvent(new SettingChangedEvent(options.id, options.current()));
            }
            break;
          }
          default:
        }
        this.updateButton();
      });
    }
  }
  /**
   * Removes a setting
   */
  removeSetting(id) {
    const idx = this.settings.findIndex((setting) => setting.id === id);
    if (idx !== -1) {
      this.settings.splice(idx, 1);
      if (this.component.isVisible()) {
        this.component.show();
      }
      this.updateButton();
    }
  }
  /**
   * Toggles the settings menu
   */
  toggleSettings() {
    if (this.component.isVisible()) {
      this.hideSettings();
    } else {
      this.showSettings();
    }
  }
  /**
   * Hides the settings menu
   */
  hideSettings() {
    const button = this.__getButton();
    button?.toggleActive(false);
    this.component.hide();
  }
  /**
   * Shows the settings menu
   */
  showSettings() {
    const button = this.__getButton();
    this.component.show(button?.container.getBoundingClientRect());
    button?.toggleActive(true);
  }
  /**
   * Updates the badge in the button
   */
  updateButton() {
    const button = this.__getButton();
    if (this.settings.length) {
      const value = this.settings.find((s) => s.badge)?.badge();
      button?.show();
      button?.setBadge(value);
    } else {
      button?.hide();
    }
  }
  /**
   * Toggles a setting
   * @internal
   */
  toggleSettingValue(setting) {
    const newValue = !setting.active();
    setting.toggle();
    this.dispatchEvent(new SettingChangedEvent(setting.id, newValue));
    if (this.config.persist) {
      this.config.storage.set(setting.id, newValue);
    }
    this.updateButton();
  }
  /**
   * Changes the value of an setting
   * @internal
   */
  applySettingOption(setting, optionId) {
    setting.apply(optionId);
    this.dispatchEvent(new SettingChangedEvent(setting.id, optionId));
    if (this.config.persist) {
      this.config.storage.set(setting.id, optionId);
    }
    this.updateButton();
  }
  __getButton() {
    return this.viewer.navbar.getButton(SettingsButton.id, false);
  }
};
SettingsPlugin.id = "settings";
SettingsPlugin.VERSION = "5.13.3";

// src/index.ts
import_core6.DEFAULTS.lang[SettingsButton.id] = "Settings";
(0, import_core6.registerButton)(SettingsButton, "fullscreen:left");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SettingsPlugin,
  events
});
//# sourceMappingURL=index.cjs.map