import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

const TEMPLATES_DIR = path.join(process.cwd(), "templates");

// Cache compiled templates
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/**
 * Renders a Handlebars template by filename.
 * Templates are loaded from the /templates directory.
 */
export function renderTemplate(templateName: string, data: Record<string, unknown>): string {
  if (!templateCache.has(templateName)) {
    const templatePath = path.join(TEMPLATES_DIR, templateName);
    const source = fs.readFileSync(templatePath, "utf-8");
    templateCache.set(templateName, Handlebars.compile(source));
  }
  const template = templateCache.get(templateName)!;
  return template(data);
}

// Register Handlebars helpers
Handlebars.registerHelper("json", (value: unknown) => JSON.stringify(value, null, 2));
Handlebars.registerHelper("jsonInline", (value: unknown) => JSON.stringify(value));
Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);
Handlebars.registerHelper("or", (a: unknown, b: unknown) => a || b);
Handlebars.registerHelper("toLowerCase", (str: string) => str.toLowerCase());
Handlebars.registerHelper("toUpperCase", (str: string) => str.toUpperCase());
