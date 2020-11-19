/** @jsx jsx */

import log from 'electron-log';
import { jsx } from '@emotion/core';

Object.assign(console, log);

import { RegistryView } from '@riboseinc/paneron-registry-kit/views';
import { ItemClassConfiguration } from '@riboseinc/paneron-registry-kit/types/views';


interface CodeData {
  code: string
  fieldCode: string
  groupCode?: string
  subgroupCode?: string

  context?: string // JSON-LD URL
  description: string
  descriptionFull: string
  relationships: { type: 'related', to: string /* UUID */ }
}


const code: ItemClassConfiguration<CodeData> = {
  meta: {
    title: "Code",
    description: "Code",
    id: 'codes',
    alternativeNames: [],
  },
  defaults: {
    description: '',
    descriptionFull: '',
  },
  itemSorter: (p1, p2) => (p1.code || '').localeCompare(p2.code || ''),
  sanitizePayload: async (p) => p,
  validatePayload: async () => true,

  views: {
    listItemView: ({ itemData }) => <span>{itemData.code}</span>,
    detailView: ({ itemData }) => {
      return (
        <p>{itemData.code}</p>
      );
    },
    editView: () => <span>TBD</span>,
  },
};


export default function () {
  return <RegistryView itemClassConfiguration={{ code }} />
};
