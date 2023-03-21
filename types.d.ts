type engine = (app: Express) => void;

type TemplateResult = {
  strings: string[];
  args: any[];
  options: any;
  render: () => string;
  parseTemplate: (template: any) => string;
};

type html = (strings: string[], args: any[]) => TemplateResult;

type unsafe = (strings: string[], args: any[]) => TemplateResult;
