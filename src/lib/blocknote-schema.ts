import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";

// Remove file, audio, video, checkListItem, toggleListItem from schema (keep image)
const {
  file,
  audio,
  video,
  checkListItem,
  toggleListItem,
  ...allowedBlockSpecs
} = defaultBlockSpecs;

export const editorSchema = BlockNoteSchema.create({
  blockSpecs: allowedBlockSpecs,
  inlineContentSpecs: defaultInlineContentSpecs,
  styleSpecs: defaultStyleSpecs,
});

// Slash menu keys to exclude
export const EXCLUDED_SLASH_KEYS = new Set([
  "file",
  "audio",
  "video",
  "check_list",
  "toggle_list",
  "toggle_heading",
  "toggle_heading_2",
  "toggle_heading_3",
  "emoji",
]);
