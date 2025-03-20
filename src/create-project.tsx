import { Form, ActionPanel, Action, showToast, Toast, List } from "@raycast/api";
import fs from "fs";
import { getPreferenceValues } from "@raycast/api";
import path, { basename } from "path";
import { setTags } from "./file-tag";
import dayjs from "dayjs";
import { useState } from "react";
import { ColorTagPicker } from "./utils";

type Values = {
  textfield: string;
  datepicker: Date;
  color: string[];
};

export default function Command() {
  const [submitted, setSubmitted] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectPath, setProjectPath] = useState("");
  const codeEditor = getPreferenceValues()["code-editor"];
  const terminal = getPreferenceValues()["terminal"];
  const projectDirectory = getPreferenceValues()["project-directory"];

  function handleSubmit(values: Values) {
    const name = values.textfield.replace(/ /g, "_");
    const date = dayjs(values.datepicker).format("YYYY-MM-DD");
    const projectName = `${date}-${name}`;
    const projectPath = path.join(projectDirectory, projectName);

    fs.mkdir(projectPath, { recursive: true }, (err, path) => {
      if (err || !path) {
        showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: err?.message || "Failed to create project directory",
        });
      } else {
        setTags(path, values.color).then(() => {
          setProjectName(basename(projectPath));
          setProjectPath(projectPath);
          setSubmitted(true);
          showToast({
            style: Toast.Style.Success,
            title: "Created!",
            message: `Enter to open with ${codeEditor}`,
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
              title={`Open with ${codeEditor}`}
              target={projectPath}
              application={codeEditor}
              icon={{ fileIcon: `/Applications/${codeEditor}.app` }}
            />
            <Action.Open title="Open in Finder" target={projectPath} />
            <Action.Open title="Open Project Directory" target={projectDirectory} />
            <Action.Open
              title={`Open in ${terminal}`}
              target={projectPath}
              application={terminal}
              icon={{ fileIcon: `/Applications/${terminal}.app` }}
            />
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
      {ColorTagPicker(["Blue"])}
    </Form>
  );
}
