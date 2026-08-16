export type StylingOption = "nativewind" | "stylesheet" | "tamagui";
export type RouterOption = "expo-router" | "react-navigation";
export type UIOption = "native" | "shadcn" | "custom";
export type IconOption = "lucide" | "vector-icons" | "none";

export interface Conditions {
  styling?: StylingOption[];
  router?: RouterOption[];
  ui?: UIOption[];
  icons?: IconOption[];
  typescript?: boolean;
}

export interface FileTemplate {
  path: string;
  // Inline handlebars template string
  template?: string;
  // Relative path to a .hbs file, resolved by the registry loader
  templateFile?: string;
  // Per-styling overrides: keyed by StylingOption
  perStyling?: Partial<Record<StylingOption, string>>;
  when?: Conditions;
  // Per-variant overrides (screen-level variant id -> template string/file)
  variants?: Record<string, string>;
}

export interface ScreenVariant {
  id: string;
  label: string;
  description?: string;
}

export interface ScreenRecipe {
  id: string;
  name: string;
  description: string;
  version: string;
  framework: "react-native";
  runtime: "expo";
  typescript: boolean;
  supported: {
    styling: StylingOption[];
    router: RouterOption[];
    ui: UIOption[];
    icons: IconOption[];
  };
  dependencies: string[];
  devDependencies?: string[];
  files: FileTemplate[];
  variants?: ScreenVariant[];
  tags?: string[];
  // UI primitive recipe ids required by this screen when ui === "shadcn"
  primitives?: string[];
}