import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, 'src');

const arrayReturningMethods = new Set([
  'concat',
  'filter',
  'flat',
  'flatMap',
  'map',
  'slice',
  'sort',
  'splice',
  'toReversed',
  'toSorted',
  'toSpliced',
]);

function walkSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSourceFiles(fullPath, files);
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let current = expression;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }

  return current;
}

function isArrayFactoryCall(expression: ts.CallExpression): boolean {
  if (!ts.isPropertyAccessExpression(expression.expression)) return false;

  const method = expression.expression.name.text;
  const receiver = expression.expression.expression;

  if (arrayReturningMethods.has(method)) return true;
  if (!ts.isIdentifier(receiver)) return false;

  return (
    (receiver.text === 'Array' && method === 'from') ||
    (receiver.text === 'Object' && ['entries', 'keys', 'values'].includes(method))
  );
}

function returnsFreshReference(expression: ts.Expression): boolean {
  const current = unwrapExpression(expression);

  if (ts.isArrayLiteralExpression(current) || ts.isObjectLiteralExpression(current)) {
    return true;
  }

  if (ts.isNewExpression(current)) {
    return true;
  }

  if (ts.isCallExpression(current)) {
    return isArrayFactoryCall(current);
  }

  if (ts.isConditionalExpression(current)) {
    return returnsFreshReference(current.whenTrue) || returnsFreshReference(current.whenFalse);
  }

  if (ts.isBinaryExpression(current) && current.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) {
    return returnsFreshReference(current.left) || returnsFreshReference(current.right);
  }

  return false;
}

function selectorReturnExpressions(selector: ts.ArrowFunction | ts.FunctionExpression): ts.Expression[] {
  if (!ts.isBlock(selector.body)) return [selector.body];

  const expressions: ts.Expression[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isReturnStatement(node) && node.expression) {
      expressions.push(node.expression);
      return;
    }

    ts.forEachChild(node, visit);
  };

  visit(selector.body);
  return expressions;
}

test('useAppStore selectors do not return freshly allocated references', () => {
  const findings: string[] = [];

  for (const filePath of walkSourceFiles(srcRoot)) {
    const sourceText = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'useAppStore') {
        const selector = node.arguments[0];
        if (selector && (ts.isArrowFunction(selector) || ts.isFunctionExpression(selector))) {
          const unstableReturn = selectorReturnExpressions(selector).find(returnsFreshReference);
          if (unstableReturn) {
            const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            findings.push(
              `${path.relative(repoRoot, filePath)}:${location.line + 1} ${sourceText
                .slice(node.getStart(sourceFile), node.getEnd())
                .replace(/\s+/g, ' ')
                .slice(0, 180)}`
            );
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  assert.deepEqual(findings, []);
});
