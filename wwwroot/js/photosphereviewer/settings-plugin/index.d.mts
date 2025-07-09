import { AbstractPlugin, Viewer, TypedEvent } from '@photo-sphere-viewer/core';

/**
 * Description of a setting
 */
type BaseSetting = {
    /**
     * identifier of the setting
     */
    id: string;
    /**
     * label of the setting
     * If can be a key in the global `lang` config
     */
    label: string;
    /**
     * type of the setting
     */
    type: 'options' | 'toggle';
    /**
     * function which returns the value of the button badge
     */
    badge?(): string;
};
/**
 * Description of a 'options' setting
 */
type OptionsSetting = BaseSetting & {
    type: 'options';
    /**
     * function which returns the current option id
     */
    current(): string;
    /**
     * function which the possible options
     */
    options(): SettingOption[];
    /**
     * function called with the id of the selected option
     */
    apply(optionId: string): void;
};
/**
 * Description of a 'toggle' setting
 */
type ToggleSetting = BaseSetting & {
    type: 'toggle';
    /**
     * function which return whereas the setting is active or not
     */
    active(): boolean;
    /**
     * function called when the setting is toggled
     */
    toggle(): void;
};
/**
 * Option for an 'options' setting
 */
type SettingOption = {
    /**
     * identifier of the option
     */
    id: string;
    /**
     * label of the option
     * If can be a key in the global `lang` config
     */
    label: string;
};
type Setting = ToggleSetting | OptionsSetting;
type SettingsPluginConfig = {
    /**
     * should the settings be saved accross sessions
     * @default false
     */
    persist?: boolean;
    /**
     * custom storage handler, defaults to LocalStorage
     * @default LocalStorage
     */
    storage?: {
        set(settingId: string, value: boolean | string): void;
        /**
         * return `undefined` or `null` if the option does not exist
         */
        get(settingId: string): boolean | string | Promise<boolean> | Promise<string>;
    };
};

/**
 * Adds a button to access various settings
 */
declare class SettingsPlugin extends AbstractPlugin<SettingsPluginEvents> {
    static readonly id = "settings";
    static readonly VERSION: string;
    readonly config: SettingsPluginConfig;
    private readonly component;
    readonly settings: Setting[];
    constructor(viewer: Viewer, config: SettingsPluginConfig);
    /**
     * Registers a new setting
     * @throws {@link PSVError} if the configuration is invalid
     */
    addSetting(setting: Setting): void;
    /**
     * Removes a setting
     */
    removeSetting(id: string): void;
    /**
     * Toggles the settings menu
     */
    toggleSettings(): void;
    /**
     * Hides the settings menu
     */
    hideSettings(): void;
    /**
     * Shows the settings menu
     */
    showSettings(): void;
    /**
     * Updates the badge in the button
     */
    updateButton(): void;
    private __getButton;
}

/**
 * @event Triggered when a setting's value changes
 */
declare class SettingChangedEvent extends TypedEvent<SettingsPlugin> {
    readonly settingId: string;
    readonly settingValue: boolean | string;
    static readonly type = "setting-changed";
    type: 'setting-changed';
}
type SettingsPluginEvents = SettingChangedEvent;

type events_SettingChangedEvent = SettingChangedEvent;
declare const events_SettingChangedEvent: typeof SettingChangedEvent;
type events_SettingsPluginEvents = SettingsPluginEvents;
declare namespace events {
  export { events_SettingChangedEvent as SettingChangedEvent, type events_SettingsPluginEvents as SettingsPluginEvents };
}

export { type BaseSetting, type OptionsSetting, type Setting, type SettingOption, SettingsPlugin, type SettingsPluginConfig, type ToggleSetting, events };
