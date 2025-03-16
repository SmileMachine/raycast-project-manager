import { spawn } from "child_process";
import Path from "path";
import expandTilde from "expand-tilde";

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

// package `tag` need to be installed via `brew install tag`
async function getTags(path: string): Promise<string[]> {
  path = expandTilde(path);
  const { stdout } = await spawnAsync("tag", ["-Nl", path]);
  console.log("stdout", stdout);
  return stdout.trim().split(",").map((tag) => tag.trim()).filter(Boolean);
}

async function setTags(path: string, tags: string[]) {
  path = expandTilde(path);
  if (!Path.isAbsolute(path)) {
    path = Path.resolve(path);
  }
  const { stdout, stderr } = await spawnAsync("tag", ["-s", tags.join(","), path]);
  return { stdout, stderr };
}
 
const tags = await getTags("~/wtmp/test");
console.log(tags);

const result = await setTags("/Users/shawn/Nutstore/Assist/2025-03-17-", ['blue']);
console.log([].join(","));
console.log(result);
