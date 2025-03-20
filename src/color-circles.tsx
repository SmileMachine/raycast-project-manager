import { Color, Icon, Form } from "@raycast/api";

export enum ColorTags {
  Blue = "Blue",
  Green = "Green",
  Red = "Red",
  Yellow = "Yellow",
}

export const colorCircles = {
  [ColorTags.Blue]: {
    source: Icon.CircleFilled,
    tintColor: Color.Blue,
  },
  [ColorTags.Green]: {
    source: Icon.CircleFilled,
    tintColor: Color.Green,
  },
  [ColorTags.Red]: {
    source: Icon.CircleFilled,
    tintColor: Color.Red,
  },
  [ColorTags.Yellow]: {
    source: Icon.CircleFilled,
    tintColor: {
      light: "#E7B400",
      dark: "#E7B400",
      adjustContrast: false,
    },
  },
  All: Icon.CircleEllipsis,
  None: Icon.CircleDisabled,
};

export const ColorTagPicker = ({
  defaultTags = [],
  tagOptions = Object.values(ColorTags),
}: {
  defaultTags?: ColorTags[];
  tagOptions?: ColorTags[];
}) => (
  <Form.TagPicker id="tags" title="Tag Colors" defaultValue={defaultTags}>
    {tagOptions.map((tag) => (
      <Form.TagPicker.Item key={tag} value={tag} title={tag} icon={colorCircles[tag]} />
    ))}
  </Form.TagPicker>
);
