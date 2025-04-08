import * as vscode from 'vscode';
import { CodeChangeRule, CodeChangeResult } from './types';

export async function applyCodeChange(
    editor: vscode.TextEditor,
    rule: CodeChangeRule
): Promise<CodeChangeResult> {
    try {
        const document = editor.document;
        const selection = editor.selection;
        
        // 获取要处理的文本范围
        const range = selection.isEmpty
            ? new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
              )
            : selection;
        
        const text = document.getText(range);
        
        // 创建正则表达式来匹配函数调用
        // 匹配函数名及其参数列表
        const functionRegex = new RegExp(`\\b${rule.sourceFunction}\\s*\\(([^)]*)\\)`, 'g');
        
        let newText = text;
        let changes = 0;
        
        // 替换所有匹配的函数调用
        newText = text.replace(functionRegex, (match, params) => {
            changes++;
            // 对于 sprintf 到 snprintf 的特殊处理
            if (rule.sourceFunction === 'sprintf' && rule.targetFunction === 'snprintf') {
                // 添加缓冲区大小参数
                const paramList = params.split(',');
                if (paramList.length >= 1) {
                    const bufferParam = paramList[0].trim();
                    // 添加一个合理的缓冲区大小限制
                    return `${rule.targetFunction}(${bufferParam}, sizeof(${bufferParam})-1, ${params})`;
                }
            }
            // 对于 strcpy 到 strncpy 的特殊处理
            if (rule.sourceFunction === 'strcpy' && rule.targetFunction === 'strncpy') {
                // 添加缓冲区大小参数
                const paramList = params.split(',');
                if (paramList.length >= 2) {
                    const destParam = paramList[0].trim();
                    // 添加目标缓冲区大小作为第二个参数
                    return `${rule.targetFunction}(${destParam}, ${paramList[1]}, sizeof(${destParam}))`;
                }
            }
            return `${rule.targetFunction}(${params})`;
        });
        
        // 应用修改
        await editor.edit(editBuilder => {
            editBuilder.replace(range, newText);
        });
        
        // 显示成功消息
        vscode.window.showInformationMessage(
            `Successfully applied rule '${rule.name}'. Made ${changes} changes.`
        );
        
        return {
            success: true,
            changes,
            message: `Successfully applied rule '${rule.name}'. Made ${changes} changes.`
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`Failed to apply code change: ${errorMessage}`);
        return {
            success: false,
            message: `Failed to apply code change: ${errorMessage}`
        };
    }
}