export type Media = {}; // TODO

export type Group = {
  id: string;
  media: Media[];
};

export type GroupmeData = {
  groups: Group[];
  token: string;
};
