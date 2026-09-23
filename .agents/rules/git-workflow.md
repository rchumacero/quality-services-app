# Mandatory Rule: Task-Based Pull Request Lifecycle

For every task or development instruction assigned to you, you must strictly follow this Git and GitHub workflow before concluding the task:

1. **Create Branch:** Create and switch to a descriptive branch (`git checkout -b feature/...` or `fix/...`).
2. **Atomic Commit:** Make clear, structured commits containing the changes made.
3. **Push:** Push the branch to the remote repository (`git push origin <branch>`).
4. **Open Pull Request:** You must use the GitHub CLI (`gh pr create`) to open a Pull Request targeting the main branch, detailing the changes in the description.
5. **Wait for Feedback:** Halt the deployment or modification process and wait for the user's feedback on the PR to iterate.

Never modify the main/master branch directly.