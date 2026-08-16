import {
  StylingOption,
  RouterOption,
  UIOption,
  IconOption,
} from "./types";

export interface GenerationOptions {
  styling: StylingOption;
  router: RouterOption;
  ui: UIOption;
  icons: IconOption;
  typescript: boolean;
}

export interface GenerationContext {
  projectRoot: string;
  options: GenerationOptions;
  variant?: string;
}

export interface RenderContext {
  options: GenerationOptions;
  styling: StylingOption;
  router: RouterOption;
  ui: UIOption;
  icons: IconOption;
  typescript: boolean;
  variant?: string;
}