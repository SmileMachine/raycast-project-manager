import {
  ActionPanel,
  List,
  Action,
  Icon,
  Keyboard,
  Form,
  showToast,
  Toast,
  getPreferenceValues,
  useNavigation,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import fs from "fs";
import path, { basename } from "path";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { setTags, getTags } from "./file-tag";
import { colorCircles, ColorTags, ColorTagPicker } from "./color-circles";

type Project = {
  name: string;
  date: string;
  path: string;
  tags: ColorTags[];
};

function EditTags({ project, onComplete }: { project: Project; onComplete: () => void }) {
  const navigation = useNavigation();
  const editTags = ({ tags }: { tags: ColorTags[] }) => {
    setTags(project.path, tags)
      .then(() => {
        project.tags = tags;
        showToast({
          title: "Tags updated",
          style: Toast.Style.Success,
        });
        onComplete();
        navigation.pop();
      })
      .catch((error) => {
        showToast({
          title: "Error updating tags",
          style: Toast.Style.Failure,
          message: error.message,
        });
      });
  };
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={editTags} />
        </ActionPanel>
      }
    >
      <ColorTagPicker defaultTags={project.tags} />
    </Form>
  );
}

function ProjectSection({ tag, projects, refresh }: { tag: string; projects: Project[]; refresh: () => void }) {
  const codeEditor = getPreferenceValues()["code-editor"];
  const terminal = getPreferenceValues()["terminal"];
  const projectDirectory = getPreferenceValues()["project-directory"];
  return (
    <List.Section key={tag} title={tag}>
      {projects.map((project) => (
        <List.Item
          key={project.path}
          icon={colorCircles[tag as keyof typeof colorCircles]}
          keywords={[project.date]}
          title={project.name}
          detail={<List.Item.Detail markdown={project.tags.join(", ")} />}
          accessories={[
            ...project.tags
              .filter((t) => t !== tag)
              .map((tag) => ({
                icon: colorCircles[tag as keyof typeof colorCircles],
              })),
            { tag: project.date },
          ]}
          actions={
            <ActionPanel>
              <Action.Open
                title={`Open with ${codeEditor.name}`}
                target={project.path}
                application={codeEditor}
                icon={{ fileIcon: codeEditor.path }}
              />
              <Action.Open title="Open in Finder" target={project.path} />
              <Action.Push
                title="Edit Tags"
                target={<EditTags project={project} onComplete={refresh} />}
                shortcut={Keyboard.Shortcut.Common.Edit}
                icon={Icon.Pencil}
              />
              <Action.OpenWith path={project.path}/>
              <Action.Open
                title={`Open in ${terminal.name}`}
                target={project.path}
                application={terminal}
                icon={{ fileIcon: terminal.path }}
              />
              <Action.Open title="Open Project Directory" target={projectDirectory} />
              <Action.CopyToClipboard
                title="Copy Project Path"
                content={project.path}
                shortcut={Keyboard.Shortcut.Common.Copy}
              />
              <Action.CopyToClipboard
                title="Copy Project Name"
                content={basename(project.path)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List.Section>
  );
}

function processProjects(projects: Project[]) {
  const uniqueTags = Object.values(ColorTags);
  const noneProjects = projects.filter((project) => project.tags.length === 0);
  return Object.fromEntries([
    ...uniqueTags.map((tag) => [tag, projects.filter((project) => project.tags.includes(tag))]),
    ["None", noneProjects],
  ]);
}
export default function Command() {
  const projDir = getPreferenceValues()["project-directory"];
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(refreshKey + 1);
  const { isLoading, data: projects } = usePromise(
    async () =>
      Promise.all(
        fs
          .readdirSync(projDir)
          .filter((project) => dayjs(project.substring(0, 10)).isValid())
          .map(async (project) => ({
            name: project.substring(11),
            date: dayjs(project.substring(0, 10)).format("YYYY-MM-DD"),
            path: path.join(projDir, project),
            tags: (await getTags(path.join(projDir, project))).map((tag) => tag as ColorTags),
          })),
      ).then((projects) => projects.sort((a, b) => b.date.localeCompare(a.date))),
    [],
  );

  const [selectedTag, setSelectedTag] = useState<ColorTags | "All" | "None">("All");
  const filteredProjects = useMemo((): Record<string, Project[]> => {
    if (!projects) {
      return {};
    }
    const processedProjects = processProjects(projects);
    if (selectedTag === "All") {
      return processedProjects;
    } else {
      return { [selectedTag]: processedProjects[selectedTag] || [] };
    }
  }, [projects, selectedTag, refreshKey]);
  return (
    <List
      isLoading={isLoading}
      filtering={{ keepSectionOrder: true }}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select Tag"
          defaultValue={selectedTag}
          onChange={(newValue) => {
            setSelectedTag(newValue as ColorTags | "All" | "None");
          }}
        >
          {["All", ...Object.values(ColorTags), "None"].map((tag) => (
            <List.Dropdown.Item
              key={tag}
              title={tag}
              value={tag}
              icon={colorCircles[tag as keyof typeof colorCircles]}
            />
          ))}
        </List.Dropdown>
      }
    >
      {Object.keys(filteredProjects).length > 0 ? (
        Object.entries(filteredProjects).map(([tag, projects]) => (
          <ProjectSection key={tag} tag={tag} projects={projects} refresh={refresh} />
        ))
      ) : (
        <List.EmptyView title="No projects" description="Add a project to get started" icon={Icon.MagnifyingGlass} />
      )}
    </List>
  );
}
