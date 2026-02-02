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

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => DatestampPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  dateFormat: "YYYY-MM-DD",
  separator: ". ",
  defaultName: "Untitled"
};
var DatestampPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.isRenaming = false;
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new DatestampSettingTab(this.app, this));
    this.registerEvent(
      this.app.vault.on("create", (file) => {
        if (file instanceof import_obsidian.TFile) {
          this.handleNewFile(file);
        }
      })
    );
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  /**
   * Generate the datestamped filename
   */
  generateDatestampedName() {
    const date = (0, import_obsidian.moment)().format(this.settings.dateFormat);
    return `${date}${this.settings.separator}${this.settings.defaultName}`;
  }
  /**
   * Handle new file creation - rename if it's an "Untitled" note
   */
  async handleNewFile(file) {
    if (this.isRenaming)
      return;
    if (file.extension !== "md")
      return;
    const basename = file.basename;
    if (!basename.startsWith("Untitled"))
      return;
    setTimeout(async () => {
      const currentFile = this.app.vault.getAbstractFileByPath(file.path);
      if (!currentFile || !(currentFile instanceof import_obsidian.TFile)) {
        return;
      }
      if (!currentFile.basename.startsWith("Untitled")) {
        return;
      }
      if (this.isRenaming)
        return;
      this.isRenaming = true;
      try {
        const datestampedName = this.generateDatestampedName();
        let newBasename = datestampedName;
        const match = currentFile.basename.match(/^Untitled(\s+\d+)?$/);
        if (match && match[1]) {
          newBasename = datestampedName + match[1];
        }
        const folderPath = currentFile.parent ? currentFile.parent.path : "";
        let newPath = folderPath ? `${folderPath}/${newBasename}.md` : `${newBasename}.md`;
        let counter = 1;
        while (this.app.vault.getAbstractFileByPath(newPath)) {
          const uniqueName = `${datestampedName} ${counter}`;
          newPath = folderPath ? `${folderPath}/${uniqueName}.md` : `${uniqueName}.md`;
          counter++;
        }
        await this.app.fileManager.renameFile(currentFile, newPath);
      } catch (error) {
        console.error("Datestamp: Error renaming file", error);
      } finally {
        this.isRenaming = false;
      }
    }, 500);
  }
};
var DatestampSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Datestamp settings" });
    new import_obsidian.Setting(containerEl).setName("Date format").setDesc("Format for the date prefix. Uses Moment.js format (e.g., YYYY-MM-DD, DD/MM/YYYY)").addText((text) => text.setPlaceholder("YYYY-MM-DD").setValue(this.plugin.settings.dateFormat).onChange(async (value) => {
      this.plugin.settings.dateFormat = value || DEFAULT_SETTINGS.dateFormat;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Separator").setDesc("Character(s) between the date and the note name").addText((text) => text.setPlaceholder(". ").setValue(this.plugin.settings.separator).onChange(async (value) => {
      this.plugin.settings.separator = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Default name").setDesc("The default note name after the date prefix").addText((text) => text.setPlaceholder("Untitled").setValue(this.plugin.settings.defaultName).onChange(async (value) => {
      this.plugin.settings.defaultName = value || DEFAULT_SETTINGS.defaultName;
      await this.plugin.saveSettings();
    }));
    containerEl.createEl("h3", { text: "Preview" });
    const previewEl = containerEl.createEl("p", {
      text: `New notes will be named: ${this.plugin.generateDatestampedName()}`,
      cls: "setting-item-description"
    });
  }
};
