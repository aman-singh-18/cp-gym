import * as vscode from "vscode";
import axios from "axios";
import { getDashboardHTML } from "./webview/dashboard";

interface SolvedProblem {
  rating: number;
  tags: string[];
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "cp-gym.helloWorld",
    async () => {
      try {
        const handle = await vscode.window.showInputBox({
          placeHolder: "Enter Codeforces Handle",
          prompt: "Enter your Codeforces username",
        });

        if (!handle) {
          vscode.window.showWarningMessage("No Codeforces handle provided.");
          return;
        }

        const { data } = await axios.get(
          `https://codeforces.com/api/user.status?handle=${handle}`,
        );

        const submissions = data.result;

        const acceptedSubmissions = submissions.filter(
          (submission: any) => submission.verdict === "OK",
        );

        const solvedProblems = new Map<string, SolvedProblem>();

        console.log(acceptedSubmissions);
        for (const submission of acceptedSubmissions) {
          const problemId = `${submission.problem.contestId}-${submission.problem.index}`;

          if (!solvedProblems.has(problemId)) {
            solvedProblems.set(problemId, {
              rating: submission.problem.rating ?? 0,
              tags: submission.problem.tags ?? [],
            });
          }
        }

        vscode.window.showInformationMessage(
          [
            `Handle: ${handle}`,
            `Total Submissions: ${submissions.length}`,
            `Accepted Submissions: ${acceptedSubmissions.length}`,
            `Solved Problems: ${solvedProblems.size}`,
          ].join(" | "),
        );

        const tagFrequency = new Map<string, number>();
        for (const [id, problem] of solvedProblems) {
          for (const tag of problem.tags) {
            if (!tagFrequency.has(tag)) {
              tagFrequency.set(tag, 0);
            }

            tagFrequency.set(tag, tagFrequency.get(tag)! + 1);
          }
        }

        const sortedTopics = [...tagFrequency.entries()];
        sortedTopics.sort((a, b) => a[1] - b[1]);
        const weakTopics = sortedTopics.slice(0, 5);
        const strongTopics = [...sortedTopics].reverse().slice(0, 5);

        
        const panel = vscode.window.createWebviewPanel(
          "cpGymDashboard",
          "CP Gym Dashboard",
          vscode.ViewColumn.One,
          {},
        );

        const weakTopicsHTML = weakTopics
          .map(
            ([topic, count], index) =>
              `<li>${index + 1}. ${topic} (${count} solved)</li>`,
          )
          .join("");

        const strongTopicsHTML = strongTopics
          .map(
            ([topic, count], index) =>
              `<li>${index + 1}. ${topic} (${count} solved)</li>`,
          )
          .join("");

       panel.webview.html = getDashboardHTML(
  handle,
  submissions.length,
  acceptedSubmissions.length,
  solvedProblems.size,
  weakTopicsHTML,
  strongTopicsHTML
);

      } catch (error) {
        console.error(error);

        vscode.window.showErrorMessage("Failed to fetch Codeforces data.");
      }
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
