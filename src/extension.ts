import { commands, window, ExtensionContext, Uri, env } from "vscode";

// @ts-ignore
import getApps from "installed-sw";

const makeAppsQPIs = (apps: any[]) =>
  apps.map((app) => ({ ...app, label: app.name }));

const listApps = async () => {
  const apps = await getApps();

  let quickPickItems = makeAppsQPIs(apps);
  const quickPick = window.createQuickPick();
  quickPick.items = quickPickItems;

  quickPick.onDidChangeSelection((items) => {
    // @ts-ignore
    const itemPath = items.map((item) => item.path)[0];
    console.log(itemPath);
    env.openExternal(Uri.parse(itemPath));
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
};

// TODO: Add a command to select default app and run it
// const launchDefaultApp = async () => {
//   const config = workspace.getConfiguration("defaultApp");
//   env.openExternal(Uri.parse("https://www.google.com"));
// };

export function activate(context: ExtensionContext) {
  const listAppsSubscription = commands.registerCommand(
    `extension.launchApp`,
    listApps
  );

  // const launchDefaultAppSubscription = commands.registerCommand(
  //   `extension.launchDefaultApp`,
  //   launchDefaultApp
  // );
  context.subscriptions.push(listAppsSubscription);
  //context.subscriptions.push(launchDefaultAppSubscription);
}
