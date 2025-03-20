import { Form } from "@raycast/api";
import { colorCircles } from "./color-circles";

export const ColorTagPicker = (defaultValues: string[]) => (
  <Form.TagPicker id="color" title="Tag Color" defaultValue={defaultValues}>
    <Form.TagPicker.Item value="Red" title="Red" icon={colorCircles.Red} />
    <Form.TagPicker.Item value="Green" title="Green" icon={colorCircles.Green} />
    <Form.TagPicker.Item value="Blue" title="Blue" icon={colorCircles.Blue} />
    <Form.TagPicker.Item value="Yellow" title="Yellow" icon={colorCircles.Yellow} />
  </Form.TagPicker>
);
