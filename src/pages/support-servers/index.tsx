import { NextPage } from 'next';
import React from 'react';
import SupportServers from '@app/components/SupportServers';
import useRouteGuard from '../../hooks/useRouteGuard';
import { Permission } from '../../hooks/useUser';

const SupportServerPage: NextPage = () => {
    useRouteGuard(
        [
            // Pretty much everyuser 
            Permission.REQUEST
        ],
        {
            type: 'or',
        }
    );
    return <SupportServers />;
};

export default SupportServerPage;
