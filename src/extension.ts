import * as vscode from "vscode";
import axios from "axios";
import { getDashboardHTML } from "./webview/dashboard";

interface SolvedProblem {
  rating: number;
  tags: string[];
}

interface DivisionConfig {
  name: string;
  minRating: number;
  maxRating: number;
  relevantTags: string[];
}

const DIVISIONS: DivisionConfig[] = [
  {
    name: "Pupil",
    minRating: 1200,
    maxRating: 1399,
    relevantTags: [
      "implementation",
      "greedy",
      "brute force",
      "math",
      "sortings",
      "constructive algorithms",
      "two pointers",
      "binary search",
      "strings",
      "bitmasks",
      "data structures",
    ],
  },
  {
    name: "Specialist",
    minRating: 1400,
    maxRating: 1599,
    relevantTags: [
      "implementation",
      "greedy",
      "brute force",
      "math",
      "sortings",
      "constructive algorithms",
      "two pointers",
      "binary search",
      "strings",
      "bitmasks",
      "data structures",
      "dfs and similar",
      "graphs",
      "number theory",
      "dp",
      "combinatorics",
      "trees",
      "dsu",
    ],
  },
  {
    name: "Expert",
    minRating: 1600,
    maxRating: 1899,
    relevantTags: [
      "implementation",
      "greedy",
      "math",
      "constructive algorithms",
      "two pointers",
      "binary search",
      "bitmasks",
      "data structures",
      "dfs and similar",
      "graphs",
      "number theory",
      "dp",
      "combinatorics",
      "trees",
      "dsu",
      "shortest paths",
      "divide and conquer",
      "hashing",
      "probabilities",
      "games",
      "geometry",
      "strings",
    ],
  },
  {
    name: "Candidate Master / Master",
    minRating: 1900,
    maxRating: 2399,
    relevantTags: [
      "implementation",
      "greedy",
      "math",
      "constructive algorithms",
      "binary search",
      "bitmasks",
      "data structures",
      "dfs and similar",
      "graphs",
      "number theory",
      "dp",
      "combinatorics",
      "trees",
      "dsu",
      "shortest paths",
      "divide and conquer",
      "hashing",
      "probabilities",
      "games",
      "geometry",
      "strings",
      "string suffix structures",
      "fft",
      "flows",
      "graph matchings",
      "meet-in-the-middle",
      "matrices",
    ],
  },
];

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

        const { data: statusData } = await axios.get(
          `https://codeforces.com/api/user.status?handle=${handle}`,
        );
        const submissions = statusData.result;

        // Fetch user info (rating, rank)
        let currentRating = 0;
        let currentRank = "unrated";
        try {
          const { data: infoData } = await axios.get(
            `https://codeforces.com/api/user.info?handles=${handle}`,
          );
          if (infoData.status === "OK" && infoData.result.length > 0) {
            currentRating = infoData.result[0].rating ?? 0;
            currentRank = infoData.result[0].rank ?? "unrated";
          }
        } catch (infoError) {
          console.error("Failed to fetch user info, using defaults", infoError);
        }

        // Determine target division
        let targetDivision = DIVISIONS[DIVISIONS.length - 1];  // pointd to CM 
        for (const div of DIVISIONS) {
          if (currentRating < div.minRating) {
            targetDivision = div;
            break;
          }
        }

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
            `Rating: ${currentRating} (${currentRank})`,
            `Target: ${targetDivision.name}`,
            `Solved: ${solvedProblems.size}`,
          ].join(" | "),
        );

        // Compile overall tag frequency
        const tagFrequency = new Map<string, number>();
        for (const [id, problem] of solvedProblems) {
          for (const tag of problem.tags) {
            if (!tagFrequency.has(tag)) {
              tagFrequency.set(tag, 0);
            }
            tagFrequency.set(tag, tagFrequency.get(tag)! + 1);
          }
        }


        // Calculate weak topics from target division's relevant tags
        const weakTopicsList = targetDivision.relevantTags.map((tag) => {
          const count = tagFrequency.get(tag) ?? 0;
          return [tag, count] as [string, number];
        });
        weakTopicsList.sort((a, b) => a[1] - b[1]);
        const weakTopics = weakTopicsList.slice(0, 5);

        // Calculate strong topics from overall solved tags (highest frequency first)
        const sortedAllTopics = [...tagFrequency.entries()];
        sortedAllTopics.sort((a, b) => b[1] - a[1]);
        const strongTopics = sortedAllTopics.slice(0, 5);

        
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
