import {
  Application,
  ProjectReflection,
  Comment,
  ReflectionKind,
  SomeType,
  ParameterReflection,
  SignatureReflection,
  DeclarationReflection,
  // eslint-disable-next-line import/no-unresolved
} from 'typedoc';
import { writeFile } from 'fs';

function typeToString(type: SomeType, html = false): string {
  function em(text: any) {
    if (html) {
      return `<em>${String(text)}</em>`;
    } else {
      return `*${String(text)}*`;
    }
  }

  switch (type.type) {
    case 'array':
      return `${typeToString(type.elementType)}[]`;
    case 'literal':
      return em(type.value);
    case 'union':
      return type.types.map((type) => typeToString(type, html)).join(' | ');
    case 'mapped':
      return `{[${type.parameter}${
        type.parameterType.type === 'reference' ? ' in ' : ':'
      } ${typeToString(type.parameterType)}]${
        type.optionalModifier === '+' ? '?' : ''
      }: ${typeToString(type.templateType)}}`;
    case 'intrinsic':
      return em(type.name);
    case 'reference':
      return em(type.name); // TODO add link
    case 'tuple':
      return `[${type.elements.map((type) => typeToString(type, html)).join(', ')}]`;
    case 'intersection':
      return type.types.map((type) => typeToString(type, html)).join(' & ');
    case 'conditional':
    case 'indexedAccess':
    case 'inferred':
    case 'optional':
    case 'predicate':
    case 'query':
    case 'reflection':
    case 'rest':
    case 'templateLiteral':
    case 'typeOperator':
    case 'unknown':
    default:
      return type.toString();
  }
}

function signatureToString(signature: SignatureReflection) {
  return `<code>${signature.name}(${(signature.parameters || [])
    .map((parameter) => parameter.name + (parameter.defaultValue ? '?' : ''))
    .join(', ')}): ${signature.type ? typeToString(signature.type, true) : 'void'}</code>`;
}

function propertyToString(property: DeclarationReflection) {
  return `<code>${property.name}${property.flags.isOptional ? '?' : ''}: ${
    property.type ? typeToString(property.type, true) : 'void'
  }</code>`;
}

class Writer {
  content: string[] = [];

  constructor(
    public baseHeadingLevel: number,
    public urlTo: () => string,
  ) {}

  text(text: string) {
    this.content.push(`${text}\n\n`);

    return this;
  }

  newLine() {
    this.content.push(`\n`);

    return this;
  }

  heading(h: number, text: string) {
    this.content.push(`${'#'.repeat(this.baseHeadingLevel + h)} ${text}\n\n`);

    return this;
  }

  writeTag(comment: Comment, tag: string, text: string) {
    const example = comment.getTag(`@${tag}`);
    if (example) {
      this.heading(3, text);
      this.text(Comment.displayPartsToMarkdown(example.content, this.urlTo));
    }
  }

  writeComment(comment: Comment) {
    if (comment.summary) {
      this.text(Comment.displayPartsToMarkdown(comment.summary, this.urlTo));
    }

    this.writeTag(comment, 'example', 'Example');
    this.writeTag(comment, 'see', 'See');
  }

  writeMethod(method: DeclarationReflection, omitReturn = false) {
    const signatures = method.getAllSignatures();
    signatures.forEach((signature) => {
      this.text(signatureToString(signature));
      if (signature.comment) {
        this.writeComment(signature.comment);
      }
      if (signature.parameters && signature.parameters.length) {
        this.heading(3, `Parameters`);
        signature.parameters.forEach((parameter) => {
          this.writeParameter(parameter);
        });
        this.newLine();
      }
      if (signature.type && !omitReturn) {
        this.heading(3, `Returns ${typeToString(signature.type)}`);
      }
    });
  }

  writeProperty(property: DeclarationReflection) {
    this.text(propertyToString(property));
    if (property.comment) {
      this.writeComment(property.comment);
    }
  }

  writeParameter(parameter: ParameterReflection) {
    let str = `- \`${parameter.name}\``;

    if (parameter.type) {
      str += `: ${typeToString(parameter.type)}`;
    }

    if (parameter.defaultValue) {
      str += ` = ${parameter.defaultValue}`;
    }

    if (parameter.comment) {
      const text = Comment.displayPartsToMarkdown(parameter.comment.summary, this.urlTo);
      if (text) {
        str += `<br>\n  ${text}`;
      }
    }

    this.content.push(str + '\n');
    return this;
  }

  writeSeparator() {
    this.content.push(`---\n\n`);
    return this;
  }

  saveToFile(fileName: string) {
    return new Promise((resolve) => writeFile(fileName, this.content.join(''), resolve));
  }
}

async function generateMarkdown(project: ProjectReflection, name: string, fileName: string) {
  const item = project.children?.find((child) => child.name === name);

  if (!item) {
    // error
    return;
  }

  const writer = new Writer(2, () => '');
  writer.heading(0, `Class ${item.name}`);

  if (item.comment) {
    writer.writeComment(item.comment);
  }

  item.sources?.forEach((source) => {
    writer.text(`> Defined in [${source.fileName}:${source.line}](${source.url}).`);
  });

  writer.writeSeparator();
  writer.heading(1, `Constructor`);

  const constructors = item.getChildrenByKind(ReflectionKind.Constructor);
  constructors.forEach((constructor) => writer.writeMethod(constructor, true));

  const properties = item
    .getChildrenByKind(ReflectionKind.Property)
    .filter((property) => !property.flags.isStatic && !property.flags.isPrivate);
  if (properties.length) {
    writer.writeSeparator();
    writer.heading(1, `Properties`);
    properties.forEach((property) => {
      writer.heading(2, property.name);
      writer.writeProperty(property);
    });
  }

  const methods = item
    .getChildrenByKind(ReflectionKind.Method)
    .filter((method) => !method.flags.isStatic && !method.flags.isPrivate);
  if (methods.length) {
    writer.writeSeparator();
    writer.heading(1, `Methods`);
    methods.forEach((method) => {
      writer.heading(2, method.name);
      writer.writeMethod(method);
    });
  }

  const staticProperties = item
    .getChildrenByKind(ReflectionKind.Property)
    .filter((property) => property.flags.isStatic);
  if (staticProperties.length) {
    writer.writeSeparator();
    writer.heading(1, `Static properties`);
    staticProperties.forEach((property) => {
      writer.heading(2, `${item.name}.${property.name}`);
      writer.writeProperty(property);
    });
  }

  const staticMethods = item
    .getChildrenByKind(ReflectionKind.Method)
    .filter((property) => property.flags.isStatic);
  if (staticMethods.length) {
    writer.writeSeparator();
    writer.heading(1, `Static methods`);
    staticMethods.forEach((method) => {
      writer.heading(2, `${item.name}.${method.name}`);
      writer.writeMethod(method);
    });
  }

  writer.saveToFile(fileName);
}

async function test(fileName: string) {
  const app = await Application.bootstrapWithPlugins({
    entryPoints: [fileName],
  });

  // console.log(app);

  const project = await app.convert();

  if (project) {
    // Project may not have converted correctly
    const outputDir = 'docs';

    // Rendered docs
    // await app.generateDocs(project, outputDir);
    await app.generateJson(project, outputDir + '/documentation.json');

    generateMarkdown(project, 'KifuNode', outputDir + '/api.md');
  }
}

// const file = readFileSync(fileName, 'utf-8');

test('./src');
