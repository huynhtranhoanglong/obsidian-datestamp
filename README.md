# Datestamp - Obsidian Plugin

[![GitHub release](https://img.shields.io/github/v/release/huynhtranhoanglong/obsidian-datestamp)](https://github.com/huynhtranhoanglong/obsidian-datestamp/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automatically prefix new note names with today's date.

## Features

- 📅 New notes are named `YYYY-MM-DD. Untitled` instead of just `Untitled`
- ⚙️ Customizable date format, separator, and default name
- 🔌 Plug and play - works immediately after installation
- 🤝 Compatible with Templater and QuickAdd

## Installation

### From Community Plugins
1. Open Settings → Community Plugins
2. Search for "Datestamp"
3. Install and enable

### Manual Installation
1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/huynhtranhoanglong/obsidian-datestamp/releases)
2. Create folder: `<vault>/.obsidian/plugins/datestamp/`
3. Copy the files into this folder
4. Enable the plugin in Settings → Community Plugins

### Using BRAT
1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. Add this repository: `huynhtranhoanglong/obsidian-datestamp`
3. Enable the plugin

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Date format | Moment.js date format | `YYYY-MM-DD` |
| Separator | Characters between date and name | `. ` |
| Default name | Note name after the date | `Untitled` |

### Date format examples
- `YYYY-MM-DD` → 2026-02-02
- `DD/MM/YYYY` → 02/02/2026
- `MMMM Do, YYYY` → February 2nd, 2026

## Compatibility

This plugin is designed to work alongside other plugins:

- **Templater**: A 500ms delay ensures templates are processed before renaming
- **QuickAdd**: Works seamlessly with QuickAdd note creation

## Troubleshooting

### Notes not being renamed?
1. Check if the plugin is enabled in Settings → Community Plugins
2. Restart Obsidian after enabling
3. Make sure you're creating a new note (Ctrl/Cmd + N)

### Conflict with Templater?
The plugin includes a built-in delay to prevent conflicts. If you still experience issues, please [open an issue](https://github.com/huynhtranhoanglong/obsidian-datestamp/issues).

## Support

If you find this plugin useful, consider supporting its development:

[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/huynhtranhoanglong)

## License

MIT
