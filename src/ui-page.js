/**
 * Lite Management Panel HTML generator for OpenClaw
 *
 * Generates the /lite management panel with dual-mode UI:
 * - Simple Mode (default): Dashboard with status hero, quick stats, integrations,
 *   activity feed, memory, settings, and sidebar controls
 * - Advanced Mode: xterm.js terminal with quick command buttons
 */

import { getLangSelectorCSS, getLangSelectorHTML, getI18nBootstrapJS } from './i18n.js';

const LITE_TRANSLATIONS = {
  en: {
    'pageTitle': 'OpenClaw Lite Management',
    'lite.header.onboardLink': '\u2190 Onboarding Wizard',
    'lite.header.simpleMode': 'Simple',
    'lite.header.advancedMode': 'Advanced',
    'lite.status.running': 'Gateway Running',
    'lite.status.stopped': 'Gateway Stopped',
    'lite.status.uptime': 'Uptime',
    'lite.stats.channels': 'Channels',
    'lite.stats.skills': 'Skills',
    'lite.stats.sessions': 'Sessions',
    'lite.providers.title': 'Model Providers',
    'lite.providers.subtitle': 'Connected AI providers',
    'lite.providers.empty': 'No provider data available',
    'lite.providers.noProviders': 'No providers configured',
    'lite.providers.statusLabel': 'Status',
    'lite.providers.modelLabel': 'Model',
    'lite.providers.active': 'Active',
    'lite.providers.connected': 'Connected',
    'lite.providers.notConnected': 'Not connected',
    'lite.channels.title': 'Channels',
    'lite.channels.subtitle': 'Connected messaging channels',
    'lite.channels.empty': 'No channels connected yet',
    'lite.channels.setupLink': 'Set up in the onboarding wizard',
    'lite.channels.configured': 'Configured',
    'lite.channels.connectedLabel': 'Connected',
    'lite.channels.yes': 'Yes',
    'lite.channels.no': 'No',
    'lite.usage.title': 'Daily Token Usage',
    'lite.usage.subtitle': 'Last 7 days',
    'lite.usage.total': 'Total',
    'lite.usage.byType': 'By Type',
    'lite.usage.totalTokens': 'Total tokens',
    'lite.usage.noData': 'No usage data available',
    'lite.usage.notAvailable': 'Usage data not available',
    'lite.usage.loading': 'Loading usage data...',
    'lite.usage.date': 'Date',
    'lite.usage.tokens': 'Tokens',
    'lite.usage.estCost': 'Est. cost',
    'lite.usage.output': 'Output',
    'lite.usage.input': 'Input',
    'lite.usage.cacheWrite': 'Cache Write',
    'lite.usage.cacheRead': 'Cache Read',
    'lite.activity.title': 'Activity',
    'lite.activity.autoScroll': 'Auto-scroll',
    'lite.activity.clear': 'Clear',
    'lite.activity.rawLogs': 'Raw Logs',
    'lite.activity.gatewayOutput': 'Gateway output',
    'lite.activity.patterns.gatewayStarted': 'Gateway started',
    'lite.activity.patterns.gatewayStopped': 'Gateway stopped',
    'lite.activity.patterns.messageReceived': 'Message received',
    'lite.activity.patterns.messageSent': 'Message sent',
    'lite.activity.patterns.channelConnected': 'Channel connected',
    'lite.activity.patterns.channelDisconnected': 'Channel disconnected',
    'lite.activity.patterns.errorDetected': 'Error detected',
    'lite.activity.patterns.devicePaired': 'Device paired',
    'lite.activity.patterns.skillLoaded': 'Skill loaded',
    'lite.activity.patterns.sessionCreated': 'Session created',
    'lite.activity.patterns.scheduledTaskRan': 'Scheduled task ran',
    'lite.activity.patterns.memoryUpdated': 'Memory updated',
    'lite.memory.title': 'Memory & Knowledge',
    'lite.memory.subtitle': 'What your agent remembers',
    'lite.memory.searchPlaceholder': 'Search memory...',
    'lite.memory.searching': 'Searching...',
    'lite.memory.noResults': 'No results found',
    'lite.memory.notAvailable': 'Memory features not available',
    'lite.memory.loading': 'Loading memory status...',
    'lite.memory.status': 'Status',
    'lite.memory.entries': 'Indexed',
    'lite.memory.backend': 'Backend',
    'lite.memory.active': 'Active',
    'lite.memory.totalFiles': 'Files',
    'lite.memory.reindex': 'Re-index',
    'lite.memory.indexing': 'Indexing...',
    'lite.memory.searchFailed': 'Search failed',
    'lite.security.title': 'Security Audit',
    'lite.security.subtitle': 'Check config for security issues',
    'lite.security.runAudit': 'Run Audit',
    'lite.security.deepAudit': 'Deep Audit',
    'lite.security.running': 'Running audit...',
    'lite.security.runningDeep': 'Running deep audit...',
    'lite.security.notAvailable': 'Audit not available',
    'lite.security.passed': 'passed',
    'lite.security.warnings': 'warnings',
    'lite.security.failed': 'failed',
    'lite.security.noFindings': 'No findings',
    'lite.settings.title': 'Settings & Help',
    'lite.settings.setupWizard': 'Setup Wizard',
    'lite.settings.setupWizardDesc': 'Reconfigure providers, channels, and skills',
    'lite.settings.advancedTerminal': 'Advanced Terminal',
    'lite.settings.advancedTerminalDesc': 'Full CLI access and command palette',
    'lite.settings.documentation': 'Documentation',
    'lite.settings.documentationDesc': 'Guides, API reference, and tutorials',
    'lite.quickActions.title': 'Quick Actions',
    'lite.quickActions.start': 'Start Gateway',
    'lite.quickActions.stop': 'Stop Gateway',
    'lite.quickActions.restart': 'Restart Gateway',
    'lite.quickActions.working': 'Working...',
    'lite.maintenance.title': 'Maintenance',
    'lite.maintenance.version': 'Version',
    'lite.maintenance.downloadBackup': 'Download Backup',
    'lite.maintenance.restoreBackup': 'Restore from Backup',
    'lite.maintenance.upgradeAvailable': 'Upgrade Available',
    'lite.maintenance.restoring': 'Restoring...',
    'lite.maintenance.upgrading': 'Upgrading...',
    'lite.maintenance.upgradeTo': 'Upgrade to {version}',
    'lite.maintenance.redeployToUpdate': 'redeploy to update',
    'lite.maintenance.available': '{version} available',
    'lite.maintenance.restoreTitle': 'Restore from Backup',
    'lite.maintenance.restoreMessage': 'This will replace your current configuration with the backup file "{filename}". An auto-backup will be created first. The gateway will be restarted.',
    'lite.maintenance.upgradeTitle': 'Upgrade OpenClaw',
    'lite.maintenance.upgradeMessage': 'This will install the latest version of OpenClaw via npm. An auto-backup will be created first. The gateway will be restarted.',
    'lite.maintenance.invalidFile': 'Please select a .tar.gz, .tgz, or .zip file',
    'lite.maintenance.restoreSuccess': 'Restore completed successfully',
    'lite.maintenance.restoreFailed': 'Restore failed: {error}',
    'lite.maintenance.restoreError': 'Restore error: {error}',
    'lite.maintenance.upgradeSuccess': 'Upgrade completed successfully',
    'lite.maintenance.upgradeFailed': 'Upgrade failed: {error}',
    'lite.maintenance.upgradeError': 'Upgrade error: {error}',
    'lite.confirm.cancel': 'Cancel',
    'lite.confirm.continue': 'Continue',
    'lite.token.title': 'Gateway Token',
    'lite.token.description': 'Use this token to connect clients to your agent.',
    'lite.token.show': 'Show',
    'lite.token.hide': 'Hide',
    'lite.token.copy': 'Copy',
    'lite.token.copied': 'Token copied to clipboard',
    'lite.systemInfo.title': 'System Info',
    'lite.systemInfo.status': 'Status',
    'lite.systemInfo.stateDir': 'State directory',
    'lite.systemInfo.internalPort': 'Internal port',
    'lite.systemInfo.pid': 'PID',
    'lite.systemInfo.running': 'Running',
    'lite.systemInfo.stopped': 'Stopped',
    'lite.terminal.notConnected': 'Not connected',
    'lite.terminal.connecting': 'Connecting...',
    'lite.terminal.connected': 'Connected',
    'lite.terminal.disconnected': 'Disconnected',
    'lite.terminal.error': 'Error',
    'lite.commandPalette.title': 'Command Palette',
    'lite.commandPalette.searchPlaceholder': 'Search commands...',
    'lite.commandPalette.noMatch': 'No commands match your search.',
    'lite.cmd.status': 'Session health & recent recipients',
    'lite.cmd.health': 'Fetch health from running gateway',
    'lite.cmd.channelsList': 'Show configured channels',
    'lite.cmd.logsFollow': 'Tail gateway logs',
    'lite.cmd.version': 'Print version',
    'lite.cmd.gatewayStatus': 'Probe gateway RPC and show status',
    'lite.cmd.gatewayHealth': 'Fetch gateway health',
    'lite.cmd.logs': 'Tail gateway file logs',
    'lite.cmd.configGet': 'Print full config',
    'lite.cmd.doctor': 'Run health checks and quick fixes',
    'lite.cmd.doctorDeep': 'Deep health check',
    'lite.cmd.modelsList': 'List available models',
    'lite.cmd.modelsStatus': 'Auth overview and status',
    'lite.cmd.modelsScan': 'Scan for available models',
    'lite.cmd.channelsStatus': 'Check channel health',
    'lite.cmd.channelsLogs': 'Show recent channel logs',
    'lite.cmd.pairingList': 'List pairing requests',
    'lite.cmd.skillsList': 'List available skills',
    'lite.cmd.skillsCheck': 'Summary of ready vs missing',
    'lite.cmd.pluginsList': 'Discover installed plugins',
    'lite.cmd.pluginsDoctor': 'Report plugin load errors',
    'lite.cmd.memoryStatus': 'Show memory index stats',
    'lite.cmd.memoryIndex': 'Reindex memory files',
    'lite.cmd.cronList': 'List scheduled jobs',
    'lite.cmd.cronStatus': 'Show cron status',
    'lite.cmd.sessions': 'List conversation sessions',
    'lite.cmd.statusAll': 'Full status with all details',
    'lite.cmd.agentsList': 'List configured agents',
    'lite.cmd.nodesStatus': 'List nodes from gateway',
    'lite.cmd.nodesList': 'List all nodes',
    'lite.cmd.nodesPending': 'Show pending node approvals',
    'lite.cmd.devices': 'List paired devices',
    'lite.cmd.securityAudit': 'Audit config for common issues',
    'lite.cmd.securityAuditDeep': 'Live gateway probe audit',
    'lite.cmd.browserStatus': 'Show browser status',
    'lite.cmd.browserTabs': 'List open browser tabs',
    'lite.cmd.hooksList': 'List hooks',
    'lite.cmd.sandboxList': 'List sandboxes',
    'lite.cmd.docs': 'Search the live docs index',
    'lite.cmd.help': 'Show help'
  },
  'zh-TW': {
    'pageTitle': 'OpenClaw \u7CBE\u7C21\u7BA1\u7406',
    'lite.header.onboardLink': '\u2190 \u5F15\u5C0E\u7CBE\u9748',
    'lite.header.simpleMode': '\u7C21\u6613',
    'lite.header.advancedMode': '\u9032\u968E',
    'lite.status.running': '\u7DB2\u95DC\u904B\u884C\u4E2D',
    'lite.status.stopped': '\u7DB2\u95DC\u5DF2\u505C\u6B62',
    'lite.status.uptime': '\u904B\u884C\u6642\u9593',
    'lite.stats.channels': '\u983B\u9053',
    'lite.stats.skills': '\u6280\u80FD',
    'lite.stats.sessions': '\u5DE5\u4F5C\u968E\u6BB5',
    'lite.providers.title': '\u6A21\u578B\u63D0\u4F9B\u8005',
    'lite.providers.subtitle': '\u5DF2\u9023\u63A5\u7684 AI \u63D0\u4F9B\u8005',
    'lite.providers.empty': '\u7121\u63D0\u4F9B\u8005\u8CC7\u6599',
    'lite.providers.noProviders': '\u5C1A\u672A\u8A2D\u5B9A\u63D0\u4F9B\u8005',
    'lite.providers.statusLabel': '\u72C0\u614B',
    'lite.providers.modelLabel': '\u6A21\u578B',
    'lite.providers.active': '\u4F7F\u7528\u4E2D',
    'lite.providers.connected': '\u5DF2\u9023\u63A5',
    'lite.providers.notConnected': '\u672A\u9023\u63A5',
    'lite.channels.title': '\u983B\u9053',
    'lite.channels.subtitle': '\u5DF2\u9023\u63A5\u7684\u8A0A\u606F\u983B\u9053',
    'lite.channels.empty': '\u5C1A\u672A\u9023\u63A5\u983B\u9053',
    'lite.channels.setupLink': '\u5728\u5F15\u5C0E\u7CBE\u9748\u4E2D\u8A2D\u5B9A',
    'lite.channels.configured': '\u5DF2\u8A2D\u5B9A',
    'lite.channels.connectedLabel': '\u5DF2\u9023\u63A5',
    'lite.channels.yes': '\u662F',
    'lite.channels.no': '\u5426',
    'lite.usage.title': '\u6BCF\u65E5\u4EE3\u5E63\u7528\u91CF',
    'lite.usage.subtitle': '\u904E\u53BB 7 \u5929',
    'lite.usage.total': '\u7E3D\u8A08',
    'lite.usage.byType': '\u4F9D\u985E\u578B',
    'lite.usage.totalTokens': '\u7E3D\u4EE3\u5E63\u6578',
    'lite.usage.noData': '\u7121\u7528\u91CF\u8CC7\u6599',
    'lite.usage.notAvailable': '\u7528\u91CF\u8CC7\u6599\u4E0D\u53EF\u7528',
    'lite.usage.date': '\u65E5\u671F',
    'lite.usage.tokens': '\u4EE3\u5E63',
    'lite.usage.estCost': '\u9810\u4F30\u8CBB\u7528',
    'lite.usage.output': '\u8F38\u51FA',
    'lite.usage.input': '\u8F38\u5165',
    'lite.usage.cacheWrite': '\u5FEB\u53D6\u5BEB\u5165',
    'lite.usage.cacheRead': '\u5FEB\u53D6\u8B80\u53D6',
    'lite.activity.title': '\u6D3B\u52D5',
    'lite.activity.autoScroll': '\u81EA\u52D5\u6372\u52D5',
    'lite.activity.clear': '\u6E05\u9664',
    'lite.activity.rawLogs': '\u539F\u59CB\u65E5\u8A8C',
    'lite.activity.gatewayOutput': '\u7DB2\u95DC\u8F38\u51FA',
    'lite.activity.patterns.gatewayStarted': '\u7DB2\u95DC\u5DF2\u555F\u52D5',
    'lite.activity.patterns.gatewayStopped': '\u7DB2\u95DC\u5DF2\u505C\u6B62',
    'lite.activity.patterns.messageReceived': '\u6536\u5230\u8A0A\u606F',
    'lite.activity.patterns.messageSent': '\u8A0A\u606F\u5DF2\u50B3\u9001',
    'lite.activity.patterns.channelConnected': '\u983B\u9053\u5DF2\u9023\u63A5',
    'lite.activity.patterns.channelDisconnected': '\u983B\u9053\u5DF2\u65B7\u958B',
    'lite.activity.patterns.errorDetected': '\u5075\u6E2C\u5230\u932F\u8AA4',
    'lite.activity.patterns.devicePaired': '\u88DD\u7F6E\u5DF2\u914D\u5C0D',
    'lite.activity.patterns.skillLoaded': '\u6280\u80FD\u5DF2\u8F09\u5165',
    'lite.activity.patterns.sessionCreated': '\u5DE5\u4F5C\u968E\u6BB5\u5DF2\u5EFA\u7ACB',
    'lite.activity.patterns.scheduledTaskRan': '\u6392\u7A0B\u4EFB\u52D9\u5DF2\u57F7\u884C',
    'lite.activity.patterns.memoryUpdated': '\u8A18\u61B6\u5DF2\u66F4\u65B0',
    'lite.memory.title': '\u8A18\u61B6\u8207\u77E5\u8B58',
    'lite.memory.subtitle': '\u60A8\u7684\u52A9\u7406\u8A18\u5F97\u7684\u5167\u5BB9',
    'lite.memory.searchPlaceholder': '\u641C\u5C0B\u8A18\u61B6...',
    'lite.memory.searching': '\u641C\u5C0B\u4E2D...',
    'lite.memory.noResults': '\u672A\u627E\u5230\u7D50\u679C',
    'lite.memory.notAvailable': '\u8A18\u61B6\u529F\u80FD\u4E0D\u53EF\u7528',
    'lite.memory.status': '\u72C0\u614B',
    'lite.memory.entries': '\u5DF2\u7D22\u5F15',
    'lite.memory.backend': '\u5F8C\u7AEF',
    'lite.memory.active': '\u4F7F\u7528\u4E2D',
    'lite.memory.totalFiles': '\u6A94\u6848',
    'lite.memory.reindex': '\u91CD\u65B0\u7D22\u5F15',
    'lite.memory.indexing': '\u7D22\u5F15\u4E2D...',
    'lite.memory.searchFailed': '\u641C\u5C0B\u5931\u6557',
    'lite.security.title': '\u5B89\u5168\u5BE9\u8A08',
    'lite.security.subtitle': '\u6AA2\u67E5\u8A2D\u5B9A\u7684\u5B89\u5168\u554F\u984C',
    'lite.security.runAudit': '\u57F7\u884C\u5BE9\u8A08',
    'lite.security.deepAudit': '\u6DF1\u5EA6\u5BE9\u8A08',
    'lite.security.running': '\u57F7\u884C\u5BE9\u8A08\u4E2D...',
    'lite.security.runningDeep': '\u57F7\u884C\u6DF1\u5EA6\u5BE9\u8A08\u4E2D...',
    'lite.security.notAvailable': '\u5BE9\u8A08\u4E0D\u53EF\u7528',
    'lite.security.passed': '\u901A\u904E',
    'lite.security.warnings': '\u8B66\u544A',
    'lite.security.failed': '\u5931\u6557',
    'lite.security.noFindings': '\u7121\u767C\u73FE',
    'lite.settings.title': '\u8A2D\u5B9A\u8207\u5E6B\u52A9',
    'lite.settings.setupWizard': '\u8A2D\u5B9A\u7CBE\u9748',
    'lite.settings.setupWizardDesc': '\u91CD\u65B0\u8A2D\u5B9A\u63D0\u4F9B\u8005\u3001\u983B\u9053\u548C\u6280\u80FD',
    'lite.settings.advancedTerminal': '\u9032\u968E\u7D42\u7AEF',
    'lite.settings.advancedTerminalDesc': '\u5B8C\u6574\u7684 CLI \u5B58\u53D6\u548C\u547D\u4EE4\u9762\u677F',
    'lite.settings.documentation': '\u6587\u4EF6',
    'lite.settings.documentationDesc': '\u6307\u5357\u3001API \u53C3\u8003\u548C\u6559\u5B78',
    'lite.quickActions.title': '\u5FEB\u901F\u64CD\u4F5C',
    'lite.quickActions.start': '\u555F\u52D5\u7DB2\u95DC',
    'lite.quickActions.stop': '\u505C\u6B62\u7DB2\u95DC',
    'lite.quickActions.restart': '\u91CD\u555F\u7DB2\u95DC',
    'lite.quickActions.working': '\u8655\u7406\u4E2D...',
    'lite.maintenance.title': '\u7DAD\u8B77',
    'lite.maintenance.version': '\u7248\u672C',
    'lite.maintenance.downloadBackup': '\u4E0B\u8F09\u5099\u4EFD',
    'lite.maintenance.restoreBackup': '\u5F9E\u5099\u4EFD\u9084\u539F',
    'lite.maintenance.upgradeAvailable': '\u53EF\u7528\u5347\u7D1A',
    'lite.maintenance.restoring': '\u9084\u539F\u4E2D...',
    'lite.maintenance.upgrading': '\u5347\u7D1A\u4E2D...',
    'lite.maintenance.restoreTitle': '\u5F9E\u5099\u4EFD\u9084\u539F',
    'lite.maintenance.restoreMessage': '\u9019\u5C07\u4EE5\u5099\u4EFD\u6A94\u300C{filename}\u300D\u53D6\u4EE3\u76EE\u524D\u7684\u8A2D\u5B9A\u3002\u7CFB\u7D71\u6703\u5148\u81EA\u52D5\u5099\u4EFD\u3002\u7DB2\u95DC\u5C07\u6703\u91CD\u65B0\u555F\u52D5\u3002',
    'lite.maintenance.upgradeTitle': '\u5347\u7D1A OpenClaw',
    'lite.maintenance.upgradeMessage': '\u9019\u5C07\u900F\u904E npm \u5B89\u88DD\u6700\u65B0\u7248\u672C\u7684 OpenClaw\u3002\u7CFB\u7D71\u6703\u5148\u81EA\u52D5\u5099\u4EFD\u3002\u7DB2\u95DC\u5C07\u6703\u91CD\u65B0\u555F\u52D5\u3002',
    'lite.maintenance.invalidFile': '\u8ACB\u9078\u64C7 .tar.gz\u3001.tgz \u6216 .zip \u6A94\u6848',
    'lite.maintenance.restoreSuccess': '\u9084\u539F\u5B8C\u6210',
    'lite.maintenance.restoreFailed': '\u9084\u539F\u5931\u6557\uFF1A{error}',
    'lite.maintenance.upgradeSuccess': '\u5347\u7D1A\u5B8C\u6210',
    'lite.maintenance.upgradeFailed': '\u5347\u7D1A\u5931\u6557\uFF1A{error}',
    'lite.confirm.cancel': '\u53D6\u6D88',
    'lite.confirm.continue': '\u7E7C\u7E8C',
    'lite.token.title': '\u7DB2\u95DC\u4EE3\u5E63',
    'lite.token.description': '\u4F7F\u7528\u6B64\u4EE3\u5E63\u5C07\u5BA2\u6236\u7AEF\u9023\u63A5\u5230\u60A8\u7684\u52A9\u7406\u3002',
    'lite.token.show': '\u986F\u793A',
    'lite.token.hide': '\u96B1\u85CF',
    'lite.token.copy': '\u8907\u88FD',
    'lite.token.copied': '\u4EE3\u5E63\u5DF2\u8907\u88FD\u5230\u526A\u8CBC\u677F',
    'lite.systemInfo.title': '\u7CFB\u7D71\u8CC7\u8A0A',
    'lite.systemInfo.status': '\u72C0\u614B',
    'lite.systemInfo.stateDir': '\u72C0\u614B\u76EE\u9304',
    'lite.systemInfo.internalPort': '\u5167\u90E8\u57E0',
    'lite.systemInfo.pid': 'PID',
    'lite.systemInfo.running': '\u904B\u884C\u4E2D',
    'lite.systemInfo.stopped': '\u5DF2\u505C\u6B62',
    'lite.terminal.notConnected': '\u672A\u9023\u63A5',
    'lite.terminal.connecting': '\u9023\u63A5\u4E2D...',
    'lite.terminal.connected': '\u5DF2\u9023\u63A5',
    'lite.terminal.disconnected': '\u5DF2\u65B7\u958B',
    'lite.commandPalette.title': '\u547D\u4EE4\u9762\u677F',
    'lite.commandPalette.searchPlaceholder': '\u641C\u5C0B\u547D\u4EE4...',
    'lite.commandPalette.noMatch': '\u6C92\u6709\u7B26\u5408\u641C\u5C0B\u7684\u547D\u4EE4\u3002',
    'lite.cmd.status': '\u5DE5\u4F5C\u968E\u6BB5\u5065\u5EB7\u548C\u6700\u8FD1\u63A5\u6536\u8005',
    'lite.cmd.health': '\u5F9E\u904B\u884C\u4E2D\u7684\u7DB2\u95DC\u53D6\u5F97\u5065\u5EB7\u72C0\u614B',
    'lite.cmd.channelsList': '\u986F\u793A\u5DF2\u8A2D\u5B9A\u7684\u983B\u9053',
    'lite.cmd.logsFollow': '\u5373\u6642\u8FFD\u8E64\u7DB2\u95DC\u65E5\u8A8C',
    'lite.cmd.version': '\u986F\u793A\u7248\u672C',
    'lite.cmd.gatewayStatus': '\u63A2\u6E2C\u7DB2\u95DC RPC \u4E26\u986F\u793A\u72C0\u614B',
    'lite.cmd.gatewayHealth': '\u53D6\u5F97\u7DB2\u95DC\u5065\u5EB7\u72C0\u614B',
    'lite.cmd.logs': '\u8FFD\u8E64\u7DB2\u95DC\u6A94\u6848\u65E5\u8A8C',
    'lite.cmd.configGet': '\u8F38\u51FA\u5B8C\u6574\u8A2D\u5B9A',
    'lite.cmd.doctor': '\u57F7\u884C\u5065\u5EB7\u6AA2\u67E5\u548C\u5FEB\u901F\u4FEE\u5FA9',
    'lite.cmd.doctorDeep': '\u6DF1\u5EA6\u5065\u5EB7\u6AA2\u67E5',
    'lite.cmd.modelsList': '\u5217\u51FA\u53EF\u7528\u6A21\u578B',
    'lite.cmd.modelsStatus': '\u9A57\u8B49\u6982\u89C0\u548C\u72C0\u614B',
    'lite.cmd.modelsScan': '\u6383\u63CF\u53EF\u7528\u6A21\u578B',
    'lite.cmd.channelsStatus': '\u6AA2\u67E5\u983B\u9053\u5065\u5EB7\u72C0\u614B',
    'lite.cmd.channelsLogs': '\u986F\u793A\u6700\u8FD1\u983B\u9053\u65E5\u8A8C',
    'lite.cmd.pairingList': '\u5217\u51FA\u914D\u5C0D\u8ACB\u6C42',
    'lite.cmd.skillsList': '\u5217\u51FA\u53EF\u7528\u6280\u80FD',
    'lite.cmd.skillsCheck': '\u5C31\u7DD2\u8207\u7F3A\u5C11\u7684\u6458\u8981',
    'lite.cmd.pluginsList': '\u63A2\u7D22\u5DF2\u5B89\u88DD\u7684\u63D2\u4EF6',
    'lite.cmd.pluginsDoctor': '\u5831\u544A\u63D2\u4EF6\u8F09\u5165\u932F\u8AA4',
    'lite.cmd.memoryStatus': '\u986F\u793A\u8A18\u61B6\u7D22\u5F15\u7D71\u8A08',
    'lite.cmd.memoryIndex': '\u91CD\u65B0\u7D22\u5F15\u8A18\u61B6\u6A94\u6848',
    'lite.cmd.cronList': '\u5217\u51FA\u6392\u7A0B\u4EFB\u52D9',
    'lite.cmd.cronStatus': '\u986F\u793A\u6392\u7A0B\u72C0\u614B',
    'lite.cmd.sessions': '\u5217\u51FA\u5C0D\u8A71\u5DE5\u4F5C\u968E\u6BB5',
    'lite.cmd.statusAll': '\u5B8C\u6574\u72C0\u614B\u8207\u6240\u6709\u8A73\u7D30\u8CC7\u8A0A',
    'lite.cmd.agentsList': '\u5217\u51FA\u5DF2\u8A2D\u5B9A\u7684\u4EE3\u7406',
    'lite.cmd.nodesStatus': '\u5F9E\u7DB2\u95DC\u5217\u51FA\u7BC0\u9EDE',
    'lite.cmd.nodesList': '\u5217\u51FA\u6240\u6709\u7BC0\u9EDE',
    'lite.cmd.nodesPending': '\u986F\u793A\u5F85\u6838\u51C6\u7684\u7BC0\u9EDE',
    'lite.cmd.devices': '\u5217\u51FA\u5DF2\u914D\u5C0D\u7684\u88DD\u7F6E',
    'lite.cmd.securityAudit': '\u5BE9\u8A08\u8A2D\u5B9A\u7684\u5E38\u898B\u554F\u984C',
    'lite.cmd.securityAuditDeep': '\u5373\u6642\u7DB2\u95DC\u63A2\u6E2C\u5BE9\u8A08',
    'lite.cmd.browserStatus': '\u986F\u793A\u700F\u89BD\u5668\u72C0\u614B',
    'lite.cmd.browserTabs': '\u5217\u51FA\u958B\u555F\u7684\u700F\u89BD\u5668\u5206\u9801',
    'lite.cmd.hooksList': '\u5217\u51FA\u9264\u5B50',
    'lite.cmd.sandboxList': '\u5217\u51FA\u6C99\u7BB1',
    'lite.cmd.docs': '\u641C\u5C0B\u5373\u6642\u6587\u4EF6\u7D22\u5F15',
    'lite.cmd.help': '\u986F\u793A\u5E6B\u52A9'
  },
  'zh-CN': {
    'pageTitle': 'OpenClaw \u7CBE\u7B80\u7BA1\u7406',
    'lite.header.onboardLink': '\u2190 \u5F15\u5BFC\u5411\u5BFC',
    'lite.header.simpleMode': '\u7B80\u6613',
    'lite.header.advancedMode': '\u8FDB\u9636',
    'lite.status.running': '\u7F51\u5173\u8FD0\u884C\u4E2D',
    'lite.status.stopped': '\u7F51\u5173\u5DF2\u505C\u6B62',
    'lite.status.uptime': '\u8FD0\u884C\u65F6\u95F4',
    'lite.stats.channels': '\u9891\u9053',
    'lite.stats.skills': '\u6280\u80FD',
    'lite.stats.sessions': '\u4F1A\u8BDD',
    'lite.providers.title': '\u6A21\u578B\u63D0\u4F9B\u8005',
    'lite.providers.subtitle': '\u5DF2\u8FDE\u63A5\u7684 AI \u63D0\u4F9B\u8005',
    'lite.providers.empty': '\u65E0\u63D0\u4F9B\u8005\u6570\u636E',
    'lite.providers.noProviders': '\u5C1A\u672A\u914D\u7F6E\u63D0\u4F9B\u8005',
    'lite.providers.statusLabel': '\u72B6\u6001',
    'lite.providers.modelLabel': '\u6A21\u578B',
    'lite.providers.active': '\u4F7F\u7528\u4E2D',
    'lite.providers.connected': '\u5DF2\u8FDE\u63A5',
    'lite.providers.notConnected': '\u672A\u8FDE\u63A5',
    'lite.channels.title': '\u9891\u9053',
    'lite.channels.subtitle': '\u5DF2\u8FDE\u63A5\u7684\u6D88\u606F\u9891\u9053',
    'lite.channels.empty': '\u5C1A\u672A\u8FDE\u63A5\u9891\u9053',
    'lite.channels.setupLink': '\u5728\u5F15\u5BFC\u5411\u5BFC\u4E2D\u8BBE\u7F6E',
    'lite.channels.configured': '\u5DF2\u914D\u7F6E',
    'lite.channels.connectedLabel': '\u5DF2\u8FDE\u63A5',
    'lite.channels.yes': '\u662F',
    'lite.channels.no': '\u5426',
    'lite.usage.title': '\u6BCF\u65E5\u4EE3\u5E01\u7528\u91CF',
    'lite.usage.subtitle': '\u8FC7\u53BB 7 \u5929',
    'lite.usage.total': '\u603B\u8BA1',
    'lite.usage.byType': '\u6309\u7C7B\u578B',
    'lite.usage.totalTokens': '\u603B\u4EE3\u5E01\u6570',
    'lite.usage.noData': '\u65E0\u7528\u91CF\u6570\u636E',
    'lite.usage.notAvailable': '\u7528\u91CF\u6570\u636E\u4E0D\u53EF\u7528',
    'lite.usage.date': '\u65E5\u671F',
    'lite.usage.tokens': '\u4EE3\u5E01',
    'lite.usage.estCost': '\u9884\u4F30\u8D39\u7528',
    'lite.usage.output': '\u8F93\u51FA',
    'lite.usage.input': '\u8F93\u5165',
    'lite.usage.cacheWrite': '\u7F13\u5B58\u5199\u5165',
    'lite.usage.cacheRead': '\u7F13\u5B58\u8BFB\u53D6',
    'lite.activity.title': '\u6D3B\u52A8',
    'lite.activity.autoScroll': '\u81EA\u52A8\u6EDA\u52A8',
    'lite.activity.clear': '\u6E05\u9664',
    'lite.activity.rawLogs': '\u539F\u59CB\u65E5\u5FD7',
    'lite.activity.gatewayOutput': '\u7F51\u5173\u8F93\u51FA',
    'lite.activity.patterns.gatewayStarted': '\u7F51\u5173\u5DF2\u542F\u52A8',
    'lite.activity.patterns.gatewayStopped': '\u7F51\u5173\u5DF2\u505C\u6B62',
    'lite.activity.patterns.messageReceived': '\u6536\u5230\u6D88\u606F',
    'lite.activity.patterns.messageSent': '\u6D88\u606F\u5DF2\u53D1\u9001',
    'lite.activity.patterns.channelConnected': '\u9891\u9053\u5DF2\u8FDE\u63A5',
    'lite.activity.patterns.channelDisconnected': '\u9891\u9053\u5DF2\u65AD\u5F00',
    'lite.activity.patterns.errorDetected': '\u68C0\u6D4B\u5230\u9519\u8BEF',
    'lite.activity.patterns.devicePaired': '\u8BBE\u5907\u5DF2\u914D\u5BF9',
    'lite.activity.patterns.skillLoaded': '\u6280\u80FD\u5DF2\u52A0\u8F7D',
    'lite.activity.patterns.sessionCreated': '\u4F1A\u8BDD\u5DF2\u521B\u5EFA',
    'lite.activity.patterns.scheduledTaskRan': '\u5B9A\u65F6\u4EFB\u52A1\u5DF2\u6267\u884C',
    'lite.activity.patterns.memoryUpdated': '\u8BB0\u5FC6\u5DF2\u66F4\u65B0',
    'lite.memory.title': '\u8BB0\u5FC6\u4E0E\u77E5\u8BC6',
    'lite.memory.subtitle': '\u60A8\u7684\u52A9\u7406\u8BB0\u5F97\u7684\u5185\u5BB9',
    'lite.memory.searchPlaceholder': '\u641C\u7D22\u8BB0\u5FC6...',
    'lite.memory.searching': '\u641C\u7D22\u4E2D...',
    'lite.memory.noResults': '\u672A\u627E\u5230\u7ED3\u679C',
    'lite.memory.notAvailable': '\u8BB0\u5FC6\u529F\u80FD\u4E0D\u53EF\u7528',
    'lite.memory.status': '\u72B6\u6001',
    'lite.memory.entries': '\u5DF2\u7D22\u5F15',
    'lite.memory.backend': '\u540E\u7AEF',
    'lite.memory.active': '\u6D3B\u8DC3',
    'lite.memory.totalFiles': '\u6587\u4EF6',
    'lite.memory.reindex': '\u91CD\u65B0\u7D22\u5F15',
    'lite.memory.indexing': '\u7D22\u5F15\u4E2D...',
    'lite.memory.searchFailed': '\u641C\u7D22\u5931\u8D25',
    'lite.security.title': '\u5B89\u5168\u5BA1\u8BA1',
    'lite.security.subtitle': '\u68C0\u67E5\u914D\u7F6E\u7684\u5B89\u5168\u95EE\u9898',
    'lite.security.runAudit': '\u6267\u884C\u5BA1\u8BA1',
    'lite.security.deepAudit': '\u6DF1\u5EA6\u5BA1\u8BA1',
    'lite.security.running': '\u6267\u884C\u5BA1\u8BA1\u4E2D...',
    'lite.security.runningDeep': '\u6267\u884C\u6DF1\u5EA6\u5BA1\u8BA1\u4E2D...',
    'lite.security.notAvailable': '\u5BA1\u8BA1\u4E0D\u53EF\u7528',
    'lite.security.passed': '\u901A\u8FC7',
    'lite.security.warnings': '\u8B66\u544A',
    'lite.security.failed': '\u5931\u8D25',
    'lite.security.noFindings': '\u65E0\u53D1\u73B0',
    'lite.settings.title': '\u8BBE\u7F6E\u4E0E\u5E2E\u52A9',
    'lite.settings.setupWizard': '\u8BBE\u7F6E\u5411\u5BFC',
    'lite.settings.setupWizardDesc': '\u91CD\u65B0\u914D\u7F6E\u63D0\u4F9B\u8005\u3001\u9891\u9053\u548C\u6280\u80FD',
    'lite.settings.advancedTerminal': '\u8FDB\u9636\u7EC8\u7AEF',
    'lite.settings.advancedTerminalDesc': '\u5B8C\u6574\u7684 CLI \u8BBF\u95EE\u548C\u547D\u4EE4\u9762\u677F',
    'lite.settings.documentation': '\u6587\u6863',
    'lite.settings.documentationDesc': '\u6307\u5357\u3001API \u53C2\u8003\u548C\u6559\u7A0B',
    'lite.quickActions.title': '\u5FEB\u901F\u64CD\u4F5C',
    'lite.quickActions.start': '\u542F\u52A8\u7F51\u5173',
    'lite.quickActions.stop': '\u505C\u6B62\u7F51\u5173',
    'lite.quickActions.restart': '\u91CD\u542F\u7F51\u5173',
    'lite.quickActions.working': '\u5904\u7406\u4E2D...',
    'lite.maintenance.title': '\u7EF4\u62A4',
    'lite.maintenance.version': '\u7248\u672C',
    'lite.maintenance.downloadBackup': '\u4E0B\u8F7D\u5907\u4EFD',
    'lite.maintenance.restoreBackup': '\u4ECE\u5907\u4EFD\u6062\u590D',
    'lite.maintenance.upgradeAvailable': '\u53EF\u7528\u5347\u7EA7',
    'lite.maintenance.restoring': '\u6062\u590D\u4E2D...',
    'lite.maintenance.upgrading': '\u5347\u7EA7\u4E2D...',
    'lite.maintenance.restoreTitle': '\u4ECE\u5907\u4EFD\u6062\u590D',
    'lite.maintenance.restoreMessage': '\u8FD9\u5C06\u4EE5\u5907\u4EFD\u6587\u4EF6\u201C{filename}\u201D\u66FF\u6362\u5F53\u524D\u914D\u7F6E\u3002\u7CFB\u7EDF\u4F1A\u5148\u81EA\u52A8\u5907\u4EFD\u3002\u7F51\u5173\u5C06\u4F1A\u91CD\u65B0\u542F\u52A8\u3002',
    'lite.maintenance.upgradeTitle': '\u5347\u7EA7 OpenClaw',
    'lite.maintenance.upgradeMessage': '\u8FD9\u5C06\u901A\u8FC7 npm \u5B89\u88C5\u6700\u65B0\u7248\u672C\u7684 OpenClaw\u3002\u7CFB\u7EDF\u4F1A\u5148\u81EA\u52A8\u5907\u4EFD\u3002\u7F51\u5173\u5C06\u4F1A\u91CD\u65B0\u542F\u52A8\u3002',
    'lite.maintenance.invalidFile': '\u8BF7\u9009\u62E9 .tar.gz\u3001.tgz \u6216 .zip \u6587\u4EF6',
    'lite.maintenance.restoreSuccess': '\u6062\u590D\u5B8C\u6210',
    'lite.maintenance.restoreFailed': '\u6062\u590D\u5931\u8D25\uFF1A{error}',
    'lite.maintenance.upgradeSuccess': '\u5347\u7EA7\u5B8C\u6210',
    'lite.maintenance.upgradeFailed': '\u5347\u7EA7\u5931\u8D25\uFF1A{error}',
    'lite.confirm.cancel': '\u53D6\u6D88',
    'lite.confirm.continue': '\u7EE7\u7EED',
    'lite.token.title': '\u7F51\u5173\u4EE4\u724C',
    'lite.token.description': '\u4F7F\u7528\u6B64\u4EE4\u724C\u5C06\u5BA2\u6237\u7AEF\u8FDE\u63A5\u5230\u60A8\u7684\u52A9\u7406\u3002',
    'lite.token.show': '\u663E\u793A',
    'lite.token.hide': '\u9690\u85CF',
    'lite.token.copy': '\u590D\u5236',
    'lite.token.copied': '\u4EE4\u724C\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F',
    'lite.systemInfo.title': '\u7CFB\u7EDF\u4FE1\u606F',
    'lite.systemInfo.status': '\u72B6\u6001',
    'lite.systemInfo.stateDir': '\u72B6\u6001\u76EE\u5F55',
    'lite.systemInfo.internalPort': '\u5185\u90E8\u7AEF\u53E3',
    'lite.systemInfo.pid': 'PID',
    'lite.systemInfo.running': '\u8FD0\u884C\u4E2D',
    'lite.systemInfo.stopped': '\u5DF2\u505C\u6B62',
    'lite.terminal.notConnected': '\u672A\u8FDE\u63A5',
    'lite.terminal.connecting': '\u8FDE\u63A5\u4E2D...',
    'lite.terminal.connected': '\u5DF2\u8FDE\u63A5',
    'lite.terminal.disconnected': '\u5DF2\u65AD\u5F00',
    'lite.commandPalette.title': '\u547D\u4EE4\u9762\u677F',
    'lite.commandPalette.searchPlaceholder': '\u641C\u7D22\u547D\u4EE4...',
    'lite.commandPalette.noMatch': '\u6CA1\u6709\u7B26\u5408\u641C\u7D22\u7684\u547D\u4EE4\u3002',
    'lite.cmd.status': '\u4F1A\u8BDD\u5065\u5EB7\u548C\u6700\u8FD1\u63A5\u6536\u8005',
    'lite.cmd.health': '\u4ECE\u8FD0\u884C\u4E2D\u7684\u7F51\u5173\u83B7\u53D6\u5065\u5EB7\u72B6\u6001',
    'lite.cmd.channelsList': '\u663E\u793A\u5DF2\u914D\u7F6E\u7684\u9891\u9053',
    'lite.cmd.logsFollow': '\u5B9E\u65F6\u8DDF\u8E2A\u7F51\u5173\u65E5\u5FD7',
    'lite.cmd.version': '\u663E\u793A\u7248\u672C',
    'lite.cmd.gatewayStatus': '\u63A2\u6D4B\u7F51\u5173 RPC \u5E76\u663E\u793A\u72B6\u6001',
    'lite.cmd.gatewayHealth': '\u83B7\u53D6\u7F51\u5173\u5065\u5EB7\u72B6\u6001',
    'lite.cmd.logs': '\u8DDF\u8E2A\u7F51\u5173\u6587\u4EF6\u65E5\u5FD7',
    'lite.cmd.configGet': '\u8F93\u51FA\u5B8C\u6574\u914D\u7F6E',
    'lite.cmd.doctor': '\u8FD0\u884C\u5065\u5EB7\u68C0\u67E5\u548C\u5FEB\u901F\u4FEE\u590D',
    'lite.cmd.doctorDeep': '\u6DF1\u5EA6\u5065\u5EB7\u68C0\u67E5',
    'lite.cmd.modelsList': '\u5217\u51FA\u53EF\u7528\u6A21\u578B',
    'lite.cmd.modelsStatus': '\u9A8C\u8BC1\u6982\u89C8\u548C\u72B6\u6001',
    'lite.cmd.modelsScan': '\u626B\u63CF\u53EF\u7528\u6A21\u578B',
    'lite.cmd.channelsStatus': '\u68C0\u67E5\u9891\u9053\u5065\u5EB7\u72B6\u6001',
    'lite.cmd.channelsLogs': '\u663E\u793A\u6700\u8FD1\u9891\u9053\u65E5\u5FD7',
    'lite.cmd.pairingList': '\u5217\u51FA\u914D\u5BF9\u8BF7\u6C42',
    'lite.cmd.skillsList': '\u5217\u51FA\u53EF\u7528\u6280\u80FD',
    'lite.cmd.skillsCheck': '\u5C31\u7EEA\u4E0E\u7F3A\u5C11\u7684\u6458\u8981',
    'lite.cmd.pluginsList': '\u63A2\u7D22\u5DF2\u5B89\u88C5\u7684\u63D2\u4EF6',
    'lite.cmd.pluginsDoctor': '\u62A5\u544A\u63D2\u4EF6\u52A0\u8F7D\u9519\u8BEF',
    'lite.cmd.memoryStatus': '\u663E\u793A\u8BB0\u5FC6\u7D22\u5F15\u7EDF\u8BA1',
    'lite.cmd.memoryIndex': '\u91CD\u65B0\u7D22\u5F15\u8BB0\u5FC6\u6587\u4EF6',
    'lite.cmd.cronList': '\u5217\u51FA\u5B9A\u65F6\u4EFB\u52A1',
    'lite.cmd.cronStatus': '\u663E\u793A\u5B9A\u65F6\u72B6\u6001',
    'lite.cmd.sessions': '\u5217\u51FA\u5BF9\u8BDD\u4F1A\u8BDD',
    'lite.cmd.statusAll': '\u5B8C\u6574\u72B6\u6001\u4E0E\u6240\u6709\u8BE6\u7EC6\u4FE1\u606F',
    'lite.cmd.agentsList': '\u5217\u51FA\u5DF2\u914D\u7F6E\u7684\u4EE3\u7406',
    'lite.cmd.nodesStatus': '\u4ECE\u7F51\u5173\u5217\u51FA\u8282\u70B9',
    'lite.cmd.nodesList': '\u5217\u51FA\u6240\u6709\u8282\u70B9',
    'lite.cmd.nodesPending': '\u663E\u793A\u5F85\u5BA1\u6279\u7684\u8282\u70B9',
    'lite.cmd.devices': '\u5217\u51FA\u5DF2\u914D\u5BF9\u7684\u8BBE\u5907',
    'lite.cmd.securityAudit': '\u5BA1\u8BA1\u914D\u7F6E\u7684\u5E38\u89C1\u95EE\u9898',
    'lite.cmd.securityAuditDeep': '\u5B9E\u65F6\u7F51\u5173\u63A2\u6D4B\u5BA1\u8BA1',
    'lite.cmd.browserStatus': '\u663E\u793A\u6D4F\u89C8\u5668\u72B6\u6001',
    'lite.cmd.browserTabs': '\u5217\u51FA\u6253\u5F00\u7684\u6D4F\u89C8\u5668\u6807\u7B7E\u9875',
    'lite.cmd.hooksList': '\u5217\u51FA\u94A9\u5B50',
    'lite.cmd.sandboxList': '\u5217\u51FA\u6C99\u7BB1',
    'lite.cmd.docs': '\u641C\u7D22\u5B9E\u65F6\u6587\u6863\u7D22\u5F15',
    'lite.cmd.help': '\u663E\u793A\u5E2E\u52A9'
  },
  ja: {
    'pageTitle': 'OpenClaw \u7CBE\u7C21\u7BA1\u7406',
    'lite.header.onboardLink': '\u2190 \u30AA\u30F3\u30DC\u30FC\u30C7\u30A3\u30F3\u30B0\u30A6\u30A3\u30B6\u30FC\u30C9',
    'lite.header.simpleMode': '\u30B7\u30F3\u30D7\u30EB',
    'lite.header.advancedMode': '\u8A73\u7D30',
    'lite.status.running': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u5B9F\u884C\u4E2D',
    'lite.status.stopped': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u505C\u6B62\u4E2D',
    'lite.status.uptime': '\u7A3C\u50CD\u6642\u9593',
    'lite.stats.channels': '\u30C1\u30E3\u30CD\u30EB',
    'lite.stats.skills': '\u30B9\u30AD\u30EB',
    'lite.stats.sessions': '\u30BB\u30C3\u30B7\u30E7\u30F3',
    'lite.providers.title': '\u30E2\u30C7\u30EB\u30D7\u30ED\u30D0\u30A4\u30C0',
    'lite.providers.subtitle': '\u63A5\u7D9A\u6E08\u307F\u306E AI \u30D7\u30ED\u30D0\u30A4\u30C0',
    'lite.providers.empty': '\u30D7\u30ED\u30D0\u30A4\u30C0\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093',
    'lite.providers.noProviders': '\u30D7\u30ED\u30D0\u30A4\u30C0\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093',
    'lite.providers.statusLabel': '\u30B9\u30C6\u30FC\u30BF\u30B9',
    'lite.providers.modelLabel': '\u30E2\u30C7\u30EB',
    'lite.providers.active': '\u30A2\u30AF\u30C6\u30A3\u30D6',
    'lite.providers.connected': '\u63A5\u7D9A\u6E08\u307F',
    'lite.providers.notConnected': '\u672A\u63A5\u7D9A',
    'lite.channels.title': '\u30C1\u30E3\u30CD\u30EB',
    'lite.channels.subtitle': '\u63A5\u7D9A\u6E08\u307F\u306E\u30E1\u30C3\u30BB\u30FC\u30B8\u30C1\u30E3\u30CD\u30EB',
    'lite.channels.empty': '\u30C1\u30E3\u30CD\u30EB\u304C\u307E\u3060\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093',
    'lite.channels.setupLink': '\u30AA\u30F3\u30DC\u30FC\u30C7\u30A3\u30F3\u30B0\u30A6\u30A3\u30B6\u30FC\u30C9\u3067\u8A2D\u5B9A',
    'lite.channels.configured': '\u8A2D\u5B9A\u6E08\u307F',
    'lite.channels.connectedLabel': '\u63A5\u7D9A\u6E08\u307F',
    'lite.channels.yes': '\u306F\u3044',
    'lite.channels.no': '\u3044\u3044\u3048',
    'lite.usage.title': '\u65E5\u6B21\u30C8\u30FC\u30AF\u30F3\u4F7F\u7528\u91CF',
    'lite.usage.subtitle': '\u904E\u53BB 7 \u65E5\u9593',
    'lite.usage.total': '\u5408\u8A08',
    'lite.usage.byType': '\u30BF\u30A4\u30D7\u5225',
    'lite.usage.totalTokens': '\u30C8\u30FC\u30AF\u30F3\u5408\u8A08',
    'lite.usage.noData': '\u4F7F\u7528\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093',
    'lite.usage.notAvailable': '\u4F7F\u7528\u30C7\u30FC\u30BF\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093',
    'lite.usage.loading': '\u4F7F\u7528\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D...',
    'lite.usage.date': '\u65E5\u4ED8',
    'lite.usage.tokens': '\u30C8\u30FC\u30AF\u30F3',
    'lite.usage.estCost': '\u63A8\u5B9A\u8CBB\u7528',
    'lite.usage.output': '\u51FA\u529B',
    'lite.usage.input': '\u5165\u529B',
    'lite.usage.cacheWrite': '\u30AD\u30E3\u30C3\u30B7\u30E5\u66F8\u304D\u8FBC\u307F',
    'lite.usage.cacheRead': '\u30AD\u30E3\u30C3\u30B7\u30E5\u8AAD\u307F\u53D6\u308A',
    'lite.activity.title': '\u30A2\u30AF\u30C6\u30A3\u30D3\u30C6\u30A3',
    'lite.activity.autoScroll': '\u81EA\u52D5\u30B9\u30AF\u30ED\u30FC\u30EB',
    'lite.activity.clear': '\u30AF\u30EA\u30A2',
    'lite.activity.rawLogs': '\u751F\u30ED\u30B0',
    'lite.activity.gatewayOutput': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u51FA\u529B',
    'lite.activity.patterns.gatewayStarted': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u8D77\u52D5',
    'lite.activity.patterns.gatewayStopped': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u505C\u6B62',
    'lite.activity.patterns.messageReceived': '\u30E1\u30C3\u30BB\u30FC\u30B8\u53D7\u4FE1',
    'lite.activity.patterns.messageSent': '\u30E1\u30C3\u30BB\u30FC\u30B8\u9001\u4FE1',
    'lite.activity.patterns.channelConnected': '\u30C1\u30E3\u30CD\u30EB\u63A5\u7D9A',
    'lite.activity.patterns.channelDisconnected': '\u30C1\u30E3\u30CD\u30EB\u5207\u65AD',
    'lite.activity.patterns.errorDetected': '\u30A8\u30E9\u30FC\u691C\u51FA',
    'lite.activity.patterns.devicePaired': '\u30C7\u30D0\u30A4\u30B9\u30DA\u30A2\u30EA\u30F3\u30B0\u6E08\u307F',
    'lite.activity.patterns.skillLoaded': '\u30B9\u30AD\u30EB\u8AAD\u307F\u8FBC\u307F\u6E08\u307F',
    'lite.activity.patterns.sessionCreated': '\u30BB\u30C3\u30B7\u30E7\u30F3\u4F5C\u6210',
    'lite.activity.patterns.scheduledTaskRan': '\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u30BF\u30B9\u30AF\u5B9F\u884C',
    'lite.activity.patterns.memoryUpdated': '\u30E1\u30E2\u30EA\u66F4\u65B0',
    'lite.memory.title': '\u30E1\u30E2\u30EA\u3068\u30CA\u30EC\u30C3\u30B8',
    'lite.memory.subtitle': '\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u304C\u8A18\u61B6\u3057\u3066\u3044\u308B\u5185\u5BB9',
    'lite.memory.searchPlaceholder': '\u30E1\u30E2\u30EA\u3092\u691C\u7D22...',
    'lite.memory.searching': '\u691C\u7D22\u4E2D...',
    'lite.memory.noResults': '\u7D50\u679C\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093',
    'lite.memory.notAvailable': '\u30E1\u30E2\u30EA\u6A5F\u80FD\u306F\u5229\u7528\u3067\u304D\u307E\u305B\u3093',
    'lite.memory.loading': '\u30E1\u30E2\u30EA\u30B9\u30C6\u30FC\u30BF\u30B9\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D...',
    'lite.memory.status': '\u30B9\u30C6\u30FC\u30BF\u30B9',
    'lite.memory.entries': '\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u6E08',
    'lite.memory.backend': '\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9',
    'lite.memory.active': '\u30A2\u30AF\u30C6\u30A3\u30D6',
    'lite.memory.totalFiles': '\u30D5\u30A1\u30A4\u30EB',
    'lite.memory.reindex': '\u518D\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9',
    'lite.memory.indexing': '\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u4E2D...',
    'lite.memory.searchFailed': '\u691C\u7D22\u5931\u6557',
    'lite.security.title': '\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u76E3\u67FB',
    'lite.security.subtitle': '\u8A2D\u5B9A\u306E\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u554F\u984C\u3092\u30C1\u30A7\u30C3\u30AF',
    'lite.security.runAudit': '\u76E3\u67FB\u5B9F\u884C',
    'lite.security.deepAudit': '\u8A73\u7D30\u76E3\u67FB',
    'lite.security.running': '\u76E3\u67FB\u5B9F\u884C\u4E2D...',
    'lite.security.runningDeep': '\u8A73\u7D30\u76E3\u67FB\u5B9F\u884C\u4E2D...',
    'lite.security.notAvailable': '\u76E3\u67FB\u3092\u5229\u7528\u3067\u304D\u307E\u305B\u3093',
    'lite.security.passed': '\u5408\u683C',
    'lite.security.warnings': '\u8B66\u544A',
    'lite.security.failed': '\u5931\u6557',
    'lite.security.noFindings': '\u554F\u984C\u306A\u3057',
    'lite.settings.title': '\u8A2D\u5B9A\u3068\u30D8\u30EB\u30D7',
    'lite.settings.setupWizard': '\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7\u30A6\u30A3\u30B6\u30FC\u30C9',
    'lite.settings.setupWizardDesc': '\u30D7\u30ED\u30D0\u30A4\u30C0\u3001\u30C1\u30E3\u30CD\u30EB\u3001\u30B9\u30AD\u30EB\u3092\u518D\u8A2D\u5B9A',
    'lite.settings.advancedTerminal': '\u8A73\u7D30\u30BF\u30FC\u30DF\u30CA\u30EB',
    'lite.settings.advancedTerminalDesc': '\u5B8C\u5168\u306A CLI \u30A2\u30AF\u30BB\u30B9\u3068\u30B3\u30DE\u30F3\u30C9\u30D1\u30EC\u30C3\u30C8',
    'lite.settings.documentation': '\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8',
    'lite.settings.documentationDesc': '\u30AC\u30A4\u30C9\u3001API \u30EA\u30D5\u30A1\u30EC\u30F3\u30B9\u3001\u30C1\u30E5\u30FC\u30C8\u30EA\u30A2\u30EB',
    'lite.quickActions.title': '\u30AF\u30A4\u30C3\u30AF\u30A2\u30AF\u30B7\u30E7\u30F3',
    'lite.quickActions.start': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u3092\u958B\u59CB',
    'lite.quickActions.stop': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u3092\u505C\u6B62',
    'lite.quickActions.restart': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u3092\u518D\u8D77\u52D5',
    'lite.quickActions.working': '\u51E6\u7406\u4E2D...',
    'lite.maintenance.title': '\u30E1\u30F3\u30C6\u30CA\u30F3\u30B9',
    'lite.maintenance.version': '\u30D0\u30FC\u30B8\u30E7\u30F3',
    'lite.maintenance.downloadBackup': '\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9',
    'lite.maintenance.restoreBackup': '\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u304B\u3089\u5FA9\u5143',
    'lite.maintenance.upgradeAvailable': '\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u53EF\u80FD',
    'lite.maintenance.restoring': '\u5FA9\u5143\u4E2D...',
    'lite.maintenance.upgrading': '\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u4E2D...',
    'lite.maintenance.upgradeTo': '{version} \u306B\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9',
    'lite.maintenance.redeployToUpdate': '\u518D\u30C7\u30D7\u30ED\u30A4\u3067\u66F4\u65B0',
    'lite.maintenance.available': '{version} \u304C\u5229\u7528\u53EF\u80FD',
    'lite.maintenance.restoreTitle': '\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u304B\u3089\u5FA9\u5143',
    'lite.maintenance.restoreMessage': '\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u30D5\u30A1\u30A4\u30EB\u300C{filename}\u300D\u3067\u73FE\u5728\u306E\u8A2D\u5B9A\u3092\u7F6E\u304D\u63DB\u3048\u307E\u3059\u3002\u81EA\u52D5\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u304C\u5148\u306B\u4F5C\u6210\u3055\u308C\u307E\u3059\u3002\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u304C\u518D\u8D77\u52D5\u3055\u308C\u307E\u3059\u3002',
    'lite.maintenance.upgradeTitle': 'OpenClaw \u3092\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9',
    'lite.maintenance.upgradeMessage': 'npm \u7D4C\u7531\u3067\u6700\u65B0\u7248\u306E OpenClaw \u3092\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u3057\u307E\u3059\u3002\u81EA\u52D5\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u304C\u5148\u306B\u4F5C\u6210\u3055\u308C\u307E\u3059\u3002\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u304C\u518D\u8D77\u52D5\u3055\u308C\u307E\u3059\u3002',
    'lite.maintenance.invalidFile': '.tar.gz\u3001.tgz\u3001\u307E\u305F\u306F .zip \u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044',
    'lite.maintenance.restoreSuccess': '\u5FA9\u5143\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F',
    'lite.maintenance.restoreFailed': '\u5FA9\u5143\u5931\u6557\uFF1A{error}',
    'lite.maintenance.restoreError': '\u5FA9\u5143\u30A8\u30E9\u30FC\uFF1A{error}',
    'lite.maintenance.upgradeSuccess': '\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F',
    'lite.maintenance.upgradeFailed': '\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u5931\u6557\uFF1A{error}',
    'lite.maintenance.upgradeError': '\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u30A8\u30E9\u30FC\uFF1A{error}',
    'lite.confirm.cancel': '\u30AD\u30E3\u30F3\u30BB\u30EB',
    'lite.confirm.continue': '\u7D9A\u884C',
    'lite.token.title': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u30C8\u30FC\u30AF\u30F3',
    'lite.token.description': '\u3053\u306E\u30C8\u30FC\u30AF\u30F3\u3092\u4F7F\u7528\u3057\u3066\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8\u3092\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u306B\u63A5\u7D9A\u3057\u307E\u3059\u3002',
    'lite.token.show': '\u8868\u793A',
    'lite.token.hide': '\u975E\u8868\u793A',
    'lite.token.copy': '\u30B3\u30D4\u30FC',
    'lite.token.copied': '\u30C8\u30FC\u30AF\u30F3\u3092\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F',
    'lite.systemInfo.title': '\u30B7\u30B9\u30C6\u30E0\u60C5\u5831',
    'lite.systemInfo.status': '\u30B9\u30C6\u30FC\u30BF\u30B9',
    'lite.systemInfo.stateDir': '\u30B9\u30C6\u30FC\u30C8\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA',
    'lite.systemInfo.internalPort': '\u5185\u90E8\u30DD\u30FC\u30C8',
    'lite.systemInfo.pid': 'PID',
    'lite.systemInfo.running': '\u5B9F\u884C\u4E2D',
    'lite.systemInfo.stopped': '\u505C\u6B62\u4E2D',
    'lite.terminal.notConnected': '\u672A\u63A5\u7D9A',
    'lite.terminal.connecting': '\u63A5\u7D9A\u4E2D...',
    'lite.terminal.connected': '\u63A5\u7D9A\u6E08\u307F',
    'lite.terminal.disconnected': '\u5207\u65AD\u6E08\u307F',
    'lite.terminal.error': '\u30A8\u30E9\u30FC',
    'lite.commandPalette.title': '\u30B3\u30DE\u30F3\u30C9\u30D1\u30EC\u30C3\u30C8',
    'lite.commandPalette.searchPlaceholder': '\u30B3\u30DE\u30F3\u30C9\u3092\u691C\u7D22...',
    'lite.commandPalette.noMatch': '\u691C\u7D22\u306B\u4E00\u81F4\u3059\u308B\u30B3\u30DE\u30F3\u30C9\u304C\u3042\u308A\u307E\u305B\u3093\u3002',
    'lite.cmd.status': '\u30BB\u30C3\u30B7\u30E7\u30F3\u306E\u5065\u5EB7\u72B6\u614B\u3068\u6700\u8FD1\u306E\u53D7\u4FE1\u8005',
    'lite.cmd.health': '\u5B9F\u884C\u4E2D\u306E\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u304B\u3089\u5065\u5EB7\u72B6\u614B\u3092\u53D6\u5F97',
    'lite.cmd.channelsList': '\u8A2D\u5B9A\u6E08\u307F\u30C1\u30E3\u30CD\u30EB\u3092\u8868\u793A',
    'lite.cmd.logsFollow': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u30ED\u30B0\u3092\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u8FFD\u8DE1',
    'lite.cmd.version': '\u30D0\u30FC\u30B8\u30E7\u30F3\u3092\u8868\u793A',
    'lite.cmd.gatewayStatus': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4 RPC \u3092\u63A2\u67FB\u3057\u30B9\u30C6\u30FC\u30BF\u30B9\u3092\u8868\u793A',
    'lite.cmd.gatewayHealth': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u306E\u5065\u5EB7\u72B6\u614B\u3092\u53D6\u5F97',
    'lite.cmd.logs': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u30D5\u30A1\u30A4\u30EB\u30ED\u30B0\u3092\u8FFD\u8DE1',
    'lite.cmd.configGet': '\u5B8C\u5168\u306A\u8A2D\u5B9A\u3092\u51FA\u529B',
    'lite.cmd.doctor': '\u5065\u5EB7\u30C1\u30A7\u30C3\u30AF\u3068\u30AF\u30A4\u30C3\u30AF\u30D5\u30A3\u30C3\u30AF\u30B9\u3092\u5B9F\u884C',
    'lite.cmd.doctorDeep': '\u8A73\u7D30\u5065\u5EB7\u30C1\u30A7\u30C3\u30AF',
    'lite.cmd.modelsList': '\u5229\u7528\u53EF\u80FD\u306A\u30E2\u30C7\u30EB\u3092\u4E00\u89A7\u8868\u793A',
    'lite.cmd.modelsStatus': '\u8A8D\u8A3C\u6982\u8981\u3068\u30B9\u30C6\u30FC\u30BF\u30B9',
    'lite.cmd.modelsScan': '\u5229\u7528\u53EF\u80FD\u306A\u30E2\u30C7\u30EB\u3092\u30B9\u30AD\u30E3\u30F3',
    'lite.cmd.channelsStatus': '\u30C1\u30E3\u30CD\u30EB\u306E\u5065\u5EB7\u72B6\u614B\u3092\u78BA\u8A8D',
    'lite.cmd.channelsLogs': '\u6700\u8FD1\u306E\u30C1\u30E3\u30CD\u30EB\u30ED\u30B0\u3092\u8868\u793A',
    'lite.cmd.pairingList': '\u30DA\u30A2\u30EA\u30F3\u30B0\u30EA\u30AF\u30A8\u30B9\u30C8\u3092\u4E00\u89A7\u8868\u793A',
    'lite.cmd.skillsList': '\u5229\u7528\u53EF\u80FD\u306A\u30B9\u30AD\u30EB\u3092\u4E00\u89A7\u8868\u793A',
    'lite.cmd.skillsCheck': '\u6E96\u5099\u5B8C\u4E86\u3068\u4E0D\u8DB3\u306E\u6982\u8981',
    'lite.cmd.pluginsList': '\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u6E08\u307F\u30D7\u30E9\u30B0\u30A4\u30F3\u3092\u63A2\u7D22',
    'lite.cmd.pluginsDoctor': '\u30D7\u30E9\u30B0\u30A4\u30F3\u8AAD\u307F\u8FBC\u307F\u30A8\u30E9\u30FC\u3092\u5831\u544A',
    'lite.cmd.memoryStatus': '\u30E1\u30E2\u30EA\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u306E\u7D71\u8A08\u3092\u8868\u793A',
    'lite.cmd.memoryIndex': '\u30E1\u30E2\u30EA\u30D5\u30A1\u30A4\u30EB\u3092\u518D\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9',
    'lite.cmd.cronList': '\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u30BF\u30B9\u30AF\u3092\u4E00\u89A7\u8868\u793A',
    'lite.cmd.cronStatus': '\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u30B9\u30C6\u30FC\u30BF\u30B9\u3092\u8868\u793A',
    'lite.cmd.sessions': '\u4F1A\u8A71\u30BB\u30C3\u30B7\u30E7\u30F3\u3092\u4E00\u89A7\u8868\u793A',
    'lite.cmd.statusAll': '\u5B8C\u5168\u306A\u30B9\u30C6\u30FC\u30BF\u30B9\u3068\u3059\u3079\u3066\u306E\u8A73\u7D30',
    'lite.cmd.agentsList': '\u8A2D\u5B9A\u6E08\u307F\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u3092\u4E00\u89A7\u8868\u793A',
    'lite.cmd.nodesStatus': '\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u304B\u3089\u30CE\u30FC\u30C9\u3092\u4E00\u89A7\u8868\u793A',
    'lite.cmd.nodesList': '\u3059\u3079\u3066\u306E\u30CE\u30FC\u30C9\u3092\u4E00\u89A7\u8868\u793A',
    'lite.cmd.nodesPending': '\u627F\u8A8D\u5F85\u3061\u306E\u30CE\u30FC\u30C9\u3092\u8868\u793A',
    'lite.cmd.devices': '\u30DA\u30A2\u30EA\u30F3\u30B0\u6E08\u307F\u30C7\u30D0\u30A4\u30B9\u3092\u4E00\u89A7\u8868\u793A',
    'lite.cmd.securityAudit': '\u8A2D\u5B9A\u306E\u4E00\u822C\u7684\u306A\u554F\u984C\u3092\u76E3\u67FB',
    'lite.cmd.securityAuditDeep': '\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4\u63A2\u67FB\u76E3\u67FB',
    'lite.cmd.browserStatus': '\u30D6\u30E9\u30A6\u30B6\u30B9\u30C6\u30FC\u30BF\u30B9\u3092\u8868\u793A',
    'lite.cmd.browserTabs': '\u958B\u3044\u3066\u3044\u308B\u30D6\u30E9\u30A6\u30B6\u30BF\u30D6\u3092\u4E00\u89A7\u8868\u793A',
    'lite.cmd.hooksList': '\u30D5\u30C3\u30AF\u3092\u4E00\u89A7\u8868\u793A',
    'lite.cmd.sandboxList': '\u30B5\u30F3\u30C9\u30DC\u30C3\u30AF\u30B9\u3092\u4E00\u89A7\u8868\u793A',
    'lite.cmd.docs': '\u30E9\u30A4\u30D6\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u3092\u691C\u7D22',
    'lite.cmd.help': '\u30D8\u30EB\u30D7\u3092\u8868\u793A'
  },
  ko: {
    'pageTitle': 'OpenClaw \uAC04\uD3B8 \uAD00\uB9AC',
    'lite.header.onboardLink': '\u2190 \uC628\uBCF4\uB529 \uB9C8\uBC95\uC0AC',
    'lite.header.simpleMode': '\uAC04\uD3B8',
    'lite.header.advancedMode': '\uACE0\uAE09',
    'lite.status.running': '\uAC8C\uC774\uD2B8\uC6E8\uC774 \uC2E4\uD589 \uC911',
    'lite.status.stopped': '\uAC8C\uC774\uD2B8\uC6E8\uC774 \uC815\uC9C0\uB428',
    'lite.status.uptime': '\uAC00\uB3D9 \uC2DC\uAC04',
    'lite.stats.channels': '\uCC44\uB110',
    'lite.stats.skills': '\uC2A4\uD0AC',
    'lite.stats.sessions': '\uC138\uC158',
    'lite.providers.title': '\uBAA8\uB378 \uC81C\uACF5\uC790',
    'lite.providers.subtitle': '\uC5F0\uACB0\uB41C AI \uC81C\uACF5\uC790',
    'lite.providers.empty': '\uC81C\uACF5\uC790 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4',
    'lite.providers.noProviders': '\uC81C\uACF5\uC790\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4',
    'lite.providers.statusLabel': '\uC0C1\uD0DC',
    'lite.providers.modelLabel': '\uBAA8\uB378',
    'lite.providers.active': '\uD65C\uC131',
    'lite.providers.connected': '\uC5F0\uACB0\uB428',
    'lite.providers.notConnected': '\uBBF8\uC5F0\uACB0',
    'lite.channels.title': '\uCC44\uB110',
    'lite.channels.subtitle': '\uC5F0\uACB0\uB41C \uBA54\uC2DC\uC9C0 \uCC44\uB110',
    'lite.channels.empty': '\uC544\uC9C1 \uCC44\uB110\uC774 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4',
    'lite.channels.setupLink': '\uC628\uBCF4\uB529 \uB9C8\uBC95\uC0AC\uC5D0\uC11C \uC124\uC815',
    'lite.channels.configured': '\uC124\uC815\uB428',
    'lite.channels.connectedLabel': '\uC5F0\uACB0\uB428',
    'lite.channels.yes': '\uC608',
    'lite.channels.no': '\uC544\uB2C8\uC624',
    'lite.usage.title': '\uC77C\uBCC4 \uD1A0\uD070 \uC0AC\uC6A9\uB7C9',
    'lite.usage.subtitle': '\uCD5C\uADFC 7\uC77C',
    'lite.usage.total': '\uCD1D\uACC4',
    'lite.usage.byType': '\uC720\uD615\uBCC4',
    'lite.usage.totalTokens': '\uCD1D \uD1A0\uD070 \uC218',
    'lite.usage.noData': '\uC0AC\uC6A9 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4',
    'lite.usage.notAvailable': '\uC0AC\uC6A9 \uB370\uC774\uD130\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
    'lite.usage.loading': '\uC0AC\uC6A9 \uB370\uC774\uD130 \uB85C\uB529 \uC911...',
    'lite.usage.date': '\uB0A0\uC9DC',
    'lite.usage.tokens': '\uD1A0\uD070',
    'lite.usage.estCost': '\uC608\uC0C1 \uBE44\uC6A9',
    'lite.usage.output': '\uCD9C\uB825',
    'lite.usage.input': '\uC785\uB825',
    'lite.usage.cacheWrite': '\uCE90\uC2DC \uC4F0\uAE30',
    'lite.usage.cacheRead': '\uCE90\uC2DC \uC77D\uAE30',
    'lite.activity.title': '\uD65C\uB3D9',
    'lite.activity.autoScroll': '\uC790\uB3D9 \uC2A4\uD06C\uB864',
    'lite.activity.clear': '\uC9C0\uC6B0\uAE30',
    'lite.activity.rawLogs': '\uC6D0\uC2DC \uB85C\uADF8',
    'lite.activity.gatewayOutput': '\uAC8C\uC774\uD2B8\uC6E8\uC774 \uCD9C\uB825',
    'lite.activity.patterns.gatewayStarted': '\uAC8C\uC774\uD2B8\uC6E8\uC774 \uC2DC\uC791\uB428',
    'lite.activity.patterns.gatewayStopped': '\uAC8C\uC774\uD2B8\uC6E8\uC774 \uC815\uC9C0\uB428',
    'lite.activity.patterns.messageReceived': '\uBA54\uC2DC\uC9C0 \uC218\uC2E0',
    'lite.activity.patterns.messageSent': '\uBA54\uC2DC\uC9C0 \uC804\uC1A1',
    'lite.activity.patterns.channelConnected': '\uCC44\uB110 \uC5F0\uACB0\uB428',
    'lite.activity.patterns.channelDisconnected': '\uCC44\uB110 \uC5F0\uACB0 \uD574\uC81C',
    'lite.activity.patterns.errorDetected': '\uC624\uB958 \uAC10\uC9C0',
    'lite.activity.patterns.devicePaired': '\uB514\uBC14\uC774\uC2A4 \uD398\uC5B4\uB9C1\uB428',
    'lite.activity.patterns.skillLoaded': '\uC2A4\uD0AC \uB85C\uB4DC\uB428',
    'lite.activity.patterns.sessionCreated': '\uC138\uC158 \uC0DD\uC131',
    'lite.activity.patterns.scheduledTaskRan': '\uC608\uC57D \uC791\uC5C5 \uC2E4\uD589',
    'lite.activity.patterns.memoryUpdated': '\uBA54\uBAA8\uB9AC \uC5C5\uB370\uC774\uD2B8',
    'lite.memory.title': '\uBA54\uBAA8\uB9AC \uBC0F \uC9C0\uC2DD',
    'lite.memory.subtitle': '\uC5D0\uC774\uC804\uD2B8\uAC00 \uAE30\uC5B5\uD558\uB294 \uB0B4\uC6A9',
    'lite.memory.searchPlaceholder': '\uBA54\uBAA8\uB9AC \uAC80\uC0C9...',
    'lite.memory.searching': '\uAC80\uC0C9 \uC911...',
    'lite.memory.noResults': '\uACB0\uACFC\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
    'lite.memory.notAvailable': '\uBA54\uBAA8\uB9AC \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
    'lite.memory.loading': '\uBA54\uBAA8\uB9AC \uC0C1\uD0DC \uB85C\uB529 \uC911...',
    'lite.memory.status': '\uC0C1\uD0DC',
    'lite.memory.entries': '\uC778\uB371\uC2A4\uB428',
    'lite.memory.backend': '\uBC31\uC5D4\uB4DC',
    'lite.memory.active': '\uD65C\uC131',
    'lite.memory.totalFiles': '\uD30C\uC77C',
    'lite.memory.reindex': '\uC7AC\uC778\uB371\uC2A4',
    'lite.memory.indexing': '\uC778\uB371\uC2A4 \uC911...',
    'lite.memory.searchFailed': '\uAC80\uC0C9 \uC2E4\uD328',
    'lite.security.title': '\uBCF4\uC548 \uAC10\uC0AC',
    'lite.security.subtitle': '\uC124\uC815\uC758 \uBCF4\uC548 \uBB38\uC81C \uD655\uC778',
    'lite.security.runAudit': '\uAC10\uC0AC \uC2E4\uD589',
    'lite.security.deepAudit': '\uC815\uBC00 \uAC10\uC0AC',
    'lite.security.running': '\uAC10\uC0AC \uC2E4\uD589 \uC911...',
    'lite.security.runningDeep': '\uC815\uBC00 \uAC10\uC0AC \uC2E4\uD589 \uC911...',
    'lite.security.notAvailable': '\uAC10\uC0AC\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
    'lite.security.passed': '\uD1B5\uACFC',
    'lite.security.warnings': '\uACBD\uACE0',
    'lite.security.failed': '\uC2E4\uD328',
    'lite.security.noFindings': '\uBB38\uC81C \uC5C6\uC74C',
    'lite.settings.title': '\uC124\uC815 \uBC0F \uB3C4\uC6C0\uB9D0',
    'lite.settings.setupWizard': '\uC124\uC815 \uB9C8\uBC95\uC0AC',
    'lite.settings.setupWizardDesc': '\uC81C\uACF5\uC790, \uCC44\uB110, \uC2A4\uD0AC \uC7AC\uC124\uC815',
    'lite.settings.advancedTerminal': '\uACE0\uAE09 \uD130\uBBF8\uB110',
    'lite.settings.advancedTerminalDesc': '\uC644\uC804\uD55C CLI \uC561\uC138\uC2A4 \uBC0F \uBA85\uB839 \uD314\uB808\uD2B8',
    'lite.settings.documentation': '\uBB38\uC11C',
    'lite.settings.documentationDesc': '\uAC00\uC774\uB4DC, API \uB808\uD37C\uB7F0\uC2A4, \uD29C\uD1A0\uB9AC\uC5BC',
    'lite.quickActions.title': '\uBE60\uB978 \uC791\uC5C5',
    'lite.quickActions.start': '\uAC8C\uC774\uD2B8\uC6E8\uC774 \uC2DC\uC791',
    'lite.quickActions.stop': '\uAC8C\uC774\uD2B8\uC6E8\uC774 \uC815\uC9C0',
    'lite.quickActions.restart': '\uAC8C\uC774\uD2B8\uC6E8\uC774 \uC7AC\uC2DC\uC791',
    'lite.quickActions.working': '\uCC98\uB9AC \uC911...',
    'lite.maintenance.title': '\uC720\uC9C0\uBCF4\uC218',
    'lite.maintenance.version': '\uBC84\uC804',
    'lite.maintenance.downloadBackup': '\uBC31\uC5C5 \uB2E4\uC6B4\uB85C\uB4DC',
    'lite.maintenance.restoreBackup': '\uBC31\uC5C5\uC5D0\uC11C \uBCF5\uC6D0',
    'lite.maintenance.upgradeAvailable': '\uC5C5\uADF8\uB808\uC774\uB4DC \uAC00\uB2A5',
    'lite.maintenance.restoring': '\uBCF5\uC6D0 \uC911...',
    'lite.maintenance.upgrading': '\uC5C5\uADF8\uB808\uC774\uB4DC \uC911...',
    'lite.maintenance.upgradeTo': '{version}\uC73C\uB85C \uC5C5\uADF8\uB808\uC774\uB4DC',
    'lite.maintenance.redeployToUpdate': '\uC7AC\uBC30\uD3EC\uD558\uC5EC \uC5C5\uB370\uC774\uD2B8',
    'lite.maintenance.available': '{version} \uC0AC\uC6A9 \uAC00\uB2A5',
    'lite.maintenance.restoreTitle': '\uBC31\uC5C5\uC5D0\uC11C \uBCF5\uC6D0',
    'lite.maintenance.restoreMessage': '\uBC31\uC5C5 \uD30C\uC77C \u201C{filename}\u201D\uB85C \uD604\uC7AC \uC124\uC815\uC744 \uB300\uCCB4\uD569\uB2C8\uB2E4. \uC790\uB3D9 \uBC31\uC5C5\uC774 \uBA3C\uC800 \uC0DD\uC131\uB429\uB2C8\uB2E4. \uAC8C\uC774\uD2B8\uC6E8\uC774\uAC00 \uC7AC\uC2DC\uC791\uB429\uB2C8\uB2E4.',
    'lite.maintenance.upgradeTitle': 'OpenClaw \uC5C5\uADF8\uB808\uC774\uB4DC',
    'lite.maintenance.upgradeMessage': 'npm\uC744 \uD1B5\uD574 \uCD5C\uC2E0 \uBC84\uC804\uC758 OpenClaw\uC744 \uC124\uCE58\uD569\uB2C8\uB2E4. \uC790\uB3D9 \uBC31\uC5C5\uC774 \uBA3C\uC800 \uC0DD\uC131\uB429\uB2C8\uB2E4. \uAC8C\uC774\uD2B8\uC6E8\uC774\uAC00 \uC7AC\uC2DC\uC791\uB429\uB2C8\uB2E4.',
    'lite.maintenance.invalidFile': '.tar.gz, .tgz \uB610\uB294 .zip \uD30C\uC77C\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694',
    'lite.maintenance.restoreSuccess': '\uBCF5\uC6D0\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
    'lite.maintenance.restoreFailed': '\uBCF5\uC6D0 \uC2E4\uD328: {error}',
    'lite.maintenance.restoreError': '\uBCF5\uC6D0 \uC624\uB958: {error}',
    'lite.maintenance.upgradeSuccess': '\uC5C5\uADF8\uB808\uC774\uB4DC\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
    'lite.maintenance.upgradeFailed': '\uC5C5\uADF8\uB808\uC774\uB4DC \uC2E4\uD328: {error}',
    'lite.maintenance.upgradeError': '\uC5C5\uADF8\uB808\uC774\uB4DC \uC624\uB958: {error}',
    'lite.confirm.cancel': '\uCDE8\uC18C',
    'lite.confirm.continue': '\uACC4\uC18D',
    'lite.token.title': '\uAC8C\uC774\uD2B8\uC6E8\uC774 \uD1A0\uD070',
    'lite.token.description': '\uC774 \uD1A0\uD070\uC744 \uC0AC\uC6A9\uD558\uC5EC \uD074\uB77C\uC774\uC5B8\uD2B8\uB97C \uC5D0\uC774\uC804\uD2B8\uC5D0 \uC5F0\uACB0\uD569\uB2C8\uB2E4.',
    'lite.token.show': '\uD45C\uC2DC',
    'lite.token.hide': '\uC228\uAE30\uAE30',
    'lite.token.copy': '\uBCF5\uC0AC',
    'lite.token.copied': '\uD1A0\uD070\uC774 \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
    'lite.systemInfo.title': '\uC2DC\uC2A4\uD15C \uC815\uBCF4',
    'lite.systemInfo.status': '\uC0C1\uD0DC',
    'lite.systemInfo.stateDir': '\uC0C1\uD0DC \uB514\uB809\uD1A0\uB9AC',
    'lite.systemInfo.internalPort': '\uB0B4\uBD80 \uD3EC\uD2B8',
    'lite.systemInfo.pid': 'PID',
    'lite.systemInfo.running': '\uC2E4\uD589 \uC911',
    'lite.systemInfo.stopped': '\uC815\uC9C0\uB428',
    'lite.terminal.notConnected': '\uBBF8\uC5F0\uACB0',
    'lite.terminal.connecting': '\uC5F0\uACB0 \uC911...',
    'lite.terminal.connected': '\uC5F0\uACB0\uB428',
    'lite.terminal.disconnected': '\uC5F0\uACB0 \uD574\uC81C',
    'lite.terminal.error': '\uC624\uB958',
    'lite.commandPalette.title': '\uBA85\uB839 \uD314\uB808\uD2B8',
    'lite.commandPalette.searchPlaceholder': '\uBA85\uB839 \uAC80\uC0C9...',
    'lite.commandPalette.noMatch': '\uAC80\uC0C9\uACFC \uC77C\uCE58\uD558\uB294 \uBA85\uB839\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
    'lite.cmd.status': '\uC138\uC158 \uC0C1\uD0DC \uBC0F \uCD5C\uADFC \uC218\uC2E0\uC790',
    'lite.cmd.health': '\uC2E4\uD589 \uC911\uC778 \uAC8C\uC774\uD2B8\uC6E8\uC774\uC5D0\uC11C \uC0C1\uD0DC \uAC00\uC838\uC624\uAE30',
    'lite.cmd.channelsList': '\uC124\uC815\uB41C \uCC44\uB110 \uD45C\uC2DC',
    'lite.cmd.logsFollow': '\uAC8C\uC774\uD2B8\uC6E8\uC774 \uB85C\uADF8 \uC2E4\uC2DC\uAC04 \uCD94\uC801',
    'lite.cmd.version': '\uBC84\uC804 \uD45C\uC2DC',
    'lite.cmd.gatewayStatus': '\uAC8C\uC774\uD2B8\uC6E8\uC774 RPC \uD0D0\uC0C9 \uBC0F \uC0C1\uD0DC \uD45C\uC2DC',
    'lite.cmd.gatewayHealth': '\uAC8C\uC774\uD2B8\uC6E8\uC774 \uC0C1\uD0DC \uAC00\uC838\uC624\uAE30',
    'lite.cmd.logs': '\uAC8C\uC774\uD2B8\uC6E8\uC774 \uD30C\uC77C \uB85C\uADF8 \uCD94\uC801',
    'lite.cmd.configGet': '\uC804\uCCB4 \uC124\uC815 \uCD9C\uB825',
    'lite.cmd.doctor': '\uC0C1\uD0DC \uAC80\uC0AC \uBC0F \uBE60\uB978 \uC218\uC815 \uC2E4\uD589',
    'lite.cmd.doctorDeep': '\uC815\uBC00 \uC0C1\uD0DC \uAC80\uC0AC',
    'lite.cmd.modelsList': '\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uBAA8\uB378 \uBAA9\uB85D',
    'lite.cmd.modelsStatus': '\uC778\uC99D \uAC1C\uC694 \uBC0F \uC0C1\uD0DC',
    'lite.cmd.modelsScan': '\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uBAA8\uB378 \uC2A4\uCE94',
    'lite.cmd.channelsStatus': '\uCC44\uB110 \uC0C1\uD0DC \uD655\uC778',
    'lite.cmd.channelsLogs': '\uCD5C\uADFC \uCC44\uB110 \uB85C\uADF8 \uD45C\uC2DC',
    'lite.cmd.pairingList': '\uD398\uC5B4\uB9C1 \uC694\uCCAD \uBAA9\uB85D',
    'lite.cmd.skillsList': '\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uC2A4\uD0AC \uBAA9\uB85D',
    'lite.cmd.skillsCheck': '\uC900\uBE44 \uC644\uB8CC \uBC0F \uBD80\uC871 \uC694\uC57D',
    'lite.cmd.pluginsList': '\uC124\uCE58\uB41C \uD50C\uB7EC\uADF8\uC778 \uD0D0\uC0C9',
    'lite.cmd.pluginsDoctor': '\uD50C\uB7EC\uADF8\uC778 \uB85C\uB4DC \uC624\uB958 \uBCF4\uACE0',
    'lite.cmd.memoryStatus': '\uBA54\uBAA8\uB9AC \uC778\uB371\uC2A4 \uD1B5\uACC4 \uD45C\uC2DC',
    'lite.cmd.memoryIndex': '\uBA54\uBAA8\uB9AC \uD30C\uC77C \uC7AC\uC778\uB371\uC2A4',
    'lite.cmd.cronList': '\uC608\uC57D \uC791\uC5C5 \uBAA9\uB85D',
    'lite.cmd.cronStatus': '\uC608\uC57D \uC0C1\uD0DC \uD45C\uC2DC',
    'lite.cmd.sessions': '\uB300\uD654 \uC138\uC158 \uBAA9\uB85D',
    'lite.cmd.statusAll': '\uBAA8\uB4E0 \uC138\uBD80 \uC815\uBCF4\uAC00 \uD3EC\uD568\uB41C \uC804\uCCB4 \uC0C1\uD0DC',
    'lite.cmd.agentsList': '\uC124\uC815\uB41C \uC5D0\uC774\uC804\uD2B8 \uBAA9\uB85D',
    'lite.cmd.nodesStatus': '\uAC8C\uC774\uD2B8\uC6E8\uC774\uC5D0\uC11C \uB178\uB4DC \uBAA9\uB85D',
    'lite.cmd.nodesList': '\uBAA8\uB4E0 \uB178\uB4DC \uBAA9\uB85D',
    'lite.cmd.nodesPending': '\uC2B9\uC778 \uB300\uAE30 \uC911\uC778 \uB178\uB4DC \uD45C\uC2DC',
    'lite.cmd.devices': '\uD398\uC5B4\uB9C1\uB41C \uB514\uBC14\uC774\uC2A4 \uBAA9\uB85D',
    'lite.cmd.securityAudit': '\uC124\uC815\uC758 \uC77C\uBC18\uC801\uC778 \uBB38\uC81C \uAC10\uC0AC',
    'lite.cmd.securityAuditDeep': '\uC2E4\uC2DC\uAC04 \uAC8C\uC774\uD2B8\uC6E8\uC774 \uD0D0\uC0C9 \uAC10\uC0AC',
    'lite.cmd.browserStatus': '\uBE0C\uB77C\uC6B0\uC800 \uC0C1\uD0DC \uD45C\uC2DC',
    'lite.cmd.browserTabs': '\uC5F4\uB9B0 \uBE0C\uB77C\uC6B0\uC800 \uD0ED \uBAA9\uB85D',
    'lite.cmd.hooksList': '\uD6C5 \uBAA9\uB85D',
    'lite.cmd.sandboxList': '\uC0CC\uB4DC\uBC15\uC2A4 \uBAA9\uB85D',
    'lite.cmd.docs': '\uC2E4\uC2DC\uAC04 \uBB38\uC11C \uC778\uB371\uC2A4 \uAC80\uC0C9',
    'lite.cmd.help': '\uB3C4\uC6C0\uB9D0 \uD45C\uC2DC'
  }
};

