import { App, Plugin, PluginSettingTab, Setting, TFile, moment } from 'obsidian';

interface DatestampSettings {
    dateFormat: string;
    separator: string;
    defaultName: string;
}

const DEFAULT_SETTINGS: DatestampSettings = {
    dateFormat: 'YYYY-MM-DD',
    separator: '. ',
    defaultName: 'Untitled'
};

export default class DatestampPlugin extends Plugin {
    settings: DatestampSettings;
    private isRenaming: boolean = false;

    async onload() {
        await this.loadSettings();

        // Add settings tab
        this.addSettingTab(new DatestampSettingTab(this.app, this));

        // Listen for new file creation
        this.registerEvent(
            this.app.vault.on('create', (file) => {
                if (file instanceof TFile) {
                    // FIX #1: Use void operator for unhandled promise
                    void this.handleNewFile(file);
                }
            })
        );
    }

    onunload() {
        // Cleanup handled automatically by registerEvent
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
    generateDatestampedName(): string {
        const date = moment().format(this.settings.dateFormat);
        return `${date}${this.settings.separator}${this.settings.defaultName}`;
    }

    /**
     * Handle new file creation - rename if it's an "Untitled" note
     */
    // FIX #2: Add await expression in async method
    async handleNewFile(file: TFile): Promise<void> {
        // Prevent recursive renaming
        if (this.isRenaming) return;

        // Only process markdown files
        if (file.extension !== 'md') return;

        // Check if filename starts with "Untitled"
        const basename = file.basename;
        if (!basename.startsWith('Untitled')) return;

        // Delay to allow Templater and other plugins to process first
        // This prevents conflicts with template processing
        // FIX #3: Use Promise-based delay with await instead of setTimeout callback
        await new Promise<void>((resolve) => setTimeout(resolve, 500));

        // Re-check if file still exists and still has Untitled name
        // (it might have been renamed by another process)
        const currentFile = this.app.vault.getAbstractFileByPath(file.path);
        if (!currentFile || !(currentFile instanceof TFile)) {
            return; // File was deleted or moved
        }

        // Re-check the basename (file might have been renamed by Templater)
        if (!currentFile.basename.startsWith('Untitled')) {
            return; // Already renamed by something else
        }

        if (this.isRenaming) return;
        this.isRenaming = true;

        try {
            // Generate new name with datestamp
            const datestampedName = this.generateDatestampedName();

            // If original was "Untitled 1", "Untitled 2", etc., preserve the suffix
            let newBasename = datestampedName;
            const match = currentFile.basename.match(/^Untitled(\s+\d+)?$/);
            if (match && match[1]) {
                // Has a number suffix like "Untitled 1"
                newBasename = datestampedName + match[1];
            }

            // Get the folder path
            const folderPath = currentFile.parent ? currentFile.parent.path : '';

            // Generate unique path
            let newPath = folderPath ? `${folderPath}/${newBasename}.md` : `${newBasename}.md`;

            // Check if file already exists and make unique if needed
            let counter = 1;
            while (this.app.vault.getAbstractFileByPath(newPath)) {
                const uniqueName = `${datestampedName} ${counter}`;
                newPath = folderPath ? `${folderPath}/${uniqueName}.md` : `${uniqueName}.md`;
                counter++;
            }

            // Rename the file
            await this.app.fileManager.renameFile(currentFile, newPath);
        } catch (error) {
            console.error('Datestamp: Error renaming file', error);
        } finally {
            this.isRenaming = false;
        }
    }
}

class DatestampSettingTab extends PluginSettingTab {
    plugin: DatestampPlugin;

    constructor(app: App, plugin: DatestampPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        // FIX #4: Use new Setting().setName().setHeading() instead of createEl('h2')
        new Setting(containerEl)
            .setName('Datestamp settings')
            .setHeading();

        new Setting(containerEl)
            // FIX #5: Use sentence case for UI text
            .setName('Date format')
            .setDesc('Format for the date prefix. Uses Moment.js format (e.g., YYYY-MM-DD, DD/MM/YYYY)')
            .addText(text => text
                .setPlaceholder('YYYY-MM-DD')
                .setValue(this.plugin.settings.dateFormat)
                .onChange(async (value) => {
                    this.plugin.settings.dateFormat = value || DEFAULT_SETTINGS.dateFormat;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Separator')
            .setDesc('Character(s) between the date and the note name')
            .addText(text => text
                .setPlaceholder('. ')
                .setValue(this.plugin.settings.separator)
                .onChange(async (value) => {
                    this.plugin.settings.separator = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default name')
            .setDesc('The default note name after the date prefix')
            .addText(text => text
                .setPlaceholder('Untitled')
                .setValue(this.plugin.settings.defaultName)
                .onChange(async (value) => {
                    this.plugin.settings.defaultName = value || DEFAULT_SETTINGS.defaultName;
                    await this.plugin.saveSettings();
                }));

        // FIX #6: Use new Setting().setName().setHeading() instead of createEl('h3')
        new Setting(containerEl)
            .setName('Preview')
            .setHeading();
        
        // Display preview text
        containerEl.createEl('p', {
            text: `New notes will be named: ${this.plugin.generateDatestampedName()}`,
            cls: 'setting-item-description'
        });
    }
}
