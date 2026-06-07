import type { ReflectionTemplate } from '../types';

export const generateTags = (
  template: ReflectionTemplate,
  answers: Record<string, string | number>
): string[] => {
  const tags: string[] = [];

  // 模板名称始终加入标签
  tags.push(template.name);

  // 查找掌控感类问题（数字类型，范围 1-10，包含"掌控"关键词）
  const controlQuestion = template.questions.find(
    (q) => q.type === 'number' && q.label.includes('掌控')
  );

  if (controlQuestion) {
    const control = Number(answers[controlQuestion.id]);
    if (!isNaN(control)) {
      if (control >= 7) tags.push('高掌控感');
      else if (control <= 4) tags.push('低掌控感');
    }
  }

  return tags;
};

export default generateTags;
