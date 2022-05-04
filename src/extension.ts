import {
  commands,
  window,
  ExtensionContext,
  Uri,
  env,
  workspace,
  ProgressLocation,
} from "vscode";

// @ts-ignore
import getApps from "installed-sw";

const makeAppsQPIs = (apps: any[]) =>
  apps.map((app) => ({ ...app, label: app.name }));

const createAppsQuickPick = async ({ title = "🚀 SELECT APP 🚀" } = {}) => {
  const apps = await getApps();
  let quickPickItems = makeAppsQPIs(apps);
  const quickPick = window.createQuickPick();
  quickPick.title = title;
  quickPick.items = quickPickItems;
  quickPick.onDidHide(() => quickPick.dispose());

  return quickPick;
};

const launchApp = async (appQPI: any) => {
  return await env.openExternal(Uri.parse(appQPI.path));
};

const listApps = async () => {
  const appsQuickPick = await createAppsQuickPick();

  appsQuickPick.onDidChangeSelection((items) => {
    const item = items[0];
    launchApp(item);
  });
  appsQuickPick.show();
};

const setDefaultApp = async () => {
  const appsQuickPick = await createAppsQuickPick({
    title: "🚀 SELECT DEFAULT APP 🚀",
  });

  appsQuickPick.onDidChangeSelection((items) => {
    // @ts-ignore
    const itemPath = items[0].path;

    workspace.getConfiguration("launcher").update("defaultApp", itemPath);
    launchApp(items[0]);
  });

  appsQuickPick.show();
};

const launchDefaultApp = async () => {
  const defaultAppPath = workspace
    .getConfiguration("launcher")
    .get<string>("defaultApp");

  if (!defaultAppPath) return await setDefaultApp();
  else launchApp({ path: defaultAppPath, label: "Default App" });
};

export function activate(context: ExtensionContext) {
  const listAppsSubscription = commands.registerCommand(
    "launcher.listApps",
    listApps
  );

  const launchDefaultAppSubscription = commands.registerCommand(
    `launcher.launchDefaultApp`,
    launchDefaultApp
  );
  context.subscriptions.push(listAppsSubscription);
  context.subscriptions.push(launchDefaultAppSubscription);
}
