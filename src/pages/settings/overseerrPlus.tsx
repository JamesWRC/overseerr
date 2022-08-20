import { NextPage } from 'next';
import React from 'react';
import SettingsLayout from '../../components/Settings/SettingsLayout';
import SettingsOverseerrPlus from '../../components/Settings/SettingsOverseerrPlus';
import useRouteGuard from '../../hooks/useRouteGuard';
import { Permission } from '../../hooks/useUser';

const OverseerrSettingsPage: NextPage = () => {
    useRouteGuard(Permission.MANAGE_SETTINGS);
    return (
        <SettingsLayout>
            <SettingsOverseerrPlus />
        </SettingsLayout>
    );
};

export default OverseerrSettingsPage;
