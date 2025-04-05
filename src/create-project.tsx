import { Form, ActionPanel, Action, showToast, Toast, List, getPreferenceValues, Keyboard } from "@raycast/api";
import fs from "fs";
import path, { basename } from "path";
import dayjs from "dayjs";
import { useState } from "react";
import { setTags } from "./file-tag";
import { ColorTagPicker, ColorTags } from "./color-circles";

type Values = {
  textfield: string;
  datepicker: Date;
  tags: ColorTags[];
};

export default function Command() {
  const [submitted, setSubmitted] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectPath, setProjectPath] = useState("");
  const codeEditor = getPreferenceValues()["code-editor"];
  const terminal = getPreferenceValues()["terminal"];
  const projectDirectory = getPreferenceValues()["project-directory"];

  function handleSubmit(values: Values) {
    const name = values.textfield.replace(/\s/g, "_");
    const date = dayjs(values.datepicker).format("YYYY-MM-DD");
    const projectName = `${date}-${name}`;
    const projectPath = path.join(projectDirectory, projectName);

    fs.mkdir(projectPath, { recursive: true }, (err, path) => {
      if (err || !path) {
        showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: err?.message || `Failed to create project directory: ${projectPath}`,
        });
      } else {
        setTags(path, values.tags).then(() => {
          setProjectName(basename(projectPath));
          setProjectPath(projectPath);
          setSubmitted(true);
          showToast({
            style: Toast.Style.Success,
            title: "Created!",
            message: `Enter to open with ${codeEditor.name}`,
          });
        });
      }
    });
  }

  return submitted ? (
    <List>
      <List.EmptyView
        title={`Project \`${projectName}\` created`}
        description={`Path: \`${projectPath}\``}
        icon="🎉"
        actions={
          <ActionPanel>
            <Action.Open
              title={`Open with ${codeEditor.name}`}
              target={projectPath}
              application={codeEditor}
              icon={{ fileIcon: codeEditor.path }}
            />
            <Action.OpenWith path={projectPath} />
            <Action.ShowInFinder title="Show in Finder" path={projectPath} />
            <Action.Open title="Open in Finder" target={projectPath} />
            <Action.Open
              title={`Open in ${terminal.name}`}
              target={projectPath}
              application={terminal}
              icon={{ fileIcon: terminal.path }}
            />
            <Action.CopyToClipboard
              title="Copy Project Name"
              content={projectName}
              shortcut={Keyboard.Shortcut.Common.Copy}
            />
            <Action.CopyToClipboard title="Copy Project Path" content={projectPath} />
          </ActionPanel>
        }
      />
    </List>
  ) : (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="textfield" title="Name" placeholder="Enter name" />
      <Form.DatePicker id="datepicker" title="Date" defaultValue={new Date()} type={Form.DatePicker.Type.Date} />
      <ColorTagPicker defaultTags={[ColorTags.Blue]} />
    </Form>
  );
}
