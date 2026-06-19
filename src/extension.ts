import * as vscode from "vscode";
import axios from "axios";

interface SolvedProblem {
  rating: number;
  tags: string[];
}

const outputChannel = vscode.window.createOutputChannel("CP Gym");

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
        console.log(sortedTopics);

        const weakTopics = sortedTopics.slice(0, 5);
        outputChannel.clear();

        outputChannel.appendLine("CP Analysis Dashboard");
        outputChannel.appendLine("====================");
        outputChannel.appendLine("");

        outputChannel.appendLine(`Handle: ${handle}`);
        outputChannel.appendLine(`Total Submissions: ${submissions.length}`);
        outputChannel.appendLine(
          `Accepted Submissions: ${acceptedSubmissions.length}`,
        );
        outputChannel.appendLine(`Solved Problems: ${solvedProblems.size}`);

        outputChannel.appendLine("");
        outputChannel.appendLine("Weak Topics");
        outputChannel.appendLine("-----------");

        weakTopics.forEach(([topic, count], index) => {
          outputChannel.appendLine(`${index + 1}. ${topic} (${count} solved)`);
        });

        const strongTopics = [...sortedTopics].reverse().slice(0, 5);
        outputChannel.appendLine("");
        outputChannel.appendLine("Strong Topics");
        outputChannel.appendLine("-------------");

        strongTopics.forEach(([topic, count], index) => {
          outputChannel.appendLine(`${index + 1}. ${topic} (${count} solved)`);
        });

        outputChannel.show();
      } catch (error) {
        console.error(error);

        vscode.window.showErrorMessage("Failed to fetch Codeforces data.");
      }
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
