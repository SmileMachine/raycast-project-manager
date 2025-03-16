import { spawn } from "child_process";
import Path from "path";
import expandTilde from "expand-tilde";
import { getPreferenceValues } from "@raycast/api";

function spawnAsync(command: string, args: string[], options = {}): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data;
    });

    child.stderr.on("data", (data) => {
      stderr += data;
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const error = new Error(`Process exited with code ${code}`);
        Object.assign(error, { stdout, stderr });
        reject(error);
      }
    });

    child.on("error", reject);
  });
}

// To use this command, you need to install the `tag` 
// via `brew install tag` or `port install tag`
const TAG_COMMAND = getPreferenceValues()["tag-command"];
async function getTags(path: string): Promise<string[]> {
  path = expandTilde(path);
  const { stdout } = await spawnAsync(TAG_COMMAND, ["-Nl", path]);
  return stdout.trim().split(",").map((tag) => tag.trim()).filter(Boolean);
}

async function setTags(path: string, tags: string[]) {
  path = expandTilde(path);
  if (!Path.isAbsolute(path)) {
    path = Path.resolve(path);
  }
  await spawnAsync(TAG_COMMAND, ["-s", tags.join(","), path]);
}

export { getTags, setTags };
