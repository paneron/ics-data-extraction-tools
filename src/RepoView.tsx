/** @jsx jsx */

import log from 'electron-log';
import { css, jsx } from '@emotion/core';

Object.assign(console, log);

import { RegistryView } from '@riboseinc/paneron-registry-kit/views';
import { GenericRelatedItemView, PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import { ItemClassConfiguration } from '@riboseinc/paneron-registry-kit/types/views';
import { ControlGroup, InputGroup, Tag } from '@blueprintjs/core';


interface CodeData {
  code: string
  fieldcode: string
  groupcode?: string
  subgroupcode?: string

  context?: string // JSON-LD URL
  description: string
  descriptionFull: string
  relationships: { type: 'related', to: string /* UUID */, text?: string }[]
  notes?: string[]
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
    listItemView: ({ itemData, className }) =>
      <span className={className}>
        <code>{itemData.code}</code>
        &emsp;
        {itemData.description}
      </span>,
    detailView: ({ itemData, className, useRegisterItemData, getRelatedItemClassConfiguration }) => {
      const {
        fieldcode, groupcode, subgroupcode,
        context,
        description, descriptionFull,
        relationships, notes,
      } = itemData;
      return (
        <div className={className}>
          <PropertyDetailView title="Code">
            <ControlGroup fill>
              <InputGroup readOnly leftIcon={<Tag minimal>Field</Tag>} value={fieldcode} />
              <InputGroup readOnly leftIcon={<Tag minimal>Group</Tag>} value={groupcode || '—'} />
              <InputGroup readOnly leftIcon={<Tag minimal>Subgroup</Tag>} value={subgroupcode || '—'} />
            </ControlGroup>
          </PropertyDetailView>
          <PropertyDetailView title="Context">
            {context
              ? <a onClick={() => require('electron').shell.openExternal(context)}>{context}</a>
              : '—'}
          </PropertyDetailView>
          <PropertyDetailView title="Description">
            {description || '—'}
          </PropertyDetailView>
          <PropertyDetailView title="Full description">
            {descriptionFull || '—'}
          </PropertyDetailView>
          <PropertyDetailView title="Relationships">
            {relationships.map(r =>
              <div>
                <GenericRelatedItemView
                  useRegisterItemData={useRegisterItemData}
                  getRelatedItemClassConfiguration={getRelatedItemClassConfiguration}
                  itemRef={{ classID: 'codes', itemID: r.to }}
                />
                {r.text ? <p css={css`margin-top: .25rem;`}>{r.text}</p> : null}
              </div>
            )}
          </PropertyDetailView>
          <PropertyDetailView title="Notes">
            {(notes || []).map(n =>
              <div>
                <p css={css`margin-top: .25rem;`}>{n}</p>
              </div>
            )}
          </PropertyDetailView>
        </div>
      );
    },
    editView: () => <span>TBD</span>,
  },
};


export default function () {
  return <RegistryView itemClassConfiguration={{ codes: code }} />
};