/**
 * Generate the management panel HTML
 * @param {Object} options - Page options
 * @param {boolean} options.isConfigured - Whether OpenClaw is configured
 * @param {Object} options.gatewayInfo - Gateway process info
 * @param {string} options.password - Auth password for WebSocket
 * @param {string} options.stateDir - State directory path
 * @param {string} options.gatewayToken - Gateway auth token
 * @param {number|null} options.uptime - Gateway uptime in seconds
 * @param {Array} options.channelGroups - Channel groups with icon data
 * @returns {string} HTML content
 */
export function getUIPageHTML({ isConfigured, gatewayInfo, password, stateDir, gatewayToken, uptime, channelGroups, authGroups }) {
  // Build channel icons map for client-side use
  const channelIconsJSON = JSON.stringify(
    (channelGroups || []).reduce((acc, ch) => {
      acc[ch.name] = { svg: ch.icon?.svg || null, color: ch.icon?.color || '#6B7280', displayName: ch.displayName, description: ch.description || null };
      return acc;
    }, {})
  );

  // Build provider icons map for client-side use
  const providerIconsJSON = JSON.stringify(
    (authGroups || []).reduce((acc, g) => {
      acc[g.provider] = {
        svg: g.icon?.svg || null,
        color: g.icon?.color || '#6B7280',
        description: g.description,
        category: g.category
      };
      return acc;
    }, {})
  );

  return `<!DOCTYPE html>
<html>
<head>
  <title>OpenClaw Lite Management</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ff4d4d'/%3E%3Cstop offset='100%25' stop-color='%23991b1b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M60 10C30 10 15 35 15 55C15 75 30 95 45 100L45 110L55 110L55 100C55 100 60 102 65 100L65 110L75 110L75 100C90 95 105 75 105 55C105 35 90 10 60 10Z' fill='url(%23g)'/%3E%3Cpath d='M20 45C5 40 0 50 5 60C10 70 20 65 25 55C28 48 25 45 20 45Z' fill='url(%23g)'/%3E%3Cpath d='M100 45C115 40 120 50 115 60C110 70 100 65 95 55C92 48 95 45 100 45Z' fill='url(%23g)'/%3E%3Cpath d='M45 15Q35 5 30 8' stroke='%23ff4d4d' stroke-width='3' stroke-linecap='round'/%3E%3Cpath d='M75 15Q85 5 90 8' stroke='%23ff4d4d' stroke-width='3' stroke-linecap='round'/%3E%3Ccircle cx='45' cy='35' r='6' fill='%23050810'/%3E%3Ccircle cx='75' cy='35' r='6' fill='%23050810'/%3E%3Ccircle cx='46' cy='34' r='2.5' fill='%2300e5cc'/%3E%3Ccircle cx='76' cy='34' r='2.5' fill='%2300e5cc'/%3E%3C/svg%3E"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@xterm/xterm@5/css/xterm.min.css"/>
  <style>
    :root {
      --bg: #12141a;
      --bg-accent: #14161d;
      --bg-elevated: #1a1d25;
      --bg-hover: #262a35;
      --card: #181b22;
      --card-foreground: #f4f4f5;
      --accent: #ff5c5c;
      --accent-hover: #ff7070;
      --accent-dark: #991b1b;
      --accent-subtle: rgba(255, 92, 92, 0.15);
      --accent-glow: rgba(255, 92, 92, 0.25);
      --teal: #14b8a6;
      --teal-bright: #00e5cc;
      --teal-glow: rgba(20, 184, 166, 0.4);
      --ok: #22c55e;
      --danger: #ef4444;
      --warn: #f59e0b;
      --text: #e4e4e7;
      --text-strong: #fafafa;
      --muted: #71717a;
      --muted-strong: #52525b;
      --border: #27272a;
      --border-strong: #3f3f46;
      --font-body: 'Space Grotesk', 'Noto Sans SC', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-display: 'Space Grotesk', 'Noto Sans SC', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.03);
      --duration-fast: 120ms;
      --duration-normal: 200ms;
    }
    ::selection {
      background: var(--accent-subtle);
      color: var(--text-strong);
    }
    * { box-sizing: border-box; }
    body {
      font-family: var(--font-body);
      margin: 0;
      padding: 20px;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      letter-spacing: -0.02em;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    h1 {
      font-family: var(--font-display);
      color: var(--text);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }
    h1 .logo { width: 28px; height: 28px; }
    h1 .subtitle {
      color: var(--teal-bright);
      font-size: 0.6em;
      font-weight: 500;
      margin-left: 5px;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .nav-link {
      color: var(--muted);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-link:hover { color: var(--teal-bright); }
    .grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 20px;
    }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
    }
    .card {
      background: var(--card);
      padding: 20px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      border-color: var(--border-strong);
      box-shadow: 0 0 20px rgba(255, 92, 92, 0.06);
    }
    .card h2 {
      margin: 0 0 15px 0;
      font-family: var(--font-display);
      font-size: 16px;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .card + .card { margin-top: 20px; }

    /* Mode toggle */
    .mode-toggle {
      display: flex;
      background: var(--bg-elevated);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .mode-toggle button {
      padding: 8px 20px;
      border: none;
      background: transparent;
      color: var(--muted-strong);
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 0;
    }
    .mode-toggle button.active {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
      color: #fff;
    }
    .mode-toggle button:not(.active):hover {
      color: var(--text);
      background: var(--bg-hover);
    }

    /* Buttons */
    .btn-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    button, .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px var(--accent-glow);
    }
    .btn-secondary {
      background: var(--bg-elevated);
      color: var(--muted);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover:not(:disabled) {
      color: var(--text);
      border-color: var(--muted-strong);
    }
    .btn-danger {
      background: var(--accent-dark);
      color: white;
    }
    .btn-danger:hover:not(:disabled) {
      background: var(--accent);
    }
    .btn-success {
      background: var(--teal);
      color: white;
    }
    .btn-success:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px var(--teal-glow);
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    /* Form elements */
    .form-group {
      margin-bottom: 12px;
    }
    .form-label {
      display: block;
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 4px;
      font-weight: 500;
    }
    .form-input {
      width: 100%;
      padding: 8px 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 5px;
      color: var(--text);
      font-size: 13px;
      font-family: var(--font-body);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
    }

    /* Token box */
    .token-box {
      background: var(--bg-elevated);
      padding: 10px;
      border-radius: 5px;
      font-family: var(--mono);
      font-size: 12px;
      word-break: break-all;
      position: relative;
      border: 1px solid var(--border);
      color: var(--muted);
    }
    .info-text {
      color: var(--muted-strong);
      font-size: 13px;
      margin: 10px 0 0 0;
    }
    .info-text code {
      font-family: var(--mono);
      color: var(--muted);
      background: var(--bg-elevated);
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
    }

    /* === Status Hero === */
    .status-hero {
      background: var(--card);
      border: 1px solid var(--border);
      border-left: 4px solid var(--ok);
      border-radius: var(--radius-lg);
      padding: 18px 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
      transition: border-color 0.3s;
    }
    .status-hero.stopped {
      border-left-color: var(--danger);
    }
    .status-hero-main {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-strong);
      white-space: nowrap;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--ok);
      flex-shrink: 0;
    }
    .status-dot.running {
      animation: pulse 2s ease-in-out infinite;
    }
    .status-dot.stopped {
      background: var(--danger);
      animation: none;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
      50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
    }
    .status-hero-details {
      display: flex;
      align-items: center;
      gap: 20px;
      color: var(--muted);
      font-size: 13px;
      flex: 1;
    }
    .status-hero-detail {
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .status-hero-detail span:first-child {
      color: var(--muted-strong);
      font-size: 12px;
    }
    .status-hero-detail span:last-child {
      color: var(--text);
      font-weight: 500;
    }
    .status-hero-refresh {
      background: none;
      border: 1px solid var(--border);
      color: var(--muted);
      padding: 6px 8px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .status-hero-refresh:hover {
      color: var(--teal-bright);
      border-color: var(--teal);
    }
    @media (max-width: 700px) {
      .status-hero {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .status-hero-details {
        flex-wrap: wrap;
        gap: 10px;
      }
    }

    /* === Quick Stats === */
    .quick-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 16px;
      text-align: center;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover {
      border-color: var(--border-strong);
    }
    .stat-card-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-strong);
      font-family: var(--font-display);
      line-height: 1.1;
    }
    .stat-card-label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      margin-top: 6px;
      color: var(--muted);
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-card-icon {
      font-size: 14px;
    }
    @media (max-width: 600px) {
      .quick-stats {
        grid-template-columns: 1fr;
      }
    }

    /* === Card Header === */
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
    }
    .card-header h2 {
      margin: 0;
    }
    .card-subtitle {
      color: var(--muted-strong);
      font-size: 12px;
      margin-top: 2px;
    }

    /* === Integration Items === */
    .integration-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 8px;
    }
    .integration-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      transition: border-color 0.2s;
      position: relative;
    }
    .integration-item:hover {
      border-color: var(--border-strong);
    }
    .integration-icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .integration-icon svg {
      width: 20px;
      height: 20px;
    }
    .integration-name-wrap {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .integration-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text);
      flex: 1;
    }
    .integration-model {
      font-size: 11px;
      color: var(--muted);
      margin-top: 1px;
    }
    .integration-status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .integration-status.active-model { background: var(--ok); }
    .integration-status.active { background: #3B82F6; }
    .integration-status.connected { background: #3B82F6; }
    .integration-status.inactive { background: var(--muted-strong); }

    /* === Hover Popover === */
    .integration-popover {
      display: none;
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--card);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      min-width: 200px;
      max-width: 280px;
      z-index: 100;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      pointer-events: none;
    }
    .integration-popover::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: var(--border-strong);
    }
    .integration-item:hover .integration-popover {
      display: block;
    }
    .popover-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }
    .popover-desc {
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .popover-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      padding: 3px 0;
    }
    .popover-label {
      color: var(--muted);
    }
    .popover-value {
      color: var(--text);
      font-weight: 500;
    }
    .popover-badge {
      font-size: 11px;
      padding: 1px 8px;
      border-radius: 9999px;
      font-weight: 500;
    }
    .popover-badge.active   { background: rgba(34,197,94,0.15); color: #4ade80; }
    .popover-badge.connected { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .popover-badge.inactive { background: rgba(113,113,122,0.15); color: #a1a1aa; }

    /* === Empty State === */
    .empty-state {
      text-align: center;
      padding: 30px 20px;
      color: var(--muted);
    }
    .empty-state-icon {
      font-size: 32px;
      margin-bottom: 10px;
      opacity: 0.5;
    }
    .empty-state-text {
      font-size: 13px;
      margin-bottom: 12px;
    }
    .empty-state a {
      color: var(--teal-bright);
      text-decoration: none;
      font-weight: 500;
    }
    .empty-state a:hover {
      text-decoration: underline;
    }

    /* === Activity Feed === */
    .activity-feed {
      max-height: 200px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--border) transparent;
    }
    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px solid var(--border);
    }
    .activity-item:last-child { border-bottom: none; }
    .activity-ts {
      color: var(--muted-strong);
      font-family: var(--mono);
      font-size: 11px;
      white-space: nowrap;
      flex-shrink: 0;
      padding-top: 1px;
    }
    .activity-icon {
      flex-shrink: 0;
      font-size: 14px;
      padding-top: 1px;
    }
    .activity-text {
      color: var(--text);
      flex: 1;
    }
    .activity-text.error { color: var(--accent); }

    /* Raw logs (collapsible) */
    .log-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
      padding: 8px 0;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 12px;
      cursor: pointer;
      user-select: none;
      transition: color 0.2s;
    }
    .log-toggle:hover { color: var(--text); }
    .log-toggle-arrow {
      transition: transform 0.2s;
      font-size: 10px;
    }
    .log-toggle-arrow.open { transform: rotate(90deg); }
    .log-raw-container {
      background: var(--bg);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      height: 250px;
      display: flex;
      flex-direction: column;
      margin-top: 8px;
    }
    .log-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      background: var(--card);
      border-bottom: 1px solid var(--border);
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    }
    .log-toolbar label {
      color: var(--muted);
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
    }
    .log-toolbar input[type="checkbox"] {
      accent-color: var(--teal);
    }
    .log-output {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      font-family: var(--mono);
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .log-line { display: block; }
    .log-line .ts {
      color: var(--muted-strong);
      margin-right: 8px;
    }
    .log-line.stdout { color: var(--teal-bright); }
    .log-line.stderr { color: var(--accent); }

    /* === Memory section === */
    .memory-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 12px;
    }
    .memory-stat {
      font-size: 12px;
    }
    .memory-stat-label {
      color: var(--muted-strong);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 10px;
    }
    .memory-stat-value {
      color: var(--text);
      font-weight: 500;
      margin-top: 2px;
    }
    .memory-search-input {
      width: 100%;
      padding: 8px 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 5px;
      color: var(--text);
      font-size: 13px;
      font-family: var(--font-body);
      margin-bottom: 10px;
    }
    .memory-search-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
    }
    .memory-results {
      max-height: 200px;
      overflow-y: auto;
    }
    .memory-result-item {
      padding: 8px 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      margin-bottom: 6px;
      font-size: 13px;
      color: var(--text);
      line-height: 1.5;
    }
    .section-notice {
      padding: 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--muted);
      font-size: 13px;
      text-align: center;
    }

    /* === Token Usage Chart === */
    .usage-toggle {
      display: flex;
      background: var(--bg-elevated);
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .usage-toggle button {
      padding: 4px 14px;
      border: none;
      background: transparent;
      color: var(--muted);
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 0;
    }
    .usage-toggle button.active {
      background: var(--accent);
      color: #fff;
    }
    .usage-toggle button:not(.active):hover {
      color: var(--text);
      background: var(--bg-hover);
    }
    .usage-chart {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 160px;
      padding: 10px 0;
    }
    .usage-bar-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      justify-content: flex-end;
      position: relative;
    }
    .usage-bar-track {
      width: 100%;
      max-width: 40px;
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .usage-bar {
      width: 100%;
      background: var(--accent);
      border-radius: 4px 4px 0 0;
      min-height: 3%;
      transition: height 0.3s ease;
      cursor: pointer;
      position: relative;
    }
    .usage-bar:hover {
      opacity: 0.85;
    }
    .usage-bar-label {
      font-size: 10px;
      color: var(--muted);
      margin-top: 6px;
      white-space: nowrap;
    }
    .usage-bar-value {
      font-size: 10px;
      color: var(--text);
      font-weight: 500;
      margin-bottom: 4px;
      white-space: nowrap;
    }
    .usage-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--card);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-sm);
      padding: 8px 12px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 50;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: none;
    }
    .usage-bar:hover .usage-tooltip {
      display: block;
    }
    .usage-tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 1px 0;
    }
    .usage-tooltip-label {
      color: var(--muted);
    }
    .usage-tooltip-value {
      color: var(--text);
      font-weight: 500;
    }
    .usage-by-type {
      display: none;
    }
    .usage-by-type.active {
      display: block;
    }
    .usage-stacked-bar {
      height: 32px;
      display: flex;
      border-radius: var(--radius-sm);
      overflow: hidden;
      margin-bottom: 12px;
    }
    .usage-stacked-segment {
      height: 100%;
      transition: width 0.3s ease;
    }
    .usage-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 12px;
    }
    .usage-legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }
    .usage-legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .usage-legend-count {
      color: var(--text);
      font-weight: 500;
      font-family: var(--mono);
      font-size: 11px;
    }
    .usage-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid var(--border);
      font-size: 13px;
    }
    .usage-total-label {
      color: var(--muted);
    }
    .usage-total-value {
      color: var(--text-strong);
      font-weight: 600;
      font-family: var(--mono);
    }

    /* === Settings links === */
    .settings-links {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .settings-link-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background 0.15s;
      text-decoration: none;
      color: var(--text);
    }
    .settings-link-item:hover {
      background: var(--bg-hover);
    }
    .settings-link-icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
    }
    .settings-link-text h4 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
    }
    .settings-link-text p {
      margin: 2px 0 0 0;
      font-size: 11px;
      color: var(--muted);
    }

    /* === Quick Actions (sidebar) === */
    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .btn-action {
      width: 100%;
      justify-content: center;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      border-radius: var(--radius-md);
    }

    /* === Token (sidebar) === */
    .token-description {
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 10px;
    }
    .token-masked {
      font-family: var(--mono);
      font-size: 13px;
      color: var(--text);
      word-break: break-all;
    }
    .token-actions {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }
    .token-btn {
      padding: 5px 12px;
      font-size: 11px;
      border: 1px solid var(--border);
      background: var(--bg-elevated);
      color: var(--muted);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .token-btn:hover {
      color: var(--text);
      border-color: var(--teal);
    }

    /* === System Info (sidebar) === */
    .system-info-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .system-info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    .system-info-item .label {
      color: var(--muted);
    }
    .system-info-item .value {
      color: var(--text);
      font-family: var(--mono);
      font-size: 12px;
    }
    .system-info-status {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .system-info-status .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .system-info-status .dot.running { background: var(--ok); }
    .system-info-status .dot.stopped { background: var(--danger); }

    /* === Security Audit === */
    .audit-results {
      max-height: 300px;
      overflow-y: auto;
      margin-top: 12px;
    }
    .audit-summary {
      display: flex;
      gap: 12px;
      font-size: 12px;
      margin-bottom: 8px;
      padding: 6px 0;
      border-bottom: 1px solid var(--border);
    }
    .audit-summary-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .audit-summary-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .audit-summary-dot.pass { background: var(--ok); }
    .audit-summary-dot.warn { background: #F59E0B; }
    .audit-summary-dot.fail { background: var(--danger); }
    .audit-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 6px 0;
      font-size: 12px;
      border-bottom: 1px solid var(--border);
    }
    .audit-item:last-child { border-bottom: none; }
    .audit-item-icon {
      flex-shrink: 0;
      width: 16px;
      text-align: center;
    }
    .audit-item-text {
      color: var(--text);
      line-height: 1.4;
    }
    .audit-raw {
      font-family: var(--mono);
      font-size: 11px;
      color: var(--muted);
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 10px;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 250px;
      overflow-y: auto;
      margin-top: 8px;
    }

    /* === Maintenance === */
    .maintenance-version {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: var(--mono);
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 12px;
      padding: 8px 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
    }
    .maintenance-version .version-current {
      color: var(--text);
      font-weight: 500;
    }
    .maintenance-version .version-update {
      color: var(--teal-bright);
      font-size: 11px;
    }
    .maintenance-version-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
      padding: 8px 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
    }
    .maintenance-select {
      width: 100%;
      padding: 6px 8px;
      font-family: var(--mono);
      font-size: 12px;
      color: var(--text);
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      cursor: pointer;
    }
    .maintenance-select:focus {
      outline: none;
      border-color: var(--teal-bright);
    }
    .maintenance-version-picker .maintenance-btn {
      flex: 1;
      padding: 6px 12px;
      font-size: 12px;
      white-space: nowrap;
    }
    .maintenance-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .maintenance-btn {
      width: 100%;
      justify-content: center;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      border-radius: var(--radius-md);
    }
    .maintenance-upload {
      display: none;
    }
    .maintenance-status {
      display: none;
      margin-top: 12px;
      padding: 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-family: var(--mono);
      font-size: 12px;
      color: var(--muted);
      max-height: 200px;
      overflow-y: auto;
      line-height: 1.8;
    }
    .maintenance-status.visible {
      display: block;
    }
    .maintenance-status .step {
      display: block;
    }
    .maintenance-status .step.ok { color: var(--ok); }
    .maintenance-status .step.err { color: var(--accent); }
    .maintenance-confirm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .maintenance-confirm-dialog {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      max-width: 400px;
      width: 90%;
    }
    .maintenance-confirm-dialog h3 {
      margin: 0 0 10px 0;
      color: var(--text-strong);
      font-size: 16px;
    }
    .maintenance-confirm-dialog p {
      color: var(--muted);
      font-size: 13px;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }
    .maintenance-confirm-dialog .dialog-buttons {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    /* === Toast === */
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 500;
      z-index: 1000;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
    }
    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
    .toast.success {
      background: rgba(20, 184, 166, 0.15);
      border: 1px solid rgba(20, 184, 166, 0.3);
      color: var(--teal-bright);
    }
    .toast.error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: var(--accent);
    }

    /* Terminal (Advanced mode) */
    .terminal-container {
      background: var(--bg);
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: 0 0 30px rgba(20, 184, 166, 0.05);
    }
    .terminal-header {
      background: var(--card);
      padding: 8px 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .terminal-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .terminal-dot.red { background: var(--accent); }
    .terminal-dot.yellow { background: #ffbd2e; }
    .terminal-dot.green { background: var(--teal-bright); }
    .terminal-title {
      flex: 1;
      text-align: center;
      color: var(--muted-strong);
      font-family: var(--mono);
      font-size: 13px;
    }
    #advanced-panel {
      max-width: none;
      margin-left: -20px;
      margin-right: -20px;
      padding-left: 20px;
      padding-right: 20px;
    }
    #ui-terminal {
      height: 600px;
      padding: 5px;
    }
    .terminal-status {
      background: var(--card);
      padding: 8px 15px;
      font-family: var(--mono);
      font-size: 12px;
      color: var(--muted-strong);
      display: flex;
      justify-content: space-between;
    }

    /* Command palette */
    .cmd-categories {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .cmd-cat-pill {
      padding: 4px 12px;
      font-size: 11px;
      font-family: var(--mono);
      background: var(--bg-elevated);
      color: var(--muted);
      border: 1px solid var(--border);
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .cmd-cat-pill:hover {
      color: var(--teal-bright);
      border-color: var(--teal);
    }
    .cmd-cat-pill.active {
      background: var(--teal);
      color: var(--bg);
      border-color: var(--teal);
    }
    .cmd-list {
      scrollbar-width: thin;
      scrollbar-color: var(--border) transparent;
    }
    .cmd-section-label {
      font-size: 10px;
      font-family: var(--mono);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      padding: 10px 0 4px;
    }
    .cmd-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 10px;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .cmd-item:hover {
      background: rgba(20, 184, 166, 0.08);
    }
    .cmd-name {
      font-family: var(--mono);
      font-size: 12px;
      color: var(--teal-bright);
      white-space: nowrap;
    }
    .cmd-desc {
      font-size: 11px;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Language Selector */
    ${getLangSelectorCSS()}
    .header-right .lang-selector { position: relative; }

    .hidden { display: none !important; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>
        <svg class="logo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lobster-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff4d4d"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs><path d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z" fill="url(#lobster-gradient)"/><path d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z" fill="url(#lobster-gradient)"/><path d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z" fill="url(#lobster-gradient)"/><path d="M45 15 Q35 5 30 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><path d="M75 15 Q85 5 90 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><circle cx="45" cy="35" r="6" fill="#050810"/><circle cx="75" cy="35" r="6" fill="#050810"/><circle cx="46" cy="34" r="2.5" fill="#00e5cc"/><circle cx="76" cy="34" r="2.5" fill="#00e5cc"/></svg> OpenClaw
        <span class="subtitle">Lite</span>
      </h1>
      <div class="header-right">
        <a href="/onboard?password=${encodeURIComponent(password)}" class="nav-link" data-i18n="lite.header.onboardLink">&larr; Onboarding Wizard</a>
        ${getLangSelectorHTML('lite')}
        <div class="mode-toggle">
          <button id="mode-simple" class="active" onclick="setMode('simple')" data-i18n="lite.header.simpleMode">Simple</button>
          <button id="mode-advanced" onclick="setMode('advanced')" data-i18n="lite.header.advancedMode">Advanced</button>
        </div>
      </div>
    </div>

    <!-- ===== SIMPLE MODE (default) ===== -->
    <div id="simple-panel">

      <!-- Gateway Status Hero -->
      <div class="status-hero ${gatewayInfo.running ? '' : 'stopped'}" id="status-hero">
        <div class="status-hero-main">
          <div class="status-dot ${gatewayInfo.running ? 'running' : 'stopped'}" id="hero-dot"></div>
          <span id="hero-status-text">${gatewayInfo.running ? 'Gateway Running' : 'Gateway Stopped'}</span>
        </div>
        <div class="status-hero-details">
          <div class="status-hero-detail">
            <span>Uptime</span>
            <span id="hero-uptime">${uptime != null ? formatUptime(uptime) : '--'}</span>
          </div>
        </div>
        <button class="status-hero-refresh" onclick="pollStatus()" title="Refresh status">&#x21bb;</button>
      </div>

      <!-- Quick Stats Row -->
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-card-value" id="stat-channels">--</div>
          <div class="stat-card-label"><span class="stat-card-icon">&#x1F4E1;</span> <span data-i18n="lite.stats.channels">Channels</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" id="stat-skills">--</div>
          <div class="stat-card-label"><span class="stat-card-icon">&#x26A1;</span> <span data-i18n="lite.stats.skills">Skills</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" id="stat-sessions">--</div>
          <div class="stat-card-label"><span class="stat-card-icon">&#x1F4AC;</span> <span data-i18n="lite.stats.sessions">Sessions</span></div>
        </div>
      </div>

      <div class="grid">
        <div>
          <!-- Model Providers Card -->
          <div class="card">
            <div class="card-header">
              <div>
                <h2 data-i18n="lite.providers.title">Model Providers</h2>
                <div class="card-subtitle" data-i18n="lite.providers.subtitle">Connected AI providers</div>
              </div>
            </div>
            <div id="providers-grid" class="integration-grid">
              <div class="empty-state">
                <div class="empty-state-text">Loading...</div>
              </div>
            </div>
          </div>

          <!-- Channels Card -->
          <div class="card">
            <div class="card-header">
              <div>
                <h2 data-i18n="lite.channels.title">Channels</h2>
                <div class="card-subtitle" data-i18n="lite.channels.subtitle">Connected messaging channels</div>
              </div>
            </div>
            <div id="integrations-grid" class="integration-grid">
              <div class="empty-state">
                <div class="empty-state-text">Loading...</div>
              </div>
            </div>

          </div>

          <!-- Daily Token Usage Card -->
          <div class="card" id="usage-card">
            <div class="card-header">
              <div>
                <h2 data-i18n="lite.usage.title">Daily Token Usage</h2>
                <div class="card-subtitle" data-i18n="lite.usage.subtitle">Last 7 days</div>
              </div>
              <div class="usage-toggle">
                <button class="active" id="usage-tab-total" onclick="setUsageView('total')" data-i18n="lite.usage.total">Total</button>
                <button id="usage-tab-bytype" onclick="setUsageView('bytype')" data-i18n="lite.usage.byType">By Type</button>
              </div>
            </div>
            <div id="usage-total-view">
              <div class="usage-chart" id="usage-chart">
                <div class="section-notice" style="width:100%" data-i18n="lite.usage.loading">Loading usage data...</div>
              </div>
            </div>
            <div id="usage-bytype-view" class="usage-by-type">
              <div class="usage-stacked-bar" id="usage-stacked"></div>
              <div class="usage-legend" id="usage-legend"></div>
              <div class="usage-total-row">
                <span class="usage-total-label" data-i18n="lite.usage.totalTokens">Total tokens</span>
                <span class="usage-total-value" id="usage-grand-total">--</span>
              </div>
            </div>
          </div>

          <!-- Activity & Logs Card -->
          <div class="card">
            <div class="card-header">
              <div>
                <h2 data-i18n="lite.activity.title">Activity</h2>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <label style="color: var(--muted); font-size: 12px; display: flex; align-items: center; gap: 5px; cursor: pointer;">
                  <input type="checkbox" id="auto-scroll" checked style="accent-color: var(--teal);"/> <span data-i18n="lite.activity.autoScroll">Auto-scroll</span>
                </label>
                <button class="btn-sm btn-secondary" onclick="clearActivity()" data-i18n="lite.activity.clear">Clear</button>
              </div>
            </div>
            <div class="activity-feed" id="activity-feed"></div>
            <div class="log-toggle" onclick="toggleRawLogs()">
              <span class="log-toggle-arrow" id="log-toggle-arrow">&#x25B6;</span>
              <span data-i18n="lite.activity.rawLogs">Raw Logs</span>
            </div>
            <div id="raw-logs-section" class="hidden">
              <div class="log-raw-container">
                <div class="log-toolbar">
                  <span style="color: var(--muted); font-size: 12px;" data-i18n="lite.activity.gatewayOutput">Gateway output</span>
                  <button class="btn-sm btn-secondary" onclick="clearLogs()" data-i18n="lite.activity.clear">Clear</button>
                </div>
                <div class="log-output" id="log-output"></div>
              </div>
            </div>
          </div>

          <!-- Memory & Knowledge Card -->
          <div class="card" id="memory-card">
            <div class="card-header">
              <div>
                <h2 data-i18n="lite.memory.title">Memory &amp; Knowledge</h2>
                <div class="card-subtitle" data-i18n="lite.memory.subtitle">What your agent remembers</div>
              </div>
            </div>
            <div id="memory-content">
              <div class="section-notice" data-i18n="lite.memory.loading">Loading memory status...</div>
            </div>
          </div>

          <!-- Security Audit -->
          <div class="card" id="security-audit-card">
            <div class="card-header">
              <div>
                <h2 data-i18n="lite.security.title">Security Audit</h2>
                <div class="card-subtitle" data-i18n="lite.security.subtitle">Check config for security issues</div>
              </div>
              <div class="quick-actions" style="gap: 6px;">
                <button class="btn-action btn-secondary" id="btn-audit" onclick="runSecurityAudit(false)" style="font-size: 12px; padding: 5px 12px;" data-i18n="lite.security.runAudit">Run Audit</button>
                <button class="btn-action btn-secondary" id="btn-audit-deep" onclick="runSecurityAudit(true)" style="font-size: 12px; padding: 5px 12px;" data-i18n="lite.security.deepAudit">Deep Audit</button>
              </div>
            </div>
            <div id="security-audit-results" class="hidden"></div>
          </div>

          <!-- Settings & Help Card -->
          <div class="card">
            <h2 data-i18n="lite.settings.title">Settings &amp; Help</h2>
            <div class="settings-links">
              <a href="/onboard?password=${encodeURIComponent(password)}" class="settings-link-item">
                <span class="settings-link-icon">&#x2699;&#xFE0F;</span>
                <div class="settings-link-text">
                  <h4 data-i18n="lite.settings.setupWizard">Setup Wizard</h4>
                  <p data-i18n="lite.settings.setupWizardDesc">Reconfigure providers, channels, and skills</p>
                </div>
              </a>
              <a href="#" class="settings-link-item" onclick="event.preventDefault(); setMode('advanced');">
                <span class="settings-link-icon">&#x1F4BB;</span>
                <div class="settings-link-text">
                  <h4 data-i18n="lite.settings.advancedTerminal">Advanced Terminal</h4>
                  <p data-i18n="lite.settings.advancedTerminalDesc">Full CLI access and command palette</p>
                </div>
              </a>
              <a href="https://docs.openclaw.ai" target="_blank" rel="noopener" class="settings-link-item">
                <span class="settings-link-icon">&#x1F4D6;</span>
                <div class="settings-link-text">
                  <h4 data-i18n="lite.settings.documentation">Documentation</h4>
                  <p data-i18n="lite.settings.documentationDesc">Guides, API reference, and tutorials</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div>
          <!-- Quick Actions -->
          <div class="card">
            <h2 data-i18n="lite.quickActions.title">Quick Actions</h2>
            <div class="quick-actions">
              <button id="btn-toggle-agent" class="btn-action ${gatewayInfo.running ? 'btn-danger' : 'btn-success'}" onclick="toggleGateway()">
                ${gatewayInfo.running ? 'Stop Gateway' : 'Start Gateway'}
              </button>
              <button id="btn-restart" class="btn-action btn-primary" onclick="gatewayRestart()" ${gatewayInfo.running ? '' : 'disabled'} data-i18n="lite.quickActions.restart">
                Restart Gateway
              </button>
            </div>
          </div>

          <!-- Maintenance -->
          <div class="card">
            <h2 data-i18n="lite.maintenance.title">Maintenance</h2>
            <div id="version-info" class="maintenance-version">
              <span><span data-i18n="lite.maintenance.version">Version</span>: <span class="version-current" id="version-current">...</span></span>
              <span class="version-update" id="version-update" style="display:none"></span>
            </div>
            <div id="version-picker" class="maintenance-version-picker" style="display:none">
              <select id="version-select" class="maintenance-select" onchange="onVersionSelectChange()">
                <option value="">Select version...</option>
              </select>
              <button class="maintenance-btn btn-secondary" id="btn-switch-version" onclick="confirmSwitchVersion()" disabled>Switch</button>
              <button class="maintenance-btn btn-secondary" id="btn-revert-base" onclick="confirmRevertBase()" style="display:none">Revert to Base</button>
            </div>
            <div class="maintenance-actions">
              <button class="maintenance-btn btn-secondary" onclick="downloadBackup()" data-i18n="lite.maintenance.downloadBackup">Download Backup</button>
              <input type="file" id="restore-file" class="maintenance-upload" accept=".tar.gz,.tgz,.gz,.zip,application/gzip,application/x-gzip,application/zip" onchange="handleRestoreFile(this)"/>
              <button class="maintenance-btn btn-secondary" id="btn-restore" onclick="document.getElementById('restore-file').click()" data-i18n="lite.maintenance.restoreBackup">Restore from Backup</button>
              <button class="maintenance-btn btn-primary" id="btn-upgrade" onclick="confirmUpgrade()" style="display:none" data-i18n="lite.maintenance.upgradeAvailable">Upgrade Available</button>
            </div>
            <div class="maintenance-status" id="maintenance-status"></div>
          </div>

          <!-- Gateway Token -->
          <div class="card">
            <h2 data-i18n="lite.token.title">Gateway Token</h2>
            <div class="token-description" data-i18n="lite.token.description">Use this token to connect clients to your agent.</div>
            <div class="token-box">
              <span id="token-display" class="token-masked">${maskToken(gatewayToken)}</span>
              <input type="hidden" id="token-full" value="${gatewayToken}"/>
            </div>
            <div class="token-actions">
              <button class="token-btn" id="btn-token-toggle" onclick="toggleTokenVisibility()" data-i18n="lite.token.show">Show</button>
              <button class="token-btn" onclick="copyToken()" data-i18n="lite.token.copy">Copy</button>
            </div>
          </div>

          <!-- System Info -->
          <div class="card">
            <h2 data-i18n="lite.systemInfo.title">System Info</h2>
            <div class="system-info-list">
              <div class="system-info-item">
                <span class="label" data-i18n="lite.systemInfo.status">Status</span>
                <div class="system-info-status">
                  <span class="dot ${gatewayInfo.running ? 'running' : 'stopped'}" id="sysinfo-dot"></span>
                  <span class="value" id="sysinfo-status">${gatewayInfo.running ? 'Running' : 'Stopped'}</span>
                </div>
              </div>
              <div class="system-info-item">
                <span class="label" data-i18n="lite.systemInfo.stateDir">State directory</span>
                <span class="value">${stateDir}</span>
              </div>
              <div class="system-info-item">
                <span class="label" data-i18n="lite.systemInfo.internalPort">Internal port</span>
                <span class="value">${gatewayInfo.port}</span>
              </div>
              <div class="system-info-item">
                <span class="label" data-i18n="lite.systemInfo.pid">PID</span>
                <span class="value" id="sysinfo-pid">${gatewayInfo.pid || '--'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ===== ADVANCED MODE (hidden) ===== -->
    <div id="advanced-panel" class="hidden">
      <div class="card" style="padding: 0; overflow: hidden;">
        <div class="terminal-container">
          <div class="terminal-header">
            <div class="terminal-dot red"></div>
            <div class="terminal-dot yellow"></div>
            <div class="terminal-dot green"></div>
            <div class="terminal-title">bash</div>
          </div>
          <div id="ui-terminal"></div>
          <div class="terminal-status">
            <span id="term-connection-status" data-i18n="lite.terminal.notConnected">Not connected</span>
            <span id="term-size"></span>
          </div>
        </div>
      </div>

      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 15px 20px; border-bottom: 1px solid var(--border);">
          <h2 style="margin-bottom: 12px;" data-i18n="lite.commandPalette.title">Command Palette</h2>
          <input type="text" id="cmd-search" class="form-input" placeholder="Search commands..." data-i18n-placeholder="lite.commandPalette.searchPlaceholder"
                 oninput="filterCommands()" style="margin-bottom: 10px;" />
          <div class="cmd-categories" id="cmd-categories"></div>
        </div>
        <div class="cmd-list" id="cmd-list" style="max-height: 350px; overflow-y: auto; padding: 10px 20px;"></div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast-msg"></div>

  <script src="https://cdn.jsdelivr.net/npm/@xterm/xterm@5/lib/xterm.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0/lib/addon-fit.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@xterm/addon-web-links@0/lib/addon-web-links.min.js"></script>
  <script>
    (function() {
      var password = ${JSON.stringify(password)};

      // ========== i18n ==========
      ${getI18nBootstrapJS(JSON.stringify(LITE_TRANSLATIONS), {
        langSelectorIds: ['lite'],
        onChangeCallback: 'applyDynamicTranslations();'
      })}

      var ws = null;
      var term = null;
      var fitAddon = null;
      var terminalInitialized = false;
      var lastLogId = 0;
      var statusPollTimer = null;
      var logsPollTimer = null;
      var statsPollTimer = null;
      var usagePollTimer = null;
      var cachedStatus = null;
      var tokenVisible = false;
      var rawLogsOpen = false;
      var memorySearchDebounce = null;
      var activityItems = [];

      // Channel icons embedded from server
      var CHANNEL_ICONS = ${channelIconsJSON};

      // Provider icons embedded from server
      var PROVIDER_ICONS = ${providerIconsJSON};

      // Activity patterns for parsing log entries
      var ACTIVITY_PATTERNS = [
        { regex: /gateway.*started|listening on/i, icon: '\\u{1F7E2}', labelKey: 'lite.activity.patterns.gatewayStarted' },
        { regex: /gateway.*stopped|shutdown/i, icon: '\\u{1F534}', labelKey: 'lite.activity.patterns.gatewayStopped' },
        { regex: /message.*received|incoming.*message|msg.*from/i, icon: '\\u{1F4E8}', labelKey: 'lite.activity.patterns.messageReceived' },
        { regex: /message.*sent|reply.*sent|response.*sent/i, icon: '\\u{1F4E4}', labelKey: 'lite.activity.patterns.messageSent' },
        { regex: /connected.*to|channel.*connected|joined/i, icon: '\\u{1F517}', labelKey: 'lite.activity.patterns.channelConnected' },
        { regex: /disconnected|channel.*disconnected|left/i, icon: '\\u{26D4}', labelKey: 'lite.activity.patterns.channelDisconnected' },
        { regex: /error|failed|exception|crash/i, icon: '\\u{26A0}\\u{FE0F}', labelKey: 'lite.activity.patterns.errorDetected' },
        { regex: /pairing|pair.*approved|device.*linked/i, icon: '\\u{1F4F1}', labelKey: 'lite.activity.patterns.devicePaired' },
        { regex: /skill.*loaded|plugin.*loaded/i, icon: '\\u{26A1}', labelKey: 'lite.activity.patterns.skillLoaded' },
        { regex: /session.*created|new.*session/i, icon: '\\u{1F4AC}', labelKey: 'lite.activity.patterns.sessionCreated' },
        { regex: /cron|scheduled|job.*ran/i, icon: '\\u{23F0}', labelKey: 'lite.activity.patterns.scheduledTaskRan' },
        { regex: /memory.*indexed|memory.*updated/i, icon: '\\u{1F9E0}', labelKey: 'lite.activity.patterns.memoryUpdated' }
      ];

      // ----- Helpers -----
      function authParam() {
        return 'password=' + encodeURIComponent(password);
      }

      function formatUptime(seconds) {
        if (seconds == null) return '--';
        var d = Math.floor(seconds / 86400);
        var h = Math.floor((seconds % 86400) / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = seconds % 60;
        if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
        if (h > 0) return h + 'h ' + m + 'm ' + s + 's';
        if (m > 0) return m + 'm ' + s + 's';
        return s + 's';
      }

      function formatTime(ts) {
        var d = new Date(ts);
        return d.toLocaleTimeString();
      }

      function stripProvider(model) {
        if (!model) return '--';
        var slashIdx = model.indexOf('/');
        return slashIdx >= 0 ? model.substring(slashIdx + 1) : model;
      }

      function showToast(message, type) {
        var el = document.getElementById('toast-msg');
        el.textContent = message;
        el.className = 'toast ' + (type || 'success');
        el.classList.add('show');
        setTimeout(function() { el.classList.remove('show'); }, 3000);
      }

      // Helper: create SVG element from path data (safe DOM construction, no innerHTML)
      function createChannelSVG(svgPath, color) {
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', color || '#6B7280');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        var path = document.createElementNS(ns, 'path');
        path.setAttribute('d', svgPath);
        svg.appendChild(path);
        return svg;
      }

      function createFallbackSVG() {
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', '#6B7280');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        var circle = document.createElementNS(ns, 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '10');
        svg.appendChild(circle);
        return svg;
      }

      // ----- Mode toggle -----
      window.setMode = function(mode) {
        var simplePanel = document.getElementById('simple-panel');
        var advancedPanel = document.getElementById('advanced-panel');
        var btnSimple = document.getElementById('mode-simple');
        var btnAdvanced = document.getElementById('mode-advanced');

        if (mode === 'simple') {
          simplePanel.classList.remove('hidden');
          advancedPanel.classList.add('hidden');
          btnSimple.classList.add('active');
          btnAdvanced.classList.remove('active');
          startPolling();
        } else {
          simplePanel.classList.add('hidden');
          advancedPanel.classList.remove('hidden');
          btnSimple.classList.remove('active');
          btnAdvanced.classList.add('active');
          stopPolling();
          if (!terminalInitialized) {
            terminalInitialized = true;
            initTerminal();
            connectTerminal();
          }
          requestAnimationFrame(function() {
            if (fitAddon) {
              fitAddon.fit();
              updateTermSize();
              if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
              }
            }
          });
        }
      };

      // ----- Status Hero update -----
      function updateHero(data) {
        var hero = document.getElementById('status-hero');
        var dot = document.getElementById('hero-dot');
        var text = document.getElementById('hero-status-text');
        var uptimeEl = document.getElementById('hero-uptime');

        if (data.gatewayRunning) {
          hero.classList.remove('stopped');
          dot.className = 'status-dot running';
          text.textContent = t('lite.status.running');
        } else {
          hero.classList.add('stopped');
          dot.className = 'status-dot stopped';
          text.textContent = t('lite.status.stopped');
        }

        uptimeEl.textContent = formatUptime(data.uptime);
      }

      // ----- Quick Stats update -----
      function updateQuickStats(channels, stats) {
        var channelCount = channels ? Object.keys(channels).length : 0;
        document.getElementById('stat-channels').textContent = channelCount;
        if (stats) {
          document.getElementById('stat-skills').textContent = stats.skills != null ? stats.skills : '--';
        }
      }

      // ----- Token Usage -----
      function formatTokenCount(n) {
        if (n == null) return '--';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return String(n);
      }

      function estimateCost(tokens) {
        return (tokens / 1000000 * 3.50).toFixed(2);
      }

      function formatDateShort(dateStr) {
        var d = new Date(dateStr + 'T00:00:00');
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return d.getDate() + ' ' + months[d.getMonth()];
      }

      window.setUsageView = function(view) {
        var totalTab = document.getElementById('usage-tab-total');
        var bytypeTab = document.getElementById('usage-tab-bytype');
        var totalView = document.getElementById('usage-total-view');
        var bytypeView = document.getElementById('usage-bytype-view');

        if (view === 'total') {
          totalTab.classList.add('active');
          bytypeTab.classList.remove('active');
          totalView.style.display = '';
          bytypeView.classList.remove('active');
        } else {
          totalTab.classList.remove('active');
          bytypeTab.classList.add('active');
          totalView.style.display = 'none';
          bytypeView.classList.add('active');
        }
      };

      function renderUsageChart(days) {
        var container = document.getElementById('usage-chart');
        container.textContent = '';

        if (!days || days.length === 0) {
          var notice = document.createElement('div');
          notice.className = 'section-notice';
          notice.style.width = '100%';
          notice.textContent = t('lite.usage.noData');
          container.appendChild(notice);
          return;
        }

        var maxTotal = 0;
        days.forEach(function(d) { if (d.total > maxTotal) maxTotal = d.total; });
        if (maxTotal === 0) maxTotal = 1;

        days.forEach(function(d) {
          var group = document.createElement('div');
          group.className = 'usage-bar-group';

          var valueLabel = document.createElement('div');
          valueLabel.className = 'usage-bar-value';
          valueLabel.textContent = formatTokenCount(d.total);
          group.appendChild(valueLabel);

          var track = document.createElement('div');
          track.className = 'usage-bar-track';

          var bar = document.createElement('div');
          bar.className = 'usage-bar';
          var pct = Math.max(3, (d.total / maxTotal) * 100);
          bar.style.height = pct + '%';

          // Tooltip
          var tooltip = document.createElement('div');
          tooltip.className = 'usage-tooltip';

          var dateRow = document.createElement('div');
          dateRow.className = 'usage-tooltip-row';
          var dateLabel = document.createElement('span');
          dateLabel.className = 'usage-tooltip-label';
          dateLabel.textContent = t('lite.usage.date');
          dateRow.appendChild(dateLabel);
          var dateValue = document.createElement('span');
          dateValue.className = 'usage-tooltip-value';
          dateValue.textContent = formatDateShort(d.date);
          dateRow.appendChild(dateValue);
          tooltip.appendChild(dateRow);

          var totalRow = document.createElement('div');
          totalRow.className = 'usage-tooltip-row';
          var totalLabel = document.createElement('span');
          totalLabel.className = 'usage-tooltip-label';
          totalLabel.textContent = t('lite.usage.tokens');
          totalRow.appendChild(totalLabel);
          var totalValue = document.createElement('span');
          totalValue.className = 'usage-tooltip-value';
          totalValue.textContent = formatTokenCount(d.total);
          totalRow.appendChild(totalValue);
          tooltip.appendChild(totalRow);

          var costRow = document.createElement('div');
          costRow.className = 'usage-tooltip-row';
          var costLabel = document.createElement('span');
          costLabel.className = 'usage-tooltip-label';
          costLabel.textContent = t('lite.usage.estCost');
          costRow.appendChild(costLabel);
          var costValue = document.createElement('span');
          costValue.className = 'usage-tooltip-value';
          costValue.textContent = '$' + (d.cost != null && d.cost > 0 ? d.cost.toFixed(2) : estimateCost(d.total));
          costRow.appendChild(costValue);
          tooltip.appendChild(costRow);

          bar.appendChild(tooltip);
          track.appendChild(bar);
          group.appendChild(track);

          var dateLabel2 = document.createElement('div');
          dateLabel2.className = 'usage-bar-label';
          dateLabel2.textContent = formatDateShort(d.date);
          group.appendChild(dateLabel2);

          container.appendChild(group);
        });
      }

      function renderUsageByType(days, serverTotals) {
        var stackedEl = document.getElementById('usage-stacked');
        var legendEl = document.getElementById('usage-legend');
        var grandTotalEl = document.getElementById('usage-grand-total');
        stackedEl.textContent = '';
        legendEl.textContent = '';

        if (!days || days.length === 0) {
          grandTotalEl.textContent = '--';
          return;
        }

        var totals = { output: 0, input: 0, cacheWrite: 0, cacheRead: 0 };
        days.forEach(function(d) {
          totals.output += d.output || 0;
          totals.input += d.input || 0;
          totals.cacheWrite += d.cacheWrite || 0;
          totals.cacheRead += d.cacheRead || 0;
        });
        var grandTotal = totals.output + totals.input + totals.cacheWrite + totals.cacheRead;
        var costStr = '';
        if (serverTotals && serverTotals.totalCost != null && serverTotals.totalCost > 0) {
          costStr = ' ($' + serverTotals.totalCost.toFixed(2) + ')';
        }
        grandTotalEl.textContent = formatTokenCount(grandTotal) + costStr;

        var types = [
          { key: 'output', labelKey: 'lite.usage.output', color: 'var(--accent)' },
          { key: 'input', labelKey: 'lite.usage.input', color: 'var(--warn)' },
          { key: 'cacheWrite', labelKey: 'lite.usage.cacheWrite', color: 'var(--teal)' },
          { key: 'cacheRead', labelKey: 'lite.usage.cacheRead', color: '#38bdf8' }
        ];

        types.forEach(function(tk) {
          var pct = grandTotal > 0 ? (totals[tk.key] / grandTotal * 100) : 0;
          var seg = document.createElement('div');
          seg.className = 'usage-stacked-segment';
          seg.style.width = pct + '%';
          seg.style.background = tk.color;
          seg.title = t(tk.labelKey) + ': ' + formatTokenCount(totals[tk.key]);
          stackedEl.appendChild(seg);

          var legendItem = document.createElement('div');
          legendItem.className = 'usage-legend-item';
          var dot = document.createElement('span');
          dot.className = 'usage-legend-dot';
          dot.style.background = tk.color;
          legendItem.appendChild(dot);
          legendItem.appendChild(document.createTextNode(t(tk.labelKey) + ' '));
          var count = document.createElement('span');
          count.className = 'usage-legend-count';
          count.textContent = formatTokenCount(totals[tk.key]);
          legendItem.appendChild(count);
          legendEl.appendChild(legendItem);
        });
      }

      function pollUsage() {
        fetch('/lite/api/usage?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.available && data.days) {
              renderUsageChart(data.days);
              renderUsageByType(data.days, data.totals);
            } else {
              var container = document.getElementById('usage-chart');
              container.textContent = '';
              var notice = document.createElement('div');
              notice.className = 'section-notice';
              notice.style.width = '100%';
              notice.textContent = t('lite.usage.notAvailable');
              container.appendChild(notice);
            }
          })
          .catch(function() {});
      }

      // ----- Integrations update -----
      function updateIntegrations(channels) {
        var container = document.getElementById('integrations-grid');
        container.textContent = '';

        if (!channels || Object.keys(channels).length === 0) {
          var empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.style.gridColumn = '1 / -1';

          var iconDiv = document.createElement('div');
          iconDiv.className = 'empty-state-icon';
          iconDiv.textContent = '\\u{1F4E1}';
          empty.appendChild(iconDiv);

          var textDiv = document.createElement('div');
          textDiv.className = 'empty-state-text';
          textDiv.textContent = t('lite.channels.empty');
          empty.appendChild(textDiv);

          var link = document.createElement('a');
          link.href = '/onboard?password=' + encodeURIComponent(password);
          link.textContent = t('lite.channels.setupLink');
          empty.appendChild(link);

          container.appendChild(empty);
          return;
        }

        Object.keys(channels).forEach(function(name) {
          var ch = channels[name];
          var enabled = ch.enabled === true;
          var iconData = CHANNEL_ICONS[name];
          var displayName = iconData ? iconData.displayName : (name.charAt(0).toUpperCase() + name.slice(1));

          var item = document.createElement('div');
          item.className = 'integration-item';

          var iconWrap = document.createElement('div');
          iconWrap.className = 'integration-icon';
          if (iconData && iconData.svg) {
            iconWrap.appendChild(createChannelSVG(iconData.svg, iconData.color));
          } else {
            iconWrap.appendChild(createFallbackSVG());
          }
          item.appendChild(iconWrap);

          var nameSpan = document.createElement('span');
          nameSpan.className = 'integration-name';
          nameSpan.textContent = displayName;
          item.appendChild(nameSpan);

          var statusDot = document.createElement('span');
          statusDot.className = 'integration-status ' + (enabled ? 'connected' : 'inactive');
          item.appendChild(statusDot);

          // Popover
          var popover = document.createElement('div');
          popover.className = 'integration-popover';
          var pTitle = document.createElement('div');
          pTitle.className = 'popover-title';
          pTitle.textContent = displayName;
          popover.appendChild(pTitle);
          if (iconData && iconData.description) {
            var pDesc = document.createElement('div');
            pDesc.className = 'popover-desc';
            pDesc.textContent = iconData.description;
            popover.appendChild(pDesc);
          }
          var configRow = document.createElement('div');
          configRow.className = 'popover-row';
          var configLabel = document.createElement('span');
          configLabel.className = 'popover-label';
          configLabel.textContent = t('lite.channels.configured');
          configRow.appendChild(configLabel);
          var configBadge = document.createElement('span');
          configBadge.className = 'popover-badge connected';
          configBadge.textContent = t('lite.channels.yes');
          configRow.appendChild(configBadge);
          popover.appendChild(configRow);

          var connRow = document.createElement('div');
          connRow.className = 'popover-row';
          var connLabel = document.createElement('span');
          connLabel.className = 'popover-label';
          connLabel.textContent = t('lite.channels.connectedLabel');
          connRow.appendChild(connLabel);
          var connBadge = document.createElement('span');
          connBadge.className = 'popover-badge ' + (enabled ? 'connected' : 'inactive');
          connBadge.textContent = enabled ? t('lite.channels.yes') : t('lite.channels.no');
          connRow.appendChild(connBadge);
          popover.appendChild(connRow);

          item.appendChild(popover);

          container.appendChild(item);
        });
      }

      // ----- Model Providers update -----
      function updateProviders(auth, model) {
        var container = document.getElementById('providers-grid');
        container.textContent = '';

        var connectedSet = new Set();
        var activeProvider = '';
        var modelName = '';

        // 1. Model prefix -> active provider
        if (model && typeof model === 'string' && model.indexOf('/') >= 0) {
          activeProvider = model.split('/')[0].toLowerCase();
          modelName = model.split('/').slice(1).join('/');
          connectedSet.add(activeProvider);
        }

        // 2. Auth config -> connected providers (dig into profiles/nested objects)
        if (auth && typeof auth === 'object') {
          // Direct keys (may be provider names)
          Object.keys(auth).forEach(function(key) {
            if (key !== 'profiles' && key !== 'default') {
              connectedSet.add(key.toLowerCase());
            }
          });
          // Nested profiles (each has a .provider field)
          if (auth.profiles && typeof auth.profiles === 'object') {
            Object.values(auth.profiles).forEach(function(profile) {
              if (profile && profile.provider) {
                connectedSet.add(profile.provider.toLowerCase());
              }
            });
          }
        }

        var providers = Object.keys(PROVIDER_ICONS);
        if (providers.length === 0) {
          var empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.style.gridColumn = '1 / -1';
          var textDiv = document.createElement('div');
          textDiv.className = 'empty-state-text';
          textDiv.textContent = t('lite.providers.empty');
          empty.appendChild(textDiv);
          container.appendChild(empty);
          return;
        }

        function isConnected(providerName) {
          var lower = providerName.toLowerCase();
          var found = false;
          connectedSet.forEach(function(key) {
            if (lower.indexOf(key) >= 0 || key.indexOf(lower.split(' ')[0].toLowerCase()) >= 0) {
              found = true;
            }
          });
          return found;
        }

        function isActiveProvider(providerName) {
          if (!activeProvider) return false;
          var lower = providerName.toLowerCase();
          return lower.indexOf(activeProvider) >= 0 || activeProvider.indexOf(lower.split(' ')[0].toLowerCase()) >= 0;
        }

        var hasItems = false;
        providers.forEach(function(name) {
          var info = PROVIDER_ICONS[name];
          var connected = isConnected(name);
          var isActive = isActiveProvider(name);
          // Only show connected or active providers
          if (!connected && !isActive) return;
          hasItems = true;

          var item = document.createElement('div');
          item.className = 'integration-item';

          var iconWrap = document.createElement('div');
          iconWrap.className = 'integration-icon';
          if (info.svg) {
            iconWrap.appendChild(createChannelSVG(info.svg, info.color));
          } else {
            iconWrap.appendChild(createFallbackSVG());
          }
          item.appendChild(iconWrap);

          var nameWrap = document.createElement('div');
          nameWrap.className = 'integration-name-wrap';
          var nameSpan = document.createElement('span');
          nameSpan.className = 'integration-name';
          nameSpan.textContent = name;
          nameWrap.appendChild(nameSpan);

          // Show model name for active provider
          if (isActive && modelName) {
            var modelSpan = document.createElement('span');
            modelSpan.className = 'integration-model';
            modelSpan.textContent = modelName;
            nameWrap.appendChild(modelSpan);
          }
          item.appendChild(nameWrap);

          var statusDot = document.createElement('span');
          statusDot.className = 'integration-status ' + (isActive ? 'active-model' : connected ? 'connected' : 'inactive');
          item.appendChild(statusDot);

          // Popover
          var popover = document.createElement('div');
          popover.className = 'integration-popover';
          var pTitle = document.createElement('div');
          pTitle.className = 'popover-title';
          pTitle.textContent = name;
          popover.appendChild(pTitle);
          if (isActive && modelName) {
            var pDesc = document.createElement('div');
            pDesc.className = 'popover-desc';
            pDesc.textContent = modelName;
            popover.appendChild(pDesc);
          } else if (info.description) {
            var pDesc = document.createElement('div');
            pDesc.className = 'popover-desc';
            pDesc.textContent = info.description;
            popover.appendChild(pDesc);
          }
          var statusRow = document.createElement('div');
          statusRow.className = 'popover-row';
          var statusLabel = document.createElement('span');
          statusLabel.className = 'popover-label';
          statusLabel.textContent = t('lite.providers.statusLabel');
          statusRow.appendChild(statusLabel);
          var badge = document.createElement('span');
          badge.className = 'popover-badge ' + (isActive ? 'active' : connected ? 'connected' : 'inactive');
          badge.textContent = isActive ? t('lite.providers.active') : connected ? t('lite.providers.connected') : t('lite.providers.notConnected');
          statusRow.appendChild(badge);
          popover.appendChild(statusRow);
          if (isActive && modelName) {
            var modelRow = document.createElement('div');
            modelRow.className = 'popover-row';
            var modelLabel = document.createElement('span');
            modelLabel.className = 'popover-label';
            modelLabel.textContent = t('lite.providers.modelLabel');
            modelRow.appendChild(modelLabel);
            var modelValue = document.createElement('span');
            modelValue.className = 'popover-value';
            modelValue.textContent = modelName;
            modelRow.appendChild(modelValue);
            popover.appendChild(modelRow);
          }
          item.appendChild(popover);

          container.appendChild(item);
        });

        if (!hasItems) {
          var emptyDiv = document.createElement('div');
          emptyDiv.className = 'empty-state';
          emptyDiv.style.gridColumn = '1 / -1';
          var emptyText = document.createElement('div');
          emptyText.className = 'empty-state-text';
          emptyText.textContent = t('lite.providers.noProviders');
          emptyDiv.appendChild(emptyText);
          container.appendChild(emptyDiv);
        }
      }

      // ----- Quick Actions update -----
      function updateQuickActions(running) {
        var toggleBtn = document.getElementById('btn-toggle-agent');
        var restartBtn = document.getElementById('btn-restart');

        if (running) {
          toggleBtn.textContent = t('lite.quickActions.stop');
          toggleBtn.className = 'btn-action btn-danger';
        } else {
          toggleBtn.textContent = t('lite.quickActions.start');
          toggleBtn.className = 'btn-action btn-success';
        }
        restartBtn.disabled = !running;
      }

      // ----- System Info update -----
      function updateSystemInfo(data) {
        var dot = document.getElementById('sysinfo-dot');
        var statusEl = document.getElementById('sysinfo-status');
        var pidEl = document.getElementById('sysinfo-pid');

        dot.className = 'dot ' + (data.gatewayRunning ? 'running' : 'stopped');
        statusEl.textContent = data.gatewayRunning ? t('lite.systemInfo.running') : t('lite.systemInfo.stopped');
        pidEl.textContent = data.gatewayInfo ? (data.gatewayInfo.pid || '--') : '--';
      }

      // ----- Activity Feed -----
      function parseLogToActivity(entry) {
        var text = entry.text || '';
        for (var i = 0; i < ACTIVITY_PATTERNS.length; i++) {
          var p = ACTIVITY_PATTERNS[i];
          if (p.regex.test(text)) {
            return { ts: entry.timestamp, icon: p.icon, text: t(p.labelKey), isError: /error|failed/i.test(text) };
          }
        }
        return null;
      }

      function appendActivityItems(entries) {
        var feed = document.getElementById('activity-feed');
        entries.forEach(function(entry) {
          var parsed = parseLogToActivity(entry);
          if (!parsed) return;

          activityItems.push(parsed);
          if (activityItems.length > 50) {
            activityItems.shift();
            if (feed.firstChild) feed.removeChild(feed.firstChild);
          }

          var item = document.createElement('div');
          item.className = 'activity-item';

          var ts = document.createElement('span');
          ts.className = 'activity-ts';
          ts.textContent = formatTime(parsed.ts);
          item.appendChild(ts);

          var icon = document.createElement('span');
          icon.className = 'activity-icon';
          icon.textContent = parsed.icon;
          item.appendChild(icon);

          var text = document.createElement('span');
          text.className = 'activity-text' + (parsed.isError ? ' error' : '');
          text.textContent = parsed.text;
          item.appendChild(text);

          feed.appendChild(item);
        });

        if (document.getElementById('auto-scroll').checked) {
          feed.scrollTop = feed.scrollHeight;
        }
      }

      function appendRawLogs(entries) {
        var container = document.getElementById('log-output');
        entries.forEach(function(entry) {
          var line = document.createElement('span');
          line.className = 'log-line ' + entry.stream;
          var ts = document.createElement('span');
          ts.className = 'ts';
          ts.textContent = formatTime(entry.timestamp);
          line.appendChild(ts);
          line.appendChild(document.createTextNode(entry.text));
          container.appendChild(line);
          container.appendChild(document.createTextNode('\\n'));
        });

        if (rawLogsOpen && document.getElementById('auto-scroll').checked) {
          container.scrollTop = container.scrollHeight;
        }
      }

      window.toggleRawLogs = function() {
        rawLogsOpen = !rawLogsOpen;
        document.getElementById('raw-logs-section').classList.toggle('hidden', !rawLogsOpen);
        document.getElementById('log-toggle-arrow').classList.toggle('open', rawLogsOpen);
      };

      window.clearActivity = function() {
        document.getElementById('activity-feed').textContent = '';
        activityItems = [];
      };

      window.clearLogs = function() {
        document.getElementById('log-output').textContent = '';
      };

      // ----- Memory -----
      function loadMemory() {
        fetch('/lite/api/memory?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            var container = document.getElementById('memory-content');
            container.textContent = '';

            if (!data.available) {
              var notice = document.createElement('div');
              notice.className = 'section-notice';
              notice.textContent = t('lite.memory.notAvailable');
              container.appendChild(notice);
              return;
            }

            // Stats row
            var stats = document.createElement('div');
            stats.className = 'memory-stats';

            var statItems = [
              { label: t('lite.memory.status'), value: data.status || t('lite.memory.active') },
              { label: t('lite.memory.entries'), value: data.entries != null ? String(data.entries) : '--' },
              { label: t('lite.memory.totalFiles'), value: data.totalFiles != null ? String(data.totalFiles) : '--' },
              { label: t('lite.memory.backend'), value: data.backend || '--' }
            ];
            statItems.forEach(function(s) {
              var stat = document.createElement('div');
              stat.className = 'memory-stat';

              var labelDiv = document.createElement('div');
              labelDiv.className = 'memory-stat-label';
              labelDiv.textContent = s.label;
              stat.appendChild(labelDiv);

              var valueDiv = document.createElement('div');
              valueDiv.className = 'memory-stat-value';
              valueDiv.textContent = s.value;
              stat.appendChild(valueDiv);

              stats.appendChild(stat);
            });
            container.appendChild(stats);

            // Re-index button
            var reindexBtn = document.createElement('button');
            reindexBtn.className = 'lite-btn lite-btn-secondary';
            reindexBtn.style.marginBottom = '12px';
            reindexBtn.textContent = t('lite.memory.reindex');
            reindexBtn.onclick = function() {
              reindexBtn.disabled = true;
              reindexBtn.textContent = t('lite.memory.indexing');
              fetch('/lite/api/memory/index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              })
              .then(function(r) { return r.json(); })
              .then(function() {
                reindexBtn.textContent = t('lite.memory.reindex');
                reindexBtn.disabled = false;
                // Refresh memory stats
                loadMemory();
              })
              .catch(function() {
                reindexBtn.textContent = t('lite.memory.reindex');
                reindexBtn.disabled = false;
              });
            };
            container.appendChild(reindexBtn);

            // Search input
            var searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'memory-search-input';
            searchInput.placeholder = t('lite.memory.searchPlaceholder');

            // Results container
            var resultsDiv = document.createElement('div');
            resultsDiv.className = 'memory-results';

            searchInput.addEventListener('input', function() {
              clearTimeout(memorySearchDebounce);
              var q = searchInput.value.trim();
              if (q.length < 2) {
                resultsDiv.textContent = '';
                return;
              }
              memorySearchDebounce = setTimeout(function() {
                searchMemory(q, resultsDiv);
              }, 500);
            });
            container.appendChild(searchInput);
            container.appendChild(resultsDiv);
          })
          .catch(function() {
            var container = document.getElementById('memory-content');
            container.textContent = '';
            var notice = document.createElement('div');
            notice.className = 'section-notice';
            notice.textContent = t('lite.memory.notAvailable');
            container.appendChild(notice);
          });
      }

      function searchMemory(query, resultsDiv) {
        resultsDiv.textContent = '';
        var loadingMsg = document.createElement('div');
        loadingMsg.style.cssText = 'color: var(--muted); font-size: 12px;';
        loadingMsg.textContent = t('lite.memory.searching');
        resultsDiv.appendChild(loadingMsg);

        fetch('/lite/api/memory/search?q=' + encodeURIComponent(query) + '&' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            resultsDiv.textContent = '';
            if (!data.results || data.results.length === 0) {
              var noResults = document.createElement('div');
              noResults.style.cssText = 'color: var(--muted); font-size: 12px; padding: 10px 0;';
              noResults.textContent = t('lite.memory.noResults');
              resultsDiv.appendChild(noResults);
              return;
            }
            data.results.forEach(function(r) {
              var item = document.createElement('div');
              item.className = 'memory-result-item';
              item.textContent = r.text || r.content || JSON.stringify(r);
              resultsDiv.appendChild(item);
            });
          })
          .catch(function() {
            resultsDiv.textContent = '';
            var errMsg = document.createElement('div');
            errMsg.style.cssText = 'color: var(--muted); font-size: 12px;';
            errMsg.textContent = t('lite.memory.searchFailed');
            resultsDiv.appendChild(errMsg);
          });
      }

      // ----- Token -----
      window.toggleTokenVisibility = function() {
        tokenVisible = !tokenVisible;
        var display = document.getElementById('token-display');
        var full = document.getElementById('token-full').value;
        var btn = document.getElementById('btn-token-toggle');

        if (tokenVisible) {
          display.textContent = full;
          btn.textContent = t('lite.token.hide');
        } else {
          display.textContent = maskTokenJS(full);
          btn.textContent = t('lite.token.show');
        }
      };

      function maskTokenJS(token) {
        if (!token || token.length < 8) return token || '--';
        return token.substring(0, 4) + '...' + token.substring(token.length - 4);
      }

      window.copyToken = function() {
        var token = document.getElementById('token-full').value;
        navigator.clipboard.writeText(token).then(function() {
          showToast(t('lite.token.copied'), 'success');
        });
      };

      // ----- Status polling -----
      window.pollStatus = function() {
        fetch('/lite/api/status?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            cachedStatus = data;
            updateHero(data);
            updateProviders(data.auth, data.model);
            updateIntegrations(data.channels);
            updateQuickActions(data.gatewayRunning);
            updateSystemInfo(data);

            var channelCount = data.channels ? Object.keys(data.channels).length : 0;
            document.getElementById('stat-channels').textContent = channelCount;
          })
          .catch(function() {});
      };

      function pollStats() {
        fetch('/lite/api/stats?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            document.getElementById('stat-skills').textContent = data.skills != null ? data.skills : '--';
            document.getElementById('stat-sessions').textContent = data.sessions != null ? data.sessions : '--';
          })
          .catch(function() {});
      }

      function pollLogs() {
        fetch('/lite/api/logs?' + authParam() + '&since=' + lastLogId)
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.entries && data.entries.length > 0) {
              appendActivityItems(data.entries);
              appendRawLogs(data.entries);
              lastLogId = data.lastId;
            }
          })
          .catch(function() {});
      }

      function startPolling() {
        stopPolling();
        pollStatus();
        pollLogs();
        pollStats();
        pollUsage();
        loadMemory();
        checkVersion();
        statusPollTimer = setInterval(pollStatus, 5000);
        logsPollTimer = setInterval(pollLogs, 2000);
        statsPollTimer = setInterval(pollStats, 30000);
        usagePollTimer = setInterval(pollUsage, 60000);
      }

      function stopPolling() {
        if (statusPollTimer) { clearInterval(statusPollTimer); statusPollTimer = null; }
        if (logsPollTimer) { clearInterval(logsPollTimer); logsPollTimer = null; }
        if (statsPollTimer) { clearInterval(statsPollTimer); statsPollTimer = null; }
        if (usagePollTimer) { clearInterval(usagePollTimer); usagePollTimer = null; }
      }

      // ----- Gateway controls -----
      window.toggleGateway = function() {
        var running = cachedStatus && cachedStatus.gatewayRunning;
        var action = running ? 'stop' : 'start';
        var btn = document.getElementById('btn-toggle-agent');
        btn.disabled = true;
        btn.textContent = t('lite.quickActions.working');

        fetch('/lite/api/gateway/' + action + '?' + authParam(), { method: 'POST' })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (!data.success && data.error) {
              showToast('Error: ' + data.error, 'error');
            }
            setTimeout(pollStatus, 500);
          })
          .catch(function(err) {
            showToast('Error: ' + err.message, 'error');
          })
          .finally(function() {
            btn.disabled = false;
          });
      };

      window.gatewayRestart = function() {
        var btn = document.getElementById('btn-restart');
        btn.disabled = true;
        btn.textContent = t('lite.quickActions.working');

        fetch('/lite/api/gateway/restart?' + authParam(), { method: 'POST' })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (!data.success && data.error) {
              showToast('Error: ' + data.error, 'error');
            }
            setTimeout(pollStatus, 1000);
          })
          .catch(function(err) {
            showToast('Error: ' + err.message, 'error');
          })
          .finally(function() {
            btn.textContent = t('lite.quickActions.restart');
            btn.disabled = false;
          });
      };

      // ----- Maintenance -----
      function checkVersion() {
        fetch('/lite/api/version?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            var currentEl = document.getElementById('version-current');
            var updateEl = document.getElementById('version-update');
            var upgradeBtn = document.getElementById('btn-upgrade');
            var pickerEl = document.getElementById('version-picker');
            var selectEl = document.getElementById('version-select');
            var switchBtn = document.getElementById('btn-switch-version');
            var revertBtn = document.getElementById('btn-revert-base');

            currentEl.textContent = data.current || 'unknown';

            if (data.upgradeAvailable && data.upgradeMethod === 'npm') {
              updateEl.textContent = t('lite.maintenance.available', { version: data.latest });
              updateEl.style.display = '';
              upgradeBtn.style.display = '';
              upgradeBtn.textContent = t('lite.maintenance.upgradeTo', { version: data.latest });
            } else if (data.upgradeMethod === 'redeploy') {
              updateEl.textContent = t('lite.maintenance.redeployToUpdate');
              updateEl.style.display = '';
              upgradeBtn.style.display = 'none';
            } else {
              updateEl.style.display = 'none';
              upgradeBtn.style.display = 'none';
            }

            // Populate version picker
            if (data.versions && data.versions.length > 0) {
              pickerEl.style.display = '';
              // Clear existing options and add placeholder
              while (selectEl.firstChild) selectEl.removeChild(selectEl.firstChild);
              var placeholder = document.createElement('option');
              placeholder.value = '';
              placeholder.textContent = 'Select version...';
              selectEl.appendChild(placeholder);
              data.versions.forEach(function(v) {
                var opt = document.createElement('option');
                opt.value = v;
                var label = v;
                if (v === data.current) label += ' (current)';
                if (v === data.baseVersion) label += ' (base)';
                opt.textContent = label;
                selectEl.appendChild(opt);
              });
              switchBtn.disabled = true;
            } else {
              pickerEl.style.display = 'none';
            }

            // Show revert button if npm-installed version is active
            if (data.isNpmInstalled && data.baseVersion) {
              revertBtn.style.display = '';
              revertBtn.textContent = 'Revert to Base (' + data.baseVersion + ')';
            } else {
              revertBtn.style.display = 'none';
            }
          })
          .catch(function() {
            document.getElementById('version-current').textContent = '?';
          });
      }

      window.downloadBackup = function() {
        window.location.href = '/onboard/export?' + authParam();
      };

      window.handleRestoreFile = function(input) {
        var file = input.files && input.files[0];
        if (!file) return;
        var name = file.name.toLowerCase();
        if (!name.endsWith('.tar.gz') && !name.endsWith('.tgz') && !name.endsWith('.zip')) {
          showToast(t('lite.maintenance.invalidFile'), 'error');
          input.value = '';
          return;
        }
        showConfirmDialog(
          t('lite.maintenance.restoreTitle'),
          t('lite.maintenance.restoreMessage', { filename: file.name }),
          function() { performRestore(file); }
        );
        input.value = '';
      };

      function performRestore(file) {
        var btn = document.getElementById('btn-restore');
        var statusEl = document.getElementById('maintenance-status');
        btn.disabled = true;
        btn.textContent = t('lite.maintenance.restoring');
        statusEl.className = 'maintenance-status visible';
        statusEl.textContent = '';

        var reader = new FileReader();
        reader.onload = function() {
          fetch('/lite/api/restore?' + authParam(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream', 'X-Filename': file.name },
            body: reader.result
          })
            .then(function(res) { return res.json(); })
            .then(function(data) {
              statusEl.textContent = '';
              (data.steps || []).forEach(function(step) {
                var span = document.createElement('span');
                span.className = 'step ' + (data.success ? 'ok' : 'err');
                span.textContent = step;
                statusEl.appendChild(span);
              });
              if (data.success) {
                showToast(t('lite.maintenance.restoreSuccess'), 'success');
                setTimeout(pollStatus, 1000);
              } else {
                showToast(t('lite.maintenance.restoreFailed', { error: data.error || 'unknown' }), 'error');
              }
            })
            .catch(function(err) {
              showToast(t('lite.maintenance.restoreError', { error: err.message }), 'error');
            })
            .finally(function() {
              btn.disabled = false;
              btn.textContent = t('lite.maintenance.restoreBackup');
            });
        };
        reader.readAsArrayBuffer(file);
      }

      window.confirmUpgrade = function() {
        showConfirmDialog(
          t('lite.maintenance.upgradeTitle'),
          t('lite.maintenance.upgradeMessage'),
          function() { performUpgrade('latest'); }
        );
      };

      // Version select change handler — enable/disable Switch button
      window.onVersionSelectChange = function() {
        var selectEl = document.getElementById('version-select');
        var switchBtn = document.getElementById('btn-switch-version');
        switchBtn.disabled = !selectEl.value;
      };

      window.confirmSwitchVersion = function() {
        var selectEl = document.getElementById('version-select');
        var version = selectEl.value;
        if (!version) return;
        showConfirmDialog(
          'Switch Version',
          'Switch OpenClaw to version ' + version + '? The gateway will restart.',
          function() { performUpgrade(version); }
        );
      };

      window.confirmRevertBase = function() {
        showConfirmDialog(
          'Revert to Base',
          'Remove npm-installed version and revert to the Docker base version? The gateway will restart.',
          function() { performUpgrade('base'); }
        );
      };

      function performUpgrade(version) {
        var statusEl = document.getElementById('maintenance-status');
        // Disable all version-related buttons during upgrade
        var upgradeBtn = document.getElementById('btn-upgrade');
        var switchBtn = document.getElementById('btn-switch-version');
        var revertBtn = document.getElementById('btn-revert-base');
        if (upgradeBtn) upgradeBtn.disabled = true;
        if (switchBtn) switchBtn.disabled = true;
        if (revertBtn) revertBtn.disabled = true;
        statusEl.className = 'maintenance-status visible';
        statusEl.textContent = 'Installing...';

        var body = version ? JSON.stringify({ version: version }) : '{}';
        fetch('/lite/api/upgrade?' + authParam(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body
        })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            statusEl.textContent = '';
            (data.steps || []).forEach(function(step) {
              var span = document.createElement('span');
              span.className = 'step ' + (data.success ? 'ok' : 'err');
              span.textContent = step;
              statusEl.appendChild(span);
            });
            if (data.success) {
              showToast('Version updated successfully', 'success');
              checkVersion();
              setTimeout(pollStatus, 1000);
            } else {
              showToast('Version update failed: ' + (data.error || 'unknown'), 'error');
            }
          })
          .catch(function(err) {
            showToast('Version update error: ' + err.message, 'error');
          })
          .finally(function() {
            if (upgradeBtn) upgradeBtn.disabled = false;
            if (switchBtn) switchBtn.disabled = false;
            if (revertBtn) revertBtn.disabled = false;
          });
      }

      function showConfirmDialog(title, message, onConfirm) {
        var overlay = document.createElement('div');
        overlay.className = 'maintenance-confirm-overlay';

        var dialog = document.createElement('div');
        dialog.className = 'maintenance-confirm-dialog';

        var h3 = document.createElement('h3');
        h3.textContent = title;
        dialog.appendChild(h3);

        var p = document.createElement('p');
        p.textContent = message;
        dialog.appendChild(p);

        var buttons = document.createElement('div');
        buttons.className = 'dialog-buttons';

        var cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-secondary';
        cancelBtn.textContent = t('lite.confirm.cancel');
        cancelBtn.addEventListener('click', function() { document.body.removeChild(overlay); });
        buttons.appendChild(cancelBtn);

        var confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn-primary';
        confirmBtn.textContent = t('lite.confirm.continue');
        confirmBtn.addEventListener('click', function() {
          document.body.removeChild(overlay);
          onConfirm();
        });
        buttons.appendChild(confirmBtn);

        dialog.appendChild(buttons);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
      }

      // ----- Terminal (Advanced mode) -----
      function initTerminal() {
        term = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          theme: {
            background: '#12141a',
            foreground: '#e4e4e7',
            cursor: '#14b8a6',
            cursorAccent: '#12141a',
            selection: 'rgba(255, 92, 92, 0.15)',
            black: '#181b22',
            red: '#ff5c5c',
            green: '#14b8a6',
            yellow: '#f59e0b',
            blue: '#71717a',
            magenta: '#ff5c5c',
            cyan: '#14b8a6',
            white: '#e4e4e7',
            brightBlack: '#52525b',
            brightRed: '#ff7070',
            brightGreen: '#00e5cc',
            brightYellow: '#f59e0b',
            brightBlue: '#71717a',
            brightMagenta: '#ff7070',
            brightCyan: '#00e5cc',
            brightWhite: '#fafafa'
          }
        });

        fitAddon = new FitAddon.FitAddon();
        var webLinksAddon = new WebLinksAddon.WebLinksAddon();

        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);
        term.open(document.getElementById('ui-terminal'));
        fitAddon.fit();

        updateTermSize();

        window.addEventListener('resize', function() {
          if (!fitAddon) return;
          fitAddon.fit();
          updateTermSize();
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
          }
        });

        term.onData(function(data) {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'input', data: data }));
          }
        });
      }

      function updateTermSize() {
        if (term) {
          document.getElementById('term-size').textContent = term.cols + 'x' + term.rows;
        }
      }

      function updateTermStatus(status, color) {
        var el = document.getElementById('term-connection-status');
        el.textContent = status;
        el.style.color = color || '#888';
      }

      function connectTerminal() {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }

        updateTermStatus(t('lite.terminal.connecting'), '#f59e0b');

        var protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(protocol + '//' + location.host + '/lite/ws?' + authParam());

        ws.onopen = function() {
          term.clear();
          updateTermStatus(t('lite.terminal.connected'), '#10b981');
          if (fitAddon) {
            ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
          }
        };

        ws.onmessage = function(event) {
          try {
            var msg = JSON.parse(event.data);
            if (msg.type === 'output') {
              term.write(msg.data);
            } else if (msg.type === 'exit') {
              term.writeln('');
              term.writeln('\\x1b[90mSession ended (code: ' + msg.code + ')\\x1b[0m');
              updateTermStatus(t('lite.terminal.disconnected'), '#ef4444');
            }
          } catch (e) {
            term.write(event.data);
          }
        };

        ws.onclose = function() {
          updateTermStatus(t('lite.terminal.disconnected'), '#ef4444');
        };

        ws.onerror = function() {
          term.writeln('\\x1b[1;31mConnection error.\\x1b[0m');
          updateTermStatus(t('lite.terminal.error'), '#ef4444');
        };
      }

      // ----- Command palette -----
      var COMMANDS = [
        { cmd: 'openclaw status', descKey: 'lite.cmd.status', cat: 'status', fav: true },
        { cmd: 'openclaw health', descKey: 'lite.cmd.health', cat: 'status', fav: true },
        { cmd: 'openclaw channels list', descKey: 'lite.cmd.channelsList', cat: 'channels', fav: true },
        { cmd: 'openclaw logs --follow', descKey: 'lite.cmd.logsFollow', cat: 'gateway', fav: true },
        { cmd: 'openclaw --version', descKey: 'lite.cmd.version', cat: 'info', fav: true },

        { cmd: 'openclaw gateway status', descKey: 'lite.cmd.gatewayStatus', cat: 'gateway' },
        { cmd: 'openclaw gateway health', descKey: 'lite.cmd.gatewayHealth', cat: 'gateway' },
        { cmd: 'openclaw logs', descKey: 'lite.cmd.logs', cat: 'gateway' },

        { cmd: 'openclaw config get .', descKey: 'lite.cmd.configGet', cat: 'config' },
        { cmd: 'openclaw doctor', descKey: 'lite.cmd.doctor', cat: 'config' },
        { cmd: 'openclaw doctor --deep', descKey: 'lite.cmd.doctorDeep', cat: 'config' },

        { cmd: 'openclaw models list', descKey: 'lite.cmd.modelsList', cat: 'models' },
        { cmd: 'openclaw models status', descKey: 'lite.cmd.modelsStatus', cat: 'models' },
        { cmd: 'openclaw models scan', descKey: 'lite.cmd.modelsScan', cat: 'models' },

        { cmd: 'openclaw channels status', descKey: 'lite.cmd.channelsStatus', cat: 'channels' },
        { cmd: 'openclaw channels logs', descKey: 'lite.cmd.channelsLogs', cat: 'channels' },
        { cmd: 'openclaw pairing list', descKey: 'lite.cmd.pairingList', cat: 'channels' },

        { cmd: 'openclaw skills list', descKey: 'lite.cmd.skillsList', cat: 'skills' },
        { cmd: 'openclaw skills check', descKey: 'lite.cmd.skillsCheck', cat: 'skills' },
        { cmd: 'openclaw plugins list', descKey: 'lite.cmd.pluginsList', cat: 'skills' },
        { cmd: 'openclaw plugins doctor', descKey: 'lite.cmd.pluginsDoctor', cat: 'skills' },

        { cmd: 'openclaw memory status', descKey: 'lite.cmd.memoryStatus', cat: 'memory' },
        { cmd: 'openclaw memory index', descKey: 'lite.cmd.memoryIndex', cat: 'memory' },

        { cmd: 'openclaw cron list', descKey: 'lite.cmd.cronList', cat: 'cron' },
        { cmd: 'openclaw cron status', descKey: 'lite.cmd.cronStatus', cat: 'cron' },

        { cmd: 'openclaw sessions', descKey: 'lite.cmd.sessions', cat: 'sessions' },
        { cmd: 'openclaw status --all', descKey: 'lite.cmd.statusAll', cat: 'status' },

        { cmd: 'openclaw agents list', descKey: 'lite.cmd.agentsList', cat: 'agents' },

        { cmd: 'openclaw nodes status', descKey: 'lite.cmd.nodesStatus', cat: 'nodes' },
        { cmd: 'openclaw nodes list', descKey: 'lite.cmd.nodesList', cat: 'nodes' },
        { cmd: 'openclaw nodes pending', descKey: 'lite.cmd.nodesPending', cat: 'nodes' },
        { cmd: 'openclaw devices', descKey: 'lite.cmd.devices', cat: 'nodes' },

        { cmd: 'openclaw security audit', descKey: 'lite.cmd.securityAudit', cat: 'security' },
        { cmd: 'openclaw security audit --deep', descKey: 'lite.cmd.securityAuditDeep', cat: 'security' },

        { cmd: 'openclaw browser status', descKey: 'lite.cmd.browserStatus', cat: 'browser' },
        { cmd: 'openclaw browser tabs', descKey: 'lite.cmd.browserTabs', cat: 'browser' },

        { cmd: 'openclaw hooks list', descKey: 'lite.cmd.hooksList', cat: 'system' },
        { cmd: 'openclaw sandbox list', descKey: 'lite.cmd.sandboxList', cat: 'system' },
        { cmd: 'openclaw docs', descKey: 'lite.cmd.docs', cat: 'system' },
        { cmd: 'openclaw help', descKey: 'lite.cmd.help', cat: 'info' },
      ];

      var activeCat = 'all';

      window.sendQuickCmd = function(cmd) {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data: cmd }));
        } else {
          connectTerminal();
          setTimeout(function() {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'input', data: cmd }));
            }
          }, 1000);
        }
      };

      function getCategories() {
        var seen = {};
        COMMANDS.forEach(function(c) { seen[c.cat] = true; });
        return Object.keys(seen).sort();
      }

      function makeCmdItem(c) {
        var div = document.createElement('div');
        div.className = 'cmd-item';
        div.addEventListener('click', function() { sendQuickCmd(c.cmd + '\\n'); });
        var nameSpan = document.createElement('span');
        nameSpan.className = 'cmd-name';
        nameSpan.textContent = c.cmd;
        var descSpan = document.createElement('span');
        descSpan.className = 'cmd-desc';
        descSpan.textContent = t(c.descKey);
        div.appendChild(nameSpan);
        div.appendChild(descSpan);
        return div;
      }

      function makeSectionLabel(text) {
        var div = document.createElement('div');
        div.className = 'cmd-section-label';
        div.textContent = text;
        return div;
      }

      function renderCategoryPills() {
        var el = document.getElementById('cmd-categories');
        if (!el) return;
        el.textContent = '';
        var cats = ['all'].concat(getCategories());
        cats.forEach(function(c) {
          var pill = document.createElement('span');
          pill.className = 'cmd-cat-pill' + (activeCat === c ? ' active' : '');
          pill.textContent = c;
          pill.addEventListener('click', function() { setCategory(c); });
          el.appendChild(pill);
        });
      }

      window.setCategory = function(cat) {
        activeCat = cat;
        renderCategoryPills();
        filterCommands();
      };

      window.filterCommands = function() {
        var searchEl = document.getElementById('cmd-search');
        var search = searchEl ? searchEl.value.toLowerCase() : '';
        var filtered = COMMANDS.filter(function(c) {
          var matchCat = activeCat === 'all' || c.cat === activeCat;
          var matchSearch = !search || c.cmd.toLowerCase().indexOf(search) !== -1 || t(c.descKey).toLowerCase().indexOf(search) !== -1 || c.cat.toLowerCase().indexOf(search) !== -1;
          return matchCat && matchSearch;
        });

        var listEl = document.getElementById('cmd-list');
        if (!listEl) return;
        listEl.textContent = '';

        if (activeCat === 'all' && !search) {
          var favs = filtered.filter(function(c) { return c.fav; });
          if (favs.length) {
            listEl.appendChild(makeSectionLabel('favorites'));
            favs.forEach(function(c) { listEl.appendChild(makeCmdItem(c)); });
          }
        }

        var grouped = {};
        filtered.forEach(function(c) {
          if (!grouped[c.cat]) grouped[c.cat] = [];
          grouped[c.cat].push(c);
        });

        getCategories().forEach(function(cat) {
          if (!grouped[cat]) return;
          listEl.appendChild(makeSectionLabel(cat));
          grouped[cat].forEach(function(c) { listEl.appendChild(makeCmdItem(c)); });
        });

        if (!listEl.children.length) {
          var empty = document.createElement('div');
          empty.style.cssText = 'padding: 20px; text-align: center; color: var(--muted);';
          empty.textContent = t('lite.commandPalette.noMatch');
          listEl.appendChild(empty);
        }
      };

      // ----- Security Audit -----
      function runSecurityAudit(deep) {
        var btnBasic = document.getElementById('btn-audit');
        var btnDeep = document.getElementById('btn-audit-deep');
        var container = document.getElementById('security-audit-results');
        btnBasic.disabled = true;
        btnDeep.disabled = true;
        container.className = '';
        container.textContent = '';
        var loadNotice = document.createElement('div');
        loadNotice.className = 'section-notice';
        loadNotice.textContent = deep ? t('lite.security.runningDeep') : t('lite.security.running');
        container.appendChild(loadNotice);

        fetch('/lite/api/security-audit?' + authParam(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deep: deep })
        })
          .then(function(res) { return res.json(); })
          .then(function(data) { renderSecurityAudit(data, container); })
          .catch(function(err) {
            container.textContent = '';
            var errNotice = document.createElement('div');
            errNotice.className = 'section-notice';
            errNotice.textContent = 'Error: ' + err.message;
            container.appendChild(errNotice);
          })
          .finally(function() {
            btnBasic.disabled = false;
            btnDeep.disabled = false;
          });
      }
      window.runSecurityAudit = runSecurityAudit;

      function renderSecurityAudit(data, container) {
        container.textContent = '';

        if (!data || !data.available) {
          var notice = document.createElement('div');
          notice.className = 'section-notice';
          notice.textContent = data && data.error ? data.error : t('lite.security.notAvailable');
          container.appendChild(notice);
          return;
        }

        if (data.findings && data.findings.length > 0) {
          var pass = 0, warn = 0, fail = 0;
          data.findings.forEach(function(f) {
            var s = f.severity || f.status || 'fail';
            if (s === 'pass') pass++;
            else if (s === 'warn' || s === 'warning') warn++;
            else fail++;
          });

          // Summary
          var summary = document.createElement('div');
          summary.className = 'audit-summary';
          function addSummaryItem(cls, count, label) {
            if (count === 0 && cls !== 'pass') return;
            var item = document.createElement('div');
            item.className = 'audit-summary-item';
            var dot = document.createElement('span');
            dot.className = 'audit-summary-dot ' + cls;
            item.appendChild(dot);
            item.appendChild(document.createTextNode(' ' + count + ' ' + label));
            summary.appendChild(item);
          }
          addSummaryItem('pass', pass, t('lite.security.passed'));
          addSummaryItem('warn', warn, t('lite.security.warnings'));
          addSummaryItem('fail', fail, t('lite.security.failed'));
          container.appendChild(summary);

          // Findings list
          var results = document.createElement('div');
          results.className = 'audit-results';
          data.findings.forEach(function(f) {
            var sev = f.severity || f.status || 'fail';
            var iconChar = sev === 'pass' ? '\u2713' : (sev === 'warn' || sev === 'warning') ? '\u26A0' : '\u2717';
            var color = sev === 'pass' ? 'var(--ok)' : (sev === 'warn' || sev === 'warning') ? '#F59E0B' : 'var(--danger)';

            var row = document.createElement('div');
            row.className = 'audit-item';
            var icon = document.createElement('span');
            icon.className = 'audit-item-icon';
            icon.style.color = color;
            icon.textContent = iconChar;
            row.appendChild(icon);
            var text = document.createElement('span');
            text.className = 'audit-item-text';
            text.textContent = f.message || f.description || f.check || JSON.stringify(f);
            row.appendChild(text);
            results.appendChild(row);
          });
          container.appendChild(results);
        } else if (data.raw) {
          var pre = document.createElement('pre');
          pre.className = 'audit-raw';
          pre.textContent = data.raw;
          container.appendChild(pre);
        } else {
          var emptyNotice = document.createElement('div');
          emptyNotice.className = 'section-notice';
          emptyNotice.textContent = t('lite.security.noFindings');
          container.appendChild(emptyNotice);
        }
      }

      // ----- Dynamic translation re-render -----
      function applyDynamicTranslations() {
        document.title = t('pageTitle');
        if (cachedStatus) {
          updateHero(cachedStatus);
          updateProviders(cachedStatus.auth, cachedStatus.model);
          updateIntegrations(cachedStatus.channels);
          updateQuickActions(cachedStatus.gatewayRunning);
          updateSystemInfo(cachedStatus);
        }
        loadMemory();
        filterCommands();
      }

      // ----- Initialize -----
      document.addEventListener('DOMContentLoaded', function() {
        initLanguage();
        updateLangSelectorUI();
        applyTranslations();
        startPolling();
        renderCategoryPills();
        filterCommands();
      });
    })();
  </script>
</body>
</html>`;
}

/**
 * Mask a token for display: show first 4 and last 4 chars
 * @param {string} token
 * @returns {string}
 */
function maskToken(token) {
  if (!token || token.length < 8) return token || '--';
  return token.substring(0, 4) + '...' + token.substring(token.length - 4);
}

/**
 * Format uptime seconds into human-readable string (server-side for initial render)
 * @param {number} seconds
 * @returns {string}
 */
function formatUptime(seconds) {
  if (seconds == null) return '--';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
