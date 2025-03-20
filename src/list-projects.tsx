import { ActionPanel, Detail, List, Action, Icon, Keyboard } from "@raycast/api";
import { Form, ActionPanel, Action, showToast, Toast, List, Icon, Color } from "@raycast/api";
import { getPreferenceValues } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import fs from "fs";
import path, { basename } from "path";
import { setTags, getTags } from "./file-tag";
import dayjs from "dayjs";
import { useState } from "react";
import { colorCircles } from "./color-circles";
import { ColorTagPicker } from "./utils";

type Project = {
  name: string;
  date: string;
  path: string;
  tags: string[];
};

function EditTags(props: { project: Project }) {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            onSubmit={(values) => {
              console.log(values);
            }}
          />
        </ActionPanel>
      }
    >
      {ColorTagPicker(props.project.tags)}
    </Form>
  );
}

function projSection(tag: string, projects: Project[]) {
  const codeEditor = getPreferenceValues()["code-editor"];
  const terminal = getPreferenceValues()["terminal"];
  const projectDirectory = getPreferenceValues()["project-directory"];
  return (
    <List.Section key={tag} title={tag}>
      {projects.map((project) => (
        <List.Item
          key={project.path}
          icon={colorCircles[project.tags[0] as keyof typeof colorCircles]}
          title={project.name}
          subtitle={project.date}
          detail={<List.Item.Detail markdown={project.tags.join(", ")} />}
          actions={
            <ActionPanel>
              <Action.Open
                title={`Open with ${codeEditor}`}
                target={project.path}
                application={codeEditor}
                icon={{ fileIcon: `/Applications/${codeEditor}.app` }}
              />
              <Action.Open title="Open in Finder" target={project.path} />
              <Action.Push
                title="Edit Tags"
                target={<EditTags project={project} />}
                shortcut={Keyboard.Shortcut.Common.Edit}
                icon={Icon.Pencil}
              />
              <Action.Open title="Open Project Directory" target={projectDirectory} />
              <Action.Open
                title={`Open in ${terminal}`}
                target={project.path}
                application={terminal}
                icon={{ fileIcon: `/Applications/${terminal}.app` }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List.Section>
  );
}

export default function Command() {
  const projectDirectory = getPreferenceValues()["project-directory"];
  const { isLoading, data: projects } = usePromise(
    async () =>
      Promise.all(
        fs
          .readdirSync(projectDirectory)
          .filter((project) => dayjs(project.substring(0, 10)).isValid())
          .map(async (project) => ({
            name: project.substring(11),
            date: dayjs(project.substring(0, 10)).format("YYYY-MM-DD"),
            path: path.join(projectDirectory, project),
            tags: await getTags(path.join(projectDirectory, project)),
          })),
      )
        .then((projects) => projects.sort((a, b) => b.date.localeCompare(a.date)))
        .then((projects) => {
          const tags = projects.map((project) => project.tags).flat();
          const uniqueTags = [...new Set(tags)];
          return Object.fromEntries(
            uniqueTags.map((tag) => [tag, projects.filter((project) => project.tags.includes(tag))]),
          );
        }),
    [],
  );
  return (
    <List
      isLoading={isLoading}
      filtering={{ keepSectionOrder: true }}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select Tag"
          storeValue={true}
          onChange={(newValue) => {
            // console.log(newValue);
          }}
        >
          {["Blue", "Green", "Red", "Yellow"].map((tag) => (
            <List.Dropdown.Item key={tag} title={tag} value={tag} />
          ))}
        </List.Dropdown>
      }
    >
      {projects ? (
        Object.entries(projects).map(([tag, projects]) => {
          return projSection(tag, projects);
        })
      ) : (
        <List.EmptyView title="No projects" description="Add a project to get started" icon={Icon.MagnifyingGlass} />
      )}
    </List>
  );
}
