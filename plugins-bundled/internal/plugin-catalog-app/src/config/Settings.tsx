import React, { useState } from 'react';
import { PluginConfigPageProps, AppPluginMeta, PluginMeta } from '@grafana/data';
import { CatalogAppSettings } from 'types';
import { Button, Field, Legend, Switch } from '@grafana/ui';
import { api } from '../api';
import { PLUGIN_ID } from '../constants';

interface Props extends PluginConfigPageProps<AppPluginMeta<CatalogAppSettings>> {}

export const Settings = ({ plugin }: Props) => {
  const [state, setState] = useState({
    enabled: plugin.meta.enabled,
    includeEnterprise: plugin.meta.jsonData?.includeEnterprise,
  });

  const onSave = () => {
    const payload = {
      pinned: state.enabled,
      enabled: state.enabled,
      jsonData: {
        includeEnterprise: state.includeEnterprise,
      },
    };
    updateAndReload(PLUGIN_ID, payload);
  };

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [ev.currentTarget.name]: ev.currentTarget.checked,
    });
  };

  return (
    <>
      <Legend>General</Legend>
      <Field label="Enable app">
        <Switch value={state.enabled} name="enabled" onChange={onChange} />
      </Field>
      <Field
        label="Show Enterprise plugins"
        description="Enterprise plugins require a Grafana Enterprise subscription."
      >
        <Switch value={state.includeEnterprise} name="includeEnterprise" onChange={onChange} />
      </Field>
      <Button onClick={onSave}>Save</Button>
    </>
  );
};

const updateAndReload = async (pluginId: string, data: Partial<PluginMeta>) => {
  try {
    await api.updatePlugin(pluginId, data);

    // Reloading the page as the changes made here wouldn't be propagated to the actual plugin otherwise.
    // This is not ideal, however unfortunately currently there is no supported way for updating the plugin state.
    window.location.reload();
  } catch (e) {
    console.error('Error while updating the plugin', e);
  }
};
