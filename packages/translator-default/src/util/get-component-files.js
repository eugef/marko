import path from "path";
import escapeRegExp from "escape-string-regexp";

const COMPONENT_FILES_KEY = Symbol();

export default function getComponentFiles({ hub: { file } }) {
  const meta = file.metadata.marko;

  if (meta[COMPONENT_FILES_KEY]) {
    return meta[COMPONENT_FILES_KEY];
  }

  const { sourceFileName } = file.opts;
  const fs = file.markoOpts.fileSystem;
  const ext = path.extname(sourceFileName);
  const dirname = path.dirname(sourceFileName);
  const dirFiles = fs.readdirSync(dirname).sort();
  const nameNoExt = path.basename(sourceFileName, ext);
  const isEntry = "index" === nameNoExt;
  const fileMatch = `(${escapeRegExp(nameNoExt)}\\.${isEntry ? "|" : ""})`;
  const styleMatch = new RegExp(`^${fileMatch}style\\.\\w+$`);
  const componentMatch = new RegExp(`^${fileMatch}component\\.\\w+$`);
  const splitComponentMatch = new RegExp(
    `^${fileMatch}component-browser\\.\\w+$`
  );
  const packageMatch = new RegExp(`^${fileMatch}browser\\.\\json$`);
  let styleFile;
  let packageFile;
  let componentFile;
  let componentBrowserFile;

  for (const file of dirFiles) {
    if (!styleFile && styleMatch.test(file)) {
      styleFile = `./${file}`;
    } else if (!packageFile && packageMatch.test(file)) {
      packageFile = `./${file}`;
    } else if (!componentFile && componentMatch.test(file)) {
      componentFile = `./${file}`;
    } else if (!componentBrowserFile && splitComponentMatch.test(file)) {
      componentBrowserFile = `./${file}`;
    }
  }

  return (meta[COMPONENT_FILES_KEY] = {
    styleFile,
    packageFile,
    componentFile,
    componentBrowserFile
  });
}
