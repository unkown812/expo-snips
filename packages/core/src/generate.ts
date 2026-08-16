import Handlebars from "handlebars";
import { ScreenRecipe, FileTemplate } from "./types";
import { GenerationContext, RenderContext } from "./context";

Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);
Handlebars.registerHelper("neq", (a: unknown, b: unknown) => a !== b);

export function renderTemplate(templateStr: string, context: RenderContext): string {
  const compiled = Handlebars.compile(templateStr);
  return compiled(context as unknown as Record<string, unknown>);
}

function resolveTemplateString(
  file: FileTemplate,
  context: GenerationContext
): string | null {
  if (file.variants && context.variant && file.variants[context.variant]) {
    return file.variants[context.variant];
  }
  if (file.perStyling && file.perStyling[context.options.styling]) {
    return file.perStyling[context.options.styling] ?? null;
  }
  return file.template ?? null;
}

export function getFilesForRecipe(
  recipe: ScreenRecipe,
  context: GenerationContext,
  resolveFile?: (file: FileTemplate) => string | null
): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];

  for (const file of recipe.files) {
    if (file.when && !matchesCondition(file.when, context)) continue;

    let templateStr = resolveTemplateString(file, context);
    if (templateStr === null && file.templateFile) {
      templateStr = resolveFile?.(file) ?? null;
    }
    if (templateStr === null) continue;

    const content = renderTemplate(templateStr, buildRenderContext(context));
    files.push({ path: file.path, content });
  }

  return files;
}

function matchesCondition(cond: NonNullable<FileTemplate["when"]>, context: GenerationContext): boolean {
  if (cond.styling && !cond.styling.includes(context.options.styling)) return false;
  if (cond.router && !cond.router.includes(context.options.router)) return false;
  if (cond.ui && !cond.ui.includes(context.options.ui)) return false;
  if (cond.icons && !cond.icons.includes(context.options.icons)) return false;
  if (cond.typescript !== undefined && cond.typescript !== context.options.typescript) return false;
  return true;
}

function buildRenderContext(context: GenerationContext): RenderContext {
  return {
    options: context.options,
    styling: context.options.styling,
    router: context.options.router,
    ui: context.options.ui,
    icons: context.options.icons,
    typescript: context.options.typescript,
    variant: context.variant,
  };
}