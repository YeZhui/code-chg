import * as vscode from 'vscode';
import { CodeChangeRule } from './types';
import { applyCodeChange } from './codeChange';

export function activate(context: vscode.ExtensionContext) {
    // 注册应用规则的命令
    let applyRuleDisposable = vscode.commands.registerCommand('code-chg.applyRule', async () => {
        const rules = vscode.workspace.getConfiguration('code-chg').get<CodeChangeRule[]>('rules') || [];
        
        if (rules.length === 0) {
            vscode.window.showWarningMessage('No code change rules configured. Please configure rules first.');
            return;
        }

        // 获取当前选中的文本范围
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found.');
            return;
        }

        // 选择要应用的规则
        const selectedRule = await vscode.window.showQuickPick(
            rules.map(rule => ({
                label: rule.name,
                description: `${rule.sourceFunction} → ${rule.targetFunction}`,
                rule: rule
            })),
            { placeHolder: 'Select a rule to apply' }
        );

        if (!selectedRule) {
            return;
        }

        // 应用代码修改
        await applyCodeChange(editor, selectedRule.rule);
    });

    // 注册配置规则的命令
    let configureRulesDisposable = vscode.commands.registerCommand('code-chg.configureRules', async () => {
        const rules = vscode.workspace.getConfiguration('code-chg').get<CodeChangeRule[]>('rules') || [];
        
        // 打开设置界面
        await vscode.commands.executeCommand('workbench.action.openSettings', 'code-chg.rules');
    });

    context.subscriptions.push(applyRuleDisposable, configureRulesDisposable);
}

export function deactivate() {}