export interface CodeChangeRule {
    name: string;
    sourceFunction: string;
    targetFunction: string;
}

export interface CodeChangeResult {
    success: boolean;
    message?: string;
    changes?: number;
}