export function getDashboardHTML(
  handle: string,
  totalSubmissions: number,
  acceptedSubmissions: number,
  solvedProblems: number,
  weakTopicsHTML: string,
  strongTopicsHTML: string
): string {

  return `
<!DOCTYPE html>
<html>

<head>
    <style>

        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #1e1e1e;
            color: white;
        }

        h1 {
            color: #4fc3f7;
        }

        .card {
            border: 1px solid #444;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .section-title {
            color: #ffd54f;
        }

        ul {
            padding-left: 20px;
        }

        li {
            margin-bottom: 5px;
        }

    </style>
</head>

<body>

    <h1>CP Gym Dashboard</h1>

    <div class="card">
        <h2>Profile Summary</h2>

        <p><strong>Handle:</strong> ${handle}</p>

        <p><strong>Total Submissions:</strong> ${totalSubmissions}</p>

        <p><strong>Accepted Submissions:</strong> ${acceptedSubmissions}</p>

        <p><strong>Solved Problems:</strong> ${solvedProblems}</p>
    </div>

    <div class="card">

        <h2 class="section-title">
            Strong Topics
        </h2>

        <ul>
            ${strongTopicsHTML}
        </ul>

    </div>

    <div class="card">

        <h2 class="section-title">
            Weak Topics
        </h2>

        <ul>
            ${weakTopicsHTML}
        </ul>

    </div>

</body>

</html>
`;
}